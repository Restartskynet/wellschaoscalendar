import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Edit2, Users, User, MapPin, Clock, ChevronLeft, ChevronRight, Check, LogOut, Crown, Heart, Sparkles, MessageCircle, Camera, Upload, Zap, Coffee, Cloud, CloudRain, Menu, Home, MessageSquare, CheckSquare, DollarSign, Settings, ThumbsDown, Send } from 'lucide-react';

// Location details for better navigation
const LOCATION_DETAILS = {
  'Magic Kingdom': {
    '🏰 Cinderella Castle Photos': 'Main Hub, in front of castle',
    '🎢 Space Mountain': 'Tomorrowland, near Astro Orbiter',
    '🏔️ Big Thunder Mountain Railroad': 'Frontierland, by the river',
    '👻 Haunted Mansion': 'Liberty Square, near Rivers of America',
    '🏴‍☠️ Pirates of the Caribbean': 'Adventureland, near Jungle Cruise',
    "🎠 It's a Small World": 'Fantasyland, near Peter Pan',
    '🎢 Seven Dwarfs Mine Train': 'Fantasyland, new area',
    '⚡ TRON Lightcycle Run': 'Tomorrowland, entrance near Space Mountain',
    '🍽️ Be Our Guest Restaurant': 'Fantasyland, Beast\'s Castle',
    '🍽️ Cinderella\'s Royal Table': 'Inside Cinderella Castle',
  },
  'EPCOT': {
    '🚀 Test Track': 'Future World, near entrance',
    '🎢 Guardians of the Galaxy: Cosmic Rewind': 'Future World, Wonders of Xandar',
    '🌊 Living with the Land': 'The Land Pavilion',
    '🍽️ Space 220 Restaurant': 'Future World, Mission: SPACE area',
    '🇲🇽 Mexico Pavilion': 'World Showcase, left from entrance',
    '🇫🇷 France Pavilion': 'World Showcase, back area',
  },
  'Hollywood Studios': {
    '⭐ The Twilight Zone Tower of Terror': 'Sunset Boulevard, end of street',
    "🎸 Rock 'n' Roller Coaster": 'Sunset Boulevard, near Tower',
    '⚔️ Star Wars: Rise of the Resistance': 'Galaxy\'s Edge, far back corner',
    "🎪 Mickey & Minnie's Runaway Railway": 'Chinese Theatre, center of park',
    '🎭 Fantasmic! (Night Show)': 'Hollywood Hills Amphitheater',
  },
  'Animal Kingdom': {
    '🏔️ Expedition Everest': 'Asia section, back of park',
    '🦁 Kilimanjaro Safaris': 'Africa section, Harambe',
    '🎢 Avatar Flight of Passage': 'Pandora, far left of park',
    '🌳 Tree of Life': 'Discovery Island, park center',
  },
  'Universal Studios Florida': {
    '🧙 Harry Potter and the Escape from Gringotts': 'Diagon Alley, London area',
    '🍽️ The Leaky Cauldron': 'Diagon Alley',
  },
  'Islands of Adventure': {
    '🧙 Harry Potter and the Forbidden Journey': 'Hogsmeade, Hogwarts Castle',
    '🎢 VelociCoaster': 'Jurassic Park area',
    '🦖 Jurassic Park River Adventure': 'Jurassic Park section',
  }
};

// MASSIVE Disney World & Universal Orlando Data
const THEME_PARKS = {
  disney: {
    name: 'Walt Disney World',
    parks: ['Magic Kingdom', 'EPCOT', 'Hollywood Studios', 'Animal Kingdom']
  },
  universal: {
    name: 'Universal Orlando',
    parks: ['Universal Studios Florida', 'Islands of Adventure', 'Volcano Bay']
  }
};

