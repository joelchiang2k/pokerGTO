import { useState, useMemo, useEffect } from 'react';
import { HandMatrix } from './components/matrix/HandMatrix';
import { PositionSelector } from './components/controls/PositionSelector';
import { generateMockRange, getRandomHandInRange } from './poker-utils';
import type { Position, ActionType } from './types/poker';
import { ActionButtons } from './components/trainer/ActionButtons';
import { ResultModal } from './components/trainer/ResultModal';

function App() {
  const [selectedPosition, setSelectedPosition] = useState<Position>('UTG');
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'trainer'>('view');

  // Load range based on position (in strict static JSON, we would useEffect fetch() here)
  // For now using our mock generator
  const currentRange = useMemo(() => {
    return generateMockRange(selectedPosition);
  }, [selectedPosition]);

  // Trainer State
  const [trainerHand, setTrainerHand] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastAction, setLastAction] = useState<ActionType | null>(null);

  // Initialize trainer hand when entering trainer mode or positions change
  const nextHand = () => {
    const hand = getRandomHandInRange(currentRange);
    setTrainerHand(hand);
    setShowResult(false);
    setLastAction(null);
  };

  // Switch modes effect
  useEffect(() => {
    if (mode === 'trainer') {
      nextHand();
    }
  }, [mode, selectedPosition, currentRange]); // Added currentRange to dependencies

  const handleTrainerAction = (action: ActionType) => {
    setLastAction(action);
    setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 font-sans">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">

        {/* Header */}
        <header className="text-center w-full">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">GTO Preflop Trainer</h1>
          <p className="text-gray-500 text-sm">Select a position to view ranges or test your skills.</p>
        </header>

        {/* Controls */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <PositionSelector
            selectedPosition={selectedPosition}
            onSelect={(pos) => { setSelectedPosition(pos); }}
          />

          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setMode('view')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'view' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              View
            </button>
            <button
              onClick={() => setMode('trainer')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'trainer' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Trainer
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="w-full">
          {mode === 'view' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-lg font-semibold">{selectedPosition} Opening Range</h2>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Raise</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Call</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Fold</span>
                </div>
              </div>

              <HandMatrix
                rangeData={currentRange}
                selectedHand={selectedHand}
                onHandSelect={setSelectedHand}
              />

              {/* Selected Hand Details */}
              <div className="h-24 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-center">
                {selectedHand ? (
                  <div>
                    <div className="text-2xl font-bold mb-1">{selectedHand}</div>
                    <div className="text-sm text-gray-500">
                      {currentRange.hands[selectedHand]?.map(a => (
                        <span key={a.action} className="mx-2">
                          {a.action}: <span className="font-mono font-bold">{(a.frequency * 100).toFixed(0)}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Select a hand to see detailed strategy</span>
                )}
              </div>
            </div>
          )}

          {mode === 'trainer' && (
            <div className="py-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-8">
                <p className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-2">{selectedPosition} - RFI Strategy</p>
                <div className="bg-white dark:bg-gray-800 w-32 h-32 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-extrabold">{trainerHand || '?'}</span>
                </div>
                <p className="text-lg font-medium">What is the optimal action?</p>
              </div>

              <ActionButtons onAction={handleTrainerAction} />

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
        </main>

      </div>
    </div>
  );
}

export default App;
