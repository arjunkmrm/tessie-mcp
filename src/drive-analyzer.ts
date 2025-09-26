import { TessieDrive } from './tessie-client.js';

export interface MergedDrive {
  id: string; // Composite ID of merged drives
  originalDriveIds: number[];
  started_at: number;
  ended_at: number;
  starting_location: string;
  ending_location: string;
  starting_battery: number;
  ending_battery: number;
  total_distance: number;
  total_duration_minutes: number;
  driving_duration_minutes: number;
  stops: DriveStop[];
  autopilot_distance: number;
  autopilot_percentage: number;
  energy_consumed: number;
  average_speed: number;
  max_speed: number;
}

export interface DriveStop {
  location: string;
  duration_minutes: number;
  stop_type: 'short' | 'charging' | 'excluded';
  started_at: number;
  ended_at: number;
}

export interface DriveAnalysis {
  mergedDrive: MergedDrive;
  batteryConsumption: {
    percentage_used: number;
    estimated_kwh_used: number;
    efficiency_miles_per_kwh?: number;
  };
  fsdAnalysis: {
    total_autopilot_miles: number;
    fsd_percentage: number;
    autopilot_available: boolean;
    note?: string;
  };
  summary: string;
}

export class DriveAnalyzer {
  /**
   * Merges consecutive drives that are separated by stops less than 7 minutes
   * or charging stops, treating them as a single continuous journey
   */
  mergeDrives(drives: TessieDrive[]): MergedDrive[] {
    if (drives.length === 0) return [];

    // Sort drives by start time
    const sortedDrives = [...drives].sort((a, b) => a.started_at - b.started_at);
    const mergedDrives: MergedDrive[] = [];
    let currentGroup: TessieDrive[] = [sortedDrives[0]];

    for (let i = 1; i < sortedDrives.length; i++) {
      const prevDrive = sortedDrives[i - 1];
      const currentDrive = sortedDrives[i];

      // Calculate gap between drives
      const gapMinutes = (currentDrive.started_at - prevDrive.ended_at) / 60;

      // Check if this should be merged with the previous group
      if (this.shouldMergeDrives(prevDrive, currentDrive, gapMinutes)) {
        currentGroup.push(currentDrive);
      } else {
        // Process the current group and start a new one
        mergedDrives.push(this.createMergedDrive(currentGroup));
        currentGroup = [currentDrive];
      }
    }

    // Process the final group
    if (currentGroup.length > 0) {
      mergedDrives.push(this.createMergedDrive(currentGroup));
    }

    return mergedDrives;
  }

  private shouldMergeDrives(prevDrive: TessieDrive, currentDrive: TessieDrive, gapMinutes: number): boolean {
    // Merge if gap is less than 7 minutes
    if (gapMinutes < 7) {
      return true;
    }

    // TODO: Add charging detection logic
    // This would require checking if the gap includes charging based on battery level changes
    // For now, we'll use a simple heuristic: if battery level increased significantly during the gap
    const batteryIncrease = currentDrive.starting_battery - prevDrive.ending_battery;
    if (batteryIncrease > 5) { // More than 5% battery increase suggests charging
      return true;
    }

    return false;
  }

  private createMergedDrive(drives: TessieDrive[]): MergedDrive {
    if (drives.length === 0) {
      throw new Error('Cannot create merged drive from empty array');
    }

    const firstDrive = drives[0];
    const lastDrive = drives[drives.length - 1];

    // Calculate stops between drives
    const stops: DriveStop[] = [];
    for (let i = 0; i < drives.length - 1; i++) {
      const current = drives[i];
      const next = drives[i + 1];
      const gapMinutes = (next.started_at - current.ended_at) / 60;

      if (gapMinutes > 0) {
        const batteryChange = next.starting_battery - current.ending_battery;
        const stopType = batteryChange > 5 ? 'charging' : gapMinutes < 7 ? 'short' : 'excluded';

        stops.push({
          location: current.ending_location,
          duration_minutes: Math.round(gapMinutes * 100) / 100,
          stop_type: stopType,
          started_at: current.ended_at,
          ended_at: next.started_at
        });
      }
    }

    // Calculate totals
    const totalDistance = drives.reduce((sum, drive) => sum + drive.odometer_distance, 0);
    const totalAutopilotDistance = drives.reduce((sum, drive) => sum + (drive.autopilot_distance || 0), 0);
    const totalDuration = (lastDrive.ended_at - firstDrive.started_at) / 60; // in minutes
    const drivingDuration = drives.reduce((sum, drive) => {
      return sum + ((drive.ended_at - drive.started_at) / 60);
    }, 0);

    // Calculate speeds
    const maxSpeed = Math.max(...drives.map(d => d.max_speed || 0));
    const averageSpeed = totalDistance > 0 ? (totalDistance / (drivingDuration / 60)) : 0;

    return {
      id: `merged_${drives.map(d => d.id).join('_')}`,
      originalDriveIds: drives.map(d => d.id),
      started_at: firstDrive.started_at,
      ended_at: lastDrive.ended_at,
      starting_location: firstDrive.starting_location,
      ending_location: lastDrive.ending_location,
      starting_battery: firstDrive.starting_battery,
      ending_battery: lastDrive.ending_battery,
      total_distance: Math.round(totalDistance * 100) / 100,
      total_duration_minutes: Math.round(totalDuration * 100) / 100,
      driving_duration_minutes: Math.round(drivingDuration * 100) / 100,
      stops,
      autopilot_distance: Math.round(totalAutopilotDistance * 100) / 100,
      autopilot_percentage: totalDistance > 0 ? Math.round((totalAutopilotDistance / totalDistance) * 10000) / 100 : 0,
      energy_consumed: firstDrive.starting_battery - lastDrive.ending_battery,
      average_speed: Math.round(averageSpeed * 100) / 100,
      max_speed: Math.round(maxSpeed * 100) / 100
    };
  }

