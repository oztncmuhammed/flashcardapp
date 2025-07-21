import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Badge,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  TrendingUp,
  History,
  Edit,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { TestHistory as TestHistoryType } from "../types";
import { gameService } from "../services/gameService";

interface TestHistoryProps {
  onBack: () => void;
}

const TestHistory: React.FC<TestHistoryProps> = ({ onBack }) => {
  const [testHistory, setTestHistory] = useState<TestHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await gameService.getTestHistory();
      setTestHistory(history);
    } catch (error) {
      console.error("Test geçmişi yüklenirken hata:", error);
      setError("Test geçmişi yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getModeText = (mode: string) => {
    return mode === "eng-to-tur" ? "İng → Tr" : "Tr → İng";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle />;
    if (score >= 60) return <TrendingUp />;
    return <Cancel />;
  };

  if (loading) {
    return (
      <Box>
        <AppBar position="static" elevation={0} sx={{ mb: 2 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onBack}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Geçmiş Testler
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <AppBar position="static" elevation={0} sx={{ mb: 2 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onBack}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Geçmiş Testler
            </Typography>
          </Toolbar>
        </AppBar>
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ mb: 2 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Geçmiş Testler
          </Typography>
          <Badge badgeContent={testHistory.length} color="secondary">
            <History />
          </Badge>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {testHistory.length === 0 ? (
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <History sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Henüz test yapmamışsın
              </Typography>
              <Typography variant="body2" color="text.secondary">
                İlk testini yap ve ilerlemen burada görünsün!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.light" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Tarih
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Mod
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Kategoriler
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Harfler
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Doğru
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Yanlış
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Düzeltilen
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Skor
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testHistory.map((test, index) => (
                  <TableRow
                    key={test.id || index}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: "action.hover",
                      },
                      "&:hover": {
                        backgroundColor: "action.selected",
                      },
                    }}
                  >
                    {/* Tarih */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {formatDate(test.date)}
                      </Typography>
                    </TableCell>

                    {/* Mod */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={getModeText(test.mode)}
                        color={
                          test.mode === "eng-to-tur" ? "primary" : "secondary"
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Kategoriler */}
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {test.selectedCategories.slice(0, 2).map((category) => (
                          <Chip
                            key={category}
                            size="small"
                            label={category}
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ))}
                        {test.selectedCategories.length > 2 && (
                          <Chip
                            size="small"
                            label={`+${test.selectedCategories.length - 2}`}
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Harfler */}
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {test.selectedLetters.length === 0 ? (
                          <Chip
                            size="small"
                            label="Tümü"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ) : (
                          <>
                            {test.selectedLetters.slice(0, 3).map((letter) => (
                              <Chip
                                key={letter}
                                size="small"
                                label={letter.toUpperCase()}
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            ))}
                            {test.selectedLetters.length > 3 && (
                              <Chip
                                size="small"
                                label={`+${test.selectedLetters.length - 3}`}
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>

                    {/* Doğru */}
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircle color="success" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" color="success.main">
                          {test.correctAnswers}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Yanlış */}
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Cancel color="error" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" color="error.main">
                          {test.wrongAnswers}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Düzeltilen */}
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Edit color="warning" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" color="warning.main">
                          {test.editedWordsCount}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Skor */}
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {getScoreIcon(test.score)}
                        <Typography
                          variant="body2"
                          color={`${getScoreColor(test.score)}.main`}
                          sx={{ fontWeight: "bold" }}
                        >
                          {test.score}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default TestHistory;
