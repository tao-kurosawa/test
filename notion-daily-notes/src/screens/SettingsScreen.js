import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { getSettings, saveSettings } from '../services/storage';

export default function SettingsScreen({ onBack }) {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    if (settings.apiKey) setApiKey(settings.apiKey);
    if (settings.databaseId) setDatabaseId(settings.databaseId);
  };

  const handleSave = async () => {
    if (!apiKey.trim() || !databaseId.trim()) {
      Alert.alert('入力エラー', 'APIキーとデータベースIDの両方を入力してください');
      return;
    }
    await saveSettings(apiKey.trim(), databaseId.trim());
    Alert.alert('保存完了', '設定を保存しました', [
      { text: 'OK', onPress: onBack },
    ]);
  };

  const openNotionIntegrations = () => {
    Linking.openURL('https://www.notion.so/my-integrations');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Notion API 設定</Text>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>セットアップ手順:</Text>
        <Text style={styles.helpText}>
          1. Notion Integrations ページで新しいIntegrationを作成{'\n'}
          2. Internal Integration Token (APIキー) をコピー{'\n'}
          3. Notionでデータベースを作成し、以下のプロパティを追加:{'\n'}
          {'   '}- Name (タイトル型) ← デフォルトで存在{'\n'}
          {'   '}- Date (日付型){'\n'}
          4. データベースのメニューから「コネクトを追加」で{'\n'}
          {'   '}作成したIntegrationを接続{'\n'}
          5. データベースURLからIDをコピー{'\n'}
          {'   '}(notion.so/ の後の32文字)
        </Text>
        <TouchableOpacity onPress={openNotionIntegrations}>
          <Text style={styles.linkText}>Notion Integrations を開く</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notion API キー</Text>
        <TextInput
          style={styles.input}
          placeholder="ntn_xxxxxxxxxxxxx..."
          placeholderTextColor="#BBB"
          value={apiKey}
          onChangeText={setApiKey}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>データベース ID</Text>
        <TextInput
          style={styles.input}
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          placeholderTextColor="#BBB"
          value={databaseId}
          onChangeText={setDatabaseId}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          データベースURLの notion.so/ の直後にある32文字の英数字
        </Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>設定を保存</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>戻る</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  helpSection: {
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  linkText: {
    color: '#2F80ED',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#2F80ED',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
