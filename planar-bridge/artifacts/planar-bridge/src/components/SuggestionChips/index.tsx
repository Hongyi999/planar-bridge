import { View, Text, ScrollView } from '@tarojs/components';
import { SUGGESTION_QUERIES } from '../../api/fabdb';
import './index.scss';

interface SuggestionChipsProps {
  onSelect: (query: string) => void;
}

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <ScrollView scrollX className='suggestion-chips' showScrollbar={false}>
      <View className='suggestion-chips__inner'>
        {SUGGESTION_QUERIES.map((suggestion, i) => (
          <View
            key={i}
            className='suggestion-chips__chip'
            onClick={() => onSelect(suggestion.query)}
            style={{ animationDelay: `${i * 80 + 200}ms` }}
          >
            <Text className='suggestion-chips__chip-text'>{suggestion.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