const ATTRACTIONS = {
  'Magic Kingdom': [
    '🏰 Cinderella Castle Photos', '🎢 Space Mountain', '🏔️ Big Thunder Mountain Railroad', 
    '👻 Haunted Mansion', '🏴‍☠️ Pirates of the Caribbean', "🎠 It's a Small World", 
    '🚂 Tomorrowland Transit Authority', '🎪 Dumbo the Flying Elephant', 
    '🎢 Seven Dwarfs Mine Train', '⚡ TRON Lightcycle Run', '🎠 Prince Charming Regal Carrousel',
    '🚀 Buzz Lightyear Space Ranger Spin', '🏰 Peter Pan\'s Flight', '🧞 The Magic Carpets of Aladdin',
    '🌊 Splash Mountain', '🎪 Mad Tea Party', '⚔️ Enchanted Tales with Belle'
  ],
  'EPCOT': [
    '🚀 Test Track', '🎢 Guardians of the Galaxy: Cosmic Rewind', 
    '🌊 Living with the Land', '🐟 The Seas with Nemo & Friends', '🎆 Harmonious (Fireworks)',
    '🇲🇽 Mexico Pavilion', '🇫🇷 France Pavilion', '🇯🇵 Japan Pavilion', '🇬🇧 United Kingdom Pavilion',
    '🇨🇦 Canada Pavilion', '🇨🇳 China Pavilion', '🇮🇹 Italy Pavilion', '🇩🇪 Germany Pavilion',
    '🇺🇸 The American Adventure', '🇲🇦 Morocco Pavilion', '🇳🇴 Norway Pavilion',
    '🎢 Mission: SPACE', '🌍 Spaceship Earth', '🎨 Journey Into Imagination', '🦁 The Land Pavilion'
  ],
  'Hollywood Studios': [
    '⭐ The Twilight Zone Tower of Terror', "🎸 Rock 'n' Roller Coaster", 
    '🚗 Star Tours', '🎬 Toy Story Mania!', '⚔️ Star Wars: Rise of the Resistance',
    "🎪 Mickey & Minnie's Runaway Railway", '🎭 Fantasmic! (Night Show)',
    '🦖 Indiana Jones Epic Stunt Spectacular', '🎬 Walt Disney Presents',
    '🚂 Alien Swirling Saucers', '🎢 Slinky Dog Dash', '🌟 Beauty and the Beast Live',
    '⚡ For the First Time in Forever: Frozen Sing-Along'
  ],
  'Animal Kingdom': [
    '🏔️ Expedition Everest', '🦁 Kilimanjaro Safaris', '🌊 Kali River Rapids', 
    '🎢 Avatar Flight of Passage', '🌳 Tree of Life', '🦖 Dinosaur', 
    '🎆 Rivers of Light (Night Show)', '🎪 Festival of the Lion King',
    "🦅 It's Tough to be a Bug!", '🚂 Wildlife Express Train', '🌊 Na\'vi River Journey',
    '🦜 Gorilla Falls Exploration Trail', '🐘 Maharajah Jungle Trek', '🦕 The Boneyard'
  ],
  'Universal Studios Florida': [
    '🧙 Harry Potter and the Escape from Gringotts', '🧙 Diagon Alley Exploration',
    '🎬 The Mummy - Revenge of the Mummy', '⚡ Hollywood Rip Ride Rockit',
    '👾 Men in Black Alien Attack', '🚗 Fast & Furious Supercharged', 
    '🦖 E.T. Adventure', '🎬 Transformers: The Ride 3D', '🦈 Race Through New York with Jimmy Fallon',
    '🎭 Universal\'s Horror Make-Up Show', '🎪 The Simpsons Ride', '🦸 Despicable Me Minion Mayhem'
  ],
  'Islands of Adventure': [
    '🧙 Harry Potter and the Forbidden Journey', '🧙 Hogsmeade Village',
    '🎢 The Incredible Hulk Coaster', '🎢 VelociCoaster', '🦕 Jurassic World VelociCoaster',
    '🦖 Jurassic Park River Adventure', '💦 Popeye & Bluto\'s Bilge-Rat Barges',
    '💦 Dudley Do-Right\'s Ripsaw Falls', '🎪 The Cat in the Hat', '🦸 The Amazing Adventures of Spider-Man',
    '🎢 Hagrid\'s Magical Creatures Motorbike Adventure', '🦕 Pteranodon Flyers',
    '🎪 Seuss Landing', '⚡ Doctor Doom\'s Fearfall', '🎠 Caro-Seuss-el'
  ],
  'Volcano Bay': [
    '🌊 Krakatau Aqua Coaster', '🌊 Ko\'okiri Body Plunge', '🌊 Kala & Tai Nui Serpentine Body Slides',
    '🏄 Honu & Ika Moana Wave Slides', '💦 Punga Racers', '🌊 Waturi Beach Wave Pool',
    '🏊 The Reef Leisure Pool', '🌊 TeAwa The Fearless River', '💦 Kopiko Wai Winding River',
    '🎪 Runamukka Reef Kids Area'
  ]
};

