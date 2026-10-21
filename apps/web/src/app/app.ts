import { Component, inject, OnInit } from '@angular/core';
import { Chat } from './chat';
import { Composer } from './composer/composer';
import { MessageList } from './message-list/message-list';

@Component({
  imports: [Composer, MessageList],
  providers: [Chat],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly chat = inject(Chat);

  ngOnInit() {
    void this.chat.loadConversations();
  }
}
