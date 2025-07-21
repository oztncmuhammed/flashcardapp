import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Container, Box, Typography, Button } from "@mui/material";
import { Word, Category, GameState } from "./types";
import { wordService } from "./services/wordService";
import { categoryService } from "./services/categoryService";
import MainMenu from "./components/MainMenu";
import WordManagement from "./components/WordManagement";
import WordList from "./components/WordList";
import CategorySelection from "./components/CategorySelection";
import GameModeSelection from "./components/GameModeSelection";
import FlashcardGame from "./components/FlashcardGame";
import TestHistory from "./components/TestHistory";
// import GameResults from "./components/GameResults";
import LoadingScreen from "./components/LoadingScreen";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

type AppView =
  | "menu"
  | "words"
  | "word-list"
  | "categories"
  | "gameMode"
  | "game"
  | "results"
  | "testHistory";

function App() {
  const [currentView, setCurrentView] = useState<AppView>("menu");
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    words: [],
    userAnswers: [],
    isGameStarted: false,
    isGameCompleted: false,
    mode: "eng-to-tur",
    selectedCategories: [],
    selectedLetters: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);

      // Kategorileri yükle
      const loadedCategories = await categoryService.getAllCategories();
      if (loadedCategories.length === 0) {
        await categoryService.createDefaultCategories();
        const newCategories = await categoryService.getAllCategories();
        setCategories(newCategories);
      } else {
        setCategories(loadedCategories);
      }

      // Kelimeleri yükle
      const loadedWords = await wordService.getAllWords();
      setWords(loadedWords);
    } catch (error) {
      console.error("Uygulama başlatılırken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWords = async () => {
    try {
      const loadedWords = await wordService.getAllWords();
      setWords(loadedWords);
    } catch (error) {
      console.error("Kelimeler yenilenirken hata:", error);
    }
  };

  const refreshCategories = async () => {
    try {
      const loadedCategories = await categoryService.getAllCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Kategoriler yenilenirken hata:", error);
    }
  };

  const handleStartGame = (
    mode: "eng-to-tur" | "tur-to-eng",
    categories: string[],
    letters: string[]
  ) => {
    setGameState({
      currentWordIndex: 0,
      words: [],
      userAnswers: [],
      isGameStarted: false,
      isGameCompleted: false,
      mode,
      selectedCategories: categories,
      selectedLetters: letters,
    });
    setSelectedCategories(categories);
    setSelectedLetters(letters);
    setCurrentView("game");
  };

  const handleGameComplete = (results: any) => {
    setCurrentView("results");
  };

  const handleBackToMenu = () => {
    setCurrentView("menu");
    setGameState({
      currentWordIndex: 0,
      words: [],
      userAnswers: [],
      isGameStarted: false,
      isGameCompleted: false,
      mode: "eng-to-tur",
      selectedCategories: [],
      selectedLetters: [],
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ minHeight: "100vh", py: 2 }}>
          {currentView === "menu" && (
            <MainMenu
              onNavigateToWords={() => setCurrentView("words")}
              onNavigateToGame={() => setCurrentView("categories")}
              onNavigateToTestHistory={() => setCurrentView("testHistory")}
              totalWords={words.length}
              totalCategories={categories.length}
            />
          )}

          {currentView === "words" && (
            <WordManagement
              words={words}
              categories={categories}
              onBack={handleBackToMenu}
              onWordsUpdate={refreshWords}
              onCategoriesUpdate={refreshCategories}
              onNavigateToWordList={() => setCurrentView("word-list")}
            />
          )}

          {currentView === "word-list" && (
            <WordList
              words={words}
              categories={categories}
              onBack={() => setCurrentView("words")}
              onWordsUpdate={refreshWords}
              onCategoriesUpdate={refreshCategories}
            />
          )}

          {currentView === "categories" && (
            <CategorySelection
              categories={categories}
              onBack={handleBackToMenu}
              onCategoriesSelected={(selectedCategories, selectedLetters) => {
                setSelectedCategories(selectedCategories);
                setSelectedLetters(selectedLetters);
                setCurrentView("gameMode");
              }}
            />
          )}

          {currentView === "gameMode" && (
            <GameModeSelection
              selectedCategories={selectedCategories}
              selectedLetters={selectedLetters}
              onBack={() => setCurrentView("categories")}
              onGameStart={handleStartGame}
            />
          )}

          {currentView === "game" && (
            <FlashcardGame
              gameState={gameState}
              words={words}
              onGameComplete={handleGameComplete}
              onBack={() => setCurrentView("gameMode")}
            />
          )}

          {currentView === "results" && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" gutterBottom>
                🎉 Oyun Bitti!
              </Typography>
              <Typography variant="h6" gutterBottom>
                Skorunuz:{" "}
                {gameState.userAnswers
                  ? Math.round(
                      (gameState.userAnswers.filter((a) => a).length /
                        gameState.userAnswers.length) *
                        100
                    )
                  : 0}
              </Typography>
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setCurrentView("gameMode")}
                >
                  Tekrar Oyna
                </Button>
                <Button variant="outlined" onClick={handleBackToMenu}>
                  Ana Menü
                </Button>
              </Box>
            </Box>
          )}

          {currentView === "testHistory" && (
            <TestHistory onBack={handleBackToMenu} />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
