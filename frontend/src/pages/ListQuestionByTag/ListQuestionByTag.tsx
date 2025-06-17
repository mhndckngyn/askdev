import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  Skeleton,
  Fade,
  Chip,
  Button,
} from '@mui/material';
import { ArrowUp, Search } from 'lucide-react';
import QuestionView from './QuestionTag/Questionview';
import InteractionBar from './QuestionTag/InteractionBar';
import { getQuestionsByTag } from './QuestionTag/QuestionServices';
import { ApiResponse } from '@/types';
import { useUserStore } from '../../stores/useUserStore';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { getQuestionTagThemeStyles } from './themeStyles'; // Import the theme styles

const QUESTIONS_PER_PAGE = 10;

export default function ListQuestionByTag() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation('question');
  const { colorScheme } = useMantineColorScheme();
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [displayedQuestions, setDisplayedQuestions] = useState<any[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [descriptionVi, setDescriptionVi] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [tagName, setTagName] = useState<string>('');

  const isDark = colorScheme === 'dark';
  const { user } = useUserStore();
  const currentLang = i18n.language;

  const themeStyles = getQuestionTagThemeStyles(isDark);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredQuestions(allQuestions);
    } else {
      const filtered = allQuestions.filter(
        (question) =>
          question.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.content?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredQuestions(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, allQuestions]);

  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * QUESTIONS_PER_PAGE;
    setDisplayedQuestions(filteredQuestions.slice(startIndex, endIndex));
  }, [filteredQuestions, currentPage]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res: ApiResponse = await getQuestionsByTag(id);
        const questions = res.content.questions || [];
        setAllQuestions(questions);
        setTagName('#' + res.content.tagName.replace(/-/g, ' '));
        setDescriptionVi(res.content.descriptionVi || '');
        setDescriptionEn(res.content.descriptionEn || '');
      } catch (error) {
        console.error('Error fetching questions:', error);
        setAllQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const hasMoreQuestions = displayedQuestions.length < filteredQuestions.length;
  const currentDescription = currentLang?.startsWith('vi')
    ? descriptionVi
    : descriptionEn;

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

      {currentDescription && (
        <Box sx={themeStyles.descriptionSection}>
          <Box sx={themeStyles.description}>{currentDescription}</Box>
        </Box>
      )}

      <Box sx={themeStyles.searchSection}>
        <Box sx={themeStyles.searchContainer}>
          <Box
            component="input"
            type="text"
            placeholder={t('searchQuestions')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={themeStyles.searchInput}
          />
          <Search
            size={20}
            style={themeStyles.searchIcon as React.CSSProperties}
          />
        </Box>
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
      ) : filteredQuestions.length === 0 ? (
        <Box sx={themeStyles.emptyState}>
          <Typography variant="h6">
            {searchTerm ? t('noQuestionsFound') : t('noQuestionsForTag')}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={themeStyles.contentContainer}>
            {displayedQuestions.map((question, index) => (
              <Fade
                in={true}
                timeout={600}
                style={{
                  transitionDelay: `${(index % QUESTIONS_PER_PAGE) * 100}ms`,
                }}
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

          {hasMoreQuestions && (
            <Box sx={themeStyles.loadMoreContainer}>
              <Button
                onClick={handleLoadMore}
                sx={themeStyles.loadMoreButton}
                variant="contained"
                size="large">
                {t('loadMore')}
              </Button>
            </Box>
          )}
        </>
      )}

      {showScrollTop && (
        <Box
          component="button"
          onClick={scrollToTop}
          sx={themeStyles.scrollToTop}
          aria-label="Scroll to top">
          <ArrowUp size={24} />
        </Box>
      )}
    </Box>
  );
}
