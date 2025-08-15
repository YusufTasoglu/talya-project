# 🏨 Hotel Price Analysis System

## 📋 About the Project

This project is a web-based price analysis tool that helps hotel managers track competitor hotel prices and determine their own pricing strategies. The system scrapes hotel prices from Etstur.com and provides a user-friendly interface.

## 🎯 Purpose

In the hotel industry, prices constantly change based on seasonality, demand, and market conditions. This tool automates the process of collecting and comparing hotel prices, enabling businesses to make informed pricing decisions and stay competitive in the market.

## 👥 Target Users

- Hotel owners and managers
- Revenue management professionals
- Hotel marketing teams
- Anyone interested in hotel price comparison

## ✨ Features

### 🚀 Current Features
- **Hotel Management Interface**: Add and manage your own hotel and competitor hotels
- **Etstur Integration**: Scrape hotel prices directly from Etstur.com
- **Date Range Analysis**: Analyze prices across specific date ranges
- **Guest Configuration**: Support for different adult and child counts
- **Local Data Storage**: Store hotel information locally using JSON files
- **Web Interface**: User-friendly web application with modern UI
- **Real-time Price Comparison**: Compare your hotel's prices with competitors

### 🔧 Technical Features
- **Web Scraping**: Uses Puppeteer and Cheerio for dynamic content scraping
- **API Integration**: Leverages Etstur's internal APIs for accurate price data
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Search**: Hotel search with autocomplete functionality

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript, EJS templating
- **Web Scraping**: Puppeteer, Cheerio, Axios
- **Data Storage**: Local JSON files (no database required)
- **Styling**: Custom CSS with modern design principles

## 📁 Project Structure

```
talyaproject/
├── server.js                 # Main Express server
├── package.json             # Dependencies and scripts
├── public/                  # Static files
│   ├── css/                # Style files
│   │   ├── hotel-management.css
│   │   └── scraper-style.css
│   └── js/                 # Client-side JavaScript
│       └── hotel-management.js
├── src/
│   ├── scrapers/           # Web scraping modules
│   │   └── etstur_scraper.js
│   └── data/               # Local data storage
│       ├── hotels.json     # Hotel configurations
│       ├── hotels.txt      # Hotel data
│       └── prices.txt      # Scraped price data
└── views/                  # EJS templates
    ├── hotel-management.ejs
    └── scraper.ejs
```

## 🚀 Installation and Setup

### 1. Download the Project
```bash
git clone [repository-url]
cd talyaproject
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
node server.js
```

### 4. Access the Application
- Open your browser and go to `http://localhost:3000`
- Use the Hotel Management page to configure your hotels
- Use the Price Analysis page to scrape and compare prices

## 📖 User Guide

### 1. Hotel Management
- Go to the Hotel Management page
- Add your own hotel by searching and selecting from Etstur
- Add competitor hotels for comparison
- Save your configuration

### 2. Price Analysis
- Go to the Price Analysis page
- Select date range for analysis
- Configure guest count (adults and children)
- Click "Get Prices" to start scraping
- View comparison results in table format

### 3. Data Storage
- Hotel configurations are stored in `src/data/hotels.json`
- Price data is stored locally in text files
- No database setup required

## 📊 Data Format

### Hotel Configuration (hotels.json)
```json
{
  "ownHotel": {
    "id": "hotel-id",
    "name": "Hotel Name, City",
    "city": "City",
    "url": "https://www.etstur.com/hotel-url"
  },
  "competitors": [
    {
      "id": "competitor-id",
      "name": "Competitor Hotel Name",
      "city": "City",
      "url": "https://www.etstur.com/competitor-url"
    }
  ],
  "lastUpdated": "2025-01-01T00:00:00.000Z"
}
```

## ⚠️ Limitations and Future Enhancements

### 🔴 Current Limitations
- Only supports Etstur.com as a data source
- Local file storage (no database)
- Limited to Turkish hotel market
- No historical data analysis

### 🟢 Planned Enhancements
- Support for multiple booking websites (Booking.com, Hotels.com, etc.)
- Database integration for better data management
- Historical price tracking and trend analysis
- Export functionality (CSV, Excel)
- Email notifications for price changes
- Advanced analytics and reporting

## 🌐 Similar Systems

- **Trivago**: Hotel price comparison platform
- **Kayak**: Travel search engine with price comparison
- **Hotels.com**: Hotel booking with price tracking
- **RateGain**: Professional hotel revenue management

## 🤝 Contributing

This project is designed for hotel management and price analysis. We welcome contributions in the following areas:
- Adding support for additional booking websites
- Improving the user interface
- Enhancing data analysis capabilities
- Adding new features for hotel management

## 📄 License

This project is licensed under the ISC License.

---

**Note**: This tool is designed for educational and business purposes. Please ensure compliance with website terms of service when scraping data.
