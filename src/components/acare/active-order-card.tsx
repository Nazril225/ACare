/**
 * ActiveOrderCard — Card pesanan aktif untuk section "Pesanan Aktif" di Home Customer.
 * Menampilkan ringkasan order: layanan, tanggal, waktu, alamat, dan status.
 * Menggunakan warna status dari ACareColors.status.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ACareColors } from '@/constants/theme';
import { Order } from '@/types/acare';

import { StatusBadge } from './status-badge';

interface ActiveOrderCardProps {
  order: Order;
  onPress?: (order: Order) => void;
}

/** Format tanggal "YYYY-MM-DD" → "6 Okt 2026" */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  return `${day} ${monthNames[month - 1]} ${year}`;
}

/** Potong alamat agar tidak terlalu panjang. */
function truncateAddress(address: string, maxLen = 45): string {
  return address.length > maxLen ? `${address.slice(0, maxLen)}…` : address;
}

export function ActiveOrderCard({ order, onPress }: ActiveOrderCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress?.(order)}
      accessibilityRole="button"
      accessibilityLabel={`Pesanan ${order.serviceType}, status ${order.status}`}>

      {/* ── Baris atas: ID + StatusBadge ────────────────── */}
      <View style={styles.topRow}>
        <Text style={styles.orderId}>{order.id}</Text>
        <StatusBadge status={order.status} />
      </View>

      {/* ── Nama layanan ─────────────────────────────────── */}
      <Text style={styles.serviceName}>{order.serviceType}</Text>

      {/* ── Detail: tanggal, waktu, alamat ───────────────── */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            {formatDate(order.date)} • {order.time}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText} numberOfLines={2}>
            {truncateAddress(order.address)}
          </Text>
        </View>

        {order.technicianName ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👷</Text>
            <Text style={styles.detailText}>{order.technicianName}</Text>
          </View>
        ) : null}
      </View>

      {/* ── Footer: harga ────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.priceLabel}>Total</Text>
        <Text style={styles.priceValue}>
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(order.price)}
        </Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: ACareColors.slate100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  orderId: {
    fontSize: 11,
    color: ACareColors.slate400,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: ACareColors.slate900,
    marginBottom: 12,
  },
  detailsContainer: {
    gap: 6,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailIcon: {
    fontSize: 13,
    lineHeight: 18,
  },
  detailText: {
    fontSize: 13,
    color: ACareColors.slate600,
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ACareColors.slate100,
  },
  priceLabel: {
    fontSize: 12,
    color: ACareColors.slate400,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.primary,
  },
});