  /**
   * Analyzes the most recent merged drive with comprehensive metrics
   */
  analyzeLatestDrive(drives: TessieDrive[]): DriveAnalysis | null {
    if (drives.length === 0) return null;

    const mergedDrives = this.mergeDrives(drives);
    if (mergedDrives.length === 0) return null;

    // Get the most recent merged drive
    const latestMerged = mergedDrives[mergedDrives.length - 1];

    // Calculate battery consumption analysis
    const batteryConsumption = this.analyzeBatteryConsumption(latestMerged);

    // Calculate FSD analysis
    const fsdAnalysis = this.analyzeFSDUsage(latestMerged);

    // Generate summary
    const summary = this.generateDriveSummary(latestMerged, batteryConsumption, fsdAnalysis);

    return {
      mergedDrive: latestMerged,
      batteryConsumption,
      fsdAnalysis,
      summary
    };
  }

  private analyzeBatteryConsumption(drive: MergedDrive) {
    const percentageUsed = Math.round((drive.energy_consumed) * 100) / 100;

    // Estimate kWh usage (rough Tesla Model 3/Y approximation: ~75-100kWh total capacity)
    // This is an approximation - actual capacity varies by model and year
    const estimatedTotalCapacity = 75; // kWh - conservative estimate
    const estimatedKwhUsed = Math.round((percentageUsed / 100) * estimatedTotalCapacity * 100) / 100;

    const efficiency = drive.total_distance > 0 && estimatedKwhUsed > 0
      ? Math.round((drive.total_distance / estimatedKwhUsed) * 100) / 100
      : undefined;

    return {
      percentage_used: percentageUsed,
      estimated_kwh_used: estimatedKwhUsed,
      efficiency_miles_per_kwh: efficiency
    };
  }

  private analyzeFSDUsage(drive: MergedDrive) {
    const autopilotAvailable = drive.autopilot_distance > 0 ||
      drive.originalDriveIds.length > 0; // Assume data might be available

    return {
      total_autopilot_miles: drive.autopilot_distance,
      fsd_percentage: drive.autopilot_percentage,
      autopilot_available: autopilotAvailable,
      note: drive.autopilot_distance === 0
        ? "FSD/Autopilot data not available or no autonomous driving detected"
        : undefined
    };
  }

  private generateDriveSummary(
    drive: MergedDrive,
    battery: { percentage_used: number; estimated_kwh_used: number; efficiency_miles_per_kwh?: number },
    fsd: { total_autopilot_miles: number; fsd_percentage: number; autopilot_available: boolean; note?: string }
  ): string {
    const duration = drive.total_duration_minutes;
    const drivingTime = drive.driving_duration_minutes;
    const stopTime = duration - drivingTime;

    let summary = `Drive from ${drive.starting_location} to ${drive.ending_location}:\n`;
    summary += `• Total time: ${Math.floor(duration / 60)}h ${Math.round(duration % 60)}m\n`;
    summary += `• Driving time: ${Math.floor(drivingTime / 60)}h ${Math.round(drivingTime % 60)}m\n`;

    if (stopTime > 1) {
      summary += `• Stop time: ${Math.floor(stopTime / 60)}h ${Math.round(stopTime % 60)}m`;
      if (drive.stops.length > 0) {
        const chargingStops = drive.stops.filter(s => s.stop_type === 'charging').length;
        const shortStops = drive.stops.filter(s => s.stop_type === 'short').length;
        if (chargingStops > 0) summary += ` (${chargingStops} charging stop${chargingStops > 1 ? 's' : ''})`;
        if (shortStops > 0) summary += ` (${shortStops} short stop${shortStops > 1 ? 's' : ''})`;
      }
      summary += `\n`;
    }

    summary += `• Distance: ${drive.total_distance} miles\n`;
    summary += `• Average speed: ${drive.average_speed} mph (max: ${drive.max_speed} mph)\n`;
    summary += `• Battery used: ${battery.percentage_used}% (≈${battery.estimated_kwh_used} kWh)\n`;

    if (battery.efficiency_miles_per_kwh) {
      summary += `• Efficiency: ${battery.efficiency_miles_per_kwh} mi/kWh\n`;
    }

    if (fsd.autopilot_available && fsd.total_autopilot_miles > 0) {
      summary += `• FSD/Autopilot: ${fsd.total_autopilot_miles} miles (${fsd.fsd_percentage}% of drive)`;
    } else {
      summary += `• FSD/Autopilot: ${fsd.note || 'Data not available'}`;
    }

    return summary;
  }
}