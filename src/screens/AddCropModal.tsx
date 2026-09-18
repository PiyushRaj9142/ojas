import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { CropItem } from '../types/crop';

interface AddCropModalProps {
  visible: boolean;
  onClose: () => void;
  onAddCrop: (crop: CropItem) => void;
}

export default function AddCropModal({ visible, onClose, onAddCrop }: AddCropModalProps) {
  const [cropName, setCropName] = useState('Tomato (Himsona)');
  const [quantity, setQuantity] = useState('50');
  const [unit, setUnit] = useState<'kg' | 'crates' | 'quintal'>('kg');
  const [sellingDate, setSellingDate] = useState('2026-09-20');
  const [category, setCategory] = useState('Fruit Vegetable');

  const presetCrops = [
    { name: 'Tomato (Himsona)', emoji: '🍅', color: '#ef4444', cat: 'Fruit Vegetable' },
    { name: 'Green Capsicum', emoji: '🫑', color: '#16a34a', cat: 'Solanaceous' },
    { name: 'Palak / Spinach', emoji: '🥬', color: '#059669', cat: 'Leafy Green' },
    { name: 'Nashik Red Onion', emoji: '🧅', color: '#a855f7', cat: 'Bulb' },
    { name: 'Carrot (Gajar)', emoji: '🥕', color: '#ea580c', cat: 'Root' },
    { name: 'Potato (Aloo)', emoji: '🥔', color: '#d97706', cat: 'Tuber' },
  ];

  const handleSave = () => {
    if (!cropName.trim() || !quantity) {
      Alert.alert('Validation Error', 'Please enter crop name and quantity');
      return;
    }

    const qty = parseFloat(quantity) || 10;
    const selectedPreset = presetCrops.find(p => p.name === cropName) || presetCrops[0];

    const newCrop: CropItem = {
      id: `crop-${Date.now()}`,
      name: cropName,
      nameHi: cropName.split(' ')[0],
      category: category,
      quantity: qty,
      unit: unit,
      freshnessPercentage: 96,
      shelfLifeDays: 14,
      initialShelfLifeDays: 24,
      storageDate: new Date().toISOString().split('T')[0],
      sellingDate: sellingDate,
      status: 'FRESH',
      optimalTemp: '4.5 - 5.5°C',
      currentTemp: 4.8,
      currentHumidity: 72,
      expectedLossPercentage: 1.2,
      estimatedMarketPricePerUnit: 35,
      estimatedTotalMarketValue: qty * 35,
      recommendedSellingTimeDays: 7,
      aiRecommendation: `Fresh batch of ${cropName} stored at 4.8°C. Shelf life extended by 6x compared to ambient conditions.`,
      aiRecommendationHi: `नई खेप 4.8°C पर सुरक्षित है। 7 दिनों में बेचना सबसे अधिक लाभदायक होगा।`,
      iconEmoji: selectedPreset.emoji,
      color: selectedPreset.color,
    };

    onAddCrop(newCrop);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Crop to Storage</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Quick Crop Selector */}
            <Text style={styles.label}>Select Crop Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {presetCrops.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetChip, cropName === preset.name && styles.presetChipActive]}
                  onPress={() => {
                    setCropName(preset.name);
                    setCategory(preset.cat);
                  }}
                >
                  <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                  <Text style={[styles.presetText, cropName === preset.name && styles.presetTextActive]}>
                    {preset.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Crop Name / Commodity</Text>
            <TextInput
              style={styles.input}
              value={cropName}
              onChangeText={setCropName}
              placeholder="e.g. Tomato (Himsona)"
            />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="50"
                />
              </View>

              <View style={styles.halfCol}>
                <Text style={styles.label}>Unit</Text>
                <View style={styles.unitRow}>
                  {(['kg', 'crates', 'quintal'] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, unit === u && styles.unitChipActive]}
                      onPress={() => setUnit(u)}
                    >
                      <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.label}>Expected Selling Date</Text>
            <TextInput
              style={styles.input}
              value={sellingDate}
              onChangeText={setSellingDate}
              placeholder="YYYY-MM-DD"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.85}>
              <LinearGradient
                colors={['#16a34a', '#15803d']}
                style={styles.btnGradient}
              >
                <Feather name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.btnText}>Add to Cold Storage</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.backgroundSubtle,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetEmoji: {
    fontSize: 16,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 4,
  },
  unitChip: {
    flex: 1,
    backgroundColor: colors.backgroundSubtle,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  unitTextActive: {
    color: colors.primary,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 20,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
