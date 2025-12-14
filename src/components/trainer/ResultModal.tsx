import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { ActionType, ActionFrequency } from '../../types/poker';
import { PlayingCard, type Suit } from '../ui/PlayingCard';
import { getSpecificCards } from '../../poker-utils';

interface ResultModalProps {
    userAction: ActionType;
    strategy: ActionFrequency[];
    onNextHand: () => void;
    hand: string;
}

export const ResultModal: React.FC<ResultModalProps> = ({ userAction, strategy, onNextHand, hand }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const resultIconRef = useRef<HTMLDivElement>(null);

    // Determine if user action was "correct" (frequency > 0)
    const chosenFreq = strategy.find(a => a.action === userAction)?.frequency || 0;
    const isCorrect = chosenFreq > 0;

    // Get the best action for comparison
    const bestAction = strategy.reduce((prev, current) =>
        (prev.frequency > current.frequency) ? prev : current
    );
    const isOptimal = userAction === bestAction.action;

    // Get card visuals
    const { rank1, suit1, rank2, suit2 } = getSpecificCards(hand);

    useEffect(() => {
        if (!modalRef.current || !contentRef.current || !resultIconRef.current) return;

        const tl = gsap.timeline();

        // Backdrop fade in
        gsap.fromTo(modalRef.current,
            { backgroundColor: 'rgba(0,0,0,0)' },
            { backgroundColor: 'rgba(0,0,0,0.5)', duration: 0.3 }
        );

        // Content slide up and scale
        tl.fromTo(contentRef.current,
            { y: 50, scale: 0.9, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );

        // Result icon pop
        tl.fromTo(resultIconRef.current,
            { scale: 0, rotation: -180 },
            { scale: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' },
            '-=0.2'
        );

        // Shake effect if incorrect
        if (!isCorrect) {
            tl.to(contentRef.current, {
                x: -10,
                duration: 0.05,
                repeat: 5,
                yoyo: true,
                ease: 'power1.inOut'
            }, '-=0.3');
        }

        return () => {
            tl.kill();
        };
    }, [isCorrect]);

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
                if (e.target === modalRef.current) onNextHand();
            }}
        >
            <div
                ref={contentRef}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700"
            >
                <div className="text-center mb-6">
                    {/* Result Icon */}
                    <div
                        ref={resultIconRef}
                        className={`
                            mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4
                            ${isCorrect
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            }
                        `}
                    >
                        <span className="text-3xl">{isCorrect ? '✓' : '✗'}</span>
                    </div>

                    {/* Result Text */}
                    <h3 className="text-2xl font-bold mb-1">
                        {isOptimal ? 'Perfect!' : isCorrect ? 'Acceptable' : 'Mistake'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {isOptimal
                            ? 'That\'s the optimal play!'
                            : isCorrect
                                ? 'In the mix, but not optimal'
                                : 'This hand should be played differently'
                        }
                    </p>

                    {/* Cards Display */}
                    <div className="flex justify-center gap-2 mb-4">
                        <PlayingCard
                            rank={rank1}
                            suit={suit1 as Suit}
                            size="md"
                            animateIn={false}
                        />
                        <PlayingCard
                            rank={rank2}
                            suit={suit2 as Suit}
                            size="md"
                            animateIn={false}
                        />
                        <span className="self-center ml-2 text-lg font-mono font-bold text-gray-400">
                            {hand}
                        </span>
                    </div>

                    {/* Strategy Breakdown */}
                    <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-3 text-sm">
                        <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">GTO Strategy</div>
                        {strategy.map(a => {
                            const isUserChoice = a.action === userAction;
                            const isBest = a.action === bestAction.action;
                            return (
                                <div key={a.action} className="flex justify-between items-center">
                                    <span className={`font-medium flex items-center gap-2 ${isUserChoice ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                        {a.action}
                                        {isUserChoice && (
                                            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                                                You
                                            </span>
                                        )}
                                        {isBest && a.frequency > 0 && (
                                            <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
                                                Best
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${a.action === 'Raise'
                                                        ? 'bg-green-500'
                                                        : a.action === 'Call'
                                                            ? 'bg-blue-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${a.frequency * 100}%` }}
                                            />
                                        </div>
                                        <span className="w-10 text-right font-mono font-bold">
                                            {(a.frequency * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={onNextHand}
                    className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Next Hand →
                </button>
            </div>
        </div>
    );
};
