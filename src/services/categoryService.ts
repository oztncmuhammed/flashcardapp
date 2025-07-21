import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Category } from "../types";

export const categoryService = {
  // Kategori ekleme
  async addCategory(
    category: Omit<Category, "id" | "createdAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        ...category,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Kategori eklenirken hata:", error);
      throw error;
    }
  },

  // Tüm kategorileri getirme
  async getAllCategories(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "categories"), orderBy("name"))
      );
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Category[];
    } catch (error) {
      console.error("Kategoriler getirilirken hata:", error);
      throw error;
    }
  },

  // Kategori silme
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "categories", categoryId));
    } catch (error) {
      console.error("Kategori silinirken hata:", error);
      throw error;
    }
  },

  // Kategori güncelleme
  async updateCategory(
    categoryId: string,
    category: Partial<Category>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, "categories", categoryId), category);
    } catch (error) {
      console.error("Kategori güncellenirken hata:", error);
      throw error;
    }
  },

  // Kategori kelime sayısını güncelleme
  async updateWordCount(categoryName: string): Promise<void> {
    try {
      // Önce kategorideki kelime sayısını say
      const wordsQuery = query(
        collection(db, "words"),
        where("category", "==", categoryName)
      );
      const wordsSnapshot = await getDocs(wordsQuery);
      const wordCount = wordsSnapshot.size;

      // Sonra kategoriyi bul ve güncelle
      const categoriesQuery = query(
        collection(db, "categories"),
        where("name", "==", categoryName)
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);

      if (!categoriesSnapshot.empty) {
        const categoryDoc = categoriesSnapshot.docs[0];
        await updateDoc(categoryDoc.ref, { wordCount });
      }
    } catch (error) {
      console.error("Kategori kelime sayısı güncellenirken hata:", error);
      throw error;
    }
  },

  // Varsayılan kategorileri oluştur
  async createDefaultCategories(): Promise<void> {
    const defaultCategories = [
      { name: "Genel", color: "#2196F3", wordCount: 0 },
      { name: "Hayvanlar", color: "#4CAF50", wordCount: 0 },
      { name: "Renkler", color: "#FF5722", wordCount: 0 },
      { name: "Sayılar", color: "#9C27B0", wordCount: 0 },
      { name: "Aile", color: "#FF9800", wordCount: 0 },
      { name: "Ev Eşyaları", color: "#795548", wordCount: 0 },
      { name: "Yiyecekler", color: "#F44336", wordCount: 0 },
      { name: "Duygular", color: "#E91E63", wordCount: 0 },
    ];

    try {
      const promises = defaultCategories.map((category) =>
        this.addCategory(category)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Varsayılan kategoriler oluşturulurken hata:", error);
      throw error;
    }
  },
};
