import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import {
  PlayArrow,
  LibraryBooks,
  School,
  EmojiEvents,
  History,
} from "@mui/icons-material";

interface MainMenuProps {
  onNavigateToWords: () => void;
  onNavigateToGame: () => void;
  onNavigateToTestHistory: () => void;
  totalWords: number;
  totalCategories: number;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onNavigateToWords,
  onNavigateToGame,
  onNavigateToTestHistory,
  totalWords,
  totalCategories,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          📚 İngilizce Flashcard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Kelimeleri öğren, kendini test et!
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Card elevation={2} sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h5" color="primary">
              {totalWords}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam Kelime
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={2} sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h5" color="secondary">
              {totalCategories}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kategori
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Menu Options */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Card
          elevation={3}
          sx={{
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
          onClick={onNavigateToGame}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <PlayArrow sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Oyuna Başla
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Flash card oyunuyla kelimelerini test et
            </Typography>
            <Chip
              label="En Popüler"
              color="primary"
              size="small"
              icon={<EmojiEvents />}
            />
          </CardContent>
        </Card>

        <Card
          elevation={2}
          sx={{
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
          onClick={onNavigateToWords}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <LibraryBooks
              sx={{ fontSize: 48, color: "secondary.main", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              Kelime Yönetimi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yeni kelimeler ekle ve düzenle
            </Typography>
          </CardContent>
        </Card>

        <Card
          elevation={2}
          sx={{
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
          onClick={onNavigateToTestHistory}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <History sx={{ fontSize: 48, color: "warning.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Test Geçmişi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Geçmiş test sonuçlarını görüntüle
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 4, pt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <School sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }} />
          İngilizce öğrenmenin en eğlenceli yolu
        </Typography>
      </Box>
    </Box>
  );
};

export default MainMenu;
