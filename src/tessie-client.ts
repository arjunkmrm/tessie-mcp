import axios, { AxiosInstance, AxiosResponse } from 'axios';

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

export class TessieClient {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: 'https://api.tessie.com',
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getVehicleState(vin: string, useCache: boolean = true): Promise<TessieVehicleState> {
    try {
      const response: AxiosResponse<TessieVehicleState> = await this.client.get(
        `/${vin}/state${useCache ? '?use_cache=true' : ''}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get vehicle state: ${error}`);
    }
  }

  async getVehicleStates(
    vin: string,
    startDate?: string,
    endDate?: string
  ): Promise<TessieVehicleState[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const response: AxiosResponse<TessieVehicleState[]> = await this.client.get(
        `/${vin}/states?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get vehicle states: ${error}`);
    }
  }

  async getVehicleLocation(vin: string): Promise<TessieLocation> {
    try {
      const response: AxiosResponse<TessieLocation> = await this.client.get(`/${vin}/location`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get vehicle location: ${error}`);
    }
  }

  async getDrives(
    vin: string,
    startDate?: string,
    endDate?: string,
    limit: number = 50
  ): Promise<TessieDrive[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      params.append('limit', limit.toString());

      const response: AxiosResponse<TessieDrive[]> = await this.client.get(
        `/${vin}/drives?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get drives: ${error}`);
    }
  }

  async getDrivingPath(
    vin: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ latitude: number; longitude: number; timestamp: string }>> {
    try {
      const params = new URLSearchParams();
      params.append('start', startDate);
      params.append('end', endDate);

      const response: AxiosResponse<Array<{ latitude: number; longitude: number; timestamp: string }>> = 
        await this.client.get(`/${vin}/path?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get driving path: ${error}`);
    }
  }

  async getVehicles(): Promise<Array<{ vin: string; display_name: string }>> {
    try {
      const response: AxiosResponse<Array<{ vin: string; display_name: string }>> = 
        await this.client.get('/vehicles');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get vehicles: ${error}`);
    }
  }
}