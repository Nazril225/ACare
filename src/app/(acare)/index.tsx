/**
 * Home Customer — Halaman utama aplikasi ACare untuk pelanggan.
 *
 * Bagian:
 *  A. Header  — logo, sapaan, subtitle
 *  B. Hero    — banner utama + tombol "Pesan Layanan"
 *  C. Layanan — horizontal scroll ServiceCard dari data Stage 1
 *  D. Pesanan Aktif — daftar order aktif currentUser dari context
 */

import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ActiveOrderCard } from '@/components/acare/active-order-card';
import { ServiceCard } from '@/components/acare/service-card';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Order, ServiceItem } from '@/types/acare';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const BOTTOM_NAV_HEIGHT = 80; // tinggi estimasi native bottom tab bar

// ─── Komponen ─────────────────────────────────────────────────────────────────

export default function HomeCustomerScreen() {
  const router = useRouter();
  const { currentUser, services, activeCustomerOrders } = useACare();
  const insets = useSafeAreaInsets();

  // ── Handler navigasi ────────────────────────────────────────────────────────

  function handlePesanLayanan() {
    router.push('/(acare)/booking');
  }

  function handleServicePress(service: ServiceItem) {
    router.push({
      pathname: '/(acare)/booking',
      params: { serviceName: service.name },
    });
  }

  function handleOrderPress(order: Order) {
    router.push({
      pathname: '/(acare)/order-detail',
      params: { orderId: order.id },
    });
  }

  // ── Nama sapaan ────────────────────────────────────────────────────────────

  const firstName = currentUser.name.split(' ')[0];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + BOTTOM_NAV_HEIGHT + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}>

      {/* ── A. Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Logo teks ACare */}
          <View style={styles.logoRow}>
            <Text style={styles.logoIcon}>❄️</Text>
            <Text style={styles.logoText}>ACare</Text>
          </View>

          {/* Sapaan */}
          <Text style={styles.greeting}>Halo, {firstName}! 👋</Text>
          <Text style={styles.subtitle}>
            Butuh layanan AC? Kami siap membantu.
          </Text>
        </View>

        {/* Avatar placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* ── B. Hero / Banner ───────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroTitle}>AC Nyaman,{'\n'}Rumah Nyaman 🏠</Text>
          <Text style={styles.heroSubtitle}>
            Pesan layanan AC dengan mudah dan pantau teknisi sampai tiba.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            activeOpacity={0.8}
            onPress={handlePesanLayanan}
            accessibilityRole="button"
            accessibilityLabel="Pesan Layanan AC">
            <Text style={styles.heroButtonText}>Pesan Layanan</Text>
          </TouchableOpacity>
        </View>

        {/* Visual dekoratif */}
        <Text style={styles.heroEmoji}>❄️</Text>
      </View>

      {/* ── C. Section Pilih Layanan ───────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pilih Layanan</Text>
          <Text style={styles.sectionSub}>5 layanan tersedia</Text>
        </View>

        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.serviceList}
          renderItem={({ item }) => (
            <ServiceCard service={item} onPress={handleServicePress} />
          )}
          // Tidak butuh scrollEnabled=false karena ada ScrollView vertikal di luar
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />
      </View>

      {/* ── D. Section Pesanan Aktif ───────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pesanan Aktif</Text>
          {activeCustomerOrders.length > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {activeCustomerOrders.length}
              </Text>
            </View>
          ) : null}
        </View>

        {activeCustomerOrders.length === 0 ? (
          /* ── Empty State ─────────────────────────────────────────────────── */
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Belum ada pesanan aktif.</Text>
            <Text style={styles.emptySubtitle}>
              Yuk, buat pesanan servis AC pertamamu sekarang!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={handlePesanLayanan}
              accessibilityRole="button"
              accessibilityLabel="Pesan Layanan dari halaman kosong">
              <Text style={styles.emptyButtonText}>Pesan Layanan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Daftar order aktif ──────────────────────────────────────────── */
          activeCustomerOrders.map((order) => (
            <ActiveOrderCard
              key={order.id}
              order={order}
              onPress={handleOrderPress}
            />
          ))
        )}
      </View>

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: ACareColors.slate50,
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: 0,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: ACareColors.primary,
    letterSpacing: -0.5,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  subtitle: {
    fontSize: 13,
    color: ACareColors.slate500,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ACareColors.accent,
    marginTop: 4,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: ACareColors.primary,
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: ACareColors.primary,
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    shadowColor: ACareColors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  heroTextBlock: {
    flex: 1,
    gap: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: ACareColors.white,
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 17,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: ACareColors.white,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.primary,
  },
  heroEmoji: {
    fontSize: 56,
    marginLeft: 12,
    opacity: 0.9,
  },

  // ── Section ─────────────────────────────────────────────────────────────────
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  sectionSub: {
    fontSize: 12,
    color: ACareColors.slate400,
  },
  countBadge: {
    backgroundColor: ACareColors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: ACareColors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Service List ─────────────────────────────────────────────────────────────
  serviceList: {
    paddingRight: 4,
    paddingBottom: 4,
  },

  // ── Empty State ──────────────────────────────────────────────────────────────
  emptyState: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: ACareColors.slate100,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate700,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: ACareColors.slate400,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyButton: {
    backgroundColor: ACareColors.primary,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 28,
    marginTop: 10,
    shadowColor: ACareColors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.white,
  },
});
