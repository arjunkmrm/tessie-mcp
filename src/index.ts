#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { TessieClient } from './tessie-client.js';

class TessieMcpServer {
  private server: Server;
  private tessieClient: TessieClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'tessie-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_vehicle_current_state',
          description: 'Get the current state of a vehicle including location, battery level, odometer reading',
          inputSchema: {
            type: 'object',
            properties: {
              vin: {
                type: 'string',
                description: 'Vehicle identification number (VIN)',
              },
              use_cache: {
                type: 'boolean',
                description: 'Whether to use cached data to avoid waking the vehicle',
                default: true,
              },
            },
            required: ['vin'],
          },
        },
        {
          name: 'get_driving_history',
          description: 'Get driving history for a vehicle within a date range',
          inputSchema: {
            type: 'object',
            properties: {
              vin: {
                type: 'string',
                description: 'Vehicle identification number (VIN)',
              },
              start_date: {
                type: 'string',
                description: 'Start date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)',
              },
              end_date: {
                type: 'string',
                description: 'End date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of drives to return',
                default: 50,
              },
            },
            required: ['vin'],
          },
        },
        {
          name: 'get_mileage_at_location',
          description: 'Find drives to a specific location and return mileage information',
          inputSchema: {
            type: 'object',
            properties: {
              vin: {
                type: 'string',
                description: 'Vehicle identification number (VIN)',
              },
              location: {
                type: 'string',
                description: 'Location name or address to search for',
              },
              start_date: {
                type: 'string',
                description: 'Start date to search from (ISO format)',
              },
              end_date: {
                type: 'string',
                description: 'End date to search until (ISO format)',
              },
            },
            required: ['vin', 'location'],
          },
        },
        {
          name: 'get_weekly_mileage',
          description: 'Calculate total miles driven in a specific week or time period',
          inputSchema: {
            type: 'object',
            properties: {
              vin: {
                type: 'string',
                description: 'Vehicle identification number (VIN)',
              },
              start_date: {
                type: 'string',
                description: 'Start date of the period (ISO format)',
              },
              end_date: {
                type: 'string',
                description: 'End date of the period (ISO format)',
              },
            },
            required: ['vin', 'start_date', 'end_date'],
          },
        },
        {
          name: 'get_vehicles',
          description: 'List all vehicles in the Tessie account',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (!this.tessieClient) {
          // Try environment variable first, then fall back to config
          const accessToken = process.env.TESSIE_ACCESS_TOKEN || process.env.tessie_api_token;
          if (!accessToken) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'Tessie API token is required. Please configure it in the extension settings or set TESSIE_ACCESS_TOKEN environment variable.'
            );
          }
          this.tessieClient = new TessieClient(accessToken);
        }

        switch (name) {
          case 'get_vehicle_current_state':
            return await this.handleGetVehicleCurrentState(args);

          case 'get_driving_history':
            return await this.handleGetDrivingHistory(args);

          case 'get_mileage_at_location':
            return await this.handleGetMileageAtLocation(args);

          case 'get_weekly_mileage':
            return await this.handleGetWeeklyMileage(args);

          case 'get_vehicles':
            return await this.handleGetVehicles();

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
      }
    });
  }

  private async handleGetVehicleCurrentState(args: any) {
    const { vin, use_cache = true } = args;
    const state = await this.tessieClient!.getVehicleState(vin, use_cache);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            vehicle: state.display_name,
            vin: state.vin,
            current_location: {
              latitude: state.latitude,
              longitude: state.longitude,
            },
            odometer: state.odometer,
            battery_level: state.battery_level,
            charging_state: state.charging_state,
            locked: state.locked,
            climate_on: state.climate_on,
            inside_temp: state.inside_temp,
            outside_temp: state.outside_temp,
            last_updated: state.since,
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetDrivingHistory(args: any) {
    const { vin, start_date, end_date, limit = 50 } = args;
    const drives = await this.tessieClient!.getDrives(vin, start_date, end_date, limit);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total_drives: drives.length,
            total_distance_miles: drives.reduce((sum, drive) => sum + drive.distance_miles, 0),
            drives: drives.map(drive => ({
              id: drive.id,
              date: drive.start_date,
              from: {
                address: drive.start_address,
                saved_location: drive.start_saved_location,
                odometer: drive.start_odometer,
              },
              to: {
                address: drive.end_address,
                saved_location: drive.end_saved_location,
                odometer: drive.end_odometer,
              },
              distance_miles: drive.distance_miles,
              duration_minutes: drive.duration_min,
              battery_used: drive.start_battery_level - drive.end_battery_level,
            })),
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetMileageAtLocation(args: any) {
    const { vin, location, start_date, end_date } = args;
    const drives = await this.tessieClient!.getDrives(vin, start_date, end_date);
    
    const locationLower = location.toLowerCase();
    const matchingDrives = drives.filter(drive => 
      drive.start_address.toLowerCase().includes(locationLower) ||
      drive.end_address.toLowerCase().includes(locationLower) ||
      (drive.start_saved_location && drive.start_saved_location.toLowerCase().includes(locationLower)) ||
      (drive.end_saved_location && drive.end_saved_location.toLowerCase().includes(locationLower))
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            location_searched: location,
            matching_drives: matchingDrives.length,
            drives: matchingDrives.map(drive => ({
              date: drive.start_date,
              odometer_at_arrival: drive.start_address.toLowerCase().includes(locationLower) || 
                                  (drive.start_saved_location && drive.start_saved_location.toLowerCase().includes(locationLower))
                                  ? drive.start_odometer 
                                  : drive.end_odometer,
              location_matched: drive.start_address.toLowerCase().includes(locationLower) || 
                               (drive.start_saved_location && drive.start_saved_location.toLowerCase().includes(locationLower))
                               ? drive.start_address 
                               : drive.end_address,
              saved_location: drive.start_address.toLowerCase().includes(locationLower) || 
                             (drive.start_saved_location && drive.start_saved_location.toLowerCase().includes(locationLower))
                             ? drive.start_saved_location 
                             : drive.end_saved_location,
            })),
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetWeeklyMileage(args: any) {
    const { vin, start_date, end_date } = args;
    const drives = await this.tessieClient!.getDrives(vin, start_date, end_date);
    
    const totalMiles = drives.reduce((sum, drive) => sum + drive.distance_miles, 0);
    const totalDuration = drives.reduce((sum, drive) => sum + drive.duration_min, 0);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            period: {
              start: start_date,
              end: end_date,
            },
            total_miles_driven: Math.round(totalMiles * 100) / 100,
            total_drives: drives.length,
            total_drive_time_hours: Math.round((totalDuration / 60) * 100) / 100,
            average_miles_per_drive: drives.length > 0 ? Math.round((totalMiles / drives.length) * 100) / 100 : 0,
            daily_breakdown: this.groupDrivesByDay(drives),
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetVehicles() {
    const vehicles = await this.tessieClient!.getVehicles();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            vehicles: vehicles,
            count: vehicles.length,
          }, null, 2),
        },
      ],
    };
  }

  private groupDrivesByDay(drives: any[]) {
    const dailyStats: { [key: string]: { miles: number; drives: number } } = {};
    
    drives.forEach(drive => {
      const date = drive.start_date.split('T')[0]; // Get YYYY-MM-DD
      if (!dailyStats[date]) {
        dailyStats[date] = { miles: 0, drives: 0 };
      }
      dailyStats[date].miles += drive.distance_miles;
      dailyStats[date].drives += 1;
    });

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      miles: Math.round(stats.miles * 100) / 100,
      drives: stats.drives,
    }));
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Tessie MCP server running on stdio');
  }
}

const server = new TessieMcpServer();
server.run().catch(console.error);