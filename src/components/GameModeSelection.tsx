import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Alert,
} from "@mui/material";
import { ArrowBack, Translate, SwapHoriz } from "@mui/icons-material";

interface GameModeSelectionProps {
  selectedCategories: string[];
  selectedLetters: string[];
  onBack: () => void;
  onGameStart: (
    mode: "eng-to-tur" | "tur-to-eng",
    categories: string[],
    letters: string[]
  ) => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({
  selectedCategories,
  selectedLetters,
  onBack,
  onGameStart,
}) => {
  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ mb: 2 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Oyun Modu Seçimi
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Hangi modda oynamak istiyorsun? Her iki modda da kelimeleri karışık
          sırayla göreceksin.
        </Alert>

        {/* Selected Categories Info */}
        <Card elevation={1} sx={{ mb: 4, backgroundColor: "grey.50" }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Seçilen Kategoriler:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {selectedCategories.length === 0 ? (
                <Chip label="Tüm Kategoriler" color="primary" size="small" />
              ) : (
                selectedCategories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                ))
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Game Modes */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Card
            elevation={3}
            sx={{
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
            onClick={() =>
              onGameStart("eng-to-tur", selectedCategories, selectedLetters)
            }
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Typography variant="h4">🇬🇧</Typography>
                <SwapHoriz sx={{ fontSize: 32, color: "primary.main" }} />
                <Typography variant="h4">🇹🇷</Typography>
              </Box>
              <Typography variant="h5" gutterBottom color="primary">
                İngilizce → Türkçe
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                İngilizce kelime gösteriliyor, Türkçe karşılığını buluyorsun
              </Typography>
              <Chip label="Klasik Mod" color="primary" size="small" />
            </CardContent>
          </Card>

          <Card
            elevation={3}
            sx={{
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
            onClick={() =>
              onGameStart("tur-to-eng", selectedCategories, selectedLetters)
            }
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Typography variant="h4">🇹🇷</Typography>
                <SwapHoriz sx={{ fontSize: 32, color: "secondary.main" }} />
                <Typography variant="h4">🇬🇧</Typography>
              </Box>
              <Typography variant="h5" gutterBottom color="secondary">
                Türkçe → İngilizce
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Türkçe kelime gösteriliyor, İngilizce karşılığını buluyorsun
              </Typography>
              <Chip label="Zorlayıcı Mod" color="secondary" size="small" />
            </CardContent>
          </Card>
        </Box>

        {/* Tips */}
        <Box sx={{ mt: 4 }}>
          <Alert severity="success">
            <Typography variant="subtitle2" gutterBottom>
              💡 İpucu:
            </Typography>
            <Typography variant="body2">
              Her iki modda da önce kolay sorularla başlayıp zorluğu
              artırabilirsin. Doğru cevap verdiğin her soru sana puan
              kazandırır!
            </Typography>
          </Alert>
        </Box>
      </Box>
    </Box>
  );
};

export default GameModeSelection;
