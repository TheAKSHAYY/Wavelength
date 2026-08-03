const STORAGE_PREFIX = "wavelength:";

async function loadKey(key, fallback) {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function saveKey(key, value) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error("storage save failed", key, error);
  }
}

export { STORAGE_PREFIX, loadKey, saveKey };
