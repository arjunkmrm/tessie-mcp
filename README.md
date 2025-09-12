# 🚗 Tessie MCP Extension for Claude Desktop

A Model Context Protocol (MCP) server that connects Claude Desktop to your Tesla vehicle data through the Tessie API. Query your car's location, mileage, driving history, and more using natural language.

![Tessie MCP](icon.svg)

## ⚡ Quick Install (Recommended)

### For Claude Desktop Users

1. **Download the Extension**: 
   - Go to [Releases](../../releases)
   - Download the latest `tessie.mcpb` file

2. **Install**:
   - Double-click the `tessie.mcpb` file
   - Or drag it onto Claude Desktop
   - Or use File → Open in Claude Desktop

3. **Configure**:
   - Enter your Tessie API token when prompted
   - Get your token from [tessie.com](https://tessie.com) → Account → Developer Settings

4. **Start Using**:
   - Ask Claude: "What vehicles do I have?"
   - "What's my car's current battery level?"
   - "How many miles did I drive last week?"

## 🛠️ Manual Installation (Advanced Users)

### Prerequisites

- Node.js 18+ 
- A Tessie account with API access
- Tesla vehicle connected to Tessie

### Setup

1. **Clone and Build**:
   ```bash
   git clone https://github.com/your-username/tessie-mcp.git
   cd tessie-mcp
   npm install
   npm run build
   ```

2. **Get Tessie API Token**:
   - Sign up at [tessie.com](https://tessie.com)
   - Connect your Tesla vehicle
   - Go to Account → Developer Settings
   - Generate an API access token

3. **Configure Claude Desktop**:
   
   Edit your Claude Desktop config file:
   
   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
   
   ```json
   {
     "mcpServers": {
       "tessie": {
         "command": "node",
         "args": ["/path/to/tessie-mcp/server/index.js"],
         "env": {
           "TESSIE_ACCESS_TOKEN": "your-tessie-api-token-here"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop**

## 🎯 What You Can Ask

### Vehicle Information
- "What vehicles do I have in my Tessie account?"
- "What's my car's current battery level and location?"
- "Is my car charging right now?"
- "What's the current odometer reading?"

### Location & Mileage Queries  
- "When I went to Starbucks last week, what was my odometer reading?"
- "Find all trips to the grocery store this month"
- "What was my mileage when I visited the airport?"

### Driving History & Statistics
- "How many miles did I drive last week?"
- "Show me my driving history for the past month"
- "What was my longest drive this year?"
- "How much battery did I use on my last trip?"

### Time-based Analysis
- "Calculate my total mileage for December 2024"
- "Show me daily driving breakdown for this week"
- "How many trips did I take yesterday?"

## 🔧 Available Tools

The extension provides these MCP tools:

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_vehicles` | List all vehicles in account | None |
| `get_vehicle_current_state` | Current vehicle status | `vin`, `use_cache` |
| `get_driving_history` | Historical driving data | `vin`, `start_date`, `end_date`, `limit` |
| `get_mileage_at_location` | Find mileage at specific locations | `vin`, `location`, `start_date`, `end_date` |
| `get_weekly_mileage` | Calculate mileage for time periods | `vin`, `start_date`, `end_date` |

## 🔐 Security & Privacy

- **Read-Only Access**: Only queries vehicle data, cannot control your car
- **Secure Storage**: API tokens stored in OS keychain (extension) or environment variables
- **No Data Storage**: No vehicle data is stored locally or transmitted to third parties
- **Rate Limiting**: Respects Tessie API rate limits with intelligent caching

## 📊 Example Responses

### Current Vehicle State
```json
{
  "vehicle": "Model 3",
  "vin": "5YJ3E1EA8MF123456",
  "current_location": {
    "latitude": 37.4419,
    "longitude": -122.1430
  },
  "odometer": 15234.5,
  "battery_level": 82,
  "charging_state": "Disconnected",
  "locked": true
}
```

### Weekly Mileage Summary
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-07"
  },
  "total_miles_driven": 234.8,
  "total_drives": 12,
  "average_miles_per_drive": 19.57,
  "daily_breakdown": [
    {"date": "2024-01-01", "miles": 45.2, "drives": 3},
    {"date": "2024-01-02", "miles": 23.1, "drives": 2}
  ]
}
```

## 🚨 Troubleshooting

### Extension Not Loading
- Ensure you have the latest version of Claude Desktop
- Check that the `.mcpb` file downloaded completely
- Try restarting Claude Desktop

### "API Token Required" Error
- Verify your Tessie API token is correct
- Check that your token has the necessary permissions
- Ensure your Tesla is connected to Tessie

### No Vehicle Data
- Confirm your Tesla is connected to Tessie
- Check that your vehicle has recent activity
- Try waking your vehicle in the Tesla app first

### Rate Limiting
- The Tessie API has rate limits - the extension will handle this automatically
- If you get rate limit errors, wait a few minutes before trying again

## 🛣️ Roadmap

- [ ] Support for multiple vehicles with smart selection
- [ ] Charging session analysis and cost calculations  
- [ ] Trip categorization (work, personal, etc.)
- [ ] Integration with calendar events for automatic trip labeling
- [ ] Energy efficiency analysis and recommendations
- [ ] Weather correlation with driving patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Tessie](https://tessie.com) for providing excellent Tesla API access
- [Anthropic](https://anthropic.com) for Claude Desktop and MCP framework
- Tesla for making amazing vehicles worth tracking!

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](../../issues)
- 💡 **Feature Requests**: [GitHub Discussions](../../discussions)
- 📖 **Documentation**: This README and inline code comments
- 🔗 **Tessie API Docs**: https://developer.tessie.com

---

**⚠️ Disclaimer**: This extension is not affiliated with Tesla, Inc. or Tessie. Use at your own risk. Always follow safe driving practices.