import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import BulkUpload from "./BulkUpload";
import {
  ArrowBack,
  Add,
  Upload,
  Download,
  Category as CategoryIcon,
  Delete,
  Edit,
  DeleteForever,
  Warning,
} from "@mui/icons-material";
import { Word, Category } from "../types";
import { wordService } from "../services/wordService";
import { categoryService } from "../services/categoryService";

interface WordManagementProps {
  words: Word[];
  categories: Category[];
  onBack: () => void;
  onWordsUpdate: () => void;
  onCategoriesUpdate: () => void;
  onNavigateToWordList: () => void;
}

const WordManagement: React.FC<WordManagementProps> = ({
  words,
  categories,
  onBack,
  onWordsUpdate,
  onCategoriesUpdate,
  onNavigateToWordList,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [duplicateFilter, setDuplicateFilter] = useState<
    "none" | "english" | "turkish" | "both"
  >("none");
  const [newWord, setNewWord] = useState({
    english: "",
    turkish: "",
    category: "",
  });
  const [bulkText, setBulkText] = useState("");
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#2196F3",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Duplicate detection functions
  const findDuplicateWords = () => {
    const duplicates: Word[] = [];
    const englishSeen = new Map<string, Word[]>();
    const turkishSeen = new Map<string, Word[]>();

    // Group words by english and turkish
    words.forEach((word) => {
      const englishLower = word.english.toLowerCase().trim();
      const turkishLower = word.turkish.toLowerCase().trim();

      if (!englishSeen.has(englishLower)) {
        englishSeen.set(englishLower, []);
      }
      englishSeen.get(englishLower)!.push(word);

      if (!turkishSeen.has(turkishLower)) {
        turkishSeen.set(turkishLower, []);
      }
      turkishSeen.get(turkishLower)!.push(word);
    });

    // Find duplicates based on filter type
    switch (duplicateFilter) {
      case "english":
        englishSeen.forEach((wordList) => {
          if (wordList.length > 1) {
            duplicates.push(...wordList);
          }
        });
        break;
      case "turkish":
        turkishSeen.forEach((wordList) => {
          if (wordList.length > 1) {
            duplicates.push(...wordList);
          }
        });
        break;
      case "both":
        const exactDuplicates = new Set<string>();
        words.forEach((word) => {
          const key = `${word.english.toLowerCase().trim()}|${word.turkish
            .toLowerCase()
            .trim()}`;
          const matchingWords = words.filter(
            (w) =>
              w.english.toLowerCase().trim() ===
                word.english.toLowerCase().trim() &&
              w.turkish.toLowerCase().trim() ===
                word.turkish.toLowerCase().trim()
          );
          if (matchingWords.length > 1 && !exactDuplicates.has(key)) {
            exactDuplicates.add(key);
            duplicates.push(...matchingWords);
          }
        });
        break;
      default:
        return words;
    }

    return Array.from(new Set(duplicates)); // Remove duplicates from duplicates array
  };

  const getDuplicateStats = () => {
    const englishDuplicates = new Set<string>();
    const turkishDuplicates = new Set<string>();
    const exactDuplicates = new Set<string>();

    const englishMap = new Map<string, number>();
    const turkishMap = new Map<string, number>();

    words.forEach((word) => {
      const englishLower = word.english.toLowerCase().trim();
      const turkishLower = word.turkish.toLowerCase().trim();

      englishMap.set(englishLower, (englishMap.get(englishLower) || 0) + 1);
      turkishMap.set(turkishLower, (turkishMap.get(turkishLower) || 0) + 1);

      const exactKey = `${englishLower}|${turkishLower}`;
      const exactCount = words.filter(
        (w) =>
          w.english.toLowerCase().trim() === englishLower &&
          w.turkish.toLowerCase().trim() === turkishLower
      ).length;

      if (exactCount > 1) {
        exactDuplicates.add(exactKey);
      }
    });

    englishMap.forEach((count, word) => {
      if (count > 1) englishDuplicates.add(word);
    });

    turkishMap.forEach((count, word) => {
      if (count > 1) turkishDuplicates.add(word);
    });

    return {
      english: englishDuplicates.size,
      turkish: turkishDuplicates.size,
      exact: exactDuplicates.size,
    };
  };

  const handleDeleteDuplicate = async (wordId: string) => {
    try {
      await wordService.deleteWord(wordId);
      onWordsUpdate();
      onCategoriesUpdate();
      setSnackbar({
        open: true,
        message: "Kelime silindi",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Kelime silinirken hata oluştu",
        severity: "error",
      });
    }
  };

  const handleAddWord = async () => {
    if (!newWord.english.trim() || !newWord.turkish.trim()) {
      setSnackbar({
        open: true,
        message: "İngilizce ve Türkçe kelimeler boş olamaz",
        severity: "error",
      });
      return;
    }

    if (!newWord.category.trim()) {
      setSnackbar({
        open: true,
        message: "Lütfen bir kategori seçin",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const category = newWord.category;
      await wordService.addWord({
        english: newWord.english.trim(),
        turkish: newWord.turkish.trim(),
        category: category,
      });

      // Kategori kelime sayısını güncelle
      await categoryService.updateWordCount(category);

      setNewWord({ english: "", turkish: "", category: "" });
      setShowAddDialog(false);
      onWordsUpdate();
      onCategoriesUpdate();
      setSnackbar({
        open: true,
        message: "Kelime başarıyla eklendi",
        severity: "success",
      });
    } catch (error) {
      console.error("Kelime eklenirken hata:", error);
      setSnackbar({
        open: true,
        message: "Kelime eklenirken hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) {
      setSnackbar({
        open: true,
        message: "Lütfen kelimeler girin",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const lines = bulkText.trim().split("\n");
      const wordsToAdd: {
        english: string;
        turkish: string;
        category: string;
      }[] = [];
      let errorCount = 0;

      for (const line of lines) {
        const parts = line.split(",").map((part) => part.trim());
        if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
          wordsToAdd.push({
            english: parts[0],
            turkish: parts[1],
            category: parts[2],
          });
        } else {
          errorCount++;
        }
      }

      if (wordsToAdd.length === 0) {
        setSnackbar({
          open: true,
          message: "Geçerli kelime formatı bulunamadı",
          severity: "error",
        });
        return;
      }

      await wordService.addWords(wordsToAdd);

      // Kategorilerin kelime sayılarını güncelle
      const uniqueCategories = Array.from(
        new Set(wordsToAdd.map((w) => w.category))
      );
      await Promise.all(
        uniqueCategories.map((category) =>
          categoryService.updateWordCount(category)
        )
      );

      setBulkText("");
      setShowBulkDialog(false);
      onWordsUpdate();
      onCategoriesUpdate();
      setSnackbar({
        open: true,
        message: `${wordsToAdd.length} kelime eklendi${
          errorCount > 0 ? `, ${errorCount} satır atlandı` : ""
        }`,
        severity: "success",
      });
    } catch (error) {
      console.error("Toplu kelime eklenirken hata:", error);
      setSnackbar({
        open: true,
        message: "Kelimeler eklenirken hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setSnackbar({
        open: true,
        message: "Kategori adı boş olamaz",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await categoryService.addCategory({
        name: newCategory.name.trim(),
        color: newCategory.color,
        wordCount: 0,
      });

      setNewCategory({ name: "", color: "#2196F3" });
      setShowCategoryDialog(false);
      onCategoriesUpdate();
      setSnackbar({
        open: true,
        message: "Kategori başarıyla eklendi",
        severity: "success",
      });
    } catch (error) {
      console.error("Kategori eklenirken hata:", error);
      setSnackbar({
        open: true,
        message: "Kategori eklenirken hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (wordId: string, category: string) => {
    try {
      setLoading(true);
      await wordService.deleteWord(wordId);
      await categoryService.updateWordCount(category);
      onWordsUpdate();
      onCategoriesUpdate();
      setSnackbar({
        open: true,
        message: "Kelime silindi",
        severity: "success",
      });
    } catch (error) {
      console.error("Kelime silinirken hata:", error);
      setSnackbar({
        open: true,
        message: "Kelime silinirken hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportWords = () => {
    const csvContent = words
      .map((word) => `${word.english},${word.turkish},${word.category}`)
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "kelimeler.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAllWords = async () => {
    try {
      setLoading(true);

      // Tüm kelimeleri al ve tek tek sil
      const allWords = await wordService.getAllWords();
      let deletedCount = 0;

      for (const word of allWords) {
        try {
          if (word.id) {
            await wordService.deleteWord(word.id);
            deletedCount++;
          }
        } catch (error) {
          console.error(`Kelime silme hatası (${word.english}):`, error);
        }
      }

      // Tüm kategorilerin kelime sayısını sıfırla
      for (const category of categories) {
        try {
          await categoryService.updateWordCount(category.name);
        } catch (error) {
          console.error(
            `Kategori güncelleme hatası (${category.name}):`,
            error
          );
        }
      }

      onWordsUpdate();
      onCategoriesUpdate();
      setShowDeleteAllDialog(false);

      setSnackbar({
        open: true,
        message: `${deletedCount} kelime silindi`,
        severity: "success",
      });
    } catch (error) {
      console.error("Toplu silme hatası:", error);
      setSnackbar({
        open: true,
        message: "Kelimeler silinirken hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = [
    "#2196F3",
    "#4CAF50",
    "#FF5722",
    "#9C27B0",
    "#FF9800",
    "#795548",
    "#F44336",
    "#E91E63",
    "#009688",
    "#FFC107",
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Kelime Yönetimi
          </Typography>
          <IconButton color="inherit" onClick={exportWords}>
            <Download />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* Stats */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 İstatistikler
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip label={`${words.length} kelime`} color="primary" />
              <Chip label={`${categories.length} kategori`} color="secondary" />
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚡ Hızlı İşlemler
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddDialog(true)}
              >
                Kelime Ekle
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setShowBulkDialog(true)}
              >
                Toplu Ekle
              </Button>
              <BulkUpload
                onComplete={() => {
                  onWordsUpdate();
                  onCategoriesUpdate();
                }}
              />
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForever />}
                onClick={() => setShowDeleteAllDialog(true)}
                disabled={words.length === 0}
              >
                Tüm Kelimeleri Sil
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Warning />}
                onClick={() => setShowDuplicatesDialog(true)}
                disabled={words.length === 0}
              >
                Aynı Kelimeleri Bul
              </Button>
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={() => setShowCategoryDialog(true)}
              >
                Kategori Ekle
              </Button>
              <Button
                variant="outlined"
                color="info"
                startIcon={<Edit />}
                onClick={onNavigateToWordList}
              >
                Kelime Listesi
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏷️ Kategoriler
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={`${category.name} (${category.wordCount})`}
                  sx={{
                    backgroundColor: category.color,
                    color: "white",
                    "&:hover": { backgroundColor: category.color },
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Words List */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📝 Kelime Listesi ({words.length})
            </Typography>
            {words.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                Henüz kelime eklenmemiş. Yukarıdaki butonları kullanarak kelime
                ekleyebilirsin.
              </Typography>
            ) : (
              <List>
                {words.slice(0, 50).map((word, index) => (
                  <React.Fragment key={word.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="medium">
                              {word.english}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              →
                            </Typography>
                            <Typography variant="subtitle1">
                              {word.turkish}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Chip
                            label={word.category}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() =>
                            handleDeleteWord(word.id!, word.category)
                          }
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < words.slice(0, 50).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {words.length > 50 && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography
                          color="text.secondary"
                          sx={{ textAlign: "center" }}
                        >
                          ... ve {words.length - 50} kelime daha
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add Word Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yeni Kelime Ekle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="İngilizce Kelime"
            value={newWord.english}
            onChange={(e) =>
              setNewWord({ ...newWord, english: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Türkçe Karşılığı"
            value={newWord.turkish}
            onChange={(e) =>
              setNewWord({ ...newWord, turkish: e.target.value })
            }
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Kategori</InputLabel>
            <Select
              value={newWord.category}
              onChange={(e) =>
                setNewWord({ ...newWord, category: e.target.value })
              }
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>İptal</Button>
          <Button
            onClick={handleAddWord}
            variant="contained"
            disabled={loading}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog
        open={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Toplu Kelime Ekleme</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Her satıra bir kelime yazın. Format: İngilizce,Türkçe,Kategori
            (kategori zorunlu!)
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Örnek: apple,elma,Yiyecekler
          </Typography>
          <Typography variant="body2" color="warning.main" gutterBottom>
            ⚠️ Her kelime için kategori belirtilmelidir. Kategori eksik olanlar
            eklenmeyecektir.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Kelimeler"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            margin="normal"
            placeholder="apple,elma,Yiyecekler&#10;cat,kedi,Hayvanlar&#10;red,kırmızı,Renkler"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkDialog(false)}>İptal</Button>
          <Button
            onClick={handleBulkAdd}
            variant="contained"
            disabled={loading}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Words Dialog */}
      <Dialog
        open={showDeleteAllDialog}
        onClose={() => setShowDeleteAllDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="error" />
          Tüm Kelimeleri Sil
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>DİKKAT!</strong> Bu işlem geri alınamaz.
          </Alert>
          <Typography variant="body1" gutterBottom>
            Sistemdeki <strong>tüm {words.length} kelime</strong> silinecek.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Tüm kelimeler kalıcı olarak silinir • Kategoriler korunur, kelime
            sayıları sıfırlanır • Bu işlem geri alınamaz
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            Emin misiniz? Bu işlem tamamlandıktan sonra yeni kelimeleri toplu
            yükleme yapabilirsiniz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDeleteAllDialog(false)}
            variant="outlined"
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteAllWords}
            variant="contained"
            color="error"
            disabled={loading || words.length === 0}
            startIcon={<DeleteForever />}
          >
            Evet, Tüm Kelimeleri Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog
        open={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yeni Kategori Ekle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Kategori Adı"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            margin="normal"
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Renk Seç:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {categoryColors.map((color) => (
              <Box
                key={color}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: color,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    newCategory.color === color
                      ? "3px solid #000"
                      : "2px solid #ddd",
                }}
                onClick={() => setNewCategory({ ...newCategory, color })}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCategoryDialog(false)}>İptal</Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            disabled={loading}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Words Dialog */}
      <Dialog
        open={showDuplicatesDialog}
        onClose={() => setShowDuplicatesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🔍 Aynı Kelimeler
          <Typography variant="body2" color="text.secondary">
            Sistemdeki tekrar eden kelimeleri bul ve yönet
          </Typography>
        </DialogTitle>
        <DialogContent>
          {/* Duplicate Stats */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Duplikasyon İstatistikleri
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`${getDuplicateStats().english} aynı İngilizce kelime`}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={`${getDuplicateStats().turkish} aynı Türkçe kelime`}
                  color="secondary"
                  size="small"
                />
                <Chip
                  label={`${getDuplicateStats().exact} tam aynı kelime çifti`}
                  color="error"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Filter Options */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Filtreleme Seçenekleri
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant={
                    duplicateFilter === "english" ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setDuplicateFilter("english")}
                >
                  Aynı İngilizce
                </Button>
                <Button
                  variant={
                    duplicateFilter === "turkish" ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setDuplicateFilter("turkish")}
                >
                  Aynı Türkçe
                </Button>
                <Button
                  variant={
                    duplicateFilter === "both" ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setDuplicateFilter("both")}
                >
                  Tam Aynı
                </Button>
                <Button
                  variant={
                    duplicateFilter === "none" ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => setDuplicateFilter("none")}
                >
                  Hepsi
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Duplicate Words List */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📝 Bulunan Kelimeler ({findDuplicateWords().length})
              </Typography>
              <List sx={{ maxHeight: 400, overflow: "auto" }}>
                {findDuplicateWords().length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="Aynı kelime bulunamadı"
                      secondary="Seçilen filtreye göre duplikasyon yok"
                    />
                  </ListItem>
                ) : (
                  findDuplicateWords().map((word) => (
                    <ListItem key={word.id} divider>
                      <ListItemText
                        primary={`${word.english} → ${word.turkish}`}
                        secondary={`Kategori: ${word.category}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteDuplicate(word.id!)}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDuplicatesDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WordManagement;
