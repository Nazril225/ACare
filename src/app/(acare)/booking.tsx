/**
 * Booking Screen — Alur pemesanan layanan AC untuk pelanggan.
 *
 * Alur (3-Step State):
 *  1. 'form'    — Form input (Layanan, Unit, Tanggal, Waktu, Alamat, Keluhan, Pembayaran)
 *  2. 'review'  — Review & Ringkasan pesanan sebelum konfirmasi (ada opsi Ubah/Edit)
 *  3. 'success' — Pesanan berhasil dibuat dengan status "Menunggu Konfirmasi"
 *
 * Menggunakan:
 *  - useACare() untuk currentUser, services, createOrder
 *  - SERVICES_DATA, TIME_SLOTS, COMMON_COMPLAINTS dari acare-data.ts
 *  - ACareColors & StatusBadge untuk styling konsisten
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { COMMON_COMPLAINTS, SERVICES_DATA, TIME_SLOTS } from '@/constants/acare-data';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Order, PaymentMethod, ServiceItem, ServiceType } from '@/types/acare';

// ─── Tipe Step ────────────────────────────────────────────────────────────────

type BookingStep = 'form' | 'review' | 'success';

// ─── Helper: Format & Tanggal ─────────────────────────────────────────────────

/** Format angka ke Rupiah */
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Dapatkan string YYYY-MM-DD hari ini */
function getTodayString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

interface DateChip {
  dateStr: string;
  dayLabel: string;
  dateLabel: string;
}

/** Buat pilihan 7 hari ke depan mulai hari ini */
function getUpcomingDates(): DateChip[] {
  const chips: DateChip[] = [];
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    let dayLabel = days[d.getDay()];
    if (i === 0) dayLabel = 'Hari Ini';
    else if (i === 1) dayLabel = 'Besok';

    const dateLabel = `${d.getDate()} ${months[d.getMonth()]}`;
    chips.push({ dateStr, dayLabel, dateLabel });
  }

  return chips;
}

/** Format tampilan tanggal YYYY-MM-DD ke Bahasa Indonesia */
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

