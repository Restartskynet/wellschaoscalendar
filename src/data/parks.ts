export const LOCATION_DETAILS = {
  'Magic Kingdom': {
    '🏰 Cinderella Castle Photos': 'Main Hub, in front of castle',
    '🎢 Space Mountain': 'Tomorrowland, near Astro Orbiter',
    '🏔️ Big Thunder Mountain Railroad': 'Frontierland, by the river',
    '👻 Haunted Mansion': 'Liberty Square, near Rivers of America',
    '🏴‍☠️ Pirates of the Caribbean': 'Adventureland, near Jungle Cruise',
    "🎠 It's a Small World": 'Fantasyland, near Peter Pan',
    '🎢 Seven Dwarfs Mine Train': 'Fantasyland, new area',
    '⚡ TRON Lightcycle Run': 'Tomorrowland, entrance near Space Mountain',
    '🍽️ Be Our Guest Restaurant': "Fantasyland, Beast's Castle",
    "🍽️ Cinderella's Royal Table": 'Inside Cinderella Castle'
  },
  EPCOT: {
    '🚀 Test Track': 'Future World, near entrance',
    '🎢 Guardians of the Galaxy: Cosmic Rewind': 'Future World, Wonders of Xandar',
    '🌊 Living with the Land': 'The Land Pavilion',
    '🍽️ Space 220 Restaurant': 'Future World, Mission: SPACE area',
    '🇲🇽 Mexico Pavilion': 'World Showcase, left from entrance',
    '🇫🇷 France Pavilion': 'World Showcase, back area'
  },
  'Hollywood Studios': {
    '⭐ The Twilight Zone Tower of Terror': 'Sunset Boulevard, end of street',
    "🎸 Rock 'n' Roller Coaster": 'Sunset Boulevard, near Tower',
    "⚔️ Star Wars: Rise of the Resistance": "Galaxy's Edge, far back corner",
    "🎪 Mickey & Minnie's Runaway Railway": 'Chinese Theatre, center of park',
    '🎭 Fantasmic! (Night Show)': 'Hollywood Hills Amphitheater'
  },
  'Animal Kingdom': {
    '🏔️ Expedition Everest': 'Asia section, back of park',
    '🦁 Kilimanjaro Safaris': 'Africa section, Harambe',
    '🎢 Avatar Flight of Passage': 'Pandora, far left of park',
    '🌳 Tree of Life': 'Discovery Island, park center'
  },
  'Universal Studios Florida': {
    '🧙 Harry Potter and the Escape from Gringotts': 'Diagon Alley, London area',
    '🍽️ The Leaky Cauldron': 'Diagon Alley'
  },
  'Islands of Adventure': {
    '🧙 Harry Potter and the Forbidden Journey': 'Hogsmeade, Hogwarts Castle',
    '🎢 VelociCoaster': 'Jurassic Park area',
    '🦖 Jurassic Park River Adventure': 'Jurassic Park section'
  }
};

export const THEME_PARKS = {
  disney: {
    name: 'Walt Disney World',
    parks: ['Magic Kingdom', 'EPCOT', 'Hollywood Studios', 'Animal Kingdom']
  },
  universal: {
    name: 'Universal Orlando',
    parks: ['Universal Studios Florida', 'Islands of Adventure', 'Volcano Bay']
  }
};

