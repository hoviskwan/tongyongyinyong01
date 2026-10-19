// 库存领域纯逻辑：数据形状、校验、状态变更、统计与过滤。
// 本模块不依赖 React 与浏览器 API，可被界面与单元测试直接调用。

export const MOVEMENT_INBOUND = 'inbound';
export const MOVEMENT_OUTBOUND = 'outbound';

const MOVEMENT_LABELS = {
  [MOVEMENT_INBOUND]: '入库',
  [MOVEMENT_OUTBOUND]: '出库',
};

let idCounter = 0;

function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function parseCount(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  }
  return null;
}

export function parseNonNegativeInt(value) {
  const parsed = parseCount(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}

export function parsePositiveInt(value) {
  const parsed = parseCount(value);
  return parsed !== null && parsed >= 1 ? parsed : null;
}

function parseRequiredText(value, fieldLabel) {
  if (typeof value !== 'string' || value.trim() === '') {
    return { ok: false, error: `请填写${fieldLabel}` };
  }
  return { ok: true, text: value.trim() };
}

/** 低库存判定：当前库存 < 安全库存。 */
export function isLowStock(material) {
  return material.currentStock < material.safetyStock;
}

/**
 * 校验并构造一个物料（不检查编码唯一性，唯一性由 addMaterial 在状态层校验）。
 */
export function createMaterial(input) {
  const code = parseRequiredText(input?.code, '物料编码');
  if (!code.ok) return code;
  const name = parseRequiredText(input?.name, '物料名称');
  if (!name.ok) return name;
  const category = parseRequiredText(input?.category, '物料分类');
  if (!category.ok) return category;

  const safetyStock = parseNonNegativeInt(input?.safetyStock);
  if (safetyStock === null) return { ok: false, error: '安全库存必须为 0 或正整数' };

  const currentStock = parseNonNegativeInt(input?.currentStock ?? 0);
  if (currentStock === null) return { ok: false, error: '当前库存必须为 0 或正整数' };

  return {
    ok: true,
    material: {
      id: nextId('mat'),
      code: code.text,
      name: name.text,
      category: category.text,
      currentStock,
      safetyStock,
    },
  };
}

/**
 * 新增物料。编码重复时拒绝并提示，列表不出现重复条目。
 */
export function addMaterial(state, input) {
  const created = createMaterial(input);
  if (!created.ok) return created;

  const duplicate = state.materials.some(
    (material) => material.code === created.material.code,
  );
  if (duplicate) {
    return { ok: false, error: `物料编码「${created.material.code}」已存在，请更换编码` };
  }

  return { ok: true, state: { ...state, materials: [...state.materials, created.material] } };
}

function findMaterial(state, materialId) {
  return state.materials.find((material) => material.id === materialId) ?? null;
}

function buildMovement(state, materialId, type, quantity) {
  const material = findMaterial(state, materialId);
  return {
    movement: {
      id: nextId('mov'),
      type,
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      quantity,
      occurredAt: new Date().toISOString(),
    },
  };
}

function applyMovement(state, materialId, quantity, type) {
  const material = findMaterial(state, materialId);
  if (!material) {
    return { ok: false, error: '请选择物料' };
  }
  if (type === MOVEMENT_OUTBOUND && quantity > material.currentStock) {
    return {
      ok: false,
      error: `出库数量超过「${material.code} ${material.name}」的当前库存（${material.currentStock}），已阻止本次出库`,
    };
  }
  const delta = type === MOVEMENT_INBOUND ? quantity : -quantity;
  const { movement } = buildMovement(state, materialId, type, quantity);
  return {
    ok: true,
    movement,
    state: {
      ...state,
      materials: state.materials.map((item) =>
        item.id === material.id ? { ...item, currentStock: item.currentStock + delta } : item,
      ),
      movements: [movement, ...state.movements],
    },
  };
}

/**
 * 入库登记：当前库存增加，并生成一条入库流水。
 */
export function recordInbound(state, { materialId, quantity }) {
  const parsed = parsePositiveInt(quantity);
  if (parsed === null) return { ok: false, error: '入库数量必须为正整数' };
  return applyMovement(state, materialId, parsed, MOVEMENT_INBOUND);
}

/**
 * 出库登记：当前库存减少，并生成一条出库流水；
 * 数量超过当前库存时阻止，库存与流水均不变。
 */
export function recordOutbound(state, { materialId, quantity }) {
  const parsed = parsePositiveInt(quantity);
  if (parsed === null) return { ok: false, error: '出库数量必须为正整数' };
  return applyMovement(state, materialId, parsed, MOVEMENT_OUTBOUND);
}

/**
 * 首页统计：物料总数、库存总量、预警数量（低库存物料数）。
 */
export function computeStats(materials) {
  return {
    totalMaterials: materials.length,
    totalStock: materials.reduce((sum, material) => sum + material.currentStock, 0),
    alertCount: materials.filter(isLowStock).length,
  };
}

/**
 * 列表过滤：关键词匹配编码、名称、分类；低库存筛选只保留当前库存低于安全库存的物料；
 * 两个条件可叠加。
 */
export function filterMaterials(materials, { keyword = '', lowStockOnly = false } = {}) {
  const needle = String(keyword).trim().toLowerCase();
  return materials.filter((material) => {
    const matchesKeyword =
      needle === '' ||
      material.code.toLowerCase().includes(needle) ||
      material.name.toLowerCase().includes(needle) ||
      material.category.toLowerCase().includes(needle);
    const matchesLowStock = !lowStockOnly || isLowStock(material);
    return matchesKeyword && matchesLowStock;
  });
}

export function movementLabel(type) {
  return MOVEMENT_LABELS[type] ?? type;
}

export function formatMovementTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** 首次使用的示例数据，便于首页统计与预警开箱可见。 */
export function createInitialState() {
  return {
    materials: [
      { id: 'mat-seed-1', code: 'MAT-1001', name: '不锈钢螺栓 M8×30', category: '紧固件', currentStock: 320, safetyStock: 100 },
      { id: 'mat-seed-2', code: 'MAT-1002', name: '尼龙螺母 M8', category: '紧固件', currentStock: 80, safetyStock: 100 },
      { id: 'mat-seed-3', code: 'ELE-2001', name: '直流电机 24V', category: '电气元件', currentStock: 45, safetyStock: 20 },
      { id: 'mat-seed-4', code: 'ELE-2002', name: 'PLC 控制器', category: '电气元件', currentStock: 8, safetyStock: 10 },
      { id: 'mat-seed-5', code: 'PAK-3001', name: '瓦楞纸箱 400×300', category: '包装材料', currentStock: 500, safetyStock: 200 },
    ],
    movements: [],
  };
}
