import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Account, ChatMessage, EventTheme, Trip } from '../../types/wellsChaos';

type ChatPageProps = {
  trip: Trip;
  currentUser: Account;
  accounts: Account[];
  theme: EventTheme;
  chatMessages: ChatMessage[];
  onSendMessage: (message: ChatMessage) => void;
};

const ChatPage = ({
  trip,
  currentUser,
  accounts,
  theme,
  chatMessages,
  onSendMessage
}: ChatPageProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage({
      username: currentUser.username,
      message: newMessage.trim(),
      timestamp: new Date()
    });
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAccount = (username: string) => accounts.find((a) => a.username === username);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  chatMessages.forEach((msg) => {
    const dateStr = formatDate(msg.timestamp);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} pb-24 flex flex-col`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white`}>
              <MessageCircle size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">💬 Family Chat</h1>
              <div className="text-xs text-gray-400">{trip.name} • {trip.members.length} members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white shadow-lg flex items-center justify-center mb-4">
                <MessageCircle size={36} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
              <p className="text-gray-500 text-sm">Start the conversation! 💬</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="text-2xl">✨</span>
                <span className="text-2xl">🎢</span>
                <span className="text-2xl">🏰</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-white px-4 py-1 rounded-full text-xs font-medium text-gray-500 shadow-sm">
                      {group.date}
                    </div>
                  </div>

                  {/* Messages */}
                  {group.messages.map((msg, msgIndex) => {
                    const account = getAccount(msg.username);
                    const isCurrentUser = msg.username === currentUser.username;
                    return (
                      <div
                        key={`${groupIndex}-${msgIndex}`}
                        className={`flex items-end gap-2 animate-fade-in ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                          {account?.customAvatar ? (
                            <img src={account.customAvatar} alt={account.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm bg-gradient-to-br from-purple-100 to-pink-100">
                              {account?.defaultAvatar}
                            </div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          {!isCurrentUser && (
                            <div className="text-xs text-gray-500 font-medium ml-1 mb-1">
                              {account?.name}
                            </div>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isCurrentUser
                                ? `bg-gradient-to-r ${theme.primary} text-white rounded-br-md`
                                : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          </div>
                          <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right mr-1' : 'ml-1'}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-20 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 text-sm max-h-24"
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                newMessage.trim()
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-md hover:shadow-lg transform hover:scale-105`
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
