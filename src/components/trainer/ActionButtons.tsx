import React from 'react';
import type { ActionType } from '../../types/poker';

interface ActionButtonsProps {
    onAction: (action: ActionType) => void;
    disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, disabled }) => {
    return (
        <div className="flex gap-4 justify-center mt-6">
            <button
                onClick={() => onAction('Fold')}
                disabled={disabled}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
                Fold
            </button>
            <button
                onClick={() => onAction('Call')}
                disabled={disabled}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
                Call
            </button>
            <button
                onClick={() => onAction('Raise')}
                disabled={disabled}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
                Raise
            </button>
        </div>
    );
};