const RESTAURANTS = {
  'Magic Kingdom': [
    '🍽️ Be Our Guest Restaurant', '🍽️ Cinderella\'s Royal Table', '🍕 Pinocchio Village Haus', 
    '🌮 Pecos Bill Tall Tale Inn', '🍔 Cosmic Ray\'s Starlight Cafe', '🥨 Casey\'s Corner',
    '🧁 Gaston\'s Tavern', '🍦 Plaza Ice Cream Parlor', '🥐 Main Street Bakery (Starbucks)',
    '🍽️ The Crystal Palace', '🍽️ Tony\'s Town Square Restaurant', '🍕 Columbia Harbour House',
    '🍔 The Friar\'s Nook', '🌮 Tortuga Tavern', '🍦 Aloha Isle (Dole Whip!)'
  ],
  'EPCOT': [
    '🍽️ Space 220 Restaurant', '🍕 Via Napoli', '🍔 Electric Umbrella', 
    '🌮 La Hacienda de San Angel', '🥐 Les Halles Boulangerie', '🍣 Tokyo Dining',
    '🥨 Biergarten Restaurant', '🍽️ Le Cellier Steakhouse', '🍽️ Coral Reef Restaurant',
    '🍽️ Garden Grill', '🍽️ Akershus Royal Banquet Hall', '🍕 Tutto Italia',
    '🍔 Sunshine Seasons', '🌮 La Cantina de San Angel', '🥐 Kringla Bakeri Og Kafe',
    '🍦 L\'Artisan des Glaces', '🍣 Kabuki Cafe', '🥨 Sommerfest'
  ],
  'Hollywood Studios': [
    '🍽️ The Hollywood Brown Derby', '🍕 PizzeRizzo', '🍔 Backlot Express', 
    '🌮 Woody\'s Lunch Box', '🥨 Docking Bay 7 Food and Cargo', '🍦 Baseline Tap House',
    '🍽️ Sci-Fi Dine-In Theater', '🍽️ 50\'s Prime Time Cafe', '🍽️ Hollywood & Vine',
    '🍔 ABC Commissary', '🌮 Catalina Eddie\'s', '🥐 Ronto Roasters', '🍦 Oga\'s Cantina'
  ],
  'Animal Kingdom': [
    '🍽️ Tiffins Restaurant', '🍕 Pizzafari', '🍔 Flame Tree Barbecue', 
    '🌮 Harambe Market', '🥨 Yak & Yeti Restaurant', '🍦 Dino-Bite Snacks',
    '🍽️ Tusker House', '🍽️ Rainforest Cafe', '🍔 Restaurantosaurus',
    '🌮 Satu\'li Canteen', '🍦 Pongu Pongu', '🥐 Kusafiri Coffee Shop & Bakery',
    '🍕 Eight Spoon Cafe'
  ],
  'Universal Studios Florida': [
    '🍽️ The Leaky Cauldron', '🍕 Louie\'s Italian Restaurant', '🍔 Mel\'s Drive-In', 
    '🌮 Bumblebee Man\'s Taco Truck', '🥨 Finnegan\'s Bar and Grill', '🍦 Florean Fortescue\'s Ice-Cream Parlour',
    '🍔 Fast Food Boulevard', '🌮 Richter\'s Burger Co.', '🍕 Lombard\'s Seafood Grille'
  ],
  'Islands of Adventure': [
    '🍽️ Mythos Restaurant', '🍕 Thunder Falls Terrace', '🍔 The Burger Digs', 
    '🌮 Comic Strip Cafe', '🥨 Confisco Grille', '🍽️ Three Broomsticks',
    '🍔 Blondie\'s', '🍕 Pizza Predattoria', '🌮 The Watering Hole', '🍦 Honeydukes',
    '🥐 Croissant Moon Bakery', '🍔 Captain America Diner', '🌮 Wimpy\'s'
  ],
  'Volcano Bay': [
    '🍔 Kohola Reef Restaurant', '🌮 Bambu', '🍕 The Feasting Frog', 
    '🍦 Whakawaiwai Eats', '🥤 Dancing Dragons Boat Bar'
  ]
};

