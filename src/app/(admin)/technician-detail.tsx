/**
 * Admin Technician Detail Screen — Halaman rincian profil & daftar pesanan teknisi ACare.
 *
 * Fitur:
 *  - Header bar dengan tombol kembali & badge peran ADMIN
 *  - Profil lengkap teknisi:
 *      - Nama lengkap, ID teknisi, status ketersediaan (Tersedia / Bertugas / Libur)
 *      - Spesialisasi keahlian
 *      - Rating rata-rata & jumlah pekerjaan selesai (lifetime)
 *      - Nomor telepon / WhatsApp
 *  - Daftar pesanan yang ditugaskan kepada teknisi ini (relasi riil dari context)
 *  - Tombol aksi setiap pesanan menuju detail pesanan (/(admin)/order-detail)
 *  - Penugasan pesanan baru: Admin dapat menugaskan pesanan yang belum memiliki teknisi ke teknisi ini
 *  - Empty state informatif jika belum ada pesanan yang ditugaskan
 *
 * Mengambil data riil dari ACareContext via useACare().
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

import { AdminOrderCard } from '@/components/admin/admin-order-card';
import { TechnicianStatusBadge } from '@/components/admin/technician-status-badge';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Order } from '@/types/acare';

export default function AdminTechnicianDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { technicianId } = useLocalSearchParams<{ technicianId?: string }>();
  const { technicians, orders, assignTechnician } = useACare();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Cari data teknisi dari context
  const technician = useMemo(() => {
    return technicians.find((t) => t.id === technicianId);
  }, [technicians, technicianId]);

  // Pesanan yang ditugaskan ke teknisi ini
  const assignedOrders = useMemo(() => {
    if (!technician) return [];
    return orders.filter((o) => o.technicianId === technician.id);
  }, [orders, technician]);

  // Pesanan aktif yang ditugaskan ke teknisi ini
  const activeAssignedOrders = useMemo(() => {
    return assignedOrders.filter(
      (o) => o.status !== 'Selesai' && o.status !== 'Dibatalkan'
    );
  }, [assignedOrders]);

  // Pesanan selesai oleh teknisi ini
  const completedAssignedOrders = useMemo(() => {
    return assignedOrders.filter((o) => o.status === 'Selesai');
  }, [assignedOrders]);

  // Pesanan yang belum memiliki teknisi (unassigned) untuk opsi penugasan
  const unassignedOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (!o.technicianId || o.technicianId === '') &&
        o.status !== 'Selesai' &&
        o.status !== 'Dibatalkan'
    );
  }, [orders]);

  function handleOrderPress(order: Order) {
    router.push({
      pathname: '/(admin)/order-detail',
      params: { orderId: order.id },
    });
  }

  function handleAssignOrder(orderId: string) {
    if (!technician) return;
    assignTechnician(orderId, technician.id);
    setFeedbackMessage(
      `Pesanan ${orderId} berhasil ditugaskan kepada ${technician.name}.`
    );

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  }

  // Jika teknisi tidak ditemukan
  if (!technician) {
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
        <Text style={styles.notFoundIcon}>👷</Text>
        <Text style={styles.notFoundTitle}>Teknisi Tidak Ditemukan</Text>
        <Text style={styles.notFoundDesc}>
          Data teknisi dengan ID &quot;{technicianId ?? '-'}&quot; tidak ditemukan dalam sistem ACare.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Daftar Teknisi">
          <Text style={styles.backBtnText}>← Kembali ke Daftar Teknisi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = technician.name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Daftar Teknisi">
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.badgeRow}>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeDot}>●</Text>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Detail Teknisi</Text>
          <Text style={styles.headerSubtitle}>{technician.id}</Text>
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

        {/* ── Kartu Profil Utama Teknisi ─────────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{initial}</Text>
            </View>

            <View style={styles.profileTextWrap}>
              <Text style={styles.profileName}>{technician.name}</Text>
              <Text style={styles.profileId}>{technician.id}</Text>
              <View style={styles.statusBadgeWrap}>
                <TechnicianStatusBadge status={technician.status} />
              </View>
            </View>
          </View>

          {/* Spesialisasi */}
          <View style={styles.specBox}>
            <Text style={styles.specBoxLabel}>Spesialisasi Keahlian</Text>
            <Text style={styles.specBoxValue}>🔧 {technician.specialization}</Text>
          </View>

          {/* Grid Statistik */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxIcon}>⭐</Text>
              <Text style={styles.statBoxVal}>{technician.rating.toFixed(1)}</Text>
              <Text style={styles.statBoxLbl}>Rating Rata-rata</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxIcon}>🏆</Text>
              <Text style={styles.statBoxVal}>{technician.completedJobs}</Text>
              <Text style={styles.statBoxLbl}>Pekerjaan Selesai</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxIcon}>⚡</Text>
              <Text style={[styles.statBoxVal, { color: ACareColors.primary }]}>
                {activeAssignedOrders.length}
              </Text>
              <Text style={styles.statBoxLbl}>Pesanan Aktif</Text>
            </View>
          </View>
        </View>

        {/* ── Informasi Kontak ──────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informasi Kontak</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>No. Telepon / WhatsApp</Text>
            <Text style={styles.infoValHighlight}>📞 {technician.phone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Status Ketersediaan</Text>
            <Text style={styles.infoValBold}>{technician.status}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Total Riwayat Pesanan di Sistem</Text>
            <Text style={styles.infoValBold}>
              {assignedOrders.length} Pesanan ({completedAssignedOrders.length} Selesai)
            </Text>
          </View>
        </View>

        {/* ── Penugasan Pesanan Baru (Jika ada unassigned orders) ─────────────── */}
        {unassignedOrders.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionTitle}>Tugaskan Pesanan ke Teknisi Ini</Text>
              <Text style={styles.sectionSubtitle}>
                Terdapat {unassignedOrders.length} pesanan masuk yang belum memiliki teknisi
              </Text>
            </View>

            <View style={styles.unassignedList}>
              {unassignedOrders.map((unOrder) => (
                <View key={unOrder.id} style={styles.unassignedItem}>
                  <View style={styles.unassignedInfo}>
                    <View style={styles.unassignedTop}>
                      <Text style={styles.unassignedId}>{unOrder.id}</Text>
                      <Text style={styles.unassignedService}>
                        {unOrder.serviceType} ({unOrder.acUnitsCount} Unit)
                      </Text>
                    </View>
                    <Text style={styles.unassignedCustomer} numberOfLines={1}>
                      👤 {unOrder.customerName} • 📍 {unOrder.address}
                    </Text>
                    <Text style={styles.unassignedSchedule}>
                      📅 {unOrder.date} • ⏰ {unOrder.time}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.assignBtn}
                    activeOpacity={0.8}
                    onPress={() => handleAssignOrder(unOrder.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Tugaskan pesanan ${unOrder.id} kepada ${technician.name}`}>
                    <Text style={styles.assignBtnText}>+ Tugaskan</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Daftar Pesanan yang Ditugaskan ─────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Pesanan yang Ditugaskan</Text>
              <Text style={styles.sectionSubtitle}>
                Menampilkan seluruh pesanan yang dikerjakan oleh {technician.name}
              </Text>
            </View>
            <View style={styles.orderCountBadge}>
              <Text style={styles.orderCountBadgeText}>
                {assignedOrders.length}
              </Text>
            </View>
          </View>

          {assignedOrders.length === 0 ? (
            <View style={styles.emptyOrdersBox}>
              <Text style={styles.emptyOrdersIcon}>📋</Text>
              <Text style={styles.emptyOrdersTitle}>Belum ada pesanan</Text>
              <Text style={styles.emptyOrdersSub}>
                Belum ada pesanan servis AC yang ditugaskan ke teknisi {technician.name}.
              </Text>
            </View>
          ) : (
            <View style={styles.ordersListWrap}>
              {assignedOrders.map((ord) => (
                <AdminOrderCard
                  key={ord.id}
                  order={ord}
                  onPress={handleOrderPress}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Tombol Kembali ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.backBottomBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Daftar Teknisi">
          <Text style={styles.backBottomBtnText}>
            ← Kembali ke Daftar Teknisi
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

  // ── Profile Card ────────────────────────────────────────────────────────────
  profileCard: {
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
    gap: 12,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  profileTextWrap: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
    letterSpacing: -0.3,
  },
  profileId: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.slate400,
  },
  statusBadgeWrap: {
    marginTop: 2,
  },
  specBox: {
    backgroundColor: ACareColors.slate50,
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: ACareColors.primary,
  },
  specBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: ACareColors.slate400,
    marginBottom: 2,
  },
  specBoxValue: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate800,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate100,
  },
  statBoxIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statBoxVal: {
    fontSize: 15,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  statBoxLbl: {
    fontSize: 9,
    color: ACareColors.slate500,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
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
  sectionHeaderWrap: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    lineHeight: 16,
  },
  orderCountBadge: {
    backgroundColor: ACareColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  orderCountBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: ACareColors.primaryDark,
  },

  // ── Info Row ────────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoKey: {
    fontSize: 13,
    color: ACareColors.slate500,
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

  // ── Unassigned Orders List ──────────────────────────────────────────────────
  unassignedList: {
    gap: 10,
  },
  unassignedItem: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  unassignedInfo: {
    flex: 1,
    gap: 3,
  },
  unassignedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unassignedId: {
    fontSize: 13,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  unassignedService: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.primaryDark,
  },
  unassignedCustomer: {
    fontSize: 11,
    color: ACareColors.slate600,
  },
  unassignedSchedule: {
    fontSize: 11,
    color: ACareColors.slate500,
  },
  assignBtn: {
    backgroundColor: ACareColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  assignBtnText: {
    color: ACareColors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Orders List Wrap ────────────────────────────────────────────────────────
  ordersListWrap: {
    gap: 0,
  },
  emptyOrdersBox: {
    backgroundColor: ACareColors.slate50,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderStyle: 'dashed',
    gap: 4,
  },
  emptyOrdersIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  emptyOrdersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  emptyOrdersSub: {
    fontSize: 11,
    color: ACareColors.slate500,
    textAlign: 'center',
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
