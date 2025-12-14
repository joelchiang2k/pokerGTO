import React from 'react';
import { PlayingCard } from '../ui/PlayingCard';
import type { Suit } from '../ui/PlayingCard';
import type { Card } from '../../utils/cards';

interface CommunityCardsProps {
  flop: [Card, Card, Card] | null;
  turn: Card | null;
  river: Card | null;
  street: 'preflop' | 'flop' | 'turn' | 'river';
}

// Card back component for unrevealed cards
const CardBack: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeStyles = {
    sm: { width: 40, height: 56 },
    md: { width: 64, height: 96 },
    lg: { width: 96, height: 144 },
  };
  const styles = sizeStyles[size];

  return (
    <div
      style={{
        width: styles.width,
        height: styles.height,
        minWidth: styles.width,
        minHeight: styles.height,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
        borderRadius: 12,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        border: '2px solid #1e3a8a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Diamond pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 8,
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(255,255,255,0.05) 8px,
            rgba(255,255,255,0.05) 16px
          )`,
        }}
      />
      <div
        style={{
          fontSize: size === 'lg' ? 32 : size === 'md' ? 24 : 16,
          color: 'rgba(255,255,255,0.3)',
          fontWeight: 'bold',
        }}
      >
        ?
      </div>
    </div>
  );
};

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  flop,
  turn,
  river,
  street,
}) => {
  const showFlop = street !== 'preflop' && flop;
  const showTurn = (street === 'turn' || street === 'river') && turn;
  const showRiver = street === 'river' && river;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Street label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {street === 'preflop' ? 'Preflop' : `The ${street.charAt(0).toUpperCase() + street.slice(1)}`}
      </div>

      {/* Board cards */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 16,
          background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #166534 100%)',
          borderRadius: 16,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)',
          border: '3px solid #14532d',
        }}
      >
        {street === 'preflop' ? (
          // Show 5 card backs for preflop
          <>
            <CardBack size="md" />
            <CardBack size="md" />
            <CardBack size="md" />
            <div style={{ width: 8 }} />
            <CardBack size="md" />
            <div style={{ width: 8 }} />
            <CardBack size="md" />
          </>
        ) : (
          <>
            {/* Flop - 3 cards */}
            {showFlop && flop ? (
              <>
                <PlayingCard
                  rank={flop[0].rank}
                  suit={flop[0].suit as Suit}
                  size="md"
                  delay={0}
                />
                <PlayingCard
                  rank={flop[1].rank}
                  suit={flop[1].suit as Suit}
                  size="md"
                  delay={0.1}
                />
                <PlayingCard
                  rank={flop[2].rank}
                  suit={flop[2].suit as Suit}
                  size="md"
                  delay={0.2}
                />
              </>
            ) : (
              <>
                <CardBack size="md" />
                <CardBack size="md" />
                <CardBack size="md" />
              </>
            )}

            {/* Gap before turn */}
            <div style={{ width: 8 }} />

            {/* Turn - 1 card */}
            {showTurn && turn ? (
              <PlayingCard
                rank={turn.rank}
                suit={turn.suit as Suit}
                size="md"
                delay={0.3}
              />
            ) : (
              <CardBack size="md" />
            )}

            {/* Gap before river */}
            <div style={{ width: 8 }} />

            {/* River - 1 card */}
            {showRiver && river ? (
              <PlayingCard
                rank={river.rank}
                suit={river.suit as Suit}
                size="md"
                delay={0.4}
              />
            ) : (
              <CardBack size="md" />
            )}
          </>
        )}
      </div>
    </div>
  );
};
