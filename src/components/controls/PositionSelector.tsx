import React from 'react';
import { POSITIONS } from '../../types/poker';
import type { Position } from '../../types/poker';

interface PositionSelectorProps {
    selectedPosition: Position;
    onSelect: (pos: Position) => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({ selectedPosition, onSelect }) => {
    return (
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {POSITIONS.map(pos => (
                <button
                    key={pos}
                    onClick={() => onSelect(pos)}
                    className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${selectedPosition === pos
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
          `}
                >
                    {pos}
                </button>
            ))}
        </div>
    );
};
