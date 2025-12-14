import type { RangeData, Position } from './types/poker';
import { getGTORange } from './data/gtoRanges';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function generateAllHands(): string[] {
    const hands: string[] = [];
    for (let i = 0; i < RANKS.length; i++) {
        for (let j = 0; j < RANKS.length; j++) {
            if (i < j) {
                hands.push(`${RANKS[i]}${RANKS[j]}s`); // Suited
            } else if (i > j) {
                hands.push(`${RANKS[j]}${RANKS[i]}o`); // Offsuit
            } else {
                hands.push(`${RANKS[i]}${RANKS[j]}`); // Pairs
            }
        }
    }
    return hands;
}

export const ALL_HANDS = generateAllHands();

/**
 * Get the GTO RFI range for a specific position
 * Uses real solver-derived data for 6-max 100bb cash games
 */
export function generateMockRange(position: Position): RangeData {
    return getGTORange(position);
}

// Helper to pick a random hand that has some action frequency (not 100% fold if we want to test playing hands, 
// but for GTO trainer we might wants to test Folds too? Usually trainers filter out obvious 72o folds).
// Let's pick hands that have at least some VPIP (Raise or Call > 0)
export function getRandomHandInRange(range: RangeData): string {
    const playableHands = Object.entries(range.hands).filter(([_, actions]) => {
        // Check if any action is not Fold and has freq > 0
        const hasAction = actions.some(a => a.action !== 'Fold' && a.frequency > 0);
        return hasAction;
    }).map(([hand]) => hand);

    if (playableHands.length === 0) return 'AA'; // Fallback
    const idx = Math.floor(Math.random() * playableHands.length);
    return playableHands[idx];
}

const SUITS = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs

function getRandomSuit(): string {
    return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function getRandomDifferentSuit(exclude: string): string {
    const available = SUITS.filter(s => s !== exclude);
    return available[Math.floor(Math.random() * available.length)];
}

export function getSpecificCards(handGroup: string): { rank1: string; suit1: string; rank2: string; suit2: string } {
    const rank1 = handGroup[0];
    const rank2 = handGroup[1];
    const type = handGroup.length > 2 ? handGroup[2] : ''; // 's' or 'o' or empty (pair)

    let suit1: string;
    let suit2: string;

    if (type === 's') {
        // Suited: same random suit
        suit1 = getRandomSuit();
        suit2 = suit1;
    } else if (type === 'o') {
        // Offsuit: different random suits
        suit1 = getRandomSuit();
        suit2 = getRandomDifferentSuit(suit1);
    } else {
        // Pocket Pair: different random suits
        suit1 = getRandomSuit();
        suit2 = getRandomDifferentSuit(suit1);
    }

    return { rank1, suit1, rank2, suit2 };
}
