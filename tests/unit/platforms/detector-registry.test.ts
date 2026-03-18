/**
 * Platform detector registry tests
 * Tests for getDetectorForHostname() fallthrough logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/shared/constants';
import type { Settings } from '@/shared/types';

// Mock the logger
vi.mock('@/shared/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock blockPage to avoid DOM side effects
vi.mock('@/content/blockPage', () => ({
  showBlockPage: vi.fn(),
}));

describe('getDetectorForHostname', () => {
  let getDetectorForHostname: typeof import('@/content/platforms').getDetectorForHostname;
  let settingsWithFullSiteDisabled: Settings;
  let settingsWithFullSiteEnabled: Settings;
  let settingsAllDisabled: Settings;

  beforeEach(async () => {
    // Reset modules to get fresh detector instances
    vi.resetModules();
    const mod = await import('@/content/platforms');
    getDetectorForHostname = mod.getDetectorForHostname;

    settingsWithFullSiteDisabled = {
      ...DEFAULT_SETTINGS,
      enabled: true,
      platforms: {
        ...DEFAULT_SETTINGS.platforms,
        youtube: true,
        youtube_full: false,
      },
    };

    settingsWithFullSiteEnabled = {
      ...DEFAULT_SETTINGS,
      enabled: true,
      platforms: {
        ...DEFAULT_SETTINGS.platforms,
        youtube: true,
        youtube_full: true,
      },
    };

    settingsAllDisabled = {
      ...DEFAULT_SETTINGS,
      enabled: true,
      platforms: {
        ...DEFAULT_SETTINGS.platforms,
        youtube: false,
        youtube_full: false,
      },
    };
  });

  it('should return null for unsupported hostnames', () => {
    const detector = getDetectorForHostname('www.google.com');
    expect(detector).toBeNull();
  });

  it('should return a detector for youtube.com when no settings loaded (defaults)', () => {
    const detector = getDetectorForHostname('www.youtube.com');
    expect(detector).not.toBeNull();
    // Without settings, FullSiteBlocker.isEnabled() returns false (settings === null),
    // so it should fallthrough to YouTubeDetector which returns true by default
    expect(detector?.platform).toBe('youtube');
  });

  it('should return YouTubeDetector when youtube_full is disabled', async () => {
    // Re-import to get fresh module with fresh detectors
    vi.resetModules();
    const mod = await import('@/content/platforms');
    const allDetectors = mod.getAllDetectors();

    // Apply settings to all detectors
    for (const det of allDetectors) {
      det.setSettings(settingsWithFullSiteDisabled);
    }

    const detector = mod.getDetectorForHostname('www.youtube.com');
    expect(detector).not.toBeNull();
    expect(detector?.platform).toBe('youtube');
  });

  it('should return FullSiteBlocker when youtube_full is enabled', async () => {
    vi.resetModules();
    const mod = await import('@/content/platforms');
    const allDetectors = mod.getAllDetectors();

    // Apply settings with youtube_full enabled
    for (const det of allDetectors) {
      det.setSettings(settingsWithFullSiteEnabled);
    }

    const detector = mod.getDetectorForHostname('www.youtube.com');
    expect(detector).not.toBeNull();
    expect(detector?.platform).toBe('youtube_full');
  });

  it('should return null when all YouTube detectors are disabled', async () => {
    vi.resetModules();
    const mod = await import('@/content/platforms');
    const allDetectors = mod.getAllDetectors();

    // Disable both youtube and youtube_full
    for (const det of allDetectors) {
      det.setSettings(settingsAllDisabled);
    }

    const detector = mod.getDetectorForHostname('www.youtube.com');
    expect(detector).toBeNull();
  });

  it('should fallthrough from disabled FullSiteBlocker to enabled platform detector for instagram', async () => {
    vi.resetModules();
    const mod = await import('@/content/platforms');
    const allDetectors = mod.getAllDetectors();

    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      enabled: true,
      platforms: {
        ...DEFAULT_SETTINGS.platforms,
        instagram: true,
        instagram_full: false,
      },
    };

    for (const det of allDetectors) {
      det.setSettings(settings);
    }

    const detector = mod.getDetectorForHostname('www.instagram.com');
    expect(detector).not.toBeNull();
    expect(detector?.platform).toBe('instagram');
  });

  it('should fallthrough from disabled FullSiteBlocker to enabled platform detector for tiktok', async () => {
    vi.resetModules();
    const mod = await import('@/content/platforms');
    const allDetectors = mod.getAllDetectors();

    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      enabled: true,
      platforms: {
        ...DEFAULT_SETTINGS.platforms,
        tiktok: true,
        tiktok_full: false,
      },
    };

    for (const det of allDetectors) {
      det.setSettings(settings);
    }

    const detector = mod.getDetectorForHostname('www.tiktok.com');
    expect(detector).not.toBeNull();
    expect(detector?.platform).toBe('tiktok');
  });

  it('should return FullSiteBlocker for tiktok when tiktok_full is enabled', async () => {
    vi.resetModules();
    const mod = await import('@/content/platforms');
    const allDetectors = mod.getAllDetectors();

    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      enabled: true,
      platforms: {
        ...DEFAULT_SETTINGS.platforms,
        tiktok: true,
        tiktok_full: true,
      },
    };

    for (const det of allDetectors) {
      det.setSettings(settings);
    }

    const detector = mod.getDetectorForHostname('www.tiktok.com');
    expect(detector).not.toBeNull();
    expect(detector?.platform).toBe('tiktok_full');
  });
});
