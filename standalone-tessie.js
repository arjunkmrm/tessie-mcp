#!/usr/bin/env node

// Complete Tessie MCP Server with all functionality
console.error("=== TESSIE MCP SERVER STARTING ===");

// HTTP client implementation without external dependencies
const https = require('https');
const http = require('http');
const { URL } = require('url');

class TessieClient {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://api.tessie.com';
    }

    async makeRequest(endpoint, options = {}) {
        const url = new URL(endpoint, this.baseUrl);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        return new Promise((resolve, reject) => {
            const reqOptions = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: options.method || 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Tessie-MCP/1.0.0',
                    ...options.headers
                }
            };

            const req = client.request(reqOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(jsonData);
                        } else {
                            reject(new Error(`API Error ${res.statusCode}: ${jsonData.error || data}`));
                        }
                    } catch (e) {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(data);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    }
                });
            });

            req.on('error', reject);
            
            if (options.body) {
                req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    async getVehicles() {
        return this.makeRequest('/vehicles');
    }

    async getVehicleState(vin) {
        return this.makeRequest(`/${vin}/state`);
    }

    async getDrives(vin, options = {}) {
        const params = new URLSearchParams();
        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.limit) params.append('limit', options.limit.toString());
        
        const queryString = params.toString();
        const endpoint = `/${vin}/drives${queryString ? '?' + queryString : ''}`;
        return this.makeRequest(endpoint);
    }

    async getLocation(vin) {
        return this.makeRequest(`/${vin}/location`);
    }

    // Vehicle Data endpoints
    async getVehicle(vin) {
        return this.makeRequest(`/${vin}`);
    }

    async getHistoricalStates(vin, options = {}) {
        const params = new URLSearchParams();
        if (options.start) params.append('from', options.start);
        if (options.end) params.append('to', options.end);
        if (options.limit) params.append('limit', options.limit.toString());
        
        const queryString = params.toString();
        const endpoint = `/${vin}/states${queryString ? '?' + queryString : ''}`;
        return this.makeRequest(endpoint);
    }

    async getBattery(vin) {
        return this.makeRequest(`/${vin}/battery`);
    }

    async getBatteryHealth(vin) {
        return this.makeRequest(`/${vin}/battery_health`);
    }

    async getAllBatteryHealth() {
        return this.makeRequest(`/battery_health`);
    }

    async getBatteryHealthMeasurements(vin, options = {}) {
        const params = new URLSearchParams();
        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        
        const queryString = params.toString();
        const endpoint = `/${vin}/battery_health_measurements${queryString ? '?' + queryString : ''}`;
        return this.makeRequest(endpoint);
    }

    async getFirmwareAlerts(vin) {
        return this.makeRequest(`/${vin}/firmware_alerts`);
    }

    async getMap(vin, options = {}) {
        const params = new URLSearchParams();
        if (options.start) params.append('from', options.start);
        if (options.end) params.append('to', options.end);
        // Add required parameters for map API
        params.append('width', options.width || '500');
        params.append('height', options.height || '400');
        
        const queryString = params.toString();
        const endpoint = `/${vin}/map${queryString ? '?' + queryString : ''}`;
        return this.makeRequest(endpoint);
    }

    async getConsumption(vin, options = {}) {
        return this.makeRequest(`/${vin}/consumption_since_charge`);
    }

    async getWeather(vin) {
        return this.makeRequest(`/${vin}/weather`);
    }

    async getDrivingPath(vin, driveId) {
        return this.makeRequest(`/${vin}/path?drive=${driveId}`);
    }

    async getCharges(vin, options = {}) {
        const params = new URLSearchParams();
        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.limit) params.append('limit', options.limit.toString());
        
        const queryString = params.toString();
        const endpoint = `/${vin}/charges${queryString ? '?' + queryString : ''}`;
        return this.makeRequest(endpoint);
    }

    async getAllChargingInvoices(vin, options = {}) {
        const params = new URLSearchParams();
        if (options.start) params.append('from', options.start);
        if (options.end) params.append('to', options.end);
        
        const queryString = params.toString();
        const endpoint = `/charging_invoices${queryString ? '?' + queryString : ''}`;
        return this.makeRequest(endpoint);
    }

    async getIdles(vin, options = {}) {
        const params = new URLSearchParams();
        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.limit) params.append('limit', options.limit.toString());
        
        const queryString = params.toString();
        const endpoint = `/${vin}/idles${queryString ? '?' + queryString : ''}`;
        return this.makeRequest(endpoint);
    }

    async getLastIdleState(vin) {
        return this.makeRequest(`/${vin}/last_idle_state`);
    }

    async getTirePressure(vin) {
        return this.makeRequest(`/${vin}/tire_pressure`);
    }

    async getStatus(vin) {
        return this.makeRequest(`/${vin}/status`);
    }

    async getLicensePlate(vin) {
        return this.makeRequest(`/${vin}/plate`);
    }

    // Enhanced State Access Methods
    async getDriveState(vin) {
        const state = await this.getVehicleState(vin);
        return state.drive_state || {};
    }

    async getClimateState(vin) {
        const state = await this.getVehicleState(vin);
        return state.climate_state || {};
    }

    async getDetailedVehicleState(vin) {
        const state = await this.getVehicleState(vin);
        return state.vehicle_state || {};
    }

    async getChargeState(vin) {
        const state = await this.getVehicleState(vin);
        return state.charge_state || {};
    }

    async getGuiSettings(vin) {
        const state = await this.getVehicleState(vin);
        return state.gui_settings || {};
    }

    // Advanced Analytics Methods
    async getEfficiencyTrends(vin, options = {}) {
        const drives = await this.getDrives(vin, options);
        
        if (!drives.results || drives.results.length === 0) {
            return { error: "No drive data available for efficiency analysis" };
        }

        const driveData = drives.results;
        const trends = {
            period: {
                start: options.start || 'All time',
                end: options.end || 'Present'
            },
            total_drives: driveData.length,
            efficiency_metrics: {}
        };

        // Calculate efficiency trends
        let totalDistance = 0;
        let totalEnergyUsed = 0;
        let dailyEfficiency = {};

        driveData.forEach(drive => {
            if (drive.distance_miles && drive.energy_used_kwh) {
                totalDistance += drive.distance_miles;
                totalEnergyUsed += drive.energy_used_kwh;
                
                const date = new Date(drive.started_at).toISOString().split('T')[0];
                if (!dailyEfficiency[date]) {
                    dailyEfficiency[date] = { distance: 0, energy: 0, drives: 0 };
                }
                dailyEfficiency[date].distance += drive.distance_miles;
                dailyEfficiency[date].energy += drive.energy_used_kwh;
                dailyEfficiency[date].drives += 1;
            }
        });

        if (totalDistance > 0 && totalEnergyUsed > 0) {
            trends.efficiency_metrics = {
                overall_efficiency_kwh_per_mile: (totalEnergyUsed / totalDistance).toFixed(3),
                overall_efficiency_miles_per_kwh: (totalDistance / totalEnergyUsed).toFixed(3),
                total_distance_miles: totalDistance.toFixed(1),
                total_energy_used_kwh: totalEnergyUsed.toFixed(1),
                daily_breakdown: Object.entries(dailyEfficiency).map(([date, data]) => ({
                    date,
                    efficiency_kwh_per_mile: data.distance > 0 ? (data.energy / data.distance).toFixed(3) : 0,
                    distance_miles: data.distance.toFixed(1),
                    energy_used_kwh: data.energy.toFixed(1),
                    drives: data.drives
                }))
            };
        }

        return trends;
    }

    async getChargingCostAnalysis(vin, options = {}) {
        const charges = await this.getCharges(vin, options);
        
        if (!charges.results || charges.results.length === 0) {
            return { error: "No charging data available for cost analysis" };
        }

        const chargeData = charges.results;
        const analysis = {
            period: {
                start: options.start || 'All time',
                end: options.end || 'Present'
            },
            total_sessions: chargeData.length,
            cost_breakdown: {}
        };

        let totalCost = 0;
        let totalEnergyAdded = 0;
        let homeCharging = { sessions: 0, cost: 0, energy: 0 };
        let supercharging = { sessions: 0, cost: 0, energy: 0 };
        let publicCharging = { sessions: 0, cost: 0, energy: 0 };

        chargeData.forEach(session => {
            if (session.cost && session.energy_added_kwh) {
                totalCost += session.cost;
                totalEnergyAdded += session.energy_added_kwh;

                // Categorize charging type based on location or charger type
                if (session.location && session.location.toLowerCase().includes('home')) {
                    homeCharging.sessions += 1;
                    homeCharging.cost += session.cost;
                    homeCharging.energy += session.energy_added_kwh;
                } else if (session.charger_type && session.charger_type.toLowerCase().includes('supercharger')) {
                    supercharging.sessions += 1;
                    supercharging.cost += session.cost;
                    supercharging.energy += session.energy_added_kwh;
                } else {
                    publicCharging.sessions += 1;
                    publicCharging.cost += session.cost;
                    publicCharging.energy += session.energy_added_kwh;
                }
            }
        });

        if (totalCost > 0 && totalEnergyAdded > 0) {
            analysis.cost_breakdown = {
                total_cost: totalCost.toFixed(2),
                total_energy_kwh: totalEnergyAdded.toFixed(1),
                average_cost_per_kwh: (totalCost / totalEnergyAdded).toFixed(3),
                home_charging: {
                    sessions: homeCharging.sessions,
                    cost: homeCharging.cost.toFixed(2),
                    energy_kwh: homeCharging.energy.toFixed(1),
                    avg_cost_per_kwh: homeCharging.energy > 0 ? (homeCharging.cost / homeCharging.energy).toFixed(3) : 0
                },
                supercharging: {
                    sessions: supercharging.sessions,
                    cost: supercharging.cost.toFixed(2),
                    energy_kwh: supercharging.energy.toFixed(1),
                    avg_cost_per_kwh: supercharging.energy > 0 ? (supercharging.cost / supercharging.energy).toFixed(3) : 0
                },
                public_charging: {
                    sessions: publicCharging.sessions,
                    cost: publicCharging.cost.toFixed(2),
                    energy_kwh: publicCharging.energy.toFixed(1),
                    avg_cost_per_kwh: publicCharging.energy > 0 ? (publicCharging.cost / publicCharging.energy).toFixed(3) : 0
                }
            };
        }

        return analysis;
    }

    async getUsagePatterns(vin, options = {}) {
        const drives = await this.getDrives(vin, options);
        
        if (!drives.results || drives.results.length === 0) {
            return { error: "No drive data available for usage pattern analysis" };
        }

        const driveData = drives.results;
        const patterns = {
            analysis_period: {
                start: options.start || 'All time',
                end: options.end || 'Present'
            },
            total_drives: driveData.length
        };

        // Analyze daily patterns
        const dayOfWeekStats = {};
        const hourOfDayStats = {};
        
        driveData.forEach(drive => {
            const startTime = new Date(drive.started_at);
            const dayOfWeek = startTime.getDay(); // 0 = Sunday
            const hour = startTime.getHours();

            // Day of week analysis
            if (!dayOfWeekStats[dayOfWeek]) {
                dayOfWeekStats[dayOfWeek] = { drives: 0, distance: 0, energy: 0 };
            }
            dayOfWeekStats[dayOfWeek].drives += 1;
            if (drive.distance_miles) dayOfWeekStats[dayOfWeek].distance += drive.distance_miles;
            if (drive.energy_used_kwh) dayOfWeekStats[dayOfWeek].energy += drive.energy_used_kwh;

            // Hour of day analysis
            if (!hourOfDayStats[hour]) {
                hourOfDayStats[hour] = { drives: 0, distance: 0, energy: 0 };
            }
            hourOfDayStats[hour].drives += 1;
            if (drive.distance_miles) hourOfDayStats[hour].distance += drive.distance_miles;
            if (drive.energy_used_kwh) hourOfDayStats[hour].energy += drive.energy_used_kwh;
        });

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        patterns.weekly_pattern = dayNames.map((day, index) => ({
            day,
            drives: dayOfWeekStats[index]?.drives || 0,
            avg_distance_miles: dayOfWeekStats[index] ? (dayOfWeekStats[index].distance / dayOfWeekStats[index].drives).toFixed(1) : 0,
            total_distance_miles: dayOfWeekStats[index]?.distance.toFixed(1) || 0
        }));

        patterns.hourly_pattern = Object.entries(hourOfDayStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([hour, data]) => ({
                hour: parseInt(hour),
                drives: data.drives,
                avg_distance_miles: data.drives > 0 ? (data.distance / data.drives).toFixed(1) : 0
            }));

        return patterns;
    }

    async getMonthlySummary(vin, year, month) {
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
        
        const [drives, charges] = await Promise.all([
            this.getDrives(vin, { start: startDate, end: endDate }),
            this.getCharges(vin, { start: startDate, end: endDate })
        ]);

        const summary = {
            period: {
                year,
                month,
                month_name: new Date(year, month - 1).toLocaleString('default', { month: 'long' })
            },
            driving: {
                total_drives: drives.results?.length || 0,
                total_distance_miles: 0,
                total_energy_used_kwh: 0,
                average_efficiency_kwh_per_mile: 0
            },
            charging: {
                total_sessions: charges.results?.length || 0,
                total_energy_added_kwh: 0,
                total_cost: 0,
                average_cost_per_kwh: 0
            }
        };

        // Calculate driving metrics
        if (drives.results) {
            let totalDistance = 0;
            let totalEnergy = 0;
            
            drives.results.forEach(drive => {
                if (drive.distance_miles) totalDistance += drive.distance_miles;
                if (drive.energy_used_kwh) totalEnergy += drive.energy_used_kwh;
            });

            summary.driving.total_distance_miles = totalDistance.toFixed(1);
            summary.driving.total_energy_used_kwh = totalEnergy.toFixed(1);
            summary.driving.average_efficiency_kwh_per_mile = totalDistance > 0 ? (totalEnergy / totalDistance).toFixed(3) : 0;
        }

        // Calculate charging metrics
        if (charges.results) {
            let totalEnergy = 0;
            let totalCost = 0;
            
            charges.results.forEach(session => {
                if (session.energy_added_kwh) totalEnergy += session.energy_added_kwh;
                if (session.cost) totalCost += session.cost;
            });

            summary.charging.total_energy_added_kwh = totalEnergy.toFixed(1);
            summary.charging.total_cost = totalCost.toFixed(2);
            summary.charging.average_cost_per_kwh = totalEnergy > 0 ? (totalCost / totalEnergy).toFixed(3) : 0;
        }

        return summary;
    }
}