export const ATTRACTIONS = {
  'Magic Kingdom': [
    '🏰 Cinderella Castle Photos',
    '🎢 Space Mountain',
    '🏔️ Big Thunder Mountain Railroad',
    '👻 Haunted Mansion',
    '🏴‍☠️ Pirates of the Caribbean',
    "🎠 It's a Small World",
    '🚂 Tomorrowland Transit Authority',
    '🎪 Dumbo the Flying Elephant',
    '🎢 Seven Dwarfs Mine Train',
    '⚡ TRON Lightcycle Run',
    '🎠 Prince Charming Regal Carrousel',
    '🚀 Buzz Lightyear Space Ranger Spin',
    "🏰 Peter Pan's Flight",
    '🧞 The Magic Carpets of Aladdin',
    '🌊 Splash Mountain',
    '🎪 Mad Tea Party',
    '⚔️ Enchanted Tales with Belle'
  ],
  EPCOT: [
    '🚀 Test Track',
    '🎢 Guardians of the Galaxy: Cosmic Rewind',
    '🌊 Living with the Land',
    '🐟 The Seas with Nemo & Friends',
    '🎆 Harmonious (Fireworks)',
    '🇲🇽 Mexico Pavilion',
    '🇫🇷 France Pavilion',
    '🇯🇵 Japan Pavilion',
    '🇬🇧 United Kingdom Pavilion',
    '🇨🇦 Canada Pavilion',
    '🇨🇳 China Pavilion',
    '🇮🇹 Italy Pavilion',
    '🇩🇪 Germany Pavilion',
    '🇺🇸 The American Adventure',
    '🇲🇦 Morocco Pavilion',
    '🇳🇴 Norway Pavilion',
    '🎢 Mission: SPACE',
    '🌍 Spaceship Earth',
    '🎨 Journey Into Imagination',
    '🦁 The Land Pavilion'
  ],
  'Hollywood Studios': [
    '⭐ The Twilight Zone Tower of Terror',
    "🎸 Rock 'n' Roller Coaster",
    '🚗 Star Tours',
    '🎬 Toy Story Mania!',
    '⚔️ Star Wars: Rise of the Resistance',
    "🎪 Mickey & Minnie's Runaway Railway",
    '🎭 Fantasmic! (Night Show)',
    '🦖 Indiana Jones Epic Stunt Spectacular',
    '🎬 Walt Disney Presents',
    '🚂 Alien Swirling Saucers',
    '🎢 Slinky Dog Dash',
    '🌟 Beauty and the Beast Live',
    '⚡ For the First Time in Forever: Frozen Sing-Along'
  ],
  'Animal Kingdom': [
    '🏔️ Expedition Everest',
    '🦁 Kilimanjaro Safaris',
    '🌊 Kali River Rapids',
    '🎢 Avatar Flight of Passage',
    '🌳 Tree of Life',
    '🦖 Dinosaur',
    '🎆 Rivers of Light (Night Show)',
    '🎪 Festival of the Lion King',
    "🦅 It's Tough to be a Bug!",
    '🚂 Wildlife Express Train',
    "🌊 Na'vi River Journey",
    '🦜 Gorilla Falls Exploration Trail',
    '🐘 Maharajah Jungle Trek',
    '🦕 The Boneyard'
  ],
  'Universal Studios Florida': [
    '🧙 Harry Potter and the Escape from Gringotts',
    '🧙 Diagon Alley Exploration',
    '🎬 The Mummy - Revenge of the Mummy',
    '⚡ Hollywood Rip Ride Rockit',
    '👾 Men in Black Alien Attack',
    '🚗 Fast & Furious Supercharged',
    '🦖 E.T. Adventure',
    '🎬 Transformers: The Ride 3D',
    '🦈 Race Through New York with Jimmy Fallon',
    "🎭 Universal's Horror Make-Up Show",
    '🎪 The Simpsons Ride',
    '🦸 Despicable Me Minion Mayhem'
  ],
  'Islands of Adventure': [
    '🧙 Harry Potter and the Forbidden Journey',
    '🧙 Hogsmeade Village',
    '🎢 The Incredible Hulk Coaster',
    '🎢 VelociCoaster',
    '🦕 Jurassic World VelociCoaster',
    '🦖 Jurassic Park River Adventure',
    "💦 Popeye & Bluto's Bilge-Rat Barges",
    "💦 Dudley Do-Right's Ripsaw Falls",
    '🎪 The Cat in the Hat',
    '🦸 The Amazing Adventures of Spider-Man',
    "🎢 Hagrid's Magical Creatures Motorbike Adventure",
    '🦕 Pteranodon Flyers',
    '🎪 Seuss Landing',
    "⚡ Doctor Doom's Fearfall",
    '🎠 Caro-Seuss-el'
  ],
  'Volcano Bay': [
    '🌊 Krakatau Aqua Coaster',
    "🌊 Ko'okiri Body Plunge",
    '🌊 Kala & Tai Nui Serpentine Body Slides',
    '🏄 Honu & Ika Moana Wave Slides',
    '💦 Punga Racers',
    '🌊 Waturi Beach Wave Pool',
    '🏊 The Reef Leisure Pool',
    '🌊 TeAwa The Fearless River',
    '💦 Kopiko Wai Winding River',
    '🎪 Runamukka Reef Kids Area'
  ]
};

