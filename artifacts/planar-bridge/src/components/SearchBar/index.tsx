import { View, Text, Input } from '@tarojs/components';
import { useState } from 'react';
import './index.scss';

interface SearchBarProps {
  value: string;
  onInput: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  isCompact?: boolean;
}

export default function SearchBar({
  value,
  onInput,
  onSearch,
  placeholder = '描述你想要的卡牌...',
  isCompact = false,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  const handleConfirm = () => {
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <View className={`search-bar ${focused ? 'search-bar--focused' : ''} ${isCompact ? 'search-bar--compact' : ''}`}>
      <View className='search-bar__icon'>
        <Text className='search-bar__icon-text'>✦</Text>
      </View>
      <Input
        className='search-bar__input'
        value={value}
        placeholder={placeholder}
        placeholderClass='search-bar__placeholder'
        onInput={e => onInput(e.detail.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onConfirm={handleConfirm}
        confirmType='search'
        adjustPosition={false}
      />
      {value ? (
        <View className='search-bar__clear' onClick={() => onInput('')}>
          <Text className='search-bar__clear-text'>✕</Text>
        </View>
      ) : null}
      {isCompact && value ? (
        <View className='search-bar__submit' onClick={handleConfirm}>
          <Text className='search-bar__submit-text'>→</Text>
        </View>
      ) : null}
    </View>
  );
}
