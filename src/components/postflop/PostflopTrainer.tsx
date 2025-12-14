import React, { useState, useCallback, useEffect } from 'react';
import { PokerTable } from './PokerTable';
import { dealPostflopScenario } from '../../utils/cards';
import type { Card } from '../../utils/cards';
import { evaluateHand, getStrengthCategory } from '../../utils/handEvaluator';
import type { HandEvaluation } from '../../utils/handEvaluator';
import { analyzeBoard, getPostflopRecommendation } from '../../utils/boardAnalyzer';
import type { BoardTexture } from '../../utils/boardAnalyzer';
import { quickEquityEstimate } from '../../utils/equityCalculator';

type Street = 'preflop' | 'flop' | 'turn' | 'river';
type Position = 'IP' | 'OOP';
type Action = 'check' | 'bet' | 'call' | 'fold' | 'raise';
type BetSize = '33' | '50' | '75' | '100' | '150';

interface Scenario {
  heroHand: [Card, Card];
  flop: [Card, Card, Card];
  turn: Card;
  river: Card;
}

interface ActionResult {
  isCorrect: boolean;
  userAction: Action;
  userBetSize?: BetSize;
  recommendedAction: Action;
  recommendedBetSize?: string;
  reasoning: string;
}

const BET_SIZE_LABELS: Record<BetSize, string> = {
  '33': '33%',
  '50': '50%',
  '75': '75%',
  '100': 'Pot',
  '150': '150%',
};

// Map sizing recommendation to bet size
function getRecommendedBetSize(sizing: 'small' | 'medium' | 'large' | undefined): BetSize {
  if (sizing === 'small') return '33';
  if (sizing === 'large') return '100';
  return '50'; // medium or default
}

