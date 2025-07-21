# 🎯 Flashcard Uygulaması

Modern ve interaktif bir İngilizce-Türkçe kelime öğrenme uygulaması. Cambridge kelime listesi ile desteklenen bu uygulama, etkili kelime öğrenimi için tasarlandı.

![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)
![Material-UI](https://img.shields.io/badge/Material--UI-7.2.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-12.0.0-orange.svg)

## ✨ Özellikler

### 🎮 Oyun Modları

- **İngilizce → Türkçe**: İngilizce kelimeleri Türkçe karşılıklarını tahmin et
- **Türkçe → İngilizce**: Türkçe kelimeleri İngilizce karşılıklarını tahmin et

### 📚 Kelime Yönetimi

- Yeni kelime ekleme ve düzenleme
- Kategorilere göre kelime organizasyonu
- Cambridge kelime listesi entegrasyonu
- Toplu kelime yükleme özelliği

### 🏷️ Kategori Sistemi

- Özelleştirilebilir kelime kategorileri
- Renkli kategori etiketleri
- Kategori bazlı oyun seçimi
- Harf bazlı filtreleme

### 📊 İstatistikler ve Takip

- Detaylı test geçmişi
- Başarı skorları ve yüzdeler
- Yanlış cevaplanan kelimelerin takibi
- Oyun performans analizi

### 🎨 Kullanıcı Deneyimi

- Modern ve responsive tasarım
- Material Design bileşenleri
- Koyu/açık tema desteği
- Smooth animasyonlar

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- Firebase hesabı

### Kurulum

1. **Projeyi klonlayın**

   ```bash
   git clone <repository-url>
   cd flashcard/flashcard-app
   ```

2. **Bağımlılıkları yükleyin**

   ```bash
   npm install
   ```

3. **Firebase konfigürasyonu**

   ```bash
   # src/firebase/config.ts dosyasını kendi Firebase ayarlarınızla güncelleyin
   ```

4. **Uygulamayı başlatın**

   ```bash
   npm start
   ```

5. **Tarayıcıda açın**
   ```
   http://localhost:3000
   ```

## 🛠️ Teknolojiler

### Frontend

- **React 19.1.0** - Kullanıcı arayüzü
- **TypeScript** - Tip güvenliği
- **Material-UI (MUI) 7.2.0** - UI bileşenleri
- **Emotion** - CSS-in-JS styling

### Backend & Database

- **Firebase** - Veritabanı ve hosting
- **Firestore** - NoSQL veritabanı
- **Firebase Authentication** - Kullanıcı kimlik doğrulama

### Development Tools

- **React Scripts** - Build ve development tools
- **Jest** - Unit testing
- **React Testing Library** - Component testing

## 📁 Proje Yapısı

```
flashcard-app/
├── public/                    # Statik dosyalar
│   ├── index.html
│   └── cambridge_words_to_upload.json
├── src/
│   ├── components/           # React bileşenleri
│   │   ├── BulkUpload.tsx
│   │   ├── CategorySelection.tsx
│   │   ├── FlashcardGame.tsx
│   │   ├── GameModeSelection.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── MainMenu.tsx
│   │   ├── TestHistory.tsx
│   │   ├── WordList.tsx
│   │   └── WordManagement.tsx
│   ├── firebase/             # Firebase konfigürasyonu
│   │   └── config.ts
│   ├── services/             # Servis katmanı
│   │   ├── categoryService.ts
│   │   ├── gameService.ts
│   │   └── wordService.ts
│   ├── types/                # TypeScript tip tanımları
│   │   └── index.ts
│   ├── App.tsx              # Ana uygulama bileşeni
│   └── index.tsx            # Giriş noktası
├── package.json
└── tsconfig.json
```

## 🎯 Kullanım Kılavuzu

### 1. Ana Menü

- **Kelime Yönetimi**: Yeni kelimeler ekleyin veya mevcut kelimeleri düzenleyin
- **Oyun Başlat**: Flashcard oyununu başlatın
- **Test Geçmişi**: Geçmiş oyun sonuçlarınızı görüntüleyin

### 2. Kelime Ekleme

1. "Kelime Yönetimi" seçeneğini tıklayın
2. "Yeni Kelime Ekle" butonuna basın
3. İngilizce ve Türkçe karşılıklarını girin
4. Uygun kategoriyi seçin
5. Kaydet butonuna basın

### 3. Oyun Oynama

1. "Oyun Başlat" seçeneğini tıklayın
2. Oynamak istediğiniz kategorileri seçin
3. Harf filtresi uygulayın (isteğe bağlı)
4. Oyun modunu seçin (İng→Tür veya Tür→İng)
5. Kelimeleri tahmin etmeye başlayın!

## 🔧 Geliştirme

### Yeni Özellik Ekleme

1. `src/components/` klasörüne yeni bileşen ekleyin
2. Gerekli servisleri `src/services/` klasöründe oluşturun
3. Tip tanımlarını `src/types/index.ts` dosyasına ekleyin
4. Ana uygulama akışını `App.tsx` dosyasında güncelleyin

### Test Çalıştırma

```bash
npm test
```

### Production Build

```bash
npm run build
```

## 📊 Kelime Verileri

Uygulama Cambridge kelime listesi ile gelir ve aşağıdaki kategorileri içerir:

- Günlük Kelimeler
- İş Hayatı
- Akademik Kelimeler
- Seyahat
- Teknoloji
- Sağlık
- Yemek & İçecek

### Toplu Kelime Yükleme

Python scriptleri ile büyük kelime listelerini yükleyebilirsiniz:

```bash
python upload_cambridge_words.py
```

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📈 Gelecek Özellikler

- [ ] Spaced Repetition algoritması
- [ ] Ses dosyası desteği
- [ ] Çevrimdışı mod
- [ ] Sosyal özellikler (arkadaşlarla yarışma)
- [ ] AI destekli kelime önerileri
- [ ] Mobil uygulama (React Native)
- [ ] Çoklu dil desteği

## 🐛 Bilinen Sorunlar

- Firebase bağlantı hatası durumunda offline mod aktif değil
- Büyük kelime listelerinde performans optimizasyonu gerekli

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasını inceleyebilirsiniz.

## 📞 İletişim

Sorularınız veya önerileriniz için:

- Issue açın
- Pull request gönderin

---

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**
