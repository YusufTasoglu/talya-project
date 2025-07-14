# Rate Shopping Web Scraper

## Project Description

This project is a simple web scraper that collects hotel prices from competitor websites. The main goal is to help hotel managers track the pricing of other hotels and adjust their own prices based on market conditions.

## Purpose

Hotels often change their prices depending on the season, day, or demand. By collecting and comparing prices of similar hotels, businesses can make better pricing decisions. This tool is designed to automate that process.

## Target Users

- Hotel owners and managers
- People working in hotel pricing and marketing
- Anyone interested in hotel price comparison

## Features

- Scrape hotel names and prices from selected websites
- Store the scraped data in a PostgreSQL database
- Use Puppeteer for dynamic websites
- Use Cheerio for static HTML pages
- The data will include hotel name, price, and the date it was collected

## Technologies Used

- Node.js
- Puppeteer
- Cheerio
- PostgreSQL
- pg (PostgreSQL Node.js client)
- dotenv (to manage environment variables)

## Database Table

**hotel_prices**

| Column Name | Type      | Description              |
|-------------|-----------|--------------------------|
| id          | SERIAL    | Primary key              |
| hotel_name  | TEXT      | Name of the hotel        |
| price       | INTEGER   | Price of the hotel room  |
| scraped_at  | TIMESTAMP | Date of scraping         |

## Example Use Case

The system will open a hotel booking website, extract hotel names and their prices, and save the results in the database. This data can later be used to compare prices or generate reports.

## Similar Systems

- Trivago
- Kayak
- Hotels.com
