import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { ChatMessage, messageText } from '../chat.model';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
})
export class MessageList {
  readonly messages = input.required<ChatMessage[]>();
  readonly busy = input(false);
  protected readonly renderedMessages = computed(() =>
    this.messages()
      .map((message) => ({
        id: message.id,
        type: message.type,
        name: message.name,
        text: messageText(message),
      }))
      .filter((message) => message.text),
  );
  private readonly end = viewChild<ElementRef<HTMLElement>>('end');

  constructor() {
    afterRenderEffect(() => {
      this.messages();
      this.end()?.nativeElement.scrollIntoView({ block: 'nearest' });
    });
  }
}
