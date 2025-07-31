const axios = require('axios');
const cheerio = require('cheerio');

async function getHotelIdFromUrl(hotelUrl) {
  try {
    const res = await axios.get(hotelUrl, {
      headers: {
        "accept": "text/html",
        "user-agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(res.data);
    const scriptContent = $('#__NEXT_DATA__').html();

    if (!scriptContent) {
      console.error(" __NEXT_DATA__ script not found.");
      return null;
    }

    const jsonData = JSON.parse(scriptContent);
    const hotelId = jsonData?.props?.pageProps?.data?.hotelId;

    if (hotelId) {
      console.log(` Hotel ID found: ${hotelId}`);
      return hotelId;
    } else {
      console.warn(" Hotel ID not found.");
      return null;
    }
  } catch (err) {
    console.error(` Hata: ${err.message}`);
    if (err.response) {
      console.error(`[DEBUG] Response status: ${err.response.status}`);
    }
    return null;
  }
}

async function scrapeEtsturForDateRange(hotelUrl, startDate, endDate, adultCount, childAges) {
  try {
    const hotelId = await getHotelIdFromUrl(hotelUrl);
    if (!hotelId) {
      throw new Error('hotelId bulunamadı');
    }
    console.log(`[DEBUG] Çekilen hotelId: ${hotelId}`);

    const hotelName = decodeURIComponent(hotelUrl.split('/').pop().replace(/-/g, ' '));
    const results = {};
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate);

    while (currentDate <= stopDate) {
      const checkIn = currentDate.toISOString().split('T')[0];
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      const checkOut = nextDay.toISOString().split('T')[0];

      console.log(`[INFO] Fiyatlar alınıyor: ${checkIn}`);

      const refererUrl = new URL(hotelUrl);
      refererUrl.searchParams.set('check_in', checkIn.replace(/-/g, '.'));
      refererUrl.searchParams.set('check_out', checkOut.replace(/-/g, '.'));
      refererUrl.searchParams.set('adult_1', adultCount);
      refererUrl.searchParams.set('child_1', childAges.length);

      const payload = {
        hotelId,
        checkIn,
        checkOut,
        room: {
          adultCount: adultCount,
          childCount: childAges.length,
          childAges: childAges,
          infantCount: 0,
        }
      };

      const apiResp = await axios.post('https://www.etstur.com/services/api/room', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': refererUrl.href
        }
      });

      const rooms = apiResp.data.result.rooms;
      let minPrice = Infinity;
      let foundPrice = false;

      if (rooms && rooms.length > 0) {
        for (const room of rooms) {
          if (room.nightlyMinPrice && room.nightlyMinPrice.amount) {
            const currentPrice = room.nightlyMinPrice.amount;
            if (currentPrice < minPrice) {
              minPrice = currentPrice;
              foundPrice = true;
            }
          }
        }
      }

      results[checkIn] = foundPrice ? minPrice : 'Fiyat bulunamadı';
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { hotelName, prices: results };

  } catch (error) {
    console.error(`[ERROR] Hata oluştu: ${error.message}`);
    return { hotelName: hotelUrl, error: `Hata: ${error.message}` };
  }
}

module.exports = { scrapeEtsturForDateRange };

