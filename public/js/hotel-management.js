// Global değişkenler
let ownHotel = null;
let competitors = [];
let searchTimeout;

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSavedData();
});

// Event listener'ları başlat
function initializeEventListeners() {
    // Kendi otel arama
    const ownHotelSearch = document.getElementById('ownHotelSearch');
    if (ownHotelSearch) {
        ownHotelSearch.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchHotels(e.target.value, 'ownHotel');
            }, 300);
        });
    }

    // Rakip otel arama
    const competitorSearch = document.getElementById('competitorSearch');
    if (competitorSearch) {
        competitorSearch.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchHotels(e.target.value, 'competitor');
            }, 300);
        });
    }

    // Kendi otel formu
    const ownHotelForm = document.getElementById('ownHotelForm');
    if (ownHotelForm) {
        ownHotelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveOwnHotel();
        });
    }

    // Rakip ekleme butonu
    const addCompetitorBtn = document.getElementById('addCompetitorBtn');
    if (addCompetitorBtn) {
        addCompetitorBtn.addEventListener('click', addSelectedCompetitor);
    }

    // Tüm ayarları kaydet
    const saveAllBtn = document.getElementById('saveAllBtn');
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', saveAllSettings);
    }



    // Dışarı tıklama ile arama sonuçlarını gizle
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            hideSearchResults('ownHotel');
            hideSearchResults('competitor');
        }
    });
}

// Otel arama fonksiyonu
async function searchHotels(query, type) {
    if (!query || query.length < 2) {
        hideSearchResults(type);
        return;
    }

    try {
        const response = await fetch(`/api/search-hotels?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.hotels && data.hotels.length > 0) {
            displaySearchResults(data.hotels, type);
        } else {
            hideSearchResults(type);
            showNoResults(type);
        }
    } catch (error) {
        console.error('Otel arama hatası:', error);
        hideSearchResults(type);
    }
}

// Arama sonuçlarını göster
function displaySearchResults(hotels, type) {
    const resultsContainer = document.getElementById(`${type}SearchResults`);
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';
    
    hotels.forEach(hotel => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="hotel-image">
                ${hotel.image ? `<img src="${hotel.image}" alt="${hotel.name}">` : '🏨'}
            </div>
            <div class="hotel-info">
                <div class="hotel-name">${hotel.name}</div>
                <div class="hotel-city">${hotel.city}</div>
            </div>
        `;
        
        resultItem.addEventListener('click', () => selectHotel(hotel, type));
        resultsContainer.appendChild(resultItem);
    });
    
    resultsContainer.classList.add('show');
}

// Arama sonuçlarını gizle
function hideSearchResults(type) {
    const resultsContainer = document.getElementById(`${type}SearchResults`);
    if (resultsContainer) {
        resultsContainer.classList.remove('show');
    }
}

// Sonuç bulunamadı mesajı
function showNoResults(type) {
    const resultsContainer = document.getElementById(`${type}SearchResults`);
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '<div class="search-result-item">Sonuç bulunamadı</div>';
    resultsContainer.classList.add('show');
}

// Otel seçme
function selectHotel(hotel, type) {
    if (type === 'ownHotel') {
        selectOwnHotel(hotel);
    } else if (type === 'competitor') {
        selectCompetitor(hotel);
    }
    
    hideSearchResults(type);
}

// Kendi oteli seçme
function selectOwnHotel(hotel) {
    ownHotel = hotel;
    
    // Form alanlarını doldur
    document.getElementById('ownHotelSearch').value = hotel.name;
    document.getElementById('ownHotelUrl').value = hotel.url;
    
    showNotification('Kendi oteliniz seçildi: ' + hotel.name, 'success');
}

// Rakip oteli seçme
function selectCompetitor(hotel) {
    // Arama alanını temizle
    document.getElementById('competitorSearch').value = hotel.name;
    
    // Seçilen oteli geçici olarak sakla
    window.selectedCompetitor = hotel;
    
    showNotification('Rakip otel seçildi: ' + hotel.name, 'info');
}

// Seçilen rakibi listeye ekle
function addSelectedCompetitor() {
    if (!window.selectedCompetitor) {
        showNotification('Önce bir rakip otel seçin', 'error');
        return;
    }

    // Aynı otel zaten ekli mi kontrol et
    const exists = competitors.some(comp => comp.id === window.selectedCompetitor.id);
    if (exists) {
        showNotification('Bu otel zaten rakip listesinde', 'warning');
        return;
    }

    // Rakibi listeye ekle
    competitors.push(window.selectedCompetitor);
    
    // Listeyi güncelle
    updateCompetitorsList();
    
    // Seçimi temizle
    window.selectedCompetitor = null;
    document.getElementById('competitorSearch').value = '';
    
    showNotification('Rakip otel eklendi', 'success');
}

