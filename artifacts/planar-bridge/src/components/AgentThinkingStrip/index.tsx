import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import type { ThinkingStep } from '../../types';
import './index.scss';

interface AgentThinkingStripProps {
  visible: boolean;
  resultCount?: number;
  onComplete?: () => void;
}

const STEPS: ThinkingStep[] = [
  { icon: '🧠', text: 'Understanding your query...', status: 'pending' },
  { icon: '🔍', text: 'Searching FAB card database...', status: 'pending' },
  { icon: '💰', text: 'Checking prices...', status: 'pending' },
];

export default function AgentThinkingStrip({ visible, resultCount, onComplete }: AgentThinkingStripProps) {
  const [steps, setSteps] = useState<ThinkingStep[]>(STEPS.map(s => ({ ...s })));
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSteps(STEPS.map(s => ({ ...s })));
      setCurrentStep(0);
      setDone(false);
      return;
    }

    setSteps(STEPS.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending' })));
    setCurrentStep(0);
    setDone(false);

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i === 0 ? 'done' : i === 1 ? 'active' : 'pending',
      })));
      setCurrentStep(1);
    }, 800));

    timers.push(setTimeout(() => {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i <= 1 ? 'done' : i === 2 ? 'active' : 'pending',
      })));
      setCurrentStep(2);
    }, 1600));

    timers.push(setTimeout(() => {
      setSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
      setDone(true);
      onComplete?.();
    }, 2400));

    return () => timers.forEach(clearTimeout);
  }, [visible]);

  if (!visible) return null;

  return (
    <View className='thinking-strip'>
      <View className='thinking-strip__inner'>
        {!done ? (
          <View className='thinking-strip__steps'>
            {steps.map((step, i) => (
              <View
                key={i}
                className={`thinking-strip__step thinking-strip__step--${step.status}`}
              >
                <Text className='thinking-strip__step-icon'>{step.icon}</Text>
                <Text className='thinking-strip__step-text'>{step.text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className='thinking-strip__done'>
            <Text className='thinking-strip__done-icon'>✦</Text>
            <Text className='thinking-strip__done-text'>
              {resultCount !== undefined
                ? resultCount > 0
                  ? `Found ${resultCount} card${resultCount !== 1 ? 's' : ''}`
                  : 'No cards found'
                : 'Search complete'}
            </Text>
          </View>
        )}
        {!done && (
          <View className='thinking-strip__progress'>
            <View
              className='thinking-strip__progress-bar'
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
