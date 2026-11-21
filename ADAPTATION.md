# 移植与框架适配指南 (Adaptation Guide)

## 1. 核心架构注意事项

### 1.1 禁止在洗牌时重建 `.fan-deck` 的 DOM
所有 `.fan-card` 必须在初次加载时一次性挂载在 `.fan-deck` 内。洗牌时 `FanDeck.cycle()` 只会原地切换 `pos-0` / `pos-1` / `pos-2` / `pos-back` 类名，从而触发底层卡片的连续 `transform` 补位过渡；如果在翻页时重设 `innerHTML`，过渡动画会被打断并闪烁。

### 1.2 侧边栏与容器遮挡排查
- 请将 `<div id="fan-float-layer" class="fan-float-layer"></div>` 放在 `<body>` 末尾（`FanDeck` 也会在找不到时自动创建）。
- 确保 `.fan-float-layer` 的 `z-index`（默认 `9999`）高于项目中的侧边栏、顶栏或抽屉层。
- `.fan-folder-card` 必须保持 `overflow: visible`，而底部的 `.fan-folder-collapse` 保留 `overflow: hidden` 来实现平滑手风琴展开。

### 1.3 防止浏览器「超级拖拽 / 鼠标手势」插件抢占图片拖拽
当 `.fan-card` 内放置原生 `<img>` 封面时，浏览器默认赋予图片 `draggable="true"`，左键按住拖拽时会触发原生 `dragstart`，从而唤醒浏览器的超级拖拽插件（如弹出「打开图片 / 新标签页打开」）。

`stacked-fan-deck` 已通过三层防护彻底解决该问题：
1. `.fan-card img.fan-cover-img` 默认设置了 `pointer-events: none; -webkit-user-drag: none; user-drag: none;`。
2. 建议在自定义渲染 `<img>` 时同时加上 `draggable="false"`。
3. `fan-deck.js` 在 `document` 捕获阶段对 `.fan-deck-wrap` 内的左键 `mousedown` 与 `dragstart` 调用 `e.preventDefault()` 拦截。

---

## 2. Vue 3 接入示例

```vue
<template>
  <div class="fan-folder-card" :id="`folderCard_${folder.id}`">
    <div class="fan-folder-head" @click="FanDeck.toggleFolder(folder.id)">
      <div class="fan-deck-wrap" :id="`fanDeckWrap_${folder.id}`" :data-deck-id="folder.id">
        <div class="fan-deck">
          <!-- 注意：必须使用稳定的 item.id 作为 :key，切勿用 index -->
          <div
            v-for="(item, idx) in folder.items"
            :key="item.id"
            class="fan-card"
            :class="posClass(idx)"
            draggable="false"
            :data-fan-idx="idx"
          >
            <img class="fan-cover-img" draggable="false" :src="item.cover" alt="" />
          </div>
        </div>
      </div>
      <div class="fan-folder-info">
        <div class="fan-folder-title-row">
          <span class="fan-folder-name">{{ folder.name }}</span>
        </div>
      </div>
    </div>
    <div class="fan-folder-collapse">
      <div class="fan-folder-collapse-inner">
        <div class="fan-folder-items">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## 3. React 接入示例

在 React 中最简单的方式是使用一个容器 `ref`，在 `useEffect` 中调用 `FanDeck.mountCards(deckId, items, renderHtml)`，由 `FanDeck` 原生接管卡组洗牌状态，避免 React state 变动触发重绘打断 Web Animations API 弧线动画。

```jsx
import { useEffect } from 'react';
import 'stacked-fan-deck/src/fan-deck.css';
import FanDeck from 'stacked-fan-deck';

export function FanFolder({ folder, children }) {
  useEffect(() => {
    FanDeck.mountCards(folder.id, folder.items, (item) => (
      `<img class="fan-cover-img" draggable="false" src="${item.cover}" alt="" />`
    ));
  }, [folder.id, folder.items]);

  return (
    <div className="fan-folder-card" id={`folderCard_${folder.id}`}>
      <div className="fan-folder-head" onClick={() => FanDeck.toggleFolder(folder.id)}>
        <div className="fan-deck-wrap" id={`fanDeckWrap_${folder.id}`} data-deck-id={folder.id}>
          <div className="fan-deck" />
        </div>
        <div className="fan-folder-info">
          <div className="fan-folder-title-row">
            <span className="fan-folder-name">{folder.name}</span>
          </div>
        </div>
      </div>
      <div className="fan-folder-collapse">
        <div className="fan-folder-collapse-inner">
          <div className="fan-folder-items">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. 暗黑模式与主题定制

只需覆盖以下 CSS 变量即可无缝适配任意设计系统：

```css
[data-theme="dark"] {
  --fd-surface: #131722;
  --fd-surface-2: #1b2030;
  --fd-surface-hover: rgba(255, 255, 255, 0.03);
  --fd-border: #23293a;
  --fd-accent: #fb7299;
  --fd-text: #f3f4f6;
  --fd-muted: #9ca3af;
  --fd-radius: 16px;
}
```
