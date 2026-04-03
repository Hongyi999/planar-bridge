import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import './index.scss';

interface AgentThinkingStripProps {
  visible: boolean;
  resultCount?: number;
  onComplete?: () => void;
}

interface Step {
  id: string;
  label: string;
  meta: string;
  status: 'pending' | 'active' | 'done';
  colorVar: string;
}

const STEPS: Omit<Step, 'status'>[] = [
  {
    id: 'intent',
    label: 'Understanding query intent...',
    meta: 'class=Ninja · type=Equipment · rarity=Legendary',
    colorVar: '#6B4C8A',
  },
  {
    id: 'search',
    label: 'Searching FAB database...',
    meta: '4,200+ cards · filtering by class + rarity',
    colorVar: '#9B8644',
  },
  {
    id: 'price',
    label: 'Fetching TCGPlayer market prices...',
    meta: 'cards found · pulling live pricing data',
    colorVar: '#3D7A5E',
  },
];

export default function AgentThinkingStrip({
  visible,
  resultCount,
  onComplete,
}: AgentThinkingStripProps) {
  const [steps, setSteps] = useState<Step[]>(
    STEPS.map(s => ({ ...s, status: 'pending' as const }))
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSteps(STEPS.map(s => ({ ...s, status: 'pending' })));
      setDone(false);
      return;
    }

    setSteps(STEPS.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending' })));
    setDone(false);

    const t1 = setTimeout(() => {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i === 0 ? 'done' : i === 1 ? 'active' : 'pending',
      })));
    }, 800);

    const t2 = setTimeout(() => {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i <= 1 ? 'done' : i === 2 ? 'active' : 'pending',
      })));
    }, 1600);

    const t3 = setTimeout(() => {
      setSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
      setDone(true);
      onComplete?.();
    }, 2400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible]);

  if (!visible) return null;

  return (
    <View className='ts-wrap'>
      {steps.map(step => (
        <View key={step.id} className={`ts-row ts-row--${step.status}`}>
          <View className='ts-shine' />
          <View className='ts-icon-box' style={{ background: `${step.colorVar}12`, borderColor: `${step.colorVar}20` }}>
            <View className='ts-icon-dot' style={{ background: step.colorVar }} />
          </View>
          <View className='ts-body'>
            <Text className='ts-label' style={{ color: step.status === 'active' ? step.colorVar : undefined }}>
              {step.label}
            </Text>
            <Text className='ts-meta'>{step.meta}</Text>
          </View>
          {step.status === 'done' ? (
            <View className='ts-check'>
              <Text className='ts-check-icon'>✓</Text>
            </View>
          ) : step.status === 'active' ? (
            <View className='ts-spinner' />
          ) : null}
        </View>
      ))}

      {done && (
        <View className='ts-summary'>
          <View className='ts-summary-row'>
            <Text className='ts-summary-label'>Agent Summary</Text>
            <Text className='ts-summary-count'>
              {resultCount !== undefined ? `${resultCount} results` : '—'}
            </Text>
          </View>
          <Text className='ts-summary-body'>
            {resultCount
              ? `Found ${resultCount} card${resultCount !== 1 ? 's' : ''} matching your query. Tap any card to see details.`
              : 'No cards matched. Try adjusting your search.'}
          </Text>
        </View>
      )}
    </View>
  );
}
