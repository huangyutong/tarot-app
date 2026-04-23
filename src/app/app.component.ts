import { Component } from '@angular/core';
import { BackgroundLayerComponent } from './components/background-layer/background-layer.component';
import { IntroOverlayComponent } from './components/intro-overlay/intro-overlay.component';
import { QuestionInputComponent } from './components/question-input/question-input.component';
import { CardSpreadComponent, DrawnCard } from './components/card-spread/card-spread.component';
import { HomepageComponent } from './components/homepage/homepage.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BackgroundLayerComponent, IntroOverlayComponent, QuestionInputComponent, CardSpreadComponent, HomepageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  phase: 'home' | 'question' | 'spread' = 'home';
  currentQuestion = '';

  onEnter(): void {
    this.phase = 'question';
  }

  onQuestionSubmitted(question: string): void {
    this.currentQuestion = question;
    this.phase = 'spread';
  }

  onCardPicked(drawn: DrawnCard): void {
    console.log('Picked:', drawn.card.name, drawn.isReversed ? '(逆位)' : '(正位)');
  }
}
