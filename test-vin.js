#!/usr/bin/env node

// Test script to verify VIN resolution works
const { TessieClient } = require('./standalone-tessie.js');

async function testVinResolution() {
    const token = process.env.TESSIE_ACCESS_TOKEN || "test";
    console.log("Testing with token:", token.substring(0, 10) + "...");
    
    const client = new TessieClient(token);
    
    try {
        console.log("Getting vehicles...");
        const vehicles = await client.getVehicles();
        console.log("Raw response:", JSON.stringify(vehicles, null, 2));
        
        // Test the VIN resolution logic
        const vehiclesList = vehicles.results || vehicles;
        console.log("Processed vehicles:", vehiclesList);
        
        if (vehiclesList && vehiclesList.length > 0) {
            const firstVin = vehiclesList[0].vin;
            console.log("First VIN:", firstVin);
        } else {
            console.log("No vehicles found in processed list");
        }
        
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testVinResolution();