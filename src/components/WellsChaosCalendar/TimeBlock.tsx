import { Check, Clock, Edit2, Heart, MapPin, MessageCircle, ThumbsDown } from 'lucide-react';
import { LOCATION_DETAILS } from '../../data/parks';
import { STICKERS } from '../../data/themes';
import type { Account, TimeBlock as TimeBlockType } from '../../types/wellsChaos';

type TimeBlockProps = {
  block: TimeBlockType;
  currentUser: Account;
  accounts: Account[];
  isAdmin: boolean;
  onEdit?: () => void;
  onRsvp: () => void;
  onChat: () => void;
};

const TimeBlock = ({ block, onEdit, onRsvp, onChat, currentUser, accounts, isAdmin }: TimeBlockProps) => {
  const isFamily = block.type === 'FAMILY';
  const rsvps = block.rsvps || [];
  const userRsvp = rsvps.find((r) => r.username === currentUser.username);
  const reactions = block.reactions || {};
  const chats = block.chats || [];

  const toggleReaction = (sticker: string) => {
    if (!block.reactions) block.reactions = {};
    if (!block.reactions[sticker]) block.reactions[sticker] = [];

    const index = block.reactions[sticker].indexOf(currentUser.username);
    if (index >= 0) {
      block.reactions[sticker].splice(index, 1);
    } else {
      block.reactions[sticker].push(currentUser.username);
    }
  };

  const locationDetail = block.park && block.title && LOCATION_DETAILS[block.park]?.[block.title];

  return (
    <div
      className={`relative p-4 rounded-xl transform hover:scale-102 transition-all duration-200 ${
        isFamily
          ? 'bg-gradient-to-br from-orange-100 to-pink-100 border-2 border-orange-200 shadow-md hover:shadow-lg'
          : 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 border-dashed shadow-sm hover:shadow-md'
      }`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <div className="absolute top-2 right-2 text-xs font-semibold bg-white px-2 py-1 rounded-full flex items-center gap-1">
        {isFamily ? '🎟️' : '☁️'}
        {isFamily ? 'Family' : 'Personal'}
      </div>

      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${isFamily ? 'text-orange-600' : 'text-blue-600'}`}>
          <Clock size={20} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800 text-lg">{block.title}</div>
          <div className="text-sm text-gray-600 mt-1">
            {block.startTime} - {block.endTime}
          </div>
          {block.location && (
            <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {block.location}
            </div>
          )}
          {locationDetail && <div className="text-xs text-gray-500 italic mt-1 ml-5">{locationDetail}</div>}
          {block.park && <div className="text-xs text-gray-500 mt-1">📍 {block.park}</div>}

          {Object.keys(reactions).some((s) => reactions[s].length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.keys(reactions)
                .filter((s) => reactions[s].length > 0)
                .map((sticker) => (
                  <div key={sticker} className="bg-white rounded-full px-2 py-1 text-xs flex items-center gap-1 shadow-sm">
                    <span>{sticker}</span>
                    <span className="font-semibold text-gray-600">{reactions[sticker].length}</span>
                  </div>
                ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-3">
            {STICKERS.slice(0, 4).map((sticker) => (
              <button
                key={sticker}
                onClick={() => toggleReaction(sticker)}
                className={`text-lg p-1 rounded-lg transition-all ${
                  reactions[sticker]?.includes(currentUser.username)
                    ? 'bg-yellow-100 scale-110'
                    : 'hover:bg-gray-100'
                }`}
              >
                {sticker}
              </button>
            ))}
          </div>

          {isFamily && rsvps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-orange-200">
              <div className="flex flex-wrap gap-2">
                {rsvps.map((rsvp) => {
                  const member = accounts.find((m) => m.username === rsvp.username);
                  if (rsvp.status === 'not-going') return null;
                  return (
                    <div key={rsvp.username} className="bg-white rounded-xl p-2 shadow-sm animate-pop-in">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200 flex-shrink-0">
                          {member?.customAvatar ? (
                            <img src={member.customAvatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg bg-gradient-to-br from-purple-100 to-pink-100">
                              {member?.defaultAvatar}
                            </div>
                          )}
                        </div>
                        <div className="text-xs">
                          <div className="font-semibold text-gray-800">{member?.name}</div>
                          {rsvp.quip && <div className="text-gray-600 italic mt-0.5">"{rsvp.quip}"</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chats.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <MessageCircle size={12} />
                {chats.length} message{chats.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {isAdmin && onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <Edit2 size={14} />
                Edit
              </button>
            )}
            {isFamily && (
              <button
                onClick={onRsvp}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  userRsvp && userRsvp.status === 'going'
                    ? 'bg-gradient-to-r from-pink-400 to-orange-400 text-white shadow-md'
                    : userRsvp && userRsvp.status === 'not-going'
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-white text-purple-600 hover:bg-purple-50'
                }`}
              >
                {userRsvp && userRsvp.status === 'going' ? (
                  <>
                    <Check size={14} /> Going!
                  </>
                ) : userRsvp && userRsvp.status === 'not-going' ? (
                  <>
                    <ThumbsDown size={14} /> Can't Make It
                  </>
                ) : (
                  <>
                    <Heart size={14} /> RSVP
                  </>
                )}
              </button>
            )}
            <button
              onClick={onChat}
              className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <MessageCircle size={14} />
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBlock;
