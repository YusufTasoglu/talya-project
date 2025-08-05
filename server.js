

const express = require('express');
const path = require('path');
const axios = require('axios');
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

// Otel yönetimi sayfası
app.get('/hotel-management', (req, res) => {
  res.render('hotel-management');
});


// Etstur autocomplete API endpoint'i
app.get('/api/search-hotels', async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    return res.json({ hotels: [] });
  }

  try {
    const response = await axios.get(`https://www.etstur.com/v2/autocomplete`, {
      params: {
        q: query
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.etstur.com/',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      }
    });

    // API response'unu parse et ve otel verilerini çıkar
    const allResults = response.data.result || [];
    
    // Sadece HOTEL tipindeki sonuçları filtrele
    const hotels = allResults.filter(item => item.type === 'HOTEL');
    
    const formattedHotels = hotels.map(hotel => ({
      id: hotel.url || hotel.slug,
      name: hotel.title,
      city: hotel.state && hotel.state.length > 0 ? hotel.state[hotel.state.length - 1] : '',
      url: `https://www.etstur.com/${hotel.url}`,
      image: ''
    }));

    res.json({ hotels: formattedHotels });
  } catch (error) {
    console.error('Otel arama hatası:', error);
    res.json({ hotels: [] });
  }
});

app.post('/scrape', async (req, res) => {
  const { urls, startDate, endDate, adultCount, childAges } = req.body;

  if (!urls || !startDate || !endDate || !adultCount) {
    return res.render('scraper', { results: null, error: 'Lütfen tüm alanları doldurun.' });
  }

  // Çocuk yaşlarını parse et
  let parsedChildAges = [];
  try {
    if (childAges) {
      parsedChildAges = JSON.parse(childAges);
    }
  } catch (error) {
    console.error('Çocuk yaşları parse edilemedi:', error);
    parsedChildAges = [];
  }

  const urlList = urls.split('\n').map(url => url.trim()).filter(Boolean);
  const allResults = [];

  try {
    for (const url of urlList) {
      const result = await scrapeEtsturForDateRange(url, startDate, endDate, parseInt(adultCount, 10), parsedChildAges);
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

