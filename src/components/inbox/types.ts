export type Sentiment = 'positive' | 'neutral' | 'negative' | 'unknown';

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  sentiment: Sentiment;
  email?: string;
  phone?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
  isMe: boolean;
}

export interface Thread {
  id: string;
  contact: Contact;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  type: 'sms' | 'email' | 'call';
  isLive?: boolean;
}

export interface Suggestion {
  id: string;
  text: string;
  confidence: number;
  type: 'response' | 'action';
}
