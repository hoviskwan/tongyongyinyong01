# 轻量库存管理应用 · 实现报告

> Work Item：wi-t1000008 ｜ 阶段：implementation ｜ 执行模式：inline-light（simple-frontend）
> 需求基线：`docs/wi-t1000008/requirements.md` ｜ 架构基线：`docs/wi-t1000008/architecture-baseline.md`

## 1. 本次交付的行为与实现依据

新建「轻量库存管理」React/Vite 单页应用（本工作项此前无任何源码，属新建应用，无既有业务行为需要保留）。交付的行为与需求基线逐条对应：

| 行为 | 需求/验收依据 | 落点 |
| --- | --- | --- |
| 首页展示物料总数、库存总量、预警数量，随数据实时更新 | 需求 2.6 / AC-01 | `src/App.jsx` + `src/components/StatsCards.jsx` + `computeStats()` |
| 物料列表展示编码、名称、分类、当前库存、安全库存；新增物料立即出现在列表；重复编码被拒绝并提示 | 需求 2.1/2.2 / AC-02 | `src/components/MaterialManager.jsx` + `addMaterial()` |
| 关键词搜索（匹配编码/名称/分类）与「仅看低库存」筛选，可叠加、可取消 | 需求 2.3 / AC-03 | `filterMaterials()` |
| 入库/出库登记：选择物料、填正整数数量；提交后自动更新库存并生成流水 | 需求 2.4 / AC-04、AC-05 | `src/components/MovementManager.jsx` + `recordInbound()/recordOutbound()` |
| 出库数量超过当前库存时阻止操作并明确提示，库存与流水均不变 | 需求 2.4 / AC-05 | `applyMovement()` 越界分支 |
| 库存流水可查看，含类型、物料、数量、发生时间 | 需求 2.5 / AC-06 | `MovementManager` 流水表格 |
| 数据本地状态管理，刷新/重开后保留 | 需求 2.7 + 架构基线 3 | `src/lib/storage.js`（localStorage 单一读写边界） |

## 2. 调用链与职责边界

```
界面组件（App / StatsCards / MaterialManager / MovementManager）
  └─ src/lib/inventory.js（唯一业务规则层：编码唯一、数量校验、出库不超库存、库存变更 + 流水同源写入、统计与过滤）
       └─ src/lib/storage.js（唯一持久化边界：localStorage 读写）
```

- 界面不直接读写 `localStorage`，也不在组件内散落业务计算；列表、统计、流水三处视图均从同一份状态派生，保证一致。
- 一次成功的出入库在 `applyMovement()` 内同一函数完成「更新当前库存」与「追加一条流水」两件事，库存与流水始终一致。
- 持久化为架构基线第 3 节明确的附加能力（需求未把刷新保留列为验收条件），本次按基线落地。

## 3. 实现范围（源码文件）

| 文件 | 职责 |
| --- | --- |
| `index.html` / `vite.config.js` / `package.json` | 应用入口、构建与脚本配置（React 18 + Vite 5 + Vitest 2） |
| `src/main.jsx` | 应用挂载 |
| `src/App.jsx` | 页面组合、应用状态（useReducer）、提示反馈、持久化副作用 |
| `src/lib/inventory.js` | 库存领域纯逻辑：校验、出入库、统计、过滤、初始示例数据 |
| `src/lib/inventory.test.js` | 14 项单元测试 |
| `src/lib/storage.js` | localStorage 读写边界（含损坏数据/存储不可用降级） |
| `src/components/StatsCards.jsx` | 首页三项统计卡片 |
| `src/components/MaterialManager.jsx` | 搜索/低库存筛选、物料表格、新增物料表单 |
| `src/components/MovementManager.jsx` | 入库/出库登记表单与库存流水 |
| `src/components/icons.jsx` | 内联 SVG 图标（不引入额外图标依赖） |
| `src/styles.css` | 全局样式（紧凑运营工具风格，低库存行与预警态有视觉区分） |
| `README.md` | 功能说明、运行/构建/测试命令、目录结构 |

## 4. 开发自检验证（实际执行）

| checkId | 命令 | 工作目录 | 状态 | 退出码 | 证据 |
| --- | --- | --- | --- | --- | --- |
| unit-tests | `npm test` | 本工作区根 | passed | 0 | `vitest run`：`Test Files 1 passed (1) / Tests 14 passed (14)`，覆盖新增物料（含重复编码拒绝、非法字段）、入库/出库（含超量阻止后库存与流水不变、出库到 0）、统计口径与叠加筛选 |
| build | `npm run build` | 本工作区根 | passed | 0 | `vite v5.4.21`：`✓ 37 modules transformed`，`✓ built in 210ms`，产物 `dist/`（JS 156.62 kB / gzip 50.58 kB，CSS 6.00 kB / gzip 1.80 kB） |
| dev-server | `npm run dev` | 本工作区根 | passed | — | Vite 就绪，预览地址 `http://localhost:5173/`（后台作业运行中） |

类型检查：本项目为 JSX + JS，未配置 TypeScript，按项目实际不执行 tsc（不以臆造命令充数）。

## 5. 需求/验收对照与残留边界

- AC-01 ~ AC-06 的业务规则均已实现并有对应单元测试覆盖（统计口径、搜索/筛选、库存增减、流水生成、超量阻止、重复编码拒绝）。
- **未由本阶段验证（按开发边界留给 QA）**：浏览器中的真实渲染与交互闭环（入口可达、表单提交读回、刷新后持久化读回、低库存视觉呈现）。本阶段未打开浏览器取证，亦不以此宣称验收通过。
- 已知限制（架构基线已接受，非缺陷）：数据仅存于当前浏览器 localStorage，不跨浏览器/设备共享；隐私模式等存储不可用时降级为仅内存状态（有代码内降级处理）。
- 出库超量提示文案含物料编码、名称与当前库存，便于操作人直接更正数量。

## 6. 结论

implementation 阶段交付物完整：应用可按 README 命令安装、启动、构建与测试；单元测试与构建均实际通过；预览服务运行中。浏览器端验收由后续 QA 阶段按其验收计划独立执行。
