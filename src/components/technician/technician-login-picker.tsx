/**
 * TechnicianLoginPicker — Daftar pilihan identitas teknisi untuk masuk peran technician.
 *
 * Komponen presentasional (bukan Modal) agar dapat dipakai di dalam sheet mana pun:
 *  - role-select  → dibungkus Modal tersendiri
 *  - account menu → dirender sebagai langkah kedua di dalam sheet yang sudah ada
 *
 * Tujuannya menghindari Modal bersarang yang bermasalah di iOS sekaligus
 * memastikan teknisi dipilih secara eksplisit sebelum peran technician aktif.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ACareColors } from '@/constants/theme';
import { Technician } from '@/types/acare';

interface TechnicianLoginPickerProps {
  /** Daftar teknisi yang dapat dipilih. */
  technicians: Technician[];
  /** ID teknisi yang sedang terpilih (opsional). */
  selectedId?: string | null;
  /** Dipanggil saat teknisi dipilih. */
  onSelect: (technician: Technician) => void;
  /** Dipanggil saat pengguna membatalkan pemilihan. */
  onCancel: () => void;
}

export function TechnicianLoginPicker({
  technicians,
  selectedId,
  onSelect,
  onCancel,
}: TechnicianLoginPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Masuk sebagai Teknisi</Text>
      <Text style={styles.subtitle}>
        Pilih identitas teknisi yang sedang bertugas untuk mengakses dashboard.
      </Text>

      <View style={styles.list}>
        {technicians.map((tech) => {
          const isSelected = selectedId === tech.id;
          const initial = tech.name.charAt(0).toUpperCase();
          return (
            <TouchableOpacity
              key={tech.id}
              style={[styles.item, isSelected && styles.itemSelected]}
              activeOpacity={0.8}
              onPress={() => onSelect(tech)}
              accessibilityRole="button"
              accessibilityLabel={`Masuk sebagai teknisi ${tech.name}`}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>

              <View style={styles.info}>
                <View style={styles.infoTop}>
                  <Text style={styles.name}>{tech.name}</Text>
                  <Text style={styles.statusText}>{tech.status}</Text>
                </View>
                <Text style={styles.spec} numberOfLines={1}>
                  {tech.specialization}
                </Text>
                <Text style={styles.meta}>
                  ⭐ {tech.rating} • 📞 {tech.phone}
                </Text>
              </View>

              {isSelected ? (
                <Text style={styles.check}>✓</Text>
              ) : (
                <Text style={styles.chevron}>›</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.cancelBtn}
        activeOpacity={0.7}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Batal memilih teknisi">
        <Text style={styles.cancelBtnText}>Batal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  subtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    lineHeight: 17,
    marginBottom: 4,
  },
  list: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ACareColors.slate200,
    backgroundColor: ACareColors.slate50,
  },
  itemSelected: {
    borderColor: ACareColors.primary,
    backgroundColor: '#F0F9FF',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.slate900,
    flex: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: ACareColors.primaryDark,
    backgroundColor: ACareColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  spec: {
    fontSize: 11,
    color: ACareColors.slate500,
  },
  meta: {
    fontSize: 11,
    color: ACareColors.slate600,
    fontWeight: '600',
  },
  check: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  chevron: {
    fontSize: 22,
    color: ACareColors.slate300,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate500,
  },
});
