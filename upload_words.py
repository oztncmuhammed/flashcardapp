import json
import sys
import os

# Firebase bağlantısı için
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Firebase'i başlat
if not firebase_admin._apps:
    # Firebase config bilgileri (gerçek config kullan)
    firebase_config = {
        "type": "service_account",
        "project_id": "flashcard-app-b7f50",
        "private_key_id": "8b2a1234567890abcdef",  # Gerçek değeri kullan
        "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  # Gerçek key
        "client_email": "firebase-adminsdk-abc123@flashcard-app-b7f50.iam.gserviceaccount.com",
        "client_id": "123456789012345678901",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
    }
    
    # Service account key ile Firebase başlat
    try:
        # Alternatif: environment variable'dan al
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": "flashcard-app-b7f50",
            # Diğer bilgiler environment'tan
        })
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase bağlantısı başarılı!")
    except Exception as e:
        print(f"❌ Firebase bağlantı hatası: {e}")
        print("🔧 Firebase Admin SDK kurulu değil veya credentials eksik")
        print("   Web interface üzerinden manuel yükleme yapacağız...")
        sys.exit(1)

async def main():
    print("🔥 Firebase'e kelime yükleme işlemi başlıyor...")
    
    # JSON dosyasını oku
    with open('words_to_upload.json', 'r', encoding='utf-8') as f:
        words_data = json.load(f)
    
    print(f"📊 Toplam {len(words_data)} kelime yüklenecek")
    
    # Mevcut kategorileri al
    categories_ref = db.collection('categories')
    existing_categories = {}
    
    try:
        docs = categories_ref.stream()
        for doc in docs:
            data = doc.to_dict()
            existing_categories[data['name']] = doc.id
        print(f"📂 Mevcut {len(existing_categories)} kategori bulundu")
    except Exception as e:
        print(f"⚠️ Kategori okuma hatası: {e}")
    
    # Yeni kategoriler oluştur
    new_categories = set()
    for word in words_data:
        category_name = word['category']
        if category_name not in existing_categories and category_name not in new_categories:
            new_categories.add(category_name)
    
    print(f"➕ {len(new_categories)} yeni kategori oluşturulacak")
    
    # Yeni kategorileri oluştur
    colors = [
        '#FF5722', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0',
        '#F44336', '#009688', '#795548', '#607D8B', '#E91E63',
        '#3F51B5', '#8BC34A', '#FFC107', '#673AB7', '#00BCD4',
        '#CDDC39', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'
    ]
    
    color_index = 0
    for category_name in new_categories:
        try:
            category_data = {
                'name': category_name,
                'color': colors[color_index % len(colors)],
                'wordCount': 0,
                'createdAt': firestore.SERVER_TIMESTAMP
            }
            
            doc_ref = categories_ref.add(category_data)
            existing_categories[category_name] = doc_ref[1].id
            print(f"✅ Kategori oluşturuldu: {category_name}")
            color_index += 1
            
        except Exception as e:
            print(f"❌ Kategori oluşturma hatası ({category_name}): {e}")
    
    # Kelimeleri yükle
    words_ref = db.collection('words')
    upload_count = 0
    error_count = 0
    
    print("\n📝 Kelime yükleme başlıyor...")
    
    for i, word_data in enumerate(words_data):
        try:
            word_doc = {
                'english': word_data['english'],
                'turkish': word_data['turkish'],
                'category': word_data['category'],
                'createdAt': firestore.SERVER_TIMESTAMP
            }
            
            words_ref.add(word_doc)
            upload_count += 1
            
            if (i + 1) % 100 == 0:
                print(f"📊 {i + 1}/{len(words_data)} kelime yüklendi...")
                
        except Exception as e:
            print(f"❌ Kelime yükleme hatası ({word_data['english']}): {e}")
            error_count += 1
    
    print(f"\n🎉 Yükleme tamamlandı!")
    print(f"✅ Başarılı: {upload_count} kelime")
    print(f"❌ Hatalı: {error_count} kelime")
    
    # Kategori kelime sayılarını güncelle
    print("\n🔄 Kategori kelime sayıları güncelleniyor...")
    
    for category_name in existing_categories.keys():
        try:
            # Bu kategorideki kelime sayısını say
            category_words = words_ref.where('category', '==', category_name).stream()
            word_count = len(list(category_words))
            
            # Kategori dokümanını güncelle
            category_ref = categories_ref.document(existing_categories[category_name])
            category_ref.update({'wordCount': word_count})
            
            print(f"📊 {category_name}: {word_count} kelime")
            
        except Exception as e:
            print(f"❌ Kategori güncelleme hatası ({category_name}): {e}")
    
    print("\n🎯 Tüm işlemler tamamlandı! Uygulamayı yeniden başlatabilirsiniz.")

if __name__ == "__main__":
    asyncio.run(main()) 