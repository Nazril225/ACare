/**
 * ServiceCard — Card layanan AC untuk section "Pilih Layanan" di Home Customer.
 * Menampilkan nama, deskripsi singkat, harga, dan badge opsional dari ServiceItem.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ACareColors } from '@/constants/theme';
import { ServiceItem } from '@/types/acare';

/** Map ServiceType → emoji representatif (tanpa library icon baru). */
const SERVICE_EMOJI: Record<string, string> = {
  'Cuci AC': '❄️',
  'Servis AC': '🔧',
  'Isi Freon': '🌡️',
  'Perbaikan AC': '⚡',
  'Bongkar/Pasang AC': '🔄',
};

interface ServiceCardProps {
  service: ServiceItem;
  onPress?: (service: ServiceItem) => void;
}

export function ServiceCard({ service, onPress }: ServiceCardProps) {
  const emoji = SERVICE_EMOJI[service.name] ?? '🛠️';

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(service.price);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress?.(service)}
      accessibilityRole="button"
      accessibilityLabel={`Pilih layanan ${service.name}, harga ${formattedPrice}`}>

      {/* Badge (opsional) */}
      {service.badge ? (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{service.badge}</Text>
        </View>
      ) : null}

      {/* Icon emoji */}
      <Text style={styles.emoji}>{emoji}</Text>

      {/* Nama layanan */}
      <Text style={styles.name} numberOfLines={1}>
        {service.name}
      </Text>

      {/* Deskripsi singkat */}
      <Text style={styles.desc} numberOfLines={2}>
        {service.shortDesc}
      </Text>

      {/* Harga */}
      <Text style={styles.price}>{formattedPrice}</Text>

      {/* Durasi */}
      <Text style={styles.duration}>⏱ {service.duration}</Text>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: ACareColors.slate100,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: ACareColors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ACareColors.primary,
    letterSpacing: 0.2,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.slate900,
    marginBottom: 4,
  },
  desc: {
    fontSize: 11,
    color: ACareColors.slate500,
    lineHeight: 15,
    marginBottom: 10,
    flexGrow: 1,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.primary,
    marginBottom: 2,
  },
  duration: {
    fontSize: 10,
    color: ACareColors.slate400,
  },
});
