import { useState, useMemo, useEffect } from 'react';
import { ActionButtons } from './components/trainer/ActionButtons';
import { ResultModal } from './components/trainer/ResultModal';
import { HandMatrix } from './components/matrix/HandMatrix';
import { PositionSelector } from './components/controls/PositionSelector';
import { PlayingCard, type Suit } from './components/ui/PlayingCard';
import { PostflopTrainer } from './components/postflop/PostflopTrainer';
import { generateMockRange, getRandomHandInRange, getSpecificCards } from './poker-utils';
import type { Position, ActionType } from './types/poker';

function App() {
  const [selectedPosition, setSelectedPosition] = useState<Position>('BTN');
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'trainer' | 'postflop'>('trainer');

  const currentRange = useMemo(() => {
    return generateMockRange(selectedPosition);
  }, [selectedPosition]);

  // Trainer State
  const [trainerHand, setTrainerHand] = useState<string | null>(null);
  const [trainerCards, setTrainerCards] = useState<{ rank1: string; suit1: string; rank2: string; suit2: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastAction, setLastAction] = useState<ActionType | null>(null);

  const nextHand = () => {
    const hand = getRandomHandInRange(currentRange);
    const cards = getSpecificCards(hand);
    setTrainerHand(hand);
    setTrainerCards(cards);
    setShowResult(false);
    setLastAction(null);
  };

  useEffect(() => {
    if (mode === 'trainer') {
      nextHand();
    }
  }, [mode, selectedPosition]);

  const handleTrainerAction = (action: ActionType) => {
    setLastAction(action);
    setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-8 pb-4 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-2xl">♠</span>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                GTO Poker Trainer
              </h1>
              <span className="text-2xl text-red-500">♥</span>
            </div>
            <p className="text-slate-400 text-sm md:text-base">
              Master optimal strategy for 6-max cash games
            </p>
          </div>
        </header>

        {/* Controls Bar */}
        <div className="px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Position Selector - hide in postflop mode */}
                {mode !== 'postflop' && (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm font-medium hidden sm:block">Position:</span>
                    <PositionSelector
                      selectedPosition={selectedPosition}
                      onSelect={setSelectedPosition}
                    />
                  </div>
                )}

                {/* Mode Toggle */}
                <div className={`flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 ${mode === 'postflop' ? 'mx-auto' : ''}`}>
                  <button
                    onClick={() => setMode('view')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      mode === 'view'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    View Ranges
                  </button>
                  <button
                    onClick={() => setMode('trainer')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      mode === 'trainer'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Preflop
                  </button>
                  <button
                    onClick={() => setMode('postflop')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      mode === 'postflop'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Postflop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            {mode === 'view' && (
              <div className="space-y-6">
                {/* Range Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedPosition} Opening Range</h2>
                    <p className="text-slate-400 text-sm">Click any hand to see GTO frequencies</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></span>
                      <span className="text-slate-300">Raise</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></span>
                      <span className="text-slate-300">Call</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
                      <span className="text-slate-300">Fold</span>
                    </span>
                  </div>
                </div>

                {/* Hand Matrix */}
                <div className="flex justify-center">
                  <HandMatrix
                    rangeData={currentRange}
                    selectedHand={selectedHand}
                    onHandSelect={setSelectedHand}
                  />
                </div>

                {/* Selected Hand Details */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
                  {selectedHand ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                      {/* Card Preview */}
                      <div className="flex gap-2">
                        {(() => {
                          const { rank1, suit1, rank2, suit2 } = getSpecificCards(selectedHand);
                          return (
                            <>
                              <PlayingCard rank={rank1} suit={suit1 as Suit} size="md" animateIn={false} />
                              <PlayingCard rank={rank2} suit={suit2 as Suit} size="md" animateIn={false} />
                            </>
                          );
                        })()}
                      </div>

                      {/* Strategy Info */}
                      <div className="text-center sm:text-left">
                        <div className="text-2xl font-bold text-white mb-2">{selectedHand}</div>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                          {currentRange.hands[selectedHand]?.map(a => (
                            <span
                              key={a.action}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                a.action === 'Raise' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                a.action === 'Call' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {a.action}: {(a.frequency * 100).toFixed(0)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-slate-500 text-lg">Select a hand from the matrix above</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'trainer' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                {/* Position Badge */}
                <div className="mb-6">
                  <span className="px-4 py-1.5 bg-slate-800/80 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-700/50">
                    {selectedPosition} • RFI Strategy
                  </span>
                </div>

                {/* Cards Display */}
                <div className="flex justify-center items-center gap-4 mb-8" style={{ minHeight: 180 }}>
                  {trainerHand && trainerCards ? (
                    <>
                      <div style={{ transform: 'rotate(-8deg)' }}>
                        <PlayingCard
                          key={`${trainerHand}-${trainerCards.suit1}-1`}
                          rank={trainerCards.rank1}
                          suit={trainerCards.suit1 as Suit}
                          size="xl"
                          delay={0}
                        />
                      </div>
                      <div style={{ transform: 'rotate(8deg)', marginLeft: -20 }}>
                        <PlayingCard
                          key={`${trainerHand}-${trainerCards.suit2}-2`}
                          rank={trainerCards.rank2}
                          suit={trainerCards.suit2 as Suit}
                          size="xl"
                          delay={0.15}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">Dealing...</div>
                  )}
                </div>

                {/* Hand Label */}
                {trainerHand && (
                  <div className="mb-8 text-center">
                    <span className="text-3xl font-bold text-white">{trainerHand}</span>
                  </div>
                )}

                {/* Question */}
                <p className="text-xl md:text-2xl font-medium text-slate-300 mb-8 text-center">
                  What's the GTO play?
                </p>

                {/* Action Buttons */}
                <ActionButtons onAction={handleTrainerAction} />

                {/* Result Modal */}
                {showResult && trainerHand && (
                  <ResultModal
                    userAction={lastAction!}
                    hand={trainerHand}
                    strategy={currentRange.hands[trainerHand]}
                    onNextHand={nextHand}
                  />
                )}
              </div>
            )}

            {mode === 'postflop' && (
              <PostflopTrainer />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-4 border-t border-slate-800">
          <div className="max-w-4xl mx-auto text-center text-slate-500 text-xs">
            GTO ranges based on solver outputs • 6-max 100bb cash game
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
