/**
 * Icebreakers Service
 * Pre-written conversation starters to break the ice
 */

import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

class IcebreakersService {
  constructor() {
    this.defaultIcebreakers = [
      // Funny
      { text: "What's your worst pickup line story?", category: 'funny' },
      { text: "If you could only eat one cuisine forever, what would it be?", category: 'funny' },
      { text: "What's the most unusual talent you have?", category: 'funny' },
      { text: "Would you rather fight one horse-sized duck or 100 duck-sized horses?", category: 'funny' },
      
      // Genuine
      { text: "What's something you're passionate about?", category: 'genuine' },
      { text: "What's your ideal weekend look like?", category: 'genuine' },
      { text: "What's a goal you're working towards right now?", category: 'genuine' },
      { text: "What's the best advice someone gave you?", category: 'genuine' },
      
      // Travel
      { text: "Where's the next place on your travel bucket list?", category: 'travel' },
      { text: "What's your favorite memory from a trip?", category: 'travel' },
      { text: "Beach or mountains - where's your happy place?", category: 'travel' },
      { text: "If you could live anywhere in the world, where would it be?", category: 'travel' },
      
      // Adventure
      { text: "What's something new you want to try?", category: 'adventure' },
      { text: "What's your most daring moment?", category: 'adventure' },
      { text: "What's on your bucket list?", category: 'adventure' },
      { text: "What's the scariest thing you've ever done?", category: 'adventure' },
      
      // Music/Movies
      { text: "What's a band/artist that means a lot to you?", category: 'entertainment' },
      { text: "What's your go-to comfort movie?", category: 'entertainment' },
      { text: "What show are you currently binging?", category: 'entertainment' },
      { text: "What's your guilty pleasure playlist?", category: 'entertainment' },
      
      // Philosophy
      { text: "What brings you the most joy in life?", category: 'philosophy' },
      { text: "What's something you've learned about yourself recently?", category: 'philosophy' },
      { text: "What does a perfect day look like for you?", category: 'philosophy' },
      { text: "What quality do you value most in people?", category: 'philosophy' },
      
      // Flirty
      { text: "What made you notice my profile?", category: 'flirty' },
      { text: "What's something most people don't know about you?", category: 'flirty' },
      { text: "If we went out, where would you take me?", category: 'flirty' },
      { text: "What's your love language?", category: 'flirty' }
    ];
  }

  /**
   * Get icebreakers by category
   */
  getByCategory(category) {
    return this.defaultIcebreakers.filter(i => i.category === category);
  }

  /**
   * Get random icebreaker
   */
  getRandom() {
    return this.defaultIcebreakers[
      Math.floor(Math.random() * this.defaultIcebreakers.length)
    ];
  }

  /**
   * Get random icebreakers by count
   */
  getRandomIcebreakers(count = 3) {
    const shuffled = [...this.defaultIcebreakers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get icebreakers suggestions based on match profile
   */
  async getSuggestedIcebreakers(matchProfile) {
    try {
      const suggestions = [];
      
      // If they mention travel in bio
      if (matchProfile.bio?.toLowerCase().includes('travel')) {
        suggestions.push(...this.getByCategory('travel').slice(0, 2));
      }
      
      // If they mention music
      if (matchProfile.bio?.toLowerCase().includes('music')) {
        suggestions.push(...this.getByCategory('entertainment').slice(0, 2));
      }
      
      // If they mention adventure
      if (matchProfile.bio?.toLowerCase().includes('adventure')) {
        suggestions.push(...this.getByCategory('adventure').slice(0, 2));
      }
      
      // If no specific matches, add genuine ones
      if (suggestions.length === 0) {
        suggestions.push(...this.getByCategory('genuine').slice(0, 3));
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return this.getRandomIcebreakers();
    }
  }

  /**
   * Get all categories
   */
  getCategories() {
    const categories = new Set(this.defaultIcebreakers.map(i => i.category));
    return Array.from(categories);
  }

  /**
   * Get count by category
   */
  getCategoryStats() {
    return this.getCategories().map(cat => ({
      category: cat,
      count: this.getByCategory(cat).length
    }));
  }

  /**
   * Track icebreaker usage (optional, for analytics)
   */
  async trackUsage(matchId, icebreaker) {
    try {
      // Log for analytics to understand which icebreakers work best
      console.log(`Icebreaker used for match ${matchId}:`, icebreaker);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }
}

export default new IcebreakersService();