const PAYMENT_METHODS: PaymentMethod[] = [
  'Tunai ke Teknisi',
  'Transfer Bank',
  'QRIS',
];

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, services, createOrder } = useACare();
  const searchParams = useLocalSearchParams<{ serviceName?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  // ── Step State ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<BookingStep>('form');

  // ── Form State ──────────────────────────────────────────────────────────────
  // Tentukan service awal dari query params jika ada
  const initialService = useMemo(() => {
    if (searchParams.serviceName) {
      const found = services.find((s) => s.name === searchParams.serviceName);
      if (found) return found;
    }
    return services[0] || SERVICES_DATA[0];
  }, [searchParams.serviceName, services]);

  const [selectedService, setSelectedService] = useState<ServiceItem>(initialService);
  const [acUnitsCount, setAcUnitsCount] = useState<number>(1);

  // Pilihan tanggal
  const upcomingDates = useMemo(() => getUpcomingDates(), []);
  const [selectedDate, setSelectedDate] = useState<string>(
    upcomingDates[1]?.dateStr ?? getTodayString()
  );

  // Pilihan waktu
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0] ?? '08:00 WIB');

  // Alamat & Patokan (default dari currentUser)
  const [address, setAddress] = useState<string>(currentUser.address || '');
  const [addressNote, setAddressNote] = useState<string>('');

  // Keluhan
  const [complaints, setComplaints] = useState<string>('');

  // Metode Pembayaran
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai ke Teknisi');

  // Order yang baru dibuat (untuk step success)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Validation Error State
  const [errors, setErrors] = useState<{
    service?: string;
    date?: string;
    time?: string;
    address?: string;
    complaints?: string;
  }>({});

  // ── Hitung Harga Total ──────────────────────────────────────────────────────
  const totalPrice = selectedService.price * acUnitsCount;

  // ── Validasi Form ───────────────────────────────────────────────────────────
  function validateForm(): boolean {
    const newErrors: typeof errors = {};
    const today = getTodayString();

    if (!selectedService) {
      newErrors.service = 'Pilih layanan terlebih dahulu.';
    }

    if (!selectedDate || !selectedDate.trim()) {
      newErrors.date = 'Pilih tanggal layanan.';
    } else if (selectedDate < today) {
      newErrors.date = 'Tanggal layanan tidak boleh di masa lalu.';
    }

    if (!selectedTime || !selectedTime.trim()) {
      newErrors.time = 'Pilih waktu layanan.';
    }

    if (!address || !address.trim()) {
      newErrors.address = 'Alamat wajib diisi.';
    }

    if (!complaints || !complaints.trim()) {
      newErrors.complaints = 'Keluhan wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleGoToReview() {
    if (!validateForm()) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setStep('review');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }

  function handleBackToForm() {
    setStep('form');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }

  function handleConfirmOrder() {
    // Validasi ulang
    if (!validateForm()) {
      setStep('form');
      return;
    }

    // Panggil fungsi createOrder dari ACareContext (Stage 1)
    const newOrder = createOrder({
      serviceType: selectedService.name as ServiceType,
      price: selectedService.price,
      date: selectedDate,
      time: selectedTime,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      address: address.trim(),
      addressNote: addressNote.trim() ? addressNote.trim() : undefined,
      complaints: complaints.trim(),
      acUnitsCount,
      paymentMethod,
    });

    setCreatedOrder(newOrder);
    setStep('success');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }

  function handleViewOrders() {
    router.replace('/(acare)/orders');
  }

  function handleBackToHome() {
    router.replace('/(acare)');
  }

  // ── Render Header Navigasi ──────────────────────────────────────────────────
  function renderHeader() {
    let title = 'Pesan Layanan';
    let subtitle = 'Langkah 1 dari 2: Isi Detail Layanan';

    if (step === 'review') {
      title = 'Review Pesanan';
      subtitle = 'Langkah 2 dari 2: Konfirmasi Pesanan';
    } else if (step === 'success') {
      title = 'Pesanan Berhasil';
      subtitle = 'Pesanan Anda telah tercatat';
    }

    return (
      <View style={styles.headerBar}>
        {step !== 'success' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={step === 'review' ? handleBackToForm : () => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Kembali">
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
      </View>
    );
  }

  // ── STEP 1: FORM ────────────────────────────────────────────────────────────
  function renderFormStep() {
    return (
      <View style={styles.stepContainer}>
        {/* Banner Error jika ada */}
        {Object.keys(errors).length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerTitle}>⚠️ Mohon lengkapi formulir:</Text>
            {Object.values(errors).map((err, idx) => (
              <Text key={idx} style={styles.errorBannerItem}>
                • {err}
              </Text>
            ))}
          </View>
        )}

        {/* 1. Pilih Layanan */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>1. Pilih Jenis Layanan</Text>
            <Text style={styles.requiredMark}>*</Text>
          </View>
          <Text style={styles.sectionHelper}>
            Pilih salah satu layanan AC yang Anda butuhkan
          </Text>

          <View style={styles.servicesGrid}>
            {services.map((srv) => {
              const isSelected = selectedService.id === srv.id;
              const emoji = SERVICE_EMOJIS[srv.name] ?? '🛠️';

              return (
                <TouchableOpacity
                  key={srv.id}
                  style={[
                    styles.serviceOptionCard,
                    isSelected && styles.serviceOptionCardActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedService(srv);
                    if (errors.service) setErrors((prev) => ({ ...prev, service: undefined }));
                  }}>
                  <View style={styles.serviceOptionTop}>
                    <Text style={styles.serviceEmoji}>{emoji}</Text>
                    {srv.badge && (
                      <View style={styles.serviceBadgeWrap}>
                        <Text style={styles.serviceBadgeText}>{srv.badge}</Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.serviceName,
                      isSelected && styles.serviceNameActive,
                    ]}>
                    {srv.name}
                  </Text>
                  <Text style={styles.serviceShortDesc} numberOfLines={2}>
                    {srv.shortDesc}
                  </Text>

                  <View style={styles.serviceOptionBottom}>
                    <Text
                      style={[
                        styles.servicePrice,
                        isSelected && styles.servicePriceActive,
                      ]}>
                      {formatRupiah(srv.price)}
                    </Text>
                    <Text style={styles.serviceDuration}>⏱ {srv.duration}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.service && <Text style={styles.fieldError}>{errors.service}</Text>}
        </View>

        {/* 2. Jumlah Unit AC */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>2. Jumlah Unit AC</Text>
          </View>
          <Text style={styles.sectionHelper}>Berapa unit AC yang ingin dikerjakan?</Text>

          <View style={styles.unitCounterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, acUnitsCount <= 1 && styles.counterBtnDisabled]}
              disabled={acUnitsCount <= 1}
              onPress={() => setAcUnitsCount((prev) => Math.max(1, prev - 1))}>
              <Text style={styles.counterBtnText}>−</Text>
            </TouchableOpacity>

            <View style={styles.counterDisplay}>
              <Text style={styles.counterValue}>{acUnitsCount}</Text>
              <Text style={styles.counterUnit}>Unit AC</Text>
            </View>

            <TouchableOpacity
              style={[styles.counterBtn, acUnitsCount >= 10 && styles.counterBtnDisabled]}
              disabled={acUnitsCount >= 10}
              onPress={() => setAcUnitsCount((prev) => Math.min(10, prev + 1))}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>

            <View style={styles.priceCalculation}>
              <Text style={styles.priceCalcLabel}>Subtotal Layanan:</Text>
              <Text style={styles.priceCalcValue}>{formatRupiah(totalPrice)}</Text>
            </View>
          </View>
        </View>

        {/* 3. Tanggal Layanan */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>3. Tanggal Layanan</Text>
            <Text style={styles.requiredMark}>*</Text>
          </View>
          <Text style={styles.sectionHelper}>
            Pilih hari kedatangan teknisi ke lokasi Anda
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}>
            {upcomingDates.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={[styles.dateChip, isSelected && styles.dateChipActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedDate(item.dateStr);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}>
                  <Text style={[styles.dateDayLabel, isSelected && styles.dateTextActive]}>
                    {item.dayLabel}
                  </Text>
                  <Text style={[styles.dateNumLabel, isSelected && styles.dateTextActive]}>
                    {item.dateLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Input kustom YYYY-MM-DD */}
          <View style={styles.customDateRow}>
            <Text style={styles.inputSubLabel}>Tanggal terpilih:</Text>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={selectedDate}
              onChangeText={(text) => {
                setSelectedDate(text);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={ACareColors.slate400}
            />
          </View>
          {errors.date && <Text style={styles.fieldError}>{errors.date}</Text>}
        </View>

        {/* 4. Waktu Kedatangan */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>4. Waktu Kedatangan</Text>
            <Text style={styles.requiredMark}>*</Text>
          </View>
          <Text style={styles.sectionHelper}>
            Pilih slot waktu kedatangan teknisi yang sesuai
          </Text>

          <View style={styles.timeSlotsWrap}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeChip, isSelected && styles.timeChipActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedTime(slot);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                  }}>
                  <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.time && <Text style={styles.fieldError}>{errors.time}</Text>}
        </View>

        {/* 5. Alamat Lengkap */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>5. Alamat Lokasi AC</Text>
            <Text style={styles.requiredMark}>*</Text>
          </View>
          <Text style={styles.sectionHelper}>
            Alamat jelas agar teknisi dapat menemukan lokasi dengan cepat
          </Text>

          <TextInput
            style={[styles.input, styles.textArea, errors.address && styles.inputError]}
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
            }}
            placeholder="Masukkan alamat lengkap lokasi AC..."
            placeholderTextColor={ACareColors.slate400}
          />
          {errors.address && <Text style={styles.fieldError}>{errors.address}</Text>}

          <Text style={[styles.inputSubLabel, { marginTop: 12 }]}>
            Patokan Lokasi (Opsional):
          </Text>
          <TextInput
            style={styles.input}
            value={addressNote}
            onChangeText={setAddressNote}
            placeholder="Contoh: Pagar putih samping warung, Lt. 2 kamar depan"
            placeholderTextColor={ACareColors.slate400}
          />
        </View>

        {/* 6. Keluhan / Masalah AC */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>6. Keluhan / Masalah AC</Text>
            <Text style={styles.requiredMark}>*</Text>
          </View>
          <Text style={styles.sectionHelper}>
            Jelaskan kondisi atau gejala kerusakan AC Anda
          </Text>

          {/* Pilihan cepat keluhan umum */}
          <Text style={styles.inputSubLabel}>Pilihan cepat keluhan umum:</Text>
          <View style={styles.quickComplaintsWrap}>
            {COMMON_COMPLAINTS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.quickComplaintChip,
                  complaints === item && styles.quickComplaintChipActive,
                ]}
                onPress={() => {
                  setComplaints(item);
                  if (errors.complaints) setErrors((prev) => ({ ...prev, complaints: undefined }));
                }}>
                <Text
                  style={[
                    styles.quickComplaintText,
                    complaints === item && styles.quickComplaintTextActive,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, styles.textArea, errors.complaints && styles.inputError, { marginTop: 10 }]}
            multiline
            numberOfLines={3}
            value={complaints}
            onChangeText={(text) => {
              setComplaints(text);
              if (errors.complaints) setErrors((prev) => ({ ...prev, complaints: undefined }));
            }}
            placeholder="Contoh: AC kurang dingin dan mengeluarkan suara mendengung..."
            placeholderTextColor={ACareColors.slate400}
          />
          {errors.complaints && <Text style={styles.fieldError}>{errors.complaints}</Text>}
        </View>

        {/* 7. Metode Pembayaran */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>7. Metode Pembayaran</Text>
          </View>
          <Text style={styles.sectionHelper}>
            Pembayaran dapat dilakukan setelah teknisi tiba atau servis selesai
          </Text>

          <View style={styles.paymentMethodsRow}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethodCard,
                    isSelected && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}>
                  <Text style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected ? '●' : '○'}
                  </Text>
                  <Text
                    style={[
                      styles.paymentMethodText,
                      isSelected && styles.paymentMethodTextActive,
                    ]}>
                    {method}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tombol Lanjut ke Review */}
        <View style={styles.bottomBar}>
          <View style={styles.totalPreviewWrap}>
            <Text style={styles.totalPreviewLabel}>Total Estimasi:</Text>
            <Text style={styles.totalPreviewPrice}>{formatRupiah(totalPrice)}</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={handleGoToReview}
            accessibilityRole="button"
            accessibilityLabel="Lanjut ke Review Pesanan">
            <Text style={styles.primaryBtnText}>Review Pesanan →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── STEP 2: REVIEW ──────────────────────────────────────────────────────────
  function renderReviewStep() {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.reviewBanner}>
          <Text style={styles.reviewBannerTitle}>📋 Periksa Kembali Pesanan Anda</Text>
          <Text style={styles.reviewBannerDesc}>
            Pastikan data layanan, waktu kedatangan, dan alamat sudah sesuai sebelum mengonfirmasi.
          </Text>
        </View>

        {/* Kartu Ringkasan Detail */}
        <View style={styles.sectionCard}>
          <Text style={styles.reviewCardHeader}>Ringkasan Pesanan</Text>

          {/* Layanan */}
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Jenis Layanan</Text>
            <View style={styles.reviewValueRight}>
              <Text style={styles.reviewValueMain}>{selectedService.name}</Text>
              <Text style={styles.reviewValueSub}>
                {acUnitsCount} unit AC × {formatRupiah(selectedService.price)}
              </Text>
            </View>
          </View>

          <View style={styles.reviewDivider} />

          {/* Jadwal */}
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Jadwal Kedatangan</Text>
            <View style={styles.reviewValueRight}>
              <Text style={styles.reviewValueMain}>
                📅 {formatDisplayDate(selectedDate)}
              </Text>
              <Text style={styles.reviewValueSub}>⏰ Pukul {selectedTime}</Text>
            </View>
          </View>

          <View style={styles.reviewDivider} />

          {/* Pelanggan */}
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Pemesan</Text>
            <View style={styles.reviewValueRight}>
              <Text style={styles.reviewValueMain}>{currentUser.name}</Text>
              <Text style={styles.reviewValueSub}>{currentUser.phone}</Text>
            </View>
          </View>

          <View style={styles.reviewDivider} />

          {/* Alamat */}
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Lokasi Servis</Text>
            <View style={styles.reviewValueRight}>
              <Text style={styles.reviewValueMain}>{address}</Text>
              {addressNote ? (
                <Text style={styles.reviewValueSub}>Patokan: {addressNote}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.reviewDivider} />

          {/* Keluhan */}
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Keluhan AC</Text>
            <View style={styles.reviewValueRight}>
              <Text style={styles.reviewValueMain}>{complaints}</Text>
            </View>
          </View>

          <View style={styles.reviewDivider} />

          {/* Pembayaran */}
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Metode Pembayaran</Text>
            <View style={styles.reviewValueRight}>
              <Text style={styles.reviewValueMain}>{paymentMethod}</Text>
              <Text style={styles.reviewValueSub}>Status: Belum Bayar</Text>
            </View>
          </View>

          <View style={styles.reviewDivider} />

          {/* Status Awal */}
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Status Awal</Text>
            <View style={styles.reviewValueRight}>
              <StatusBadge status="Menunggu Konfirmasi" />
            </View>
          </View>

          <View style={styles.reviewDivider} />

          {/* Total Biaya */}
          <View style={[styles.reviewRow, { marginTop: 6 }]}>
            <Text style={styles.totalPriceLabel}>Total Pembayaran</Text>
            <Text style={styles.totalPriceBig}>{formatRupiah(totalPrice)}</Text>
          </View>
        </View>

        {/* Tombol Aksi Review */}
        <View style={styles.actionButtonsWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={handleConfirmOrder}
            accessibilityRole="button"
            accessibilityLabel="Konfirmasi Pesanan">
            <Text style={styles.primaryBtnText}>✓ Konfirmasi Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={handleBackToForm}
            accessibilityRole="button"
            accessibilityLabel="Kembali untuk ubah pesanan">
            <Text style={styles.secondaryBtnText}>← Ubah Detail Pesanan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── STEP 3: SUCCESS ─────────────────────────────────────────────────────────
  function renderSuccessStep() {
    return (
      <View style={styles.successContainer}>
        {/* Ikon Sukses */}
        <View style={styles.successIconCircle}>
          <Text style={styles.successCheckmark}>✓</Text>
        </View>

        <Text style={styles.successTitle}>Pesanan Berhasil Dibuat!</Text>
        <Text style={styles.successSubtitle}>
          Pesanan layanan AC kamu sudah tercatat di sistem ACare. Teknisi kami akan segera memprosesnya.
        </Text>

        {/* Kartu Ringkasan Pesanan Baru */}
        {createdOrder && (
          <View style={styles.successCard}>
            <View style={styles.successCardTop}>
              <View>
                <Text style={styles.successOrderLabel}>Nomor Pesanan</Text>
                <Text style={styles.successOrderId}>{createdOrder.id}</Text>
              </View>
              <StatusBadge status={createdOrder.status} />
            </View>

            <View style={styles.successCardDivider} />

            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailKey}>Layanan:</Text>
              <Text style={styles.successDetailVal}>
                {createdOrder.serviceType} ({createdOrder.acUnitsCount} Unit)
              </Text>
            </View>

            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailKey}>Jadwal:</Text>
              <Text style={styles.successDetailVal}>
                {formatDisplayDate(createdOrder.date)} • {createdOrder.time}
              </Text>
            </View>

            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailKey}>Alamat:</Text>
              <Text style={styles.successDetailVal} numberOfLines={2}>
                {createdOrder.address}
              </Text>
            </View>

            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailKey}>Total Biaya:</Text>
              <Text style={styles.successDetailValHighlight}>
                {formatRupiah(createdOrder.price)}
              </Text>
            </View>
          </View>
        )}

        {/* Tombol Aksi */}
        <View style={styles.successActionsWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={handleViewOrders}
            accessibilityRole="button"
            accessibilityLabel="Lihat Daftar Pesanan">
            <Text style={styles.primaryBtnText}>📋 Lihat Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={handleBackToHome}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Halaman Utama">
            <Text style={styles.secondaryBtnText}>🏠 Kembali ke Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Render Utama ────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {renderHeader()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {step === 'form' && renderFormStep()}
        {step === 'review' && renderReviewStep()}
        {step === 'success' && renderSuccessStep()}
      </ScrollView>
    </KeyboardAvoidingView>
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
  },

  // ── Header Bar ──────────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
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
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  headerSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    marginTop: 2,
  },

  // ── Step Container & Sections ───────────────────────────────────────────────
  stepContainer: {
    gap: 16,
  },
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  requiredMark: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHelper: {
    fontSize: 12,
    color: ACareColors.slate500,
    marginBottom: 14,
  },

  // ── Error Banner ────────────────────────────────────────────────────────────
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 4,
  },
  errorBannerItem: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 18,
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },

  // ── Grid Layanan ────────────────────────────────────────────────────────────
  servicesGrid: {
    gap: 10,
  },
  serviceOptionCard: {
    backgroundColor: ACareColors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: ACareColors.slate200,
  },
  serviceOptionCardActive: {
    borderColor: ACareColors.primary,
    backgroundColor: '#F0F9FF',
  },
  serviceOptionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceBadgeWrap: {
    backgroundColor: ACareColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  serviceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ACareColors.primary,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
    marginBottom: 3,
  },
  serviceNameActive: {
    color: ACareColors.primaryDark,
  },
  serviceShortDesc: {
    fontSize: 11,
    color: ACareColors.slate500,
    lineHeight: 15,
    marginBottom: 8,
  },
  serviceOptionBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ACareColors.slate100,
    paddingTop: 6,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.slate800,
  },
  servicePriceActive: {
    color: ACareColors.primary,
  },
  serviceDuration: {
    fontSize: 11,
    color: ACareColors.slate400,
  },

  // ── Unit Counter ────────────────────────────────────────────────────────────
  unitCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: ACareColors.slate100,
    opacity: 0.5,
  },
  counterBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: ACareColors.primary,
    lineHeight: 26,
  },
  counterDisplay: {
    alignItems: 'center',
    minWidth: 60,
  },
  counterValue: {
    fontSize: 20,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  counterUnit: {
    fontSize: 11,
    color: ACareColors.slate500,
  },
  priceCalculation: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  priceCalcLabel: {
    fontSize: 11,
    color: ACareColors.slate400,
  },
  priceCalcValue: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.primary,
  },

  // ── Tanggal Scroll & Input ──────────────────────────────────────────────────
  dateScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  dateChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: ACareColors.slate100,
    alignItems: 'center',
    minWidth: 72,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dateChipActive: {
    backgroundColor: ACareColors.primary,
    borderColor: ACareColors.primaryDark,
  },
  dateDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: ACareColors.slate600,
    marginBottom: 2,
  },
  dateNumLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  dateTextActive: {
    color: ACareColors.white,
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 6,
  },

  // ── Waktu Chips ─────────────────────────────────────────────────────────────
  timeSlotsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: ACareColors.slate100,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  timeChipActive: {
    backgroundColor: '#F0F9FF',
    borderColor: ACareColors.primary,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate700,
  },
  timeChipTextActive: {
    color: ACareColors.primary,
    fontWeight: '700',
  },

  // ── Inputs ──────────────────────────────────────────────────────────────────
  input: {
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: ACareColors.slate900,
    backgroundColor: ACareColors.white,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.slate600,
    marginBottom: 6,
  },

  // ── Pilihan Cepat Keluhan ───────────────────────────────────────────────────
  quickComplaintsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  quickComplaintChip: {
    backgroundColor: ACareColors.slate100,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
  },
  quickComplaintChipActive: {
    backgroundColor: '#F0F9FF',
    borderColor: ACareColors.primary,
  },
  quickComplaintText: {
    fontSize: 11,
    color: ACareColors.slate600,
  },
  quickComplaintTextActive: {
    color: ACareColors.primary,
    fontWeight: '600',
  },

  // ── Metode Pembayaran ───────────────────────────────────────────────────────
  paymentMethodsRow: {
    gap: 8,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: ACareColors.slate50,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
  },
  paymentMethodCardActive: {
    backgroundColor: '#F0F9FF',
    borderColor: ACareColors.primary,
  },
  radioCircle: {
    fontSize: 16,
    color: ACareColors.slate400,
  },
  radioCircleActive: {
    color: ACareColors.primary,
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate700,
  },
  paymentMethodTextActive: {
    color: ACareColors.primaryDark,
    fontWeight: '700',
  },

  // ── Bottom Bar / Aksi Form ──────────────────────────────────────────────────
  bottomBar: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalPreviewWrap: {
    flex: 1,
  },
  totalPreviewLabel: {
    fontSize: 11,
    color: ACareColors.slate500,
  },
  totalPreviewPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  primaryBtn: {
    backgroundColor: ACareColors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACareColors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.white,
  },
  secondaryBtn: {
    backgroundColor: ACareColors.white,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate300,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACareColors.slate700,
  },

  // ── Review Step ─────────────────────────────────────────────────────────────
  reviewBanner: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  reviewBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.primaryDark,
    marginBottom: 4,
  },
  reviewBannerDesc: {
    fontSize: 12,
    color: ACareColors.slate600,
    lineHeight: 17,
  },
  reviewCardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: ACareColors.slate900,
    marginBottom: 14,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 12,
  },
  reviewLabel: {
    fontSize: 13,
    color: ACareColors.slate500,
    flex: 1,
  },
  reviewValueRight: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  reviewValueMain: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.slate900,
    textAlign: 'right',
  },
  reviewValueSub: {
    fontSize: 11,
    color: ACareColors.slate500,
    marginTop: 2,
    textAlign: 'right',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: ACareColors.slate100,
    marginVertical: 6,
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  totalPriceBig: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  actionButtonsWrap: {
    gap: 10,
    marginTop: 6,
  },

  // ── Success Step ────────────────────────────────────────────────────────────
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
    marginBottom: 16,
  },
  successCheckmark: {
    fontSize: 38,
    fontWeight: '800',
    color: '#047857',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: ACareColors.slate900,
    textAlign: 'center',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  successCard: {
    width: '100%',
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  successCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  successOrderLabel: {
    fontSize: 11,
    color: ACareColors.slate400,
  },
  successOrderId: {
    fontSize: 15,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  successCardDivider: {
    height: 1,
    backgroundColor: ACareColors.slate100,
    marginBottom: 10,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 8,
  },
  successDetailKey: {
    fontSize: 12,
    color: ACareColors.slate500,
  },
  successDetailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.slate800,
    flex: 1,
    textAlign: 'right',
  },
  successDetailValHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  successActionsWrap: {
    width: '100%',
    gap: 10,
  },
});
