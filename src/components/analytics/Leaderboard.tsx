'use client';

import Image from 'next/image';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  value: number;
  previousValue?: number;
  rank: number;
  previousRank?: number;
}

interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
  valueLabel?: string;
  formatValue?: (value: number) => string;
  maxEntries?: number;
}

export function Leaderboard({
  title,
  entries,
  valueLabel = 'Score',
  formatValue = (v) => v.toLocaleString(),
  maxEntries = 10,
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, maxEntries);

  const getRankChange = (entry: LeaderboardEntry) => {
    if (entry.previousRank === undefined) return null;
    const change = entry.previousRank - entry.rank;
    if (change > 0) return { direction: 'up', value: change };
    if (change < 0) return { direction: 'down', value: Math.abs(change) };
    return { direction: 'same', value: 0 };
  };

  const getTrendIcon = (entry: LeaderboardEntry) => {
    if (entry.previousValue === undefined) return null;
    if (entry.value > entry.previousValue)
      return <TrendingUp className="leaderboard__trend-icon leaderboard__trend-icon--up" />;
    if (entry.value < entry.previousValue)
      return <TrendingDown className="leaderboard__trend-icon leaderboard__trend-icon--down" />;
    return <Minus className="leaderboard__trend-icon leaderboard__trend-icon--same" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="leaderboard__trophy" />;
    if (rank === 2)
      return <span className="leaderboard__rank-badge leaderboard__rank-badge--silver">2</span>;
    if (rank === 3)
      return <span className="leaderboard__rank-badge leaderboard__rank-badge--bronze">3</span>;
    return <span className="leaderboard__rank-number">{rank}</span>;
  };

  return (
    <div className="leaderboard">
      <h3 className="leaderboard__title">{title}</h3>
      <div className="leaderboard__header">
        <span className="leaderboard__header-rank">Rank</span>
        <span className="leaderboard__header-name">Name</span>
        <span className="leaderboard__header-value">{valueLabel}</span>
      </div>
      <div className="leaderboard__entries">
        {displayEntries.map((entry) => {
          const rankChange = getRankChange(entry);
          return (
            <div
              key={entry.id}
              className={`leaderboard__entry ${entry.rank <= 3 ? 'leaderboard__entry--top' : ''}`}
            >
              <div className="leaderboard__rank">
                {getRankBadge(entry.rank)}
                {rankChange && rankChange.direction !== 'same' && (
                  <span
                    className={`leaderboard__rank-change leaderboard__rank-change--${rankChange.direction}`}
                  >
                    {rankChange.direction === 'up' ? '↑' : '↓'}
                    {rankChange.value}
                  </span>
                )}
              </div>
              <div className="leaderboard__name">
                {entry.avatar && (
                  <Image
                    src={entry.avatar}
                    alt={entry.name}
                    width={32}
                    height={32}
                    className="leaderboard__avatar"
                  />
                )}
                <span>{entry.name}</span>
              </div>
              <div className="leaderboard__value">
                <span>{formatValue(entry.value)}</span>
                {getTrendIcon(entry)}
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .leaderboard {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: var(--spacing-4);
          border: 1px solid var(--color-border);
        }
        .leaderboard__title {
          font-size: var(--font-size-lg);
          font-weight: 600;
          margin-bottom: var(--spacing-4);
        }
        .leaderboard__header {
          display: grid;
          grid-template-columns: 80px 1fr 100px;
          padding: var(--spacing-2) 0;
          border-bottom: 1px solid var(--color-border);
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .leaderboard__entries {
          display: flex;
          flex-direction: column;
        }
        .leaderboard__entry {
          display: grid;
          grid-template-columns: 80px 1fr 100px;
          padding: var(--spacing-3) 0;
          border-bottom: 1px solid var(--color-border-light);
          align-items: center;
        }
        .leaderboard__entry--top {
          background: linear-gradient(90deg, var(--color-primary-light) 0%, transparent 100%);
          margin: 0 calc(-1 * var(--spacing-4));
          padding-left: var(--spacing-4);
          padding-right: var(--spacing-4);
        }
        .leaderboard__rank {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
        }
        .leaderboard__rank-number {
          font-weight: 600;
          color: var(--color-text-muted);
        }
        .leaderboard__rank-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: var(--font-size-sm);
        }
        .leaderboard__rank-badge--silver {
          background: #c0c0c0;
          color: white;
        }
        .leaderboard__rank-badge--bronze {
          background: #cd7f32;
          color: white;
        }
        .leaderboard__rank-change {
          font-size: var(--font-size-xs);
        }
        .leaderboard__rank-change--up {
          color: var(--color-success);
        }
        .leaderboard__rank-change--down {
          color: var(--color-error);
        }
        .leaderboard__trend-icon {
          width: 1rem;
          height: 1rem;
        }
        .leaderboard__trend-icon--up {
          color: var(--color-success);
        }
        .leaderboard__trend-icon--down {
          color: var(--color-error);
        }
        .leaderboard__trend-icon--same {
          color: var(--color-text-muted);
        }
        .leaderboard__trophy {
          width: 1.25rem;
          height: 1.25rem;
          color: #eab308;
        }
        .leaderboard__name {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          font-weight: 500;
        }
        .leaderboard__avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        .leaderboard__value {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          justify-content: flex-end;
          font-variant-numeric: tabular-nums;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