const SHOWS_PARADES = {
  'Magic Kingdom': [
    '🎆 Happily Ever After (Fireworks)', '🎭 Festival of Fantasy Parade', 
    '🎪 Mickey\'s Magical Friendship Faire', '🎭 Country Bear Jamboree',
    '🎬 Walt Disney\'s Enchanted Tiki Room', '🎪 Monsters Inc. Laugh Floor'
  ],
  'EPCOT': [
    '🎆 Harmonious (Fireworks)', '🎭 Voices of Liberty', '🎪 JAMMitors',
    '🎬 Awesome Planet', '🎭 American Music Machine'
  ],
  'Hollywood Studios': [
    '🎆 Fantasmic! (Night Show)', '🎭 Beauty and the Beast - Live on Stage',
    '🎪 Indiana Jones Epic Stunt Spectacular', '⚡ For the First Time in Forever',
    '🎬 Vacation Fun - An Original Animated Short with Mickey & Minnie'
  ],
  'Animal Kingdom': [
    '🎆 Rivers of Light', '🎭 Festival of the Lion King', '🎪 Finding Nemo - The Musical',
    '🎬 Feathered Friends in Flight'
  ]
};

const COMMON_ACTIVITIES = [
  '🏊 Pool Time', '🛍️ Shopping', '😴 Nap/Rest', '🚶 Walking Around', '📸 Character Meet & Greet',
  '🎆 Watch Fireworks', '☕ Coffee Break', '🍦 Snack Time', '🎁 Gift Shop Browse',
  '🌅 Sunrise Photos', '🌆 Sunset Photos', '🎨 Face Painting', '🎈 Balloon Shopping',
  '🚗 Drive to Park', '🏨 Hotel Check-in', '🏨 Hotel Check-out', '✈️ Airport', '🚗 Parking'
];

