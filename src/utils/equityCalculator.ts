/**
 * Equity Calculator - Monte Carlo simulation for hand equity
 */

import type { Card } from './cards';
import { createDeck, removeCards, shuffleDeck } from './cards';
import { evaluateHand } from './handEvaluator';

export interface EquityResult {
  equity: number;           // 0-1 win probability
  wins: number;
  ties: number;
  losses: number;
  samples: number;
  confidence: number;       // Statistical confidence
}

// Compare two hands, return 1 if hand1 wins, -1 if hand2 wins, 0 if tie
function compareHands(
  hand1: Card[],
  hand2: Card[],
  board: Card[]
): number {
  const eval1 = evaluateHand(hand1, board);
  const eval2 = evaluateHand(hand2, board);

  // Compare by rank first
  if (eval1.rankValue > eval2.rankValue) return 1;
  if (eval1.rankValue < eval2.rankValue) return -1;

  // Same rank - compare by strength (includes kicker comparison)
  if (eval1.strength > eval2.strength) return 1;
  if (eval1.strength < eval2.strength) return -1;

  return 0; // Tie
}

/**
 * Calculate equity of hero's hand against a random opponent hand
 * Uses Monte Carlo simulation
 */
export function calculateEquityVsRandom(
  heroHand: Card[],
  board: Card[],
  iterations: number = 1000
): EquityResult {
  const knownCards = [...heroHand, ...board];
  const remainingDeck = removeCards(createDeck(), knownCards);
  const cardsNeeded = 5 - board.length; // Cards needed to complete the board

  let wins = 0;
  let ties = 0;
  let losses = 0;

  for (let i = 0; i < iterations; i++) {
    const shuffled = shuffleDeck(remainingDeck);

    // Deal villain's hand (2 cards)
    const villainHand = shuffled.slice(0, 2);

    // Complete the board if needed
    const runout = shuffled.slice(2, 2 + cardsNeeded);
    const fullBoard = [...board, ...runout];

    // Compare hands
    const result = compareHands(heroHand, villainHand, fullBoard);

    if (result > 0) wins++;
    else if (result < 0) losses++;
    else ties++;
  }

  const equity = (wins + ties * 0.5) / iterations;

  // Calculate confidence interval (approximation)
  const stdError = Math.sqrt((equity * (1 - equity)) / iterations);
  const confidence = 1 - (2 * stdError); // Rough confidence measure

  return {
    equity,
    wins,
    ties,
    losses,
    samples: iterations,
    confidence: Math.max(0, Math.min(1, confidence))
  };
}

/**
 * Calculate equity against a specific range of hands
 * Range is represented as array of hand strings like ['AA', 'KK', 'AKs']
 */
export function calculateEquityVsRange(
  heroHand: Card[],
  board: Card[],
  villainRange: string[],
  iterations: number = 500
): EquityResult {
  if (villainRange.length === 0) {
    return calculateEquityVsRandom(heroHand, board, iterations);
  }

  const knownCards = [...heroHand, ...board];
  const remainingDeck = removeCards(createDeck(), knownCards);
  const cardsNeeded = 5 - board.length;

  let wins = 0;
  let ties = 0;
  let losses = 0;
  let validSamples = 0;

  // Expand range to specific combos
  const expandedRange = expandRange(villainRange, knownCards);

  if (expandedRange.length === 0) {
    return calculateEquityVsRandom(heroHand, board, iterations);
  }

  for (let i = 0; i < iterations; i++) {
    // Pick random hand from villain's range
    const villainHand = expandedRange[Math.floor(Math.random() * expandedRange.length)];

    // Check if villain's hand is blocked
    if (villainHand.some(vc => knownCards.some(kc =>
      kc.rank === vc.rank && kc.suit === vc.suit
    ))) {
      continue;
    }

    // Get remaining deck after villain's hand
    const deckAfterVillain = removeCards(remainingDeck, villainHand);
    const shuffled = shuffleDeck(deckAfterVillain);

    // Complete the board if needed
    const runout = shuffled.slice(0, cardsNeeded);
    const fullBoard = [...board, ...runout];

    // Compare hands
    const result = compareHands(heroHand, villainHand, fullBoard);

    if (result > 0) wins++;
    else if (result < 0) losses++;
    else ties++;

    validSamples++;
  }

  if (validSamples === 0) {
    return calculateEquityVsRandom(heroHand, board, iterations);
  }

  const equity = (wins + ties * 0.5) / validSamples;
  const stdError = Math.sqrt((equity * (1 - equity)) / validSamples);
  const confidence = 1 - (2 * stdError);

  return {
    equity,
    wins,
    ties,
    losses,
    samples: validSamples,
    confidence: Math.max(0, Math.min(1, confidence))
  };
}

