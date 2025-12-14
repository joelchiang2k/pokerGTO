/**
 * Board Texture Analyzer - Analyzes flop/turn/river texture
 */

import type { Card, Rank, Suit } from './cards';
import { RANK_VALUES } from './cards';

export interface BoardTexture {
  // Overall texture score (0 = very dry, 1 = very wet)
  wetness: number;

  // Specific characteristics
  isPaired: boolean;
  isTrips: boolean;
  isMonotone: boolean;      // 3 of same suit
  isTwoTone: boolean;       // 2 of same suit
  isRainbow: boolean;       // all different suits

  // Connectivity
  hasOpenEndedDraw: boolean;
  hasGutshot: boolean;
  hasStraightPossible: boolean;
  hasFlushDraw: boolean;
  hasFlushPossible: boolean;

  // High card texture
  highCard: Rank;
  hasAce: boolean;
  hasBroadway: boolean;     // T+ cards
  broadwayCount: number;

  // Descriptive labels
  textureLabel: string;
  dangerLevel: 'safe' | 'moderate' | 'dangerous';
}

const BROADWAY_RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T'];

// Check if ranks are connected (within n gaps)
function areConnected(ranks: number[], maxGap: number): boolean {
  const sorted = [...ranks].sort((a, b) => b - a);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] - sorted[i + 1] <= maxGap) {
      return true;
    }
  }
  // Check wheel connectivity (A-2-3-4-5)
  if (sorted.includes(14) && sorted.some(r => r <= 5)) {
    return true;
  }
  return false;
}

// Count how many straight draws are possible
function countStraightDraws(rankValues: number[]): { openEnded: boolean; gutshot: boolean; straight: boolean } {
  const uniqueRanks = [...new Set(rankValues)].sort((a, b) => b - a);

  let openEnded = false;
  let gutshot = false;
  let straight = false;

  // Check all possible 5-card windows
  for (let high = 14; high >= 5; high--) {
    const window = [high, high - 1, high - 2, high - 3, high - 4];
    const matchCount = window.filter(r => uniqueRanks.includes(r)).length;

    if (matchCount >= 5) straight = true;
    else if (matchCount >= 4) openEnded = true;
    else if (matchCount >= 3) gutshot = true;
  }

  // Check wheel (A-2-3-4-5)
  const wheelRanks = [14, 2, 3, 4, 5];
  const wheelMatch = wheelRanks.filter(r => uniqueRanks.includes(r)).length;
  if (wheelMatch >= 5) straight = true;
  else if (wheelMatch >= 4) openEnded = true;
  else if (wheelMatch >= 3) gutshot = true;

  return { openEnded, gutshot, straight };
}

// Count suit occurrences
function countSuits(cards: Card[]): Map<Suit, number> {
  const counts = new Map<Suit, number>();
  for (const card of cards) {
    counts.set(card.suit, (counts.get(card.suit) || 0) + 1);
  }
  return counts;
}

// Count rank occurrences
function countRanks(cards: Card[]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }
  return counts;
}

