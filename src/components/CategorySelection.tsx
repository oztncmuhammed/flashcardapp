import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Checkbox,
  FormControlLabel,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Alert,
} from "@mui/material";
import { ArrowBack, SelectAll, Clear } from "@mui/icons-material";
import { Category } from "../types";
import { wordService } from "../services/wordService";

interface CategorySelectionProps {
  categories: Category[];
  onBack: () => void;
  onCategoriesSelected: (
    selectedCategories: string[],
    selectedLetters: string[]
  ) => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  categories,
  onBack,
  onCategoriesSelected,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllLetters, setSelectAllLetters] = useState(false);
  const [filteredWordCount, setFilteredWordCount] = useState(0);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (selectAll) {
      setSelectedCategories(categories.map((cat) => cat.name));
    } else {
      setSelectedCategories([]);
    }
  }, [selectAll, categories]);

  // Filtrelenmiş kelime sayısını hesapla
  useEffect(() => {
    if (categories.length > 0) {
      calculateFilteredWordCount();
    }
  }, [selectedCategories, selectedLetters, categories]);

  // İlk yüklemede hesapla
  useEffect(() => {
    if (categories.length > 0) {
      calculateFilteredWordCount();
    }
  }, [categories]);

  const calculateFilteredWordCount = async () => {
    try {
      setIsCalculating(true);

      console.log("🔍 Filtrelenmiş kelime sayısı hesaplanıyor...");
      console.log("📋 Seçilen kategoriler:", selectedCategories);
      console.log("🔤 Seçilen harfler:", selectedLetters);

      // Kategorilere göre kelimeleri getir
      const categoriesToUse =
        selectedCategories.length === 0
          ? categories.map((cat) => cat.name)
          : selectedCategories;

      console.log("📂 Kullanılacak kategoriler:", categoriesToUse);

      const words = await wordService.getWordsByCategoriesAndLetters(
        categoriesToUse,
        selectedLetters
      );

      // Filtrelenmiş kategorileri hesapla (gerçekten kelimesi olan kategoriler)
      const uniqueFilteredCategories = Array.from(
        new Set(words.map((word) => word.category))
      );

      console.log("📊 Bulunan kelime sayısı:", words.length);
      console.log("📂 Aktif kategori sayısı:", uniqueFilteredCategories.length);
      console.log("📂 Aktif kategoriler:", uniqueFilteredCategories);

      setFilteredWordCount(words.length);
      setFilteredCategories(uniqueFilteredCategories);
    } catch (error) {
      console.error("Filtrelenmiş kelime sayısı hesaplanırken hata:", error);
      // Fallback: basit hesaplama
      setFilteredWordCount(getTotalWordsBasic());
      setFilteredCategories(
        selectedCategories.length === 0
          ? categories.map((cat) => cat.name)
          : selectedCategories
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((name) => name !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectAll(false);
  };

  const handleLetterToggle = (letter: string) => {
    setSelectedLetters((prev) => {
      if (prev.includes(letter)) {
        return prev.filter((l) => l !== letter);
      } else {
        return [...prev, letter];
      }
    });
  };

  const handleSelectAllLetters = () => {
    if (selectAllLetters) {
      setSelectedLetters([]);
    } else {
      const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      setSelectedLetters(allLetters);
    }
    setSelectAllLetters(!selectAllLetters);
  };

  const handleClearAllLetters = () => {
    setSelectedLetters([]);
    setSelectAllLetters(false);
  };

  const handleContinue = () => {
    const categoriesToSend =
      selectedCategories.length === 0
        ? categories.map((cat) => cat.name)
        : selectedCategories;

    onCategoriesSelected(categoriesToSend, selectedLetters);
  };

  const getTotalWordsBasic = () => {
    if (selectedCategories.length === 0) {
      return categories.reduce((total, cat) => total + cat.wordCount, 0);
    }
    return categories
      .filter((cat) => selectedCategories.includes(cat.name))
      .reduce((total, cat) => total + cat.wordCount, 0);
  };

  const getTotalWords = () => {
    return isCalculating ? getTotalWordsBasic() : filteredWordCount;
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ mb: 2 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Kategori Seçimi
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Hangi kategorilerden test yapmak istiyorsun? Hiçbirini seçmezsen tüm
          kategorilerden soru gelir.
        </Alert>

        {/* Controls */}
        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<SelectAll />}
            onClick={handleSelectAll}
            size="small"
          >
            {selectAll ? "Hiçbirini Seçme" : "Tümünü Seç"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClearAll}
            size="small"
          >
            Temizle
          </Button>
          <Chip
            label={`${selectedCategories.length} kategori seçili`}
            color={selectedCategories.length > 0 ? "primary" : "default"}
            size="small"
          />
        </Box>

        {/* Categories */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          {categories.map((category) => (
            <Card
              key={category.id}
              elevation={selectedCategories.includes(category.name) ? 3 : 1}
              sx={{
                cursor: "pointer",
                border: selectedCategories.includes(category.name)
                  ? `2px solid ${category.color}`
                  : "2px solid transparent",
                transition: "all 0.2s",
              }}
              onClick={() => handleCategoryToggle(category.name)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={selectedCategories.includes(category.name)}
                    sx={{ p: 0 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.wordCount} kelime
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: category.color,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Letter Selection */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔤 Harf Seçimi (Opsiyonel)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hangi harfle başlayan kelimeleri test etmek istiyorsun? Seçmezsen
              tüm harflerden gelir.
            </Typography>

            {/* Letter Controls */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSelectAllLetters}
              >
                {selectAllLetters ? "Hiçbirini Seçme" : "Tümünü Seç"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearAllLetters}
              >
                Temizle
              </Button>
              <Chip
                label={`${selectedLetters.length} harf seçili`}
                color={selectedLetters.length > 0 ? "secondary" : "default"}
                size="small"
              />
            </Box>

            {/* Alphabet Grid */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                <Button
                  key={letter}
                  variant={
                    selectedLetters.includes(letter) ? "contained" : "outlined"
                  }
                  size="small"
                  onClick={() => handleLetterToggle(letter)}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  {letter}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card
          elevation={2}
          sx={{ mb: 3, backgroundColor: "primary.light", color: "white" }}
        >
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h6">
              Toplam {getTotalWords()} kelime ile test yapılacak
              {isCalculating && " (hesaplanıyor...)"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isCalculating
                ? selectedCategories.length === 0
                  ? "Tüm kategorilerden"
                  : `${selectedCategories.length} kategoriden`
                : `${filteredCategories.length} kategoriden`}{" "}
              sorular gelecek
            </Typography>
            {selectedLetters.length > 0 && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                📝 Sadece {selectedLetters.join(", ")} harfleriyle başlayan
                kelimeler
                {isCalculating && " (hesaplanıyor...)"}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleContinue}
          disabled={getTotalWords() === 0}
          sx={{ py: 1.5 }}
        >
          Devam Et ({getTotalWords()} kelime)
        </Button>
      </Box>
    </Box>
  );
};

export default CategorySelection;
