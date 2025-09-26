#!/usr/bin/env node

/**
 * Tessie MCP Server - Optimized Version
 * Provides Tesla vehicle data access through Tessie API
 * Features:
 * - Natural language query processing with high confidence parsing
 * - Query optimization and intelligent caching
 * - Performance metrics and response optimization
 * - Comprehensive error handling with user-friendly messages
 * - Support for weekly/monthly breakdowns and time-based analysis
 */

// Load required modules
const createServer = require('./dist/index.js').default;
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

// Configuration
const config = {};

// Get API token from environment
if (process.env.tessie_api_token) {
  config.tessie_api_token = process.env.tessie_api_token;
} else if (process.env.TESSIE_ACCESS_TOKEN) {
  config.tessie_api_token = process.env.TESSIE_ACCESS_TOKEN;
}

// Validate configuration
if (!config.tessie_api_token) {
  console.error('Error: Tessie API token required.');
  console.error('Configure it in your MCP client settings or set TESSIE_ACCESS_TOKEN environment variable');
  console.error('Get your token from: https://my.tessie.com/settings/api');
  process.exit(1);
}

// Create and start the optimized server
async function main() {
  try {
    const server = createServer({ config });
    const transport = new StdioServerTransport();

    await server.connect(transport);

    console.error('🚗 Tessie MCP Server (Optimized) running on stdio');
    console.error('✨ Features: Natural Language Queries, Query Optimization, Performance Analytics');
    console.error('🎯 Try queries like: "How many miles did I drive last week on a daily basis?"');
    console.error('📊 Supports: Current state, driving history, mileage analysis, location tracking');

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}