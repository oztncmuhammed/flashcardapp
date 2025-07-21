import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { Upload, CloudUpload } from "@mui/icons-material";
import { wordService } from "../services/wordService";
import { categoryService } from "../services/categoryService";

interface BulkUploadProps {
  onComplete: () => void;
}

interface WordData {
  english: string;
  turkish: string;
  category: string;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onComplete }) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    categories: number;
  } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const wordsData: WordData[] = JSON.parse(content);
        uploadWords(wordsData);
      } catch (err) {
        setError(
          "JSON dosyası okunamadı. Lütfen geçerli bir JSON dosyası seçin."
        );
      }
    };
    reader.readAsText(file);
  };

  const uploadWords = async (wordsData: WordData[]) => {
    setUploading(true);
    setProgress(0);
    setError("");

    let successCount = 0;
    let failedCount = 0;
    let newCategoriesCount = 0;

    try {
      // Mevcut kategorileri al
      const existingCategories = await categoryService.getAllCategories();
      const categoryNames = existingCategories.map((cat) => cat.name);

      // Yeni kategorileri belirle
      const newCategories = new Set<string>();
      wordsData.forEach((word) => {
        if (!categoryNames.includes(word.category)) {
          newCategories.add(word.category);
        }
      });

      // Yeni kategorileri oluştur
      const colors = [
        "#FF5722",
        "#2196F3",
        "#4CAF50",
        "#FF9800",
        "#9C27B0",
        "#F44336",
        "#009688",
        "#795548",
        "#607D8B",
        "#E91E63",
        "#3F51B5",
        "#8BC34A",
        "#FFC107",
        "#673AB7",
        "#00BCD4",
        "#CDDC39",
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
      ];

      let colorIndex = 0;
      for (const categoryName of Array.from(newCategories)) {
        try {
          await categoryService.addCategory({
            name: categoryName,
            color: colors[colorIndex % colors.length],
            wordCount: 0,
          });
          newCategoriesCount++;
          colorIndex++;
        } catch (err) {
          console.error(`Kategori oluşturma hatası (${categoryName}):`, err);
        }
      }

      // Kelimeleri yükle
      for (let i = 0; i < wordsData.length; i++) {
        try {
          const word = wordsData[i];
          await wordService.addWord({
            english: word.english,
            turkish: word.turkish,
            category: word.category,
          });

          // Kategori kelime sayısını güncelle
          await categoryService.updateWordCount(word.category);

          successCount++;
        } catch (err) {
          console.error(`Kelime yükleme hatası:`, err);
          failedCount++;
        }

        // Progress güncelle
        setProgress(Math.round(((i + 1) / wordsData.length) * 100));
      }

      setResult({
        success: successCount,
        failed: failedCount,
        categories: newCategoriesCount,
      });
    } catch (err) {
      setError("Yükleme sırasında bir hata oluştu: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setError("");
    setProgress(0);
    if (result && result.success > 0) {
      onComplete();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<CloudUpload />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        JSON'dan Toplu Yükle
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>📦 Toplu Kelime Yükleme</DialogTitle>
        <DialogContent>
          {!uploading && !result && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Hazırlanmış JSON dosyasını seçin ve 1400+ kelimeyi otomatik
                olarak yükleyin.
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                • 20 farklı kategori otomatik oluşturulacak • Türkçe
                karşılıkları dahil • Mevcut kelimeler etkilenmez
              </Typography>

              <input
                accept=".json"
                style={{ display: "none" }}
                id="json-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="json-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  fullWidth
                  sx={{ mt: 2, p: 2 }}
                >
                  words_to_upload.json Dosyasını Seç
                </Button>
              </label>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}

          {uploading && (
            <Box>
              <Typography variant="h6" gutterBottom>
                🔄 Yükleme devam ediyor...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                %{progress} tamamlandı
              </Typography>
            </Box>
          )}

          {result && (
            <Box>
              <Typography variant="h6" gutterBottom color="success.main">
                🎉 Yükleme Tamamlandı!
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                <Chip
                  label={`✅ ${result.success} kelime eklendi`}
                  color="success"
                  variant="outlined"
                />
                {result.failed > 0 && (
                  <Chip
                    label={`❌ ${result.failed} hata`}
                    color="error"
                    variant="outlined"
                  />
                )}
                <Chip
                  label={`📁 ${result.categories} yeni kategori`}
                  color="info"
                  variant="outlined"
                />
              </Box>

              <Alert severity="success" sx={{ mt: 2 }}>
                Kelimeler başarıyla sisteme eklendi! Ana menüye dönerek test
                edebilirsiniz.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{result ? "Tamamla" : "İptal"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkUpload;
