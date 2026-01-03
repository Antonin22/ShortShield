/**
 * Compact stats row for popup
 */

import { useI18n } from '@/shared/hooks/useI18n';
import type { BlockingStats, StreakData } from '@/shared/types';

interface CompactStatsProps {
  stats: BlockingStats;
  streakData: StreakData;
  streakEnabled: boolean;
  todayUsageMs?: number;
}

/**
 * Format duration in milliseconds to human readable string
 */
function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes === 0) {
    return '0m';
  }
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function CompactStats({
  stats,
  streakData,
  streakEnabled,
  todayUsageMs,
}: CompactStatsProps) {
  const { t, formatNumber } = useI18n();

  return (
    <div className="compact-stats">
      {streakEnabled && streakData.currentStreak > 0 && (
        <div className="compact-stat streak">
          <span className="compact-stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </span>
          <span className="compact-stat-value">{streakData.currentStreak}</span>
          <span className="compact-stat-label">{t('streakDays')}</span>
        </div>
      )}
      <div className="compact-stat">
        <span className="compact-stat-value">
          {formatNumber(stats.blockedToday)}
        </span>
        <span className="compact-stat-label">{t('popupStatsToday')}</span>
      </div>
      {todayUsageMs !== undefined && todayUsageMs > 0 && (
        <div className="compact-stat time-usage">
          <span className="compact-stat-icon clock">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
          <span className="compact-stat-value">
            {formatDuration(todayUsageMs)}
          </span>
          <span className="compact-stat-label">
            {t('popupStatsTodayUsage')}
          </span>
        </div>
      )}
      <div className="compact-stat">
        <span className="compact-stat-value">
          {formatNumber(stats.blockedTotal)}
        </span>
        <span className="compact-stat-label">{t('popupStatsTotal')}</span>
      </div>
    </div>
  );
}
