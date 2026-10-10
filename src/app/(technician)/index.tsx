/**
 * Technician Dashboard Screen — Halaman ringkasan pekerjaan teknisi ACare.
 *
 * Menampilkan:
 *  - Header dengan badge peran TECHNICIAN & menu akun
 *  - Summary Cards pesanan yang DITUGASKAN kepada teknisi aktif:
 *      1. Total Ditugaskan
 *      2. Sedang Berjalan (Dikonfirmasi + Teknisi Menuju Lokasi + Sedang Dikerjakan)
 *      3. Selesai
 *      4. Dibatalkan
 *  - Daftar pesanan yang ditugaskan (AdminOrderCard) dengan navigasi ke detail
 *  - Empty state informatif jika tidak ada pesanan ditugaskan
 *
 * Hanya menampilkan pesanan yang `order.technicianId === currentTechnician.id`.
 * Seluruh data berasal dari ACareContext (in-memory, sinkron).
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
import { useRouter } from 'expo-router';

import { AccountMenuButton } from '@/components/account-menu-button';
import { AdminOrderCard } from '@/components/admin/admin-order-card';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Order } from '@/types/acare';

export default function TechnicianDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, currentTechnician } = useACare();

  // ── Pesanan yang ditugaskan ke teknisi aktif ────────────────────────────────
  const assignedOrders = useMemo(() => {
    if (!currentTechnician) return [];
    return orders.filter((o) => o.technicianId === currentTechnician.id);
  }, [orders, currentTechnician]);

  const inProgressCount = useMemo(() => {
    return assignedOrders.filter(
      (o) =>
        o.status === 'Dikonfirmasi' ||
        o.status === 'Teknisi Menuju Lokasi' ||
        o.status === 'Sedang Dikerjakan'
    ).length;
  }, [assignedOrders]);

  const completedCount = useMemo(() => {
    return assignedOrders.filter((o) => o.status === 'Selesai').length;
  }, [assignedOrders]);

  const cancelledCount = useMemo(() => {
    return assignedOrders.filter((o) => o.status === 'Dibatalkan').length;
  }, [assignedOrders]);

  function handleOrderPress(order: Order) {
    router.push({
      pathname: '/(technician)/order-detail',
      params: { orderId: order.id },
    });
  }

  if (!currentTechnician) {
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
        <Text style={styles.emptyTechnicianIcon}>👷</Text>
        <Text style={styles.emptyTechnicianTitle}>Teknisi belum dipilih</Text>
        <Text style={styles.emptyTechnicianDesc}>
          Pilih identitas teknisi melalui pemilihan peran sebelum mengakses
          dashboard teknisi.
        </Text>
        <TouchableOpacity
          style={styles.exitBtn}
          activeOpacity={0.8}
          onPress={() => router.replace('/role-select')}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke pemilihan peran">
          <Text style={styles.exitBtnText}>← Pilih Peran</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = currentTechnician.name.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
        },
      ]}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.badgeRow}>
            <View style={styles.technicianRoleBadge}>
              <Text style={styles.technicianRoleBadgeDot}>●</Text>
              <Text style={styles.technicianRoleBadgeText}>TEKNISI</Text>
            </View>
            <View style={styles.headerActions}>
              <AccountMenuButton
                initial={initial}
                size={40}
                accessibilityLabel="Menu akun teknisi"
              />
            </View>
          </View>

          <Text style={styles.headerTitle}>Dashboard Teknisi</Text>
          <Text style={styles.headerSubtitle}>
            {currentTechnician.name} • {assignedOrders.length} pesanan ditugaskan
          </Text>
        </View>
      </View>

      {/* ── Section: Ringkasan Pesanan ────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ringkasan Pesanan Saya</Text>
        <Text style={styles.sectionSubtitle}>
          Pesanan yang ditugaskan kepada {currentTechnician.name}
        </Text>

        <View style={styles.statsGridRow}>
          <AdminStatCard
            title="Total Ditugaskan"
            value={assignedOrders.length}
            icon="📋"
            accentColor={ACareColors.slate900}
            subtitle="Seluruh pesanan saya"
            accessibilityLabel={`Total ditugaskan: ${assignedOrders.length}`}
          />
          <AdminStatCard
            title="Sedang Berjalan"
            value={inProgressCount}
            icon="⚡"
            accentColor={ACareColors.primary}
            badgeBg="#E0F2FE"
            subtitle="Dikonfirmasi & di lapangan"
            accessibilityLabel={`Sedang berjalan: ${inProgressCount}`}
          />
        </View>

        <View style={styles.statsGridRow}>
          <AdminStatCard
            title="Selesai"
            value={completedCount}
            icon="✓"
            accentColor="#059669"
            badgeBg="#D1FAE5"
            subtitle="Pekerjaan tuntas"
            accessibilityLabel={`Selesai: ${completedCount}`}
          />
          <AdminStatCard
            title="Dibatalkan"
            value={cancelledCount}
            icon="✕"
            accentColor="#DC2626"
            badgeBg="#FEE2E2"
            subtitle="Pesanan dibatalkan"
            accessibilityLabel={`Dibatalkan: ${cancelledCount}`}
          />
        </View>
      </View>

      {/* ── Section: Pesanan Ditugaskan ───────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pesanan Ditugaskan</Text>
        <Text style={styles.sectionSubtitle}>
          Ketuk pesanan untuk melihat detail dan memperbarui status
        </Text>

        {assignedOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Belum ada pesanan ditugaskan</Text>
            <Text style={styles.emptySubtitle}>
              Pesanan yang ditugaskan kepada Anda oleh admin akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {assignedOrders.map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onPress={handleOrderPress}
              />
            ))}
          </View>
        )}
      </View>

    </ScrollView>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACareColors.slate50,
  },
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 4,
  },
  headerTitleWrap: {
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  technicianRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.slate900,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  technicianRoleBadgeDot: {
    fontSize: 8,
    color: '#FB923C',
  },
  technicianRoleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: ACareColors.white,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: ACareColors.slate900,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: ACareColors.slate500,
  },

  // ── Section ─────────────────────────────────────────────────────────────────
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    marginBottom: 4,
  },

  // ── Stats Grid ──────────────────────────────────────────────────────────────
  statsGridRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },

  // ── Orders List ─────────────────────────────────────────────────────────────
  ordersList: {
    gap: 0,
  },

  // ── Empty State ─────────────────────────────────────────────────────────────
  emptyState: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACareColors.slate800,
  },
  emptySubtitle: {
    fontSize: 12,
    color: ACareColors.slate400,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── No Technician Fallback ──────────────────────────────────────────────────
  emptyTechnicianIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTechnicianTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
    marginBottom: 6,
  },
  emptyTechnicianDesc: {
    fontSize: 13,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  exitBtn: {
    backgroundColor: ACareColors.primary,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 24,
  },
  exitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.white,
  },
});