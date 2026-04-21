import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { TarotCard } from '../../models/tarot-card.model';
import { TAROT_DECK } from '../../data/tarot-deck.data';

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

// ── Sprite sheet map ─────────────────────────────────────────────────────────
// Maps card English name → { file, col, row, cols, rows }
// 2.png = Wands  (4 cols × 3 rows)
// 3.png = Cups   (4 cols × 3 rows)
// 4.png = Major Arcana (4 cols × 4 rows, last row has 1 card)
const SPRITE_MAP: Record<string, { file: string; col: number; row: number; cols: number; rows: number }> = {
  // Major Arcana → 4.png
  'The Fool':           { file: '4', col: 0, row: 0, cols: 4, rows: 4 },
  'The Magician':       { file: '4', col: 1, row: 0, cols: 4, rows: 4 },
  'The High Priestess': { file: '4', col: 2, row: 0, cols: 4, rows: 4 },
  'The Empress':        { file: '4', col: 3, row: 0, cols: 4, rows: 4 },
  'The Hierophant':     { file: '4', col: 0, row: 1, cols: 4, rows: 4 },
  'The Lovers':         { file: '4', col: 1, row: 1, cols: 4, rows: 4 },
  'The Chariot':        { file: '4', col: 2, row: 1, cols: 4, rows: 4 },
  'Strength':           { file: '4', col: 3, row: 1, cols: 4, rows: 4 },
  'Wheel of Fortune':   { file: '4', col: 0, row: 2, cols: 4, rows: 4 },
  'Justice':            { file: '4', col: 1, row: 2, cols: 4, rows: 4 },
  'The Hanged Man':     { file: '4', col: 2, row: 2, cols: 4, rows: 4 },
  'Death':              { file: '4', col: 3, row: 2, cols: 4, rows: 4 },
  'The World':          { file: '4', col: 0, row: 3, cols: 4, rows: 4 },

  // Wands → 2.png
  'Ace of Wands':       { file: '2', col: 0, row: 0, cols: 4, rows: 3 },
  'Two of Wands':       { file: '2', col: 1, row: 0, cols: 4, rows: 3 },
  'Three of Wands':     { file: '2', col: 2, row: 0, cols: 4, rows: 3 },
  'Four of Wands':      { file: '2', col: 3, row: 0, cols: 4, rows: 3 },
  'Five of Wands':      { file: '2', col: 0, row: 1, cols: 4, rows: 3 },
  'Six of Wands':       { file: '2', col: 1, row: 1, cols: 4, rows: 3 },
  'Seven of Wands':     { file: '2', col: 2, row: 1, cols: 4, rows: 3 },
  'Eight of Wands':     { file: '2', col: 3, row: 1, cols: 4, rows: 3 },
  'Nine of Wands':      { file: '2', col: 0, row: 2, cols: 4, rows: 3 },
  'Ten of Wands':       { file: '2', col: 1, row: 2, cols: 4, rows: 3 },
  'Queen of Wands':     { file: '2', col: 2, row: 2, cols: 4, rows: 3 },
  'King of Wands':      { file: '2', col: 3, row: 2, cols: 4, rows: 3 },

  // Cups → 3.png
  'Ace of Cups':        { file: '3', col: 0, row: 0, cols: 4, rows: 3 },
  'Two of Cups':        { file: '3', col: 1, row: 0, cols: 4, rows: 3 },
  'Three of Cups':      { file: '3', col: 2, row: 0, cols: 4, rows: 3 },
  'Four of Cups':       { file: '3', col: 3, row: 0, cols: 4, rows: 3 },
  'Five of Cups':       { file: '3', col: 0, row: 1, cols: 4, rows: 3 },
  'Six of Cups':        { file: '3', col: 1, row: 1, cols: 4, rows: 3 },
  'Seven of Cups':      { file: '3', col: 2, row: 1, cols: 4, rows: 3 },
  'Eight of Cups':      { file: '3', col: 3, row: 1, cols: 4, rows: 3 },
  'Nine of Cups':       { file: '3', col: 0, row: 2, cols: 4, rows: 3 },
  'Ten of Cups':        { file: '3', col: 1, row: 2, cols: 4, rows: 3 },
  'Page of Cups':       { file: '3', col: 2, row: 2, cols: 4, rows: 3 },
  'Knight of Cups':     { file: '3', col: 3, row: 2, cols: 4, rows: 3 },
};

function buildSpriteStyle(s: { file: string; col: number; row: number; cols: number; rows: number }): string {
  const x = s.cols > 1 ? +((s.col / (s.cols - 1)) * 100).toFixed(3) : 0;
  const y = s.rows > 1 ? +((s.row / (s.rows - 1)) * 100).toFixed(3) : 0;
  return `url(images/${s.file}.png) ${x}% ${y}% / ${s.cols * 100}% ${s.rows * 100}% no-repeat`;
}

@Component({
  selector: 'app-card-spread',
  standalone: true,
  imports: [],
  templateUrl: './card-spread.component.html',
  styleUrl: './card-spread.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSpreadComponent implements OnInit {
  @Input() question = '';
  @Output() cardPicked = new EventEmitter<DrawnCard>();

  phase: 'shuffle' | 'spread' | 'select' = 'shuffle';
  cards: DrawnCard[] = [];
  cardSpriteStyles: (string | null)[] = [];  // precomputed CSS background strings

  selectedIndex  = -1;
  isFlipping     = false;
  showClose      = false;
  pickedIndices  = new Set<number>();
  shuffleSlots   = [0, 1, 2, 3, 4, 5, 6];
  burstSlots     = [0, 1, 2, 3, 4, 5, 6, 7];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const deck = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    this.cards = deck.slice(0, 30).map(card => ({
      card,
      isReversed: Math.random() > 0.6,
    }));

    this.cardSpriteStyles = this.cards.map(item => {
      const s = SPRITE_MAP[item.card.en];
      return s ? buildSpriteStyle(s) : null;
    });

    setTimeout(() => {
      this.phase = 'spread';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.phase = 'select';
        this.cdr.markForCheck();
      }, 1600);
    }, 2200);
  }

  pick(index: number): void {
    if (this.phase !== 'select' || this.selectedIndex !== -1 || this.pickedIndices.has(index)) return;

    this.isFlipping = false;   // reset in case previous flip still flagged
    this.selectedIndex = index;
    this.cdr.markForCheck();

    // Start 3-D flip after card lifts into focal position
    setTimeout(() => {
      this.isFlipping = true;
      this.cdr.markForCheck();

      // Show close button after flip + holographic animation complete
      setTimeout(() => {
        this.showClose = true;
        this.cdr.markForCheck();
      }, 950 + 900);
    }, 380);

    // Emit result
    setTimeout(() => {
      this.cardPicked.emit(this.cards[index]);
    }, 380 + 950 + 1400);
  }

  closeReveal(): void {
    if (this.selectedIndex === -1) return;
    this.pickedIndices.add(this.selectedIndex);
    this.selectedIndex = -1;
    this.showClose     = false;
    this.cdr.markForCheck();
  }
}
