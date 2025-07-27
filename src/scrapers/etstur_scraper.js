// scrapers/etstur_scraper.js
const axios = require('axios');

async function scrapeEtstur(hotelUrl, checkIn, checkOut) { // Added checkIn, checkOut parameters
  try {
    // 1) Otel sayfasını çek
    const pageResp = await axios.get(hotelUrl);
    const html = pageResp.data;

    // 2) hotelId'yi regex ile al
    const idMatch = html.match(/"hotelId":"(.*?)"/);
    if (!idMatch) {
      console.log(`[DEBUG] hotelId bulunamadı for URL: ${hotelUrl}`);
      throw new Error('hotelId bulunamadı');
    }
    const hotelId = idMatch[1];
    console.log(`[DEBUG] Çekilen hotelId: ${hotelId}`);

    // 3) Otel adını basitçe URL'den alalım (daha sağlıklı için sayfadan çekilebilir, bu sadece bir örnek)
    const hotelName = decodeURIComponent(hotelUrl.split('/').pop().replace(/-/g, ' '));

    // 4) API isteği için payload hazırla
    const payload = {
      hotelId,
      checkIn: checkIn, // Use dynamic checkIn
      checkOut: checkOut, // Use dynamic checkOut
      room: {
        adultCount: 2,
        childCount: 0,
        childAges: [],
        infantCount: 0,
      }
    };

    // 5) POST isteği at
    const apiResp = await axios.post('https://www.etstur.com/services/api/room', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`[DEBUG] API Yanıtı (data): ${JSON.stringify(apiResp.data, null, 2)}`);

    // 6) Dönen JSON'dan fiyatları al
    const rooms = apiResp.data.result.rooms; // result objesini ekledim
    if (!rooms || rooms.length === 0) return { hotelName, price: 'Fiyat bulunamadı' };

    let minPrice = Infinity;
    let foundPrice = false;

    for (const room of rooms) {
      if (room.subBoards && room.subBoards.length > 0) {
        for (const subBoard of room.subBoards) {
          if (subBoard.price && subBoard.price.discountedPrice) {
            const currentPrice = subBoard.price.discountedPrice;
            if (currentPrice < minPrice) {
              minPrice = currentPrice;
              foundPrice = true;
            }
          }
        }
      }
    }

    const price = foundPrice ? `${minPrice} TL` : 'Fiyat bulunamadı';

    return { hotelName, price };

  } catch (error) {
    return { hotelName: hotelUrl, price: `Hata: ${error.message}` };
  }
}

module.exports = { scrapeEtstur };
