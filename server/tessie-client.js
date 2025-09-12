"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TessieClient = void 0;
const axios_1 = __importDefault(require("axios"));
class TessieClient {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.client = axios_1.default.create({
            baseURL: 'https://api.tessie.com',
            timeout: 30000,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async getVehicleState(vin, useCache = true) {
        try {
            const response = await this.client.get(`/${vin}/state${useCache ? '?use_cache=true' : ''}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get vehicle state: ${error}`);
        }
    }
    async getVehicleStates(vin, startDate, endDate) {
        try {
            const params = new URLSearchParams();
            if (startDate)
                params.append('start', startDate);
            if (endDate)
                params.append('end', endDate);
            const response = await this.client.get(`/${vin}/states?${params.toString()}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get vehicle states: ${error}`);
        }
    }
    async getVehicleLocation(vin) {
        try {
            const response = await this.client.get(`/${vin}/location`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get vehicle location: ${error}`);
        }
    }
    async getDrives(vin, startDate, endDate, limit = 50) {
        try {
            const params = new URLSearchParams();
            if (startDate)
                params.append('start', startDate);
            if (endDate)
                params.append('end', endDate);
            params.append('limit', limit.toString());
            const response = await this.client.get(`/${vin}/drives?${params.toString()}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get drives: ${error}`);
        }
    }
    async getDrivingPath(vin, startDate, endDate) {
        try {
            const params = new URLSearchParams();
            params.append('start', startDate);
            params.append('end', endDate);
            const response = await this.client.get(`/${vin}/path?${params.toString()}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get driving path: ${error}`);
        }
    }
    async getVehicles() {
        try {
            const response = await this.client.get('/vehicles');
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get vehicles: ${error}`);
        }
    }
}
exports.TessieClient = TessieClient;
//# sourceMappingURL=tessie-client.js.map