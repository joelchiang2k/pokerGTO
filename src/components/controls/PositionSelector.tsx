import React from 'react';
import { POSITIONS } from '../../types/poker';
import type { Position } from '../../types/poker';

interface PositionSelectorProps {
    selectedPosition: Position;
    onSelect: (pos: Position) => void;
}

const positionColors: Record<Position, string> = {
    'UTG': 'from-purple-600 to-purple-500',
    'HJ': 'from-indigo-600 to-indigo-500',
    'CO': 'from-blue-600 to-blue-500',
    'BTN': 'from-emerald-600 to-emerald-500',
    'SB': 'from-amber-600 to-amber-500',
    'BB': 'from-orange-600 to-orange-500',
};

export const PositionSelector: React.FC<PositionSelectorProps> = ({ selectedPosition, onSelect }) => {
    return (
        <div className="flex flex-wrap gap-1 sm:gap-1.5 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50">
            {POSITIONS.map(pos => (
                <button
                    key={pos}
                    onClick={() => onSelect(pos)}
                    className={`
                        px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200
                        ${selectedPosition === pos
                            ? `bg-gradient-to-r ${positionColors[pos]} text-white shadow-lg`
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                    `}
                >
                    {pos}
                </button>
            ))}
        </div>
    );
};
