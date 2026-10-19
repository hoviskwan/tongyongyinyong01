import { AlertTriangle, Boxes, PackageCheck, TriangleAlert } from './icons.jsx';

function StatsCards({ stats }) {
  return (
    <section className="stats" aria-label="首页统计">
      <article className="stat-card">
        <span className="stat-icon stat-icon--neutral" aria-hidden="true">
          <Boxes />
        </span>
        <div>
          <p className="stat-label">物料总数</p>
          <p className="stat-value" data-testid="stat-total-materials">{stats.totalMaterials}</p>
        </div>
      </article>
      <article className="stat-card">
        <span className="stat-icon stat-icon--info" aria-hidden="true">
          <PackageCheck />
        </span>
        <div>
          <p className="stat-label">库存总量</p>
          <p className="stat-value" data-testid="stat-total-stock">{stats.totalStock}</p>
        </div>
      </article>
      <article className={`stat-card${stats.alertCount > 0 ? ' stat-card--alert' : ''}`}>
        <span className="stat-icon stat-icon--warning" aria-hidden="true">
          <TriangleAlert />
        </span>
        <div>
          <p className="stat-label">预警数量（低于安全库存）</p>
          <p className="stat-value" data-testid="stat-alert-count">{stats.alertCount}</p>
          {stats.alertCount > 0 && (
            <p className="stat-hint">
              <AlertTriangle aria-hidden="true" /> 有物料库存低于安全库存，请及时补货
            </p>
          )}
        </div>
      </article>
    </section>
  );
}

export default StatsCards;
