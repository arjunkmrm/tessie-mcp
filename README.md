# Tessie MCP Extension for Claude Desktop

A comprehensive Tesla vehicle data access extension for Claude Desktop through the [Tessie API](https://tessie.com). This extension provides 22+ tools for accessing all aspects of your Tesla vehicle data including battery status, charging information, driving history, location data, weather conditions, and much more.

## Features

- **Complete Tesla Data Access**: All Tessie API GET endpoints for vehicle data
- **Smart VIN Resolution**: Automatically detects and uses your active vehicle
- **22+ Tools Available**: Battery, charging, driving, location, weather, tire pressure, consumption, and more
- **Real-time Data**: Access current vehicle status and historical data
- **Secure**: API token stored securely in Claude Desktop configuration

## Installation

### Prerequisites

- [Claude Desktop](https://claude.ai/download) v0.10.0 or later
- A [Tessie](https://tessie.com) account with API access
- Your Tessie API token from https://tessie.com

### Install the Extension

1. Download the `tessie.mcpb` file from this repository
2. Double-click the `.mcpb` file to install it in Claude Desktop
3. Enable the extension in Claude Desktop settings
4. Configure your Tessie API token when prompted

### Configuration

The extension requires your Tessie API token to function. You can get your token from:
1. Log into your Tessie account at https://tessie.com
2. Navigate to your API settings
3. Copy your API token
4. Enter it in the Claude Desktop extension configuration

## Available Tools

### Vehicle Information
- **get_vehicles**: List all vehicles in your Tessie account
- **get_vehicle_status**: Get comprehensive vehicle status
- **get_vehicle_config**: Get vehicle configuration details
- **get_gui_settings**: Get GUI settings and preferences
- **get_mobile_enabled**: Check if mobile access is enabled
- **get_nearby_charging_sites**: Find nearby charging locations

### Battery & Charging
- **get_battery_health**: Get battery health information (global endpoint)
- **get_charge_state**: Get current charging state and battery level
- **get_charging_history**: Get historical charging sessions
- **get_charging_invoices**: Get charging cost invoices

### Location & Driving
- **get_location**: Get current vehicle location
- **get_driving_history**: Get driving history and trip data  
- **get_mileage_at_location**: Get mileage data at specific locations

### Climate & Weather
- **get_climate_state**: Get HVAC and climate control status
- **get_weather**: Get weather conditions at vehicle location

### Vehicle Details
- **get_license_plate**: Get vehicle license plate information
- **get_tire_pressure**: Get current tire pressure readings
- **get_consumption**: Get energy consumption since last charge
- **get_speed_limit**: Get current speed limit information

### Alerts & Service
- **get_latest_alert**: Get the most recent vehicle alert
- **get_service_data**: Get vehicle service information

## Usage Examples

Once installed, you can use the tools in Claude Desktop by asking questions like:

- "What's my Tesla's current battery level?"
- "Show me my recent driving history"
- "Where is my car located right now?"
- "What's the weather like where my Tesla is parked?"
- "How much did my last charging session cost?"
- "What's my tire pressure?"

Claude will automatically use the appropriate Tessie tools to get the information you need.

## Smart VIN Resolution

The extension automatically handles vehicle identification:

- **Single Active Vehicle**: If you have one active Tesla, it's used automatically
- **Multiple Vehicles**: If you have multiple active vehicles, you'll be prompted to choose
- **No Active Vehicles**: Clear error messages if no vehicles are available

## API Coverage

This extension implements all GET endpoints under "Vehicle Data" from the official [Tessie API documentation](https://developer.tessie.com/reference/about):

- All vehicle information endpoints
- Complete battery and charging data
- Full location and driving history
- Climate and weather information
- Vehicle configuration and settings
- Service and alert data
- Tire pressure and consumption metrics

## Security

- API tokens are stored securely in Claude Desktop's configuration
- No hardcoded credentials in the extension code
- All API communication uses HTTPS
- Tokens are passed via environment variables

## Requirements

- **Node.js**: v18.0.0 or later
- **Claude Desktop**: v0.10.0 or later  
- **Platforms**: macOS, Windows, Linux
- **Tessie Account**: Active subscription with API access

## Troubleshooting

### Extension Not Running
- Check that you've enabled the extension in Claude Desktop settings
- Verify your Tessie API token is correctly configured
- Try disabling and re-enabling the extension

### API Errors
- Ensure your Tessie API token is valid and hasn't expired
- Check that your Tesla is connected to Tessie
- Verify your Tesla is awake (some operations require the vehicle to be active)

### No Vehicles Found
- Make sure your Tesla is linked to your Tessie account
- Check that the vehicle status shows as "active" in Tessie
- Try refreshing your vehicle connection in Tessie

## Development

The extension is built as a Node.js MCP (Model Context Protocol) server with:

- **TessieClient**: Handles all API communication with Tessie
- **TessieMCPServer**: Implements the MCP protocol for Claude Desktop
- **Smart Error Handling**: Comprehensive error messages and fallbacks
- **Zero Dependencies**: No external npm packages required

## License

MIT License - see LICENSE file for details.

## Support

For issues with the extension:
1. Check the troubleshooting section above
2. Verify your Tessie account and API token
3. Check Claude Desktop logs for detailed error messages

For Tessie API questions, visit the [official Tessie documentation](https://developer.tessie.com/).

---

**Note**: This extension requires a Tessie account and active API access. Tessie is a third-party service that provides enhanced Tesla vehicle data access. Visit [tessie.com](https://tessie.com) to learn more.