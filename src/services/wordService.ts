import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Word, Category } from "../types";

export const wordService = {
  // Kelime ekleme
  async addWord(word: Omit<Word, "id" | "createdAt">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "words"), {
        ...word,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Kelime eklenirken hata:", error);
      throw error;
    }
  },

  // Toplu kelime ekleme
  async addWords(words: Omit<Word, "id" | "createdAt">[]): Promise<void> {
    try {
      const promises = words.map((word) => this.addWord(word));
      await Promise.all(promises);
    } catch (error) {
      console.error("Kelimeler eklenirken hata:", error);
      throw error;
    }
  },

  // Tüm kelimeleri getirme
  async getAllWords(): Promise<Word[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "words"), orderBy("createdAt", "desc"))
      );
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Word[];
    } catch (error) {
      console.error("Kelimeler getirilirken hata:", error);
      throw error;
    }
  },

  // Kategoriye göre kelime getirme
  async getWordsByCategory(category: string): Promise<Word[]> {
    try {
      const q = query(
        collection(db, "words"),
        where("category", "==", category),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Word[];
    } catch (error) {
      console.error("Kategori kelimeleri getirilirken hata:", error);
      throw error;
    }
  },

  // Kategorilere göre kelime getirme
  async getWordsByCategories(categories: string[]): Promise<Word[]> {
    try {
      if (categories.length === 0) {
        return this.getAllWords();
      }

      // Firebase'in 'in' query'si maksimum 30 değer destekliyor
      // Eğer kategori sayısı fazlaysa, tüm kelimeleri getirip client-side filtrele
      if (categories.length > 10) {
        console.log(
          "🔄 Çok fazla kategori seçildi, tüm kelimeler getiriliyor..."
        );
        const allWords = await this.getAllWords();
        return allWords.filter((word) => categories.includes(word.category));
      }

      // Normal Firebase query
      const q = query(
        collection(db, "words"),
        where("category", "in", categories)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Word[];
    } catch (error) {
      console.error("Kategorilere göre kelimeler getirilirken hata:", error);
      // Hata durumunda fallback: tüm kelimeleri getir ve filtrele
      console.log("🔧 Fallback: Tüm kelimeler getiriliyor...");
      const allWords = await this.getAllWords();
      return allWords.filter((word) => categories.includes(word.category));
    }
  },

  // Kategorilere ve harflere göre kelime getirme
  async getWordsByCategoriesAndLetters(
    categories: string[],
    letters: string[]
  ): Promise<Word[]> {
    try {
      let words: Word[];

      if (categories.length === 0) {
        words = await this.getAllWords();
      } else {
        words = await this.getWordsByCategories(categories);
      }

      // Harf filtreleme (client-side)
      if (letters.length > 0) {
        words = words.filter((word) => {
          const firstLetter = word.english.charAt(0).toLowerCase();
          return letters.some((letter) => letter.toLowerCase() === firstLetter);
        });
      }

      return words;
    } catch (error) {
      console.error(
        "Kategorilere ve harflere göre kelimeler getirilirken hata:",
        error
      );
      throw error;
    }
  },

  // Kelime silme
  async deleteWord(wordId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "words", wordId));
    } catch (error) {
      console.error("Kelime silinirken hata:", error);
      throw error;
    }
  },

  // Kelime güncelleme
  async updateWord(wordId: string, word: Partial<Word>): Promise<void> {
    try {
      await updateDoc(doc(db, "words", wordId), word);
    } catch (error) {
      console.error("Kelime güncellenirken hata:", error);
      throw error;
    }
  },
};