export function analyzeBoard(board: Card[]): BoardTexture {
  if (board.length < 3) {
    return getEmptyTexture();
  }

  const rankValues = board.map(c => RANK_VALUES[c.rank]);
  const suitCounts = countSuits(board);
  const rankCounts = countRanks(board);

  // Pairing
  const maxRankCount = Math.max(...rankCounts.values());
  const isPaired = maxRankCount >= 2;
  const isTrips = maxRankCount >= 3;

  // Suits
  const maxSuitCount = Math.max(...suitCounts.values());
  const isMonotone = maxSuitCount >= 3 && board.length === 3;
  const isTwoTone = maxSuitCount === 2 && board.length === 3;
  const isRainbow = maxSuitCount === 1 || (board.length === 3 && suitCounts.size === 3);
  const hasFlushDraw = maxSuitCount >= 2;
  const hasFlushPossible = maxSuitCount >= 3;

  // Connectivity
  const draws = countStraightDraws(rankValues);
  const connected = areConnected(rankValues, 2);

  // High cards
  const highCard = board.reduce((high, card) =>
    RANK_VALUES[card.rank] > RANK_VALUES[high.rank] ? card : high
  ).rank;
  const hasAce = board.some(c => c.rank === 'A');
  const broadwayCards = board.filter(c => BROADWAY_RANKS.includes(c.rank));
  const hasBroadway = broadwayCards.length > 0;
  const broadwayCount = broadwayCards.length;

  // Calculate wetness score (0-1)
  let wetness = 0;

  // Flush draws add wetness
  if (isMonotone) wetness += 0.35;
  else if (isTwoTone) wetness += 0.15;

  // Straight draws add wetness
  if (draws.straight) wetness += 0.25;
  else if (draws.openEnded) wetness += 0.2;
  else if (draws.gutshot) wetness += 0.1;

  // Connected boards are wetter
  if (connected) wetness += 0.1;

  // Paired boards are drier
  if (isPaired) wetness -= 0.15;
  if (isTrips) wetness -= 0.25;

  // High cards make board wetter (more likely to hit ranges)
  wetness += (broadwayCount / board.length) * 0.15;

  wetness = Math.max(0, Math.min(1, wetness));

  // Generate texture label
  const textureLabel = generateTextureLabel(
    isPaired, isTrips, isMonotone, isTwoTone,
    draws, connected, highCard, broadwayCount
  );

  // Danger level
  let dangerLevel: 'safe' | 'moderate' | 'dangerous' = 'safe';
  if (wetness >= 0.5 || isMonotone || draws.straight) {
    dangerLevel = 'dangerous';
  } else if (wetness >= 0.25 || isTwoTone || draws.openEnded) {
    dangerLevel = 'moderate';
  }

  return {
    wetness,
    isPaired,
    isTrips,
    isMonotone,
    isTwoTone,
    isRainbow,
    hasOpenEndedDraw: draws.openEnded,
    hasGutshot: draws.gutshot,
    hasStraightPossible: draws.straight,
    hasFlushDraw,
    hasFlushPossible,
    highCard,
    hasAce,
    hasBroadway,
    broadwayCount,
    textureLabel,
    dangerLevel
  };
}

function generateTextureLabel(
  isPaired: boolean,
  isTrips: boolean,
  isMonotone: boolean,
  isTwoTone: boolean,
  draws: { openEnded: boolean; gutshot: boolean; straight: boolean },
  connected: boolean,
  highCard: Rank,
  broadwayCount: number
): string {
  const parts: string[] = [];

  // High card description
  if (broadwayCount >= 2) {
    parts.push('Broadway');
  } else if (RANK_VALUES[highCard] >= 10) {
    parts.push(`${highCard}-high`);
  } else {
    parts.push('Low');
  }

  // Suit description
  if (isMonotone) parts.push('Monotone');
  else if (isTwoTone) parts.push('Two-tone');
  else parts.push('Rainbow');

  // Pairing
  if (isTrips) parts.push('Trips');
  else if (isPaired) parts.push('Paired');

  // Connectivity
  if (draws.straight) parts.push('Straight possible');
  else if (connected) parts.push('Connected');
  else parts.push('Disconnected');

  return parts.join(', ');
}

function getEmptyTexture(): BoardTexture {
  return {
    wetness: 0,
    isPaired: false,
    isTrips: false,
    isMonotone: false,
    isTwoTone: false,
    isRainbow: true,
    hasOpenEndedDraw: false,
    hasGutshot: false,
    hasStraightPossible: false,
    hasFlushDraw: false,
    hasFlushPossible: false,
    highCard: 'A',
    hasAce: false,
    hasBroadway: false,
    broadwayCount: 0,
    textureLabel: 'No board',
    dangerLevel: 'safe'
  };
}

// Helper to build board description for reasoning
function getBoardDescription(texture: BoardTexture): string {
  const parts: string[] = [];

  if (texture.isMonotone) parts.push('monotone (flush possible)');
  else if (texture.isTwoTone) parts.push('two-tone (flush draw possible)');
  else parts.push('rainbow');

  if (texture.hasStraightPossible) parts.push('with a straight on board');
  else if (texture.hasOpenEndedDraw) parts.push('with straight draw possibilities');
  else if (texture.hasGutshot) parts.push('with gutshot possibilities');

  if (texture.isPaired) parts.push('paired');

  return parts.join(', ');
}

