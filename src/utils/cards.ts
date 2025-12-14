/**
 * Card and Deck utilities for postflop training
 */

export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

export const RANK_VALUES: Record<Rank, number> = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
};

// Create a full 52-card deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

// Shuffle deck using Fisher-Yates
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Convert card to string (e.g., { rank: 'A', suit: 's' } -> 'As')
export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

// Parse string to card (e.g., 'As' -> { rank: 'A', suit: 's' })
export function parseCard(str: string): Card {
  return {
    rank: str[0] as Rank,
    suit: str[1] as Suit
  };
}

// Check if two cards are the same
export function cardsEqual(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

// Remove specific cards from deck
export function removeCards(deck: Card[], cardsToRemove: Card[]): Card[] {
  return deck.filter(card =>
    !cardsToRemove.some(remove => cardsEqual(card, remove))
  );
}

// Deal random cards from remaining deck
export function dealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  const shuffled = shuffleDeck(deck);
  return {
    dealt: shuffled.slice(0, count),
    remaining: shuffled.slice(count)
  };
}

// Get a random flop, turn, river scenario
export function dealPostflopScenario(): {
  heroHand: [Card, Card];
  flop: [Card, Card, Card];
  turn: Card;
  river: Card;
} {
  const deck = shuffleDeck(createDeck());

  return {
    heroHand: [deck[0], deck[1]] as [Card, Card],
    flop: [deck[2], deck[3], deck[4]] as [Card, Card, Card],
    turn: deck[5],
    river: deck[6]
  };
}

// Get suit symbol for display
export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    's': '♠',
    'h': '♥',
    'd': '♦',
    'c': '♣'
  };
  return symbols[suit];
}

// Get suit color
export function getSuitColor(suit: Suit): string {
  return suit === 'h' || suit === 'd' ? '#ef4444' : '#1f2937';
}
