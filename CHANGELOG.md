# Changelog

All notable changes to the Tessie MCP Extension will be documented in this file.

## [v0.1.7] - 2024-12-XX

### Added
- Complete Tesla Analytics Platform

## [v0.1.6] - 2024-12-XX

### Added
- **Experimental FSD Detection**: Pattern-based estimation of Full Self-Driving usage (unverified, for analysis purposes)
- **Data Export Tools**: Tax mileage reports, charging cost spreadsheets, comprehensive analytics exports
- **Advanced Insights**: FSD vs manual efficiency comparisons and usage pattern analysis  
- **39+ Tools**: Expanded from 31 to 39 comprehensive tools (8 new tools added)

### New Tools
- `analyze_drive_fsd_probability`: Estimate FSD usage likelihood for individual drives
- `get_fsd_usage_summary`: Period-based FSD usage estimation with confidence scores
- `compare_fsd_manual_efficiency`: Compare efficiency between estimated FSD and manual driving
- `export_tax_mileage_report`: Generate tax-ready mileage reports with monthly breakdowns
- `export_charging_cost_spreadsheet`: Detailed charging cost analysis in spreadsheet format
- `export_fsd_detection_report`: Comprehensive FSD analysis with methodology and confidence scores

### Features
- FSD Detection with confidence scoring (0-100%)
- Comprehensive data export capabilities
- Enhanced analytics for driving patterns

### Important Notes
- FSD detection is experimental and provides estimates only
- Not verified by Tesla or Tessie - for analysis purposes only

## [v0.1.5] - 2024-12-XX

### Added
- **Advanced Analytics**: Efficiency trends, cost analysis, usage patterns over time
- **Enhanced State Access**: Detailed driving, climate, and vehicle state information  

### New Tools
- `get_efficiency_trends`: Analyze driving efficiency over time with daily breakdowns
- `get_charging_cost_analysis`: Cost analysis by charging location (home/supercharger/public)
- `get_usage_patterns`: Driving patterns by day of week and hour of day
- `get_monthly_summary`: Comprehensive monthly driving and charging summary reports
- Enhanced state access tools for detailed vehicle information

## [v0.1.0] - 2024-XX-XX

### Added
- Initial release of Tessie MCP Extension
- **Complete Tesla Data Access**: All Tessie API GET endpoints for vehicle data
- **Smart VIN Resolution**: Automatically detects and uses your active vehicle
- **31+ Tools Available**: Battery, charging, driving, location, weather, analytics, and more
- **Real-time Data**: Access current vehicle status and historical data
- **Secure**: API token stored securely in Claude Desktop configuration

### Core Features
- Vehicle information and status
- Battery and charging data
- Location and driving history
- Climate and weather information
- Alerts and service data
- Comprehensive API coverage for all Tessie GET endpoints

### Requirements
- Claude Desktop v0.10.0 or later
- Tessie account with API access
- Node.js v18.0.0 or later