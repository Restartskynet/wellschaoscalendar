import { MessageCircle, Send, X } from 'lucide-react';
import { useState } from 'react';
import type { Account, EventTheme, TimeBlock } from '../../types/wellsChaos';

type EventChatModalProps = {
  block: TimeBlock;
  currentUser: Account;
  accounts: Account[];
  theme: EventTheme;
  onSave: (chat: { username: string; message: string; timestamp: Date }) => void;
  onClose: () => void;
};

const EventChatModal = ({ block, currentUser, accounts, theme, onSave, onClose }: EventChatModalProps) => {
  const [message, setMessage] = useState('');
  const chats = block.chats || [];

  const handleSend = () => {
    if (message.trim()) {
      onSave({
        username: currentUser.username,
        message: message.trim(),
        timestamp: new Date()
      });
      setMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle size={20} />
            {block.title}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {chats.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No messages yet. Start the conversation!</div>
            </div>
          ) : (
            chats.map((chat, index) => {
              const member = accounts.find((m) => m.username === chat.username);
              return (
                <div key={index} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200 flex-shrink-0">
                    {member?.customAvatar ? (
                      <img src={member.customAvatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm bg-gradient-to-br from-purple-100 to-pink-100">
                        {member?.defaultAvatar}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-700">{member?.name}</div>
                    <div className="bg-gray-100 rounded-xl p-3 text-sm">{chat.message}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
            <button
              onClick={handleSend}
              className={`bg-gradient-to-r ${theme.primary} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventChatModal;
