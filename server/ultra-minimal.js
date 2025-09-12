#!/usr/bin/env node

console.error("=== ULTRA MINIMAL SERVER ===");
console.error("Process started successfully");

// Just keep the process alive
process.stdin.resume();

// Log any input
process.stdin.on('data', (data) => {
  console.error("Received input:", data.toString());
});

// Handle termination
process.on('SIGTERM', () => {
  console.error("Received SIGTERM, exiting");
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error("Received SIGINT, exiting");
  process.exit(0);
});

console.error("Ultra minimal server ready and waiting...");