/**
 * Technician Order Detail Screen — Halaman rincian pesanan untuk teknisi ACare.
 *
 * Menampilkan:
 *  - Header dengan tombol kembali & badge peran TECHNICIAN
 *  - Status badge pesanan saat ini
 *  - Rincian layanan, jadwal, lokasi, customer, keluhan, dan pembayaran
 *  - Kontrol pembaruan status FORWARD-ONLY + catatan kerja opsional
 *  - Perilaku hanya untuk pesanan yang DITUGASKAN kepada teknisi aktif
 *
 * Aturan akses:
 *  - Order dengan `order.technicianId !== currentTechnician.id` → mode read-only
 *    "bukan tugas Anda", tanpa kontrol pembaruan status.
 *  - Transisi status yang diizinkan:
 *      Dikonfirmasi → Teknisi Menuju Lokasi → Sedang Dikerjakan → Selesai
 *  - Tidak ada status mundur dan tidak ada pembatalan dari sisi teknisi.
 *  - Catatan kerja diteruskan ke `updateOrderStatus(orderId, status, notes?)`
 *    hanya jika tidak kosong; jika kosong, `undefined` dikirim agar catatan lama
 *    tetap dipertahankan (sesuai perilaku fungsi yang sudah ada).
 */

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${monthNames[monthIdx] ?? ''} ${year}`;
}

const SERVICE_EMOJIS: Record<string, string> = {
  'Cuci AC': '❄️',
  'Servis AC': '🔧',
  'Isi Freon': '🌡️',
  'Perbaikan AC': '⚡',
  'Bongkar/Pasang AC': '🔄',
};

/**
 * Transisi status yang diperbolehkan untuk teknisi (maju satu langkah).
 * Status terminal (Selesai / Dibatalkan) dan status awal tanpa aksi
 * (Menunggu Konfirmasi) tidak memiliki entri → tidak ada kontrol pembaruan.
 */
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  'Dikonfirmasi': 'Teknisi Menuju Lokasi',
  'Teknisi Menuju Lokasi': 'Sedang Dikerjakan',
  'Sedang Dikerjakan': 'Selesai',
};

export default function TechnicianOrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { orders, currentTechnician, updateOrderStatus } = useACare();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isErrorFeedback, setIsErrorFeedback] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const order = useMemo(() => {
    return orders.find((o) => o.id === orderId);
  }, [orders, orderId]);

  // ── Verifikasi penugasan: hanya teknisi yang ditugaskan boleh ubah status ──
  const isAssignedToMe = useMemo(() => {
    if (!order || !currentTechnician) return false;
    return order.technicianId === currentTechnician.id;
  }, [order, currentTechnician]);

  const nextStatus =
    order && isAssignedToMe ? NEXT_STATUS[order.status] : undefined;

  function handleUpdateStatus() {
    if (!order || !nextStatus || !isAssignedToMe) {
      setIsErrorFeedback(true);
      setFeedbackMessage(
        'Pembaruan status ditolak. Pesanan ini tidak ditugaskan kepada Anda.'
      );
      scheduleClearFeedback();
      return;
    }

    const note = statusNote.trim();
    updateOrderStatus(order.id, nextStatus, note.length > 0 ? note : undefined);

    setIsErrorFeedback(false);
    setFeedbackMessage(
      `Status pesanan berhasil diperbarui menjadi "${nextStatus}".`
    );
    setStatusNote('');
    scheduleClearFeedback();
  }

  function scheduleClearFeedback() {
    setTimeout(() => {
      setFeedbackMessage(null);
      setIsErrorFeedback(false);
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
          Pesanan dengan nomor ID &quot;{orderId ?? '-'}&quot; tidak ditemukan
          dalam sistem ACare.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Dashboard Teknisi">
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const emoji = SERVICE_EMOJIS[order.serviceType] ?? '🛠️';
  const unitPrice =
    order.acUnitsCount > 0 ? order.price / order.acUnitsCount : order.price;

  return (
    <View style={styles.container}>
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Dashboard Teknisi">
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.badgeRow}>
            <View style={styles.technicianBadge}>
              <Text style={styles.technicianBadgeDot}>●</Text>
              <Text style={styles.technicianBadgeText}>TEKNISI</Text>
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Feedback Banner ───────────────────────────────────────────────── */}
        {feedbackMessage && (
          <View
            style={[
              styles.feedbackBanner,
              isErrorFeedback ? styles.feedbackBannerError : null,
            ]}>
            <Text style={styles.feedbackIcon}>{isErrorFeedback ? '✕' : '✓'}</Text>
            <Text
              style={[
                styles.feedbackText,
                isErrorFeedback ? styles.feedbackTextError : null,
              ]}>
              {feedbackMessage}
            </Text>
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

        {/* ── Pembaruan Status (hanya untuk pesanan milik teknisi aktif) ─────── */}
        {isAssignedToMe && nextStatus ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Perbarui Status Pengerjaan</Text>
            <Text style={styles.sectionSubtitle}>
              Langkah berikutnya: ubah status pesanan dari &quot;
              {order.status}&quot; menjadi &quot;{nextStatus}&quot;.
            </Text>

            <View style={styles.nextStatusBox}>
              <Text style={styles.nextStatusLabel}>Status Selanjutnya</Text>
              <Text style={styles.nextStatusValue}>{nextStatus}</Text>
            </View>

            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>Catatan Kerja (opsional)</Text>
              <TextInput
                style={styles.noteInput}
                value={statusNote}
                onChangeText={setStatusNote}
                placeholder="Contoh: AC telah dicuci bersih, tekanan freon normal..."
                placeholderTextColor={ACareColors.slate400}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={styles.noteHint}>
                {order.status !== 'Selesai' &&
                nextStatus !== 'Selesai' ? (
                  'Catatan akan ditambahkan ke rincian pesanan.'
                ) : null}
                {nextStatus === 'Selesai'
                  ? 'Menyelesaikan pesanan akan otomatis menetapkan pembayaran menjadi Lunas.'
                  : null}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.updateBtn}
              activeOpacity={0.8}
              onPress={handleUpdateStatus}
              accessibilityRole="button"
              accessibilityLabel={`Ubah status menjadi ${nextStatus}`}>
              <Text style={styles.updateBtnText}>
                {nextStatus === 'Selesai'
                  ? '✓ Tandai Selesai'
                  : `→ Ubah ke "${nextStatus}"`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pembaruan Status</Text>
            {!isAssignedToMe ? (
              <View style={styles.notAssignedBox}>
                <Text style={styles.notAssignedIcon}>🔒</Text>
                <Text style={styles.notAssignedTitle}>
                  Pesanan ini bukan tugas Anda
                </Text>
                <Text style={styles.notAssignedSub}>
                  Anda tidak dapat mengubah status pesanan yang tidak
                  ditugaskan kepada Anda.
                </Text>
              </View>
            ) : order.status === 'Menunggu Konfirmasi' ? (
              <View style={styles.notAssignedBox}>
                <Text style={styles.notAssignedIcon}>⏳</Text>
                <Text style={styles.notAssignedTitle}>
                  Menunggu Konfirmasi Admin
                </Text>
                <Text style={styles.notAssignedSub}>
                  Pesanan belum dikonfirmasi. Pembaruan status dapat dilakukan
                  setelah status berubah menjadi &quot;Dikonfirmasi&quot;.
                </Text>
              </View>
            ) : (
              <View style={styles.notAssignedBox}>
                <Text style={styles.notAssignedIcon}>🏁</Text>
                <Text style={styles.notAssignedTitle}>
                  Pesanan telah {order.status.toLowerCase()}
                </Text>
                <Text style={styles.notAssignedSub}>
                  Tidak ada langkah pembaruan status berikutnya untuk pesanan
                  ini.
                </Text>
              </View>
            )}
          </View>
        )}

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

        {/* ── 6. Catatan Teknisi ────────────────────────────────────────────── */}
        {order.technicianNotes ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Catatan Pengerjaan</Text>
            <View style={styles.techNotesWrap}>
              <Text style={styles.techNotesText}>{order.technicianNotes}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Tombol Kembali ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.backBottomBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Dashboard Teknisi">
          <Text style={styles.backBottomBtnText}>← Kembali ke Dashboard</Text>
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
  technicianBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.slate900,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  technicianBadgeDot: {
    fontSize: 7,
    color: '#FB923C',
  },
  technicianBadgeText: {
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
  feedbackBannerError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
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
  feedbackTextError: {
    color: '#B91C1C',
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

  // ── Next Status Box ─────────────────────────────────────────────────────────
  nextStatusBox: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  nextStatusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: ACareColors.slate500,
    marginBottom: 2,
  },
  nextStatusValue: {
    fontSize: 15,
    fontWeight: '800',
    color: ACareColors.primaryDark,
  },

  // ── Note Section ────────────────────────────────────────────────────────────
  noteSection: {
    marginBottom: 12,
    gap: 6,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  noteInput: {
    backgroundColor: ACareColors.slate50,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: ACareColors.slate900,
    minHeight: 72,
  },
  noteHint: {
    fontSize: 11,
    color: ACareColors.slate400,
    lineHeight: 15,
  },

  // ── Update Button ───────────────────────────────────────────────────────────
  updateBtn: {
    backgroundColor: ACareColors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.white,
  },

  // ── Not Assigned / Terminal Box ─────────────────────────────────────────────
  notAssignedBox: {
    backgroundColor: ACareColors.slate50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderStyle: 'dashed',
    gap: 4,
  },
  notAssignedIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  notAssignedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.slate700,
    textAlign: 'center',
  },
  notAssignedSub: {
    fontSize: 11,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 16,
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

  // ── Technician Notes ────────────────────────────────────────────────────────
  techNotesWrap: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
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