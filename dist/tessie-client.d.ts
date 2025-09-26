export interface TessieVehicleState {
    display_name: string;
    vin: string;
    state: string;
    since: string;
    healthy: boolean;
    version: string;
    update_available: boolean;
    update_version: string;
    latitude?: number;
    longitude?: number;
    shift_state?: string;
    speed?: number;
    power?: number;
    odometer?: number;
    est_battery_range?: number;
    battery_level?: number;
    usable_battery_level?: number;
    charge_limit_soc?: number;
    charging_state?: string;
    time_to_full_charge?: number;
    climate_on?: boolean;
    inside_temp?: number;
    outside_temp?: number;
    is_preconditioning?: boolean;
    locked?: boolean;
    sentry_mode?: boolean;
    windows_open?: boolean;
    doors_open?: boolean;
    trunk_open?: boolean;
    frunk_open?: boolean;
}
export interface TessieDrive {
    id: number;
    import_id?: string;
    started_at: number;
    ended_at: number;
    created_at: number;
    updated_at?: number;
    starting_location: string;
    starting_latitude: number;
    starting_longitude: number;
    starting_odometer: number;
    starting_saved_location?: string;
    ending_location: string;
    ending_latitude: number;
    ending_longitude: number;
    ending_odometer: number;
    ending_saved_location?: string;
    starting_battery: number;
    ending_battery: number;
    average_inside_temperature?: number;
    average_outside_temperature?: number;
    average_speed?: number;
    max_speed?: number;
    rated_range_used?: number;
    ideal_range_used?: number;
    odometer_distance: number;
    autopilot_distance?: number;
    energy_used?: number;
    tag?: string;
    start_date?: string;
    end_date?: string;
    start_address?: string;
    end_address?: string;
    start_saved_location?: string;
    end_saved_location?: string;
    distance_miles?: number;
    duration_min?: number;
    start_odometer?: number;
    end_odometer?: number;
    start_battery_level?: number;
    end_battery_level?: number;
}
export interface TessieLocation {
    vin: string;
    latitude: number;
    longitude: number;
    address: string;
    saved_location?: string;
}
export declare class TessieClient {
    private client;
    private accessToken;
    constructor(accessToken: string);
    getVehicleState(vin: string, useCache?: boolean): Promise<TessieVehicleState>;
    getVehicleStates(vin: string, startDate?: string, endDate?: string): Promise<TessieVehicleState[]>;
    getVehicleLocation(vin: string): Promise<TessieLocation>;
    getDrives(vin: string, startDate?: string, endDate?: string, limit?: number): Promise<TessieDrive[]>;
    getDrivingPath(vin: string, startDate: string, endDate: string): Promise<Array<{
        latitude: number;
        longitude: number;
        timestamp: string;
    }>>;
    getVehicles(): Promise<Array<{
        vin: string;
        display_name: string;
    }>>;
}
//# sourceMappingURL=tessie-client.d.ts.map