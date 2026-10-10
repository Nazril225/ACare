/**
 * TechnicianCard — Komponen kartu ringkasan teknisi untuk halaman daftar teknisi Admin.
 *
 * Menampilkan:
 *  - Avatar inisial teknisi
 *  - Nama lengkap & ID teknisi
 *  - Status badge ketersediaan (Tersedia / Bertugas / Libur)
 *  - Spesialisasi keahlian
 *  - No. telepon / WhatsApp
 *  - Rating rata-rata & jumlah pekerjaan terselesaikan
 *  - Jumlah pesanan yang sedang aktif ditangani
 *  - Tombol aksi / link ke detail teknisi
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TechnicianStatusBadge } from '@/components/admin/technician-status-badge';
import { ACareColors } from '@/constants/theme';
import { Technician } from '@/types/acare';

interface TechnicianCardProps {
  technician: Technician;
  activeOrdersCount?: number;
  onPress?: (technician: Technician) => void;
}

export function TechnicianCard({
  technician,
  activeOrdersCount = 0,
  onPress,
}: TechnicianCardProps) {
  const initial = technician.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress?.(technician)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Teknisi ${technician.name}, status ${technician.status}, spesialisasi ${technician.specialization}`}>
      {/* ── Baris Atas: Avatar, Nama, ID & Status ──────────────────────────── */}
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.nameWrap}>
          <View style={styles.nameHeaderRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {technician.name}
            </Text>
          </View>
          <Text style={styles.idText}>{technician.id}</Text>
        </View>

        <TechnicianStatusBadge status={technician.status} />
      </View>

      {/* ── Spesialisasi ────────────────────────────────────────────────────── */}
      <View style={styles.specWrap}>
        <Text style={styles.specIcon}>🔧</Text>
        <Text style={styles.specText} numberOfLines={1}>
          {technician.specialization}
        </Text>
      </View>

      {/* ── Info Baris Kontak & Statistik ──────────────────────────────────── */}
      <View style={styles.statsRow}>
        {/* Rating */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Rating</Text>
          <Text style={styles.statValue}>⭐ {technician.rating.toFixed(1)}</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Pekerjaan Selesai */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Selesai</Text>
          <Text style={styles.statValue}>{technician.completedJobs} Job</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Pesanan Aktif */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Aktif Saat Ini</Text>
          <Text
            style={[
              styles.statValue,
              activeOrdersCount > 0 && { color: ACareColors.primary, fontWeight: '800' },
            ]}>
            {activeOrdersCount} Order
          </Text>
        </View>
      </View>

      {/* ── Garis Pemisah ──────────────────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Baris Bawah: Telepon & Aksi ─────────────────────────────────────── */}
      <View style={styles.bottomRow}>
        <View style={styles.phoneWrap}>
          <Text style={styles.phoneIcon}>📞</Text>
          <Text style={styles.phoneText}>{technician.phone}</Text>
        </View>

        <View style={styles.detailLinkWrap}>
          <Text style={styles.detailLinkText}>Detail Teknisi →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  nameWrap: {
    flex: 1,
    gap: 2,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
    letterSpacing: -0.2,
  },
  idText: {
    fontSize: 11,
    fontWeight: '600',
    color: ACareColors.slate400,
  },
  specWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ACareColors.slate50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  specIcon: {
    fontSize: 13,
  },
  specText: {
    fontSize: 12,
    color: ACareColors.slate700,
    fontWeight: '500',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: ACareColors.slate400,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: ACareColors.slate800,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: ACareColors.slate200,
  },
  divider: {
    height: 1,
    backgroundColor: ACareColors.slate100,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneIcon: {
    fontSize: 12,
  },
  phoneText: {
    fontSize: 12,
    color: ACareColors.slate600,
    fontWeight: '600',
  },
  detailLinkWrap: {
    backgroundColor: ACareColors.slate50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.primary,
  },
});
