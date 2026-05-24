/* ==================== 敦煌藻井纹样 + 几何对称 ==================== */

const TAU = Math.PI * 2

/* ==================== 藻井纹样 — 敦煌经典风格 ==================== */

/** 绘制正多边形（正方形、菱形等） */
function drawPolygon(
  ctx: CanvasRenderingContext2D,
  radius: number,
  sides: number,
  rotation: number,
  fillColor: string | null,
  strokeColor: string | null,
  lineWidth = 3,
) {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i * TAU) / sides
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  if (fillColor) {
    ctx.fillStyle = fillColor
    ctx.fill()
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

/** 绘制放射状三角莲瓣 */
function drawRadiantPetals(
  ctx: CanvasRenderingContext2D,
  outerR: number,
  innerR: number,
  count: number,
  fillColor: string,
  strokeColor: string,
  lineWidth = 2,
) {
  for (let i = 0; i < count; i++) {
    const angle = (i * TAU) / count
    const nextAngle = ((i + 1) * TAU) / count
    const midAngle = (angle + nextAngle) / 2

    ctx.beginPath()
    ctx.moveTo(outerR * Math.cos(midAngle), outerR * Math.sin(midAngle))
    ctx.lineTo(innerR * Math.cos(angle), innerR * Math.sin(angle))
    ctx.lineTo(innerR * Math.cos(nextAngle), innerR * Math.sin(nextAngle))
    ctx.closePath()

    ctx.fillStyle = fillColor
    ctx.fill()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

export function drawCaissonPattern(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  complexity: number,
  grain: number,
  palette: string[],
) {
  const c = palette
  ctx.save()
  ctx.translate(cx, cy)

  // complexity → 层数、花瓣数
  const squareLayers = Math.floor(2 + complexity * 3)   // 2-5 层方井
  const petalRings = complexity > 0.5 ? 2 : 1            // 1-2 圈莲瓣
  const petalCount = Math.floor(8 + complexity * 16)     // 8-24 瓣
  const dotCount = Math.floor(4 + complexity * 8)        // 中心装饰点

  const baseLineWidth = 1.5 + (1 - grain) * 2            // grain 越大线条越斑驳
  const maxR = radius

  // === 第一层：最外层大方井（朱砂底 + 泥金边，45° 旋转） ===
  const outerR = maxR * 0.95
  drawPolygon(ctx, outerR, 4, Math.PI / 4, c[2] || c[0], c[4] || c[1], baseLineWidth * 1.8)

  // === 第二层起：交错套叠的方井 ===
  const layerStep = (outerR * 0.55) / Math.max(squareLayers, 1)
  for (let L = 0; L < squareLayers; L++) {
    const layerR = outerR * 0.72 - L * layerStep
    if (layerR < maxR * 0.12) break

    const isRotated = L % 2 === 1
    const rotation = isRotated ? Math.PI / 4 : 0
    const fillIdx = L % c.length
    const strokeIdx = (L + 1) % c.length

    drawPolygon(ctx, layerR, 4, rotation, c[fillIdx], c[strokeIdx], baseLineWidth * 1.2)
  }

  // === 圆形基底（土黄） ===
  const circleR = outerR * 0.45
  ctx.beginPath()
  ctx.arc(0, 0, circleR, 0, TAU)
  ctx.fillStyle = c[3] || c[0]
  ctx.fill()
  ctx.strokeStyle = c[4] || c[1]
  ctx.lineWidth = baseLineWidth * 1.4
  ctx.stroke()

  // === 放射状几何莲瓣（仿飞天周边几何云气） ===
  if (petalRings >= 1) {
    const ring1Outer = circleR
    const ring1Inner = circleR * 0.65
    drawRadiantPetals(ctx, ring1Outer, ring1Inner, petalCount, c[2] || c[0], c[4] || c[1], baseLineWidth * 0.9)

    if (petalRings >= 2) {
      const ring2Outer = circleR * 0.76
      const ring2Inner = circleR * 0.47
      drawRadiantPetals(ctx, ring2Outer, ring2Inner, petalCount, c[1] || c[0], c[4] || c[1], baseLineWidth * 0.8)
    }
  }

  // === 中心莲蓬 ===
  const centerR = circleR * 0.47
  ctx.beginPath()
  ctx.arc(0, 0, centerR, 0, TAU)
  ctx.fillStyle = c[0]
  ctx.fill()
  ctx.strokeStyle = c[4] || c[1]
  ctx.lineWidth = baseLineWidth
  ctx.stroke()

  // 中心小金圆
  const innerCenterR = centerR * 0.38
  ctx.beginPath()
  ctx.arc(0, 0, innerCenterR, 0, TAU)
  ctx.fillStyle = c[4] || c[1]
  ctx.fill()

  // 中心装饰小圆点（莲蓬孔）
  const dotRingR = centerR * 0.7
  for (let i = 0; i < dotCount; i++) {
    const angle = (i * TAU) / dotCount
    const px = dotRingR * Math.cos(angle)
    const py = dotRingR * Math.sin(angle)
    ctx.beginPath()
    ctx.arc(px, py, centerR * 0.08, 0, TAU)
    ctx.fillStyle = c[4] || c[1]
    ctx.fill()
  }

  // === 斑驳肌理（grain 控制） ===
  if (grain > 0.05) {
    ctx.globalAlpha = grain * 0.12
    for (let i = 0; i < Math.floor(grain * 600); i++) {
      const angle = Math.random() * TAU
      const dist = Math.random() * outerR
      const x = Math.cos(angle) * dist
      const y = Math.sin(angle) * dist
      ctx.fillStyle = i % 2 === 0 ? '#000000' : '#FFFFFF'
      ctx.fillRect(x, y, 0.8, 0.8)
    }
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

/* ==================== 藻井铺满 ==================== */

export function drawCaissonTile(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  tileSize: number,
  complexity: number,
  grain: number,
  palette: string[],
) {
  if (tileSize <= 0) return
  const cols = Math.floor(w / tileSize)
  const rows = Math.floor(h / tileSize)
  if (cols === 0 || rows === 0) return
  const offsetX = (w - cols * tileSize) / 2
  const offsetY = (h - rows * tileSize) / 2
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      drawCaissonPattern(ctx,
        offsetX + col * tileSize + tileSize / 2,
        offsetY + row * tileSize + tileSize / 2,
        tileSize * 0.44,
        complexity, grain, palette,
      )
    }
  }
}

/* ==================== 几何对称 — 现代数理纹样 ==================== */

export function drawGeometricSymmetry(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  complexity: number, // 控制折叠数
  grain: number,       // 控制细节
  palette: string[],
) {
  const c = palette
  ctx.save()
  ctx.translate(cx, cy)

  const folds = [4, 6, 8, 10, 12, 16]
  const idx = Math.min(folds.length - 1, Math.floor(complexity * folds.length))
  const N = folds[idx]
  const outerR = size * 0.48
  const step = TAU / N

  // 外圈
  ctx.strokeStyle = c[1]
  ctx.globalAlpha = 0.25
  ctx.lineWidth = 0.6
  ctx.beginPath()
  ctx.arc(0, 0, outerR, 0, TAU)
  ctx.stroke()

  // 星形多边形 — N角星
  const starR = outerR * 0.92
  const innerStarR = outerR * (0.35 + grain * 0.3)

  for (let ring = 0; ring < Math.min(4, Math.floor(1 + complexity * 3)); ring++) {
    const rt = ring / 3
    const r1 = starR * (1 - rt * 0.55)
    const r2 = innerStarR * (1 - rt * 0.55)

    ctx.fillStyle = c[ring % c.length]
    ctx.globalAlpha = 0.06 + rt * 0.04
    ctx.strokeStyle = c[(ring + 1) % c.length]
    ctx.lineWidth = 0.5

    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      const a1 = i * step - Math.PI / 2
      const a2 = a1 + step / 2
      if (i === 0) ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1)
      else ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1)
      ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2)
    }
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 0.2 + rt * 0.1
    ctx.stroke()
  }

  // 从中心出发的辐射线
  for (let i = 0; i < N; i++) {
    const a = i * step - Math.PI / 2
    ctx.strokeStyle = c[(i + 2) % c.length]
    ctx.globalAlpha = 0.1 + complexity * 0.1
    ctx.lineWidth = 0.3
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(a) * outerR * 0.9, Math.sin(a) * outerR * 0.9)
    ctx.stroke()

    // 辐射线上的装饰点
    if (complexity > 0.4) {
      ctx.fillStyle = c[(i + 3) % c.length]
      ctx.globalAlpha = 0.15
      for (let r = 0.3; r < 0.85; r += 0.14) {
        ctx.beginPath()
        ctx.arc(Math.cos(a) * outerR * r, Math.sin(a) * outerR * r, 1.2, 0, TAU)
        ctx.fill()
      }
    }
  }

  // 内层几何花
  const innerR = outerR * (0.2 + grain * 0.1)
  const innerN = 6
  const innerStep = TAU / innerN

  ctx.fillStyle = c[3]
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  for (let i = 0; i < innerN; i++) {
    const a1 = i * innerStep - Math.PI / 2
    const a2 = a1 + innerStep / 2
    if (i === 0) ctx.moveTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR)
    else ctx.lineTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR)
    ctx.lineTo(Math.cos(a2) * innerR * 0.35, Math.sin(a2) * innerR * 0.35)
  }
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = c[0]
  ctx.globalAlpha = 0.5
  ctx.lineWidth = 0.5
  ctx.stroke()

  // 中心圆点
  ctx.fillStyle = c[0]
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.arc(0, 0, innerR * 0.15, 0, TAU)
  ctx.fill()

  ctx.restore()
}
