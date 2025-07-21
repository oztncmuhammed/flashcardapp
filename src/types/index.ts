export interface Word {
  id?: string;
  english: string;
  turkish: string;
  category: string;
  createdAt: Date;
}

export interface Category {
  id?: string;
  name: string;
  color: string;
  wordCount: number;
  createdAt: Date;
}

export interface GameStats {
  id?: string;
  userId?: string;
  mode: "eng-to-tur" | "tur-to-eng";
  categories: string[];
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  completedAt: Date;
}

export interface GameState {
  currentWordIndex: number;
  words: Word[];
  userAnswers: boolean[];
  isGameStarted: boolean;
  isGameCompleted: boolean;
  mode: "eng-to-tur" | "tur-to-eng";
  selectedCategories: string[];
  selectedLetters: string[];
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  percentage: number;
}

export interface TestHistory {
  id?: string;
  date: Date;
  mode: "eng-to-tur" | "tur-to-eng";
  selectedCategories: string[];
  selectedLetters: string[];
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  percentage: number;
  editedWordsCount: number;
  createdAt: Date;
}
