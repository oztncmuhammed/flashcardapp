import React, { useState, useEffect, useMemo } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Grid,
  Paper,
  Divider,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Search,
  ExpandMore,
  FilterList,
  Category as CategoryIcon,
  Delete,
  Edit,
  Clear,
} from "@mui/icons-material";
import { Word, Category } from "../types";
import { wordService } from "../services/wordService";
import { categoryService } from "../services/categoryService";

interface WordListProps {
  words: Word[];
  categories: Category[];
  onBack: () => void;
  onWordsUpdate: () => void;
  onCategoriesUpdate: () => void;
}

const WordList: React.FC<WordListProps> = ({
  words,
  categories,
  onBack,
  onWordsUpdate,
  onCategoriesUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWord, setNewWord] = useState({
    english: "",
    turkish: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Alfabetik harfler
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Filtrelenmiş ve gruplanmış kelimeler
  const filteredAndGroupedWords = useMemo(() => {
    let filtered = words;

    // Arama terimi filtrelemesi
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (word) =>
          word.english.toLowerCase().includes(term) ||
          word.turkish.toLowerCase().includes(term)
      );
    }

    // Kategori filtrelemesi
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((word) =>
        selectedCategories.includes(word.category)
      );
    }

    // Harf filtrelemesi
    if (selectedLetters.length > 0) {
      filtered = filtered.filter((word) => {
        const firstLetter = word.english.charAt(0).toUpperCase();
        return selectedLetters.includes(firstLetter);
      });
    }

    // Kategoriye göre gruplama
    const grouped = filtered.reduce((groups, word) => {
      const category = word.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(word);
      return groups;
    }, {} as Record<string, Word[]>);

    // Her grubu alfabetik olarak sırala
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => a.english.localeCompare(b.english));
    });

    return grouped;
  }, [words, searchTerm, selectedCategories, selectedLetters]);

  // Toplam kelime sayısı
  const totalFilteredWords = Object.values(filteredAndGroupedWords).reduce(
    (total, words) => total + words.length,
    0
  );

  // Kategori toggle
  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Harf toggle
  const handleLetterToggle = (letter: string) => {
    setSelectedLetters((prev) =>
      prev.includes(letter)
        ? prev.filter((l) => l !== letter)
        : [...prev, letter]
    );
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedLetters([]);
  };

  // Kelime ekleme
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

  // Kelime silme
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

  // Kategori rengini getir
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || "#2196F3";
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Kelime Listesi
          </Typography>
          <IconButton color="inherit" onClick={() => setShowAddDialog(true)}>
            <Add />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* Arama ve Filtreler */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            {/* Arama Çubuğu */}
            <TextField
              fullWidth
              placeholder="Kelime ara (İngilizce veya Türkçe)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Kategori Filtreleme */}
            <Typography variant="subtitle2" gutterBottom>
              📁 Kategoriler:
            </Typography>
            <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={`${category.name} (${category.wordCount})`}
                  clickable
                  onClick={() => handleCategoryToggle(category.name)}
                  sx={{
                    backgroundColor: selectedCategories.includes(category.name)
                      ? category.color
                      : "transparent",
                    color: selectedCategories.includes(category.name)
                      ? "white"
                      : category.color,
                    border: `1px solid ${category.color}`,
                    "&:hover": {
                      backgroundColor: category.color,
                      color: "white",
                    },
                  }}
                />
              ))}
            </Box>

            {/* Harf Filtreleme */}
            <Typography variant="subtitle2" gutterBottom>
              🔤 İlk Harf:
            </Typography>
            <Box sx={{ mb: 2 }}>
              <ToggleButtonGroup
                value={selectedLetters}
                onChange={(e, newLetters) => setSelectedLetters(newLetters)}
                sx={{ flexWrap: "wrap", gap: 0.5 }}
                size="small"
              >
                {alphabet.map((letter) => (
                  <ToggleButton
                    key={letter}
                    value={letter}
                    sx={{ minWidth: 40, minHeight: 40 }}
                  >
                    {letter}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Filtre Temizleme ve İstatistikler */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                startIcon={<Clear />}
                disabled={
                  !searchTerm &&
                  selectedCategories.length === 0 &&
                  selectedLetters.length === 0
                }
              >
                Filtreleri Temizle
              </Button>
              <Typography variant="body2" color="text.secondary">
                {totalFilteredWords} kelime gösteriliyor (toplam: {words.length}
                )
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Kelime Listesi */}
        {Object.keys(filteredAndGroupedWords).length === 0 ? (
          <Card elevation={2}>
            <CardContent>
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                {searchTerm ||
                selectedCategories.length > 0 ||
                selectedLetters.length > 0
                  ? "Filtrelere uygun kelime bulunamadı."
                  : "Henüz kelime eklenmemiş."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          Object.entries(filteredAndGroupedWords)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([categoryName, categoryWords]) => (
              <Accordion key={categoryName} defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: getCategoryColor(categoryName),
                    color: "white",
                    "&:hover": {
                      backgroundColor: getCategoryColor(categoryName),
                    },
                  }}
                >
                  <Typography variant="h6">
                    {categoryName} ({categoryWords.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List>
                    {categoryWords.map((word, index) => (
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
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="medium"
                                >
                                  {word.english}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  →
                                </Typography>
                                <Typography variant="subtitle1">
                                  {word.turkish}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              color="error"
                              onClick={() =>
                                handleDeleteWord(word.id!, word.category)
                              }
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < categoryWords.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
        )}
      </Box>

      {/* Kelime Ekleme Dialog */}
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

export default WordList;
