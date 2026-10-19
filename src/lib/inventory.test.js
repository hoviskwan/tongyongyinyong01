import { describe, expect, it } from 'vitest';
import {
  addMaterial,
  computeStats,
  createInitialState,
  filterMaterials,
  isLowStock,
  parsePositiveInt,
  recordInbound,
  recordOutbound,
} from './inventory.js';

function baseState() {
  return {
    materials: [
      { id: 'm1', code: 'MAT-1001', name: '不锈钢螺栓 M8×30', category: '紧固件', currentStock: 100, safetyStock: 50 },
      { id: 'm2', code: 'ELE-2001', name: '直流电机 24V', category: '电气元件', currentStock: 10, safetyStock: 20 },
    ],
    movements: [],
  };
}

describe('新增物料', () => {
  it('写入合法字段后加入列表', () => {
    const result = addMaterial(baseState(), {
      code: 'PAK-3001',
      name: '瓦楞纸箱',
      category: '包装材料',
      safetyStock: '30',
      currentStock: '120',
    });
    expect(result.ok).toBe(true);
    expect(result.state.materials).toHaveLength(3);
    expect(result.state.materials[2]).toMatchObject({
      code: 'PAK-3001',
      name: '瓦楞纸箱',
      category: '包装材料',
      currentStock: 120,
      safetyStock: 30,
    });
  });

  it('拒绝重复编码且不产生重复条目', () => {
    const result = addMaterial(baseState(), {
      code: 'MAT-1001',
      name: '另一个物料',
      category: '紧固件',
      safetyStock: 1,
      currentStock: 0,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('已存在');
    expect(result.state).toBeUndefined();
  });

  it('拒绝空字段与负库存', () => {
    expect(addMaterial(baseState(), { code: '', name: 'x', category: 'y', safetyStock: 1 }).ok).toBe(false);
    expect(addMaterial(baseState(), { code: 'X-1', name: '', category: 'y', safetyStock: 1 }).ok).toBe(false);
    expect(addMaterial(baseState(), { code: 'X-1', name: 'x', category: '', safetyStock: 1 }).ok).toBe(false);
    expect(addMaterial(baseState(), { code: 'X-1', name: 'x', category: 'y', safetyStock: -1 }).ok).toBe(false);
    expect(addMaterial(baseState(), { code: 'X-1', name: 'x', category: 'y', safetyStock: 1, currentStock: -5 }).ok).toBe(false);
  });
});

describe('入库登记', () => {
  it('当前库存增加并生成入库流水', () => {
    const result = recordInbound(baseState(), { materialId: 'm1', quantity: 25 });
    expect(result.ok).toBe(true);
    const material = result.state.materials.find((m) => m.id === 'm1');
    expect(material.currentStock).toBe(125);
    expect(result.state.movements).toHaveLength(1);
    expect(result.movement).toMatchObject({ type: 'inbound', materialId: 'm1', quantity: 25 });
    expect(result.movement.materialCode).toBe('MAT-1001');
    expect(typeof result.movement.occurredAt).toBe('string');
  });

  it('拒绝非正整数数量且不改变库存', () => {
    for (const quantity of [0, -3, 1.5, 'abc', '']) {
      const result = recordInbound(baseState(), { materialId: 'm1', quantity });
      expect(result.ok).toBe(false);
      expect(result.state).toBeUndefined();
    }
    expect(parsePositiveInt('12')).toBe(12);
    expect(parsePositiveInt(7)).toBe(7);
  });

  it('拒绝不存在的物料', () => {
    expect(recordInbound(baseState(), { materialId: 'nope', quantity: 5 }).ok).toBe(false);
  });
});

describe('出库登记', () => {
  it('当前库存减少并生成出库流水', () => {
    const result = recordOutbound(baseState(), { materialId: 'm1', quantity: 40 });
    expect(result.ok).toBe(true);
    const material = result.state.materials.find((m) => m.id === 'm1');
    expect(material.currentStock).toBe(60);
    expect(result.state.movements).toHaveLength(1);
    expect(result.movement).toMatchObject({ type: 'outbound', materialId: 'm1', quantity: 40 });
  });

  it('数量超过当前库存时阻止，库存与流水均不变', () => {
    const state = baseState();
    const result = recordOutbound(state, { materialId: 'm1', quantity: 101 });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('超过');
    expect(result.state).toBeUndefined();
    // 原状态未被修改
    expect(state.materials.find((m) => m.id === 'm1').currentStock).toBe(100);
    expect(state.movements).toHaveLength(0);
  });

  it('允许出库到 0 库存', () => {
    const result = recordOutbound(baseState(), { materialId: 'm2', quantity: 10 });
    expect(result.ok).toBe(true);
    expect(result.state.materials.find((m) => m.id === 'm2').currentStock).toBe(0);
  });
});

describe('首页统计', () => {
  it('按口径计算物料总数、库存总量与预警数量', () => {
    const stats = computeStats(baseState().materials);
    expect(stats.totalMaterials).toBe(2);
    expect(stats.totalStock).toBe(110);
    expect(stats.alertCount).toBe(1); // m2: 10 < 20
  });

  it('出入库后统计同步变化', () => {
    let state = baseState();
    state = recordInbound(state, { materialId: 'm2', quantity: 30 }).state; // 10 -> 40，脱离低库存
    const stats = computeStats(state.materials);
    expect(stats.totalStock).toBe(140);
    expect(stats.alertCount).toBe(0);
    state = recordOutbound(state, { materialId: 'm1', quantity: 90 }).state; // 100 -> 10 < 50，进入低库存
    expect(computeStats(state.materials).alertCount).toBe(1);
  });

  it('低库存判定为当前库存严格小于安全库存', () => {
    expect(isLowStock({ currentStock: 9, safetyStock: 10 })).toBe(true);
    expect(isLowStock({ currentStock: 10, safetyStock: 10 })).toBe(false);
    expect(isLowStock({ currentStock: 11, safetyStock: 10 })).toBe(false);
  });
});

describe('搜索与低库存筛选', () => {
  const materials = baseState().materials;

  it('关键词匹配编码、名称、分类，并可叠加低库存筛选', () => {
    expect(filterMaterials(materials, { keyword: 'MAT-1001' }).map((m) => m.id)).toEqual(['m1']);
    expect(filterMaterials(materials, { keyword: '电机' }).map((m) => m.id)).toEqual(['m2']);
    expect(filterMaterials(materials, { keyword: '电气' }).map((m) => m.id)).toEqual(['m2']);
    expect(filterMaterials(materials, { keyword: '  ' }).map((m) => m.id)).toEqual(['m1', 'm2']);
    expect(filterMaterials(materials, { lowStockOnly: true }).map((m) => m.id)).toEqual(['m2']);
    expect(filterMaterials(materials, { keyword: 'ELE', lowStockOnly: true }).map((m) => m.id)).toEqual(['m2']);
    expect(filterMaterials(materials, { keyword: 'MAT', lowStockOnly: true }).map((m) => m.id)).toEqual([]);
  });
});

describe('初始数据', () => {
  it('示例物料字段完整且含低库存物料', () => {
    const state = createInitialState();
    expect(state.materials.length).toBeGreaterThan(0);
    for (const material of state.materials) {
      expect(material.code).toBeTruthy();
      expect(material.name).toBeTruthy();
      expect(material.category).toBeTruthy();
      expect(Number.isInteger(material.currentStock)).toBe(true);
      expect(Number.isInteger(material.safetyStock)).toBe(true);
    }
    expect(computeStats(state.materials).alertCount).toBeGreaterThan(0);
    expect(state.movements).toEqual([]);
  });
});
