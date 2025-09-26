#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parameterSchema = exports.configSchema = void 0;
exports.default = createServer;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const tessie_client_js_1 = require("./tessie-client.js");
const query_optimizer_js_1 = require("./query-optimizer.js");
const drive_analyzer_js_1 = require("./drive-analyzer.js");
const zod_1 = require("zod");
// Configuration schema - automatically detected by Smithery
exports.configSchema = zod_1.z.object({
    tessie_api_token: zod_1.z.string().describe("Tessie API token for accessing vehicle data. Get your token from https://my.tessie.com/settings/api"),
});
// Define parameter schema for URL-based configuration
exports.parameterSchema = zod_1.z.object({
    tessie_api_token: zod_1.z.string().optional().describe("Tessie API token for accessing vehicle data"),
});
class TessieMcpServer {
    constructor(config) {
        this.tessieClient = null;
        this.config = null;
        this.config = config || null;
        this.queryOptimizer = new query_optimizer_js_1.TessieQueryOptimizer();
        this.driveAnalyzer = new drive_analyzer_js_1.DriveAnalyzer();
        this.server = new index_js_1.Server({
            name: 'tessie-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
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
                {
                    name: 'natural_language_query',
                    description: 'Process natural language queries about your vehicle data (e.g., "How many miles did I drive last week?")',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Natural language query about vehicle data',
                            },
                            vin: {
                                type: 'string',
                                description: 'Vehicle identification number (VIN) - optional if only one vehicle',
                            },
                        },
                        required: ['query'],
                    },
                },
                {
                    name: 'analyze_latest_drive',
                    description: 'Analyze the most recent drive with comprehensive metrics including duration, battery consumption, FSD usage, and drive merging for stops <7 minutes',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            vin: {
                                type: 'string',
                                description: 'Vehicle identification number (VIN)',
                            },
                            days_back: {
                                type: 'number',
                                description: 'Number of days to look back for recent drives',
                                default: 7,
                            },
                        },
                        required: ['vin'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                if (!this.tessieClient) {
                    // Try config first, then URL parameters, then environment variables as fallback
                    const accessToken = this.config?.tessie_api_token ||
                        process.env.tessie_api_token ||
                        process.env.TESSIE_ACCESS_TOKEN;
                    if (!accessToken) {
                        throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, 'Tessie API token is required. Please configure tessie_api_token in the server settings or add it to your MCP server URL. Get your token from https://my.tessie.com/settings/api');
                    }
                    this.tessieClient = new tessie_client_js_1.TessieClient(accessToken);
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
                    case 'natural_language_query':
                        return await this.handleNaturalLanguageQuery(args);
                    case 'analyze_latest_drive':
                        return await this.handleAnalyzeLatestDrive(args);
                    default:
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                if (error instanceof types_js_1.McpError) {
                    throw error;
                }
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool execution failed: ${error}`);
            }
        });
    }
    async handleGetVehicleCurrentState(args) {
        const { vin, use_cache = true } = args;
        const state = await this.tessieClient.getVehicleState(vin, use_cache);
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
    async handleGetDrivingHistory(args) {
        const { vin, start_date, end_date, limit = 50 } = args;
        const drives = await this.tessieClient.getDrives(vin, start_date, end_date, limit);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        total_drives: drives.length,
                        total_distance_miles: drives.reduce((sum, drive) => sum + drive.odometer_distance, 0),
                        drives: drives.map(drive => ({
                            id: drive.id,
                            date: new Date(drive.started_at * 1000).toISOString(),
                            from: {
                                address: drive.starting_location,
                                saved_location: drive.starting_saved_location,
                                odometer: drive.starting_odometer,
                            },
                            to: {
                                address: drive.ending_location,
                                saved_location: drive.ending_saved_location,
                                odometer: drive.ending_odometer,
                            },
                            distance_miles: drive.odometer_distance,
                            duration_minutes: Math.round((drive.ended_at - drive.started_at) / 60),
                            battery_used: drive.starting_battery - drive.ending_battery,
                            autopilot_miles: drive.autopilot_distance,
                            fsd_available: drive.autopilot_distance !== null && drive.autopilot_distance !== undefined,
                        })),
                    }, null, 2),
                },
            ],
        };
    }
    async handleGetMileageAtLocation(args) {
        const { vin, location, start_date, end_date } = args;
        const drives = await this.tessieClient.getDrives(vin, start_date, end_date);
        const locationLower = location.toLowerCase();
        const matchingDrives = drives.filter(drive => drive.starting_location.toLowerCase().includes(locationLower) ||
            drive.ending_location.toLowerCase().includes(locationLower) ||
            (drive.starting_saved_location && drive.starting_saved_location.toLowerCase().includes(locationLower)) ||
            (drive.ending_saved_location && drive.ending_saved_location.toLowerCase().includes(locationLower)));
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        location_searched: location,
                        matching_drives: matchingDrives.length,
                        drives: matchingDrives.map(drive => ({
                            date: new Date(drive.started_at * 1000).toISOString(),
                            odometer_at_arrival: drive.starting_location.toLowerCase().includes(locationLower) ||
                                (drive.starting_saved_location && drive.starting_saved_location.toLowerCase().includes(locationLower))
                                ? drive.starting_odometer
                                : drive.ending_odometer,
                            location_matched: drive.starting_location.toLowerCase().includes(locationLower) ||
                                (drive.starting_saved_location && drive.starting_saved_location.toLowerCase().includes(locationLower))
                                ? drive.starting_location
                                : drive.ending_location,
                            saved_location: drive.starting_location.toLowerCase().includes(locationLower) ||
                                (drive.starting_saved_location && drive.starting_saved_location.toLowerCase().includes(locationLower))
                                ? drive.starting_saved_location
                                : drive.ending_saved_location,
                        })),
                    }, null, 2),
                },
            ],
        };
    }
    async handleGetWeeklyMileage(args) {
        const { vin, start_date, end_date } = args;
        const drives = await this.tessieClient.getDrives(vin, start_date, end_date);
        const totalMiles = drives.reduce((sum, drive) => sum + drive.odometer_distance, 0);
        const totalDuration = drives.reduce((sum, drive) => sum + Math.round((drive.ended_at - drive.started_at) / 60), 0);
        const totalAutopilotMiles = drives.reduce((sum, drive) => sum + (drive.autopilot_distance || 0), 0);
        const drivesWithFSD = drives.filter(drive => drive.autopilot_distance && drive.autopilot_distance > 0);
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
                        fsd_analysis: {
                            total_autopilot_miles: Math.round(totalAutopilotMiles * 100) / 100,
                            fsd_percentage: totalMiles > 0 ? Math.round((totalAutopilotMiles / totalMiles) * 10000) / 100 : 0,
                            drives_with_fsd: drivesWithFSD.length,
                            fsd_data_available: drives.some(drive => drive.autopilot_distance !== null && drive.autopilot_distance !== undefined),
                            note: totalAutopilotMiles === 0 ? "FSD data may not be available or no FSD usage detected" : undefined
                        },
                        daily_breakdown: this.groupDrivesByDay(drives),
                    }, null, 2),
                },
            ],
        };
    }
    async handleGetVehicles() {
        const vehicles = await this.tessieClient.getVehicles();
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
    async handleNaturalLanguageQuery(args) {
        const { query, vin } = args;
        // First, try to parse the natural language query
        const parsedQuery = this.queryOptimizer.parseNaturalLanguage(query);
        if (parsedQuery.confidence < 0.5) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: 'Unable to understand the query',
                            suggestions: [
                                'Try asking about weekly mileage: "How many miles did I drive last week?"',
                                'Ask about driving history: "Show me my recent trips"',
                                'Check current status: "What is my car\'s current state?"',
                                'List vehicles: "Show me all my vehicles"'
                            ],
                            confidence: parsedQuery.confidence,
                            query_analysis: {
                                original_query: query,
                                detected_patterns: this.analyzeQueryPatterns(query),
                            }
                        }, null, 2),
                    },
                ],
            };
        }
        // Analyze and optimize the query
        const optimization = this.queryOptimizer.optimizeForMCP(parsedQuery.operation, parsedQuery.parameters);
        const metrics = this.queryOptimizer.analyzeQuery(parsedQuery.operation, optimization.optimizedParameters || parsedQuery.parameters);
        // If no VIN provided and we need one, try to get the first vehicle
        let targetVin = vin;
        if (!targetVin && parsedQuery.operation !== 'get_vehicles') {
            const vehicles = await this.tessieClient.getVehicles();
            if (vehicles.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: 'No vehicles found in your Tessie account',
                            }, null, 2),
                        },
                    ],
                };
            }
            targetVin = vehicles[0].vin;
        }
        // Use optimized parameters if available
        const finalParams = { ...optimization.optimizedParameters || parsedQuery.parameters };
        if (targetVin && parsedQuery.operation !== 'get_vehicles') {
            finalParams.vin = targetVin;
        }
        // Execute the parsed operation
        try {
            let result;
            switch (parsedQuery.operation) {
                case 'get_weekly_mileage':
                    result = await this.handleGetWeeklyMileage(finalParams);
                    break;
                case 'get_driving_history':
                    result = await this.handleGetDrivingHistory(finalParams);
                    break;
                case 'get_vehicle_current_state':
                    result = await this.handleGetVehicleCurrentState(finalParams);
                    break;
                case 'get_vehicles':
                    result = await this.handleGetVehicles();
                    break;
                default:
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: 'Unsupported operation',
                                    operation: parsedQuery.operation,
                                    confidence: parsedQuery.confidence,
                                }, null, 2),
                            },
                        ],
                    };
            }
            // Enhance result with optimization metadata
            const enhancedResult = this.enhanceResultWithMetadata(result, {
                original_query: query,
                parsed_operation: parsedQuery.operation,
                confidence: parsedQuery.confidence,
                optimization: optimization,
                metrics: metrics,
                parameters_used: finalParams
            });
            return enhancedResult;
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: 'Failed to execute query',
                            details: error instanceof Error ? error.message : 'Unknown error',
                            original_query: query,
                            parsed_operation: parsedQuery.operation,
                            parameters: finalParams,
                            optimization_applied: optimization.isOptimized,
                            recommendations: optimization.recommendations,
                        }, null, 2),
                    },
                ],
            };
        }
    }
    analyzeQueryPatterns(query) {
        const patterns = [];
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('week'))
            patterns.push('temporal_weekly');
        if (lowerQuery.includes('month'))
            patterns.push('temporal_monthly');
        if (lowerQuery.includes('mile') || lowerQuery.includes('driv'))
            patterns.push('distance_related');
        if (lowerQuery.includes('last') || lowerQuery.includes('previous'))
            patterns.push('historical');
        if (lowerQuery.includes('break') || lowerQuery.includes('basis'))
            patterns.push('breakdown_requested');
        if (lowerQuery.includes('current') || lowerQuery.includes('now'))
            patterns.push('current_state');
        return patterns;
    }
    enhanceResultWithMetadata(result, metadata) {
        const originalData = JSON.parse(result.content[0].text);
        const enhancedData = {
            ...originalData,
            query_metadata: {
                natural_language_query: metadata.original_query,
                operation: metadata.parsed_operation,
                confidence: metadata.confidence,
                optimization_applied: metadata.optimization.isOptimized,
                performance_metrics: {
                    estimated_response_size_kb: metadata.metrics.estimatedResponseSize,
                    complexity_score: metadata.metrics.complexity,
                    api_calls_required: metadata.metrics.apiCallsRequired,
                },
                recommendations: metadata.optimization.recommendations.length > 0 ? metadata.optimization.recommendations : undefined,
                parameters_used: metadata.parameters_used,
            }
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(enhancedData, null, 2),
                },
            ],
        };
    }
    groupDrivesByDay(drives) {
        const dailyStats = {};
        drives.forEach(drive => {
            const date = new Date(drive.started_at * 1000).toISOString().split('T')[0]; // Get YYYY-MM-DD
            if (!dailyStats[date]) {
                dailyStats[date] = { miles: 0, drives: 0, autopilot_miles: 0 };
            }
            dailyStats[date].miles += drive.odometer_distance;
            dailyStats[date].drives += 1;
            dailyStats[date].autopilot_miles += drive.autopilot_distance || 0;
        });
        return Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            miles: Math.round(stats.miles * 100) / 100,
            drives: stats.drives,
            autopilot_miles: Math.round(stats.autopilot_miles * 100) / 100,
            fsd_percentage: stats.miles > 0 ? Math.round((stats.autopilot_miles / stats.miles) * 10000) / 100 : 0,
        }));
    }
    async handleAnalyzeLatestDrive(args) {
        const { vin, days_back = 7 } = args;
        // Calculate date range for recent drives
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days_back);
        // Get recent drives
        const drives = await this.tessieClient.getDrives(vin, startDate.toISOString(), endDate.toISOString(), 100 // Get more drives to ensure we have recent ones
        );
        if (drives.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: 'No drives found in the specified time period',
                            period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                            suggestion: 'Try increasing days_back or check if the vehicle has been driven recently'
                        }, null, 2)
                    }
                ]
            };
        }
        // Analyze the latest drive
        const analysis = this.driveAnalyzer.analyzeLatestDrive(drives);
        if (!analysis) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: 'Could not analyze drives',
                            drives_found: drives.length,
                            suggestion: 'Drives may be incomplete or missing required data'
                        }, null, 2)
                    }
                ]
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        analysis_summary: analysis.summary,
                        detailed_analysis: {
                            drive_details: {
                                id: analysis.mergedDrive.id,
                                original_drives: analysis.mergedDrive.originalDriveIds.length,
                                start_time: new Date(analysis.mergedDrive.started_at * 1000).toISOString(),
                                end_time: new Date(analysis.mergedDrive.ended_at * 1000).toISOString(),
                                route: `${analysis.mergedDrive.starting_location} → ${analysis.mergedDrive.ending_location}`,
                                distance_miles: analysis.mergedDrive.total_distance,
                                total_duration_minutes: analysis.mergedDrive.total_duration_minutes,
                                driving_duration_minutes: analysis.mergedDrive.driving_duration_minutes,
                                average_speed_mph: analysis.mergedDrive.average_speed,
                                max_speed_mph: analysis.mergedDrive.max_speed
                            },
                            stops: analysis.mergedDrive.stops.map(stop => ({
                                location: stop.location,
                                duration_minutes: stop.duration_minutes,
                                type: stop.stop_type,
                                time: `${new Date(stop.started_at * 1000).toLocaleTimeString()} - ${new Date(stop.ended_at * 1000).toLocaleTimeString()}`
                            })),
                            battery_analysis: {
                                starting_level: `${analysis.mergedDrive.starting_battery}%`,
                                ending_level: `${analysis.mergedDrive.ending_battery}%`,
                                percentage_consumed: `${analysis.batteryConsumption.percentage_used}%`,
                                estimated_kwh_used: analysis.batteryConsumption.estimated_kwh_used,
                                efficiency_miles_per_kwh: analysis.batteryConsumption.efficiency_miles_per_kwh
                            },
                            fsd_analysis: {
                                autopilot_miles: analysis.fsdAnalysis.total_autopilot_miles,
                                fsd_percentage: `${analysis.fsdAnalysis.fsd_percentage}%`,
                                data_available: analysis.fsdAnalysis.autopilot_available,
                                note: analysis.fsdAnalysis.note
                            }
                        },
                        metadata: {
                            analysis_time: new Date().toISOString(),
                            drives_analyzed: drives.length,
                            period_searched: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
                        }
                    }, null, 2)
                }
            ]
        };
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('Tessie MCP server running on stdio');
    }
    getServer() {
        return this.server;
    }
}
// Traditional MCP server run (for local usage)
if (require.main === module) {
    const server = new TessieMcpServer();
    server.run().catch(console.error);
}
// Smithery-compliant export
function createServer({ config }) {
    const serverInstance = new TessieMcpServer(config);
    return serverInstance.getServer();
}
//# sourceMappingURL=index.js.map