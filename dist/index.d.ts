#!/usr/bin/env node
declare class TessieMcpServer {
    private server;
    private tessieClient;
    constructor();
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
    config?: any;
}): {
    start(): Promise<TessieMcpServer>;
    stop(): Promise<void>;
};
export {};
//# sourceMappingURL=index.d.ts.map