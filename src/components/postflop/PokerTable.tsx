import React from 'react';
import { PlayingCard } from '../ui/PlayingCard';
import type { Suit } from '../ui/PlayingCard';
import type { Card } from '../../utils/cards';

interface PokerTableProps {
  heroHand: [Card, Card] | null;
  flop: [Card, Card, Card] | null;
  turn: Card | null;
  river: Card | null;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  heroPosition: 'IP' | 'OOP';
  potSize?: number;
  villainBet?: boolean;
  villainBetAmount?: number;
  heroStack?: number;
  villainStack?: number;
}

// Chip stack display component
const ChipStack: React.FC<{ amount: number; position: 'top' | 'bottom' }> = ({ amount, position }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(0,0,0,0.7)',
        padding: '6px 12px',
        borderRadius: 20,
        border: '1px solid #374151',
      }}
    >
      {/* Chip icon */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
          border: '2px dashed #92400e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 900,
          color: '#78350f',
        }}
      >
        $
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{amount}</span>
    </div>
  );
};

// Card back for hidden cards - matches PlayingCard sizes
const CardBack: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const dimensions = size === 'md'
    ? { w: 70, h: 98, radius: 10 }
    : { w: 52, h: 72, radius: 8 };
  return (
    <div
      style={{
        width: dimensions.w,
        height: dimensions.h,
        minWidth: dimensions.w,
        minHeight: dimensions.h,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
        borderRadius: dimensions.radius,
        border: '1px solid #1e3a8a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          width: '70%',
          height: '70%',
          borderRadius: dimensions.radius - 2,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)',
        }}
      />
    </div>
  );
};

export const PokerTable: React.FC<PokerTableProps> = ({
  heroHand,
  flop,
  turn,
  river,
  street,
  heroPosition,
  potSize = 100,
  villainBet = false,
  villainBetAmount = 50,
  heroStack = 1000,
  villainStack = 1000,
}) => {
  const showFlop = street !== 'preflop' && flop;
  const showTurn = (street === 'turn' || street === 'river') && turn;
  const showRiver = street === 'river' && river;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 800,
        aspectRatio: '1.7 / 1',
        margin: '0 auto',
        paddingTop: 30,
        paddingBottom: 30,
      }}
    >
      {/* Table outer rim */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 0,
          right: 0,
          bottom: 30,
          background: 'linear-gradient(135deg, #5c3d2e 0%, #8b5a3c 50%, #5c3d2e 100%)',
          borderRadius: '50%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1)',
        }}
      />

      {/* Table felt */}
      <div
        style={{
          position: 'absolute',
          top: 42,
          left: 12,
          right: 12,
          bottom: 42,
          background: 'linear-gradient(135deg, #166534 0%, #15803d 30%, #166534 70%, #14532d 100%)',
          borderRadius: '50%',
          boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.4)',
          border: '3px solid #14532d',
          overflow: 'visible',
        }}
      >
        {/* Felt texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            opacity: 0.1,
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Community cards area */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: 6,
          padding: 10,
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 12,
          zIndex: 10,
        }}
      >
        {street === 'preflop' ? (
          // Show placeholder for preflop
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  width: 52,
                  height: 72,
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 8,
                  border: '1px dashed rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Flop */}
            {showFlop && flop ? (
              <>
                <PlayingCard rank={flop[0].rank} suit={flop[0].suit as Suit} size="sm" delay={0} />
                <PlayingCard rank={flop[1].rank} suit={flop[1].suit as Suit} size="sm" delay={0.1} />
                <PlayingCard rank={flop[2].rank} suit={flop[2].suit as Suit} size="sm" delay={0.2} />
              </>
            ) : (
              <>
                <CardBack size="sm" />
                <CardBack size="sm" />
                <CardBack size="sm" />
              </>
            )}

            {/* Turn */}
            <div style={{ marginLeft: 8 }}>
              {showTurn && turn ? (
                <PlayingCard rank={turn.rank} suit={turn.suit as Suit} size="sm" delay={0.3} />
              ) : (
                <CardBack size="sm" />
              )}
            </div>

            {/* River */}
            <div style={{ marginLeft: 8 }}>
              {showRiver && river ? (
                <PlayingCard rank={river.rank} suit={river.suit as Suit} size="sm" delay={0.4} />
              ) : (
                <CardBack size="sm" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Pot display */}
      <div
        style={{
          position: 'absolute',
          top: '33%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          padding: '6px 16px',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 11,
        }}
      >
        <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>POT</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{potSize}</span>
      </div>

      {/* Villain position (top) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 15,
        }}
      >
        {/* Villain label and stack */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: heroPosition === 'IP' ? '#dc2626' : '#2563eb',
              padding: '4px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              textTransform: 'uppercase',
            }}
          >
            Villain {heroPosition === 'IP' ? '(OOP)' : '(IP)'}
          </div>
          <ChipStack amount={villainStack} position="top" />
        </div>
        {/* Villain cards */}
        <div style={{ display: 'flex', gap: 4 }}>
          <CardBack size="sm" />
          <CardBack size="sm" />
        </div>
        {/* Villain bet indicator */}
        {villainBet && (
          <div
            style={{
              background: '#fbbf24',
              color: '#000',
              padding: '4px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            BET {villainBetAmount}
          </div>
        )}
      </div>

      {/* Hero position (bottom) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 15,
        }}
      >
        {/* Hero cards */}
        <div style={{ display: 'flex', gap: 6 }}>
          {heroHand ? (
            <>
              <PlayingCard rank={heroHand[0].rank} suit={heroHand[0].suit as Suit} size="md" delay={0} />
              <PlayingCard rank={heroHand[1].rank} suit={heroHand[1].suit as Suit} size="md" delay={0.1} />
            </>
          ) : (
            <>
              <CardBack size="md" />
              <CardBack size="md" />
            </>
          )}
        </div>
        {/* Hero label and stack */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: heroPosition === 'IP' ? '#2563eb' : '#dc2626',
              padding: '4px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              textTransform: 'uppercase',
            }}
          >
            Hero {heroPosition === 'IP' ? '(IP)' : '(OOP)'}
          </div>
          <ChipStack amount={heroStack} position="bottom" />
        </div>
      </div>

      {/* Dealer button */}
      <div
        style={{
          position: 'absolute',
          bottom: heroPosition === 'IP' ? '32%' : '62%',
          right: '26%',
          width: 30,
          height: 30,
          background: 'linear-gradient(135deg, #fff 0%, #e5e7eb 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 900,
          color: '#000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: '2px solid #d1d5db',
          zIndex: 12,
        }}
      >
        D
      </div>

      {/* Street indicator */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 15,
          background: 'rgba(0,0,0,0.6)',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          color: street === 'preflop' ? '#94a3b8' : street === 'river' ? '#f97316' : '#22c55e',
          textTransform: 'uppercase',
          letterSpacing: 1,
          zIndex: 12,
        }}
      >
        {street}
      </div>
    </div>
  );
};