export const PostflopTrainer: React.FC = () => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [street, setStreet] = useState<Street>('flop');
  const [position, setPosition] = useState<Position>('IP');
  const [facingBet, setFacingBet] = useState(false);
  const [lastResult, setLastResult] = useState<ActionResult | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showBetSizing, setShowBetSizing] = useState(false);
  const [pendingAction, setPendingAction] = useState<'bet' | 'raise' | null>(null);
  const [potSize, setPotSize] = useState(100);
  const [villainBetSize, setVillainBetSize] = useState(50);
  const [heroStack, setHeroStack] = useState(1000);
  const [villainStack, setVillainStack] = useState(1000);

  // Current board based on street
  const currentBoard = useCallback((): Card[] => {
    if (!scenario) return [];
    if (street === 'preflop') return [];
    if (street === 'flop') return [...scenario.flop];
    if (street === 'turn') return [...scenario.flop, scenario.turn];
    return [...scenario.flop, scenario.turn, scenario.river];
  }, [scenario, street]);

  // Get hand evaluation
  const handEvaluation = useCallback((): HandEvaluation | null => {
    if (!scenario) return null;
    return evaluateHand(scenario.heroHand, currentBoard());
  }, [scenario, currentBoard]);

  // Get board texture
  const boardTexture = useCallback((): BoardTexture | null => {
    if (!scenario || street === 'preflop') return null;
    return analyzeBoard(currentBoard());
  }, [scenario, street, currentBoard]);

  // Get equity estimate
  const equityEstimate = useCallback((): number => {
    if (!scenario) return 0;
    return quickEquityEstimate(scenario.heroHand, currentBoard());
  }, [scenario, currentBoard]);

  // Deal new scenario
  const dealNewHand = useCallback(() => {
    const dealt = dealPostflopScenario();
    setScenario(dealt);
    setStreet('flop');
    const isFacingBet = Math.random() > 0.5;
    setFacingBet(isFacingBet);
    setLastResult(null);
    setShowAnalysis(false);
    setShowBetSizing(false);
    setPendingAction(null);
    // Randomize pot size between 50-200
    const newPot = Math.floor(Math.random() * 4 + 1) * 50; // 50, 100, 150, or 200
    setPotSize(newPot);
    // Reset stacks (100bb starting stack minus preflop action)
    const startingStack = 1000;
    const preflopInvestment = newPot / 2; // Each player put in half the pot preflop
    setHeroStack(startingStack - preflopInvestment);
    setVillainStack(startingStack - preflopInvestment);
    // Randomize villain bet size when facing bet
    if (isFacingBet) {
      const betSizes = [33, 50, 75, 100];
      const betAmount = Math.floor(newPot * betSizes[Math.floor(Math.random() * betSizes.length)] / 100);
      setVillainBetSize(betAmount);
      setVillainStack(startingStack - preflopInvestment - betAmount);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    dealNewHand();
  }, [dealNewHand]);

  // Handle initial action selection
  const handleAction = (action: Action) => {
    if (!scenario) return;

    // If betting or raising, show sizing options
    if (action === 'bet' || action === 'raise') {
      setPendingAction(action);
      setShowBetSizing(true);
      return;
    }

    // For check, call, fold - process immediately
    processAction(action);
  };

  // Handle bet size selection
  const handleBetSize = (size: BetSize) => {
    if (!pendingAction) return;
    processAction(pendingAction, size);
    setShowBetSizing(false);
    setPendingAction(null);
  };

  // Cancel bet sizing
  const cancelBetSizing = () => {
    setShowBetSizing(false);
    setPendingAction(null);
  };

  // Process the action with optional bet size
  const processAction = (action: Action, betSize?: BetSize) => {
    if (!scenario) return;

    const evaluation = handEvaluation();
    const texture = boardTexture();

    if (!evaluation || !texture) {
      // Preflop - simplified logic
      setLastResult({
        isCorrect: true,
        userAction: action,
        recommendedAction: action,
        reasoning: 'Preflop decision'
      });
      advanceStreet();
      return;
    }

    // Calculate bet amount and update stacks/pot
    let heroBetAmount = 0;
    if (action === 'call') {
      heroBetAmount = villainBetSize;
      setHeroStack(prev => prev - heroBetAmount);
      setPotSize(prev => prev + heroBetAmount);
    } else if (action === 'bet' && betSize) {
      heroBetAmount = Math.floor(potSize * parseInt(betSize) / 100);
      setHeroStack(prev => prev - heroBetAmount);
      setPotSize(prev => prev + heroBetAmount);
    } else if (action === 'raise' && betSize) {
      // Raise = call + additional bet
      const raiseTotal = villainBetSize + Math.floor(potSize * parseInt(betSize) / 100);
      heroBetAmount = raiseTotal;
      setHeroStack(prev => prev - heroBetAmount);
      setPotSize(prev => prev + heroBetAmount);
    }
    // fold and check don't change stacks

    const recommendation = getPostflopRecommendation(
      evaluation.strength,
      texture,
      position,
      street as 'flop' | 'turn' | 'river',
      facingBet
    );

    // Check if user action matches recommendation
    const recAction = recommendation.action;
    let isCorrect = action === recAction;

    // Check bet sizing if applicable
    let sizingCorrect = true;
    let recommendedSize: string | undefined;

    if ((action === 'bet' || action === 'raise') && betSize) {
      const recSize = getRecommendedBetSize(recommendation.sizing);
      recommendedSize = BET_SIZE_LABELS[recSize];

      // Allow some flexibility in sizing (within one step)
      const sizeOrder: BetSize[] = ['33', '50', '75', '100', '150'];
      const userIdx = sizeOrder.indexOf(betSize);
      const recIdx = sizeOrder.indexOf(recSize);
      sizingCorrect = Math.abs(userIdx - recIdx) <= 1;
    }

    // Be lenient with close decisions
    if (!isCorrect && recommendation.confidence < 0.6) {
      isCorrect = true; // Close decision - accept either
    }

    // Final correctness considers both action and sizing
    const finalCorrect = isCorrect && sizingCorrect;

    setLastResult({
      isCorrect: finalCorrect,
      userAction: action,
      userBetSize: betSize,
      recommendedAction: recAction,
      recommendedBetSize: recommendedSize,
      reasoning: recommendation.reasoning + (recommendedSize && !sizingCorrect ? ` (Sizing: ${recommendedSize} recommended)` : '')
    });

    setStats(prev => ({
      correct: prev.correct + (finalCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setShowAnalysis(true);
  };

  // Advance to next street
  const advanceStreet = () => {
    if (street === 'flop') setStreet('turn');
    else if (street === 'turn') setStreet('river');
    else {
      dealNewHand();
      return;
    }

    const isFacingBet = Math.random() > 0.5;
    setFacingBet(isFacingBet);
    setLastResult(null);
    setShowAnalysis(false);
    setShowBetSizing(false);
    setPendingAction(null);

    // If villain bets on new street, deduct from their stack
    if (isFacingBet) {
      const betSizes = [33, 50, 75, 100];
      const betPercent = betSizes[Math.floor(Math.random() * betSizes.length)];
      const betAmount = Math.floor(potSize * betPercent / 100);
      setVillainBetSize(betAmount);
      setVillainStack(prev => prev - betAmount);
      // Villain's bet goes into the pot
      setPotSize(prev => prev + betAmount);
    }
  };

  const evaluation = handEvaluation();
  const texture = boardTexture();
  const equity = equityEstimate();
  const strengthCategory = evaluation ? getStrengthCategory(evaluation.strength) : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: 24,
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      {/* Header with stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: 14 }}>
          Score: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{stats.correct}</span>
          /{stats.total}
          {stats.total > 0 && (
            <span style={{ marginLeft: 8 }}>
              ({Math.round((stats.correct / stats.total) * 100)}%)
            </span>
          )}
        </div>

        {/* Position toggle */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setPosition('IP')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              background: position === 'IP' ? '#22c55e' : '#334155',
              color: position === 'IP' ? '#fff' : '#94a3b8',
            }}
          >
            In Position
          </button>
          <button
            onClick={() => setPosition('OOP')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              background: position === 'OOP' ? '#f97316' : '#334155',
              color: position === 'OOP' ? '#fff' : '#94a3b8',
            }}
          >
            Out of Position
          </button>
        </div>
      </div>

      {/* Poker Table View */}
      {scenario && (
        <PokerTable
          heroHand={scenario.heroHand}
          flop={scenario.flop}
          turn={scenario.turn}
          river={scenario.river}
          street={street}
          heroPosition={position}
          potSize={potSize}
          villainBet={facingBet}
          villainBetAmount={villainBetSize}
          heroStack={heroStack}
          villainStack={villainStack}
        />
      )}

      {/* Hand strength info (shown after action or toggle) */}
      {showAnalysis && evaluation && texture && (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: 12,
            padding: 16,
            width: '100%',
            maxWidth: 400,
            border: '1px solid #334155',
          }}
        >
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: strengthCategory?.color || '#fff',
              }}
            >
              {evaluation.description}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 13 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b' }}>Strength</div>
              <div style={{ color: strengthCategory?.color, fontWeight: 600 }}>
                {strengthCategory?.label}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b' }}>Equity</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>
                {Math.round(equity * 100)}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b' }}>Board</div>
              <div style={{
                color: texture.dangerLevel === 'dangerous' ? '#ef4444' :
                  texture.dangerLevel === 'moderate' ? '#f97316' : '#22c55e',
                fontWeight: 600
              }}>
                {texture.dangerLevel}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
            {texture.textureLabel}
          </div>
        </div>
      )}

      {/* Result feedback */}
      {lastResult && (
        <div
          style={{
            background: lastResult.isCorrect
              ? 'rgba(34, 197, 94, 0.15)'
              : 'rgba(239, 68, 68, 0.15)',
            border: `2px solid ${lastResult.isCorrect ? '#22c55e' : '#ef4444'}`,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 700,
          }}
        >
          {/* Result header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: lastResult.isCorrect ? '#22c55e' : '#ef4444',
              }}
            >
              {lastResult.isCorrect ? 'Correct!' : 'Not Optimal'}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: 14 }}>
              You: <span style={{ fontWeight: 600, color: lastResult.isCorrect ? '#22c55e' : '#f97316' }}>
                {lastResult.userAction.toUpperCase()}
                {lastResult.userBetSize && ` (${BET_SIZE_LABELS[lastResult.userBetSize]})`}
              </span>
              {!lastResult.isCorrect && (
                <>
                  {' → '} Optimal: <span style={{ fontWeight: 600, color: '#22c55e' }}>
                    {lastResult.recommendedAction.toUpperCase()}
                    {lastResult.recommendedBetSize && ` (${lastResult.recommendedBetSize})`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Detailed explanation */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 12,
              padding: 16,
              maxHeight: 250,
              overflowY: 'auto',
            }}
          >
            <div style={{
              color: '#e2e8f0',
              fontSize: 14,
              lineHeight: 1.7,
              textAlign: 'left',
            }}>
              {lastResult.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!showAnalysis ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Bet sizing panel */}
          {showBetSizing ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                background: 'rgba(30, 41, 59, 0.9)',
                padding: 20,
                borderRadius: 16,
                border: '1px solid #334155',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
                Select {pendingAction === 'raise' ? 'raise' : 'bet'} size (% of pot)
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                Pot: {potSize} {facingBet && `| To call: ${villainBetSize}`}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {(['33', '50', '75', '100', '150'] as BetSize[]).map((size) => {
                  const betAmount = Math.floor(potSize * parseInt(size) / 100);
                  return (
                    <button
                      key={size}
                      onClick={() => handleBetSize(size)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 14,
                        background: size === '100'
                          ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                          : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                        minWidth: 70,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>{BET_SIZE_LABELS[size]}</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>{betAmount}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={cancelBetSizing}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  background: 'transparent',
                  color: '#94a3b8',
                  marginTop: 8,
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {facingBet && (
                <div style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Villain bets {villainBetSize}! What do you do?
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {facingBet ? (
                  // Facing a bet
                  <>
                    <ActionButton
                      action="fold"
                      color="#ef4444"
                      onClick={() => handleAction('fold')}
                    />
                    <ActionButton
                      action="call"
                      color="#3b82f6"
                      onClick={() => handleAction('call')}
                      subtext={`${villainBetSize}`}
                    />
                    <ActionButton
                      action="raise"
                      color="#22c55e"
                      onClick={() => handleAction('raise')}
                    />
                  </>
                ) : (
                  // Not facing bet
                  <>
                    <ActionButton
                      action="check"
                      color="#64748b"
                      onClick={() => handleAction('check')}
                    />
                    <ActionButton
                      action="bet"
                      color="#22c55e"
                      onClick={() => handleAction('bet')}
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12 }}>
          {street !== 'river' ? (
            <button
              onClick={advanceStreet}
              style={{
                padding: '12px 32px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 16,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              Next Street
            </button>
          ) : (
            <button
              onClick={dealNewHand}
              style={{
                padding: '12px 32px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 16,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              }}
            >
              New Hand
            </button>
          )}
        </div>
      )}

      {/* Deal new hand button */}
      <button
        onClick={dealNewHand}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid #334155',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 13,
          background: 'transparent',
          color: '#64748b',
          marginTop: 16,
        }}
      >
        Skip Hand
      </button>
    </div>
  );
};

// Action button component
const ActionButton: React.FC<{
  action: Action;
  color: string;
  onClick: () => void;
  subtext?: string;
}> = ({ action, color, onClick, subtext }) => (
  <button
    onClick={onClick}
    style={{
      padding: subtext ? '10px 28px' : '14px 28px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 16,
      textTransform: 'uppercase',
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: '#fff',
      boxShadow: `0 4px 12px ${color}40`,
      transition: 'transform 0.1s, box-shadow 0.1s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 6px 16px ${color}50`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
    }}
  >
    <span>{action}</span>
    {subtext && <span style={{ fontSize: 11, opacity: 0.8 }}>{subtext}</span>}
  </button>
);
