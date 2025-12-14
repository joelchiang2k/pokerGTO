export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export type ActionType = 'Raise' | 'Call' | 'Fold';

export interface ActionFrequency {
    action: ActionType;
    frequency: number; // 0.0 to 1.0
}

export interface HandStrategy {
    hand: string; // e.g., "AA", "AKs"
    actions: ActionFrequency[];
}

export interface RangeData {
    position: Position;
    hands: Record<string, ActionFrequency[]>;
}

export const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
