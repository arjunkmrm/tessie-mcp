#!/usr/bin/env node

// Minimal test server to debug the issue
console.error("=== MINIMAL TEST SERVER STARTING ===");

try {
  console.error("1. Basic console.error working");
  
  // Test if we can require the MCP SDK
  console.error("2. Attempting to require MCP SDK...");
  const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
  const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
  console.error("3. MCP SDK loaded successfully");

  // Create basic server
  console.error("4. Creating server instance...");
  const server = new Server({
    name: 'minimal-test',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: {},
    },
  });
  console.error("5. Server instance created");

  // Set up basic transport
  console.error("6. Creating transport...");
  const transport = new StdioServerTransport();
  console.error("7. Transport created");

  // Connect
  console.error("8. Connecting server...");
  server.connect(transport).then(() => {
    console.error("9. Server connected successfully!");
  }).catch((error) => {
    console.error("9. ERROR connecting server:", error);
    process.exit(1);
  });

} catch (error) {
  console.error("FATAL ERROR:", error);
  process.exit(1);
}