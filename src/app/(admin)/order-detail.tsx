/**
 * Admin Order Detail Screen — Halaman rincian pesanan dari sudut pandang Admin ACare.
 *
 * Fitur:
 *  - Header bar dengan tombol kembali & badge peran ADMIN
 *  - Status badge pesanan saat ini
 *  - Fitur Ubah Status Pesanan menggunakan updateOrderStatus dari ACareContext
 *  - Feedback konfirmasi saat status pesanan berhasil diperbarui
 *  - Rincian lengkap pesanan: layanan, unit, harga satuan & total, tanggal & waktu
 *  - Rincian customer: nama, email, no HP, alamat lengkap & patokan
 *  - Rincian keluhan customer
 *  - Rincian pembayaran: metode & status pembayaran
 *  - Informasi teknisi (atau status belum ditugaskan) & catatan teknisi
 *
 * Mengambil data dari ACareContext via useACare().orders dan technicians.
 */

import React, { useMemo, useState } from 'react';
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
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const year = parts[0];
  const month = monthNames[parseInt(parts[1], 10) - 1] ?? '';
  const day = parseInt(parts[2], 10);
  return `${day} ${month} ${year}`;
}

const ALL_STATUSES: OrderStatus[] = [
  'Menunggu Konfirmasi',
  'Dikonfirmasi',
  'Teknisi Menuju Lokasi',
  'Sedang Dikerjakan',
  'Selesai',
  'Dibatalkan',
];

const SERVICE_EMOJIS: Record<string, string> = {
  'Cuci AC': '❄️',
  'Servis AC': '🔧',
  'Isi Freon': '🌡️',
  'Perbaikan AC': '⚡',
  'Bongkar/Pasang AC': '🔄',
};

