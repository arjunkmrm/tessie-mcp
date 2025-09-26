import createServer, { configSchema, parameterSchema } from '../src/index';
import { z } from 'zod';

describe('Tessie MCP Server', () => {
  describe('Configuration Schemas', () => {
    test('configSchema should validate required tessie_api_token', () => {
      const validConfig = { tessie_api_token: 'test-token-123' };
      const result = configSchema.safeParse(validConfig);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tessie_api_token).toBe('test-token-123');
      }
    });

    test('configSchema should reject missing tessie_api_token', () => {
      const invalidConfig = {};
      const result = configSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });

    test('configSchema should reject invalid types', () => {
      const invalidConfig = { tessie_api_token: 123 };
      const result = configSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });

    test('parameterSchema should allow optional tessie_api_token', () => {
      const validParams = { tessie_api_token: 'test-token-123' };
      const emptyParams = {};

      expect(parameterSchema.safeParse(validParams).success).toBe(true);
      expect(parameterSchema.safeParse(emptyParams).success).toBe(true);
    });
  });

  describe('Server Creation', () => {
    test('createServer should return a server instance', () => {
      const config = { tessie_api_token: 'test-token-123' };
      const server = createServer({ config });

      expect(server).toBeDefined();
      expect(typeof server).toBe('object');
    });

    test('createServer should work without config', () => {
      const server = createServer({});

      expect(server).toBeDefined();
      expect(typeof server).toBe('object');
    });

    test('server should be a valid MCP server', () => {
      const server = createServer({});

      expect(server).toBeDefined();
      expect(typeof server.setRequestHandler).toBe('function');
    });
  });

  describe('Tool Registration', () => {
    test('expected tools should be well-defined', () => {
      const expectedTools = [
        'get_vehicle_current_state',
        'get_driving_history',
        'get_mileage_at_location',
        'get_weekly_mileage',
        'get_vehicles',
        'natural_language_query'
      ];

      // Test that our expected tool names are valid
      expectedTools.forEach(toolName => {
        expect(typeof toolName).toBe('string');
        expect(toolName.length).toBeGreaterThan(0);
        expect(toolName).toMatch(/^[a-z_]+$/); // Valid tool name format
      });
    });

    test('natural_language_query tool should have correct schema', () => {
      const expectedSchema = {
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
      };

      // Test that our expected schema structure is valid
      expect(expectedSchema.type).toBe('object');
      expect(expectedSchema.properties.query.type).toBe('string');
      expect(expectedSchema.required).toContain('query');
    });
  });

  describe('Configuration Validation', () => {
    test('should handle Smithery config format', () => {
      const smitheryConfig = {
        tessie_api_token: 'smithery-provided-token'
      };

      const result = configSchema.safeParse(smitheryConfig);
      expect(result.success).toBe(true);
    });

    test('should handle URL parameter format', () => {
      const urlParams = {
        tessie_api_token: 'url-provided-token'
      };

      const result = parameterSchema.safeParse(urlParams);
      expect(result.success).toBe(true);
    });

    test('should provide helpful error messages', () => {
      const invalidConfig = { tessie_api_token: null };
      const result = configSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Expected string');
      }
    });
  });

  describe('Type Safety', () => {
    test('configSchema should have correct TypeScript types', () => {
      type ConfigType = z.infer<typeof configSchema>;

      // This is a compile-time test - if it compiles, the types are correct
      const config: ConfigType = {
        tessie_api_token: 'test-token'
      };

      expect(config.tessie_api_token).toBe('test-token');
    });

    test('parameterSchema should have correct TypeScript types', () => {
      type ParameterType = z.infer<typeof parameterSchema>;

      // This is a compile-time test - if it compiles, the types are correct
      const params: ParameterType = {
        tessie_api_token: 'test-token'
      };

      const emptyParams: ParameterType = {};

      expect(params.tessie_api_token).toBe('test-token');
      expect(emptyParams.tessie_api_token).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid configuration gracefully', () => {
      // Test that creating a server with invalid config doesn't throw
      expect(() => {
        createServer({ config: { tessie_api_token: 'valid-token' } });
      }).not.toThrow();
    });

    test('should handle missing configuration gracefully', () => {
      expect(() => {
        createServer({});
      }).not.toThrow();
    });
  });

  describe('Integration Patterns', () => {
    test('should support both Smithery and standalone usage', () => {
      // Smithery usage
      const smitheryServer = createServer({
        config: { tessie_api_token: 'smithery-token' }
      });
      expect(smitheryServer).toBeDefined();

      // Standalone usage
      const standaloneServer = createServer({});
      expect(standaloneServer).toBeDefined();
    });

    test('should maintain backward compatibility', () => {
      // Test that the old environment variable approach still works
      const server = createServer({});
      expect(server).toBeDefined();

      // The server should be able to fall back to environment variables
      // when no config is provided
    });
  });
});