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
    vin: string;
    start_date: string;
    end_date: string;
    start_latitude: number;
    start_longitude: number;
    start_address: string;
    start_saved_location?: string;
    end_latitude: number;
    end_longitude: number;
    end_address: string;
    end_saved_location?: string;
    distance_miles: number;
    duration_min: number;
    start_odometer: number;
    end_odometer: number;
    start_battery_level: number;
    end_battery_level: number;
    start_est_battery_range: number;
    end_est_battery_range: number;
    start_rated_battery_range: number;
    end_rated_battery_range: number;
    start_ideal_battery_range: number;
    end_ideal_battery_range: number;
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