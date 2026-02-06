import { Building2, Calendar, Clock, MapPin, Settings, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { THEME_PARKS } from '../../data/parks';
import type { Account, EventTheme, Trip } from '../../types/wellsChaos';

type HomePageProps = {
  trip: Trip;
  currentUser: Account;
  theme: EventTheme;
  onShowAccountSwitcher: () => void;
  onShowSettings: () => void;
  onUpdateTrip: (trip: Trip) => void;
};

const HomePage = ({
  trip,
  currentUser,
  theme,
  onShowAccountSwitcher,
  onShowSettings,
  onUpdateTrip
}: HomePageProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate days until trip
  const getDaysUntilTrip = () => {
    if (!trip.days.length) return null;
    const tripStart = new Date(trip.days[0].date);
    tripStart.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = tripStart.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get next upcoming event
  const getNextEvent = () => {
    const now = new Date();
    for (let i = 0; i < trip.days.length; i += 1) {
      const day = trip.days[i];
      const sortedBlocks = [...day.blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (const block of sortedBlocks) {
        const blockDate = new Date(day.date);
        const [hours, minutes] = block.startTime.split(':');
        blockDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        if (blockDate > now) {
          return { block, day, timeUntil: Math.floor((blockDate.getTime() - now.getTime()) / 60000) };
        }
      }
    }
    return null;
  };

  const daysUntil = getDaysUntilTrip();
  const nextEvent = getNextEvent();

  // Get countdown message
  const getCountdownMessage = () => {
    if (daysUntil === null) return { title: 'Planning Time!', subtitle: 'Set your dates to start the countdown' };
    if (daysUntil < 0) return { title: 'Trip Complete! ✨', subtitle: 'What an adventure!' };
    if (daysUntil === 0) return { title: 'TODAY!', subtitle: 'The magic starts NOW! 🎉' };
    if (daysUntil === 1) return { title: '1 day', subtitle: 'until the magic begins!' };
    return { title: `${daysUntil} days`, subtitle: 'until the magic!' };
  };

  const countdown = getCountdownMessage();

  // All available parks
  const allParks = [...THEME_PARKS.disney.parks, ...THEME_PARKS.universal.parks];

  // Handle park assignment for a day
  const handleParkChange = (dayIndex: number, park: string | null) => {
    const updatedDays = trip.days.map((day, idx) =>
      idx === dayIndex ? { ...day, park } : day
    );
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} pb-24`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                {trip.name}
              </h1>
              <div className="text-xs text-gray-400 italic">by Ben & Marie ✨</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onShowSettings}
                className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-600"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={onShowAccountSwitcher}
                className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-600"
              >
                <Users size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Countdown Timer */}
        <div
          className={`bg-gradient-to-br ${theme.primary} rounded-3xl p-6 text-white shadow-xl animate-fade-in overflow-hidden relative`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8" />
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={24} className="animate-pulse" />
              <span className="text-sm font-medium opacity-90">Magic Countdown</span>
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div className={`text-5xl font-bold mb-2 ${daysUntil !== null && daysUntil >= 0 && daysUntil <= 7 ? 'animate-bounce-slow' : ''}`}>
              {countdown.title}
            </div>
            <div className="text-lg opacity-90">{countdown.subtitle}</div>
          </div>
        </div>

        {/* Current Time & Next Event */}
        <div className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white`}>
                <Clock size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Current Time</div>
                <div className="text-2xl font-bold text-gray-800">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
            </div>
            {nextEvent && (
              <div className="text-right border-l-2 border-gray-100 pl-4">
                <div className="text-xs text-gray-500 font-medium">Next Up</div>
                <div className="font-semibold text-gray-800 truncate max-w-[140px]">{nextEvent.block.title}</div>
                <div className="text-sm text-purple-600">
                  {nextEvent.block.startTime} •{' '}
                  {nextEvent.timeUntil < 60
                    ? `${nextEvent.timeUntil}min`
                    : nextEvent.timeUntil < 1440
                      ? `${Math.floor(nextEvent.timeUntil / 60)}h ${nextEvent.timeUntil % 60}m`
                      : `${Math.floor(nextEvent.timeUntil / 1440)}d`}
                </div>
              </div>
            )}
            {!nextEvent && (
              <div className="text-right border-l-2 border-gray-100 pl-4">
                <div className="text-xs text-gray-500 font-medium">Next Up</div>
                <div className="text-sm text-gray-400 italic">No events scheduled</div>
              </div>
            )}
          </div>
        </div>

        {/* Park Schedule */}
        <div className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Park Schedule</h2>
          </div>
          <div className="space-y-3">
            {trip.days.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50 border border-gray-100"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    Day {index + 1}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                {isAdmin ? (
                  <select
                    value={day.park || ''}
                    onChange={(e) => handleParkChange(index, e.target.value || null)}
                    className="text-sm font-medium bg-white border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400 transition-colors cursor-pointer"
                  >
                    <option value="">☁️ Free Day</option>
                    <optgroup label="🏰 Disney Parks">
                      {THEME_PARKS.disney.parks.map((park) => (
                        <option key={park} value={park}>{park}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🎢 Universal Parks">
                      {THEME_PARKS.universal.parks.map((park) => (
                        <option key={park} value={park}>{park}</option>
                      ))}
                    </optgroup>
                  </select>
                ) : (
                  <div className={`text-sm font-medium px-3 py-2 rounded-xl ${
                    day.park
                      ? `bg-gradient-to-r ${theme.primary} text-white`
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {day.park || '☁️ Free Day'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trip Details */}
        {(trip.hotel || trip.notes) && (
          <div className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={20} className="text-purple-600" />
              <h2 className="font-bold text-gray-800">Trip Details</h2>
            </div>
            {trip.hotel && (
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                <div className="text-xs text-purple-600 font-medium mb-1">🏨 Hotel</div>
                <div className="font-semibold text-gray-800">{trip.hotel.name}</div>
                {trip.hotel.address && (
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {trip.hotel.address}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-gray-700">{trip.days.length} days</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
                <Users size={14} className="text-gray-500" />
                <span className="text-gray-700">{trip.members.length} travelers</span>
              </div>
            </div>
            {trip.notes && (
              <div className="mt-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                <div className="text-xs text-yellow-700 font-medium mb-1">📝 Notes</div>
                <div className="text-sm text-gray-700">{trip.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <div className="text-3xl mb-1">🎢</div>
            <div className="text-2xl font-bold text-gray-800">
              {trip.days.reduce((acc, day) => acc + day.blocks.filter(b => b.type === 'FAMILY').length, 0)}
            </div>
            <div className="text-xs text-gray-500">Family Events</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <div className="text-3xl mb-1">☁️</div>
            <div className="text-2xl font-bold text-gray-800">
              {trip.days.reduce((acc, day) => acc + day.blocks.filter(b => b.type === 'PERSONAL').length, 0)}
            </div>
            <div className="text-xs text-gray-500">Personal Blocks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
