import json
import firebase_admin
from firebase_admin import credentials, firestore
import asyncio

# Firebase'i başlat
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

async def main():
    print("🔥 Cambridge kelimelerini Firebase'e yükleme işlemi başlıyor...")
    
    # Final JSON dosyasını oku
    with open('cambridge_words_final.json', 'r', encoding='utf-8') as f:
        cambridge_words = json.load(f)
    
    print(f"📊 Toplam {len(cambridge_words)} Cambridge kelimesi yüklenecek")
    
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
    for word in cambridge_words:
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
    
    print("\n📝 Cambridge kelime yükleme başlıyor...")
    
    # Batch yükleme için (Firebase'de 500'lük gruplar halinde)
    batch_size = 500
    batches = [cambridge_words[i:i + batch_size] for i in range(0, len(cambridge_words), batch_size)]
    
    for batch_index, batch in enumerate(batches):
        batch_obj = db.batch()
        batch_count = 0
        
        for word_data in batch:
            try:
                word_doc = {
                    'english': word_data['english'],
                    'turkish': word_data['turkish'],
                    'category': word_data['category'],
                    'createdAt': firestore.SERVER_TIMESTAMP
                }
                
                # Yeni dokuman referansı oluştur
                doc_ref = words_ref.document()
                batch_obj.set(doc_ref, word_doc)
                batch_count += 1
                upload_count += 1
                
            except Exception as e:
                print(f"❌ Kelime hazırlama hatası ({word_data['english']}): {e}")
                error_count += 1
        
        # Batch'i commit et
        try:
            batch_obj.commit()
            print(f"📊 Batch {batch_index + 1}/{len(batches)} yüklendi ({batch_count} kelime)")
        except Exception as e:
            print(f"❌ Batch {batch_index + 1} yükleme hatası: {e}")
            error_count += batch_count
            upload_count -= batch_count
    
    print(f"\n🎉 Yükleme tamamlandı!")
    print(f"✅ Başarılı: {upload_count} kelime")
    print(f"❌ Hatalı: {error_count} kelime")
    
    # Kategori kelime sayılarını güncelle
    print("\n🔄 Kategori kelime sayıları güncelleniyor...")
    
    category_counts = {}
    for word in cambridge_words:
        category = word['category']
        category_counts[category] = category_counts.get(category, 0) + 1
    
    for category_name, word_count in category_counts.items():
        try:
            if category_name in existing_categories:
                category_ref = categories_ref.document(existing_categories[category_name])
                
                # Mevcut kelime sayısını al
                category_doc = category_ref.get()
                if category_doc.exists:
                    current_count = category_doc.to_dict().get('wordCount', 0)
                    new_count = current_count + word_count
                else:
                    new_count = word_count
                
                category_ref.update({'wordCount': new_count})
                print(f"✅ {category_name}: {new_count} kelime")
                
        except Exception as e:
            print(f"❌ Kategori güncelleme hatası ({category_name}): {e}")
    
    print(f"\n🚀 Cambridge kelimeleri sisteme başarıyla eklendi!")
    print(f"📈 Toplam eklenen: {upload_count} kelime")
    print(f"📂 Güncellenen kategoriler: {len(category_counts)}")

if __name__ == "__main__":
    asyncio.run(main()) 