// Theme colors
const THEMES = {
  'Magic Kingdom': { primary: 'from-pink-500 to-purple-500', bg: 'from-pink-50 via-purple-50 to-pink-50', accent: 'pink' },
  'EPCOT': { primary: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 via-cyan-50 to-blue-50', accent: 'blue' },
  'Hollywood Studios': { primary: 'from-yellow-500 to-orange-500', bg: 'from-yellow-50 via-orange-50 to-yellow-50', accent: 'yellow' },
  'Animal Kingdom': { primary: 'from-green-500 to-emerald-500', bg: 'from-green-50 via-emerald-50 to-green-50', accent: 'green' },
  'Universal': { primary: 'from-indigo-500 to-purple-500', bg: 'from-indigo-50 via-purple-50 to-indigo-50', accent: 'indigo' },
  'Default': { primary: 'from-purple-500 to-pink-500', bg: 'from-purple-50 via-pink-50 to-orange-50', accent: 'purple' }
};

// Sticker reactions
const STICKERS = ['🎉', '❤️', '😂', '🔥', '⭐', '👍', '🎢', '🍕'];

// Updated accounts - Ben & Marie as admins
const PRESET_ACCOUNTS = [
  { username: 'ben', password: 'magic2024', name: 'Ben', role: 'admin', defaultAvatar: '👨', color: 'blue', customAvatar: null, theme: 'Default' },
  { username: 'marie', password: 'disney123', name: 'Marie', role: 'admin', defaultAvatar: '👩', color: 'pink', customAvatar: null, theme: 'Default' },
  { username: 'rachel', password: 'rides4eva', name: 'Rachel', role: 'user', defaultAvatar: '👧', color: 'purple', customAvatar: null, theme: 'Default' },
  { username: 'chris', password: 'universal1', name: 'Chris', role: 'user', defaultAvatar: '👦', color: 'green', customAvatar: null, theme: 'Default' },
  { username: 'sam', password: 'vacation!', name: 'Sam', role: 'user', defaultAvatar: '🧒', color: 'yellow', customAvatar: null, theme: 'Default' },
  { username: 'jacob', password: 'funtime99', name: 'Jacob', role: 'user', defaultAvatar: '👶', color: 'orange', customAvatar: null, theme: 'Default' },
  { username: 'erika', password: 'princess2', name: 'Erika', role: 'user', defaultAvatar: '👧', color: 'pink', customAvatar: null, theme: 'Default' },
  { username: 'benny', password: 'explorer7', name: 'Benny', role: 'user', defaultAvatar: '🧑', color: 'teal', customAvatar: null, theme: 'Default' }
];

const WellsChaosCalendar = () => {
  const [currentView, setCurrentView] = useState('login');
  const [currentPage, setCurrentPage] = useState('calendar'); // calendar, photos, chat, checklist, budget, settings
  const [currentUser, setCurrentUser] = useState(null);
  const [accounts, setAccounts] = useState(PRESET_ACCOUNTS);
  const [trip, setTrip] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [editingBlock, setEditingBlock] = useState(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showEventChat, setShowEventChat] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTheme = () => {
    if (!currentUser) return THEMES['Default'];
    return THEMES[currentUser.theme] || THEMES['Default'];
  };

  // Login Screen with Quick Switcher
  const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (user) => {
      const account = accounts.find(acc => acc.username === user.username);
      setCurrentUser(account);
      setCurrentView('welcome');
      setError('');
    };

    const quickLogin = (account) => {
      setCurrentUser(account);
      setCurrentView('welcome');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-2">
              Wells Chaos Calendar
            </h1>
            <div className="text-3xl mb-2">✨</div>
            <p className="text-gray-600">Family Trip Planning</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const user = accounts.find(acc => acc.username === username && acc.password === password);
                    if (user) handleLogin(user);
                    else setError('Invalid username or password');
                  }
                }}
                placeholder="Enter username"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const user = accounts.find(acc => acc.username === username && acc.password === password);
                    if (user) handleLogin(user);
                    else setError('Invalid username or password');
                  }
                }}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => {
                const user = accounts.find(acc => acc.username === username && acc.password === password);
                if (user) handleLogin(user);
                else setError('Invalid username or password');
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Sign In
            </button>
          </div>

          {/* Quick Test Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-purple-600 font-semibold text-center mb-3">🚀 Quick Test Login:</p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {accounts.map(acc => (
                <button
                  key={acc.username}
                  onClick={() => quickLogin(acc)}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 p-3 rounded-xl transition-all transform hover:scale-105 border-2 border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg border-2 border-purple-200">
                      {acc.customAvatar ? (
                        <img src={acc.customAvatar} alt={acc.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        acc.defaultAvatar
                      )}
                    </div>
                    {acc.role === 'admin' && <Crown size={12} className="text-yellow-500" />}
                  </div>
                  <div className="text-xs font-semibold text-gray-800">{acc.name}</div>
                  <div className="text-xs text-gray-500">{acc.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Profile Picture Editor
  const ProfileEditor = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const saveCroppedImage = () => {
      const updatedAccounts = accounts.map(acc =>
        acc.username === currentUser.username
          ? { ...acc, customAvatar: selectedImage }
          : acc
      );
      setAccounts(updatedAccounts);
      const updatedUser = updatedAccounts.find(acc => acc.username === currentUser.username);
      setCurrentUser(updatedUser);
      setShowProfileEdit(false);
      setSelectedImage(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md animate-slide-up">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Camera size={24} className="text-purple-500" />
              Edit Profile
            </h3>
            <button onClick={() => setShowProfileEdit(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl border-4 border-white shadow-lg overflow-hidden">
                  {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : currentUser.customAvatar ? (
                    <img src={currentUser.customAvatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{currentUser.defaultAvatar}</span>
                  )}
                </div>
                {currentUser.role === 'admin' && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                    <Crown size={20} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Your Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(THEMES).map(themeName => (
                  <button
                    key={themeName}
                    onClick={() => {
                      const updatedAccounts = accounts.map(acc =>
                        acc.username === currentUser.username
                          ? { ...acc, theme: themeName }
                          : acc
                      );
                      setAccounts(updatedAccounts);
                      setCurrentUser(updatedAccounts.find(acc => acc.username === currentUser.username));
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      currentUser.theme === themeName
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${THEMES[themeName].primary} mb-2`}></div>
                    <div className="text-xs font-semibold text-gray-700">{themeName}</div>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-200 hover:to-pink-200 transition-all"
            >
              <Upload size={20} />
              Upload New Photo
            </button>

            {selectedImage && (
              <button
                onClick={saveCroppedImage}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Save Changes
              </button>
            )}

            {currentUser.customAvatar && (
              <button
                onClick={() => {
                  const updatedAccounts = accounts.map(acc =>
                    acc.username === currentUser.username
                      ? { ...acc, customAvatar: null }
                      : acc
                  );
                  setAccounts(updatedAccounts);
                  setCurrentUser(updatedAccounts.find(acc => acc.username === currentUser.username));
                  setShowProfileEdit(false);
                }}
                className="w-full border-2 border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Remove Custom Photo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Account Switcher
  const AccountSwitcher = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-xl font-bold text-gray-800">Switch Account</h3>
          <button onClick={() => setShowAccountSwitcher(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-2">
          {accounts.map(acc => (
            <button
              key={acc.username}
              onClick={() => {
                setCurrentUser(acc);
                setShowAccountSwitcher(false);
              }}
              className={`w-full p-4 rounded-xl transition-all flex items-center gap-3 ${
                currentUser.username === acc.username
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl border-2 border-purple-200 overflow-hidden flex-shrink-0">
                {acc.customAvatar ? (
                  <img src={acc.customAvatar} alt={acc.name} className="w-full h-full object-cover" />
                ) : (
                  acc.defaultAvatar
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold flex items-center gap-2">
                  {acc.name}
                  {acc.role === 'admin' && <Crown size={16} className="text-yellow-400" />}
                </div>
                <div className={`text-sm ${currentUser.username === acc.username ? 'text-white opacity-90' : 'text-gray-500'}`}>
                  {acc.role === 'admin' ? 'Admin' : 'Member'}
                </div>
              </div>
              {currentUser.username === acc.username && <Check size={20} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Welcome Screen
  const WelcomeScreen = () => {
    const theme = getCurrentTheme();
    
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg}`}>
        <div className="p-4 flex justify-between items-center bg-white shadow-sm">
          <button
            onClick={() => setShowProfileEdit(true)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-2 transition-all"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl border-2 border-purple-200 overflow-hidden">
                {currentUser.customAvatar ? (
                  <img src={currentUser.customAvatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.defaultAvatar
                )}
              </div>
              {currentUser.role === 'admin' && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Crown size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-800 text-sm">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Admin' : 'Member'}</div>
            </div>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAccountSwitcher(true)}
              className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-600"
              title="Switch Account"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => {
                setCurrentUser(null);
                setCurrentView('login');
                setTrip(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md animate-fade-in">
            <h1 className={`text-5xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent mb-2`}>
              Wells Chaos Calendar
            </h1>
            <div className="text-4xl mb-4">✨</div>
            
            <p className="text-gray-600 text-lg mb-2">
              Your cute little trip brain
            </p>
            <p className="text-gray-500 mb-4">
              Plan the anchors. Leave the rest flexible. Everyone wins.
            </p>
            <p className="text-xs text-gray-400 italic mb-8">
              Organized by Ben & Marie
            </p>
            
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => setCurrentView('createTrip')}
                className={`bg-gradient-to-r ${theme.primary} text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
              >
                Create Your Trip
              </button>
            ) : (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                <p className="text-purple-800 font-semibold mb-2">👋 Hey there!</p>
                <p className="text-purple-600 text-sm">
                  Ben & Marie will create the trip soon. Once it's ready, you'll be able to RSVP to events and add your fun comments!
                </p>
              </div>
            )}
          </div>
        </div>

        {showProfileEdit && <ProfileEditor />}
        {showAccountSwitcher && <AccountSwitcher />}
      </div>
    );
  };

  // Create Trip Form
  const CreateTripForm = () => {
    const [tripName, setTripName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const theme = getCurrentTheme();

    const handleCreate = () => {
      if (!tripName || !startDate || !endDate) return;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
          date: new Date(d),
          blocks: []
        });
      }

      setTrip({
        name: tripName,
        members: accounts,
        days,
        weather: null
      });
      setCurrentView('calendar');
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-4`}>
        <div className="max-w-lg mx-auto pt-8">
          <button
            onClick={() => setCurrentView('welcome')}
            className="text-purple-600 mb-6 flex items-center gap-2 hover:gap-3 transition-all"
          >
            <ChevronLeft size={20} /> Back
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Plan Your Adventure</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="Disney World Summer 2024"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm font-semibold text-purple-800 mb-3">Family Members</div>
                <div className="grid grid-cols-2 gap-2">
                  {accounts.map(member => (
                    <div key={member.username} className="bg-white rounded-lg p-3 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl border-2 border-purple-200 overflow-hidden flex-shrink-0">
                        {member.customAvatar ? (
                          <img src={member.customAvatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.defaultAvatar
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-800 flex items-center gap-1">
                          {member.name}
                          {member.role === 'admin' && <Crown size={12} className="text-yellow-500" />}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                className={`w-full bg-gradient-to-r ${theme.primary} text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
              >
                Create Trip ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calendar View with Time Widget
  const CalendarView = () => {
    if (!trip) return null;
    
    const currentDay = trip.days[currentDayIndex];
    const nextDay = () => setCurrentDayIndex(Math.min(currentDayIndex + 1, trip.days.length - 1));
    const prevDay = () => setCurrentDayIndex(Math.max(currentDayIndex - 1, 0));
    const theme = getCurrentTheme();

    const getNextEvent = () => {
      const now = new Date();
      for (let i = currentDayIndex; i < trip.days.length; i++) {
        const day = trip.days[i];
        for (let block of day.blocks) {
          const blockTime = new Date(day.date);
          const [hours, minutes] = block.startTime.split(':');
          blockTime.setHours(parseInt(hours), parseInt(minutes));
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
        {/* Header with Branding */}
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
                  onClick={() => setShowAccountSwitcher(true)}
                  className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-600"
                >
                  <Users size={20} />
                </button>
              </div>
            </div>

            {/* Current Time & Next Event Widget */}
            <div className={`bg-gradient-to-r ${theme.primary} rounded-2xl p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Current Time</div>
                  <div className="text-3xl font-bold">
                    {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </div>
                {nextEvent && (
                  <div className="text-right">
                    <div className="text-xs opacity-90">Next Event</div>
                    <div className="font-bold text-lg">{nextEvent.block.title}</div>
                    <div className="text-sm opacity-90">
                      {nextEvent.block.startTime} • {nextEvent.timeUntil < 60 ? `${nextEvent.timeUntil}min` : `${Math.floor(nextEvent.timeUntil / 60)}h ${nextEvent.timeUntil % 60}min`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <Cloud size={32} className="text-blue-500" />
            <div className="flex-1">
              <div className="font-semibold text-blue-800">Orlando Weather</div>
              <div className="text-sm text-blue-600">Sunny, 82°F • Pack sunscreen!</div>
            </div>
          </div>
        </div>

        {/* Day Navigation */}
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
                  {currentDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
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

            {/* Timeline */}
            <div className="space-y-3 mt-6">
              {currentDay.blocks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-2">☁️</div>
                  <div className="text-sm">No plans yet - pure freedom!</div>
                </div>
              ) : (
                currentDay.blocks
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((block, index) => (
                    <TimeBlock
                      key={index}
                      block={block}
                      onEdit={isAdmin ? () => setEditingBlock(block) : null}
                      onRsvp={() => setShowRsvpModal(block)}
                      onChat={() => setShowEventChat(block)}
                      currentUser={currentUser}
                      accounts={accounts}
                      isAdmin={isAdmin}
                      theme={theme}
                    />
                  ))
              )}
            </div>

            {/* Add Block Button - Admin Only */}
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

        {/* Modals */}
        {(showBlockForm || editingBlock) && isAdmin && (
          <BlockFormModal
            block={editingBlock}
            day={currentDay}
            members={trip.members}
            theme={theme}
            onSave={(block) => {
              if (editingBlock) {
                const blockIndex = currentDay.blocks.findIndex(b => b === editingBlock);
                currentDay.blocks[blockIndex] = block;
              } else {
                currentDay.blocks.push(block);
              }
              setTrip({...trip});
              setEditingBlock(null);
              setShowBlockForm(false);
            }}
            onDelete={() => {
              currentDay.blocks = currentDay.blocks.filter(b => b !== editingBlock);
              setTrip({...trip});
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
              if (!showRsvpModal.rsvps) showRsvpModal.rsvps = [];
              const existingIndex = showRsvpModal.rsvps.findIndex(r => r.username === currentUser.username);
              if (existingIndex >= 0) {
                showRsvpModal.rsvps[existingIndex] = rsvp;
              } else {
                showRsvpModal.rsvps.push(rsvp);
              }
              setTrip({...trip});
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
              if (!showEventChat.chats) showEventChat.chats = [];
              showEventChat.chats.push(chat);
              setTrip({...trip});
            }}
            onClose={() => setShowEventChat(null)}
          />
        )}

        {showAccountSwitcher && <AccountSwitcher />}
      </div>
    );
  };

  // Time Block Component with Stickers & Chat
  const TimeBlock = ({ block, onEdit, onRsvp, onChat, currentUser, accounts, isAdmin, theme }) => {
    const isFamily = block.type === 'FAMILY';
    const rsvps = block.rsvps || [];
    const userRsvp = rsvps.find(r => r.username === currentUser.username);
    const reactions = block.reactions || {};
    const chats = block.chats || [];
    
    const toggleReaction = (sticker) => {
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
            {locationDetail && (
              <div className="text-xs text-gray-500 italic mt-1 ml-5">
                {locationDetail}
              </div>
            )}
            {block.park && (
              <div className="text-xs text-gray-500 mt-1">
                📍 {block.park}
              </div>
            )}

            {/* Sticker Reactions */}
            {Object.keys(reactions).some(s => reactions[s].length > 0) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.keys(reactions).filter(s => reactions[s].length > 0).map(sticker => (
                  <div key={sticker} className="bg-white rounded-full px-2 py-1 text-xs flex items-center gap-1 shadow-sm">
                    <span>{sticker}</span>
                    <span className="font-semibold text-gray-600">{reactions[sticker].length}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Reactions */}
            <div className="flex flex-wrap gap-1 mt-3">
              {STICKERS.slice(0, 4).map(sticker => (
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

            {/* RSVPs Section */}
            {isFamily && rsvps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <div className="flex flex-wrap gap-2">
                  {rsvps.map(rsvp => {
                    const member = accounts.find(m => m.username === rsvp.username);
                    if (rsvp.status === 'not-going') return null;
                    return (
                      <div
                        key={rsvp.username}
                        className="bg-white rounded-xl p-2 shadow-sm animate-pop-in"
                      >
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
                            {rsvp.quip && (
                              <div className="text-gray-600 italic mt-0.5">"{rsvp.quip}"</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat Preview */}
            {chats.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <MessageCircle size={12} />
                  {chats.length} message{chats.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Action Buttons */}
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
                    <><Check size={14} /> Going!</>
                  ) : userRsvp && userRsvp.status === 'not-going' ? (
                    <><ThumbsDown size={14} /> Can't Make It</>
                  ) : (
                    <><Heart size={14} /> RSVP</>
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

  // RSVP Modal with Can't Make It option
  const RsvpModal = ({ block, currentUser, theme, onSave, onCancel }) => {
    const existingRsvp = block.rsvps?.find(r => r.username === currentUser.username);
    const [status, setStatus] = useState(existingRsvp?.status || 'going');
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

              {/* Status Selection */}
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
                  rows="2"
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

  // Event Chat Modal
  const EventChatModal = ({ block, currentUser, accounts, theme, onSave, onClose }) => {
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
                const member = accounts.find(m => m.username === chat.username);
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

  // Block Form Modal with Enhanced Features
  const BlockFormModal = ({ block, day, members, theme, onSave, onDelete, onCancel }) => {
    const [formData, setFormData] = useState(block || {
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
    });

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

    const handleSuggestionClick = (suggestion) => {
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
            <h3 className="text-xl font-bold text-gray-800">
              {block ? 'Edit Block' : 'Add Time Block'}
            </h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setFormData({...formData, type: 'FAMILY'})}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.type === 'FAMILY'
                    ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎟️ Family Time
              </button>
              <button
                onClick={() => setFormData({...formData, type: 'PERSONAL'})}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  formData.type === 'PERSONAL'
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ☁️ Personal Time
              </button>
            </div>

            {/* Park Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Park</label>
              <select
                value={formData.park}
                onChange={(e) => setFormData({...formData, park: e.target.value, title: '', location: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="">Select a park...</option>
                <optgroup label="🏰 Walt Disney World">
                  {THEME_PARKS.disney.parks.map(park => (
                    <option key={park} value={park}>{park}</option>
                  ))}
                </optgroup>
                <optgroup label="⚡ Universal Orlando">
                  {THEME_PARKS.universal.parks.map(park => (
                    <option key={park} value={park}>{park}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Enhanced Quick Suggestions */}
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

                {/* Suggestions Dropdown */}
                {showSuggestions && getSuggestions().length > 0 && (
                  <div className="mt-3 bg-white border-2 border-purple-300 rounded-xl max-h-64 overflow-y-auto shadow-lg">
                    <div className="sticky top-0 bg-purple-100 px-4 py-2 text-xs font-semibold text-purple-800 border-b border-purple-200">
                      {getSuggestions().length} options available
                    </div>
                    {getSuggestions().map((suggestion, index) => {
                      const detail = formData.park && LOCATION_DETAILS[formData.park]?.[suggestion];
                      return (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="text-sm font-medium">{suggestion}</div>
                          {detail && (
                            <div className="text-xs text-gray-500 italic mt-1">{detail}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Lunch at Be Our Guest"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location {formData.park && <span className="text-xs text-gray-500">(auto-filled)</span>}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Fantasyland"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {block && (
                <button
                  onClick={onDelete}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                >
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

  // Render appropriate view
  return (
    <div className="font-sans">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }
        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
      
      {currentView === 'login' && <LoginScreen />}
      {currentView === 'welcome' && <WelcomeScreen />}
      {currentView === 'createTrip' && <CreateTripForm />}
      {currentView === 'calendar' && <CalendarView />}
    </div>
  );
};

export default WellsChaosCalendar;