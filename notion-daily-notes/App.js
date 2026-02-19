import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export default function App() {
  const [screen, setScreen] = useState('home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notion メモ</Text>
        {screen === 'home' && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setScreen('settings')}
          >
            <Text style={styles.headerButtonText}>設定</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.container}>
        {screen === 'home' ? (
          <HomeScreen onOpenSettings={() => setScreen('settings')} />
        ) : (
          <SettingsScreen
            onBack={() => setScreen('home')}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F80ED',
  },
  header: {
    backgroundColor: '#2F80ED',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
});
