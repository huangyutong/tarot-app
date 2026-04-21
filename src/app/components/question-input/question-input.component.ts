import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-question-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './question-input.component.html',
  styleUrl: './question-input.component.scss',
})
export class QuestionInputComponent {
  question = '';

  @Output() submitted = new EventEmitter<string>();

  submit(): void {
    const q = this.question.trim();
    if (q) {
      this.submitted.emit(q);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }
}
