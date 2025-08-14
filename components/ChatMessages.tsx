import React, { useRef, useEffect } from 'react';
import { type Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { BotAvatarIcon } from './icons';
import { PinnedMessage } from './PinnedMessage';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start items-end gap-2">
    <BotAvatarIcon className="w-9 h-9" />
    <div className="flex items-center space-x-1.5 bg-gray-200 rounded-xl rounded-bl-sm px-4 py-3.5">
       <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
       <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
       <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
  </div>
);


export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
      <PinnedMessage />
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
       {isLoading && <TypingIndicator />}
    </div>
  );
};