// Get action recommendation based on hand strength and board texture
export function getPostflopRecommendation(
  handStrength: number,
  boardTexture: BoardTexture,
  position: 'IP' | 'OOP',
  street: 'flop' | 'turn' | 'river',
  facingBet: boolean = false
): {
  action: 'bet' | 'check' | 'raise' | 'call' | 'fold';
  sizing?: 'small' | 'medium' | 'large';
  confidence: number;
  reasoning: string;
} {
  const { wetness, dangerLevel, isPaired, hasFlushPossible, hasStraightPossible, isMonotone, isTwoTone } = boardTexture;
  const boardDesc = getBoardDescription(boardTexture);
  const positionDesc = position === 'IP' ? 'in position (acting last)' : 'out of position (acting first)';
  const streetName = street.charAt(0).toUpperCase() + street.slice(1);

  // When facing a bet, actions are: fold, call, raise
  if (facingBet) {
    // Monster hands - raise for value
    if (handStrength >= 0.85) {
      return {
        action: 'raise',
        sizing: 'large',
        confidence: 0.9,
        reasoning: `RAISE FOR VALUE: You have a monster hand (top ~15% of possible holdings). ${streetName} is ${boardDesc}. When villain bets into you with a hand this strong, you want to build the pot as large as possible. Raising extracts maximum value from their betting range, which includes both value hands and bluffs. A large raise size is optimal because your hand can withstand a 3-bet and you want to get stacks in.`
      };
    }

    // Strong hands - call or raise depending on board
    if (handStrength >= 0.65) {
      if (dangerLevel === 'safe') {
        return {
          action: 'raise',
          sizing: 'medium',
          confidence: 0.75,
          reasoning: `RAISE FOR VALUE: You have a strong hand on a relatively safe board (${boardDesc}). Since the board is dry with few draws, villain's betting range is likely polarized between strong hands and bluffs. By raising, you deny equity to any draws they might have and extract value from their medium-strength hands that will call. A medium-sized raise balances value extraction with keeping their calling range wide.`
        };
      }
      return {
        action: 'call',
        confidence: 0.8,
        reasoning: `CALL (SLOW PLAY): You have a strong hand, but the board is ${boardDesc} - this is a dangerous texture. Raising here would fold out villain's bluffs and weaker hands while only getting action from hands that beat you. By just calling, you: (1) keep their entire betting range in the pot, (2) disguise your hand strength for later streets, and (3) allow them to continue bluffing. This is known as "keeping their bluffs in."${position === 'IP' ? ' Being in position lets you control the pot size on future streets.' : ''}`
      };
    }

    // Medium hands - usually call
    if (handStrength >= 0.45) {
      if (street === 'river' && dangerLevel === 'dangerous') {
        return {
          action: 'fold',
          confidence: 0.55,
          reasoning: `FOLD (TOUGH SPOT): You have a medium-strength hand on the river with a ${boardDesc} texture. This is a difficult spot. On dangerous boards at the river, villain's betting range is heavily weighted toward strong hands - they have little reason to bluff when draws have missed/completed. Your hand likely beats some bluffs but loses to most value hands. The pot odds don't justify calling with a hand that's rarely best. Sometimes folding medium hands to river aggression is correct.`
        };
      }
      return {
        action: 'call',
        confidence: 0.65,
        reasoning: `CALL (BLUFF CATCHER): You have a medium-strength hand - strong enough to beat bluffs but vulnerable to value hands. The board is ${boardDesc}. Calling is correct because: (1) your hand has showdown value and beats many of villain's bluffs, (2) folding would be too exploitable with decent holdings, (3) raising would only get called by better hands. ${street !== 'river' ? 'You can re-evaluate on later streets based on new cards and villain actions.' : 'At showdown, your hand will be good often enough to justify the call.'}`
      };
    }

    // Weak hands - mostly fold, sometimes call with draws
    if (handStrength >= 0.25) {
      if (hasFlushPossible || hasStraightPossible) {
        return {
          action: 'call',
          confidence: 0.5,
          reasoning: `CALL (DRAWING HAND): Your made hand is weak, but the board is ${boardDesc} - you likely have a draw with good implied odds. Even though you're behind villain's betting range right now, if you hit your draw (flush or straight), you'll win a big pot. The key concept is "implied odds" - the additional money you'll win on future streets when you complete your hand. ${street === 'river' ? 'However, with no more cards to come, this call is marginal.' : 'With cards still to come, calling to realize your equity is profitable.'}`
        };
      }
      if (street === 'river') {
        return {
          action: 'fold',
          confidence: 0.7,
          reasoning: `FOLD (NO EQUITY): You have a weak hand on the river with the board ${boardDesc}. On the river, there are no more cards to improve your hand. Villain's betting range on the river is typically strong - they're either value betting hands that beat you or bluffing. Your hand doesn't beat enough of their value range to justify calling. Discipline to fold marginal hands facing aggression is crucial for long-term profitability.`
        };
      }
      return {
        action: 'fold',
        confidence: 0.6,
        reasoning: `FOLD (CUT YOUR LOSSES): You have a weak hand facing a bet on the ${street}. The board is ${boardDesc}. Your hand has little chance of improving to beat villain's range, and calling just to "see what happens" leaks money over time. Folding weak hands facing aggression allows you to preserve chips for better spots. Remember: folding is a neutral EV decision - you don't lose more than you've already invested.`
      };
    }

    // Air - fold unless we have draws
    if (hasFlushPossible || hasStraightPossible) {
      return {
        action: 'call',
        confidence: 0.45,
        reasoning: `CALL (SPECULATIVE DRAW): You don't have a made hand, but the board is ${boardDesc} suggesting you might have a draw. If you have 8+ outs to a flush or straight, your "pot odds" (cost to call vs. potential winnings) may justify continuing. The implied odds are even better - if you hit, you'll likely win villain's remaining stack. ${street === 'river' ? 'Warning: on the river, draws have no value unless already made.' : 'Calculate your outs and compare to pot odds before calling.'}`
      };
    }

    return {
      action: 'fold',
      confidence: 0.75,
      reasoning: `FOLD (NO HAND, NO DRAW): You have no made hand and no meaningful draw on a ${boardDesc} board. Facing villain's bet, you have almost no equity in this pot. Calling here would be "spewing" chips - putting money in with virtually no chance to win. Even if villain is bluffing, you can't beat a bluff. Save your chips for situations where you have actual equity or fold equity.`
    };
  }

  // Not facing a bet - actions are: check, bet

  // Monster hands (full house+, strong flushes, etc.)
  if (handStrength >= 0.85) {
    const sizingChoice = wetness > 0.4 ? 'large' : 'medium';
    return {
      action: 'bet',
      sizing: sizingChoice,
      confidence: 0.9,
      reasoning: `BET FOR VALUE: You have a monster hand (top ~15% of holdings) on a ${boardDesc} board. With hands this strong, your primary goal is to build the pot and extract maximum value. ${wetness > 0.4 ? 'The board is wet with many draws possible - betting large denies equity to draws and gets value from second-best hands that will call.' : 'The board is relatively dry - a medium bet size is optimal to keep villain\'s calling range wide while still building value.'} ${position === 'OOP' ? 'Betting out of position also denies villain a free card and puts the decision back on them.' : 'Being in position, you could check to trap, but betting is more reliable for value extraction.'}`
    };
  }

  // Strong hands (trips, straights, flushes, two pair)
  if (handStrength >= 0.65) {
    if (dangerLevel === 'dangerous' && street !== 'river') {
      return {
        action: 'bet',
        sizing: 'large',
        confidence: 0.8,
        reasoning: `BET LARGE (PROTECTION + VALUE): You have a strong hand, but the board is ${boardDesc} - a dangerous texture with many draws. Betting large serves two purposes: (1) PROTECTION - you charge draws the maximum price to continue, making their calls unprofitable, and (2) VALUE - you still get called by worse hands like top pair or second pair. ${street === 'flop' ? 'With two streets left, denying free cards is crucial.' : 'On the turn, one card remaining means draws will either hit or miss - charge them now.'}`
      };
    }
    return {
      action: 'bet',
      sizing: 'medium',
      confidence: 0.85,
      reasoning: `BET FOR VALUE: You have a strong hand on a ${boardDesc} board. A medium-sized bet is optimal because: (1) it extracts value from worse hands like top pair/weak kicker or middle pair, (2) the board is safe enough that you don't need to overbet for protection, (3) a medium size keeps villain's calling range wider, maximizing your EV. You're ${positionDesc}, ${position === 'IP' ? 'so you can comfortably call if villain check-raises, or bet again if they call.' : 'so betting establishes initiative and prevents villain from realizing their equity for free.'}`
      };
  }

  // Medium hands (overpairs, top pair good kicker)
  if (handStrength >= 0.45) {
    if (dangerLevel === 'dangerous') {
      if (position === 'IP') {
        return {
          action: 'check',
          confidence: 0.6,
          reasoning: `CHECK (POT CONTROL): You have a medium-strength hand on a ${boardDesc} board - a dangerous texture. Being ${positionDesc} is a significant advantage here. By checking, you: (1) control the pot size with a hand that's not strong enough to stack off, (2) give villain a chance to bluff on later streets, (3) realize your equity for free when behind, and (4) avoid getting check-raised off your equity. If villain bets the turn, you can call and re-evaluate. This is called "pot control" - keeping the pot manageable with medium-strength hands.`
        };
      }
      return {
        action: 'bet',
        sizing: 'small',
        confidence: 0.55,
        reasoning: `BET SMALL (PROBE/PROTECTION): You have a medium hand out of position on a ${boardDesc} board. This is a difficult spot. A small bet serves multiple purposes: (1) it charges draws a small price (some protection), (2) it gathers information - if villain raises, you know you're likely behind, (3) it prevents villain from taking a free card when you'd rather they fold. The small sizing limits your losses when villain has you beat while still extracting thin value from worse hands.`
      };
    }
    return {
      action: 'bet',
      sizing: isPaired ? 'small' : 'medium',
      confidence: 0.7,
      reasoning: `BET FOR THIN VALUE: You have a medium-strength hand on a ${boardDesc} board - relatively safe. ${isPaired ? 'The board is paired, which polarizes ranges and makes your hand more vulnerable to full houses - a small bet extracts value while minimizing losses.' : 'A medium bet size targets worse hands like second pair, weak top pair, or ace-high that will call.'} You're betting for "thin value" - getting calls from hands slightly worse than yours. This is profitable because your hand is good more often than not, ${position === 'IP' ? 'and being in position lets you control the action if villain raises.' : 'despite being out of position.'}`
    };
  }

  // Weak hands (weak pairs, ace high)
  if (handStrength >= 0.25) {
    if (position === 'IP') {
      return {
        action: 'check',
        confidence: 0.7,
        reasoning: `CHECK (SHOWDOWN VALUE): You have a weak hand but with some showdown value (likely a small pair or ace-high). Being ${positionDesc} is crucial here - you get to see villain's action first on future streets. By checking, you: (1) get to showdown cheaply when your hand is good, (2) avoid building a pot you can't win, (3) give villain the chance to bluff at you with worse hands, and (4) control the pot size. If villain bets, you can make a decision based on sizing and reads. Don't turn a hand with showdown value into a bluff.`
      };
    }
    if (wetness < 0.3 && !hasFlushPossible && !hasStraightPossible) {
      return {
        action: 'bet',
        sizing: 'small',
        confidence: 0.5,
        reasoning: `BET SMALL (PROBE): You have a weak hand out of position on a dry ${boardDesc} board. A small "probe bet" can be effective here because: (1) dry boards are hard for villain to connect with, (2) many hands in their range missed entirely, (3) a small bet may fold out ace-high or other hands with decent equity. This isn't betting for value - it's betting to deny equity and potentially take down the pot. If villain raises, you can safely fold.`
      };
    }
    return {
      action: 'check',
      confidence: 0.65,
      reasoning: `CHECK (GIVE UP): You have a weak hand out of position on a ${boardDesc} board - a coordinated texture. Betting here would be a mistake because: (1) villain likely has many hands that connect with this board, (2) your hand can't call a raise, (3) you're not folding out better hands. By checking, you can fold to a bet or occasionally get a free showdown. Sometimes the best play is to simply give up and wait for a better spot.`
    };
  }

  // Air / bluff candidates
  if (position === 'OOP' && street === 'flop' && wetness > 0.4) {
    return {
      action: 'check',
      confidence: 0.75,
      reasoning: `CHECK (NO BLUFFING OPPORTUNITY): You have no made hand and no draw, playing ${positionDesc} on a ${boardDesc} board. This is not a good bluffing spot because: (1) wet boards connect with many hands in villain's range, (2) being out of position means you can't follow through credibly on later streets, (3) villain is likely to call or raise with their many connects. Check and give up - bluffing should be done selectively with hands that have backup equity or on boards that favor your range.`
    };
  }

  // Semi-bluff opportunities
  if (hasFlushPossible || hasStraightPossible) {
    return {
      action: 'bet',
      sizing: 'medium',
      confidence: 0.4,
      reasoning: `BET (SEMI-BLUFF): You don't have a made hand, but the ${boardDesc} board gives you a draw. This is a "semi-bluff" - a bet with a hand that's not best right now but has outs to improve. Semi-bluffs are powerful because you can win two ways: (1) villain folds immediately, or (2) you hit your draw and win at showdown. A medium sizing applies pressure while keeping your bluffing range balanced. ${street === 'flop' ? 'On the flop, you have two streets to complete your draw.' : street === 'turn' ? 'On the turn, this is your last chance to realize fold equity before the river.' : 'On the river, your draw missed - this would be a pure bluff, not a semi-bluff.'}`
    };
  }

  return {
    action: 'check',
    confidence: 0.6,
    reasoning: `CHECK (NOTHING TO BET): You have no made hand and no meaningful draws on a ${boardDesc} board. Betting here would be a pure bluff with no backup equity - if called, you have virtually no chance to improve. Check and give up. In poker, most hands miss most flops. The key is recognizing when you have nothing and avoiding the temptation to bluff in bad spots. Wait for a hand with either value or semi-bluff potential.`
  };
}
