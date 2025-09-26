export interface QueryMetrics {
    estimatedResponseSize: number;
    complexity: number;
    apiCallsRequired: number;
    suggestions: string[];
}
export interface OptimizedQuery {
    isOptimized: boolean;
    originalComplexity: number;
    optimizedComplexity: number;
    recommendations: string[];
    optimizedParameters?: any;
}
export declare const TESSIE_FIELD_WEIGHTS: {
    vin: {
        estimatedSizeKB: number;
        complexity: number;
    };
    display_name: {
        estimatedSizeKB: number;
        complexity: number;
    };
    odometer: {
        estimatedSizeKB: number;
        complexity: number;
    };
    battery_level: {
        estimatedSizeKB: number;
        complexity: number;
    };
    charging_state: {
        estimatedSizeKB: number;
        complexity: number;
    };
    locked: {
        estimatedSizeKB: number;
        complexity: number;
    };
    latitude: {
        estimatedSizeKB: number;
        complexity: number;
    };
    longitude: {
        estimatedSizeKB: number;
        complexity: number;
    };
    address: {
        estimatedSizeKB: number;
        complexity: number;
    };
    drives: {
        estimatedSizeKB: number;
        complexity: number;
    };
    charging_sessions: {
        estimatedSizeKB: number;
        complexity: number;
    };
    detailed_history: {
        estimatedSizeKB: number;
        complexity: number;
    };
};
export declare class TessieQueryOptimizer {
    analyzeQuery(operation: string, parameters: any, estimatedResults?: number): QueryMetrics;
    optimizeForMCP(operation: string, parameters: any): OptimizedQuery;
    private calculateDateRange;
    parseNaturalLanguage(query: string): {
        operation: string;
        parameters: any;
        confidence: number;
    };
    private extractTimeFrame;
}
//# sourceMappingURL=query-optimizer.d.ts.map