import React from 'react';
import { ALL_HANDS } from '../../poker-utils';
import { HandCell } from './HandCell';
import type { RangeData } from '../../types/poker';

interface HandMatrixProps {
    rangeData?: RangeData;
    selectedHand: string | null;
    onHandSelect: (hand: string) => void;
}

export const HandMatrix: React.FC<HandMatrixProps> = ({ rangeData, selectedHand, onHandSelect }) => {
    return (
        <div
            className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 shadow-2xl"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(13, 1fr)',
                gap: 2,
                width: 'min(100%, 520px)',
                aspectRatio: '1 / 1',
            }}
        >
            {ALL_HANDS.map(hand => {
                const strategy = rangeData?.hands[hand] ? { hand, actions: rangeData.hands[hand] } : undefined;
                return (
                    <HandCell
                        key={hand}
                        hand={hand}
                        strategy={strategy}
                        onSelect={onHandSelect}
                        isSelected={selectedHand === hand}
                    />
                );
            })}
        </div>
    );
};
