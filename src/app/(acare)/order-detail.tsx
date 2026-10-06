/**
 * Order Detail Screen — Halaman rincian pesanan layanan AC pelanggan.
 *
 * Menampilkan:
 *  - Header dengan tombol kembali & nomor pesanan
 *  - Status badge & keterangan progres
 *  - Rincian layanan & harga per unit / total
 *  - Jadwal kedatangan teknisi
 *  - Alamat & patokan lokasi
 *  - Keluhan customer
 *  - Rincian pembayaran (metode & status bayar)
 *  - Informasi teknisi yang ditugaskan (atau status belum ditugaskan)
 *  - Catatan teknisi jika ada
 *
 * Mengambil data dari ACareContext via useACare().getOrderById(orderId) atau useACare().orders.
 */

import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StatusBadge } from '@/components/acare/status-badge';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { OrderStatus } from '@/types/acare';

// ─── Helper Format ────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${day} ${monthNames[monthIdx] ?? ''} ${year}`;
}

const SERVICE_EMOJIS: Record<string, string> = {
  'Cuci AC': '❄️',
  'Servis AC': '🔧',
  'Isi Freon': '🌡️',
  'Perbaikan AC': '⚡',
  'Bongkar/Pasang AC': '🔄',
};

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  'Menunggu Konfirmasi':
    'Pesanan telah diterima dan sedang menunggu konfirmasi admin/teknisi.',
  'Dikonfirmasi':
    'Pesanan telah dikonfirmasi dan jadwal teknisi telah ditetapkan.',
  'Teknisi Menuju Lokasi':
    'Teknisi sedang dalam perjalanan menuju alamat lokasi servis Anda.',
  'Sedang Dikerjakan':
    'Teknisi sedang melakukan tindakan pengerjaan servis AC di lokasi Anda.',
  'Selesai':
    'Pekerjaan servis AC telah selesai dilaksanakan dengan baik.',
  'Dibatalkan':
    'Pesanan servis AC telah dibatalkan.',
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { orders, technicians } = useACare();

  // Ambil order berdasarkan ID dari context
  const order = useMemo(() => {
    return orders.find((o) => o.id === orderId);
  }, [orders, orderId]);

  // Cari data teknisi jika ada
  const assignedTech = useMemo(() => {
    if (!order?.technicianId) return null;
    return technicians.find((t) => t.id === order.technicianId);
  }, [technicians, order?.technicianId]);

  // Jika order tidak ditemukan
  if (!order) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          },
        ]}>
        <Text style={styles.notFoundIcon}>🔍</Text>
        <Text style={styles.notFoundTitle}>Pesanan Tidak Ditemukan</Text>
        <Text style={styles.notFoundDesc}>
          Pesanan dengan nomor ID &quot;{orderId ?? '-'}&quot; tidak ditemukan dalam daftar pesanan Anda.
        </Text>
        <TouchableOpacity
          style={styles.backToOrdersBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke halaman sebelumnya">
          <Text style={styles.backToOrdersBtnText}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const emoji = SERVICE_EMOJIS[order.serviceType] ?? '🛠️';
  const unitPrice = order.acUnitsCount > 0 ? order.price / order.acUnitsCount : order.price;

  return (
    <View style={styles.container}>
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke halaman sebelumnya">
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Detail Pesanan</Text>
          <Text style={styles.headerSubtitle}>{order.id}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Status Card ───────────────────────────────────────────────────── */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardTop}>
            <View>
              <Text style={styles.statusLabel}>Status Pesanan</Text>
              <Text style={styles.orderIdText}>{order.id}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>

          <Text style={styles.statusDesc}>
            {STATUS_DESCRIPTIONS[order.status] ?? ''}
          </Text>

          <View style={styles.statusDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Waktu Pemesanan:</Text>
            <Text style={styles.metaValue}>{order.createdAt}</Text>
          </View>
        </View>

        {/* ── 1. Layanan & Biaya ────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Layanan & Biaya</Text>

          <View style={styles.serviceRow}>
            <Text style={styles.serviceEmoji}>{emoji}</Text>
            <View style={styles.serviceTextWrap}>
              <Text style={styles.serviceName}>{order.serviceType}</Text>
              <Text style={styles.serviceUnits}>
                {order.acUnitsCount} Unit AC • {formatRupiah(unitPrice)}/unit
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Harga Satuan</Text>
            <Text style={styles.infoVal}>{formatRupiah(unitPrice)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Jumlah Unit</Text>
            <Text style={styles.infoVal}>{order.acUnitsCount} Unit</Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={[styles.infoRow, { marginTop: 4 }]}>
            <Text style={styles.totalPriceKey}>Total Biaya</Text>
            <Text style={styles.totalPriceVal}>{formatRupiah(order.price)}</Text>
          </View>
        </View>

        {/* ── 2. Jadwal Layanan ─────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Jadwal Kedatangan</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Tanggal</Text>
            <Text style={styles.infoValHighlight}>
              📅 {formatDisplayDate(order.date)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Waktu / Slot</Text>
            <Text style={styles.infoValHighlight}>⏰ {order.time}</Text>
          </View>
        </View>

        {/* ── 3. Lokasi & Alamat ────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Lokasi Servis</Text>

          <View style={styles.infoRowBlock}>
            <Text style={styles.infoKey}>Alamat Lengkap:</Text>
            <Text style={styles.addressText}>{order.address}</Text>
          </View>

          {order.addressNote ? (
            <View style={[styles.infoRowBlock, { marginTop: 8 }]}>
              <Text style={styles.infoKey}>Patokan / Catatan Alamat:</Text>
              <Text style={styles.addressNoteText}>📍 {order.addressNote}</Text>
            </View>
          ) : null}

          <View style={styles.detailDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Penerima</Text>
            <Text style={styles.infoVal}>{order.customerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>No. Telepon</Text>
            <Text style={styles.infoVal}>{order.customerPhone}</Text>
          </View>
        </View>

        {/* ── 4. Keluhan ────────────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Keluhan / Catatan AC</Text>
          <View style={styles.complaintBox}>
            <Text style={styles.complaintText}>
              &quot;{order.complaints}&quot;
            </Text>
          </View>
        </View>

        {/* ── 5. Pembayaran ─────────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informasi Pembayaran</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Metode Pembayaran</Text>
            <Text style={styles.infoValBold}>{order.paymentMethod}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Status Pembayaran</Text>
            <View
              style={[
                styles.paymentStatusBadge,
                order.paymentStatus === 'Lunas'
                  ? styles.paymentStatusPaid
                  : styles.paymentStatusUnpaid,
              ]}>
              <Text
                style={[
                  styles.paymentStatusText,
                  order.paymentStatus === 'Lunas'
                    ? styles.paymentStatusTextPaid
                    : styles.paymentStatusTextUnpaid,
                ]}>
                {order.paymentStatus === 'Lunas' ? '✓ Lunas' : 'Belum Bayar'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 6. Teknisi ────────────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Teknisi yang Bertugas</Text>

          {order.technicianName ? (
            <View style={styles.techAssignedWrap}>
              <View style={styles.techAvatar}>
                <Text style={styles.techAvatarIcon}>👷</Text>
              </View>

              <View style={styles.techInfo}>
                <Text style={styles.techName}>{order.technicianName}</Text>
                {assignedTech && (
                  <>
                    <Text style={styles.techSpec}>
                      Spesialisasi: {assignedTech.specialization}
                    </Text>
                    <Text style={styles.techRating}>
                      ⭐ {assignedTech.rating} • {assignedTech.completedJobs} Pekerjaan Selesai
                    </Text>
                    <Text style={styles.techPhone}>
                      📞 {assignedTech.phone}
                    </Text>
                  </>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.techUnassignedBox}>
              <Text style={styles.techUnassignedIcon}>⏳</Text>
              <Text style={styles.techUnassignedTitle}>Teknisi belum ditugaskan</Text>
              <Text style={styles.techUnassignedSub}>
                Teknisi akan segera ditugaskan setelah pesanan dikonfirmasi oleh tim ACare.
              </Text>
            </View>
          )}

          {/* Catatan Teknisi jika ada */}
          {order.technicianNotes ? (
            <View style={styles.techNotesWrap}>
              <Text style={styles.techNotesLabel}>Catatan Teknisi:</Text>
              <Text style={styles.techNotesText}>{order.technicianNotes}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Tombol Kembali ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.backBottomBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke daftar pesanan">
          <Text style={styles.backBottomBtnText}>← Kembali ke Daftar Pesanan</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACareColors.slate50,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },

  // ── Header Bar ──────────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: ACareColors.white,
    borderBottomWidth: 1,
    borderBottomColor: ACareColors.slate200,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ACareColors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.primary,
    marginTop: 1,
  },

  // ── Status Card ─────────────────────────────────────────────────────────────
  statusCard: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 11,
    color: ACareColors.slate400,
    fontWeight: '600',
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  statusDesc: {
    fontSize: 13,
    color: ACareColors.slate600,
    lineHeight: 18,
  },
  statusDivider: {
    height: 1,
    backgroundColor: ACareColors.slate100,
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: ACareColors.slate400,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    color: ACareColors.slate600,
  },

  // ── Section Card ────────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
    marginBottom: 12,
  },

  // ── Service Row ─────────────────────────────────────────────────────────────
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  serviceEmoji: {
    fontSize: 28,
  },
  serviceTextWrap: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  serviceUnits: {
    fontSize: 12,
    color: ACareColors.slate500,
    marginTop: 2,
  },

  // ── Rows ────────────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoRowBlock: {
    gap: 4,
  },
  infoKey: {
    fontSize: 13,
    color: ACareColors.slate500,
  },
  infoVal: {
    fontSize: 13,
    color: ACareColors.slate800,
    fontWeight: '500',
  },
  infoValBold: {
    fontSize: 13,
    color: ACareColors.slate900,
    fontWeight: '700',
  },
  infoValHighlight: {
    fontSize: 13,
    color: ACareColors.primary,
    fontWeight: '700',
  },
  detailDivider: {
    height: 1,
    backgroundColor: ACareColors.slate100,
    marginVertical: 8,
  },
  totalPriceKey: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  totalPriceVal: {
    fontSize: 17,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  addressText: {
    fontSize: 13,
    color: ACareColors.slate800,
    lineHeight: 18,
    fontWeight: '500',
  },
  addressNoteText: {
    fontSize: 12,
    color: ACareColors.primary,
    fontWeight: '600',
  },

  // ── Complaint ───────────────────────────────────────────────────────────────
  complaintBox: {
    backgroundColor: ACareColors.slate50,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: ACareColors.primary,
  },
  complaintText: {
    fontSize: 13,
    color: ACareColors.slate700,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // ── Payment Status Badge ────────────────────────────────────────────────────
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paymentStatusPaid: {
    backgroundColor: '#D1FAE5',
  },
  paymentStatusUnpaid: {
    backgroundColor: '#FEF3C7',
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paymentStatusTextPaid: {
    color: '#047857',
  },
  paymentStatusTextUnpaid: {
    color: '#B45309',
  },

  // ── Technician ──────────────────────────────────────────────────────────────
  techAssignedWrap: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  techAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techAvatarIcon: {
    fontSize: 24,
  },
  techInfo: {
    flex: 1,
    gap: 2,
  },
  techName: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  techSpec: {
    fontSize: 12,
    color: ACareColors.slate500,
  },
  techRating: {
    fontSize: 12,
    color: ACareColors.slate600,
    fontWeight: '600',
  },
  techPhone: {
    fontSize: 12,
    color: ACareColors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  techUnassignedBox: {
    backgroundColor: ACareColors.slate50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderStyle: 'dashed',
    gap: 4,
  },
  techUnassignedIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  techUnassignedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  techUnassignedSub: {
    fontSize: 11,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 16,
  },
  techNotesWrap: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  techNotesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 2,
  },
  techNotesText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },

  // ── Bottom Button ───────────────────────────────────────────────────────────
  backBottomBtn: {
    backgroundColor: ACareColors.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate300,
    marginTop: 6,
  },
  backBottomBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate700,
  },

  // ── Not Found ───────────────────────────────────────────────────────────────
  notFoundIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
    marginBottom: 6,
  },
  notFoundDesc: {
    fontSize: 13,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  backToOrdersBtn: {
    backgroundColor: ACareColors.primary,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 24,
  },
  backToOrdersBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.white,
  },
});
