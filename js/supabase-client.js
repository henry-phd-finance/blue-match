import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const CONFIG_STORAGE_KEY = 'bluematch_supabase_config';

// 기본 설정값 (여기에 Project URL과 Anon Key를 직접 넣거나, 웹 UI의 'DB 연동 설정' 모달에서 입력 가능)
export const DEFAULT_SUPABASE_CONFIG = {
  url: '',
  anonKey: ''
};

let supabaseInstance = null;

export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read Supabase config from localStorage:', e);
  }
  return DEFAULT_SUPABASE_CONFIG;
}

export function saveSupabaseConfig(url, anonKey) {
  const cleanUrl = (url || '').trim();
  const cleanKey = (anonKey || '').trim();
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
  supabaseInstance = null;
  return getSupabaseClient();
}

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  try {
    supabaseInstance = createClient(url, anonKey);
    return supabaseInstance;
  } catch (e) {
    console.error('Supabase initialization error:', e);
    return null;
  }
}

export async function uploadProfilePhoto(file) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // 데모 모드일 경우 브라우저 Data URL 반환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `profiles/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('profile-photos').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;

  // 비공개 버킷이므로 1년 유효 Signed URL 발급 (또는 Public 버킷일 경우 Public URL)
  const { data: signedData, error: signErr } = await supabase.storage
    .from('profile-photos')
    .createSignedUrl(filePath, 60 * 60 * 24 * 365);

  if (!signErr && signedData?.signedUrl) {
    return signedData.signedUrl;
  }
  const { data: pubData } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
  return pubData.publicUrl;
}
