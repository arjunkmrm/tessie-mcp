#!/usr/bin/env node

// Completely standalone MCP server - no external dependencies
console.error("=== STANDALONE MCP SERVER STARTING ===");

// Basic MCP Server implementation without external dependencies
class StandaloneMCPServer {
    constructor() {
        this.requestId = 0;
        console.error("Server instance created");
    }

    sendResponse(id, result) {
        const response = {
            jsonrpc: "2.0",
            id: id,
            result: result
        };
        console.log(JSON.stringify(response));
        console.error(`Sent response: ${JSON.stringify(response)}`);
    }

    sendError(id, code, message) {
        const response = {
            jsonrpc: "2.0",
            id: id,
            error: { code: code, message: message }
        };
        console.log(JSON.stringify(response));
        console.error(`Sent error: ${JSON.stringify(response)}`);
    }

    handleMessage(message) {
        console.error(`Handling message: ${JSON.stringify(message)}`);
        
        try {
            if (message.method === 'initialize') {
                this.sendResponse(message.id, {
                    protocolVersion: "2025-06-18",
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: "standalone-tessie",
                        version: "1.0.0"
                    }
                });
            } else if (message.method === 'tools/list') {
                this.sendResponse(message.id, {
                    tools: [
                        {
                            name: "test",
                            description: "Test tool",
                            inputSchema: {
                                type: "object",
                                properties: {}
                            }
                        }
                    ]
                });
            } else {
                this.sendError(message.id, -32601, `Method not found: ${message.method}`);
            }
        } catch (error) {
            console.error(`Error handling message: ${error}`);
            this.sendError(message.id, -32603, `Internal error: ${error.message}`);
        }
    }

    start() {
        console.error("Starting server...");
        
        let buffer = '';
        
        process.stdin.on('data', (chunk) => {
            buffer += chunk.toString();
            console.error(`Received data: ${chunk.toString()}`);
            
            // Process complete messages
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
const server = new StandaloneMCPServer();
server.start();

// Keep process alive
process.on('SIGTERM', () => {
    console.error("Received SIGTERM");
    process.exit(0);
});

process.on('SIGINT', () => {
    console.error("Received SIGINT");
    process.exit(0);
});

console.error("=== STANDALONE SERVER READY ===");