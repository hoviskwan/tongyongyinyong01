// 浏览器持久化边界：界面不直接读写 localStorage，统一经本模块。

const STORAGE_KEY = 'lightweight-inventory-state-v1';

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.materials) || !Array.isArray(parsed.movements)) {
      return null;
    }
    return { materials: parsed.materials, movements: parsed.movements };
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 存储不可用（如隐私模式）时静默降级为仅内存状态，不影响本次会话使用。
  }
}
