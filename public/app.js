// ======== Shared App helpers (User & Admin) ========
const App = (() => {
  const STORAGE_KEY = 'ytMappings';
  const ADMIN_PASS = 'admin123'; // 🔐 đổi mật khẩu tại đây

  function getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};
    } catch { return {}; }
  }

  function replaceAll(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj || {}));
  }

  function set(code, link) {
    const data = getAll();
    data[code] = link;
    replaceAll(data);
  }

  function remove(code) {
    const data = getAll();
    delete data[code];
    replaceAll(data);
  }

  function resolve(code) {
    return getAll()[code];
  }

  function toYoutubeEmbed(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    if (!m) return null;
    const id = m[1];
    let start = 0;
    const t = url.match(/[?&]t=(\d+)/);
    if (t) start = parseInt(t[1], 10) || 0;
    return `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ''}`;
  }

  function seedDemo() {
    const data = getAll();
    if (Object.keys(data).length === 0) {
      data['demo'] = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      replaceAll(data);
    }
  }

  function checkAdminPass(input) {
    return input === ADMIN_PASS;
  }

  return { getAll, replaceAll, set, remove, resolve, toYoutubeEmbed, seedDemo, checkAdminPass };
})();
