#!/usr/bin/env node
import { z } from 'zod';
export declare const configSchema: z.ZodObject<{
    tessie_api_token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tessie_api_token: string;
}, {
    tessie_api_token: string;
}>;
declare class TessieMcpServer {
    private server;
    private tessieClient;
    private config;
    constructor(config?: z.infer<typeof configSchema>);
    private setupErrorHandling;
    private setupToolHandlers;
    private handleGetVehicleCurrentState;
    private handleGetDrivingHistory;
    private handleGetMileageAtLocation;
    private handleGetWeeklyMileage;
    private handleGetVehicles;
    private groupDrivesByDay;
    run(): Promise<void>;
}
export default function ({ config }: {
    config?: z.infer<typeof configSchema>;
}): {
    start(): Promise<TessieMcpServer>;
    stop(): Promise<void>;
};
export {};
//# sourceMappingURL=index.d.ts.map