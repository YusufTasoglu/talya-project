

const express = require('express');
const path = require('path');
const { scrapeEtsturForDateRange } = require('./src/scrapers/etstur_scraper');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('scraper', { results: null, error: null });
});

app.post('/scrape', async (req, res) => {
  const { urls, startDate, endDate, adultCount } = req.body;

  if (!urls || !startDate || !endDate || !adultCount) {
    return res.render('scraper', { results: null, error: 'Lütfen tüm alanları doldurun.' });
  }

  const urlList = urls.split('\n').map(url => url.trim()).filter(Boolean);
  const allResults = [];

  try {
    for (const url of urlList) {
      const result = await scrapeEtsturForDateRange(url, startDate, endDate, parseInt(adultCount, 10), []);
      allResults.push(result);
    }
    res.render('scraper', { results: allResults, error: null });
  } catch (error) {
    console.error('Scraping sırasında bir hata oluştu:', error);
    res.render('scraper', { results: null, error: 'Fiyatlar alınırken bir hata oluştu.' });
  }
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});

