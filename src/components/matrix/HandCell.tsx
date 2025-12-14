import React from 'react';
import type { HandStrategy } from '../../types/poker';

interface HandCellProps {
    hand: string;
    strategy?: HandStrategy;
    onSelect: (hand: string) => void;
    isSelected?: boolean;
}

export const HandCell: React.FC<HandCellProps> = ({ hand, strategy, onSelect, isSelected }) => {
    // Compute background based on strategy
    const bgStyle = React.useMemo(() => {
        if (!strategy) return { backgroundColor: '#1e293b' }; // slate-800

        const raiseFreq = strategy.actions.find(a => a.action === 'Raise')?.frequency || 0;
        const callFreq = strategy.actions.find(a => a.action === 'Call')?.frequency || 0;
        const foldFreq = strategy.actions.find(a => a.action === 'Fold')?.frequency || 0;

        // Pure fold = dark
        if (foldFreq > 0.99) return { backgroundColor: '#334155' }; // slate-700

        // Pure raise = green
        if (raiseFreq > 0.99) return { backgroundColor: '#22c55e' };

        // Pure call = blue
        if (callFreq > 0.99) return { backgroundColor: '#3b82f6' };

        // Mixed strategy - gradient
        const raisePct = raiseFreq * 100;
        const callPct = callFreq * 100;

        return {
            background: `linear-gradient(135deg,
                #22c55e 0%,
                #22c55e ${raisePct}%,
                #3b82f6 ${raisePct}%,
                #3b82f6 ${raisePct + callPct}%,
                #ef4444 ${raisePct + callPct}%,
                #ef4444 100%)`
        };
    }, [strategy]);

    const hasFold = strategy?.actions.find(a => a.action === 'Fold')?.frequency || 0;
    const textColor = hasFold > 0.99 ? '#94a3b8' : '#ffffff';

    return (
        <div
            onClick={() => onSelect(hand)}
            style={{
                ...bgStyle,
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(8px, 2vw, 11px)',
                fontWeight: 700,
                color: textColor,
                cursor: 'pointer',
                userSelect: 'none',
                borderRadius: 3,
                transition: 'transform 0.1s, box-shadow 0.1s',
                boxShadow: isSelected ? '0 0 0 2px #facc15, 0 0 12px rgba(250, 204, 21, 0.5)' : 'none',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                zIndex: isSelected ? 10 : 1,
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.zIndex = '5';
                }
            }}
            onMouseLeave={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.zIndex = '1';
                }
            }}
        >
            {hand}
        </div>
    );
};
