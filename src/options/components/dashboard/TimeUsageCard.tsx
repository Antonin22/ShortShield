/**
 * Time usage card component showing today's watch time with platform breakdown
 */

import { useI18n } from '@/shared/hooks/useI18n';
import type { TimeLimitsState, Platform } from '@/shared/types';

interface TimeUsageCardProps {
  timeLimitsState: TimeLimitsState;
  onViewDetails?: () => void;
}

/** Platform display configuration */
const PLATFORM_CONFIG: {
  platform: Platform;
  labelKey: string;
  color: string;
}[] = [
  { platform: 'youtube', labelKey: 'platformYouTube', color: '#FF0000' },
  { platform: 'tiktok', labelKey: 'platformTikTok', color: '#000000' },
  { platform: 'instagram', labelKey: 'platformInstagram', color: '#E1306C' },
  { platform: 'twitter', labelKey: 'platformTwitter', color: '#1DA1F2' },
  { platform: 'facebook', labelKey: 'platformFacebook', color: '#4267B2' },
  { platform: 'reddit', labelKey: 'platformReddit', color: '#FF4500' },
  { platform: 'twitch', labelKey: 'platformTwitch', color: '#9146FF' },
  { platform: 'discord', labelKey: 'platformDiscord', color: '#5865F2' },
];

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

export function TimeUsageCard({
  timeLimitsState,
  onViewDetails,
}: TimeUsageCardProps) {
  const { t } = useI18n();

  const totalMs = timeLimitsState.usage.reduce(
    (sum, u) => sum + u.usedTodayMs,
    0
  );

  // Get platform breakdown with usage data
  const platformBreakdown = PLATFORM_CONFIG.map((config) => {
    const usage = timeLimitsState.usage.find(
      (u) => u.platform === config.platform
    );
    return {
      ...config,
      usedMs: usage?.usedTodayMs ?? 0,
    };
  })
    .filter((p) => p.usedMs > 0)
    .sort((a, b) => b.usedMs - a.usedMs);

  return (
    <div className="time-usage-card dashboard-card">
      <div className="time-usage-card-header">
        <div className="time-usage-card-title-section">
          <div className="time-usage-card-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 className="time-usage-card-title">{t('dashboardTodayUsage')}</h3>
        </div>
        {onViewDetails && (
          <button
            type="button"
            className="time-usage-card-details-btn"
            onClick={onViewDetails}
          >
            {t('viewDetails') || 'Details'}
          </button>
        )}
      </div>

      <div className="time-usage-card-value">{formatDuration(totalMs)}</div>

      {platformBreakdown.length > 0 && (
        <div className="time-usage-card-breakdown">
          {/* Mini bar chart */}
          <div className="time-usage-mini-chart">
            {platformBreakdown.map(({ platform, color, usedMs }) => {
              const percentage = totalMs > 0 ? (usedMs / totalMs) * 100 : 0;
              return (
                <div
                  key={platform}
                  className="time-usage-mini-segment"
                  style={{
                    width: `${Math.max(percentage, 2)}%`,
                    backgroundColor: color,
                  }}
                  title={`${t(PLATFORM_CONFIG.find((p) => p.platform === platform)?.labelKey ?? platform)}: ${formatDuration(usedMs)}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="time-usage-legend">
            {platformBreakdown
              .slice(0, 3)
              .map(({ platform, labelKey, color, usedMs }) => (
                <div key={platform} className="time-usage-legend-item">
                  <span
                    className="time-usage-legend-dot"
                    style={{ backgroundColor: color }}
                  />
                  <span className="time-usage-legend-label">{t(labelKey)}</span>
                  <span className="time-usage-legend-value">
                    {formatDuration(usedMs)}
                  </span>
                </div>
              ))}
            {platformBreakdown.length > 3 && (
              <div className="time-usage-legend-item">
                <span className="time-usage-legend-more">
                  +{platformBreakdown.length - 3} {t('dashboardMore') || 'more'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {platformBreakdown.length === 0 && (
        <div className="time-usage-empty">
          <span className="time-usage-empty-text">
            {t('reportsNoData') || 'No data yet'}
          </span>
        </div>
      )}
    </div>
  );
}
