/**
 * Stacked Fan-Deck & Zero-Flicker Accordion Folder
 * https://github.com/shiranzby/stacked-fan-deck
 * MIT License
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FanDeck = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const offsets = {};
  let activeSwipe = null;
  let listenersBound = false;

  function getPosClass(rel) {
    if (rel === 0) return 'pos-0';
    if (rel === 1) return 'pos-1';
    if (rel === 2) return 'pos-2';
    return 'pos-back';
  }

  function ensureFloatLayer() {
    let layer = document.getElementById('fan-float-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'fan-float-layer';
      layer.className = 'fan-float-layer';
      document.body.appendChild(layer);
    }
    return layer;
  }

  function createFloatClone(cardEl, deckEl) {
    const layer = ensureFloatLayer();
    const r = deckEl.getBoundingClientRect();
    const clone = cardEl.cloneNode(true);
    clone.classList.remove('pos-0', 'pos-1', 'pos-2', 'pos-back');
    clone.style.cssText =
      'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;' +
      'width:' + r.width + 'px;height:' + r.height + 'px;margin:0;' +
      'transform-origin:15% 88%;transition:none;pointer-events:none;' +
      'box-shadow:0 12px 28px rgba(15,23,42,0.22);';
    layer.appendChild(clone);
    return clone;
  }

  function mountCards(deckId, items, renderCardContent) {
    bindGlobalListeners();
    const wrap = document.getElementById('fanDeckWrap_' + deckId);
    if (!wrap) return;
    const deck = wrap.querySelector('.fan-deck');
    if (!deck) return;

    const list = Array.isArray(items) ? items : [];
    const total = list.length;
    const offset = total ? (((offsets[deckId] || 0) % total) + total) % total : 0;

    if (total === 0) {
      deck.innerHTML = '<div class="fan-card pos-0"><div class="fan-card-inner" style="justify-content:center;align-items:center;color:var(--fd-muted)">暂无内容</div></div>';
      return;
    }

    deck.innerHTML = list.map(function (item, idx) {
      const rel = (idx - offset + total) % total;
      return '<div class="fan-card ' + getPosClass(rel) + '" draggable="false" data-fan-idx="' + idx + '">' +
        renderCardContent(item, idx) +
      '</div>';
    }).join('');
  }

  function cycle(deckId, delta, startDragTransform, existingClone) {
    const wrap = document.getElementById('fanDeckWrap_' + deckId);
    const deckEl = wrap ? wrap.querySelector('.fan-deck') : null;
    const folderCard = document.getElementById('folderCard_' + deckId);
    if (!wrap || !deckEl) {
      if (existingClone) existingClone.remove();
      return;
    }

    const cards = Array.from(wrap.querySelectorAll('.fan-card[data-fan-idx]'));
    const total = cards.length;
    if (total <= 1) {
      if (existingClone) existingClone.remove();
      return;
    }

    const prevOffset = (((offsets[deckId] || 0) % total) + total) % total;
    const nextOffset = (prevOffset + (delta || 1) + total) % total;
    offsets[deckId] = nextOffset;

    const oldTopEl = cards.find(function (c) { return Number(c.getAttribute('data-fan-idx')) === prevOffset; });
    const newTopEl = cards.find(function (c) { return Number(c.getAttribute('data-fan-idx')) === nextOffset; });

    if (folderCard) {
      folderCard.classList.add('is-shuffling');
      clearTimeout(folderCard._shuffleTimer);
      folderCard._shuffleTimer = setTimeout(function () {
        folderCard.classList.remove('is-shuffling');
      }, 450);
    }

    cards.forEach(function (c) {
      const idx = Number(c.getAttribute('data-fan-idx'));
      const rel = (idx - nextOffset + total) % total;
      c.classList.remove('pos-0', 'pos-1', 'pos-2', 'pos-back');
      c.classList.add(getPosClass(rel));
    });

    const backTf = total >= 4
      ? 'translate(28px, 17px) rotate(9deg) scale(0.84)'
      : (total === 3 ? 'translate(24px, 14px) rotate(7.2deg) scale(0.88)' : 'translate(13px, 7px) rotate(3.6deg) scale(0.94)');

    if ((delta || 1) > 0 && oldTopEl) {
      const clone = existingClone || createFloatClone(oldTopEl, deckEl);
      if (clone && clone.animate) {
        oldTopEl.style.visibility = 'hidden';
        const anim = clone.animate([
          { transform: startDragTransform || 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: 1, offset: 0 },
          { transform: 'translate(-96px, -14px) rotate(-16deg) scale(0.95)', opacity: 0.98, offset: 0.44 },
          { transform: backTf, opacity: total >= 4 ? 0 : 0.35, offset: 0.92 },
          { transform: backTf, opacity: 0, offset: 1 }
        ], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
        setTimeout(function () { oldTopEl.style.visibility = ''; }, 240);
        anim.onfinish = function () { oldTopEl.style.visibility = ''; clone.remove(); };
      } else if (clone) {
        clone.remove();
      }
    } else if (delta < 0 && newTopEl) {
      if (existingClone) existingClone.remove();
      if (oldTopEl) oldTopEl.style.visibility = '';
      const clone = createFloatClone(newTopEl, deckEl);
      if (clone && clone.animate) {
        newTopEl.style.visibility = 'hidden';
        const anim = clone.animate([
          { transform: backTf, opacity: total >= 4 ? 0.25 : 0.76, offset: 0 },
          { transform: 'translate(-96px, -14px) rotate(-16deg) scale(0.98)', opacity: 1, offset: 0.46 },
          { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: 1, offset: 1 }
        ], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
        anim.onfinish = function () { newTopEl.style.visibility = ''; clone.remove(); };
      } else if (clone) {
        clone.remove();
      }
    } else if (existingClone) {
      existingClone.remove();
    }
  }

  function toggleFolder(deckId, forceExpand) {
    const card = document.getElementById('folderCard_' + deckId);
    if (!card) return false;
    if (typeof forceExpand === 'boolean') {
      card.classList.toggle('expanded', forceExpand);
      return forceExpand;
    }
    return card.classList.toggle('expanded');
  }

  function getOffset(deckId) {
    return offsets[deckId] || 0;
  }

  function bindGlobalListeners() {
    if (listenersBound || typeof document === 'undefined') return;
    listenersBound = true;

    document.addEventListener('pointerdown', function (e) {
      const wrap = e.target.closest && e.target.closest('.fan-deck-wrap');
      if (!wrap || e.button > 0) return;
      const deckId = wrap.getAttribute('data-deck-id');
      if (!deckId) return;
      activeSwipe = {
        wrap: wrap,
        deckId: deckId,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        dx: 0,
        moved: false,
        topCard: null,
        floatClone: null
      };
      try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
    });

    document.addEventListener('pointermove', function (e) {
      if (!activeSwipe || e.pointerId !== activeSwipe.pointerId) return;
      const dx = e.clientX - activeSwipe.startX;
      const dy = e.clientY - activeSwipe.startY;
      if (!activeSwipe.moved && Math.abs(dx) > 6 && Math.abs(dx) >= Math.abs(dy) * 0.8) {
        activeSwipe.moved = true;
        activeSwipe.wrap.classList.add('is-dragging');
        const deckEl = activeSwipe.wrap.querySelector('.fan-deck');
        const topCard = activeSwipe.wrap.querySelector('.fan-card.pos-0');
        if (topCard && deckEl) {
          activeSwipe.topCard = topCard;
          activeSwipe.floatClone = createFloatClone(topCard, deckEl);
          if (activeSwipe.floatClone) topCard.style.visibility = 'hidden';
        }
      }
      if (!activeSwipe.moved) return;
      activeSwipe.dx = dx;
      if (activeSwipe.floatClone) {
        const clamped = Math.max(-130, Math.min(110, dx));
        activeSwipe.floatClone.style.transform =
          'translate(' + (clamped * 0.78) + 'px, ' + (Math.abs(clamped) * -0.07) + 'px) rotate(' + (clamped * 0.12) + 'deg)';
      }
    });

    function finishSwipe(e) {
      if (!activeSwipe || e.pointerId !== activeSwipe.pointerId) return;
      const wrap = activeSwipe.wrap;
      const deckId = activeSwipe.deckId;
      const dx = activeSwipe.dx;
      const moved = activeSwipe.moved;
      const topCard = activeSwipe.topCard;
      const floatClone = activeSwipe.floatClone;
      activeSwipe = null;
      wrap.classList.remove('is-dragging');
      const dragTf = floatClone ? floatClone.style.transform : '';
      try { wrap.releasePointerCapture(e.pointerId); } catch (_) {}

      if (moved) {
        if (dx <= -24) return cycle(deckId, 1, dragTf, floatClone);
        if (dx >= 24) {
          if (topCard) topCard.style.visibility = '';
          if (floatClone) floatClone.remove();
          return cycle(deckId, -1);
        }
      }
      if (floatClone) floatClone.remove();
      if (topCard) topCard.style.visibility = '';
      if (!moved && e.type === 'pointerup') cycle(deckId, 1);
    }

    document.addEventListener('pointerup', finishSwipe);
    document.addEventListener('pointercancel', finishSwipe);

    // 拦截浏览器原生图片拖拽与超级拖拽插件冲突
    document.addEventListener('mousedown', function (e) {
      if (e.button === 0 && e.target.closest && e.target.closest('.fan-deck-wrap')) {
        e.preventDefault();
      }
    }, true);
    document.addEventListener('dragstart', function (e) {
      if (e.target.closest && e.target.closest('.fan-deck-wrap')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.fan-deck-wrap')) {
        e.stopPropagation();
      }
    }, true);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindGlobalListeners);
    } else {
      bindGlobalListeners();
    }
  }

  return {
    mountCards: mountCards,
    cycle: cycle,
    toggleFolder: toggleFolder,
    getOffset: getOffset
  };
}));