export default function AdminOrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { orders, technicians, customers, updateOrderStatus } = useACare();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Ambil data order dari context
  const order = useMemo(() => {
    return orders.find((o) => o.id === orderId);
  }, [orders, orderId]);

  // Cari data customer lengkap jika ada di customers
  const customerDetail = useMemo(() => {
    if (!order) return null;
    return customers.find((c) => c.id === order.customerId);
  }, [customers, order]);

  // Cari data teknisi jika ada
  const assignedTech = useMemo(() => {
    if (!order?.technicianId) return null;
    return technicians.find((t) => t.id === order.technicianId);
  }, [technicians, order?.technicianId]);

  function handleStatusChange(newStatus: OrderStatus) {
    if (!order) return;
    if (order.status === newStatus) return;

    // Panggil fungsi updateOrderStatus resmi dari ACareContext
    updateOrderStatus(order.id, newStatus);

    setFeedbackMessage(
      `Status pesanan berhasil diperbarui menjadi "${newStatus}".`
    );

    // Hilangkan pesan feedback setelah beberapa detik
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  }

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
          Pesanan dengan nomor ID &quot;{orderId ?? '-'}&quot; tidak ditemukan dalam sistem ACare.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Manajemen Pesanan">
          <Text style={styles.backBtnText}>← Kembali ke Manajemen Pesanan</Text>
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
          accessibilityLabel="Kembali ke Manajemen Pesanan">
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.badgeRow}>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeDot}>●</Text>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>
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

        {/* ── Feedback Banner ───────────────────────────────────────────────── */}
        {feedbackMessage && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackIcon}>✓</Text>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {/* ── Status Saat Ini ───────────────────────────────────────────────── */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardTop}>
            <View>
              <Text style={styles.statusCardLabel}>Status Pesanan Saat Ini</Text>
              <Text style={styles.statusOrderId}>{order.id}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Waktu Masuk Pesanan:</Text>
            <Text style={styles.metaValue}>{order.createdAt}</Text>
          </View>
        </View>

        {/* ── Update Status Pesanan (Fitur Utama Admin) ──────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ubah Status Pesanan</Text>
          <Text style={styles.sectionSubtitle}>
            Pilih status baru untuk memperbarui kondisi pengerjaan pesanan secara langsung di sistem
          </Text>

          <View style={styles.statusOptionsWrap}>
            {ALL_STATUSES.map((statusItem) => {
              const isCurrent = order.status === statusItem;
              return (
                <TouchableOpacity
                  key={statusItem}
                  style={[
                    styles.statusOptionChip,
                    isCurrent && styles.statusOptionChipActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleStatusChange(statusItem)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ubah status menjadi ${statusItem}`}>
                  <Text
                    style={[
                      styles.statusOptionRadio,
                      isCurrent && styles.statusOptionRadioActive,
                    ]}>
                    {isCurrent ? '●' : '○'}
                  </Text>
                  <Text
                    style={[
                      styles.statusOptionText,
                      isCurrent && styles.statusOptionTextActive,
                    ]}>
                    {statusItem}
                  </Text>
                  {isCurrent && (
                    <Text style={styles.currentTag}>Aktif</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 1. Informasi Layanan & Biaya ──────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informasi Layanan & Biaya</Text>

          <View style={styles.serviceRow}>
            <Text style={styles.serviceEmoji}>{emoji}</Text>
            <View style={styles.serviceTextWrap}>
              <Text style={styles.serviceName}>{order.serviceType}</Text>
              <Text style={styles.serviceUnits}>
                {order.acUnitsCount} Unit AC • {formatRupiah(unitPrice)}/unit
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Harga Satuan</Text>
            <Text style={styles.infoVal}>{formatRupiah(unitPrice)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Jumlah Unit</Text>
            <Text style={styles.infoVal}>{order.acUnitsCount} Unit</Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.infoRow, { marginTop: 4 }]}>
            <Text style={styles.totalPriceKey}>Total Biaya</Text>
            <Text style={styles.totalPriceVal}>{formatRupiah(order.price)}</Text>
          </View>
        </View>

        {/* ── 2. Jadwal Layanan ─────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Jadwal Layanan</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Tanggal Pelaksanaan</Text>
            <Text style={styles.infoValHighlight}>
              📅 {formatDisplayDate(order.date)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Slot Waktu</Text>
            <Text style={styles.infoValHighlight}>⏰ {order.time}</Text>
          </View>
        </View>

        {/* ── 3. Data Customer ──────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Pelanggan</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Nama Pelanggan</Text>
            <Text style={styles.infoValBold}>{order.customerName}</Text>
          </View>

          {customerDetail?.email ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Email</Text>
              <Text style={styles.infoVal}>{customerDetail.email}</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>No. Telepon / WhatsApp</Text>
            <Text style={styles.infoVal}>{order.customerPhone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.blockRow}>
            <Text style={styles.infoKey}>Alamat Lokasi Servis:</Text>
            <Text style={styles.addressText}>{order.address}</Text>
          </View>

          {order.addressNote ? (
            <View style={[styles.blockRow, { marginTop: 8 }]}>
              <Text style={styles.infoKey}>Patokan / Catatan Alamat:</Text>
              <Text style={styles.addressNoteText}>📍 {order.addressNote}</Text>
            </View>
          ) : null}
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

        {/* ── 5. Informasi Pembayaran ───────────────────────────────────────── */}
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

        {/* ── 6. Data Teknisi ───────────────────────────────────────────────── */}
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
                      ⭐ {assignedTech.rating} • {assignedTech.completedJobs} Selesai
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
                Belum ada teknisi yang di-assign untuk pesanan ini.
              </Text>
            </View>
          )}

          {/* Catatan Teknisi/Admin jika ada */}
          {order.technicianNotes ? (
            <View style={styles.techNotesWrap}>
              <Text style={styles.techNotesLabel}>Catatan Teknisi / Admin:</Text>
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
          accessibilityLabel="Kembali ke Manajemen Pesanan">
          <Text style={styles.backBottomBtnText}>
            ← Kembali ke Manajemen Pesanan
          </Text>
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
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.slate900,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  adminBadgeDot: {
    fontSize: 7,
    color: '#38BDF8',
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: ACareColors.white,
    letterSpacing: 0.8,
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
  },

  // ── Feedback Banner ─────────────────────────────────────────────────────────
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  feedbackIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: '#047857',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
    flex: 1,
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
  },
  statusCardLabel: {
    fontSize: 11,
    color: ACareColors.slate400,
    fontWeight: '600',
  },
  statusOrderId: {
    fontSize: 16,
    fontWeight: '800',
    color: ACareColors.slate900,
    marginTop: 2,
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    marginBottom: 12,
    lineHeight: 16,
  },

  // ── Status Options Wrap ─────────────────────────────────────────────────────
  statusOptionsWrap: {
    gap: 8,
  },
  statusOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: ACareColors.slate50,
    borderWidth: 1.5,
    borderColor: ACareColors.slate200,
  },
  statusOptionChipActive: {
    backgroundColor: '#F0F9FF',
    borderColor: ACareColors.primary,
  },
  statusOptionRadio: {
    fontSize: 16,
    color: ACareColors.slate400,
  },
  statusOptionRadioActive: {
    color: ACareColors.primary,
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate700,
    flex: 1,
  },
  statusOptionTextActive: {
    color: ACareColors.primaryDark,
    fontWeight: '700',
  },
  currentTag: {
    fontSize: 10,
    fontWeight: '700',
    color: ACareColors.primary,
    backgroundColor: ACareColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
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

  // ── Info Rows ───────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  blockRow: {
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
  divider: {
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

  // ── Payment Status ──────────────────────────────────────────────────────────
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
  backBtn: {
    backgroundColor: ACareColors.primary,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 24,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.white,
  },
});
