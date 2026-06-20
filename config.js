const SUPABASE_URL = 'https://cvvszmtuszpurrkmwxpo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dnN6bXR1c3pwdXJya213eHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjk4MzAsImV4cCI6MjA5NjcwNTgzMH0.T5rgTQxgoPj6r1ObssFX6VZ3e3q6u1TEzYvZNzIemBM';

async function sbFetch(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;

  const defaultHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  // Extra headers override defaults (important for upsert calls)
  const mergedHeaders = { ...defaultHeaders, ...extraHeaders };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: mergedHeaders,
    ...restOptions
  });

  // 204 No Content = success but no body (DELETE, some PATCHes)
  if (res.status === 204) return [];

  const text = await res.text();

  if (!res.ok) {
    // Try to parse Supabase error message
    let errMsg = `HTTP ${res.status}`;
    try {
      const errJson = JSON.parse(text);
      errMsg = errJson.message || errJson.error || errMsg;
    } catch (_) {
      errMsg = text || errMsg;
    }
    throw new Error(errMsg);
  }

  return text ? JSON.parse(text) : [];
}

// ============ CARS ============
async function dbGetCars() {
  return sbFetch('cars?order=created_at.desc');
}

async function dbAddCar(car) {
  const result = await sbFetch('cars', {
    method: 'POST',
    body: JSON.stringify(car),
  });
  // result might be array or single object
  return Array.isArray(result) ? result[0] : result;
}

async function dbUpdateCar(id, car) {
  const result = await sbFetch(`cars?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(car),
  });
  return Array.isArray(result) ? result[0] : result;
}

async function dbDeleteCar(id) {
  return sbFetch(`cars?id=eq.${id}`, {
    method: 'DELETE',
  });
}

// ============ PORTFOLIO ============
async function dbGetPortfolio() {
  const rows = await sbFetch('portfolio');
  const obj = {};
  rows.forEach(r => obj[r.key] = r.value);
  return obj;
}

async function dbSetPortfolio(key, value) {
  return sbFetch('portfolio', {
    method: 'POST',
    headers: {
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  });
}

// ============ SETTINGS ============
async function dbGetSettings() {
  const rows = await sbFetch('settings');
  const obj = {};
  rows.forEach(r => obj[r.key] = r.value);
  return obj;
}

async function dbSetSetting(key, value) {
  return sbFetch('settings', {
    method: 'POST',
    headers: {
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({ key, value }),
  });
}

// ============ HELPERS ============
function formatPrice(p) {
  return 'Rp ' + parseInt(p).toLocaleString('id-ID');
}