export const RESTAURANTS = {
  'Magic Kingdom': [
    '🍽️ Be Our Guest Restaurant',
    "🍽️ Cinderella's Royal Table",
    '🍕 Pinocchio Village Haus',
    '🌮 Pecos Bill Tall Tale Inn',
    "🍔 Cosmic Ray's Starlight Cafe",
    "🥨 Casey's Corner",
    "🧁 Gaston's Tavern",
    '🍦 Plaza Ice Cream Parlor',
    '🥐 Main Street Bakery (Starbucks)',
    '🍽️ The Crystal Palace',
    "🍽️ Tony's Town Square Restaurant",
    '🍕 Columbia Harbour House',
    "🍔 The Friar's Nook",
    '🌮 Tortuga Tavern',
    '🍦 Aloha Isle (Dole Whip!)'
  ],
  EPCOT: [
    '🍽️ Space 220 Restaurant',
    '🍕 Via Napoli',
    '🍔 Electric Umbrella',
    '🌮 La Hacienda de San Angel',
    '🥐 Les Halles Boulangerie',
    '🍣 Tokyo Dining',
    '🥨 Biergarten Restaurant',
    '🍽️ Le Cellier Steakhouse',
    '🍽️ Coral Reef Restaurant',
    '🍽️ Garden Grill',
    '🍽️ Akershus Royal Banquet Hall',
    '🍕 Tutto Italia',
    '🍔 Sunshine Seasons',
    '🌮 La Cantina de San Angel',
    '🥐 Kringla Bakeri Og Kafe',
    "🍦 L'Artisan des Glaces",
    '🍣 Kabuki Cafe',
    '🥨 Sommerfest'
  ],
  'Hollywood Studios': [
    '🍽️ The Hollywood Brown Derby',
    '🍕 PizzeRizzo',
    '🍔 Backlot Express',
    "🌮 Woody's Lunch Box",
    '🥨 Docking Bay 7 Food and Cargo',
    '🍦 Baseline Tap House',
    '🍽️ Sci-Fi Dine-In Theater',
    "🍽️ 50's Prime Time Cafe",
    '🍽️ Hollywood & Vine',
    '🍔 ABC Commissary',
    "🌮 Catalina Eddie's",
    '🥐 Ronto Roasters',
    "🍦 Oga's Cantina"
  ],
  'Animal Kingdom': [
    '🍽️ Tiffins Restaurant',
    '🍕 Pizzafari',
    '🍔 Flame Tree Barbecue',
    '🌮 Harambe Market',
    '🥨 Yak & Yeti Restaurant',
    '🍦 Dino-Bite Snacks',
    '🍽️ Tusker House',
    '🍽️ Rainforest Cafe',
    '🍔 Restaurantosaurus',
    "🌮 Satu'li Canteen",
    '🍦 Pongu Pongu',
    '🥐 Kusafiri Coffee Shop & Bakery',
    '🍕 Eight Spoon Cafe'
  ],
  'Universal Studios Florida': [
    '🍽️ The Leaky Cauldron',
    "🍕 Louie's Italian Restaurant",
    "🍔 Mel's Drive-In",
    "🌮 Bumblebee Man's Taco Truck",
    "🥨 Finnegan's Bar and Grill",
    "🍦 Florean Fortescue's Ice-Cream Parlour",
    '🍔 Fast Food Boulevard',
    "🌮 Richter's Burger Co.",
    "🍕 Lombard's Seafood Grille"
  ],
  'Islands of Adventure': [
    '🍽️ Mythos Restaurant',
    '🍕 Thunder Falls Terrace',
    '🍔 The Burger Digs',
    '🌮 Comic Strip Cafe',
    '🥨 Confisco Grille',
    '🍽️ Three Broomsticks',
    "🍔 Blondie's",
    '🍕 Pizza Predattoria',
    '🌮 The Watering Hole',
    '🍦 Honeydukes',
    '🥐 Croissant Moon Bakery',
    '🍔 Captain America Diner',
    "🌮 Wimpy's"
  ],
  'Volcano Bay': [
    '🍔 Kohola Reef Restaurant',
    '🌮 Bambu',
    '🍕 The Feasting Frog',
    '🍦 Whakawaiwai Eats',
    '🥤 Dancing Dragons Boat Bar'
  ]
};

export const SHOWS_PARADES = {
  'Magic Kingdom': [
    '🎆 Happily Ever After (Fireworks)',
    '🎭 Festival of Fantasy Parade',
    "🎪 Mickey's Magical Friendship Faire",
    '🎭 Country Bear Jamboree',
    "🎬 Walt Disney's Enchanted Tiki Room",
    '🎪 Monsters Inc. Laugh Floor'
  ],
  EPCOT: [
    '🎆 Harmonious (Fireworks)',
    '🎭 Voices of Liberty',
    '🎪 JAMMitors',
    '🎬 Awesome Planet',
    '🎭 American Music Machine'
  ],
  'Hollywood Studios': [
    '🎆 Fantasmic! (Night Show)',
    '🎭 Beauty and the Beast - Live on Stage',
    '🎪 Indiana Jones Epic Stunt Spectacular',
    '⚡ For the First Time in Forever',
    '🎬 Vacation Fun - An Original Animated Short with Mickey & Minnie'
  ],
  'Animal Kingdom': [
    '🎆 Rivers of Light',
    '🎭 Festival of the Lion King',
    '🎪 Finding Nemo - The Musical',
    '🎬 Feathered Friends in Flight'
  ]
};

export const COMMON_ACTIVITIES = [
  '🏊 Pool Time',
  '🛍️ Shopping',
  '😴 Nap/Rest',
  '🚶 Walking Around',
  '📸 Character Meet & Greet',
  '🎆 Watch Fireworks',
  '☕ Coffee Break',
  '🍦 Snack Time',
  '🎁 Gift Shop Browse',
  '🌅 Sunrise Photos',
  '🌆 Sunset Photos',
  '🎨 Face Painting',
  '🎈 Balloon Shopping',
  '🚗 Drive to Park',
  '🏨 Hotel Check-in',
  '🏨 Hotel Check-out',
  '✈️ Airport',
  '🚗 Parking'
];
