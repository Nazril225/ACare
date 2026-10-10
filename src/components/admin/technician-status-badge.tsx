/**
 * TechnicianStatusBadge — Menampilkan badge status ketersediaan teknisi ACare.
 *
 * Status:
 *  - Tersedia (Emerald / Green)
 *  - Bertugas (Blue / Sky)
 *  - Libur    (Slate / Gray)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TechnicianStatus } from '@/types/acare';

interface TechnicianStatusBadgeProps {
  status: TechnicianStatus;
}

const STATUS_CONFIG: Record<
  TechnicianStatus,
  { bg: string; border: string; text: string; dot: string; label: string }
> = {
  Tersedia: {
    bg: '#D1FAE5',
    border: '#A7F3D0',
    text: '#047857',
    dot: '#10B981',
    label: 'Tersedia',
  },
  Bertugas: {
    bg: '#DBEAFE',
    border: '#BFDBFE',
    text: '#1D4ED8',
    dot: '#3B82F6',
    label: 'Bertugas',
  },
  Libur: {
    bg: '#F1F5F9',
    border: '#CBD5E1',
    text: '#64748B',
    dot: '#94A3B8',
    label: 'Libur',
  },
};

export function TechnicianStatusBadge({ status }: TechnicianStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Libur;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
      ]}
      accessibilityLabel={`Status Teknisi: ${config.label}`}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
