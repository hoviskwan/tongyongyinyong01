import { useEffect, useMemo, useRef, useState } from 'react';
import StatsCards from './components/StatsCards.jsx';
import MaterialManager from './components/MaterialManager.jsx';
import MovementManager from './components/MovementManager.jsx';
import {
  addMaterial,
  computeStats,
  createInitialState,
  filterMaterials,
  recordInbound,
  recordOutbound,
} from './lib/inventory.js';
import { loadState, saveState } from './lib/storage.js';

function App() {
  const [state, setState] = useState(() => loadState() ?? createInitialState());
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const stats = useMemo(() => computeStats(state.materials), [state.materials]);
  const visibleMaterials = useMemo(() => filterMaterials(state.materials, {}), [state.materials]);

  const showNotice = (type, text) => {
    setNotice({ type, text });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4000);
  };

  const handleAddMaterial = (form) => {
    const result = addMaterial(state, form);
    if (!result.ok) return result;
    setState(result.state);
    showNotice('success', `物料「${form.code} ${form.name}」已加入列表`);
    return result;
  };

  const handleMovement = (kind) => (payload) => {
    const run = kind === 'inbound' ? recordInbound : recordOutbound;
    const result = run(state, payload);
    if (!result.ok) return result;
    setState(result.state);
    const label = kind === 'inbound' ? '入库' : '出库';
    showNotice('success', `${label}成功：${result.movement.materialCode} ${result.movement.materialName} × ${result.movement.quantity}`);
    return result;
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>轻量库存管理</h1>
          <p className="app-subtitle">物料 · 出入库 · 流水 · 预警，一页完成日常库存操作</p>
        </div>
      </header>

      <StatsCards stats={stats} />

      {notice && (
        <p className={`notice notice--${notice.type}`} role="status">
          {notice.text}
        </p>
      )}

      <main className="layout">
        <MaterialManager
          materials={visibleMaterials}
          allMaterialsCount={state.materials.length}
          stats={stats}
          onAddMaterial={handleAddMaterial}
        />
        <MovementManager
          materials={state.materials}
          movements={state.movements}
          onInbound={handleMovement('inbound')}
          onOutbound={handleMovement('outbound')}
        />
      </main>

      <footer className="app-footer">数据保存在本地浏览器（localStorage），刷新后仍可查看</footer>
    </div>
  );
}

export default App;
