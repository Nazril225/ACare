/**
 * Tema dan konstanta desain aplikasi ACare.
 *
 * Mencakup:
 * - Colors: palet light/dark mode yang disesuaikan dengan identitas ACare
 * - ACareColors: palet warna tetap (tidak bergantung mode) termasuk warna status pesanan
 * - Fonts, Spacing, BottomTabInset, MaxContentWidth (dipertahankan dari starter)
 */

import '@/global.css';

import { Platform } from 'react-native';

// ─── Colors (Light & Dark Mode) ───────────────────────────────────────────────
// Disesuaikan dengan identitas warna ACare: biru langit (sky blue) sebagai primary.

export const Colors = {
  light: {
    /** Warna teks utama. */
    text: '#0F172A',
    /** Warna latar belakang halaman. */
    background: '#F8FAFC',
    /** Warna latar belakang elemen kartu/panel. */
    backgroundElement: '#F1F5F9',
    /** Warna latar belakang elemen terpilih/aktif. */
    backgroundSelected: '#E0F2FE',
    /** Warna teks sekunder / subtitle. */
    textSecondary: '#64748B',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B1120',
    backgroundElement: '#1E293B',
    backgroundSelected: '#082F49',
    textSecondary: '#94A3B8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ─── ACare Brand Colors ───────────────────────────────────────────────────────
// Palet tetap yang digunakan langsung di komponen ACare tanpa bergantung mode.

export const ACareColors = {
  // Primary brand: Sky Blue
  primary: '#0284C7',
  primaryDark: '#0369A1',
  primaryLight: '#E0F2FE',
  accent: '#38BDF8',

  // Neutrals (Slate)
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  /**
   * Palet warna per status pesanan.
   * Setiap status memiliki 4 token: text, bg, border, dot.
   */
  status: {
    'Menunggu Konfirmasi': {
      text: '#B45309',
      bg: '#FEF3C7',
      border: '#FDE68A',
      dot: '#F59E0B',
    },
    'Dikonfirmasi': {
      text: '#1D4ED8',
      bg: '#DBEAFE',
      border: '#BFDBFE',
      dot: '#3B82F6',
    },
    'Teknisi Menuju Lokasi': {
      text: '#6D28D9',
      bg: '#EDE9FE',
      border: '#DDD6FE',
      dot: '#8B5CF6',
    },
    'Sedang Dikerjakan': {
      text: '#0E7490',
      bg: '#CFFAFE',
      border: '#A5F3FC',
      dot: '#06B6D4',
    },
    'Selesai': {
      text: '#047857',
      bg: '#D1FAE5',
      border: '#A7F3D0',
      dot: '#10B981',
    },
    'Dibatalkan': {
      text: '#B91C1C',
      bg: '#FEE2E2',
      border: '#FECACA',
      dot: '#EF4444',
    },
  },
} as const;

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ─── Layout Constants ─────────────────────────────────────────────────────────

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
