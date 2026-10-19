import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ListOrdered } from './icons.jsx';
import { formatMovementTime, movementLabel, MOVEMENT_INBOUND, MOVEMENT_OUTBOUND } from '../lib/inventory.js';

function MovementForm({ kind, materials, onSubmit }) {
  const isInbound = kind === MOVEMENT_INBOUND;
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onSubmit({ materialId, quantity });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setQuantity('');
  };

  return (
    <form className={`subform subform--${isInbound ? 'in' : 'out'}`} onSubmit={handleSubmit} aria-label={isInbound ? '入库登记' : '出库登记'}>
      <h3>
        <span className={`form-icon form-icon--${isInbound ? 'in' : 'out'}`} aria-hidden="true">
          {isInbound ? <ArrowDownToLine /> : <ArrowUpFromLine />}
        </span>
        {isInbound ? '入库登记' : '出库登记'}
      </h3>
      <div className="form-grid">
        <label>
          选择物料
          <select value={materialId} onChange={(event) => setMaterialId(event.target.value)} required>
            <option value="">请选择物料</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.code} · {material.name}（当前库存 {material.currentStock}）
              </option>
            ))}
          </select>
        </label>
        <label>
          数量
          <input
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            type="number"
            min="1"
            step="1"
            placeholder="正整数"
            required
          />
        </label>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={`btn ${isInbound ? 'btn--primary' : 'btn--danger'}`}>
        提交{isInbound ? '入库' : '出库'}
      </button>
    </form>
  );
}

function MovementManager({ materials, movements, onInbound, onOutbound }) {
  return (
    <section className="panel" aria-label="出入库登记与流水">
      <div className="forms-row">
        <MovementForm kind={MOVEMENT_INBOUND} materials={materials} onSubmit={onInbound} />
        <MovementForm kind={MOVEMENT_OUTBOUND} materials={materials} onSubmit={onOutbound} />
      </div>

      <header className="panel-header panel-header--sub">
        <h2>
          <ListOrdered aria-hidden="true" /> 库存流水
        </h2>
        <p className="panel-meta">最近 {movements.length} 条</p>
      </header>
      <div className="table-wrap">
        <table className="movement-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>物料</th>
              <th className="num">数量</th>
              <th>发生时间</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>
                  <span className={`badge ${movement.type === MOVEMENT_INBOUND ? 'badge--in' : 'badge--out'}`}>
                    {movementLabel(movement.type)}
                  </span>
                </td>
                <td>
                  <span className="mono">{movement.materialCode}</span> {movement.materialName}
                </td>
                <td className="num strong">{movement.quantity}</td>
                <td className="time">{formatMovementTime(movement.occurredAt)}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
                  暂无流水，完成一次入库或出库后显示
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default MovementManager;
