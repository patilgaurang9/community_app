import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActiveFilterChipProps {
  label: string;
  onRemove: () => void;
}

export default function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.removeButton}
      >
        <Ionicons name="close" size={16} color="#52525B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3F3F46',
    marginRight: 8,
    gap: 6,
  },
  chipText: {
    color: '#E4E4E7',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#52525B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

