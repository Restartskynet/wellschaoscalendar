import { Check, Heart, MessageCircle, Sparkles, ThumbsDown, X } from 'lucide-react';
import { useState } from 'react';
import type { Account, EventTheme, RSVP, TimeBlock } from '../../types/wellsChaos';

type RsvpModalProps = {
  block: TimeBlock;
  currentUser: Account;
  theme: EventTheme;
  onSave: (rsvp: RSVP) => void;
  onCancel: () => void;
};

const RsvpModal = ({ block, currentUser, theme, onSave, onCancel }: RsvpModalProps) => {
  const existingRsvp = block.rsvps?.find((r) => r.username === currentUser.username);
  const [status, setStatus] = useState<RSVP['status']>(existingRsvp?.status || 'going');
  const [quip, setQuip] = useState(existingRsvp?.quip || '');
  const maxQuipLength = 50;

  const handleSave = () => {
    onSave({
      username: currentUser.username,
      status,
      quip: quip.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="text-pink-500" size={24} />
            RSVP to {block.title}
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className={`bg-gradient-to-r ${theme.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {currentUser.customAvatar ? (
                  <img src={currentUser.customAvatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-100 to-pink-100">
                    {currentUser.defaultAvatar}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-gray-800">{currentUser.name}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStatus('going')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  status === 'going'
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg`
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Check size={16} className="inline mr-1" />
                Going!
              </button>
              <button
                onClick={() => setStatus('not-going')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  status === 'not-going'
                    ? 'bg-gray-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ThumbsDown size={16} className="inline mr-1" />
                Can't Make It
              </button>
            </div>
          </div>

          {status === 'going' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MessageCircle size={16} />
                Add a fun quip! (optional)
              </label>
              <textarea
                value={quip}
                onChange={(e) => setQuip(e.target.value.slice(0, maxQuipLength))}
                placeholder="Can't wait! 🎢 or Bringing snacks! 🍿"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
                rows={2}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {quip.length}/{maxQuipLength} characters
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className={`w-full bg-gradient-to-r ${theme.primary} text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2`}
          >
            <Sparkles size={20} />
            Confirm RSVP
          </button>
        </div>
      </div>
    </div>
  );
};

export default RsvpModal;
