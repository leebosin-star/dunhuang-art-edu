/* ==================== 飞天飘带线条 — 复合正弦波动态风格 ==================== */

export function renderFeitianLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  curvature: number,
  density: number,
  grain: number,
  palette: string[],
  time: number,
) {
  const c = palette

  const ribbonCount = Math.floor(4 + density * 8)
  const baseY = height / 2
  const seed = Math.floor(density * 1000 + curvature * 500 + grain * 300)

  for (let i = 0; i < ribbonCount; i++) {
    const pseudo = (i * 0.37 + seed * 0.13) % 1
    const pseudo2 = (i * 0.53 + seed * 0.07) % 1
    const speed = 0.008 + pseudo * 0.02 + curvature * 0.008

    const yOffset = baseY + (pseudo - 0.5) * height * 0.6
    const amp1 = height * (0.06 + pseudo2 * 0.14 + curvature * 0.1)
    const amp2 = height * (0.02 + pseudo * 0.06 + grain * 0.04)
    const freq1 = 0.003 + pseudo2 * 0.005 + curvature * 0.003
    const freq2 = 0.006 + pseudo * 0.008
    const phase = pseudo * Math.PI * 2 + time * speed

    ctx.beginPath()

    for (let x = 0; x <= width; x += 3) {
      const y = yOffset
        + Math.sin(x * freq1 + phase) * amp1
        + Math.cos(x * freq2 - phase * 0.5) * amp2

      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.strokeStyle = c[i % c.length]
    ctx.lineWidth = 6 + pseudo * (14 + grain * 8)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = 0.82
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}
