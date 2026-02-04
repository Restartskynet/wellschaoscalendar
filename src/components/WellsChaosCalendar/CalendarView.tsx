import { ChevronLeft, ChevronRight, Cloud, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import BlockFormModal from './BlockFormModal';
import EventChatModal from './EventChatModal';
import RsvpModal from './RsvpModal';
import TimeBlock from './TimeBlock';
import type { Account, EventTheme, TimeBlock as TimeBlockType, Trip } from '../../types/wellsChaos';

type CalendarViewProps = {
  trip: Trip;
  currentUser: Account;
  accounts: Account[];
  theme: EventTheme;
  onShowAccountSwitcher: () => void;
  onUpdateTrip: (trip: Trip) => void;
};

const CalendarView = ({ trip, currentUser, accounts, theme, onShowAccountSwitcher, onUpdateTrip }: CalendarViewProps) => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [editingBlock, setEditingBlock] = useState<TimeBlockType | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState<TimeBlockType | null>(null);
  const [showEventChat, setShowEventChat] = useState<TimeBlockType | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentDay = trip.days[currentDayIndex];
  const nextDay = () => setCurrentDayIndex(Math.min(currentDayIndex + 1, trip.days.length - 1));
  const prevDay = () => setCurrentDayIndex(Math.max(currentDayIndex - 1, 0));
  const sortedBlocks = [...currentDay.blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const updateTripDays = (updatedDay: Trip['days'][number]) => {
    const updatedDays = trip.days.map((day, index) => (index === currentDayIndex ? updatedDay : day));
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  const getNextEvent = () => {
    const now = new Date();
    for (let i = currentDayIndex; i < trip.days.length; i += 1) {
      const day = trip.days[i];
      const sortedDayBlocks = [...day.blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (const block of sortedDayBlocks) {
        const blockTime = new Date(day.date);
        const [hours, minutes] = block.startTime.split(':');
        blockTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        if (blockTime > now) {
          return { block, timeUntil: Math.floor((blockTime - now) / 60000) };
        }
      }
    }
    return null;
  };

  const nextEvent = getNextEvent();
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} pb-20`}>
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                {trip.name}
              </h1>
              <div className="text-xs text-gray-400 italic">by Ben & Marie ✨</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onShowAccountSwitcher}
                className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-600"
              >
                <Users size={20} />
              </button>
            </div>
          </div>

          <div className={`bg-gradient-to-r ${theme.primary} rounded-2xl p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Current Time</div>
                <div className="text-3xl font-bold">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
              {nextEvent && (
                <div className="text-right">
                  <div className="text-xs opacity-90">Next Event</div>
                  <div className="font-bold text-lg">{nextEvent.block.title}</div>
                  <div className="text-sm opacity-90">
                    {nextEvent.block.startTime} •{' '}
                    {nextEvent.timeUntil < 60
                      ? `${nextEvent.timeUntil}min`
                      : `${Math.floor(nextEvent.timeUntil / 60)}h ${nextEvent.timeUntil % 60}min`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Cloud size={32} className="text-blue-500" />
          <div className="flex-1">
            <div className="font-semibold text-blue-800">Orlando Weather</div>
            <div className="text-sm text-blue-600">{trip.weather ?? 'Weather coming soon.'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevDay}
              disabled={currentDayIndex === 0}
              className="p-2 rounded-xl hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-center">
              <div className="text-sm text-purple-600 font-semibold">Day {currentDayIndex + 1}</div>
              <div className="text-2xl font-bold text-gray-800">
                {currentDay.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>

            <button
              onClick={nextDay}
              disabled={currentDayIndex === trip.days.length - 1}
              className="p-2 rounded-xl hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="space-y-3 mt-6">
            {currentDay.blocks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">☁️</div>
                <div className="text-sm">No plans yet - pure freedom!</div>
              </div>
            ) : (
              sortedBlocks.map((block, index) => (
                <TimeBlock
                  key={`${block.title}-${index}`}
                  block={block}
                  onEdit={isAdmin ? () => setEditingBlock(block) : undefined}
                  onRsvp={() => setShowRsvpModal(block)}
                  onChat={() => setShowEventChat(block)}
                  currentUser={currentUser}
                  accounts={accounts}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowBlockForm(true)}
              className={`w-full mt-6 bg-gradient-to-r ${theme.primary} text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
            >
              <Plus size={20} />
              Add Time Block
            </button>
          )}
        </div>
      </div>

      {(showBlockForm || editingBlock) && isAdmin && (
        <BlockFormModal
          block={editingBlock}
          theme={theme}
          onSave={(block) => {
            if (editingBlock) {
              const blockIndex = currentDay.blocks.findIndex((b) => b === editingBlock);
              const updatedBlocks = currentDay.blocks.map((existingBlock, index) =>
                index === blockIndex ? block : existingBlock
              );
              updateTripDays({ ...currentDay, blocks: updatedBlocks });
            } else {
              const updatedBlocks = [...currentDay.blocks, block];
              updateTripDays({ ...currentDay, blocks: updatedBlocks });
            }
            setEditingBlock(null);
            setShowBlockForm(false);
          }}
          onDelete={() => {
            const updatedBlocks = currentDay.blocks.filter((b) => b !== editingBlock);
            updateTripDays({ ...currentDay, blocks: updatedBlocks });
            setEditingBlock(null);
          }}
          onCancel={() => {
            setEditingBlock(null);
            setShowBlockForm(false);
          }}
        />
      )}

      {showRsvpModal && (
        <RsvpModal
          block={showRsvpModal}
          currentUser={currentUser}
          theme={theme}
          onSave={(rsvp) => {
            const existingRsvps = showRsvpModal.rsvps ?? [];
            const existingIndex = existingRsvps.findIndex((r) => r.username === currentUser.username);
            const updatedRsvps = [...existingRsvps];
            if (existingIndex >= 0) {
              updatedRsvps[existingIndex] = rsvp;
            } else {
              updatedRsvps.push(rsvp);
            }
            const updatedBlocks = currentDay.blocks.map((block) =>
              block === showRsvpModal ? { ...block, rsvps: updatedRsvps } : block
            );
            updateTripDays({ ...currentDay, blocks: updatedBlocks });
            setShowRsvpModal(null);
          }}
          onCancel={() => setShowRsvpModal(null)}
        />
      )}

      {showEventChat && (
        <EventChatModal
          block={showEventChat}
          currentUser={currentUser}
          accounts={accounts}
          theme={theme}
          onSave={(chat) => {
            const updatedChats = [...(showEventChat.chats ?? []), chat];
            const updatedBlocks = currentDay.blocks.map((block) =>
              block === showEventChat ? { ...block, chats: updatedChats } : block
            );
            updateTripDays({ ...currentDay, blocks: updatedBlocks });
          }}
          onClose={() => setShowEventChat(null)}
        />
      )}
    </div>
  );
};

export default CalendarView;
