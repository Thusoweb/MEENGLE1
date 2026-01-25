/**
 * MEENGLE Tier Configuration
 * South African Pricing (ZAR)
 * Production-ready tier system
 */

export const TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    badge: '',
    price: 0,
    currency: 'ZAR',
    features: [
      'Limited daily likes',
      'Basic discovery',
      'View profiles',
      'Standard filters'
    ],
    features_full: {
      dailyLikes: 5,
      advancedFilters: false,
      seeWhoLiked: false,
      videoCalls: false,
      unlimitedMessages: false,
      premiumFilters: false,
      vipSupport: false
    }
  },

  SPARK: {
    id: 'spark_monthly',
    name: 'Spark',
    badge: '?',
    price: 59.99,
    currency: 'ZAR',
    features: [
      '? Spark badge',
      'Extended matches',
      'More messages',
      '15 daily likes'
    ],
    features_full: {
      dailyLikes: 15,
      advancedFilters: false,
      seeWhoLiked: false,
      videoCalls: false,
      unlimitedMessages: false,
      premiumFilters: false,
      vipSupport: false
    }
  },

  SPARK_PLUS: {
    id: 'sparkplus_monthly',
    name: 'Spark+',
    badge: '?+',
    price: 99.99,
    currency: 'ZAR',
    popular: true,
    features: [
      '?+ Spark+ badge',
      'Unlimited matches',
      'Unlimited messages',
      'Advanced filters',
      '? daily likes'
    ],
    features_full: {
      dailyLikes: Infinity,
      advancedFilters: true,
      seeWhoLiked: false,
      videoCalls: false,
      unlimitedMessages: true,
      premiumFilters: false,
      vipSupport: false
    }
  },

  FLAME: {
    id: 'flame_monthly',
    name: 'Flame',
    badge: '??',
    price: 149.99,
    currency: 'ZAR',
    features: [
      '?? Flame badge',
      'All Spark+ features',
      'Video calls (50/month)',
      'Premium filters',
      '? daily likes'
    ],
    features_full: {
      dailyLikes: Infinity,
      advancedFilters: true,
      seeWhoLiked: false,
      videoCalls: true,
      videoCallsPerMonth: 50,
      unlimitedMessages: true,
      premiumFilters: true,
      vipSupport: false
    }
  },

  WILDFIRE: {
    id: 'wildfire_monthly',
    name: 'Wildfire',
    badge: '???',
    price: 199.99,
    currency: 'ZAR',
    premium: true,
    duration: 'monthly',
    features: [
      '??? Wildfire VIP badge',
      'All Flame features',
      'Unlimited video calls',
      'VIP priority support',
      '? daily likes',
      'Premium match algorithm'
    ],
    features_full: {
      dailyLikes: Infinity,
      advancedFilters: true,
      seeWhoLiked: true,
      videoCalls: true,
      videoCallsPerMonth: Infinity,
      unlimitedMessages: true,
      premiumFilters: true,
      vipSupport: true,
      accessBeautifulProfiles: true
    }
  },

  WILDFIRE_DAILY: {
    id: 'wildfire_daily',
    name: 'Wildfire Daily',
    badge: '???',
    price: 34.99,
    currency: 'ZAR',
    premium: false,
    duration: 'daily',
    features: [
      '??? 24-hour Wildfire boost',
      'All Flame features for 24 hours',
      '? daily likes for 24 hours',
      'Improved match quality'
    ],
    features_full: {
      dailyLikes: Infinity,
      advancedFilters: true,
      seeWhoLiked: true,
      videoCalls: true,
      videoCallsPerMonth: 50,
      unlimitedMessages: true,
      premiumFilters: true,
      vipSupport: false,
      accessBeautifulProfiles: false,
      limitedBeautifulProfileAccess: 5
    }
  }
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  CAPITEC: 'capitec',
  FNB: 'fnb',
  STANDARD_BANK: 'standard_bank',
  INVESTEC: 'investec',
  ABSA: 'absa',
  EFT: 'eft',
  PAYFLEX: 'payflex'
};

export const PAYMENT_METHOD_NAMES = {
  card: 'Credit/Debit Card',
  capitec: 'Capitec',
  fnb: 'FNB',
  standard_bank: 'Standard Bank',
  investec: 'Investec',
  absa: 'ABSA',
  eft: 'EFT Transfer',
  payflex: 'PayFlex BNPL'
};

export default TIERS;