// Rakip listesini güncelle
function updateCompetitorsList() {
    const competitorsList = document.getElementById('competitorsList');
    if (!competitorsList) return;

    competitorsList.innerHTML = '';
    
    if (competitors.length === 0) {
        competitorsList.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">Henüz rakip otel eklenmedi</p>';
        return;
    }

    competitors.forEach((competitor, index) => {
        const competitorItem = document.createElement('div');
        competitorItem.className = 'competitor-item';
        competitorItem.innerHTML = `
            <div class="competitor-info">
                <div class="competitor-name">${competitor.name}</div>
                <div class="competitor-details">${competitor.city}</div>
            </div>
            <button type="button" class="remove-competitor" onclick="removeCompetitor(${index})">
                Kaldır
            </button>
        `;
        competitorsList.appendChild(competitorItem);
    });
}

// Rakibi listeden kaldır
function removeCompetitor(index) {
    const removed = competitors.splice(index, 1)[0];
    updateCompetitorsList();
    showNotification('Rakip otel kaldırıldı: ' + removed.name, 'info');
}

// Kendi oteli kaydet
function saveOwnHotel() {
    const form = document.getElementById('ownHotelForm');
    const formData = new FormData(form);
    
    const hotelData = {
        name: document.getElementById('ownHotelSearch').value,
        url: formData.get('ownHotelUrl')
    };

    // Validasyon
    if (!hotelData.name || !hotelData.url) {
        showNotification('Lütfen tüm alanları doldurun', 'error');
        return;
    }

    ownHotel = { ...ownHotel, ...hotelData };
    
    // Local storage'a kaydet
    localStorage.setItem('ownHotel', JSON.stringify(ownHotel));
    
    showNotification('Kendi otel bilgileriniz kaydedildi', 'success');
}

// Tüm ayarları kaydet
async function saveAllSettings() {
    try {
        // Server'a kaydet
        const response = await fetch('/api/save-hotels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ownHotel: ownHotel,
                competitors: competitors
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Local storage'a da kaydet
            if (ownHotel) {
                localStorage.setItem('ownHotel', JSON.stringify(ownHotel));
            }
            localStorage.setItem('competitors', JSON.stringify(competitors));
            
            showNotification('Tüm ayarlar başarıyla kaydedildi', 'success');
        } else {
            showNotification('Ayarlar kaydedilirken hata oluştu: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Kaydetme hatası:', error);
        showNotification('Ayarlar kaydedilirken hata oluştu', 'error');
    }
}

// Kaydedilmiş verileri yükle
async function loadSavedData() {
    try {
        // Server'dan veri yükle
        const response = await fetch('/api/get-hotels');
        const data = await response.json();
        
        if (data.ownHotel) {
            ownHotel = data.ownHotel;
            fillOwnHotelForm(ownHotel);
        }
        
        if (data.competitors && data.competitors.length > 0) {
            competitors = data.competitors;
            updateCompetitorsList();
        }
        
        // Local storage'dan da yükle (fallback)
        if (!data.ownHotel) {
            const savedOwnHotel = localStorage.getItem('ownHotel');
            if (savedOwnHotel) {
                ownHotel = JSON.parse(savedOwnHotel);
                fillOwnHotelForm(ownHotel);
            }
        }
        
        if (!data.competitors || data.competitors.length === 0) {
            const savedCompetitors = localStorage.getItem('competitors');
            if (savedCompetitors) {
                competitors = JSON.parse(savedCompetitors);
                updateCompetitorsList();
            }
        }
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        
        // Hata durumunda local storage'dan yükle
        const savedOwnHotel = localStorage.getItem('ownHotel');
        if (savedOwnHotel) {
            ownHotel = JSON.parse(savedOwnHotel);
            fillOwnHotelForm(ownHotel);
        }
        
        const savedCompetitors = localStorage.getItem('competitors');
        if (savedCompetitors) {
            competitors = JSON.parse(savedCompetitors);
            updateCompetitorsList();
        }
    }
}

// Kendi otel formunu doldur
function fillOwnHotelForm(hotel) {
    document.getElementById('ownHotelSearch').value = hotel.name || '';
    document.getElementById('ownHotelUrl').value = hotel.url || '';
}



// Bildirim göster
function showNotification(message, type = 'info') {
    // Basit bir bildirim sistemi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Tip bazlı renkler
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// CSS animasyonları için style ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 