import type { BaseMessage } from '@langchain/core/messages';

// injectStream returns message instances, including partial assistant messages.
export type ChatMessage = Pick<BaseMessage, 'id' | 'type' | 'content' | 'name'>;

export type ChatState = {
  messages: ChatMessage[];
};

export interface Conversation {
  id: string;
  title: string;
}

export function messageText(message: ChatMessage): string {
  return typeof message.content === 'string'
    ? message.content
    : message.content
        .map((block) =>
          block.type === 'text' ? String(block['text'] ?? '') : '',
        )
        .join('');
}
