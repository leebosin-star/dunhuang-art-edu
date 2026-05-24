/* ==================== Simplex Noise 2D / 3D ==================== */

// 基于 Gustavson 的 Simplex noise 实现
// 用于流场扰动、斑驳肌理、有机纹理

const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6
const F3 = 1 / 3
const G3 = 1 / 6

const grad3: [number, number, number][] = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
]

const perm = new Uint8Array(512)
const permMod12 = new Uint8Array(512)

function seedPermutation(seed: number = 0) {
  const p: number[] = []
  for (let i = 0; i < 256; i++) p[i] = i
  // Fisher-Yates with seed
  let s = seed
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647
    const j = s % (i + 1)
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
    permMod12[i] = perm[i] % 12
  }
}

seedPermutation()

function dot3(g: [number, number, number], x: number, y: number, z: number): number {
  return g[0] * x + g[1] * y + g[2] * z
}

export function noise3D(x: number, y: number, z: number): number {
  let n0 = 0, n1 = 0, n2 = 0, n3 = 0
  const s = (x + y + z) * F3
  const i = Math.floor(x + s)
  const j = Math.floor(y + s)
  const k = Math.floor(z + s)
  const t = (i + j + k) * G3
  const x0 = x - (i - t)
  const y0 = y - (j - t)
  const z0 = z - (k - t)

  let i1: number, j1: number, k1: number
  let i2: number, j2: number, k2: number

  if (x0 >= y0) {
    if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0 }
    else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1 }
    else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1 }
  } else {
    if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1 }
    else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1 }
    else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0 }
  }

  const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3
  const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3
  const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3

  const ii = i & 255, jj = j & 255, kk = k & 255

  const t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0
  if (t0 > 0) { const d = t0 * t0; n0 = d * d * dot3(grad3[permMod12[ii + perm[jj + perm[kk]]]], x0, y0, z0) }

  const t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1
  if (t1 > 0) { const d = t1 * t1; n1 = d * d * dot3(grad3[permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]]], x1, y1, z1) }

  const t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2
  if (t2 > 0) { const d = t2 * t2; n2 = d * d * dot3(grad3[permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]]], x2, y2, z2) }

  const t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3
  if (t3 > 0) { const d = t3 * t3; n3 = d * d * dot3(grad3[permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]]], x3, y3, z3) }

  return 32 * (n0 + n1 + n2 + n3)
}

export function noise2D(x: number, y: number): number {
  return noise3D(x, y, 0)
}

/** 多层叠加的分形噪声，用于纹理 */
export function fbm(x: number, y: number, octaves: number = 4, lacunarity: number = 2, gain: number = 0.5): number {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency)
    maxValue += amplitude
    amplitude *= gain
    frequency *= lacunarity
  }

  return value / maxValue
}
