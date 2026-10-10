/**
 * Admin Technicians Screen — Halaman Manajemen Daftar Teknisi untuk Admin ACare.
 *
 * Fitur:
 *  - Header "Teknisi" dengan badge peran ADMIN
 *  - Input pencarian berdasarkan nama teknisi, nomor telepon, atau spesialisasi
 *  - Filter status ketersediaan:
 *      1. "Semua"
 *      2. "Tersedia"
 *      3. "Bertugas"
 *      4. "Libur"
 *  - Counter ringkasan jumlah teknisi per status
 *  - Daftar kartu teknisi menggunakan TechnicianCard
 *  - Empty state informatif jika hasil filter atau pencarian tidak ditemukan
 *  - Navigasi menuju Detail Teknisi (/(admin)/technician-detail)
 *
 * Mengambil data riil dari ACareContext via useACare().
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
import { useRouter } from 'expo-router';

import { TechnicianCard } from '@/components/admin/technician-card';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Technician, TechnicianStatus } from '@/types/acare';

type StatusFilterKey = 'semua' | TechnicianStatus;

export default function AdminTechniciansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { technicians, orders } = useACare();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<StatusFilterKey>('semua');

  // ── Hitung Counter per Status ───────────────────────────────────────────────
  const counts = useMemo(() => {
    const total = technicians.length;
    const tersedia = technicians.filter((t) => t.status === 'Tersedia').length;
    const bertugas = technicians.filter((t) => t.status === 'Bertugas').length;
    const libur = technicians.filter((t) => t.status === 'Libur').length;
    return { total, tersedia, bertugas, libur };
  }, [technicians]);

  // ── Hitung Pekerjaan Aktif per Teknisi ──────────────────────────────────────
  const activeOrdersMap = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((order) => {
      if (
        order.technicianId &&
        order.status !== 'Selesai' &&
        order.status !== 'Dibatalkan'
      ) {
        map[order.technicianId] = (map[order.technicianId] || 0) + 1;
      }
    });
    return map;
  }, [orders]);

  // ── Filter dan Pencarian ────────────────────────────────────────────────────
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      // 1. Filter Kategori Status
      if (activeFilter !== 'semua' && tech.status !== activeFilter) {
        return false;
      }

      // 2. Pencarian Query (Nama, No Telepon, atau Spesialisasi)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = tech.name.toLowerCase().includes(q);
        const matchPhone = tech.phone.toLowerCase().includes(q);
        const matchSpec = tech.specialization.toLowerCase().includes(q);
        return matchName || matchPhone || matchSpec;
      }

      return true;
    });
  }, [technicians, activeFilter, searchQuery]);

  function handleTechnicianPress(technician: Technician) {
    router.push({
      pathname: '/(admin)/technician-detail',
      params: { technicianId: technician.id },
    });
  }

  function handleBackToDashboard() {
    router.push('/(admin)');
  }

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
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBackToDashboard}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Dashboard Admin">
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <View style={styles.roleBadgeRow}>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeDot}>●</Text>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Teknisi</Text>
            <Text style={styles.headerSubtitle}>
              Kelola dan pantau seluruh data teknisi ACare
            </Text>
          </View>
        </View>
      </View>

      {/* ── Search Input ────────────────────────────────────────────────────── */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari nama teknisi atau spesialisasi..."
            placeholderTextColor={ACareColors.slate400}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian">
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Status Tabs ───────────────────────────────────────────────── */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}>
          {/* Semua */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'semua' && styles.filterTabActive]}
            onPress={() => setActiveFilter('semua')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Semua: ${counts.total} teknisi`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'semua' && styles.filterTabTextActive,
              ]}>
              Semua ({counts.total})
            </Text>
          </TouchableOpacity>

          {/* Tersedia */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'Tersedia' && styles.filterTabActive]}
            onPress={() => setActiveFilter('Tersedia')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Tersedia: ${counts.tersedia} teknisi`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'Tersedia' && styles.filterTabTextActive,
              ]}>
              Tersedia ({counts.tersedia})
            </Text>
          </TouchableOpacity>

          {/* Bertugas */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'Bertugas' && styles.filterTabActive]}
            onPress={() => setActiveFilter('Bertugas')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Bertugas: ${counts.bertugas} teknisi`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'Bertugas' && styles.filterTabTextActive,
              ]}>
              Bertugas ({counts.bertugas})
            </Text>
          </TouchableOpacity>

          {/* Libur */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'Libur' && styles.filterTabActive]}
            onPress={() => setActiveFilter('Libur')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Libur: ${counts.libur} teknisi`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'Libur' && styles.filterTabTextActive,
              ]}>
              Libur ({counts.libur})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── List Header ─────────────────────────────────────────────────────── */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderText}>
          Menampilkan {filteredTechnicians.length} Teknisi
        </Text>
        {searchQuery.trim().length > 0 && (
          <Text style={styles.searchHintText}>
            Hasil pencarian &quot;{searchQuery}&quot;
          </Text>
        )}
      </View>

      {/* ── Technicians List / Empty State ──────────────────────────────────── */}
      {filteredTechnicians.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👷</Text>
          <Text style={styles.emptyTitle}>Tidak ada teknisi</Text>
          <Text style={styles.emptySubtitle}>
            Tidak ditemukan teknisi yang sesuai dengan filter status atau kata kunci pencarian.
          </Text>
          {(searchQuery.length > 0 || activeFilter !== 'semua') && (
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('semua');
              }}
              accessibilityRole="button"
              accessibilityLabel="Reset filter dan pencarian">
              <Text style={styles.resetFilterBtnText}>Reset Filter & Pencarian</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.techniciansList}>
          {filteredTechnicians.map((tech) => (
            <TechnicianCard
              key={tech.id}
              technician={tech}
              activeOrdersCount={activeOrdersMap[tech.id] || 0}
              onPress={handleTechnicianPress}
            />
          ))}
        </View>
      )}

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
    gap: 16,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACareColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  headerTitleWrap: {
    flex: 1,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.slate900,
    borderRadius: 6,
    paddingHorizontal: 7,
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
    fontSize: 22,
    fontWeight: '800',
    color: ACareColors.slate900,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    marginTop: 2,
  },

  // ── Search Section ──────────────────────────────────────────────────────────
  searchSection: {
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: ACareColors.slate900,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 13,
    color: ACareColors.slate400,
    fontWeight: '700',
  },

  // ── Filter Section ──────────────────────────────────────────────────────────
  filterSection: {
    gap: 8,
  },
  filterTabsScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: ACareColors.white,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
  },
  filterTabActive: {
    backgroundColor: ACareColors.slate900,
    borderColor: ACareColors.slate900,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.slate600,
  },
  filterTabTextActive: {
    color: ACareColors.white,
    fontWeight: '700',
  },

  // ── List Header ─────────────────────────────────────────────────────────────
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  searchHintText: {
    fontSize: 11,
    color: ACareColors.primary,
    fontWeight: '600',
  },

  // ── Technicians List ────────────────────────────────────────────────────────
  techniciansList: {
    gap: 0,
  },

  // ── Empty State ─────────────────────────────────────────────────────────────
  emptyState: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 48,
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
    paddingHorizontal: 20,
  },
  resetFilterBtn: {
    backgroundColor: ACareColors.slate100,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 8,
  },
  resetFilterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.slate700,
  },
});
