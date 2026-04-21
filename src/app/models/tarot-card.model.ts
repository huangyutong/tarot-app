export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCard {
  name: string;
  en: string;
  num: string;
  emoji: string;
  suit?: Suit;
  upright: string;
  reversed: string;
  keywords: string[];
  rkeywords: string[];
}
