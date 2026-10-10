/**
 * CustomerCard — Komponen kartu ringkasan pelanggan untuk halaman daftar Customer Admin.
 *
 * Menampilkan:
 *  - Avatar inisial pelanggan
 *  - Nama lengkap & ID pelanggan
 *  - Alamat email
 *  - No. telepon / WhatsApp
 *  - Alamat utama servis
 *  - Jumlah pesanan pelanggan di sistem
 *  - Tombol aksi / link ke detail pelanggan
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ACareColors } from '@/constants/theme';
import { CustomerUser } from '@/types/acare';

interface CustomerCardProps {
  customer: CustomerUser;
  ordersCount?: number;
  onPress?: (customer: CustomerUser) => void;
}

export function CustomerCard({
  customer,
  ordersCount = 0,
  onPress,
}: CustomerCardProps) {
  const initial = customer.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress?.(customer)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Pelanggan ${customer.name}, ${ordersCount} pesanan`}>
      {/* ── Baris Atas: Avatar, Nama, ID ──────────────────────────────────── */}
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.nameWrap}>
          <Text style={styles.nameText} numberOfLines={1}>
            {customer.name}
          </Text>
          <Text style={styles.idText}>{customer.id}</Text>
        </View>

        <View style={styles.ordersBadge}>
          <Text style={styles.ordersBadgeCount}>{ordersCount}</Text>
          <Text style={styles.ordersBadgeLabel}>Pesanan</Text>
        </View>
      </View>

      {/* ── Info Kontak ────────────────────────────────────────────────────── */}
      <View style={styles.infoWrap}>
        <Text style={styles.infoLine}>✉️ {customer.email}</Text>
        <Text style={styles.infoLine}>📞 {customer.phone}</Text>
        <Text style={styles.infoLine} numberOfLines={1}>
          📍 {customer.address}
        </Text>
      </View>

      {/* ── Garis Pemisah ──────────────────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Baris Bawah: Aksi ──────────────────────────────────────────────── */}
      <View style={styles.bottomRow}>
        <Text style={styles.bottomHint}>Lihat riwayat &amp; detail pelanggan</Text>
        <View style={styles.detailLinkWrap}>
          <Text style={styles.detailLinkText}>Detail Customer →</Text>
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
  ordersBadge: {
    alignItems: 'center',
    backgroundColor: ACareColors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ordersBadgeCount: {
    fontSize: 14,
    fontWeight: '800',
    color: ACareColors.primaryDark,
  },
  ordersBadgeLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: ACareColors.primaryDark,
  },
  infoWrap: {
    gap: 4,
    backgroundColor: ACareColors.slate50,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoLine: {
    fontSize: 12,
    color: ACareColors.slate600,
    fontWeight: '500',
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
    gap: 8,
  },
  bottomHint: {
    fontSize: 11,
    color: ACareColors.slate400,
    flex: 1,
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
