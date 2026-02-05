import { Camera, Clock, Home, Menu, MessageSquare } from 'lucide-react';
import type { EventTheme } from '../../types/wellsChaos';

export type PageType = 'home' | 'calendar' | 'photos' | 'chat' | 'more';

type BottomNavProps = {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  theme: EventTheme;
};

const BottomNav = ({ currentPage, onNavigate, theme }: BottomNavProps) => {
  const navItems: { page: PageType; icon: React.ReactNode; label: string }[] = [
    { page: 'home', icon: <Home size={20} />, label: 'Home' },
    { page: 'calendar', icon: <Clock size={20} />, label: 'Calendar' },
    { page: 'photos', icon: <Camera size={20} />, label: 'Photos' },
    { page: 'chat', icon: <MessageSquare size={20} />, label: 'Chat' },
    { page: 'more', icon: <Menu size={20} />, label: 'More' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2 pb-safe">
        {navItems.map(({ page, icon, label }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 min-w-[60px] ${
                isActive
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg transform scale-110`
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {icon}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-safe" />
    </div>
  );
};

export default BottomNav;