// MCP Server implementation
class TessieMCPServer {
    constructor() {
        this.requestId = 0;
        this.tessieClient = null;
        console.error("Tessie MCP Server instance created");
    }

    initializeTessieClient() {
        const token = process.env.tessie_api_token || process.env.TESSIE_ACCESS_TOKEN;
        if (!token) {
            console.error("ERROR: No Tessie API token found!");
            return false;
        }
        
        this.tessieClient = new TessieClient(token);
        console.error("Tessie client initialized with token");
        return true;
    }

    sendResponse(id, result) {
        const response = {
            jsonrpc: "2.0",
            id: id,
            result: result
        };
        console.log(JSON.stringify(response));
        console.error(`Sent response for ${id}: ${JSON.stringify(result).substring(0, 200)}...`);
    }

    sendError(id, code, message, data = null) {
        const response = {
            jsonrpc: "2.0",
            id: id,
            error: { code: code, message: message }
        };
        if (data) response.error.data = data;
        console.log(JSON.stringify(response));
        console.error(`Sent error for ${id}: ${message}`);
    }

    async handleMessage(message) {
        console.error(`Handling message: ${JSON.stringify(message).substring(0, 200)}...`);
        
        try {
            if (message.method === 'initialize') {
                const tokenAvailable = this.initializeTessieClient();
                this.sendResponse(message.id, {
                    protocolVersion: "2025-06-18",
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: "tessie-mcp",
                        version: "1.0.0"
                    },
                    instructions: tokenAvailable ? 
                        "Tessie MCP server ready. You can now query your Tesla vehicle data." :
                        "Tessie MCP server started but no API token configured. Please set your tessie_api_token in the extension settings."
                });

            } else if (message.method === 'tools/list') {
                this.sendResponse(message.id, {
                    tools: [
                        // Core Vehicle Data
                        {
                            name: "get_vehicles",
                            description: "List all vehicles in your Tessie account",
                            inputSchema: { type: "object", properties: {} }
                        },
                        {
                            name: "get_vehicle",
                            description: "Get detailed information about a specific vehicle",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_vehicle_current_state",
                            description: "Get current vehicle status including battery, location, and odometer",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_historical_states",
                            description: "Get historical vehicle state data",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start_date: { type: "string", description: "Start date in ISO format" },
                                    end_date: { type: "string", description: "End date in ISO format" },
                                    limit: { type: "integer", description: "Maximum number of states to return" }
                                }
                            }
                        },
                        
                        // Battery & Energy
                        {
                            name: "get_battery",
                            description: "Get current battery information",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_battery_health",
                            description: "Get battery health information for a specific vehicle",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_all_battery_health",
                            description: "Get battery health information for all vehicles in account",
                            inputSchema: {
                                type: "object",
                                properties: {}
                            }
                        },
                        {
                            name: "get_battery_health_measurements",
                            description: "Get historical battery health measurements",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start_date: { type: "string", description: "Start date in ISO format" },
                                    end_date: { type: "string", description: "End date in ISO format" }
                                }
                            }
                        },
                        {
                            name: "get_consumption",
                            description: "Get energy consumption data since last charge",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },

                        // Location & Navigation
                        {
                            name: "get_location",
                            description: "Get current vehicle location",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_map",
                            description: "Get map data for vehicle trips",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start_date: { type: "string", description: "Start date in ISO format" },
                                    end_date: { type: "string", description: "End date in ISO format" },
                                    width: { type: "integer", description: "Map width in pixels (100-1000, default: 500)" },
                                    height: { type: "integer", description: "Map height in pixels (100-1000, default: 400)" }
                                }
                            }
                        },

                        // Driving Data
                        {
                            name: "get_driving_history",
                            description: "Get historical driving data within date ranges",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start_date: { type: "string", description: "Start date in ISO format (e.g., 2024-01-01T00:00:00Z)" },
                                    end_date: { type: "string", description: "End date in ISO format (e.g., 2024-01-31T23:59:59Z)" },
                                    limit: { type: "integer", description: "Maximum number of drives to return (default: 50)" }
                                }
                            }
                        },
                        {
                            name: "get_driving_path",
                            description: "Get detailed path data for a specific drive",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    drive_id: { type: "string", description: "Drive ID to get path data for" }
                                },
                                required: ["drive_id"]
                            }
                        },

                        // Charging Data
                        {
                            name: "get_charges",
                            description: "Get charging session data",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start_date: { type: "string", description: "Start date in ISO format" },
                                    end_date: { type: "string", description: "End date in ISO format" },
                                    limit: { type: "integer", description: "Maximum number of charges to return" }
                                }
                            }
                        },
                        {
                            name: "get_charging_invoices",
                            description: "Get all charging invoices for your account",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    start_date: { type: "string", description: "Start date in ISO format" },
                                    end_date: { type: "string", description: "End date in ISO format" }
                                }
                            }
                        },

                        // Idle Data
                        {
                            name: "get_idles",
                            description: "Get idle period data",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start_date: { type: "string", description: "Start date in ISO format" },
                                    end_date: { type: "string", description: "End date in ISO format" },
                                    limit: { type: "integer", description: "Maximum number of idles to return" }
                                }
                            }
                        },
                        {
                            name: "get_last_idle_state",
                            description: "Get the last idle state of the vehicle",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },

                        // Vehicle Status
                        {
                            name: "get_tire_pressure",
                            description: "Get current tire pressure readings",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_status",
                            description: "Get overall vehicle status",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_license_plate",
                            description: "Get vehicle license plate information",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_firmware_alerts",
                            description: "Get firmware alerts and notifications",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_weather",
                            description: "Get weather information for vehicle location",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },

                        // Analysis Tools (original custom tools)
                        {
                            name: "get_mileage_at_location",
                            description: "Find mileage information for trips to specific locations",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    location_name: { type: "string", description: "Name or description of the location to search for" },
                                    start_date: { type: "string", description: "Start date to search from (ISO format)" },
                                    end_date: { type: "string", description: "End date to search to (ISO format)" }
                                }
                            }
                        },
                        {
                            name: "get_weekly_mileage",
                            description: "Calculate total mileage for specific time periods",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start_date: { type: "string", description: "Start date in ISO format" },
                                    end_date: { type: "string", description: "End date in ISO format" }
                                }
                            }
                        },
                        // Enhanced State Access Tools
                        {
                            name: "get_drive_state",
                            description: "Get detailed driving state including speed, heading, GPS data, and active route",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_climate_state",
                            description: "Get detailed climate control status including HVAC, seat heaters, cabin temperature",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_detailed_vehicle_state",
                            description: "Get comprehensive vehicle state including doors, windows, locks, odometer, software",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_charge_state",
                            description: "Get detailed charging state including battery level, charge rate, scheduled charging",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        {
                            name: "get_gui_settings",
                            description: "Get user interface settings including units, time format, display preferences",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" }
                                }
                            }
                        },
                        // Advanced Analytics Tools
                        {
                            name: "get_efficiency_trends",
                            description: "Analyze driving efficiency trends over time with daily breakdowns",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start: { type: "string", description: "Start date in ISO format" },
                                    end: { type: "string", description: "End date in ISO format" }
                                }
                            }
                        },
                        {
                            name: "get_charging_cost_analysis",
                            description: "Analyze charging costs by location type (home, supercharger, public)",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start: { type: "string", description: "Start date in ISO format" },
                                    end: { type: "string", description: "End date in ISO format" }
                                }
                            }
                        },
                        {
                            name: "get_usage_patterns",
                            description: "Analyze driving usage patterns by day of week and hour of day",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    start: { type: "string", description: "Start date in ISO format" },
                                    end: { type: "string", description: "End date in ISO format" }
                                }
                            }
                        },
                        {
                            name: "get_monthly_summary",
                            description: "Get comprehensive monthly summary of driving and charging metrics",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    vin: { type: "string", description: "Vehicle VIN (leave empty to use active vehicle)" },
                                    year: { type: "number", description: "Year (e.g. 2024)" },
                                    month: { type: "number", description: "Month (1-12)" }
                                }
                            }
                        }
                    ]
                });

            } else if (message.method === 'tools/call') {
                await this.handleToolCall(message);

            } else {
                this.sendError(message.id, -32601, `Method not found: ${message.method}`);
            }
        } catch (error) {
            console.error(`Error handling message: ${error}`);
            this.sendError(message.id, -32603, `Internal error: ${error.message}`);
        }
    }

    async handleToolCall(message) {
        const { name, arguments: args } = message.params;
        
        if (!this.tessieClient) {
            this.sendError(message.id, -32000, "Tessie API token not configured. Please set your tessie_api_token in the extension settings.");
            return;
        }

        try {
            let result;

            switch (name) {
                // Core Vehicle Data
                case 'get_vehicles':
                    result = await this.tessieClient.getVehicles();
                    break;

                case 'get_vehicle':
                    const vinVehicle = args.vin || await this.getFirstVehicleVin();
                    if (!vinVehicle) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getVehicle(vinVehicle);
                    break;

                case 'get_vehicle_current_state':
                    const vin1 = args.vin || await this.getFirstVehicleVin();
                    if (!vin1) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getVehicleState(vin1);
                    break;

                case 'get_historical_states':
                    const vinStates = args.vin || await this.getFirstVehicleVin();
                    if (!vinStates) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    const statesOptions = {};
                    if (args.start_date) statesOptions.start = args.start_date;
                    if (args.end_date) statesOptions.end = args.end_date;
                    if (args.limit) statesOptions.limit = args.limit;
                    result = await this.tessieClient.getHistoricalStates(vinStates, statesOptions);
                    break;

                // Battery & Energy
                case 'get_battery':
                    const vinBattery = args.vin || await this.getFirstVehicleVin();
                    if (!vinBattery) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getBattery(vinBattery);
                    break;

                case 'get_battery_health':
                    const vinBatteryHealth = args.vin || await this.getFirstVehicleVin();
                    if (!vinBatteryHealth) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getBatteryHealth(vinBatteryHealth);
                    break;

                case 'get_all_battery_health':
                    result = await this.tessieClient.getAllBatteryHealth();
                    break;

                case 'get_battery_health_measurements':
                    const vinBatteryMeas = args.vin || await this.getFirstVehicleVin();
                    if (!vinBatteryMeas) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    const batteryOptions = {};
                    if (args.start_date) batteryOptions.start = args.start_date;
                    if (args.end_date) batteryOptions.end = args.end_date;
                    result = await this.tessieClient.getBatteryHealthMeasurements(vinBatteryMeas, batteryOptions);
                    break;

                case 'get_consumption':
                    const vinConsumption = args.vin || await this.getFirstVehicleVin();
                    if (!vinConsumption) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getConsumption(vinConsumption);
                    break;

                // Location & Navigation
                case 'get_location':
                    const vinLocation = args.vin || await this.getFirstVehicleVin();
                    if (!vinLocation) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getLocation(vinLocation);
                    break;

                case 'get_map':
                    const vinMap = args.vin || await this.getFirstVehicleVin();
                    if (!vinMap) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    const mapOptions = {};
                    if (args.start_date) mapOptions.start = args.start_date;
                    if (args.end_date) mapOptions.end = args.end_date;
                    if (args.width) mapOptions.width = args.width;
                    if (args.height) mapOptions.height = args.height;
                    result = await this.tessieClient.getMap(vinMap, mapOptions);
                    break;

                // Driving Data
                case 'get_driving_path':
                    const vinPath = args.vin || await this.getFirstVehicleVin();
                    if (!vinPath) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    if (!args.drive_id) {
                        this.sendError(message.id, -32000, "Drive ID is required for get_driving_path");
                        return;
                    }
                    result = await this.tessieClient.getDrivingPath(vinPath, args.drive_id);
                    break;

                // Charging Data
                case 'get_charges':
                    const vinCharges = args.vin || await this.getFirstVehicleVin();
                    if (!vinCharges) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    const chargesOptions = {};
                    if (args.start_date) chargesOptions.start = args.start_date;
                    if (args.end_date) chargesOptions.end = args.end_date;
                    if (args.limit) chargesOptions.limit = args.limit;
                    result = await this.tessieClient.getCharges(vinCharges, chargesOptions);
                    break;

                case 'get_charging_invoices':
                    const invoicesOptions = {};
                    if (args.start_date) invoicesOptions.start = args.start_date;
                    if (args.end_date) invoicesOptions.end = args.end_date;
                    // Charging invoices endpoint doesn't require VIN (gets all invoices for account)
                    result = await this.tessieClient.getAllChargingInvoices(null, invoicesOptions);
                    break;

                // Idle Data
                case 'get_idles':
                    const vinIdles = args.vin || await this.getFirstVehicleVin();
                    if (!vinIdles) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    const idlesOptions = {};
                    if (args.start_date) idlesOptions.start = args.start_date;
                    if (args.end_date) idlesOptions.end = args.end_date;
                    if (args.limit) idlesOptions.limit = args.limit;
                    result = await this.tessieClient.getIdles(vinIdles, idlesOptions);
                    break;

                case 'get_last_idle_state':
                    const vinLastIdle = args.vin || await this.getFirstVehicleVin();
                    if (!vinLastIdle) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getLastIdleState(vinLastIdle);
                    break;

                // Vehicle Status
                case 'get_tire_pressure':
                    const vinTires = args.vin || await this.getFirstVehicleVin();
                    if (!vinTires) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getTirePressure(vinTires);
                    break;

                case 'get_status':
                    const vinStatus = args.vin || await this.getFirstVehicleVin();
                    if (!vinStatus) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getStatus(vinStatus);
                    break;

                case 'get_license_plate':
                    const vinPlate = args.vin || await this.getFirstVehicleVin();
                    if (!vinPlate) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getLicensePlate(vinPlate);
                    break;

                case 'get_firmware_alerts':
                    const vinFirmware = args.vin || await this.getFirstVehicleVin();
                    if (!vinFirmware) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getFirmwareAlerts(vinFirmware);
                    break;

                case 'get_weather':
                    const vinWeather = args.vin || await this.getFirstVehicleVin();
                    if (!vinWeather) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    result = await this.tessieClient.getWeather(vinWeather);
                    break;

                case 'get_driving_history':
                    const vin2 = args.vin || await this.getFirstVehicleVin();
                    if (!vin2) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    const driveOptions = {};
                    if (args.start_date) driveOptions.start = args.start_date;
                    if (args.end_date) driveOptions.end = args.end_date;
                    if (args.limit) driveOptions.limit = args.limit;
                    
                    result = await this.tessieClient.getDrives(vin2, driveOptions);
                    break;

                case 'get_mileage_at_location':
                    const vin3 = args.vin || await this.getFirstVehicleVin();
                    if (!vin3) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    // Get drives and filter by location
                    const locationOptions = {};
                    if (args.start_date) locationOptions.start = args.start_date;
                    if (args.end_date) locationOptions.end = args.end_date;
                    
                    const drivesResponse = await this.tessieClient.getDrives(vin3, locationOptions);
                    const drives = drivesResponse.results || drivesResponse;
                    const locationName = args.location_name?.toLowerCase() || '';
                    
                    const matchingDrives = drives.filter(drive => {
                        const startName = (drive.starting_location || '').toLowerCase();
                        const endName = (drive.ending_location || '').toLowerCase();
                        return startName.includes(locationName) || endName.includes(locationName);
                    });

                    result = {
                        location_query: args.location_name,
                        matching_drives: matchingDrives.length,
                        total_miles: matchingDrives.reduce((sum, drive) => sum + (drive.odometer_distance || 0), 0),
                        drives: matchingDrives
                    };
                    break;

                case 'get_weekly_mileage':
                    const vin4 = args.vin || await this.getFirstVehicleVin();
                    if (!vin4) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    const weekOptions = {};
                    if (args.start_date) weekOptions.start = args.start_date;
                    if (args.end_date) weekOptions.end = args.end_date;
                    
                    const weekDrivesResponse = await this.tessieClient.getDrives(vin4, weekOptions);
                    const weekDrives = weekDrivesResponse.results || weekDrivesResponse;
                    const totalMiles = weekDrives.reduce((sum, drive) => sum + (drive.odometer_distance || 0), 0);
                    
                    result = {
                        period: {
                            start: args.start_date,
                            end: args.end_date
                        },
                        total_drives: weekDrives.length,
                        total_miles: Math.round(totalMiles * 100) / 100,
                        drives: weekDrives
                    };
                    break;

                // Enhanced State Access Handlers
                case 'get_drive_state':
                    const vinDS = args.vin || await this.getFirstVehicleVin();
                    if (!vinDS) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    result = await this.tessieClient.getDriveState(vinDS);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                case 'get_climate_state':
                    const vinCS = args.vin || await this.getFirstVehicleVin();
                    if (!vinCS) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    result = await this.tessieClient.getClimateState(vinCS);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                case 'get_detailed_vehicle_state':
                    const vinDVS = args.vin || await this.getFirstVehicleVin();
                    if (!vinDVS) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    result = await this.tessieClient.getDetailedVehicleState(vinDVS);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                case 'get_charge_state':
                    const vinCHS = args.vin || await this.getFirstVehicleVin();
                    if (!vinCHS) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    result = await this.tessieClient.getChargeState(vinCHS);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                case 'get_gui_settings':
                    const vinGS = args.vin || await this.getFirstVehicleVin();
                    if (!vinGS) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    result = await this.tessieClient.getGuiSettings(vinGS);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                // Advanced Analytics Handlers
                case 'get_efficiency_trends':
                    const vinET = args.vin || await this.getFirstVehicleVin();
                    if (!vinET) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    const effOptions = {};
                    if (args.start) effOptions.start = args.start;
                    if (args.end) effOptions.end = args.end;
                    
                    result = await this.tessieClient.getEfficiencyTrends(vinET, effOptions);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                case 'get_charging_cost_analysis':
                    const vinCCA = args.vin || await this.getFirstVehicleVin();
                    if (!vinCCA) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    const costOptions = {};
                    if (args.start) costOptions.start = args.start;
                    if (args.end) costOptions.end = args.end;
                    
                    result = await this.tessieClient.getChargingCostAnalysis(vinCCA, costOptions);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                case 'get_usage_patterns':
                    const vinUP = args.vin || await this.getFirstVehicleVin();
                    if (!vinUP) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    const usageOptions = {};
                    if (args.start) usageOptions.start = args.start;
                    if (args.end) usageOptions.end = args.end;
                    
                    result = await this.tessieClient.getUsagePatterns(vinUP, usageOptions);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                case 'get_monthly_summary':
                    const vinMS = args.vin || await this.getFirstVehicleVin();
                    if (!vinMS) {
                        this.sendError(message.id, -32000, this.getMultipleVehicleErrorMessage());
                        return;
                    }
                    
                    if (!args.year || !args.month) {
                        this.sendError(message.id, -32602, "Year and month parameters are required");
                        return;
                    }
                    
                    result = await this.tessieClient.getMonthlySummary(vinMS, args.year, args.month);
                    this.sendResponse(message.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
                    break;

                default:
                    this.sendError(message.id, -32601, `Unknown tool: ${name}`);
                    return;
            }

            this.sendResponse(message.id, {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            });

        } catch (error) {
            console.error(`Tool call error: ${error}`);
            this.sendError(message.id, -32000, `Tool execution failed: ${error.message}`);
        }
    }

    async getFirstVehicleVin() {
        try {
            console.error("DEBUG: Getting first vehicle VIN...");
            const response = await this.tessieClient.getVehicles();
            console.error(`DEBUG: Raw response type: ${typeof response}`);
            
            // Handle both formats: {results: [...]} or [...]
            const vehicles = response.results || response;
            console.error(`DEBUG: Found ${vehicles?.length || 0} vehicles`);
            
            if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
                console.error("DEBUG: No vehicles found");
                return null;
            }
            
            // Find active vehicles
            const activeVehicles = vehicles.filter(v => v.is_active === true);
            console.error(`DEBUG: Found ${activeVehicles.length} active vehicles`);
            
            // If exactly one active vehicle, use it
            if (activeVehicles.length === 1) {
                const vin = activeVehicles[0].vin;
                const name = activeVehicles[0].last_state?.vehicle_state?.vehicle_name || 
                           activeVehicles[0].last_state?.vehicle_config?.car_type || 'Unknown';
                console.error(`DEBUG: Using single active vehicle: ${vin} (${name})`);
                return vin;
            }
            
            // If no active vehicles, fall back to first vehicle
            if (activeVehicles.length === 0) {
                const vin = vehicles[0].vin;
                const name = vehicles[0].last_state?.vehicle_state?.vehicle_name || 
                           vehicles[0].last_state?.vehicle_config?.car_type || 'Unknown';
                console.error(`DEBUG: No active vehicles, using first: ${vin} (${name})`);
                return vin;
            }
            
            // Multiple active vehicles - default to first active, but user should specify
            const vin = activeVehicles[0].vin;
            const name = activeVehicles[0].last_state?.vehicle_state?.vehicle_name || 
                       activeVehicles[0].last_state?.vehicle_config?.car_type || 'Unknown';
            console.error(`DEBUG: Multiple active vehicles, defaulting to first: ${vin} (${name})`);
            console.error(`DEBUG: Available vehicles: ${activeVehicles.map(v => 
                `${v.vin} (${v.last_state?.vehicle_state?.vehicle_name || v.last_state?.vehicle_config?.car_type || 'Unknown'})`
            ).join(', ')}`);
            
            // Store info for better error messages
            this.multipleActiveVehicles = activeVehicles.length > 1;
            this.availableVehicles = activeVehicles.map(v => ({
                vin: v.vin,
                name: v.last_state?.vehicle_state?.vehicle_name || v.last_state?.vehicle_config?.car_type || 'Unknown',
                plate: v.plate
            }));
            
            return vin;
            
        } catch (error) {
            console.error(`Error getting first vehicle: ${error}`);
            return null;
        }
    }

    getMultipleVehicleErrorMessage() {
        if (!this.multipleActiveVehicles || !this.availableVehicles) {
            return "No vehicles found in your account";
        }
        
        const vehicleList = this.availableVehicles
            .map(v => `• ${v.name} (VIN: ${v.vin}${v.plate ? `, Plate: ${v.plate}` : ''})`)
            .join('\n');
            
        return `Multiple active vehicles found. Please specify the VIN parameter to choose which vehicle to use:\n\n${vehicleList}\n\nExample: Use "vin": "${this.availableVehicles[0].vin}" in your request.`;
    }

    start() {
        console.error("Starting server...");
        
        let buffer = '';
        
        process.stdin.on('data', (chunk) => {
            buffer += chunk.toString();
            console.error(`Received data chunk: ${chunk.toString().substring(0, 100)}...`);
            
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);
                
                if (line) {
                    try {
                        const message = JSON.parse(line);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error(`Error parsing message: ${error}`);
                    }
                }
            }
        });

        process.stdin.on('end', () => {
            console.error("STDIN ended");
            process.exit(0);
        });

        console.error("Server ready and listening on STDIN");
    }
}

// Start the server
const server = new TessieMCPServer();
server.start();

// Signal handlers
process.on('SIGTERM', () => {
    console.error("Received SIGTERM");
    process.exit(0);
});

process.on('SIGINT', () => {
    console.error("Received SIGINT");
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error("Unhandled rejection:", reason);
    process.exit(1);
});

console.error("=== TESSIE MCP SERVER READY ===");