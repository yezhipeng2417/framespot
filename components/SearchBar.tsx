import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type SearchBarProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchBar({ value, onChangeText, ...props }: SearchBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: colorScheme === 'dark' ? '#222' : '#f0f0f0' }
    ]}>
      <IconSymbol 
        name="chevron.left.forwardslash.chevron.right" 
        size={20} 
        color={Colors[colorScheme].icon} 
      />
      <TextInput
        style={[styles.input, { color: Colors[colorScheme].text }]}
        placeholderTextColor={Colors[colorScheme].icon}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 0,
  },
}); 