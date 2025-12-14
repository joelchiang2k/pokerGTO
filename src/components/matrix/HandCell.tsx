import React from 'react';
import type { HandStrategy } from '../../types/poker';

interface HandCellProps {
    hand: string;
    strategy?: HandStrategy;
    onSelect: (hand: string) => void;
    isSelected?: boolean;
}

export const HandCell: React.FC<HandCellProps> = ({ hand, strategy, onSelect, isSelected }) => {
    // Compute style based on strategy
    const customStyle = React.useMemo(() => {
        if (!strategy) return {};
        const raiseFreq = strategy.actions.find(a => a.action === 'Raise')?.frequency || 0;
        const callFreq = strategy.actions.find(a => a.action === 'Call')?.frequency || 0;
        const foldFreq = strategy.actions.find(a => a.action === 'Fold')?.frequency || 0;

        // Simple Green -> Blue -> Red stacking
        // background: linear-gradient(to right, green 0% X%, blue X% Y%, red Y% 100%)
        const raisePct = raiseFreq * 100;
        const callPct = callFreq * 100;

        // If mostly fold, keep it dark/neutral
        if (foldFreq > 0.99) return { backgroundColor: '#374151' }; // gray-700

        return {
            background: `linear-gradient(to right, 
        #22c55e 0% ${raisePct}%, 
        #3b82f6 ${raisePct}% ${raisePct + callPct}%, 
        #ef4444 ${raisePct + callPct}% 100%)`
        };
    }, [strategy]);

    return (
        <div
            onClick={() => onSelect(hand)}
            style={customStyle}
            className={`
        w-full aspect-square flex items-center justify-center text-[10px] sm:text-xs font-bold cursor-pointer select-none border border-gray-900/10 dark:border-gray-100/10
        ${!strategy ? 'bg-white dark:bg-gray-800 text-gray-400' : 'text-white'}
        ${isSelected ? 'ring-2 ring-yellow-400 z-10' : ''}
      `}
        >
            {hand}
        </div>
    );
};
