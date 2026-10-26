import { calculateMutualMatch } from './matching.js';

/**
 * 정적 최적 배치(Pre-settled Force + Strict Collision Resolution) 기반 매칭 네트워크 그래프
 * - 젤리처럼 둥둥 떠다니지 않고, 진입/새로고침/연결선 기준 변경 시 즉시 최적 좌표를 계산해 정지 상태로 보여줍니다.
 * - 노드를 드래그앤드롭으로 옮기면 옮긴 위치에 그대로 고정됩니다.
 * - 빈 공간 드래그(패닝) 및 마우스 휠 확대/축소(줌)를 지원하여 40명 이상의 매물도 쾌적하게 볼 수 있습니다.
 */
export class MatchingGraphRenderer {
  constructor(canvas, onSelectNode) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onSelectNode = onSelectNode;

    this.nodes = [];
    this.edges = [];
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.draggingNode = null;
    this.isPanning = false;

    // 줌 & 패닝 상태
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    this.minScoreThreshold = 80;
    this.imageCache = new Map();

    this._bindEvents();
  }

  /**
   * 데이터를 설정하고, relayout=true일 때 전체 노드의 최적 비겹침 배치를 다시 계산합니다.
   */
  setData(profiles, minScoreThreshold = 80, selectedId = null, relayout = true) {
    this.minScoreThreshold = minScoreThreshold;
    if (selectedId !== undefined) {
      this.selectedNodeId = selectedId;
    }

    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 960;
    const height = rect.height || 640;
    this.resize(width, height);

    const prevMap = new Map(this.nodes.map((n) => [n.id, n]));
    const cx = width / 2;
    const cy = height / 2;

    this.nodes = profiles.map((p, idx) => {
      // 이미지 캐시 로드 (로드 완료 시 자동 재렌더)
      if (p.photos?.[0] && !this.imageCache.has(p.photos[0])) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => this.draw();
        img.src = p.photos[0];
        this.imageCache.set(p.photos[0], img);
      }

      const prev = prevMap.get(p.id);
      if (!relayout && prev) {
        return { ...prev, profile: p };
      }

      // 초기 배치: 성별과 인덱스를 섞어 원형 나선으로 고르게 시작 (결정론적 시드 배치)
      const angle = idx * 2.399963229728653; // 황금각(Golden Angle) 분포로 초기 겹침 최소화
      const dist = 70 + Math.sqrt(idx) * 58;
      return {
        id: p.id,
        profile: p,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        r: 22,
        pinned: false
      };
    });

    // 양방향 이상형 점수 계산 및 연결선 생성
    this.edges = [];
    const males = this.nodes.filter((n) => n.profile.gender === 'M');
    const females = this.nodes.filter((n) => n.profile.gender === 'F');

    const allCandidateEdges = [];
    for (const m of males) {
      for (const f of females) {
        const match = calculateMutualMatch(m.profile, f.profile);
        if (match.mutualPercent >= this.minScoreThreshold) {
          allCandidateEdges.push({
            source: m,
            target: f,
            match
          });
        }
      }
    }

    // 점수 높은 순 정렬
    allCandidateEdges.sort((a, b) => b.match.mutualPercent - a.match.mutualPercent);
    this.edges = allCandidateEdges;

    if (relayout) {
      this.computeOptimalLayout();
      this.fitToScreen();
    }

    this.draw();
  }

  /**
   * 젤리처럼 흔들리지 않도록 렌더링 전에 물리/충돌 시뮬레이션을 동기적으로 완료하여
   * 이상형 궁합이 높은 노드끼리 가까이에 모이면서 노드끼리 겹치지 않는 정적 좌표를 완성합니다.
   */
  computeOptimalLayout() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const totalIterations = 300;

    // 각 노드가 연결선을 가지고 있는지 확인
    const connectedSet = new Set();
    for (const e of this.edges) {
      connectedSet.add(e.source.id);
      connectedSet.add(e.target.id);
    }

    for (let iter = 0; iter < totalIterations; iter++) {
      const alpha = 1 - iter / totalIterations;

      // 1. 노드 간 반발력 (Repulsion)
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i];
          const b = this.nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distSq = dx * dx + dy * dy;
          if (distSq < 1) {
            dx = (i % 2 === 0 ? 1 : -1) * 0.5;
            dy = (j % 2 === 0 ? 1 : -1) * 0.5;
            distSq = 1;
          }
          const dist = Math.sqrt(distSq);
          const repulse = (4200 / distSq) * alpha;
          const fx = (dx / dist) * repulse;
          const fy = (dy / dist) * repulse;

          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      // 2. 이상형 궁합 연결선 인력 (점수가 높을수록 강하게 가까워짐)
      for (const edge of this.edges) {
        const a = edge.source;
        const b = edge.target;
        const score = edge.match.mutualPercent;
        // 95점이면 목표거리 115px, 75점이면 195px
        const targetDist = 110 + Math.max(0, 95 - score) * 4.5;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const strength = (0.045 + ((score - 65) / 35) * 0.04) * alpha;
        const force = (dist - targetDist) * strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // 3. 중심 중력 (연결된 노드는 중앙 클러스터로, 연결 없는 노드는 외곽 링으로 정돈)
      for (const n of this.nodes) {
        if (connectedSet.has(n.id)) {
          n.vx += (cx - n.x) * 0.012 * alpha;
          n.vy += (cy - n.y) * 0.012 * alpha;
        } else {
          // 연결선이 없는 노드는 중앙에서 일정 반경 바깥쪽으로 부드럽게 배치
          const dx = n.x - cx;
          const dy = n.y - cy;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const outerRadius = 420;
          const pull = (outerRadius - dist) * 0.015 * alpha;
          n.vx += (dx / dist) * pull;
          n.vy += (dy / dist) * pull;
        }

        n.vx *= 0.65;
        n.vy *= 0.65;
        n.x += n.vx;
        n.y += n.vy;
      }

      // 4. 매 스텝 충돌 방지 (노드 원 + 하단 이름표 영역까지 겹치지 않도록 이격)
      this._resolveCollisions(105, 88);
    }

    // 5. 최종 정밀 충돌 제거 패스 (완벽히 겹침 제로화)
    for (let pass = 0; pass < 25; pass++) {
      this._resolveCollisions(112, 92);
    }

    for (const n of this.nodes) {
      n.vx = 0;
      n.vy = 0;
    }
  }

  /**
   * 타원형 바운딩 박스 충돌 해결 (가로 라벨 폭 minXDist, 세로 원+라벨 높이 minYDist 보장)
   */
  _resolveCollisions(minXDist = 110, minYDist = 90) {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;

        // 정규화된 타원 거리 계산
        const nx = dx / minXDist;
        const ny = dy / minYDist;
        const normDist = Math.sqrt(nx * nx + ny * ny);

        if (normDist < 1) {
          if (normDist < 0.001) {
            dx = (i % 2 === 0 ? 1 : -1) * 2;
            dy = (j % 2 === 0 ? 1 : -1) * 2;
          }
          const overlap = (1 - Math.max(0.01, normDist)) * 0.52;
          const pushX = (dx / Math.max(1, Math.abs(dx) + Math.abs(dy))) * minXDist * overlap;
          const pushY = (dy / Math.max(1, Math.abs(dx) + Math.abs(dy))) * minYDist * overlap;

          if (!a.pinned) {
            a.x -= pushX;
            a.y -= pushY;
          }
          if (!b.pinned) {
            b.x += pushX;
            b.y += pushY;
          }
        }
      }
    }
  }

  /**
   * 모든 노드가 화면 안에 보기 좋게 들어오도록 자동 줌/센터 맞춤
   */
  fitToScreen() {
    if (this.nodes.length === 0) return;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const n of this.nodes) {
      if (n.x - 60 < minX) minX = n.x - 60;
      if (n.x + 60 > maxX) maxX = n.x + 60;
      if (n.y - 50 < minY) minY = n.y - 50;
      if (n.y + 65 > maxY) maxY = n.y + 65;
    }

    const contentW = Math.max(200, maxX - minX);
    const contentH = Math.max(200, maxY - minY);
    const pad = 70;

    const scaleX = (this.width - pad * 2) / contentW;
    const scaleY = (this.height - pad * 2) / contentH;
    this.scale = Math.max(0.45, Math.min(1.15, Math.min(scaleX, scaleY)));

    const centerContentX = (minX + maxX) / 2;
    const centerContentY = (minY + maxY) / 2;
    this.offsetX = this.width / 2 - centerContentX * this.scale;
    this.offsetY = this.height / 2 - centerContentY * this.scale;
  }

  resize(width, height) {
    const dpr = window.devicePixelRatio || 1;
    this.width = width;
    this.height = height;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.dpr = dpr;
  }

  stop() {
    // 정적 렌더링이므로 별도 루프 중단 불필요
  }

  _screenToWorld(sx, sy) {
    return {
      x: (sx - this.offsetX) / this.scale,
      y: (sy - this.offsetY) / this.scale
    };
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const dpr = this.dpr || 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    // 1. 연결선(Edges) 그리기
    for (const edge of this.edges) {
      const isRelatedToSelected =
        !this.selectedNodeId ||
        edge.source.id === this.selectedNodeId ||
        edge.target.id === this.selectedNodeId;

      const isDirectHover =
        this.hoveredNodeId &&
        (edge.source.id === this.hoveredNodeId || edge.target.id === this.hoveredNodeId);

      const score = edge.match.mutualPercent;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      ctx.lineTo(edge.target.x, edge.target.y);

      if (!isRelatedToSelected) {
        ctx.strokeStyle = 'rgba(228, 228, 231, 0.3)';
        ctx.lineWidth = 1;
      } else if (this.selectedNodeId || isDirectHover) {
        ctx.strokeStyle = score >= 85 ? '#18181b' : '#52525b';
        ctx.lineWidth = score >= 85 ? 2.6 : 1.8;
      } else {
        ctx.strokeStyle = score >= 85 ? 'rgba(24, 24, 27, 0.45)' : 'rgba(161, 161, 170, 0.4)';
        ctx.lineWidth = score >= 85 ? 1.8 : 1.1;
      }
      ctx.stroke();

      // 점수 배지는 특정 노드를 선택했거나 호버했을 때, 또는 86% 이상 고득점 매칭에 깔끔하게 표시
      if (
        (this.selectedNodeId && isRelatedToSelected) ||
        isDirectHover ||
        (!this.selectedNodeId && score >= 86)
      ) {
        const mx = (edge.source.x + edge.target.x) / 2;
        const my = (edge.source.y + edge.target.y) / 2;
        const label = `${score}%`;
        ctx.font = '600 10.5px Pretendard, sans-serif';
        const tw = ctx.measureText(label).width + 10;
        const isDarkBadge = score >= 85 && (this.selectedNodeId || isDirectHover);
        ctx.fillStyle = isDarkBadge ? '#18181b' : 'rgba(255,255,255,0.94)';
        ctx.strokeStyle = isDarkBadge ? '#18181b' : '#d4d4d8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(mx - tw / 2, my - 8.5, tw, 17, 8.5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDarkBadge ? '#ffffff' : '#27272a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, mx, my);
      }
      ctx.restore();
    }

    // 2. 노드(프로필 원형 아바타) 그리기
    for (const node of this.nodes) {
      const p = node.profile;
      const isSelected = node.id === this.selectedNodeId;
      const isHovered = node.id === this.hoveredNodeId;
      const isConnectedToSelected =
        !this.selectedNodeId ||
        isSelected ||
        this.edges.some(
          (e) =>
            (e.source.id === this.selectedNodeId && e.target.id === node.id) ||
            (e.target.id === this.selectedNodeId && e.source.id === node.id)
        );

      ctx.save();
      ctx.globalAlpha = isConnectedToSelected ? 1 : 0.25;

      // 선택/호버 시 외곽 링
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 5, 0, Math.PI * 2);
        ctx.fillStyle = p.gender === 'M' ? 'rgba(37, 99, 235, 0.16)' : 'rgba(225, 29, 72, 0.16)';
        ctx.fill();
      }

      // 원형 배경 및 사진 클리핑
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      const imgUrl = p.photos?.[0];
      const img = imgUrl ? this.imageCache.get(imgUrl) : null;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r - 1.5, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, node.x - node.r, node.y - node.r, node.r * 2, node.r * 2);
        ctx.restore();
      } else {
        ctx.fillStyle = p.gender === 'M' ? '#eff6ff' : '#fff1f2';
        ctx.fill();
        ctx.fillStyle = p.gender === 'M' ? '#1d4ed8' : '#be123c';
        ctx.font = '700 12px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.name.slice(0, 2), node.x, node.y);
      }

      // 성별 컬러 보더
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeStyle = p.gender === 'M' ? '#2563eb' : '#e11d48';
      ctx.stroke();

      // 드래그로 고정(Pin)된 노드 우측 상단 작은 핀 점 표시
      if (node.pinned) {
        ctx.beginPath();
        ctx.arc(node.x + node.r * 0.7, node.y - node.r * 0.7, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#18181b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 하단 이름 + 출생연도 라벨
      const cleanName = p.name.replace('(별칭)', '');
      const labelText = `${cleanName} (${String(p.birth_year).slice(2)}년)`;
      ctx.font = '600 11px Pretendard, sans-serif';
      const labelW = ctx.measureText(labelText).width + 10;
      const ly = node.y + node.r + 12;

      ctx.fillStyle = isSelected ? '#18181b' : 'rgba(255, 255, 255, 0.94)';
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(node.x - labelW / 2, ly - 9, labelW, 18, 5);
      ctx.fill();
      if (!isSelected) ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : '#18181b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, node.x, ly);

      ctx.restore();
    }

    ctx.restore();
  }

  _getNodeAtScreen(sx, sy) {
    const { x, y } = this._screenToWorld(sx, sy);
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dx = x - n.x;
      const dy = y - n.y;
      if (dx * dx + dy * dy <= (n.r + 6) * (n.r + 6)) {
        return n;
      }
    }
    return null;
  }

  _bindEvents() {
    let downScreenX = 0;
    let downScreenY = 0;
    let panStartX = 0;
    let panStartY = 0;

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      downScreenX = sx;
      downScreenY = sy;

      const hit = this._getNodeAtScreen(sx, sy);
      if (hit) {
        this.draggingNode = hit;
        // 드래그 시작 시 해당 노드는 고정 상태로 전환 (젤리처럼 움직이지 않고 놓은 위치에 고정)
        hit.pinned = true;
      } else {
        this.isPanning = true;
        panStartX = sx - this.offsetX;
        panStartY = sy - this.offsetY;
        this.canvas.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (this.draggingNode) {
        const worldPos = this._screenToWorld(sx, sy);
        this.draggingNode.x = worldPos.x;
        this.draggingNode.y = worldPos.y;
        this.draw();
        return;
      }

      if (this.isPanning) {
        this.offsetX = sx - panStartX;
        this.offsetY = sy - panStartY;
        this.draw();
        return;
      }

      const hit = this._getNodeAtScreen(sx, sy);
      const prevHover = this.hoveredNodeId;
      this.hoveredNodeId = hit ? hit.id : null;
      this.canvas.style.cursor = hit ? 'grab' : 'default';
      if (prevHover !== this.hoveredNodeId) {
        this.draw();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const moved = Math.hypot(sx - downScreenX, sy - downScreenY) > 5;

      if (!moved && e.target === this.canvas) {
        const hit = this._getNodeAtScreen(sx, sy);
        if (hit) {
          // 클릭만 했을 경우는 pinned 해제 유지
          this.selectedNodeId = hit.id;
          if (this.onSelectNode) this.onSelectNode(hit.profile);
        } else {
          this.selectedNodeId = null;
          if (this.onSelectNode) this.onSelectNode(null);
        }
        this.draw();
      }

      this.draggingNode = null;
      this.isPanning = false;
    });

    // 마우스 휠 확대/축소
    this.canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.max(0.35, Math.min(2.2, this.scale * zoomFactor));

        // 마우스 포인터 위치 기준 줌
        this.offsetX = sx - ((sx - this.offsetX) / this.scale) * newScale;
        this.offsetY = sy - ((sy - this.offsetY) / this.scale) * newScale;
        this.scale = newScale;
        this.draw();
      },
      { passive: false }
    );
  }
}
