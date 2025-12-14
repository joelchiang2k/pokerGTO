import React from 'react';
import type { ActionType, ActionFrequency } from '../../types/poker';

interface ResultModalProps {
    userAction: ActionType;
    strategy: ActionFrequency[];
    onNextHand: () => void;
    hand: string;
}

export const ResultModal: React.FC<ResultModalProps> = ({ userAction, strategy, onNextHand, hand }) => {
    // Determine if user action was "correct" (frequency > 0)
    // And find the best action
    const chosenFreq = strategy.find(a => a.action === userAction)?.frequency || 0;
    // const bestAction = strategy.reduce((prev, current) => (prev.frequency > current.frequency) ? prev : current);

    const isCorrect = chosenFreq > 0; // Loose definition of correct: "It's in the mix"
    // const isOptimal = Math.abs(chosenFreq - bestAction.frequency) < 0.01; // Is it the highest freq action?

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700 transform transition-all scale-100">
                <div className="text-center mb-6">
                    <div className={`
             mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4
             ${isCorrect ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}
          `}>
                        <span className="text-3xl">{isCorrect ? '✓' : '✗'}</span>
                    </div>

                    <h3 className="text-2xl font-bold mb-1">
                        {isCorrect ? 'Good Move!' : 'Inaccuracy'}
                    </h3>
                    <p className="text-gray-500 mb-4">Hand: <span className="font-bold text-gray-900 dark:text-gray-100">{hand}</span></p>

                    <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
                        {strategy.map(a => (
                            <div key={a.action} className="flex justify-between items-center">
                                <span className={`font-medium ${a.action === userAction ? 'underline decoration-2 underline-offset-2' : ''}`}>
                                    {a.action}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${a.action === 'Raise' ? 'bg-green-500' : a.action === 'Call' ? 'bg-blue-500' : 'bg-red-500'}`}
                                            style={{ width: `${a.frequency * 100}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right font-mono">{(a.frequency * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onNextHand}
                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                    Next Hand →
                </button>
            </div>
        </div>
    );
};
