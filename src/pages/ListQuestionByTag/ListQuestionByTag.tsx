import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Box, Typography, Skeleton, Fade, Chip } from '@mui/material';
import QuestionView from './QuestionTag/Questionview';
import InteractionBar from './QuestionTag/InteractionBar';
import { getQuestionsByTag } from './QuestionTag/QuestionServices';
import { ApiResponse } from '@/types';
import { useUserStore } from '../../stores/useUserStore';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export default function ListQuestionByTag() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('question');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagName, setTagName] = useState<string>('');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useUserStore();

  const getThemeStyles = () => ({
    mainContainer: {
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0c1726 0%, #1a2332 25%, #2c3e50 50%, #34495e 100%)'
        : 'linear-gradient(135deg, #3498db 0%, #2980b9 25%, #1abc9c 50%, #16a085 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark
          ? `radial-gradient(circle at 20% 80%, rgba(52, 152, 219, 0.15) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(26, 188, 156, 0.15) 0%, transparent 50%),
             radial-gradient(circle at 40% 40%, rgba(41, 128, 185, 0.1) 0%, transparent 50%)`
          : `radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
        pointerEvents: 'none',
        zIndex: 0,
      },
    },
    headerSection: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      py: 6,
      px: 3,
    },
    headerTitle: {
      fontSize: { xs: '2.5rem', md: '3.5rem' },
      fontWeight: 800,
      fontFamily:
        '"Inter", "Segoe UI", "Roboto", "Noto Sans", "Arial", sans-serif',
      color: isDark ? '#3498db' : '#ffffff',
      textShadow: isDark
        ? '0 0 30px rgba(52, 152, 219, 0.8), 0 0 60px rgba(52, 152, 219, 0.4)'
        : '0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 10px rgba(0, 0, 0, 0.2)',
      mb: 2,
      transition: 'all 0.3s ease',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      '&:hover': {
        transform: 'scale(1.05)',
        textShadow: isDark
          ? '0 0 40px rgba(52, 152, 219, 1), 0 0 80px rgba(52, 152, 219, 0.6)'
          : '0 6px 30px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.3)',
      },
    },
    tagChip: {
      fontSize: '1.1rem',
      fontWeight: 600,
      fontFamily:
        '"Inter", "Segoe UI", "Roboto", "Noto Sans", "Arial", sans-serif',
      px: 3,
      py: 1,
      background: isDark
        ? 'linear-gradient(45deg, rgba(52, 152, 219, 0.2), rgba(26, 188, 156, 0.2))'
        : 'rgba(255, 255, 255, 0.95)',
      border: isDark
        ? '1px solid rgba(52, 152, 219, 0.3)'
        : '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(10px)',
      borderRadius: '25px',
      color: isDark ? '#3498db' : '#2c3e50',
      boxShadow: isDark
        ? '0 8px 32px rgba(52, 152, 219, 0.2)'
        : '0 8px 32px rgba(0, 0, 0, 0.15)',
      letterSpacing: '0.02em',
    },
    contentContainer: {
      position: 'relative',
      zIndex: 1,
      px: { xs: 2, md: 4 },
      pb: 8,
    },
    questionContainer: {
      mb: 4,
      mx: 'auto',
      maxWidth: '900px',
      background: isDark
        ? 'rgba(28, 40, 51, 0.8)'
        : 'rgba(255, 255, 255, 0.95)',
      borderRadius: '24px',
      overflow: 'hidden',
      position: 'relative',
      backdropFilter: 'blur(20px)',
      border: isDark
        ? '1px solid rgba(52, 152, 219, 0.1)'
        : '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: isDark
        ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(52, 152, 219, 0.1)'
        : '0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: isDark
          ? 'linear-gradient(90deg, #3498db, #1abc9c, #2980b9, #16a085)'
          : 'linear-gradient(90deg, #3498db, #2980b9, #1abc9c, #16a085)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 6s ease infinite',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark
          ? `radial-gradient(circle at 20% 20%, rgba(52, 152, 219, 0.03) 0%, transparent 50%),
             radial-gradient(circle at 80% 80%, rgba(26, 188, 156, 0.03) 0%, transparent 50%)`
          : `radial-gradient(circle at 20% 20%, rgba(52, 152, 219, 0.03) 0%, transparent 50%),
             radial-gradient(circle at 80% 80%, rgba(26, 188, 156, 0.03) 0%, transparent 50%)`,
        pointerEvents: 'none',
        zIndex: 0,
      },
    },
    contentWrapper: {
      position: 'relative',
      zIndex: 1,
      p: 3,
    },
    loadingContainer: {
      position: 'relative',
      zIndex: 1,
      px: { xs: 2, md: 4 },
    },
    loadingSkeleton: {
      mb: 4,
      mx: 'auto',
      maxWidth: '900px',
      borderRadius: '24px',
      height: '200px',
      background: isDark
        ? 'linear-gradient(90deg, rgba(28, 40, 51, 0.8) 25%, rgba(52, 152, 219, 0.1) 50%, rgba(28, 40, 51, 0.8) 75%)'
        : 'linear-gradient(90deg, #f0f8ff 25%, #e6f3ff 50%, #f0f8ff 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite',
    },
    emptyState: {
      textAlign: 'center',
      py: 8,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      fontSize: '1.2rem',
      fontFamily:
        '"Inter", "Segoe UI", "Roboto", "Noto Sans", "Arial", sans-serif',
      fontWeight: 500,
    },
    '@keyframes gradientShift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    '@keyframes gradientText': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    '@keyframes loading': {
      '0%': { backgroundPosition: '200% 0' },
      '100%': { backgroundPosition: '-200% 0' },
    },
  });

  const themeStyles = getThemeStyles();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res: ApiResponse = await getQuestionsByTag(id);
        setQuestions(res.content.questions);
        setTagName(res.content.tagName.replace(/-/g, ' ').toUpperCase());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <Box sx={themeStyles.mainContainer}>
      <Box sx={themeStyles.headerSection}>
        <Typography sx={themeStyles.headerTitle}>
          {t('questionsByTag')}
        </Typography>
        {tagName && (
          <Chip label={tagName} sx={themeStyles.tagChip} variant="outlined" />
        )}
      </Box>

      {loading ? (
        <Box sx={themeStyles.loadingContainer}>
          {[...Array(3)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              sx={themeStyles.loadingSkeleton}
            />
          ))}
        </Box>
      ) : questions.length === 0 ? (
        <Box sx={themeStyles.emptyState}>
          <Typography variant="h6">{t('noQuestionsForTag')}</Typography>
        </Box>
      ) : (
        <Box sx={themeStyles.contentContainer}>
          {questions.map((question, index) => (
            <Fade
              in={true}
              timeout={600}
              style={{ transitionDelay: `${index * 150}ms` }}
              key={question.id}>
              <Paper sx={themeStyles.questionContainer} elevation={0}>
                <Box sx={themeStyles.contentWrapper}>
                  <QuestionView data={question} />
                  {user && <InteractionBar question={question} />}
                </Box>
              </Paper>
            </Fade>
          ))}
        </Box>
      )}
    </Box>
  );
}
