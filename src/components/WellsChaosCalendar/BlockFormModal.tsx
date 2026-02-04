import { X, Zap } from 'lucide-react';
import { useState } from 'react';
import { ATTRACTIONS, COMMON_ACTIVITIES, LOCATION_DETAILS, RESTAURANTS, SHOWS_PARADES, THEME_PARKS } from '../../data/parks';
import type { EventTheme, TimeBlock } from '../../types/wellsChaos';

type BlockFormModalProps = {
  block: TimeBlock | null;
  theme: EventTheme;
  onSave: (block: TimeBlock) => void;
  onDelete: () => void;
  onCancel: () => void;
};

const BlockFormModal = ({ block, theme, onSave, onDelete, onCancel }: BlockFormModalProps) => {
  const [formData, setFormData] = useState<TimeBlock>(
    block || {
      type: 'FAMILY',
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      park: '',
      notes: '',
      rsvps: [],
      reactions: {},
      chats: []
    }
  );

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState('');

  const getSuggestions = () => {
    const { park } = formData;

    if (suggestionType === 'attraction' && park && ATTRACTIONS[park]) {
      return ATTRACTIONS[park];
    }
    if (suggestionType === 'restaurant' && park && RESTAURANTS[park]) {
      return RESTAURANTS[park];
    }
    if (suggestionType === 'show' && park && SHOWS_PARADES[park]) {
      return SHOWS_PARADES[park];
    }
    if (suggestionType === 'activity') {
      return COMMON_ACTIVITIES;
    }
    return [];
  };

  const handleSuggestionClick = (suggestion: string) => {
    const locationDetail = formData.park && LOCATION_DETAILS[formData.park]?.[suggestion];
    setFormData({
      ...formData,
      title: suggestion,
      location: locationDetail ? `${formData.park} - ${locationDetail}` : formData.park || formData.location
    });
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (formData.title && formData.startTime && formData.endTime) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h3 className="text-xl font-bold text-gray-800">{block ? 'Edit Block' : 'Add Time Block'}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFormData({ ...formData, type: 'FAMILY' })}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                formData.type === 'FAMILY'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎟️ Family Time
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: 'PERSONAL' })}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                formData.type === 'PERSONAL'
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ☁️ Personal Time
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Park</label>
            <select
              value={formData.park}
              onChange={(e) =>
                setFormData({ ...formData, park: e.target.value, title: '', location: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="">Select a park...</option>
              <optgroup label="🏰 Walt Disney World">
                {THEME_PARKS.disney.parks.map((park) => (
                  <option key={park} value={park}>
                    {park}
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚡ Universal Orlando">
                {THEME_PARKS.universal.parks.map((park) => (
                  <option key={park} value={park}>
                    {park}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {formData.park && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
              <div className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                <Zap size={16} />
                Quick Add from {formData.park}:
              </div>
              <div className="flex gap-2 flex-wrap">
                {ATTRACTIONS[formData.park] && (
                  <button
                    onClick={() => {
                      setSuggestionType('attraction');
                      setShowSuggestions(!showSuggestions || suggestionType !== 'attraction');
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      showSuggestions && suggestionType === 'attraction'
                        ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                        : 'bg-white text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    🎢 Rides
                  </button>
                )}
                {RESTAURANTS[formData.park] && (
                  <button
                    onClick={() => {
                      setSuggestionType('restaurant');
                      setShowSuggestions(!showSuggestions || suggestionType !== 'restaurant');
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      showSuggestions && suggestionType === 'restaurant'
                        ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                        : 'bg-white text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    🍽️ Dining
                  </button>
                )}
                {SHOWS_PARADES[formData.park] && (
                  <button
                    onClick={() => {
                      setSuggestionType('show');
                      setShowSuggestions(!showSuggestions || suggestionType !== 'show');
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      showSuggestions && suggestionType === 'show'
                        ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                        : 'bg-white text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    🎭 Shows
                  </button>
                )}
                <button
                  onClick={() => {
                    setSuggestionType('activity');
                    setShowSuggestions(!showSuggestions || suggestionType !== 'activity');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showSuggestions && suggestionType === 'activity'
                      ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                      : 'bg-white text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  ✨ Activities
                </button>
              </div>

              {showSuggestions && getSuggestions().length > 0 && (
                <div className="mt-3 bg-white border-2 border-purple-300 rounded-xl max-h-64 overflow-y-auto shadow-lg">
                  <div className="sticky top-0 bg-purple-100 px-4 py-2 text-xs font-semibold text-purple-800 border-b border-purple-200">
                    {getSuggestions().length} options available
                  </div>
                  {getSuggestions().map((suggestion, index) => {
                    const detail = formData.park && LOCATION_DETAILS[formData.park]?.[suggestion];
                    return (
                      <button
                        key={`${suggestion}-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="text-sm font-medium">{suggestion}</div>
                        {detail && <div className="text-xs text-gray-500 italic mt-1">{detail}</div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Lunch at Be Our Guest"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location {formData.park && <span className="text-xs text-gray-500">(auto-filled)</span>}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Fantasyland"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-4">
            {block && (
              <button onClick={onDelete} className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors">
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              className={`flex-1 bg-gradient-to-r ${theme.primary} text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
            >
              {block ? 'Save Changes' : 'Add Block'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockFormModal;
