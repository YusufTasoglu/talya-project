

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
  res.render('hotel-management');
});

// Scraper sayfası
app.get('/scraper', (req, res) => {
  res.render('scraper', { results: null, error: null });
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

// Otel verilerini kaydetmek için endpoint
app.post('/api/save-hotels', (req, res) => {
  const { ownHotel, competitors } = req.body;
  
  // Basit bir dosya tabanlı veri saklama (gerçek projede veritabanı kullanılmalı)
  const fs = require('fs');
  const path = require('path');
  
  const dataPath = path.join(__dirname, 'src/data/hotels.json');
  
  try {
    const hotelData = {
      ownHotel: ownHotel || null,
      competitors: competitors || [],
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(dataPath, JSON.stringify(hotelData, null, 2));
    res.json({ success: true, message: 'Otel verileri başarıyla kaydedildi' });
  } catch (error) {
    console.error('Otel verileri kaydedilirken hata:', error);
    res.status(500).json({ success: false, message: 'Otel verileri kaydedilemedi' });
  }
});

// Kaydedilen otel verilerini getirmek için endpoint
app.get('/api/get-hotels', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const dataPath = path.join(__dirname, 'src/data/hotels.json');
  
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      const hotelData = JSON.parse(data);
      res.json(hotelData);
    } else {
      res.json({ ownHotel: null, competitors: [] });
    }
  } catch (error) {
    console.error('Otel verileri okunurken hata:', error);
    res.json({ ownHotel: null, competitors: [] });
  }
});

app.post('/scrape', async (req, res) => {
  const { startDate, endDate, adultCount, childAges } = req.body;

  if (!startDate || !endDate || !adultCount) {
    return res.render('scraper', { results: null, error: 'Lütfen tüm alanları doldurun.' });
  }

  // Kaydedilen otel verilerini al
  const fs = require('fs');
  const path = require('path');
  const dataPath = path.join(__dirname, 'src/data/hotels.json');
  
  let hotelData = { ownHotel: null, competitors: [] };
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      hotelData = JSON.parse(data);
    }
  } catch (error) {
    console.error('Otel verileri okunamadı:', error);
  }

  // Analiz edilecek otelleri hazırla
  const hotelsToAnalyze = [];
  if (hotelData.ownHotel) {
    hotelsToAnalyze.push(hotelData.ownHotel);
  }
  if (hotelData.competitors && hotelData.competitors.length > 0) {
    hotelsToAnalyze.push(...hotelData.competitors);
  }

  if (hotelsToAnalyze.length === 0) {
    return res.render('scraper', { results: null, error: 'Analiz edilecek otel bulunamadı. Lütfen önce otel yönetimi sayfasından otelleri tanımlayın.' });
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

  const allResults = [];

  try {
    for (const hotel of hotelsToAnalyze) {
      const result = await scrapeEtsturForDateRange(hotel.url, startDate, endDate, parseInt(adultCount, 10), parsedChildAges);
      
      // Kendi otelimizi işaretle
      if (hotelData.ownHotel && hotel.url === hotelData.ownHotel.url) {
        result.isOwnHotel = true;
      } else {
        result.isOwnHotel = false;
      }
      
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

