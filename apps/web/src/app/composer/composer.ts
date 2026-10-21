import { Component, input, output, signal } from '@angular/core';
import { disabled, form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-composer',
  imports: [FormField],
  templateUrl: './composer.html',
  styleUrl: './composer.scss',
})
export class Composer {
  readonly busy = input(false);
  readonly sent = output<string>();
  readonly stopped = output<void>();
  protected readonly draft = signal({ message: '' });
  protected readonly composer = form(this.draft, (fields) => {
    disabled(fields.message, () => this.busy());
  });

  protected send(event: Event) {
    event.preventDefault();
    const text = this.draft().message.trim();
    if (!text || this.busy()) return;
    this.sent.emit(text);
    this.draft.set({ message: '' });
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing)
      this.send(event);
  }
}
