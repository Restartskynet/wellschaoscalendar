import { Camera, Clock, Home, Menu, MessageSquare } from 'lucide-react';
import type { EventTheme } from '../../types/wellsChaos';
import type { PageType } from './BottomNav';

type DesktopLayoutProps = {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  theme: EventTheme;
  tripName?: string;
  children: React.ReactNode;
};

const navItems: { page: PageType; icon: React.ReactNode; label: string }[] = [
  { page: 'home', icon: <Home size={20} />, label: 'Home' },
  { page: 'calendar', icon: <Clock size={20} />, label: 'Calendar' },
  { page: 'photos', icon: <Camera size={20} />, label: 'Photos' },
  { page: 'chat', icon: <MessageSquare size={20} />, label: 'Chat' },
  { page: 'more', icon: <Menu size={20} />, label: 'More' },
];

const DesktopLayout = ({ currentPage, onNavigate, theme, tripName, children }: DesktopLayoutProps) => {
  return (
    <div className="hidden lg:flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
            Wells Chaos Calendar
          </h1>
          {tripName && (
            <p className="text-xs text-gray-400 mt-1 truncate">{tripName}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ page, icon, label }) => {
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isActive
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {icon}
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 text-center">
            Family Trip Planner
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DesktopLayout;
