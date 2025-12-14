import type { ActionFrequency, RangeData, Position } from './types/poker';

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

// Mock Data Generator
export function generateMockRange(position: Position): RangeData {
    const hands: Record<string, ActionFrequency[]> = {};

    ALL_HANDS.forEach(hand => {
        // Simple logic for mock data:
        // Pairs & High Suited = Raise
        // Low offsuit = Fold
        // Middle = Mix
        const isPair = !hand.includes('s') && !hand.includes('o');
        const rank1Idx = RANKS.indexOf(hand[0]);

        if (isPair && rank1Idx < 5) { // AA-99
            hands[hand] = [{ action: 'Raise', frequency: 1.0 }];
        } else if (hand.includes('s') && rank1Idx < 4) { // AKs-JTs
            hands[hand] = [{ action: 'Raise', frequency: 1.0 }];
        } else {
            hands[hand] = [{ action: 'Fold', frequency: 1.0 }];
        }
    });

    return {
        position,
        hands
    };
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
