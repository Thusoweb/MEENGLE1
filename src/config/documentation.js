/**
 * MEENGLE Documentation & Configuration
 * Everything integrated into code, NOT separate .md files
 */

// ============================================================
// TIER SYSTEM (Integrated from TIERS.md)
// ============================================================
export const TIER_DOCUMENTATION = {
  description: 'South African dating app with 4 subscription tiers',
  currency: 'ZAR',
  tiers: [
    {
      name: 'Free',
      badge: '',
      price: 0,
      dailyLikes: 5,
      features: ['Limited daily likes', 'Basic discovery', 'View profiles']
    },
    {
      name: 'Spark',
      badge: '?',
      price: 9.99,
      dailyLikes: 15,
      features: ['Extended matches', 'More messages', 'Spark badge']
    },
    {
      name: 'Spark+',
      badge: '?+',
      price: 16.99,
      daily Likes: Infinity,
      features: ['Unlimited matches', 'Unlimited messages', 'Advanced filters'],
      popular: true
    },
    {
      name: 'Flame',
      badge: '??',
      price: 24.99,
      dailyLikes: Infinity,
      features: ['Video calls (50/mo)', 'Premium filters', 'All Spark+ features']
    },
    {
      name: 'Wildfire',
      badge: '???',
      price: 34.99,
      dailyLikes: Infinity,
      features: ['Unlimited video calls', 'VIP support', 'All Flame features'],
      premium: true
    }
  ]
};

// ============================================================
// MATCHING ALGORITHM (Integrated from matching docs)
// ============================================================
export const MATCHING_ALGORITHM = {
  description: 'AI-powered matching algorithm with compatibility scoring',
  scoring: {
    interestMatch: {
      points: 10,
      perCommonInterest: true,
      description: 'Each common interest adds 10 points'
    },
    agePreference: {
      maxPoints: 20,
      description: 'Prefer closer ages (e.g., 1 year difference = 19 points)'
    },
    distancePreference: {
      maxPoints: 20,
      description: 'Closer distance = more points (max 20 for 0km away)'
    },
    profileComplete: {
      verified: 5,
      photosPresent: 3,
      description: 'Bonus points for verified or photo profiles'
    }
  },
  formula: 'commonInterests*10 + ageScore + distanceScore + bonuses',
  sortOrder: 'Descending by total score',
  location: 'firestoreMeenglingService.js - scoreProfileMatches()'
};

// ============================================================
// PAYMENT METHODS (Integrated from payment docs)
// ============================================================
export const PAYMENT_METHODS = {
  description: '8 South African payment methods + PayFlex BNPL',
  methods: [
    { id: 'card', name: 'Credit/Debit Card', provider: 'Stripe/PayFast' },
    { id: 'capitec', name: 'Capitec', provider: 'Capitec Bank' },
    { id: 'fnb', name: 'FNB', provider: 'FNB Bank' },
    { id: 'standard_bank', name: 'Standard Bank', provider: 'Standard Bank' },
    { id: 'investec', name: 'Investec', provider: 'Investec Bank' },
    { id: 'absa', name: 'ABSA', provider: 'ABSA Bank' },
    { id: 'eft', name: 'EFT Transfer', provider: 'Direct bank transfer' },
    { id: 'payflex', name: 'PayFlex BNPL', provider: 'PayFlex (3/6/12 months)' }
  ],
  location: 'src/config/tiers.js - PAYMENT_METHODS'
};

// ============================================================
// FEATURES BY TIER (Integrated from feature docs)
// ============================================================
export const FEATURE_MATRIX = {
  FREE: {
    dailyLikes: 5,
    unlimitedMatches: false,
    advancedFilters: false,
    seeWhoLiked: false,
    videoCalls: false,
    unlimitedMessages: false,
    premiumFilters: false,
    vipSupport: false
  },
  SPARK: {
    dailyLikes: 15,
    unlimitedMatches: false,
    advancedFilters: false,
    seeWhoLiked: false,
    videoCalls: false,
    unlimitedMessages: false,
    premiumFilters: false,
    vipSupport: false
  },
  SPARK_PLUS: {
    dailyLikes: Infinity,
    unlimitedMatches: true,
    advancedFilters: true,
    seeWhoLiked: false,
    videoCalls: false,
    unlimitedMessages: true,
    premiumFilters: false,
    vipSupport: false
  },
  FLAME: {
    dailyLikes: Infinity,
    unlimitedMatches: true,
    advancedFilters: true,
    seeWhoLiked: false,
    videoCalls: true,
    videoCallsPerMonth: 50,
    unlimitedMessages: true,
    premiumFilters: true,
    vipSupport: false
  },
  WILDFIRE: {
    dailyLikes: Infinity,
    unlimitedMatches: true,
    advancedFilters: true,
    seeWhoLiked: true,
    videoCalls: true,
    videoCallsPerMonth: Infinity,
    unlimitedMessages: true,
    premiumFilters: true,
    vipSupport: true
  }
};

// ============================================================
// ARCHITECTURE (Integrated from architecture docs)
// ============================================================
export const ARCHITECTURE = {
  frontend: {
    framework: 'React 18',
    routing: 'React Router v6',
    styling: 'CSS with design system',
    performance: '60FPS GPU accelerated animations',
    files: '50+ JSX/JS files'
  },
  backend: {
    firebase: 'Firestore + Storage + Auth',
    realtime: 'Firestore real-time listeners',
    payments: '8 SA payment methods'
  },
  mobile: {
    flutter: 'Cross-platform mobile app',
    sync: 'Real-time sync with Firebase'
  },
  phases: {
    phase1: 'Authentication (complete)',
    phase2: 'Profile System (complete)',
    phase3: '60FPS Discovery (complete)',
    phase4: 'Real-time Messaging (complete)',
    phase5: 'Payments & Tiers (complete)'
  }
};

// ============================================================
// SETUP & DEPLOYMENT (Integrated from setup docs)
// ============================================================
export const DEPLOYMENT = {
  frontend: {
    command: 'npm start',
    location: 'C:\\Users\\thusowaver\\Desktop\\Coding Mingle\\frontend',
    port: 3000,
    firebase: 'Configuration in src/config/firebase.js'
  },
  github: {
    repo: 'https://github.com/Thusoweb/MEENGLE1',
    branch: 'gh-pages',
    status: 'Ready for deployment'
  },
  requirements: {
    node: '18+',
    npm: '8.19.4',
    firebase: '10.12.5'
  }
};

// ============================================================
// SECURITY (Integrated from security docs)
// ============================================================
export const SECURITY = {
  firebase: {
    auth: 'Email + Google + Facebook OAuth',
    sessionPersistence: 'Browser local storage',
    rules: 'Firestore security rules configured'
  },
  payments: {
    encryption: 'Bank-level SSL/TLS',
    providers: 'PCI-DSS compliant payment processors'
  },
  data: {
    storage: 'End-to-end encrypted messages',
    privacy: 'No third-party tracking'
  }
};

export default {
  TIER_DOCUMENTATION,
  MATCHING_ALGORITHM,
  PAYMENT_METHODS,
  FEATURE_MATRIX,
  ARCHITECTURE,
  DEPLOYMENT,
  SECURITY
};
