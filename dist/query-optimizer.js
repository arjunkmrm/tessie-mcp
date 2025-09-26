"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TessieQueryOptimizer = exports.TESSIE_FIELD_WEIGHTS = void 0;
// Field weights for Tessie API responses
exports.TESSIE_FIELD_WEIGHTS = {
    // Lightweight fields
    'vin': { estimatedSizeKB: 0.05, complexity: 1 },
    'display_name': { estimatedSizeKB: 0.1, complexity: 1 },
    'odometer': { estimatedSizeKB: 0.05, complexity: 1 },
    'battery_level': { estimatedSizeKB: 0.05, complexity: 1 },
    'charging_state': { estimatedSizeKB: 0.1, complexity: 1 },
    'locked': { estimatedSizeKB: 0.02, complexity: 1 },
    // Medium fields
    'latitude': { estimatedSizeKB: 0.1, complexity: 2 },
    'longitude': { estimatedSizeKB: 0.1, complexity: 2 },
    'address': { estimatedSizeKB: 0.5, complexity: 3 },
    // Heavy fields - driving data
    'drives': { estimatedSizeKB: 50, complexity: 30 },
    'charging_sessions': { estimatedSizeKB: 25, complexity: 20 },
    'detailed_history': { estimatedSizeKB: 100, complexity: 40 },
};
class TessieQueryOptimizer {
    analyzeQuery(operation, parameters, estimatedResults = 1) {
        let complexity = 1;
        let estimatedSize = 1; // KB
        let apiCalls = 1;
        const suggestions = [];
        switch (operation) {
            case 'get_driving_history':
                complexity = 30;
                estimatedSize = 50 * estimatedResults;
                apiCalls = 1;
                if (parameters.limit && parameters.limit > 100) {
                    suggestions.push('Consider reducing limit to 100 or less for better performance');
                    complexity += 10;
                }
                const dateRange = this.calculateDateRange(parameters.start_date, parameters.end_date);
                if (dateRange > 90) {
                    suggestions.push('Large date ranges may cause timeouts. Consider smaller chunks.');
                    complexity += 20;
                    apiCalls = Math.ceil(dateRange / 30); // Suggest monthly chunks
                }
                break;
            case 'get_weekly_mileage':
                complexity = 35;
                estimatedSize = 30 * estimatedResults;
                apiCalls = 1;
                const weeklyRange = this.calculateDateRange(parameters.start_date, parameters.end_date);
                if (weeklyRange > 30) {
                    suggestions.push('Weekly breakdowns work best for 1-month periods');
                    complexity += 15;
                }
                break;
            case 'get_vehicle_current_state':
                complexity = 5;
                estimatedSize = 2;
                apiCalls = 1;
                if (parameters.use_cache === false) {
                    suggestions.push('Consider using cache to avoid waking the vehicle');
                    complexity += 5;
                }
                break;
            case 'analyze_latest_drive':
                complexity = 40; // High complexity due to drive merging and analysis
                estimatedSize = 25; // Medium size due to comprehensive analysis
                apiCalls = 1;
                if (parameters.days_back && parameters.days_back > 7) {
                    suggestions.push('Consider limiting search to 7 days for faster analysis');
                    complexity += 10;
                }
                break;
            default:
                complexity = 10;
                estimatedSize = 5;
        }
        return {
            estimatedResponseSize: estimatedSize,
            complexity,
            apiCallsRequired: apiCalls,
            suggestions
        };
    }
    optimizeForMCP(operation, parameters) {
        const originalMetrics = this.analyzeQuery(operation, parameters);
        let optimizedParams = { ...parameters };
        const recommendations = [];
        // Apply optimizations based on operation
        switch (operation) {
            case 'get_driving_history':
                if (!parameters.limit || parameters.limit > 50) {
                    optimizedParams.limit = 50;
                    recommendations.push('Reduced limit to 50 for optimal MCP performance');
                }
                // Auto-chunk large date ranges
                const dateRange = this.calculateDateRange(parameters.start_date, parameters.end_date);
                if (dateRange > 30) {
                    optimizedParams.chunked = true;
                    recommendations.push('Large date range will be automatically chunked');
                }
                break;
            case 'get_weekly_mileage':
                // Ensure reasonable time window
                const weeklyRange = this.calculateDateRange(parameters.start_date, parameters.end_date);
                if (weeklyRange > 30) {
                    const endDate = new Date(parameters.start_date);
                    endDate.setDate(endDate.getDate() + 30);
                    optimizedParams.end_date = endDate.toISOString();
                    recommendations.push('Limited to 30-day window for weekly breakdown');
                }
                break;
            case 'get_vehicle_current_state':
                if (parameters.use_cache === false) {
                    optimizedParams.use_cache = true;
                    recommendations.push('Enabled cache to prevent vehicle wake-up');
                }
                break;
            case 'analyze_latest_drive':
                // Optimize days_back parameter
                if (!parameters.days_back || parameters.days_back > 14) {
                    optimizedParams.days_back = 7;
                    recommendations.push('Limited search to 7 days for optimal performance');
                }
                break;
        }
        const optimizedMetrics = this.analyzeQuery(operation, optimizedParams);
        return {
            isOptimized: optimizedMetrics.complexity < originalMetrics.complexity,
            originalComplexity: originalMetrics.complexity,
            optimizedComplexity: optimizedMetrics.complexity,
            recommendations: [...originalMetrics.suggestions, ...recommendations],
            optimizedParameters: optimizedParams
        };
    }
    calculateDateRange(startDate, endDate) {
        if (!startDate || !endDate)
            return 7; // Default 1 week
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
    }
    // Parse natural language queries
    parseNaturalLanguage(query) {
        const lowerQuery = query.toLowerCase();
        // Drive analysis patterns - check first for most specific matches
        if ((lowerQuery.includes('latest') || lowerQuery.includes('last') || lowerQuery.includes('recent')) &&
            (lowerQuery.includes('drive') || lowerQuery.includes('trip')) &&
            (lowerQuery.includes('analyz') || lowerQuery.includes('detail') || lowerQuery.includes('how long') ||
                lowerQuery.includes('battery') || lowerQuery.includes('fsd') || lowerQuery.includes('duration'))) {
            const daysBack = lowerQuery.includes('yesterday') ? 2 :
                lowerQuery.includes('today') ? 1 : 7;
            return {
                operation: 'analyze_latest_drive',
                parameters: { days_back: daysBack },
                confidence: 0.95
            };
        }
        // Post-drive analysis patterns
        if ((lowerQuery.includes('finish') || lowerQuery.includes('completed') || lowerQuery.includes('just drove')) &&
            (lowerQuery.includes('how long') || lowerQuery.includes('battery') || lowerQuery.includes('duration') ||
                lowerQuery.includes('analyz') || lowerQuery.includes('fsd'))) {
            return {
                operation: 'analyze_latest_drive',
                parameters: { days_back: 1 },
                confidence: 0.9
            };
        }
        // Enhanced weekly/monthly mileage patterns
        if ((lowerQuery.includes('week') || lowerQuery.includes('month')) &&
            (lowerQuery.includes('mile') || lowerQuery.includes('driv'))) {
            const timeFrame = this.extractTimeFrame(query);
            // Check for "week by week" or "weekly breakdown" patterns
            if (lowerQuery.includes('week by week') || lowerQuery.includes('weekly breakdown') ||
                lowerQuery.includes('break') || lowerQuery.includes('basis')) {
                return {
                    operation: 'get_weekly_mileage',
                    parameters: timeFrame,
                    confidence: 0.95
                };
            }
            return {
                operation: 'get_weekly_mileage',
                parameters: timeFrame,
                confidence: 0.9
            };
        }
        // Driving history patterns
        if (lowerQuery.includes('driv') && (lowerQuery.includes('history') || lowerQuery.includes('trip'))) {
            const timeFrame = this.extractTimeFrame(query);
            return {
                operation: 'get_driving_history',
                parameters: { ...timeFrame, limit: 50 },
                confidence: 0.8
            };
        }
        // Location-based queries
        if (lowerQuery.includes('location') || lowerQuery.includes('place') || lowerQuery.includes('where')) {
            const timeFrame = this.extractTimeFrame(query);
            // This would require location extraction logic
            return {
                operation: 'get_mileage_at_location',
                parameters: { ...timeFrame, location: 'extracted_location' },
                confidence: 0.6
            };
        }
        // Current state patterns
        if (lowerQuery.includes('current') || lowerQuery.includes('now') || lowerQuery.includes('status')) {
            return {
                operation: 'get_vehicle_current_state',
                parameters: { use_cache: true },
                confidence: 0.8
            };
        }
        // Vehicle list patterns
        if (lowerQuery.includes('vehicle') && (lowerQuery.includes('list') || lowerQuery.includes('all'))) {
            return {
                operation: 'get_vehicles',
                parameters: {},
                confidence: 0.8
            };
        }
        return {
            operation: 'unknown',
            parameters: {},
            confidence: 0.0
        };
    }
    extractTimeFrame(query) {
        const now = new Date();
        const lowerQuery = query.toLowerCase();
        // Last month patterns
        if (lowerQuery.includes('last month') || lowerQuery.includes('previous month')) {
            const lastMonth = new Date(now);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            lastMonth.setDate(1);
            lastMonth.setHours(0, 0, 0, 0);
            const endOfLastMonth = new Date(lastMonth);
            endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1);
            endOfLastMonth.setDate(0);
            endOfLastMonth.setHours(23, 59, 59, 999);
            return {
                start_date: lastMonth.toISOString(),
                end_date: endOfLastMonth.toISOString()
            };
        }
        // This month patterns
        if (lowerQuery.includes('this month') || lowerQuery.includes('current month')) {
            const startOfMonth = new Date(now);
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            return {
                start_date: startOfMonth.toISOString(),
                end_date: now.toISOString()
            };
        }
        // Last week patterns
        if (lowerQuery.includes('last week') || lowerQuery.includes('previous week')) {
            const lastWeek = new Date(now);
            lastWeek.setDate(lastWeek.getDate() - 7);
            lastWeek.setHours(0, 0, 0, 0);
            return {
                start_date: lastWeek.toISOString(),
                end_date: now.toISOString()
            };
        }
        // This week patterns
        if (lowerQuery.includes('this week')) {
            const startOfWeek = new Date(now);
            const dayOfWeek = startOfWeek.getDay();
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start
            startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
            startOfWeek.setHours(0, 0, 0, 0);
            return {
                start_date: startOfWeek.toISOString(),
                end_date: now.toISOString()
            };
        }
        // Last X days patterns
        const lastDaysMatch = lowerQuery.match(/last (\d+) days?/);
        if (lastDaysMatch) {
            const days = parseInt(lastDaysMatch[1]);
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);
            return {
                start_date: startDate.toISOString(),
                end_date: now.toISOString()
            };
        }
        // Today
        if (lowerQuery.includes('today')) {
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            return {
                start_date: startOfDay.toISOString(),
                end_date: now.toISOString()
            };
        }
        // Yesterday
        if (lowerQuery.includes('yesterday')) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const endYesterday = new Date(yesterday);
            endYesterday.setHours(23, 59, 59, 999);
            return {
                start_date: yesterday.toISOString(),
                end_date: endYesterday.toISOString()
            };
        }
        // Default to last 30 days
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return {
            start_date: thirtyDaysAgo.toISOString(),
            end_date: now.toISOString()
        };
    }
}
exports.TessieQueryOptimizer = TessieQueryOptimizer;
//# sourceMappingURL=query-optimizer.js.map