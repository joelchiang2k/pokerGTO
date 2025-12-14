import React from 'react';
import type { ActionType } from '../../types/poker';

interface ActionButtonsProps {
    onAction: (action: ActionType) => void;
    disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, disabled }) => {
    return (
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <button
                onClick={() => onAction('Fold')}
                disabled={disabled}
                className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 active:to-red-800 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg border border-red-500/30 hover:scale-105 active:scale-95"
            >
                <span className="relative z-10">Fold</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </button>
            <button
                onClick={() => onAction('Call')}
                disabled={disabled}
                className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg border border-blue-500/30 hover:scale-105 active:scale-95"
            >
                <span className="relative z-10">Call</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </button>
            <button
                onClick={() => onAction('Raise')}
                disabled={disabled}
                className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg border border-emerald-500/30 hover:scale-105 active:scale-95"
            >
                <span className="relative z-10">Raise</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </button>
        </div>
    );
};