/**
 * Expand hand notation to specific card combos
 * e.g., 'AKs' -> [Ah Kh], [As Ks], [Ad Kd], [Ac Kc]
 */
function expandRange(range: string[], blockers: Card[]): Card[][] {
  const combos: Card[][] = [];
  const suits: Array<'s' | 'h' | 'd' | 'c'> = ['s', 'h', 'd', 'c'];

  for (const hand of range) {
    if (hand.length === 2) {
      // Pocket pair (e.g., 'AA')
      const rank = hand[0] as Card['rank'];
      for (let i = 0; i < suits.length; i++) {
        for (let j = i + 1; j < suits.length; j++) {
          const combo: Card[] = [
            { rank, suit: suits[i] },
            { rank, suit: suits[j] }
          ];
          if (!isBlocked(combo, blockers)) {
            combos.push(combo);
          }
        }
      }
    } else if (hand.length === 3) {
      const rank1 = hand[0] as Card['rank'];
      const rank2 = hand[1] as Card['rank'];
      const suited = hand[2] === 's';

      if (suited) {
        // Suited hands
        for (const suit of suits) {
          const combo: Card[] = [
            { rank: rank1, suit },
            { rank: rank2, suit }
          ];
          if (!isBlocked(combo, blockers)) {
            combos.push(combo);
          }
        }
      } else {
        // Offsuit hands
        for (const suit1 of suits) {
          for (const suit2 of suits) {
            if (suit1 !== suit2) {
              const combo: Card[] = [
                { rank: rank1, suit: suit1 },
                { rank: rank2, suit: suit2 }
              ];
              if (!isBlocked(combo, blockers)) {
                combos.push(combo);
              }
            }
          }
        }
      }
    }
  }

  return combos;
}

function isBlocked(combo: Card[], blockers: Card[]): boolean {
  return combo.some(card =>
    blockers.some(blocker =>
      blocker.rank === card.rank && blocker.suit === card.suit
    )
  );
}

/**
 * Quick equity estimate based on hand strength and board
 * Faster than Monte Carlo, less accurate
 */
export function quickEquityEstimate(
  heroHand: Card[],
  board: Card[]
): number {
  const evaluation = evaluateHand(heroHand, board);

  // Base equity from hand strength
  let equity = evaluation.strength;

  // Adjust based on board development
  if (board.length < 5) {
    // More uncertainty with cards to come
    // Pull equity towards 50%
    const uncertainty = (5 - board.length) * 0.08;
    equity = equity * (1 - uncertainty) + 0.5 * uncertainty;
  }

  return Math.max(0, Math.min(1, equity));
}

/**
 * Calculate pot odds
 */
export function calculatePotOdds(
  potSize: number,
  betToCall: number
): number {
  if (betToCall <= 0) return 1;
  return betToCall / (potSize + betToCall);
}

/**
 * Determine if a call is profitable
 */
export function isCallProfitable(
  equity: number,
  potSize: number,
  betToCall: number
): { profitable: boolean; ev: number } {
  const potOdds = calculatePotOdds(potSize, betToCall);
  const profitable = equity > potOdds;

  // Calculate expected value
  const winAmount = potSize + betToCall;
  const ev = (equity * winAmount) - ((1 - equity) * betToCall);

  return { profitable, ev };
}
