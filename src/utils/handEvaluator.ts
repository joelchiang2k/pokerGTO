/**
 * Hand Evaluator - Determines the strength of a poker hand
 */

import type { Card, Rank } from './cards';
import { RANK_VALUES } from './cards';

export type HandRank =
  | 'high_card'
  | 'pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush';

export interface HandEvaluation {
  rank: HandRank;
  rankValue: number;      // 1-10 (high card to royal flush)
  strength: number;       // 0-1 relative strength
  description: string;    // Human readable
  kickers: Rank[];        // Kicker cards
  madeHand: Card[];       // The 5 cards that make the hand
}

const HAND_RANK_VALUES: Record<HandRank, number> = {
  'high_card': 1,
  'pair': 2,
  'two_pair': 3,
  'three_of_a_kind': 4,
  'straight': 5,
  'flush': 6,
  'full_house': 7,
  'four_of_a_kind': 8,
  'straight_flush': 9,
  'royal_flush': 10
};

// Count occurrences of each rank
function countRanks(cards: Card[]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }
  return counts;
}

// Count occurrences of each suit
function countSuits(cards: Card[]): Map<string, Card[]> {
  const suits = new Map<string, Card[]>();
  for (const card of cards) {
    const existing = suits.get(card.suit) || [];
    suits.set(card.suit, [...existing, card]);
  }
  return suits;
}

// Check for straight (returns high card of straight or null)
function findStraight(cards: Card[]): Card[] | null {
  const uniqueRanks = [...new Set(cards.map(c => RANK_VALUES[c.rank]))].sort((a, b) => b - a);

  // Check for wheel (A-2-3-4-5)
  if (uniqueRanks.includes(14) && uniqueRanks.includes(2) &&
    uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
    return cards.filter(c =>
      [14, 2, 3, 4, 5].includes(RANK_VALUES[c.rank])
    ).slice(0, 5);
  }

  // Check for regular straight
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    const slice = uniqueRanks.slice(i, i + 5);
    if (slice[0] - slice[4] === 4) {
      const straightValues = new Set(slice);
      return cards.filter(c => straightValues.has(RANK_VALUES[c.rank])).slice(0, 5);
    }
  }

  return null;
}

// Find flush (5+ cards of same suit)
function findFlush(cards: Card[]): Card[] | null {
  const suitCounts = countSuits(cards);
  for (const [, suitCards] of suitCounts) {
    if (suitCards.length >= 5) {
      return suitCards
        .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])
        .slice(0, 5);
    }
  }
  return null;
}

// Evaluate the best 5-card hand from 7 cards
export function evaluateHand(holeCards: Card[], board: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...board];

  if (allCards.length < 5) {
    // Not enough cards, evaluate what we have
    return evaluatePartialHand(holeCards, board);
  }

  const rankCounts = countRanks(allCards);
  const flush = findFlush(allCards);
  const straight = findStraight(allCards);

  // Check for straight flush / royal flush
  if (flush) {
    const straightInFlush = findStraight(flush);
    if (straightInFlush) {
      const highCard = RANK_VALUES[straightInFlush[0].rank];
      if (highCard === 14) {
        return {
          rank: 'royal_flush',
          rankValue: 10,
          strength: 1.0,
          description: 'Royal Flush',
          kickers: [],
          madeHand: straightInFlush
        };
      }
      return {
        rank: 'straight_flush',
        rankValue: 9,
        strength: 0.95 + (highCard / 14) * 0.04,
        description: `Straight Flush, ${straightInFlush[0].rank} high`,
        kickers: [],
        madeHand: straightInFlush
      };
    }
  }

  // Four of a kind
  for (const [rank, count] of rankCounts) {
    if (count === 4) {
      const quads = allCards.filter(c => c.rank === rank);
      const kicker = allCards
        .filter(c => c.rank !== rank)
        .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])[0];
      return {
        rank: 'four_of_a_kind',
        rankValue: 8,
        strength: 0.9 + (RANK_VALUES[rank] / 14) * 0.05,
        description: `Four of a Kind, ${rank}s`,
        kickers: [kicker.rank],
        madeHand: [...quads, kicker]
      };
    }
  }

  // Full house
  let trips: Rank | null = null;
  let pair: Rank | null = null;
  const sortedRanks = [...rankCounts.entries()]
    .sort((a, b) => RANK_VALUES[b[0]] - RANK_VALUES[a[0]]);

  for (const [rank, count] of sortedRanks) {
    if (count >= 3 && !trips) trips = rank;
    else if (count >= 2 && !pair) pair = rank;
  }

  if (trips && pair) {
    const tripCards = allCards.filter(c => c.rank === trips).slice(0, 3);
    const pairCards = allCards.filter(c => c.rank === pair).slice(0, 2);
    return {
      rank: 'full_house',
      rankValue: 7,
      strength: 0.85 + (RANK_VALUES[trips] / 14) * 0.04,
      description: `Full House, ${trips}s full of ${pair}s`,
      kickers: [],
      madeHand: [...tripCards, ...pairCards]
    };
  }

  // Flush
  if (flush) {
    return {
      rank: 'flush',
      rankValue: 6,
      strength: 0.75 + (RANK_VALUES[flush[0].rank] / 14) * 0.08,
      description: `Flush, ${flush[0].rank} high`,
      kickers: flush.slice(1).map(c => c.rank),
      madeHand: flush
    };
  }

  // Straight
  if (straight) {
    return {
      rank: 'straight',
      rankValue: 5,
      strength: 0.65 + (RANK_VALUES[straight[0].rank] / 14) * 0.08,
      description: `Straight, ${straight[0].rank} high`,
      kickers: [],
      madeHand: straight
    };
  }

  // Three of a kind
  if (trips) {
    const tripCards = allCards.filter(c => c.rank === trips).slice(0, 3);
    const kickers = allCards
      .filter(c => c.rank !== trips)
      .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])
      .slice(0, 2);
    return {
      rank: 'three_of_a_kind',
      rankValue: 4,
      strength: 0.5 + (RANK_VALUES[trips] / 14) * 0.1,
      description: `Three of a Kind, ${trips}s`,
      kickers: kickers.map(c => c.rank),
      madeHand: [...tripCards, ...kickers]
    };
  }

  // Two pair
  const pairs: Rank[] = [];
  for (const [rank, count] of sortedRanks) {
    if (count >= 2) pairs.push(rank);
  }

  if (pairs.length >= 2) {
    const topPairs = pairs.slice(0, 2);
    const pairCards = allCards.filter(c => topPairs.includes(c.rank)).slice(0, 4);
    const kicker = allCards
      .filter(c => !topPairs.includes(c.rank))
      .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])[0];
    return {
      rank: 'two_pair',
      rankValue: 3,
      strength: 0.35 + (RANK_VALUES[topPairs[0]] / 14) * 0.1,
      description: `Two Pair, ${topPairs[0]}s and ${topPairs[1]}s`,
      kickers: [kicker.rank],
      madeHand: [...pairCards, kicker]
    };
  }

  // One pair
  if (pairs.length === 1) {
    const pairRank = pairs[0];
    const pairCards = allCards.filter(c => c.rank === pairRank).slice(0, 2);
    const kickers = allCards
      .filter(c => c.rank !== pairRank)
      .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])
      .slice(0, 3);
    return {
      rank: 'pair',
      rankValue: 2,
      strength: 0.2 + (RANK_VALUES[pairRank] / 14) * 0.12,
      description: `Pair of ${pairRank}s`,
      kickers: kickers.map(c => c.rank),
      madeHand: [...pairCards, ...kickers]
    };
  }

  // High card
  const highCards = allCards
    .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])
    .slice(0, 5);
  return {
    rank: 'high_card',
    rankValue: 1,
    strength: 0.05 + (RANK_VALUES[highCards[0].rank] / 14) * 0.12,
    description: `High Card, ${highCards[0].rank}`,
    kickers: highCards.slice(1).map(c => c.rank),
    madeHand: highCards
  };
}

