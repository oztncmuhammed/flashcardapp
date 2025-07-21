import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { GameStats, Word, QuizResult, TestHistory } from "../types";

export const gameService = {
  // Kelimeleri karıştır
  shuffleWords(words: Word[]): Word[] {
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Skor hesapla
  calculateScore(
    correctAnswers: number,
    totalQuestions: number,
    timeBonus: number = 0
  ): number {
    const baseScore = (correctAnswers / totalQuestions) * 100;
    const finalScore = Math.round(baseScore + timeBonus);
    return Math.max(0, Math.min(100, finalScore));
  },

  // Quiz sonucu hesapla
  calculateQuizResult(userAnswers: boolean[]): QuizResult {
    const totalQuestions = userAnswers.length;
    const correctAnswers = userAnswers.filter((answer) => answer).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const score = this.calculateScore(correctAnswers, totalQuestions);

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score,
      percentage: Math.round(percentage),
    };
  },

  // Oyun istatistiklerini kaydet
  async saveGameStats(
    stats: Omit<GameStats, "id" | "completedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "gameStats"), {
        ...stats,
        completedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Oyun istatistikleri kaydedilirken hata:", error);
      throw error;
    }
  },

  // Kullanıcının oyun geçmişini getir
  async getUserGameHistory(
    userId?: string,
    limitCount: number = 10
  ): Promise<GameStats[]> {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, "gameStats"),
          where("userId", "==", userId),
          orderBy("completedAt", "desc"),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, "gameStats"),
          orderBy("completedAt", "desc"),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt.toDate(),
      })) as GameStats[];
    } catch (error) {
      console.error("Oyun geçmişi getirilirken hata:", error);
      throw error;
    }
  },

  // En iyi skorları getir
  async getTopScores(limitCount: number = 10): Promise<GameStats[]> {
    try {
      const q = query(
        collection(db, "gameStats"),
        orderBy("score", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt.toDate(),
      })) as GameStats[];
    } catch (error) {
      console.error("En iyi skorlar getirilirken hata:", error);
      throw error;
    }
  },

  // İstatistikleri hesapla
  async calculateUserStats(userId?: string): Promise<{
    totalGames: number;
    averageScore: number;
    bestScore: number;
    totalCorrectAnswers: number;
    totalQuestions: number;
    accuracy: number;
  }> {
    try {
      const games = await this.getUserGameHistory(userId, 100);

      if (games.length === 0) {
        return {
          totalGames: 0,
          averageScore: 0,
          bestScore: 0,
          totalCorrectAnswers: 0,
          totalQuestions: 0,
          accuracy: 0,
        };
      }

      const totalGames = games.length;
      const totalScore = games.reduce((sum, game) => sum + game.score, 0);
      const averageScore = Math.round(totalScore / totalGames);
      const bestScore = Math.max(...games.map((game) => game.score));
      const totalCorrectAnswers = games.reduce(
        (sum, game) => sum + game.correctAnswers,
        0
      );
      const totalQuestions = games.reduce(
        (sum, game) => sum + game.totalQuestions,
        0
      );
      const accuracy =
        totalQuestions > 0
          ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
          : 0;

      return {
        totalGames,
        averageScore,
        bestScore,
        totalCorrectAnswers,
        totalQuestions,
        accuracy,
      };
    } catch (error) {
      console.error("Kullanıcı istatistikleri hesaplanırken hata:", error);
      throw error;
    }
  },

  // Test geçmişi kaydetme
  async saveTestHistory(
    testData: Omit<TestHistory, "id" | "createdAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "testHistory"), {
        ...testData,
        createdAt: Timestamp.now(),
      });
      console.log("✅ Test geçmişi kaydedildi:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Test geçmişi kaydedilirken hata:", error);
      throw error;
    }
  },

  // Test geçmişini getirme
  async getTestHistory(): Promise<TestHistory[]> {
    try {
      const q = query(
        collection(db, "testHistory"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as TestHistory[];
    } catch (error) {
      console.error("❌ Test geçmişi getirilirken hata:", error);
      throw error;
    }
  },

  // Son N test geçmişini getirme
  async getRecentTestHistory(limitCount: number = 10): Promise<TestHistory[]> {
    try {
      const q = query(
        collection(db, "testHistory"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as TestHistory[];
    } catch (error) {
      console.error("❌ Son test geçmişi getirilirken hata:", error);
      throw error;
    }
  },
};
