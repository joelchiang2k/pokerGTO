import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export type Suit = 'h' | 'd' | 'c' | 's'; // hearts, diamonds, clubs, spades
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

interface PlayingCardProps {
    rank: string;
    suit: Suit;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    delay?: number;
    animateIn?: boolean;
}

const suitSymbols: Record<Suit, string> = {
    h: '♥',
    d: '♦',
    c: '♣',
    s: '♠'
};

// Four-color deck for better readability
const suitColors: Record<Suit, string> = {
    h: '#ef4444', // red
    d: '#3b82f6', // blue
    c: '#16a34a', // green
    s: '#1f2937'  // dark gray
};

const sizeStyles: Record<string, { width: number; height: number; fontSize: number; centerSize: number }> = {
    sm: { width: 40, height: 56, fontSize: 12, centerSize: 18 },
    md: { width: 64, height: 96, fontSize: 16, centerSize: 28 },
    lg: { width: 96, height: 144, fontSize: 22, centerSize: 40 },
    xl: { width: 112, height: 160, fontSize: 28, centerSize: 52 }
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
    rank,
    suit,
    size = 'md',
    className = '',
    delay = 0,
    animateIn = true
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const styles = sizeStyles[size];
    const suitColor = suitColors[suit];

    // Convert T to 10 for display
    const displayRank = rank === 'T' ? '10' : rank;

    useEffect(() => {
        if (!cardRef.current || !animateIn) return;

        const card = cardRef.current;

        // Set initial state
        gsap.set(card, {
            opacity: 0,
            scale: 0.5,
            y: -30,
            rotationY: -90,
        });

        // Animate in with a deal effect
        gsap.to(card, {
            opacity: 1,
            scale: 1,
            y: 0,
            rotationY: 0,
            duration: 0.5,
            delay: delay,
            ease: 'back.out(1.4)',
        });

        return () => {
            gsap.killTweensOf(card);
        };
    }, [rank, suit, delay, animateIn]);

    return (
        <div
            ref={cardRef}
            className={className}
            style={{
                width: styles.width,
                height: styles.height,
                minWidth: styles.width,
                minHeight: styles.height,
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)',
                borderRadius: 12,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '2px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 8,
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
            }}
        >
            {/* Top Left */}
            <div style={{
                alignSelf: 'flex-start',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                lineHeight: 1,
                color: suitColor,
            }}>
                <span style={{ fontWeight: 'bold', fontSize: styles.fontSize }}>{displayRank}</span>
                <span style={{ fontSize: styles.fontSize * 0.7 }}>{suitSymbols[suit]}</span>
            </div>

            {/* Center Suit */}
            <div style={{
                fontSize: styles.centerSize,
                lineHeight: 1,
                color: suitColor,
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
            }}>
                {suitSymbols[suit]}
            </div>

            {/* Bottom Right (Rotated) */}
            <div style={{
                alignSelf: 'flex-end',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                lineHeight: 1,
                color: suitColor,
                transform: 'rotate(180deg)',
            }}>
                <span style={{ fontWeight: 'bold', fontSize: styles.fontSize }}>{displayRank}</span>
                <span style={{ fontSize: styles.fontSize * 0.7 }}>{suitSymbols[suit]}</span>
            </div>
        </div>
    );
};
