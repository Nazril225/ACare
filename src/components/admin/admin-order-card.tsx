/**
 * AdminOrderCard — Kartu ringkasan pesanan untuk bagian "Pesanan Terbaru" di Admin Dashboard.
 *
 * Menampilkan:
 *  - ID order & StatusBadge
 *  - Nama customer & nomor telepon jika tersedia
 *  - Nama layanan dengan emoji
 *  - Tanggal & waktu pelaksanaan
 *  - Total biaya terformat Rupiah
 *  - Tombol aksi/onPress untuk melihat rincian
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { StatusBadge } from '@/components/acare/status-badge';
import { ACareColors } from '@/constants/theme';
import { Order } from '@/types/acare';

interface AdminOrderCardProps {
  order: Order;
  onPress?: (order: Order) => void;
}

const SERVICE_EMOJIS: Record<string, string> = {
  'Cuci AC': '❄️',
  'Servis AC': '🔧',
  'Isi Freon': '🌡️',
  'Perbaikan AC': '⚡',
  'Bongkar/Pasang AC': '🔄',
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const day = parseInt(parts[2], 10);
  const month = monthNames[parseInt(parts[1], 10) - 1] ?? '';
  const year = parts[0];
  return `${day} ${month} ${year}`;
}

export function AdminOrderCard({ order, onPress }: AdminOrderCardProps) {
  const emoji = SERVICE_EMOJIS[order.serviceType] ?? '🛠️';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress?.(order)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Pesanan ${order.id}, pelanggan ${order.customerName}, layanan ${order.serviceType}, status ${order.status}`}>
      {/* ── Baris Atas: ID & Status ────────────────────────────────────────── */}
      <View style={styles.topRow}>
        <View style={styles.idWrap}>
          <Text style={styles.idText}>{order.id}</Text>
          <Text style={styles.createdAtText}>{order.createdAt}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* ── Informasi Customer & Layanan ───────────────────────────────────── */}
      <View style={styles.middleSection}>
        <View style={styles.customerRow}>
          <Text style={styles.customerIcon}>👤</Text>
          <Text style={styles.customerName} numberOfLines={1}>
            {order.customerName}
          </Text>
        </View>

        <View style={styles.serviceRow}>
          <Text style={styles.serviceEmoji}>{emoji}</Text>
          <Text style={styles.serviceName}>
            {order.serviceType} ({order.acUnitsCount} Unit)
          </Text>
        </View>
      </View>

      {/* ── Baris Jadwal ───────────────────────────────────────────────────── */}
      <View style={styles.scheduleRow}>
        <Text style={styles.scheduleText}>
          📅 {formatDate(order.date)} • ⏰ {order.time}
        </Text>
      </View>

      {/* ── Garis Pemisah ──────────────────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Baris Bawah: Total Biaya & Aksi ────────────────────────────────── */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.totalLabel}>Total Biaya</Text>
          <Text style={styles.totalValue}>{formatRupiah(order.price)}</Text>
        </View>

        <View style={styles.detailLinkWrap}>
          <Text style={styles.detailLinkText}>Lihat Detail →</Text>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  idWrap: {
    gap: 2,
  },
  idText: {
    fontSize: 14,
    fontWeight: '800',
    color: ACareColors.slate900,
    letterSpacing: 0.2,
  },
  createdAtText: {
    fontSize: 11,
    color: ACareColors.slate400,
  },
  middleSection: {
    gap: 6,
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerIcon: {
    fontSize: 13,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate700,
    flex: 1,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceEmoji: {
    fontSize: 14,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  scheduleRow: {
    marginBottom: 10,
  },
  scheduleText: {
    fontSize: 12,
    color: ACareColors.slate600,
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
  totalLabel: {
    fontSize: 11,
    color: ACareColors.slate400,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  detailLinkWrap: {
    backgroundColor: ACareColors.slate50,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
