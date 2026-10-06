/**
 * AdminStatCard — Komponen kartu statistik ringkasan untuk Admin Dashboard.
 * Menampilkan judul, nilai/angka, ikon emoji, dan badge warna status opsional.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ACareColors } from '@/constants/theme';

interface AdminStatCardProps {
  title: string;
  value: number;
  icon: string;
  accentColor?: string;
  badgeBg?: string;
  subtitle?: string;
  accessibilityLabel?: string;
}

export function AdminStatCard({
  title,
  value,
  icon,
  accentColor = ACareColors.primary,
  badgeBg,
  subtitle,
  accessibilityLabel,
}: AdminStatCardProps) {
  const bgBadge = badgeBg ?? `${accentColor}15`;

  return (
    <View
      style={styles.card}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel ?? `${title}: ${value}`}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: bgBadge }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <Text style={[styles.valueText, { color: accentColor }]}>{value}</Text>
      </View>

      <Text style={styles.titleText}>{title}</Text>
      {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  valueText: {
    fontSize: 22,
    fontWeight: '800',
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.slate800,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 11,
    color: ACareColors.slate400,
    lineHeight: 14,
  },
});
