import { useErrorStore } from '@/stores/useErrorStore';
import {
  CheckIcon,
  Combobox,
  Group,
  Input,
  Loader,
  Pill,
  PillsInput,
  Space,
  useCombobox,
} from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchTags } from '../../services';
import { TagData } from '../../PostQuestion';

type TagPickerProps = {
  existingTags: TagData[]; // 1 mục gồm tên và id
  newTags: string[]; // được người dùng tự thêm
  updateChosenExistingTags: (value: TagData[]) => void;
  updateChosenNewTags: (value: string[]) => void;
};

interface TagResult extends TagData {} // interface vì kết quả trả về sẽ có nhiều data hơn

const SEARCH_DELAY_MS = 300;
const MAX_TAGS = 5;

export default function TagPicker({
  existingTags,
  newTags,
  updateChosenExistingTags,
  updateChosenNewTags,
}: TagPickerProps) {
  const { t } = useTranslation('postQuestion');
  const setError = useErrorStore((state) => state.setError);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [inputValue, setInputValue] = useState(''); // cập nhật khi user gõ
  const [query, setQuery] = useState(''); // cụm từ cần tìm kiếm (set bằng giá trị inputValue sau delay)
  const [tagSearchResults, setTagSearchResults] = useState<TagResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    const response = await searchTags(query);
    if (response.success) {
      setTagSearchResults(response.content.tags);
    } else {
      console.error(response);
      setTagSearchResults([]);
    }
  };

  // Delay search
  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery(inputValue);
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(handler);
  }, [inputValue]);

  // Search for tags
  useEffect(() => {
    if (query.trim() === '') {
      return;
    }
    setLoading(true);
    handleQuery();
    setLoading(false);
  }, [query]);

  const isInSelectedExistingTags = (value: string) => {
    return !!existingTags.find((tag) => tag.name === value); // !! để chuyển đổi sang boolean
  };

  const isInSelectedNewTags = (value: string) => {
    return newTags.includes(value);
  };

  // Remove existing tag
  const handleTagRemove = (tag: string | TagData) => {
    if (typeof tag === 'string') {
      const filtered = newTags.filter((name) => tag !== name);
      updateChosenNewTags(filtered);
    } else {
      const filtered = existingTags.filter((t) => t.name !== tag.name);
      updateChosenExistingTags(filtered);
    }
  };

  const isExceedingTagLimit = existingTags.length + newTags.length >= MAX_TAGS;

  // Chọn tag từ danh sách dropdown
  const handleTagSelect = (tag: string | TagData) => {
    const name = typeof tag === 'string' ? tag : tag.name;
    if (isInSelectedExistingTags(name) || isInSelectedNewTags(name)) {
      handleTagRemove(name); // nếu chọn cái đã có thì xóa
    } else {
      if (isExceedingTagLimit) {
        setError(t('tags.max-tags'));
      } else {
        if (typeof tag === 'string') {
          updateChosenNewTags([...newTags, tag]);
        } else {
          updateChosenExistingTags([...existingTags, tag]);
        }
      }
    }
  };

  const selectedTags = [...existingTags, ...newTags].map((tag, index) => (
    <Pill key={index} withRemoveButton onRemove={() => handleTagRemove(tag)}>
      {typeof tag === 'string' ? tag : tag.name}
    </Pill>
  ));

  // Mục dropdown tag được trả về từ kết quả tìm kiếm
  const tagResults = tagSearchResults.map((item) => {
    const isActive = isInSelectedExistingTags(item.name);

    return (
      <Combobox.Option
        key={item.id}
        value={item.name}
        active={isActive}
        onClick={() => handleTagSelect(item)}>
        <Group gap="sm">
          {isActive ? <CheckIcon size={12} /> : null}
          <span>{item.name}</span>
        </Group>
      </Combobox.Option>
    );
  });

  return (
    <div>
      <Input.Label required>{t('tags.tag-select')}</Input.Label>
      <Input.Description>{t('tags.tag-description')}</Input.Description>
      <Space h="xs" />
      <Combobox store={combobox}>
        <Combobox.DropdownTarget>
          <PillsInput onClick={() => combobox.openDropdown()}>
            <Pill.Group>
              {selectedTags}{' '}
              {/* danh sach tag đã chọn, bao gồm có và chưa có trong db */}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  onFocus={() => combobox.openDropdown()}
                  onBlur={() => combobox.closeDropdown()}
                  value={inputValue}
                  placeholder={t('tags.search-tag')}
                  onChange={(event) => {
                    combobox.updateSelectedOptionIndex();
                    setInputValue(event.currentTarget.value);
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>
        <Combobox.Dropdown>
          <Combobox.Options>
            {loading ? (
              <Combobox.Empty>
                <Loader size="xs" />
              </Combobox.Empty>
            ) : query.trim() === '' ? (
              <Combobox.Empty>
                {t('tags.search-for-tag-suggestion')}
              </Combobox.Empty>
            ) : tagResults.length > 0 ? (
              tagResults
            ) : (
              <Combobox.Option
                value={query}
                onClick={() => {
                  handleTagSelect(query);
                }}>
                <Group>
                  {isInSelectedNewTags(query) ? (
                    <>
                      <IconMinus size="16" /> {t('tags.remove')} "{query}"{' '}
                      {/* nếu đã tồn tại thì cho phép xóa */}
                    </>
                  ) : (
                    <>
                      <IconPlus size="16" /> {t('tags.add')} "{query}"{' '}
                      {/* nếu không tồn tại thì cho phép thêm */}
                    </>
                  )}
                </Group>
              </Combobox.Option>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </div>
  );
}
