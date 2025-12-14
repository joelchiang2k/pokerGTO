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
        <div className="grid grid-cols-13 gap-0.5 bg-gray-200 dark:bg-gray-900 p-1 rounded-lg border border-gray-300 dark:border-gray-700 max-w-lg mx-auto shadow-xl">
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
