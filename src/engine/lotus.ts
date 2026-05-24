/* ==================== 莲花参数化生成 — 环状莲 · 同心圆环 ==================== */

export interface LotusParams {
  cx: number
  cy: number
  radius: number
  petalCount: number
  petalWidth: number
  petalLength: number
  curvature: number
  layers: number
  grain: number
  palette: string[]
}

const TAU = Math.PI * 2

function drawPetal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  tipR: number,
  baseR: number,
  cpRatio: number,
  spreadAngle: number,
  fillColor: string,
  strokeColor: string,
  lineWidth: number,
) {
  const bx1 = cx + Math.cos(angle - spreadAngle) * baseR
  const by1 = cy + Math.sin(angle - spreadAngle) * baseR
  const bx2 = cx + Math.cos(angle + spreadAngle) * baseR
  const by2 = cy + Math.sin(angle + spreadAngle) * baseR
  const tipX = cx + Math.cos(angle) * tipR
  const tipY = cy + Math.sin(angle) * tipR
  const cpX = cx + Math.cos(angle) * tipR * cpRatio
  const cpY = cy + Math.sin(angle) * tipR * cpRatio

  ctx.fillStyle = fillColor
  ctx.beginPath()
  ctx.moveTo(bx1, by1)
  ctx.quadraticCurveTo(cpX, cpY, tipX, tipY)
  ctx.quadraticCurveTo(cpX, cpY, bx2, by2)
  ctx.closePath()
  ctx.fill()

  if (strokeColor && lineWidth) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

export function renderLotus(ctx: CanvasRenderingContext2D, params: LotusParams) {
  const { cx, cy, radius, petalCount, petalWidth, petalLength, curvature, layers, grain, palette } = params
  const c = palette
  const R = radius

  ctx.save()

  // === 同心圆环 ===
  const ringCount = Math.max(3, Math.min(6, Math.floor(3 + layers * 0.6)))
  for (let i = 0; i < ringCount; i++) {
    const r = R * (0.24 + i * (0.58 / Math.max(ringCount - 1, 1)))
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, TAU)
    ctx.strokeStyle = c[i % c.length]
    ctx.lineWidth = 1.2 + grain * 2
    ctx.stroke()
  }

  // === 舒展花瓣 ===
  const petalN = Math.max(3, Math.floor(4 + petalCount * 0.4))
  const angleStep = TAU / petalN
  const offsetAngle = curvature * angleStep * 0.5

  for (let i = 0; i < petalN; i++) {
    const a = i * angleStep - Math.PI / 2 + offsetAngle
    const tipR = R * (0.6 + petalLength * 0.35)
    const baseR = R * (0.12 + grain * 0.1)
    const cpRatio = 0.35 + petalWidth * 0.3
    const spread = 0.18 + curvature * 0.12

    drawPetal(ctx, cx, cy, a, tipR, baseR, cpRatio, spread,
      c[i % c.length],
      c[(i + 2) % c.length],
      0.8)
  }

  // === 花心 ===
  const centerR = R * (0.06 + grain * 0.05)
  ctx.fillStyle = c[Math.min(3, c.length - 1)] || c[0]
  ctx.beginPath()
  ctx.arc(cx, cy, centerR, 0, TAU)
  ctx.fill()

  ctx.strokeStyle = c[0]
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}
