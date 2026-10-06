/**
 * StatusBadge — Menampilkan badge warna-warni untuk status pesanan ACare.
 * Menggunakan warna dari ACareColors.status di theme.ts.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ACareColors } from '@/constants/theme';
import { OrderStatus } from '@/types/acare';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const palette = ACareColors.status[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}
      accessibilityLabel={`Status: ${status}`}>
      {/* Dot indikator — bukan satu-satunya petunjuk, teks juga hadir */}
      <View style={[styles.dot, { backgroundColor: palette.dot }]} />
      <Text style={[styles.text, { color: palette.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
