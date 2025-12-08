'use client';

import { useState } from 'react';
import { ThreadList } from '@/components/inbox/ThreadList';
import { ConversationView } from '@/components/inbox/ConversationView';
import { LiveAssist } from '@/components/inbox/LiveAssist';
import { Thread, Message, Suggestion } from '@/components/inbox/types';
import { usePageContext } from '@/hooks/usePageContext';

const MOCK_THREADS: Thread[] = [
  {
    id: '1',
    contact: {
      id: 'c1',
      name: 'John Smith',
      status: 'busy',
      sentiment: 'positive',
      avatar: '/avatars/john.jpg',
    },
    lastMessage: 'I understand, that makes sense.',
    timestamp: 'Just now',
    unreadCount: 0,
    type: 'call',
    isLive: true,
  },
  {
    id: '2',
    contact: { id: 'c2', name: 'Sarah Wilson', status: 'online', sentiment: 'neutral' },
    lastMessage: 'When can we view the property?',
    timestamp: '10m ago',
    unreadCount: 2,
    type: 'sms',
  },
  {
    id: '3',
    contact: { id: 'c3', name: 'Mike Davis', status: 'offline', sentiment: 'negative' },
    lastMessage: 'The offer is too low.',
    timestamp: '1h ago',
    unreadCount: 0,
    type: 'email',
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      senderId: 'me',
      content: 'Hi John, thanks for taking my call.',
      timestamp: '10:00 AM',
      type: 'text',
      isMe: true,
    },
    {
      id: 'm2',
      senderId: 'c1',
      content: 'Sure, what did you want to discuss?',
      timestamp: '10:00 AM',
      type: 'text',
      isMe: false,
    },
    {
      id: 'm3',
      senderId: 'me',
      content: 'I wanted to discuss 123 Main St.',
      timestamp: '10:01 AM',
      type: 'text',
      isMe: true,
    },
    {
      id: 'm4',
      senderId: 'c1',
      content: "It's a probate situation, kinda complicated.",
      timestamp: '10:01 AM',
      type: 'text',
      isMe: false,
    },
  ],
  '2': [
    {
      id: 'm1',
      senderId: 'c2',
      content: 'Is the property still available?',
      timestamp: ' вчера',
      type: 'text',
      isMe: false,
    },
  ],
};

const MOCK_SUGGESTIONS: Record<string, Suggestion[]> = {
  '1': [
    {
      id: 's1',
      text: 'I understand probate can be difficult. We specialize in handling these situations smoothly.',
      confidence: 0.95,
      type: 'response',
    },
    { id: 's2', text: 'Are you the executor of the estate?', confidence: 0.85, type: 'response' },
  ],
  '2': [
    {
      id: 's3',
      text: 'Yes, it is! When would you like to see it?',
      confidence: 0.98,
      type: 'response',
    },
  ],
};

const MOCK_INSIGHTS: Record<string, string[]> = {
  '1': ['Probate Situation', 'Motivated Seller'],
  '2': ['Cash Buyer'],
};

export default function InboxPage() {
  usePageContext('inbox');
  const [selectedThreadId, setSelectedThreadId] = useState<string>('1');
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);

  const activeThread = MOCK_THREADS.find((t) => t.id === selectedThreadId) || MOCK_THREADS[0]!;
  const activeMessages = messages[selectedThreadId] || [];
  const activeSuggestions = MOCK_SUGGESTIONS[selectedThreadId] || [];
  const activeInsights = MOCK_INSIGHTS[selectedThreadId] || [];

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
      isMe: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedThreadId]: [...(prev[selectedThreadId] || []), newMessage],
    }));
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_300px] gap-4 h-full">
        {/* Left: Threads */}
        <section className="flex flex-col h-full min-h-0">
          <div className="mb-4 px-2">
            <h1 className="text-xl font-bold tracking-tight">Inbox</h1>
            <p className="text-xs text-muted-foreground">All communications</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <ThreadList
              threads={MOCK_THREADS}
              selectedId={selectedThreadId}
              onSelect={setSelectedThreadId}
            />
          </div>
        </section>

        {/* Middle: Conversation */}
        <section className="flex flex-col h-full min-h-0">
          <ConversationView
            thread={activeThread}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            className="flex-1 shadow-2xl"
          />
        </section>

        {/* Right: Live Assist (Hidden on smaller screens) */}
        <section className="hidden lg:flex flex-col h-full min-h-0">
          <LiveAssist
            sentiment={activeThread.contact.sentiment}
            suggestions={activeSuggestions}
            insights={activeInsights}
            onApplySuggestion={handleSendMessage}
            className="flex-1 border-l border-white/10"
          />
        </section>
      </div>
    </div>
  );
}
