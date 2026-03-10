export type SignalSlug = 
  | 'ok'
  | 'stop'
  | 'unwell'
  | 'understand'
  | 'confused'
  | 'anxious';

export interface VisualSignalTranslations {
  ok: string;
  stop: string;
  unwell: string;
  understand: string;
  confused: string;
  anxious: string;
}

export interface SignalDefinition {
  slug: SignalSlug;
  emoji: string;
  color: string;           
  textColor: string;       
  backgroundColor: string; 
  sortOrder: number;
  translationKey: keyof VisualSignalTranslations;
}

export const SIGNAL_REGISTRY: SignalDefinition[] = [
  {
    slug: 'ok',
    emoji: '👍',
    color: '#22c55e',
    textColor: '#ffffff',
    backgroundColor: '#14532d',
    sortOrder: 1,
    translationKey: 'ok',
  },
  {
    slug: 'stop',
    emoji: '✋',
    color: '#ef4444',
    textColor: '#ffffff',
    backgroundColor: '#7f1d1d',
    sortOrder: 2,
    translationKey: 'stop',
  },
  {
    slug: 'unwell',
    emoji: '😟',
    color: '#f97316',
    textColor: '#ffffff',
    backgroundColor: '#7c2d12',
    sortOrder: 3,
    translationKey: 'unwell',
  },
  {
    slug: 'understand',
    emoji: '🤝',
    color: '#3b82f6',
    textColor: '#ffffff',
    backgroundColor: '#1e3a8a',
    sortOrder: 4,
    translationKey: 'understand',
  },
  {
    slug: 'confused',
    emoji: '❓',
    color: '#a855f7',
    textColor: '#ffffff',
    backgroundColor: '#581c87',
    sortOrder: 5,
    translationKey: 'confused',
  },
  {
    slug: 'anxious',
    emoji: '😰',
    color: '#eab308',
    textColor: '#000000',
    backgroundColor: '#713f12',
    sortOrder: 6,
    translationKey: 'anxious',
  },
];

export function getSignalBySlug(slug: SignalSlug): SignalDefinition | undefined {
  return SIGNAL_REGISTRY.find(signal => signal.slug === slug);
}
