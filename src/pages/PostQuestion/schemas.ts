import i18next from 'i18next';

export function getTitleError(value: string): string | null {
  if (value === '') {
    return i18next.t('postQuestion:validate.empty-title');
  }

  return null;
}

export function getTagsError(value: string[]): string | null {
  if (value.length === 0) {
    return i18next.t('postQuestion:validate.no-tags');
  }

  return null;
}
