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

const sizeStyles: Record<string, { width: number; height: number; fontSize: number; centerSize: number; padding: number; borderRadius: number }> = {
    sm: { width: 52, height: 72, fontSize: 11, centerSize: 18, padding: 4, borderRadius: 8 },
    md: { width: 70, height: 98, fontSize: 14, centerSize: 24, padding: 5, borderRadius: 10 },
    lg: { width: 90, height: 126, fontSize: 18, centerSize: 32, padding: 6, borderRadius: 12 },
    xl: { width: 110, height: 154, fontSize: 22, centerSize: 40, padding: 8, borderRadius: 14 }
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
                borderRadius: styles.borderRadius,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #d1d5db',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: styles.padding,
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                overflow: 'hidden',
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
