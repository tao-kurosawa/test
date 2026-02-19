import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { createNote, fetchNotes, fetchPageContent } from '../services/notionApi';
import { getSettings, hasSettings } from '../services/storage';

export default function HomeScreen({ onOpenSettings }) {
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsOk, setSettingsOk] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [expandedContent, setExpandedContent] = useState({});

  useEffect(() => {
    checkSettingsAndLoad();
  }, []);

  const checkSettingsAndLoad = async () => {
    const ok = await hasSettings();
    setSettingsOk(ok);
    if (ok) {
      loadNotes();
    }
  };

  const loadNotes = async () => {
    setLoading(true);
    try {
      const { apiKey, databaseId } = await getSettings();
      const result = await fetchNotes(apiKey, databaseId);
      setNotes(result);
    } catch (e) {
      Alert.alert('読み込みエラー', e.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { apiKey, databaseId } = await getSettings();
      const result = await fetchNotes(apiKey, databaseId);
      setNotes(result);
    } catch (e) {
      Alert.alert('読み込みエラー', e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSave = async () => {
    if (!noteText.trim()) {
      Alert.alert('入力エラー', 'メモを入力してください');
      return;
    }

    setSaving(true);
    try {
      const { apiKey, databaseId } = await getSettings();
      await createNote(apiKey, databaseId, noteText.trim());
      setNoteText('');
      Alert.alert('保存完了', 'Notionにメモを保存しました');
      loadNotes();
    } catch (e) {
      Alert.alert('保存エラー', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExpandNote = async (noteId) => {
    if (expandedNoteId === noteId) {
      setExpandedNoteId(null);
      return;
    }
    setExpandedNoteId(noteId);
    if (!expandedContent[noteId]) {
      try {
        const { apiKey } = await getSettings();
        const content = await fetchPageContent(apiKey, noteId);
        setExpandedContent((prev) => ({ ...prev, [noteId]: content }));
      } catch (e) {
        setExpandedContent((prev) => ({ ...prev, [noteId]: '(読み込み失敗)' }));
      }
    }
  };

  const formatDisplayDate = (dateStr) => {
    const d = new Date(dateStr);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}/${day} ${h}:${min}`;
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => handleExpandNote(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteDate}>{formatDisplayDate(item.date)}</Text>
        <Text style={styles.noteTitle} numberOfLines={expandedNoteId === item.id ? undefined : 1}>
          {item.title}
        </Text>
      </View>
      {expandedNoteId === item.id && (
        <Text style={styles.noteContent}>
          {expandedContent[item.id] || '読み込み中...'}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (!settingsOk) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.setupText}>
          Notion APIキーとデータベースIDを{'\n'}設定してください
        </Text>
        <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
          <Text style={styles.settingsButtonText}>設定を開く</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inputSection}>
        <Text style={styles.currentTime}>
          {new Date().toLocaleString('ja-JP')}
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="今日のメモを入力..."
          placeholderTextColor="#999"
          multiline
          value={noteText}
          onChangeText={setNoteText}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Notionに保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>最近のメモ</Text>
        {loading ? (
          <ActivityIndicator style={styles.loader} color="#2F80ED" />
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>メモはまだありません</Text>
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  setupText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  settingsButton: {
    backgroundColor: '#2F80ED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  currentTime: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 160,
    backgroundColor: '#FAFAFA',
  },
  saveButton: {
    backgroundColor: '#2F80ED',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#A0C4F1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  loader: {
    marginTop: 20,
  },
  noteItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#2F80ED',
    fontWeight: '600',
    marginRight: 10,
    minWidth: 70,
  },
  noteTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  noteContent: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
