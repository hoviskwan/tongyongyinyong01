# 轻量库存管理

物料列表、出入库登记、库存流水与首页预警统计的轻量 React 单页应用。数据保存在浏览器本地（localStorage），不依赖后端服务。

## 功能

- **首页统计**：物料总数、库存总量、预警数量（当前库存低于安全库存的物料数），随数据变动实时更新。
- **物料列表**：展示编码、名称、分类、当前库存、安全库存与库存状态；支持关键词搜索（匹配编码 / 名称 / 分类）与「仅看低库存」筛选，可叠加使用；支持新增物料（编码唯一，重复编码被拒绝并提示）。
- **出入库登记**：入库、出库两类表单，选择物料并填写正整数数量即可提交；成功后自动更新对应物料当前库存并生成库存流水；出库数量超过当前库存时阻止操作并提示，库存与流水不变。
- **库存流水**：按时间倒序展示每次出入库记录，含类型（入库 / 出库）、物料、数量、发生时间。

## 技术形态

- React 18 + Vite 单页应用，无服务端、无数据库。
- 业务规则集中在 `src/lib/inventory.js`（校验、库存变更、统计、过滤），界面经统一边界读写；持久化经 `src/lib/storage.js` 单一模块完成。
- 单元测试：Vitest，`npm test`。

## 本地运行

```bash
npm install
npm run dev      # 启动开发服务器，按终端输出的本地地址在浏览器打开
```

## 构建与测试

```bash
npm run build    # 生产构建（输出 dist/）
npm test         # 运行单元测试
```

## 目录结构

```
index.html                  应用入口 HTML
vite.config.js              Vite 配置
src/
  main.jsx                  应用挂载入口
  App.jsx                   页面组合与状态管理（单一读写边界）
  styles.css                全局样式
  lib/
    inventory.js            库存领域逻辑：校验、出入库、统计、过滤
    inventory.test.js       单元测试
    storage.js              localStorage 读写边界
  components/
    StatsCards.jsx          首页三项统计
    MaterialManager.jsx     物料列表、搜索筛选与新增物料
    MovementManager.jsx     出入库登记表单与库存流水
    icons.jsx               内联 SVG 图标
```

## 数据说明

首次打开会载入 5 条示例物料（含低库存物料）；之后的所有变更保存在当前浏览器的 localStorage 中，刷新或重开页面后仍可查看。清除浏览器站点数据即可恢复初始示例。
