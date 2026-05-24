/* ==================== 飞天舞女骨架坐标生成器 ==================== */

export interface Point3D {
  x: number; y: number; z: number // z=深度，用于透视缩放
}

export interface CurveGroup {
  points: Point3D[]
  colorIdx: number // 指向调色板的索引
}

/**
 * @param count 目标总粒子数（函数会按比例分配到各曲线）
 * @param cx 画布中心 X
 * @param cy 画布中心 Y
 * @param scale 缩放基准（通常为 min(w,h) * 0.42）
 * @param time 动画时间（用于飘带波动）
 * @returns 曲线组数组，每组包含点坐标和推荐颜色索引
 */
export function getFeitianCoords(
  count: number,
  cx: number,
  cy: number,
  scale: number,
  time: number = 0,
): CurveGroup[] {
  const S = scale
  const groups: CurveGroup[] = []

  // ---- 身体倾斜角（飞天向右上飞行） ----
  const tilt = -0.43
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)

  // 将局部坐标 (dx, dy) 按倾斜角旋转到画布坐标
  const rot = (dx: number, dy: number): [number, number] => [
    cx + dx * cosT - dy * sinT,
    cy + dx * sinT + dy * cosT,
  ]

  // ---- 1. 头部光环（极坐标椭圆） ----
  const headPts: Point3D[] = []
  const headRx = S * 0.12
  const headRy = S * 0.14
  const [hx, hy] = rot(0, -S * 0.58)
  const headN = Math.floor(count * 0.04)
  for (let i = 0; i < headN; i++) {
    const a = (i / headN) * Math.PI * 2
    headPts.push({
      x: hx + Math.cos(a) * headRx * 0.92,
      y: hy + Math.sin(a) * headRy,
      z: 0.1,
    })
  }
  groups.push({ points: headPts, colorIdx: 3 }) // 浅金

  // ---- 2. 高髻发饰（螺旋） ----
  const hairPts: Point3D[] = []
  const hairN = Math.floor(count * 0.035)
  for (let i = 0; i < hairN; i++) {
    const f = i / (hairN - 1)
    const a = f * Math.PI * 3.5
    const r = headRx * 0.55 * (1 - f * 0.65)
    const [px, py] = rot(
      Math.cos(a) * r * 0.4,
      -S * 0.58 - headRy - f * S * 0.18,
    )
    hairPts.push({ x: px, y: py, z: 0.05 })
  }
  groups.push({ points: hairPts, colorIdx: 1 }) // 石青

  // ---- 3. 面部五官暗示（微弧） ----
  const facePts: Point3D[] = []
  const faceN = Math.floor(count * 0.015)
  for (let i = 0; i < faceN; i++) {
    const f = i / (faceN - 1)
    const dx = (f - 0.5) * headRx * 1.0
    const dy = Math.sin(f * Math.PI) * headRy * 0.15
    const [px, py] = rot(dx, -S * 0.58 + dy)
    facePts.push({ x: px, y: py, z: 0.08 })
  }
  groups.push({ points: facePts, colorIdx: 3 })

  // ---- 4. 颈部 ----
  const neckPts: Point3D[] = []
  const neckN = Math.floor(count * 0.015)
  const [neckTopX, neckTopY] = rot(0, -S * 0.42)
  const [neckBotX, neckBotY] = rot(0, -S * 0.34)
  for (let i = 0; i < neckN; i++) {
    const f = i / (neckN - 1)
    neckPts.push({
      x: neckTopX + (neckBotX - neckTopX) * f,
      y: neckTopY + (neckBotY - neckTopY) * f,
      z: 0.1,
    })
  }
  groups.push({ points: neckPts, colorIdx: 0 }) // 朱砂

  // ---- 5. 身躯 — S 型三道弯（多正弦叠加） ----
  const bodyPts: Point3D[] = []
  const bodyN = Math.floor(count * 0.08)
  for (let i = 0; i < bodyN; i++) {
    const f = i / (bodyN - 1)
    // 三道弯：sin(f*PI*1.5) 产生单峰曲线
    const bx = Math.sin(f * Math.PI * 1.45) * S * 0.06
      + Math.sin(f * 5) * S * 0.008    // 微波动
    const by = -S * 0.33 + f * S * 0.58 // 从颈到胯
    const [px, py] = rot(bx, by)
    bodyPts.push({
      x: px, y: py,
      z: Math.sin(f * Math.PI) * 0.15, // 身体厚度
    })
  }
  groups.push({ points: bodyPts, colorIdx: 0 }) // 朱砂为主

  // ---- 6. 托举手（右上扬，贝塞尔等价点） ----
  const upArmPts: Point3D[] = []
  const upArmN = Math.floor(count * 0.04)
  const [shoulderX, shoulderY] = rot(S * 0.04, -S * 0.32)
  const [elbowX, elbowY] = rot(S * 0.12, -S * 0.46)
  const [handX, handY] = rot(S * 0.35, -S * 0.72)
  for (let i = 0; i < upArmN; i++) {
    const f = i / (upArmN - 1)
    const t = f
    const it = 1 - t
    // 二次贝塞尔：肩→肘→手
    const px = it * it * shoulderX + 2 * it * t * elbowX + t * t * handX
    const py = it * it * shoulderY + 2 * it * t * elbowY + t * t * handY
    upArmPts.push({ x: px, y: py, z: 0.2 })
  }
  groups.push({ points: upArmPts, colorIdx: 0 })

  // ---- 7. 旁伸手（左平伸） ----
  const sideArmPts: Point3D[] = []
  const sideArmN = Math.floor(count * 0.04)
  const [sShX, sShY] = rot(-S * 0.05, -S * 0.3)
  const [sElX, sElY] = rot(-S * 0.2, -S * 0.28)
  const [sHaX, sHaY] = rot(-S * 0.42, -S * 0.2)
  for (let i = 0; i < sideArmN; i++) {
    const f = i / (sideArmN - 1)
    const t = f; const it = 1 - t
    const px = it * it * sShX + 2 * it * t * sElX + t * t * sHaX
    const py = it * it * sShY + 2 * it * t * sElY + t * t * sHaY
    sideArmPts.push({ x: px, y: py, z: -0.15 })
  }
  groups.push({ points: sideArmPts, colorIdx: 1 })

  // ---- 8. 裙摆（多重正弦波叠加） ----
  const skirtPts: Point3D[] = []
  const skirtN = Math.floor(count * 0.1)
  const [skTopX, skTopY] = rot(S * 0.02, -S * 0.02)
  for (let i = 0; i < skirtN; i++) {
    const f = i / (skirtN - 1)
    const wave = Math.sin(f * 5.5 + time * 0.03) * S * 0.08
      + Math.cos(f * 3.8 + time * 0.035) * S * 0.06
      + Math.sin(f * 7.2 + time * 0.028) * S * 0.04
    const dx = wave * f
    const dy = -S * 0.01 + f * S * 0.7
    const [px, py] = rot(dx, dy)
    skirtPts.push({
      x: px, y: py,
      z: Math.sin(f * Math.PI) * 0.2,
    })
  }
  groups.push({ points: skirtPts, colorIdx: 4 }) // 浅赭为主

  // ---- 9. 托举手飘带（正弦波飘逸） ----
  const upRibbonPts: Point3D[] = []
  const upRibN = Math.floor(count * 0.08)
  for (let i = 0; i < upRibN; i++) {
    const f = i / (upRibN - 1)
    const a = time * 0.04 + f * Math.PI * 1.2
    const dx = Math.sin(a) * S * 0.22 * f - S * 0.04 * f
    const dy = -S * 0.72 - Math.cos(a * 1.3) * S * 0.18 * f - f * S * 0.32
    const [px, py] = rot(S * 0.27 + dx, dy)
    upRibbonPts.push({ x: px, y: py, z: 0.25 })
  }
  groups.push({ points: upRibbonPts, colorIdx: 3 }) // 浅金

  // ---- 10. 旁伸手飘带 ----
  const sideRibbonPts: Point3D[] = []
  const sideRibN = Math.floor(count * 0.08)
  for (let i = 0; i < sideRibN; i++) {
    const f = i / (sideRibN - 1)
    const a = time * 0.04 + f * Math.PI * 1.3
    const dx = -Math.cos(a) * S * 0.16 * f - f * S * 0.24
    const dy = Math.sin(a * 1.35) * S * 0.2 * f + f * S * 0.28
    const [px, py] = rot(-S * 0.35 + dx, -S * 0.15 + dy)
    sideRibbonPts.push({ x: px, y: py, z: -0.2 })
  }
  groups.push({ points: sideRibbonPts, colorIdx: 2 }) // 青绿

  // ---- 11. 后腰飘带 ----
  const backRibbonPts: Point3D[] = []
  const backRibN = Math.floor(count * 0.07)
  for (let i = 0; i < backRibN; i++) {
    const f = i / (backRibN - 1)
    const a = time * 0.035 + f * Math.PI * 1.1
    const dx = Math.sin(a) * -S * 0.3 * f - S * 0.1 * f * f
    const dy = Math.cos(a * 1.4) * S * 0.22 * f + f * f * S * 0.55
    const [px, py] = rot(S * 0.03 + dx, S * 0.08 + dy)
    backRibbonPts.push({ x: px, y: py, z: -0.3 })
  }
  groups.push({ points: backRibbonPts, colorIdx: 1 }) // 石青

  return groups
}
