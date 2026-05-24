/* ==================== 敦煌色板定义与映射 ==================== */

export interface Palette {
  name: string
  colors: string[]
}

export const dunhuangPalettes: Palette[] = [
  {
    name: '淡石绿',
    colors: ['#8BA4A0', '#A3B8B5', '#C5D5D2', '#6B8A85', '#F0F4F3'],
  },
  {
    name: '浅赭石',
    colors: ['#C9A88D', '#D4BBA6', '#E0CFBF', '#B89578', '#F5EDE6'],
  },
  {
    name: '浅金',
    colors: ['#D4B87A', '#DDC696', '#E8D4B0', '#C4A568', '#F8F2E5'],
  },
  {
    name: '淡朱砂',
    colors: ['#C47A6D', '#D4958A', '#E0B0A8', '#B06558', '#F5E8E5'],
  },
  {
    name: '石青',
    colors: ['#5B7B9A', '#7A95AE', '#9AAFC2', '#456580', '#E8EDF2'],
  },
  {
    name: '藕荷',
    colors: ['#E8D5D0', '#EDDFDB', '#F3EAE7', '#DCC5BE', '#FAF6F4'],
  },
]

export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`
}

export function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return rgbToHex(
    ar + (br - ar) * t,
    ag + (bg - ag) * t,
    ab + (bb - ab) * t,
  )
}

export function getPaletteByIndex(index: number): string[] {
  return dunhuangPalettes[index % dunhuangPalettes.length].colors
}

export function samplePalette(palette: string[], t: number): string {
  const count = palette.length
  const pos = t * (count - 1)
  const i = Math.floor(pos)
  const frac = pos - i
  if (i >= count - 1) return palette[count - 1]
  return lerpColor(palette[i], palette[i + 1], frac)
}
