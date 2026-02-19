import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  API_KEY: '@notion_api_key',
  DATABASE_ID: '@notion_database_id',
};

export async function getSettings() {
  const [apiKey, databaseId] = await Promise.all([
    AsyncStorage.getItem(KEYS.API_KEY),
    AsyncStorage.getItem(KEYS.DATABASE_ID),
  ]);
  return { apiKey, databaseId };
}

export async function saveSettings(apiKey, databaseId) {
  await Promise.all([
    AsyncStorage.setItem(KEYS.API_KEY, apiKey),
    AsyncStorage.setItem(KEYS.DATABASE_ID, databaseId),
  ]);
}

export async function hasSettings() {
  const { apiKey, databaseId } = await getSettings();
  return Boolean(apiKey && databaseId);
}
