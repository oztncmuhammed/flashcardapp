import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Chip,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  ArrowBack,
  Check,
  Close,
  Visibility,
  VisibilityOff,
  Edit,
} from "@mui/icons-material";
import { Word, GameState } from "../types";
import { wordService } from "../services/wordService";
import { gameService } from "../services/gameService";

interface FlashcardGameProps {
  gameState: GameState;
  words: Word[];
  onGameComplete: (result: any) => void;
  onBack: () => void;
}

const FlashcardGame: React.FC<FlashcardGameProps> = ({
  gameState,
  words,
  onGameComplete,
  onBack,
}) => {
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Edit word dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editEnglish, setEditEnglish] = useState("");
  const [editTurkish, setEditTurkish] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editedWordsCount, setEditedWordsCount] = useState(0);

  useEffect(() => {
    initializeGame();
  }, [gameState]);

  const initializeGame = async () => {
    try {
      setLoading(true);

      console.log("🎮 Oyun başlatılıyor...");
      console.log("📋 Seçilen kategoriler:", gameState.selectedCategories);
      console.log("🔤 Seçilen harfler:", gameState.selectedLetters);

      // Seçilen kategorilere ve harflere göre kelimeleri getir
      let wordsToPlay: Word[] = [];
      wordsToPlay = await wordService.getWordsByCategoriesAndLetters(
        gameState.selectedCategories,
        gameState.selectedLetters
      );

      console.log("📚 Bulunan kelime sayısı:", wordsToPlay.length);
      console.log(
        "📖 İlk 5 kelime:",
        wordsToPlay.slice(0, 5).map((w) => `${w.english} (${w.category})`)
      );

      // Kategorileri de yükle (edit için)
      const allWords = await wordService.getAllWords();
      const uniqueCategories = Array.from(
        new Set(allWords.map((word: Word) => word.category))
      );
      setAllCategories(uniqueCategories);

      console.log("🗂️ Toplam kelime sayısı DB'de:", allWords.length);
      console.log("📂 Mevcut kategoriler:", uniqueCategories);

      // Kelimeleri karıştır
      const shuffledWords = gameService.shuffleWords(wordsToPlay);
      setCurrentWords(shuffledWords);
      setUserAnswers(new Array(shuffledWords.length).fill(false));
      setCurrentIndex(0);
      setUserAnswer("");
      setShowAnswer(false);
      setIsAnswered(false);

      console.log("✅ Oyun başarıyla başlatıldı!");
    } catch (error) {
      console.error("❌ Oyun başlatılırken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWord = () => {
    return currentWords[currentIndex];
  };

  const getQuestionText = () => {
    const word = getCurrentWord();
    if (!word) return "";

    return gameState.mode === "eng-to-tur" ? word.english : word.turkish;
  };

  const getCorrectAnswer = () => {
    const word = getCurrentWord();
    if (!word) return "";

    return gameState.mode === "eng-to-tur" ? word.turkish : word.english;
  };

  const checkAnswer = () => {
    const correct =
      userAnswer.trim().toLowerCase() === getCorrectAnswer().toLowerCase();
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = correct;
    setUserAnswers(newAnswers);
    setIsAnswered(true);
    setShowAnswer(true);
    return correct;
  };

  const handleSubmitAnswer = () => {
    if (userAnswer.trim() === "") return;
    checkAnswer();
  };

  const handleNextQuestion = () => {
    if (currentIndex < currentWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowAnswer(false);
      setIsAnswered(false);
    } else {
      // Oyun bitti
      finishGame();
    }
  };

  const finishGame = async () => {
    try {
      const result = gameService.calculateQuizResult(userAnswers);

      // İstatistikleri kaydet
      await gameService.saveGameStats({
        mode: gameState.mode,
        categories: gameState.selectedCategories,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        score: result.score,
      });

      // Test geçmişini kaydet
      await gameService.saveTestHistory({
        date: new Date(),
        mode: gameState.mode,
        selectedCategories: gameState.selectedCategories,
        selectedLetters: gameState.selectedLetters,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        score: result.score,
        percentage: result.percentage,
        editedWordsCount: editedWordsCount,
      });

      onGameComplete(result);
    } catch (error) {
      console.error("Oyun sonuçlandırılırken hata:", error);
      onGameComplete(gameService.calculateQuizResult(userAnswers));
    }
  };

  // Edit word functions
  const handleEditWord = () => {
    const currentWord = getCurrentWord();
    if (currentWord) {
      setEditEnglish(currentWord.english);
      setEditTurkish(currentWord.turkish);
      setEditCategory(currentWord.category);
      setShowEditDialog(true);
    }
  };

  const handleSaveEditedWord = async () => {
    if (!editEnglish.trim() || !editTurkish.trim() || !editCategory.trim()) {
      return;
    }

    try {
      setEditLoading(true);
      const currentWord = getCurrentWord();

      if (currentWord && currentWord.id) {
        const updatedWord: Word = {
          ...currentWord,
          english: editEnglish.trim(),
          turkish: editTurkish.trim(),
          category: editCategory.trim(),
        };

        await wordService.updateWord(currentWord.id, updatedWord);

        // Güncellenen kelimeyi current words listesinde de güncelle
        const updatedWords = [...currentWords];
        updatedWords[currentIndex] = updatedWord;
        setCurrentWords(updatedWords);

        // Düzeltilen kelime sayısını artır
        setEditedWordsCount((prev) => prev + 1);

        setShowEditDialog(false);
      } else {
        console.error("Kelime ID'si bulunamadı");
      }
    } catch (error) {
      console.error("Kelime güncellenirken hata:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditEnglish("");
    setEditTurkish("");
    setEditCategory("");
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !isAnswered && userAnswer.trim() !== "") {
      handleSubmitAnswer();
    }
  };

  const getProgress = () => {
    return currentWords.length > 0
      ? ((currentIndex + 1) / currentWords.length) * 100
      : 0;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Typography>Oyun hazırlanıyor...</Typography>
      </Box>
    );
  }

  if (currentWords.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">
          <Typography variant="h6">Kelime Bulunamadı</Typography>
          <Typography>
            Seçtiğin kategorilerde henüz kelime yok. Önce kelime eklemelisin.
          </Typography>
          <Button onClick={onBack} sx={{ mt: 2 }}>
            Geri Dön
          </Button>
        </Alert>
      </Box>
    );
  }

  const currentWord = getCurrentWord();
  const isLastQuestion = currentIndex === currentWords.length - 1;

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setShowExitDialog(true)}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {gameState.mode === "eng-to-tur" ? "İng → Tür" : "Tür → İng"}
          </Typography>
          <Typography variant="body2">
            {currentIndex + 1} / {currentWords.length}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Progress */}
      <LinearProgress
        variant="determinate"
        value={getProgress()}
        sx={{ height: 6 }}
      />

      <Box sx={{ p: 2 }}>
        {/* Question Card */}
        <Card elevation={3} sx={{ mb: 3, minHeight: 200 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {gameState.mode === "eng-to-tur"
                ? "İngilizce kelime:"
                : "Türkçe kelime:"}
            </Typography>
            <Typography
              variant="h3"
              component="div"
              sx={{ my: 3, fontWeight: "bold" }}
            >
              {getQuestionText()}
            </Typography>
            <Chip
              label={currentWord?.category}
              color="primary"
              size="small"
              variant="outlined"
            />
          </CardContent>
        </Card>

        {/* Answer Input */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              label={
                gameState.mode === "eng-to-tur"
                  ? "Türkçe karşılığı"
                  : "İngilizce karşılığı"
              }
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isAnswered}
              variant="outlined"
              size="medium"
              autoFocus
              sx={{ mb: 2 }}
            />

            {!isAnswered && (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubmitAnswer}
                disabled={userAnswer.trim() === ""}
                sx={{ py: 1.5 }}
              >
                Cevabı Kontrol Et
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Answer Feedback */}
        {showAnswer && (
          <Card
            elevation={2}
            sx={{
              mb: 3,
              backgroundColor: userAnswers[currentIndex]
                ? "success.light"
                : "error.light",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                {userAnswers[currentIndex] ? (
                  <>
                    <Check sx={{ fontSize: 32 }} />
                    <Typography variant="h5">Doğru!</Typography>
                  </>
                ) : (
                  <>
                    <Close sx={{ fontSize: 32 }} />
                    <Typography variant="h5">Yanlış!</Typography>
                  </>
                )}
              </Box>
              <Typography variant="h6">
                Doğru cevap: {getCorrectAnswer()}
              </Typography>
              {!userAnswers[currentIndex] && userAnswer.trim() !== "" && (
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Senin cevabın: {userAnswer}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Button and Edit Button */}
        {isAnswered && (
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEditWord}
              sx={{
                flex: 1,
                py: 1.5,
                borderColor: "warning.main",
                color: "warning.main",
                "&:hover": {
                  borderColor: "warning.dark",
                  backgroundColor: "warning.light",
                },
              }}
            >
              Kelimeyi Düzelt
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleNextQuestion}
              sx={{ flex: 2, py: 1.5 }}
            >
              {isLastQuestion ? "Oyunu Bitir" : "Sonraki Soru"}
            </Button>
          </Box>
        )}
      </Box>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle>Oyundan Çık</DialogTitle>
        <DialogContent>
          <Typography>
            Oyundan çıkmak istediğine emin misin? İlerlediğin tüm veriler
            kaybolacak.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExitDialog(false)}>İptal</Button>
          <Button onClick={onBack} color="error">
            Çık
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Word Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Edit color="warning" />
            <Typography variant="h6">Kelimeyi Düzenle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="İngilizce"
            value={editEnglish}
            onChange={(e) => setEditEnglish(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Türkçe"
            value={editTurkish}
            onChange={(e) => setEditTurkish(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Kategori</InputLabel>
            <Select
              value={editCategory}
              label="Kategori"
              onChange={(e) => setEditCategory(e.target.value)}
            >
              {allCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCancelEdit} disabled={editLoading}>
            İptal
          </Button>
          <Button
            onClick={handleSaveEditedWord}
            variant="contained"
            disabled={
              editLoading ||
              !editEnglish.trim() ||
              !editTurkish.trim() ||
              !editCategory.trim()
            }
            color="warning"
          >
            {editLoading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlashcardGame;
