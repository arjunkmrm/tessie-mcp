# Tessie MCP Extension for Claude Desktop v0.1.6

An advanced Tesla analytics platform for Claude Desktop through the [Tessie API](https://tessie.com). This extension provides 39+ tools for comprehensive vehicle data access, advanced analytics, experimental FSD detection, and data export capabilities.

## 🆕 What's New in v0.1.6

- **Experimental FSD Detection**: Pattern-based estimation of Full Self-Driving usage (unverified, for analysis purposes)
- **Data Export Tools**: Tax mileage reports, charging cost spreadsheets, comprehensive analytics exports
- **Advanced Insights**: FSD vs manual efficiency comparisons and usage pattern analysis  
- **39+ Tools**: Expanded from 31 to 39 comprehensive tools (8 new tools added)

## Features

- **Complete Tesla Data Access**: All Tessie API GET endpoints for vehicle data
- **Advanced Analytics**: Efficiency trends, cost analysis, usage patterns over time
- **Enhanced State Access**: Detailed driving, climate, and vehicle state information  
- **Smart VIN Resolution**: Automatically detects and uses your active vehicle
- **31+ Tools Available**: Battery, charging, driving, location, weather, analytics, and more
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

### Enhanced State Access
- **get_drive_state**: Detailed driving state with speed, heading, GPS, active route
- **get_climate_state**: Comprehensive HVAC, seat heaters, cabin temperature data
- **get_detailed_vehicle_state**: Complete vehicle state - doors, windows, locks, odometer, software
- **get_charge_state**: Advanced charging state with schedules and detailed metrics
- **get_gui_settings**: User interface settings, units, time format, display preferences

### Advanced Analytics & Insights
- **get_efficiency_trends**: Analyze driving efficiency over time with daily breakdowns
- **get_charging_cost_analysis**: Cost analysis by charging location (home/supercharger/public)
- **get_usage_patterns**: Driving patterns by day of week and hour of day
- **get_monthly_summary**: Comprehensive monthly driving and charging summary reports

### Experimental FSD Detection (**New in v0.1.6**)
- **analyze_drive_fsd_probability**: Estimate FSD usage likelihood for individual drives
- **get_fsd_usage_summary**: Period-based FSD usage estimation with confidence scores
- **compare_fsd_manual_efficiency**: Compare efficiency between estimated FSD and manual driving

### Data Export Tools (**New in v0.1.6**)
- **export_tax_mileage_report**: Generate tax-ready mileage reports with monthly breakdowns
- **export_charging_cost_spreadsheet**: Detailed charging cost analysis in spreadsheet format
- **export_fsd_detection_report**: Comprehensive FSD analysis with methodology and confidence scores

## Usage Examples

### Basic Vehicle Information
- "What's my Tesla's current battery level?"
- "Show me my recent driving history"
- "Where is my car located right now?"
- "What's the weather like where my Tesla is parked?"
- "What's my tire pressure?"

### Advanced Analytics (**New in v0.1.5**)
- "Show me my driving efficiency trends for the last 3 months"
- "Analyze my charging costs by location type"
- "What are my driving usage patterns by day of the week?"
- "Give me a comprehensive summary for September 2024"
- "How much am I spending on home charging vs supercharging?"

### Detailed State Information
- "Show me detailed climate control settings"
- "What's my current driving state and speed?"
- "Give me complete vehicle state including doors and windows"
- "Show me advanced charging state with schedules"

### FSD Detection & Analysis (**New in v0.1.6**)
- "Analyze my recent drives for FSD usage probability" 
- "What percentage of my driving might have been on FSD this month?"
- "Compare my efficiency when using FSD vs manual driving"
- "Generate a comprehensive FSD detection report"

### Data Export (**New in v0.1.6**)
- "Export my 2024 mileage data for tax purposes"
- "Create a spreadsheet of all my charging costs this year"
- "Generate a comprehensive FSD usage analysis report"

Claude will automatically use the appropriate Tessie tools to get the information you need.

## Smart VIN Resolution

The extension automatically handles vehicle identification:

- **Single Active Vehicle**: If you have one active Tesla, it's used automatically
- **Multiple Vehicles**: If you have multiple active vehicles, you'll be prompted to choose
- **No Active Vehicles**: Clear error messages if no vehicles are available

## Experimental FSD Detection

**⚠️ Important Disclaimer**: The FSD detection feature is experimental and provides **estimates only**. It is not verified by Tesla or Tessie and should not be considered accurate for official purposes.

### How It Works

The extension analyzes driving patterns to estimate when Full Self-Driving might have been active:

- **Speed Consistency**: FSD maintains very consistent speeds, especially on highways
- **Heading Smoothness**: FSD produces smooth, predictable steering patterns  
- **Route Characteristics**: FSD is more commonly used on highways and longer trips
- **Duration Analysis**: FSD usage typically correlates with longer drive segments

### Confidence Scoring

Each analysis receives a confidence score (0-100%):
- **80-100**: Very High - Strong FSD-like patterns detected
- **60-79**: High - Likely FSD usage based on multiple indicators
- **40-59**: Moderate - Mixed signals, uncertain
- **20-39**: Low - Likely manual driving
- **0-19**: Very Low - Manual driving patterns

### Limitations

- **No Ground Truth**: Tesla doesn't provide official FSD usage data
- **Pattern-Based Only**: Analysis relies on driving patterns, not direct FSD status
- **Individual Variation**: Driving styles vary; what looks like FSD for one person might be manual for another
- **External Factors**: Weather, traffic, and road conditions can affect patterns
- **Experimental Feature**: This is a research tool, not a definitive measurement

Use FSD detection results for personal analysis and insights, but don't rely on them for anything requiring precision.

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