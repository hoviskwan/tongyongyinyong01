import { useState } from 'react';
import { Search } from './icons.jsx';
import { filterMaterials } from '../lib/inventory.js';

function MaterialManager({ materials, allMaterialsCount, stats, onAddMaterial }) {
  const [keyword, setKeyword] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: '',
    safetyStock: '',
    currentStock: '',
  });
  const [formError, setFormError] = useState('');

  const visible = filterMaterials(materials, { keyword, lowStockOnly });

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onAddMaterial(form);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setFormError('');
    setForm({ code: '', name: '', category: '', safetyStock: '', currentStock: '' });
  };

  return (
    <section className="panel" aria-label="物料管理">
      <header className="panel-header">
        <h2>物料列表</h2>
        <p className="panel-meta">
          共 {allMaterialsCount} 条 · 低库存 {stats.alertCount} 条
        </p>
      </header>

      <div className="toolbar">
        <label className="search-field">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索编码 / 名称 / 分类"
            aria-label="搜索物料"
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => setLowStockOnly(event.target.checked)}
          />
          仅看低库存
        </label>
      </div>

      <div className="table-wrap">
        <table className="material-table">
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>分类</th>
              <th className="num">当前库存</th>
              <th className="num">安全库存</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((material) => {
              const low = material.currentStock < material.safetyStock;
              return (
                <tr key={material.id} className={low ? 'row-low' : undefined}>
                  <td className="mono">{material.code}</td>
                  <td>{material.name}</td>
                  <td>
                    <span className="tag">{material.category}</span>
                  </td>
                  <td className="num strong">{material.currentStock}</td>
                  <td className="num">{material.safetyStock}</td>
                  <td>
                    {low ? <span className="badge badge--warning">低库存</span> : <span className="badge badge--ok">正常</span>}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  没有匹配的物料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form className="subform" onSubmit={handleSubmit} aria-label="新增物料">
        <h3>新增物料</h3>
        <div className="form-grid">
          <label>
            编码
            <input value={form.code} onChange={update('code')} placeholder="如 MAT-1006" required />
          </label>
          <label>
            名称
            <input value={form.name} onChange={update('name')} placeholder="物料名称" required />
          </label>
          <label>
            分类
            <input value={form.category} onChange={update('category')} placeholder="如 紧固件" required />
          </label>
          <label>
            安全库存
            <input value={form.safetyStock} onChange={update('safetyStock')} type="number" min="0" step="1" placeholder="0" required />
          </label>
          <label>
            初始当前库存
            <input value={form.currentStock} onChange={update('currentStock')} type="number" min="0" step="1" placeholder="0" />
          </label>
        </div>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="btn btn--primary">
          加入列表
        </button>
      </form>
    </section>
  );
}

export default MaterialManager;
