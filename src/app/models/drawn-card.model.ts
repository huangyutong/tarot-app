import { TarotCard } from './tarot-card.model';

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
}
