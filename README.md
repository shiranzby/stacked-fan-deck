# Stacked Fan-Deck

零外部依赖的 **扇形堆叠卡组（Stacked Fan-Deck）& 零闪烁手风琴收藏夹** Web UI 组件。

- **在线演示 (GitHub Pages)**: https://shiranzby.github.io/stacked-fan-deck/
- **仓库地址**: https://github.com/shiranzby/stacked-fan-deck

---

## 核心特性

1. **零闪烁底层全叠联动**：首次挂载全部 `.fan-card`，洗牌时仅原地切换 `pos-0` / `pos-1` / `pos-2` / `pos-back` 位置类触发 CSS `transition`，底层卡片平滑前移/后退，绝不重建 `innerHTML`。
2. **顶层 Portal 越界飞出（`#fan-float-layer`）**：拖拽或洗牌中的卡片克隆挂载到 `<body>` 直属的 `position: fixed; z-index: 9999` 浮层，可自由越过外层容器与侧边栏飞出。
3. **支持鼠标 & 触屏左右拖拽洗牌**：内置 `PointerEvents` 手势识别，左滑（`dx <= -24px`）下一张、右滑（`dx >= 24px`）上一张、轻点切换到下一张；自动屏蔽 `<img>` 原生拖拽，不与浏览器超级拖拽/鼠标手势插件冲突。
4. **CSS Grid 零闪烁手风琴展开**：采用 `grid-template-rows: 0fr -> 1fr` 平滑展开/收起列表，无需计算像素高度。
5. **开箱即用暗黑模式**：基于 CSS Variables（`--fd-*`），支持 `[data-theme="dark"]` 与 `.dark`。

---

## 快速开始

### 1. 引入样式与脚本

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/shiranzby/stacked-fan-deck@main/src/fan-deck.css">

<!-- 建议放在 <body> 末尾（未手动放置时 JS 也会自动创建） -->
<div id="fan-float-layer" class="fan-float-layer"></div>
<script src="https://cdn.jsdelivr.net/gh/shiranzby/stacked-fan-deck@main/src/fan-deck.js"></script>
```

### 2. HTML 模板结构

```html
<div class="fan-folder-card" id="folderCard_demo-1">
  <div class="fan-folder-head" onclick="FanDeck.toggleFolder('demo-1')">
    <div class="fan-deck-wrap" id="fanDeckWrap_demo-1" data-deck-id="demo-1">
      <div class="fan-deck"></div>
    </div>

    <div class="fan-folder-info">
      <div class="fan-folder-title-row">
        <span class="fan-folder-dot" style="background:#fb7299;"></span>
        <span class="fan-folder-name">我的常用收藏</span>
        <span class="fan-folder-cnt">4 条内容</span>
      </div>
      <div class="fan-folder-previews">
        <div class="fan-folder-pv">01 示例项目 A</div>
        <div class="fan-folder-pv">02 示例项目 B</div>
      </div>
    </div>

    <div class="fan-folder-right" onclick="event.stopPropagation()">
      <button type="button" class="fan-chev-btn" onclick="FanDeck.toggleFolder('demo-1')" title="展开 / 收起">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
  </div>

  <div class="fan-folder-collapse">
    <div class="fan-folder-collapse-inner">
      <div class="fan-folder-items">
        <!-- 展开后的列表内容 -->
      </div>
    </div>
  </div>
</div>
```

### 3. 挂载卡组数据

```javascript
const items = [
  { title: 'Clash Verge Rev', sub: 'v2.5.10 · 网络工具', cover: 'https://...' },
  { title: 'LocalSend', sub: 'v1.18.2 · 局域网传输', cover: 'https://...' },
];

// 模式 A：自定义信息卡片
FanDeck.mountCards('demo-1', items, (item) => `
  <div class="fan-card-inner" style="border-top:3px solid #fb7299;">
    <div style="font-size:12px;font-weight:700;">${item.title}</div>
    <div style="font-size:11px;color:var(--fd-muted);">${item.sub}</div>
  </div>
`);

// 模式 B：纯图片封面（推荐加上 class="fan-cover-img" 和 draggable="false"）
FanDeck.mountCards('demo-1', items, (item) => `
  <img class="fan-cover-img" draggable="false" src="${item.cover}" alt="">
`);
```

---

## API 参考

| 方法 | 参数 | 说明 |
|---|---|---|
| `FanDeck.mountCards(deckId, items, renderCardContent)` | `deckId`: 字符串<br>`items`: 数据数组<br>`renderCardContent`: `(item, idx) => htmlString` | 挂载指定卡组的全部卡片 DOM。仅在初始化或数据变化时调用，切勿在翻页时调用。 |
| `FanDeck.cycle(deckId, delta)` | `delta`: `1`（下一张）或 `-1`（上一张） | 手动触发一次弧线洗牌并联动底层卡片补位。 |
| `FanDeck.toggleFolder(deckId, forceExpand?)` | `forceExpand`: 可选布尔值 | 切换（或强制设置）手风琴展开/收起状态。 |
| `FanDeck.getOffset(deckId)` | `deckId`: 字符串 | 获取当前卡组顶层卡片的索引偏移量。 |

---

## 框架接入与更多细节

请查看 [ADAPTATION.md](./ADAPTATION.md)（包含 Vue 3、React 接入示例、暗黑模式变量覆盖、侧边栏遮挡排查及防超级拖拽插件处理说明）。

## License

[MIT](./LICENSE) © 2026 shiranzby
