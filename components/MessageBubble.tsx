
import React from 'react';
import { type Message, Sender } from '../types';
import { BotAvatarIcon, UserAvatarIcon } from './icons';

interface MessageBubbleProps {
  message: Message;
}

const renderMessageContent = (text: string) => {
  // Regex to find markdown-style links: [text](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts: (string | { text: string; url:string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Push the text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const [_, linkText, url] = match;
    // Push the link as an object
    parts.push({ text: linkText, url: url });

    lastIndex = match.index + match[0].length;
  }

  // Push the remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no links were found, just return the original text to avoid extra spans
  if (parts.length === 0) {
    return text;
  }

  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return <span key={index}>{part}</span>;
    }
    return (
      <a
        key={index}
        href={part.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-600 hover:underline font-medium"
      >
        {part.text}
      </a>
    );
  });
};


export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <BotAvatarIcon className="w-9 h-9" />}
      
      <div 
        className={`relative max-w-xs md:max-w-md lg:max-w-xl px-3.5 py-2.5 shadow-sm ${
          isUser
            ? 'bg-cyan-500 text-white rounded-xl rounded-br-sm'
            : 'bg-gray-200 text-gray-800 rounded-xl rounded-bl-sm'
        }`}
      >
        <p className="text-base whitespace-pre-wrap pb-3">{renderMessageContent(message.text)}</p>
        <span className={`absolute bottom-1.5 right-3 text-xs ${isUser ? 'text-cyan-100/90' : 'text-gray-500'}`}>
          {message.timestamp}
        </span>
      </div>

      {isUser && <UserAvatarIcon className="w-8 h-8" />}
    </div>
  );
};