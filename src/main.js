const fs = require('fs');
const path = require('path');
const { scrapeEtsturForDateRange } = require('./scrapers/etstur_scraper');

async function main() {
  const inputPath = path.join(__dirname, "data", "hotels.txt");
  const outputPath = path.join(__dirname, "data", 'prices.txt');

  // Komut satırı argümanlarından başlangıç ve bitiş tarihlerini al
  const startDate = process.argv[2];
  const endDate = process.argv[3];

  if (!startDate || !endDate) {
    console.error('Kullanım: node src/main.js <başlangıçTarihi> <bitişTarihi>');
    console.error('Örnek: node src/main.js 2025-08-01 2025-08-31');
    process.exit(1);
  }

  const urls = fs.readFileSync(inputPath, 'utf-8').split('\n').filter(Boolean);

  const results = [];

  for (const url of urls) {
    console.log(`İşleniyor: ${url} (${startDate} - ${endDate})`);
    const { hotelName, prices, error } = await scrapeEtsturForDateRange(url, startDate, endDate, 2, []); // Varsayılan olarak 2 yetişkin, 0 çocuk

    if (error) {
      results.push(`${hotelName} | Hata: ${error}`);
      continue;
    }

    const priceText = Object.keys(prices).length > 0 ? 
      Object.entries(prices).map(([date, price]) => `${date}: ${price !== 'Fiyat bulunamadı' ? price.toFixed(2) + ' TL' : price}`).join('\n  ') :
      'Fiyat bulunamadı';
    results.push(`${hotelName}\n  ${priceText}`);
  }

  fs.writeFileSync(outputPath, results.join('\n\n'), 'utf-8');
  console.log('Bitti, sonuçlar prices.txt dosyasına yazıldı.');
}

main();
