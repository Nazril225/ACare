/**
 * Data awal dummy untuk aplikasi ACare.
 *
 * Digunakan sebagai initial state di ACareContext.
 * Tidak ada dependency eksternal — sepenuhnya statis dan lokal.
 */

import { CustomerUser, Order, ServiceItem, Technician } from '@/types/acare';

// ─── Layanan AC ───────────────────────────────────────────────────────────────

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Cuci AC',
    shortDesc: 'Pembersihan menyeluruh unit indoor & outdoor agar AC kembali dingin dan udara segar.',
    fullDesc:
      'Layanan cuci AC komprehensif: pencucian filter, blower, evaporator, saluran pembuangan air (drain), serta kondensor outdoor. Mencegah kebocoran dan bau tidak sedap.',
    price: 75_000,
    duration: '45–60 Menit',
    badge: 'Paling Populer',
    icon: 'snowflake',
  },
  {
    id: 'srv-2',
    name: 'Servis AC',
    shortDesc: 'Pengecekan performa sistem, kelistrikan, arus kompresor, dan optimasi suhu.',
    fullDesc:
      'Pemeriksaan menyeluruh: tekanan gas freon, arus kompresor, sensor suhu, kebersihan filter, pelumasan motor fan, dan kelistrikan. Menjaga keawetan dan efisiensi AC.',
    price: 120_000,
    duration: '60–90 Menit',
    badge: 'Direkomendasikan',
    icon: 'wrench.and.screwdriver',
  },
  {
    id: 'srv-3',
    name: 'Isi Freon',
    shortDesc: 'Pengisian ulang gas pendingin R32 / R410A / R22 sesuai spesifikasi unit AC.',
    fullDesc:
      'Pengisian freon AC hingga tekanan standar optimal disertai deteksi kebocoran pada sambungan pipa tembaga (flaring). Menjamin suhu ruangan dingin merata.',
    price: 150_000,
    duration: '30–45 Menit',
    icon: 'gauge.with.needle',
  },
  {
    id: 'srv-4',
    name: 'Perbaikan AC',
    shortDesc: 'Penanganan kerusakan modul PCB, kebocoran air, kompresor macet, dan sensor.',
    fullDesc:
      'Diagnosa mendalam dan perbaikan komponen rusak: kapasitor, motor swing, pipa bocor, kelistrikan PCB, fan motor. Garansi perbaikan 30 hari.',
    price: 200_000,
    duration: '90–120 Menit',
    badge: 'Garansi 30 Hari',
    icon: 'bolt.shield',
  },
  {
    id: 'srv-5',
    name: 'Bongkar/Pasang AC',
    shortDesc: 'Pemasangan unit AC baru, relokasi, atau pembongkaran AC lama dengan rapi.',
    fullDesc:
      'Pembongkaran unit lama, pemipaan tembaga, pemasangan bracket outdoor & indoor, proses vakum pipa, serta pengetesan sistem pasca instalasi. Bersih dan terstruktur.',
    price: 250_000,
    duration: '120–180 Menit',
    icon: 'arrow.triangle.2.circlepath',
  },
];

// ─── Teknisi ──────────────────────────────────────────────────────────────────

export const TECHNICIANS_DATA: Technician[] = [
  {
    id: 'tech-1',
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    rating: 4.9,
    completedJobs: 142,
    status: 'Tersedia',
    specialization: 'Inverter & Diagnosa Kelistrikan',
  },
  {
    id: 'tech-2',
    name: 'Agus Setiawan',
    phone: '0813-8899-7766',
    rating: 4.8,
    completedJobs: 98,
    status: 'Bertugas',
    specialization: 'Pembersihan & Pengisian Freon',
  },
  {
    id: 'tech-3',
    name: 'Rudi Hartono',
    phone: '0821-4455-6677',
    rating: 4.9,
    completedJobs: 165,
    status: 'Bertugas',
    specialization: 'Bongkar Pasang & Piping',
  },
];

// ─── Pelanggan ────────────────────────────────────────────────────────────────

export const INITIAL_CUSTOMERS: CustomerUser[] = [
  {
    id: 'cust-1',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@gmail.com',
    phone: '0812-9876-5432',
    address: 'Jl. Merpati Indah No. 12, Sukolilo, Surabaya',
  },
  {
    id: 'cust-2',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@yahoo.com',
    phone: '0819-1234-5678',
    address: 'Perumahan Griya Asri Blok B4 No. 7, Rungkut, Surabaya',
  },
  {
    id: 'cust-3',
    name: 'Dian Pratama',
    email: 'dian.pratama@outlook.com',
    phone: '0857-3344-5566',
    address: 'Apartemen Puncak Kertajaya Tower B Lt. 15, Surabaya',
  },
];

// ─── Slot Waktu ───────────────────────────────────────────────────────────────

/** Pilihan slot kedatangan teknisi yang tersedia. */
export const TIME_SLOTS: string[] = [
  '08:00 WIB',
  '10:00 WIB',
  '13:00 WIB',
  '15:00 WIB',
  '17:00 WIB',
];

// ─── Keluhan Umum (Pilihan Cepat di Form Pemesanan) ──────────────────────────

/** Daftar keluhan AC yang sering dilaporkan pelanggan. */
export const COMMON_COMPLAINTS: string[] = [
  'AC tidak dingin / hanya keluar angin biasa',
  'Air menetes / bocor dari unit indoor',
  'Suara mesin outdoor / indoor berisik dan bergetar',
  'AC mengeluarkan bau tidak sedap / apek',
  'AC mati total / lampu indikator berkedip',
  'Perawatan rutin / sudah lebih dari 3 bulan belum dicuci',
];

