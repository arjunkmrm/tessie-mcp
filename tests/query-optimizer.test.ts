import { TessieQueryOptimizer } from '../src/query-optimizer';

describe('TessieQueryOptimizer', () => {
  let optimizer: TessieQueryOptimizer;

  beforeEach(() => {
    optimizer = new TessieQueryOptimizer();
  });

  describe('parseNaturalLanguage', () => {
    test('should parse weekly mileage queries with high confidence', () => {
      const queries = [
        'How many miles did I drive last week?',
        'Show me my weekly mileage for last month',
        'Can you tell me the last month of how many miles I\'ve driven, on a week by week basis?'
      ];

      queries.forEach(query => {
        const result = optimizer.parseNaturalLanguage(query);
        expect(result.operation).toBe('get_weekly_mileage');
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        expect(result.parameters).toHaveProperty('start_date');
        expect(result.parameters).toHaveProperty('end_date');
      });
    });

    test('should parse driving history queries', () => {
      const queries = [
        'Show me my driving history',
        'Give me my driving trip history',
        'Show me my recent driving trips'
      ];

      queries.forEach(query => {
        const result = optimizer.parseNaturalLanguage(query);
        expect(result.operation).toBe('get_driving_history');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
        expect(result.parameters).toHaveProperty('limit', 50);
      });
    });

    test('should parse current state queries', () => {
      const queries = [
        'What is my car\'s current status?',
        'Show me the current state of my vehicle',
        'What\'s happening with my car now?'
      ];

      queries.forEach(query => {
        const result = optimizer.parseNaturalLanguage(query);
        expect(result.operation).toBe('get_vehicle_current_state');
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
        expect(result.parameters).toHaveProperty('use_cache', true);
      });
    });

    test('should parse vehicle list queries', () => {
      const queries = [
        'Show me all my vehicles',
        'List all vehicles in my account',
        'List all my vehicles'
      ];

      queries.forEach(query => {
        const result = optimizer.parseNaturalLanguage(query);
        expect(result.operation).toBe('get_vehicles');
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    test('should return unknown operation for unclear queries', () => {
      const queries = [
        'Hello there',
        'Random text',
        'What is the weather?'
      ];

      queries.forEach(query => {
        const result = optimizer.parseNaturalLanguage(query);
        expect(result.operation).toBe('unknown');
        expect(result.confidence).toBe(0.0);
      });
    });
  });

  describe('extractTimeFrame', () => {
    test('should extract last month correctly', () => {
      const result = optimizer.parseNaturalLanguage('How many miles did I drive last month?');

      const now = new Date();
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);

      const endOfLastMonth = new Date(lastMonth);
      endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1);
      endOfLastMonth.setDate(0);
      endOfLastMonth.setHours(23, 59, 59, 999);

      expect(result.parameters.start_date).toBeDefined();
      expect(result.parameters.end_date).toBeDefined();

      const startDate = new Date(result.parameters.start_date);
      const endDate = new Date(result.parameters.end_date);

      expect(startDate.getDate()).toBe(1); // First day of last month
      expect(startDate.getMonth()).toBe(lastMonth.getMonth());
    });

    test('should extract this week correctly', () => {
      const result = optimizer.parseNaturalLanguage('How many miles have I driven this week?');

      expect(result.parameters.start_date).toBeDefined();
      expect(result.parameters.end_date).toBeDefined();

      const startDate = new Date(result.parameters.start_date);
      const endDate = new Date(result.parameters.end_date);

      // Start should be Monday of current week
      expect(startDate.getDay()).toBe(1); // Monday
    });

    test('should handle custom day ranges', () => {
      const result = optimizer.parseNaturalLanguage('Show me my driving history from the last 14 days');

      expect(result.parameters.start_date).toBeDefined();
      expect(result.parameters.end_date).toBeDefined();

      const startDate = new Date(result.parameters.start_date);
      const endDate = new Date(result.parameters.end_date);
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBeGreaterThanOrEqual(14);
      expect(diffDays).toBeLessThanOrEqual(16); // Allow some tolerance for timezone/calculation differences
    });
  });

  describe('analyzeQuery', () => {
    test('should analyze driving history complexity correctly', () => {
      const metrics = optimizer.analyzeQuery('get_driving_history', {
        limit: 100,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      });

      expect(metrics.complexity).toBeGreaterThan(30);
      expect(metrics.estimatedResponseSize).toBeGreaterThanOrEqual(50);
      expect(metrics.apiCallsRequired).toBeGreaterThan(1);
      expect(metrics.suggestions.some(s => /large date ranges/i.test(s))).toBe(true);
    });

    test('should analyze current state queries as low complexity', () => {
      const metrics = optimizer.analyzeQuery('get_vehicle_current_state', {
        use_cache: true
      });

      expect(metrics.complexity).toBeLessThan(10);
      expect(metrics.estimatedResponseSize).toBeLessThan(5);
      expect(metrics.apiCallsRequired).toBe(1);
    });

    test('should provide suggestions for non-cached queries', () => {
      const metrics = optimizer.analyzeQuery('get_vehicle_current_state', {
        use_cache: false
      });

      expect(metrics.suggestions.some(s => /consider using cache/i.test(s))).toBe(true);
    });
  });

  describe('optimizeForMCP', () => {
    test('should optimize large driving history requests', () => {
      const optimization = optimizer.optimizeForMCP('get_driving_history', {
        limit: 200,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      });

      expect(optimization.isOptimized).toBe(true);
      expect(optimization.optimizedParameters?.limit).toBe(50);
      expect(optimization.recommendations.some(r => /reduced limit/i.test(r))).toBe(true);
    });

    test('should optimize large date ranges for weekly mileage', () => {
      const start = new Date();
      start.setDate(start.getDate() - 60); // 60 days ago
      const end = new Date();

      const optimization = optimizer.optimizeForMCP('get_weekly_mileage', {
        start_date: start.toISOString(),
        end_date: end.toISOString()
      });

      expect(optimization.isOptimized).toBe(true);
      expect(optimization.recommendations.some(r => /30-day window/i.test(r))).toBe(true);
    });

    test('should enable cache for current state queries', () => {
      const optimization = optimizer.optimizeForMCP('get_vehicle_current_state', {
        use_cache: false
      });

      expect(optimization.isOptimized).toBe(true);
      expect(optimization.optimizedParameters?.use_cache).toBe(true);
      expect(optimization.recommendations.some(r => /enabled cache/i.test(r))).toBe(true);
    });

    test('should not optimize already optimal queries', () => {
      const optimization = optimizer.optimizeForMCP('get_vehicle_current_state', {
        use_cache: true
      });

      expect(optimization.isOptimized).toBe(false);
      expect(optimization.originalComplexity).toBe(optimization.optimizedComplexity);
    });
  });

  describe('field weights', () => {
    test('should have realistic size estimates for different field types', () => {
      const { TESSIE_FIELD_WEIGHTS } = require('../src/query-optimizer');

      // Lightweight fields
      expect(TESSIE_FIELD_WEIGHTS.vin.estimatedSizeKB).toBeLessThan(0.1);
      expect(TESSIE_FIELD_WEIGHTS.battery_level.estimatedSizeKB).toBeLessThan(0.1);

      // Medium fields
      expect(TESSIE_FIELD_WEIGHTS.latitude.estimatedSizeKB).toBeLessThan(1);
      expect(TESSIE_FIELD_WEIGHTS.address.estimatedSizeKB).toBeLessThan(1);

      // Heavy fields
      expect(TESSIE_FIELD_WEIGHTS.drives.estimatedSizeKB).toBeGreaterThan(10);
      expect(TESSIE_FIELD_WEIGHTS.detailed_history.estimatedSizeKB).toBeGreaterThan(50);
    });

    test('should have appropriate complexity scores', () => {
      const { TESSIE_FIELD_WEIGHTS } = require('../src/query-optimizer');

      // Simple fields should have low complexity
      expect(TESSIE_FIELD_WEIGHTS.vin.complexity).toBeLessThan(5);
      expect(TESSIE_FIELD_WEIGHTS.locked.complexity).toBeLessThan(5);

      // Complex fields should have high complexity
      expect(TESSIE_FIELD_WEIGHTS.drives.complexity).toBeGreaterThan(20);
      expect(TESSIE_FIELD_WEIGHTS.detailed_history.complexity).toBeGreaterThan(30);
    });
  });
});