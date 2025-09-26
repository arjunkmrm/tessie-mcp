import { TessieDrive } from './tessie-client.js';
export interface MergedDrive {
    id: string;
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
export declare class DriveAnalyzer {
    /**
     * Merges consecutive drives that are separated by stops less than 7 minutes
     * or charging stops, treating them as a single continuous journey
     */
    mergeDrives(drives: TessieDrive[]): MergedDrive[];
    private shouldMergeDrives;
    private createMergedDrive;
    /**
     * Analyzes the most recent merged drive with comprehensive metrics
     */
    analyzeLatestDrive(drives: TessieDrive[]): DriveAnalysis | null;
    private analyzeBatteryConsumption;
    private analyzeFSDUsage;
    private generateDriveSummary;
}
//# sourceMappingURL=drive-analyzer.d.ts.map