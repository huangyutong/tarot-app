import { Component } from '@angular/core';
import { BackgroundLayerComponent } from './components/background-layer/background-layer.component';
import { IntroOverlayComponent } from './components/intro-overlay/intro-overlay.component';
import { QuestionInputComponent } from './components/question-input/question-input.component';
import { CardSpreadComponent, DrawnCard } from './components/card-spread/card-spread.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BackgroundLayerComponent, IntroOverlayComponent, QuestionInputComponent, CardSpreadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  phase: 'question' | 'spread' = 'question';
  currentQuestion = '';

  onQuestionSubmitted(question: string): void {
    this.currentQuestion = question;
    this.phase = 'spread';
  }

  onCardPicked(drawn: DrawnCard): void {
    // Future: show reading result
    console.log('Picked:', drawn.card.name, drawn.isReversed ? '(逆位)' : '(正位)');
  }
}
