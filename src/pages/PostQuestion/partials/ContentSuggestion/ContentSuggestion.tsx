import { useErrorStore } from '@/stores/useErrorStore';
import { Button, Group, List, Skeleton, Stack, Text } from '@mantine/core';
import { IconFlareFilled } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getContentSuggestion } from '../../services';
import styles from './ContentSuggestion.module.css';

type Props = {
  questionTitle: string;
};

export default function ContentSuggestion({ questionTitle }: Props) {
  const { t } = useTranslation('postQuestion');
  const setError = useErrorStore((state) => state.setError);

  const [result, setResult] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) {
      return;
    }

    if (!questionTitle || questionTitle === '') {
      setError(t('suggestion.title-required'));
      return;
    }

    setLoading(true);
    const response = await getContentSuggestion(questionTitle);
    if (response.success) {
      const list = response.content
        .split('\n')
        .filter((line) => line.trim().startsWith('-'))
        .map((line) => line.replace(/^-\s*/, ''));
      setResult(list);
    } else {
      setError(t('suggestion.error-generate'));
    }
    setLoading(false);
  };

  const skeleton = (
    <>
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} height="1rem" mt="sm" />
        ))}
    </>
  );

  return (
    <Group justify="space-between" className={styles.container}>
      <Stack gap="4px">
        <Text className={styles.title}>{t('suggestion.title')}</Text>
        <Text className={styles.description}>
          {t('suggestion.description')}
        </Text>
      </Stack>
      <Button
        onClick={handleSubmit}
        loading={isLoading}
        rightSection={<IconFlareFilled className={styles.buttonIcon} />}>
        {t('suggestion.button')}
      </Button>
      {result.length > 0 && !isLoading && (
        <List spacing="xs">
          {result.map((item, i) => (
            <List.Item key={i}>{item}</List.Item>
          ))}
        </List>
      )}
      {isLoading && skeleton}
    </Group>
  );
}
