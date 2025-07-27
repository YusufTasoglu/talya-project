const fs = require('fs');
const path = require('path');
const { scrapeEtstur } = require('./scrapers/etstur_scraper');

async function main() {
  const inputPath = path.join(__dirname, "data", "hotels.txt");
  const outputPath = path.join(__dirname,"data", 'prices.txt');

  // Komut satırı argümanlarından checkIn ve checkOut tarihlerini al
  const checkIn = process.argv[2];
  const checkOut = process.argv[3];

  if (!checkIn || !checkOut) {
    console.error('Kullanım: node src/main.js <checkInTarihi> <checkOutTarihi>');
    console.error('Örnek: node src/main.js 2025-08-01 2025-08-02');
    process.exit(1);
  }

  const urls = fs.readFileSync(inputPath, 'utf-8').split('\n').filter(Boolean);

  const results = [];

  for (const url of urls) {
    console.log(`İşleniyor: ${url} (${checkIn} - ${checkOut})`);
    const { hotelName, price } = await scrapeEtstur(url, checkIn, checkOut);
    results.push(`${hotelName} | ${price}`);
  }

  fs.writeFileSync(outputPath, results.join('\n'), 'utf-8');
  console.log('Bitti, sonuçlar prices.txt dosyasına yazıldı.');
}

main();
