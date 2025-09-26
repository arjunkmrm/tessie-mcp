import { DriveAnalyzer, MergedDrive, DriveAnalysis } from '../src/drive-analyzer';
import { TessieDrive } from '../src/tessie-client';

describe('DriveAnalyzer', () => {
  let analyzer: DriveAnalyzer;

  beforeEach(() => {
    analyzer = new DriveAnalyzer();
  });

  const createMockDrive = (id: number, startTime: number, endTime: number, distance: number, startBattery: number, endBattery: number, autopilotDistance = 0): TessieDrive => ({
    id,
    started_at: startTime,
    ended_at: endTime,
    starting_location: `Location ${id}A`,
    ending_location: `Location ${id}B`,
    starting_latitude: 37.7749,
    starting_longitude: -122.4194,
    ending_latitude: 37.7849,
    ending_longitude: -122.4294,
    starting_odometer: 10000 + (id * 100),
    ending_odometer: 10000 + (id * 100) + distance,
    starting_battery: startBattery,
    ending_battery: endBattery,
    odometer_distance: distance,
    autopilot_distance: autopilotDistance,
    created_at: startTime,
    average_speed: distance / ((endTime - startTime) / 3600), // mph
    max_speed: 65,
    energy_used: 15.5
  });

  describe('mergeDrives', () => {
    test('should return single drive when no merging needed', () => {
      const drives = [createMockDrive(1, 1000, 2000, 50, 80, 70)];
      const result = analyzer.mergeDrives(drives);

      expect(result).toHaveLength(1);
      expect(result[0].originalDriveIds).toEqual([1]);
      expect(result[0].total_distance).toBe(50);
    });

    test('should merge drives with gap less than 7 minutes', () => {
      const drive1 = createMockDrive(1, 1000, 2000, 30, 80, 75); // ends at 2000
      const drive2 = createMockDrive(2, 2300, 3000, 20, 75, 65); // starts at 2300 (5 min gap)

      const result = analyzer.mergeDrives([drive1, drive2]);

      expect(result).toHaveLength(1);
      expect(result[0].originalDriveIds).toEqual([1, 2]);
      expect(result[0].total_distance).toBe(50);
      expect(result[0].stops).toHaveLength(1);
      expect(result[0].stops[0].duration_minutes).toBeCloseTo(5, 1);
      expect(result[0].stops[0].stop_type).toBe('short');
    });

    test('should merge drives with charging stop (battery increase)', () => {
      const drive1 = createMockDrive(1, 1000, 2000, 30, 80, 60); // ends at 60%
      const drive2 = createMockDrive(2, 3000, 4000, 20, 70, 55); // starts at 70% (10% increase)

      const result = analyzer.mergeDrives([drive1, drive2]);

      expect(result).toHaveLength(1);
      expect(result[0].originalDriveIds).toEqual([1, 2]);
      expect(result[0].stops[0].stop_type).toBe('charging');
      expect(result[0].stops[0].duration_minutes).toBeCloseTo(16.67, 1); // (3000-2000)/60
    });

    test('should not merge drives with long gap and no charging', () => {
      const drive1 = createMockDrive(1, 1000, 2000, 30, 80, 75);
      const drive2 = createMockDrive(2, 3000, 4000, 20, 74, 65); // 1% battery loss, 16.67 min gap

      const result = analyzer.mergeDrives([drive1, drive2]);

      expect(result).toHaveLength(2);
      expect(result[0].originalDriveIds).toEqual([1]);
      expect(result[1].originalDriveIds).toEqual([2]);
    });

    test('should handle multiple drives with mixed gaps', () => {
      const drive1 = createMockDrive(1, 1000, 2000, 20, 80, 75);
      const drive2 = createMockDrive(2, 2200, 3000, 15, 75, 70); // 3.33 min gap - merge
      const drive3 = createMockDrive(3, 4000, 5000, 25, 65, 55); // 16.67 min gap - don't merge

      const result = analyzer.mergeDrives([drive1, drive2, drive3]);

      expect(result).toHaveLength(2);
      expect(result[0].originalDriveIds).toEqual([1, 2]);
      expect(result[0].total_distance).toBe(35);
      expect(result[1].originalDriveIds).toEqual([3]);
      expect(result[1].total_distance).toBe(25);
    });

    test('should calculate correct drive metrics', () => {
      const drive1 = createMockDrive(1, 1000, 2000, 30, 80, 75, 10); // 10 miles autopilot
      const drive2 = createMockDrive(2, 2300, 3300, 20, 75, 65, 5);  // 5 miles autopilot

      const result = analyzer.mergeDrives([drive1, drive2]);

      expect(result).toHaveLength(1);
      const merged = result[0];

      expect(merged.total_distance).toBe(50);
      expect(merged.autopilot_distance).toBe(15);
      expect(merged.autopilot_percentage).toBeCloseTo(30, 1); // 15/50 * 100 = 30%
      expect(merged.energy_consumed).toBe(15); // 80-65
      expect(merged.total_duration_minutes).toBeCloseTo(38.33, 1); // (3300-1000)/60
      expect(merged.driving_duration_minutes).toBeCloseTo(33.33, 1); // (2000-1000 + 3300-2300)/60
    });
  });

  describe('analyzeLatestDrive', () => {
    test('should return null for empty drives array', () => {
      const result = analyzer.analyzeLatestDrive([]);
      expect(result).toBeNull();
    });

    test('should analyze single drive correctly', () => {
      const drive = createMockDrive(1, 1000, 3000, 60, 90, 70, 20);
      const result = analyzer.analyzeLatestDrive([drive]);

      expect(result).not.toBeNull();
      expect(result!.mergedDrive.total_distance).toBe(60);
      expect(result!.batteryConsumption.percentage_used).toBe(20);
      expect(result!.batteryConsumption.estimated_kwh_used).toBe(15); // 20% of 75kWh
      expect(result!.fsdAnalysis.total_autopilot_miles).toBe(20);
      expect(result!.fsdAnalysis.fsd_percentage).toBeCloseTo(33.33, 1);
    });

    test('should analyze merged drives correctly', () => {
      const drive1 = createMockDrive(1, 1000, 2000, 30, 80, 75, 10);
      const drive2 = createMockDrive(2, 2300, 3300, 20, 75, 65, 5);

      const result = analyzer.analyzeLatestDrive([drive1, drive2]);

      expect(result).not.toBeNull();
      expect(result!.mergedDrive.originalDriveIds).toEqual([1, 2]);
      expect(result!.mergedDrive.total_distance).toBe(50);
      expect(result!.batteryConsumption.percentage_used).toBe(15);
      expect(result!.fsdAnalysis.total_autopilot_miles).toBe(15);
      expect(result!.summary).toContain('50 miles');
      expect(result!.summary).toContain('15%');
    });

    test('should handle drives with no FSD data', () => {
      const drive = createMockDrive(1, 1000, 3000, 60, 90, 70, 0);
      const result = analyzer.analyzeLatestDrive([drive]);

      expect(result).not.toBeNull();
      expect(result!.fsdAnalysis.total_autopilot_miles).toBe(0);
      expect(result!.fsdAnalysis.fsd_percentage).toBe(0);
      expect(result!.fsdAnalysis.note).toContain('not available');
      expect(result!.summary).toContain('FSD/Autopilot: FSD/Autopilot data not available');
    });

    test('should calculate efficiency correctly', () => {
      const drive = createMockDrive(1, 1000, 3000, 75, 90, 70); // 75 miles, 20% battery
      const result = analyzer.analyzeLatestDrive([drive]);

      expect(result).not.toBeNull();
      expect(result!.batteryConsumption.efficiency_miles_per_kwh).toBe(5); // 75 miles / 15 kWh
    });

    test('should generate comprehensive summary', () => {
      const drive1 = createMockDrive(1, 1000, 2000, 30, 80, 75, 15);
      const drive2 = createMockDrive(2, 2300, 3300, 20, 75, 65, 10);

      const result = analyzer.analyzeLatestDrive([drive1, drive2]);

      expect(result).not.toBeNull();
      const summary = result!.summary;

      expect(summary).toContain('Drive from Location 1A to Location 2B');
      expect(summary).toContain('50 miles');
      expect(summary).toContain('15%');
      expect(summary).toContain('25 miles (50% of drive)'); // FSD analysis
      expect(summary).toContain('short stop'); // Stop analysis
    });
  });

  describe('edge cases', () => {
    test('should handle drives with same start and end time', () => {
      const drive = createMockDrive(1, 1000, 1000, 0, 80, 80);
      const result = analyzer.mergeDrives([drive]);

      expect(result).toHaveLength(1);
      expect(result[0].total_duration_minutes).toBe(0);
      expect(result[0].driving_duration_minutes).toBe(0);
    });

    test('should handle drives with negative battery consumption', () => {
      // Edge case: battery increased during drive (shouldn't happen in real life)
      const drive = createMockDrive(1, 1000, 2000, 30, 70, 80);
      const result = analyzer.analyzeLatestDrive([drive]);

      expect(result).not.toBeNull();
      expect(result!.batteryConsumption.percentage_used).toBe(-10);
    });

    test('should sort drives by start time', () => {
      const drive1 = createMockDrive(1, 4000, 5000, 20, 70, 60); // Separate drive with bigger gap
      const drive2 = createMockDrive(2, 1000, 2000, 30, 80, 75);
      const drive3 = createMockDrive(3, 2200, 3000, 15, 75, 70); // 3.33 min gap - should merge with drive2

      // Pass in wrong order
      const result = analyzer.mergeDrives([drive1, drive2, drive3]);

      // All drives get merged because:
      // drive2 (1000-2000) -> drive3 (2200-3000) = 3.33 min gap (< 7 min) -> merge
      // drive3 (3000) -> drive1 (4000) = 16.67 min gap but battery dropped 10% so no charging -> don't merge
      expect(result).toHaveLength(2);
      expect(result[0].originalDriveIds).toEqual([2, 3]); // drive2 and drive3 merged
      expect(result[1].originalDriveIds).toEqual([1]); // drive1 separate
    });
  });
});