// Evaluate partial hand (less than 5 cards)
function evaluatePartialHand(holeCards: Card[], board: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...board];
  const rankCounts = countRanks(allCards);

  // Check for pairs, trips, etc.
  let maxCount = 1;
  let maxRank: Rank = allCards[0]?.rank || 'A';

  for (const [rank, count] of rankCounts) {
    if (count > maxCount || (count === maxCount && RANK_VALUES[rank] > RANK_VALUES[maxRank])) {
      maxCount = count;
      maxRank = rank;
    }
  }

  if (maxCount === 4) {
    return {
      rank: 'four_of_a_kind',
      rankValue: 8,
      strength: 0.9,
      description: `Four of a Kind, ${maxRank}s`,
      kickers: [],
      madeHand: allCards
    };
  }

  if (maxCount === 3) {
    return {
      rank: 'three_of_a_kind',
      rankValue: 4,
      strength: 0.5 + (RANK_VALUES[maxRank] / 14) * 0.1,
      description: `Three of a Kind, ${maxRank}s`,
      kickers: [],
      madeHand: allCards
    };
  }

  // Count pairs
  const pairs = [...rankCounts.entries()].filter(([, count]) => count >= 2);
  if (pairs.length >= 2) {
    return {
      rank: 'two_pair',
      rankValue: 3,
      strength: 0.35,
      description: `Two Pair`,
      kickers: [],
      madeHand: allCards
    };
  }

  if (maxCount === 2) {
    return {
      rank: 'pair',
      rankValue: 2,
      strength: 0.2 + (RANK_VALUES[maxRank] / 14) * 0.12,
      description: `Pair of ${maxRank}s`,
      kickers: [],
      madeHand: allCards
    };
  }

  // High card
  const highCard = allCards.sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])[0];
  return {
    rank: 'high_card',
    rankValue: 1,
    strength: 0.05 + (RANK_VALUES[highCard?.rank || 'A'] / 14) * 0.12,
    description: `High Card${highCard ? `, ${highCard.rank}` : ''}`,
    kickers: [],
    madeHand: allCards
  };
}

// Get a simple strength category
export function getStrengthCategory(strength: number): {
  label: string;
  color: string;
} {
  if (strength >= 0.85) return { label: 'Monster', color: '#22c55e' };
  if (strength >= 0.65) return { label: 'Strong', color: '#84cc16' };
  if (strength >= 0.45) return { label: 'Medium', color: '#eab308' };
  if (strength >= 0.25) return { label: 'Weak', color: '#f97316' };
  return { label: 'Bluff', color: '#ef4444' };
}