// ─── Data Pesanan Awal (Demo) ─────────────────────────────────────────────────
// Mencakup semua status agar dapat didemonstrasikan di panel admin dan pelanggan.

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'AC-2026-001',
    customerId: 'cust-1',
    customerName: 'Ahmad Fauzi',
    customerPhone: '0812-9876-5432',
    serviceType: 'Cuci AC',
    price: 75_000,
    date: '2026-09-27',
    time: '10:00 WIB',
    address: 'Jl. Merpati Indah No. 12, Sukolilo, Surabaya',
    addressNote: 'Pagar putih, samping warung makan Pak Jono',
    complaints: 'Perawatan rutin 3 bulanan. AC sudah mulai kurang dingin.',
    status: 'Selesai',
    technicianId: 'tech-1',
    technicianName: 'Budi Santoso',
    paymentMethod: 'Tunai ke Teknisi',
    paymentStatus: 'Lunas',
    technicianNotes:
      'AC telah dicuci bersih. Tekanan freon stabil 140 psi. Suhu keluar 18 °C. Normal.',
    createdAt: '2026-09-26 14:20',
    acUnitsCount: 1,
  },
  {
    id: 'AC-2026-002',
    customerId: 'cust-2',
    customerName: 'Siti Rahmawati',
    customerPhone: '0819-1234-5678',
    serviceType: 'Servis AC',
    price: 120_000,
    date: '2026-09-29',
    time: '13:00 WIB',
    address: 'Perumahan Griya Asri Blok B4 No. 7, Rungkut, Surabaya',
    addressNote: 'Rumah cat hijau di ujung gang',
    complaints: 'Air menetes deras dari indoor AC kamar utama.',
    status: 'Sedang Dikerjakan',
    technicianId: 'tech-2',
    technicianName: 'Agus Setiawan',
    paymentMethod: 'QRIS',
    paymentStatus: 'Belum Bayar',
    technicianNotes:
      'Sedang pembersihan pipa drainase yang tersumbat lendir kotoran.',
    createdAt: '2026-09-28 09:15',
    acUnitsCount: 1,
  },
  {
    id: 'AC-2026-003',
    customerId: 'cust-1',
    customerName: 'Ahmad Fauzi',
    customerPhone: '0812-9876-5432',
    serviceType: 'Isi Freon',
    price: 150_000,
    date: '2026-09-29',
    time: '15:00 WIB',
    address: 'Jl. Merpati Indah No. 12, Sukolilo, Surabaya',
    complaints: 'Hawa AC ruang tamu hanya hangat. Pipa outdoor tidak berembun.',
    status: 'Teknisi Menuju Lokasi',
    technicianId: 'tech-3',
    technicianName: 'Rudi Hartono',
    paymentMethod: 'Transfer Bank',
    paymentStatus: 'Belum Bayar',
    createdAt: '2026-09-29 10:00',
    acUnitsCount: 1,
  },
  {
    id: 'AC-2026-004',
    customerId: 'cust-3',
    customerName: 'Dian Pratama',
    customerPhone: '0857-3344-5566',
    serviceType: 'Perbaikan AC',
    price: 200_000,
    date: '2026-09-30',
    time: '10:00 WIB',
    address: 'Apartemen Puncak Kertajaya Tower B Lt. 15, Surabaya',
    addressNote: 'Minta izin ke sekuriti lobi A terlebih dahulu',
    complaints: 'AC berbunyi berderit keras ketika fan swing berputar.',
    status: 'Dikonfirmasi',
    technicianId: 'tech-1',
    technicianName: 'Budi Santoso',
    paymentMethod: 'QRIS',
    paymentStatus: 'Belum Bayar',
    createdAt: '2026-09-29 11:30',
    acUnitsCount: 1,
  },
  {
    id: 'AC-2026-005',
    customerId: 'cust-1',
    customerName: 'Ahmad Fauzi',
    customerPhone: '0812-9876-5432',
    serviceType: 'Bongkar/Pasang AC',
    price: 250_000,
    date: '2026-10-01',
    time: '08:00 WIB',
    address: 'Jl. Merpati Indah No. 12, Sukolilo, Surabaya',
    complaints: 'Ingin memindahkan unit AC dari kamar lantai 1 ke kamar lantai 2.',
    status: 'Menunggu Konfirmasi',
    paymentMethod: 'Tunai ke Teknisi',
    paymentStatus: 'Belum Bayar',
    createdAt: '2026-09-29 12:45',
    acUnitsCount: 1,
  },
  {
    id: 'AC-2026-006',
    customerId: 'cust-2',
    customerName: 'Siti Rahmawati',
    customerPhone: '0819-1234-5678',
    serviceType: 'Cuci AC',
    price: 75_000,
    date: '2026-09-25',
    time: '15:00 WIB',
    address: 'Perumahan Griya Asri Blok B4 No. 7, Rungkut, Surabaya',
    complaints: 'AC ruang keluarga berdebu dan berbau.',
    status: 'Dibatalkan',
    paymentMethod: 'Tunai ke Teknisi',
    paymentStatus: 'Belum Bayar',
    technicianNotes:
      'Dibatalkan oleh pelanggan karena ada keperluan mendadak keluar kota.',
    createdAt: '2026-09-24 16:00',
    acUnitsCount: 1,
  },
];
