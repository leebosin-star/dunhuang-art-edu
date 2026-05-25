import { useState, useRef, useCallback, useMemo, type DragEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import GenerativeCanvas from '../components/creation/GenerativeCanvas'

/* ==================== 预设敦煌图库 ==================== */

interface PresetImage {
  id: string
  title: string
  colors: string[]
  gradient: string
  image: string
}

const presetLibrary: PresetImage[] = [
  {
    id: 'apsara',
    title: '图库一',
    colors: ['#C47A6D', '#D4B87A', '#E8D5D0', '#8BA4A0', '#F7F4EF'],
    gradient: 'linear-gradient(135deg, #C47A6D 0%, #D4B87A 30%, #E8D5D0 60%, #8BA4A0 100%)',
    image: './presets/preset_apsara.png',
  },
  {
    id: 'deer',
    title: '图库二',
    colors: ['#8BA4A0', '#C9A88D', '#D4B87A', '#5B7B9A', '#E8D5D0'],
    gradient: 'linear-gradient(135deg, #8BA4A0 0%, #C9A88D 35%, #D4B87A 60%, #5B7B9A 100%)',
    image: './presets/preset_deer.png',
  },
  {
    id: 'caisson-preset',
    title: '图库三',
    colors: ['#2D5973', '#4A7254', '#B73D42', '#C18644', '#DDB673'],
    gradient: 'linear-gradient(135deg, #2D5973 0%, #4A7254 30%, #B73D42 60%, #C18644 100%)',
    image: './presets/preset_caisson.png',
  },
  {
    id: 'music',
    title: '图库四',
    colors: ['#C47A6D', '#E8D5D0', '#D4B87A', '#8BA4A0', '#5B7B9A'],
    gradient: 'linear-gradient(135deg, #C47A6D 0%, #E8D5D0 40%, #D4B87A 70%, #8BA4A0 100%)',
    image: './presets/preset_music.png',
  },
  {
    id: 'landscape',
    title: '图库五',
    colors: ['#8BA4A0', '#5B7B9A', '#C9A88D', '#F7F4EF', '#D4B87A'],
    gradient: 'linear-gradient(135deg, #8BA4A0 0%, #5B7B9A 35%, #C9A88D 65%, #F7F4EF 100%)',
    image: './presets/preset_landscape.png',
  },
  {
    id: 'donor',
    title: '图库六',
    colors: ['#C9A88D', '#C47A6D', '#E8D5D0', '#D4B87A', '#5B7B9A'],
    gradient: 'linear-gradient(135deg, #C9A88D 0%, #C47A6D 40%, #E8D5D0 70%, #D4B87A 100%)',
    image: './presets/preset_donor.png',
  },
  {
    id: 'buddha',
    title: '图库七',
    colors: ['#D4B87A', '#C9A88D', '#C47A6D', '#E8D5D0', '#8BA4A0'],
    gradient: 'linear-gradient(135deg, #D4B87A 0%, #C9A88D 35%, #C47A6D 60%, #E8D5D0 100%)',
    image: './presets/preset_buddha.png',
  },
]

/* ==================== 参数面板配置 ==================== */

const patterns = [
  { id: 'caisson', label: '藻井纹样' },
  { id: 'lotus', label: '莲花变体' },
  { id: 'apsara', label: '飞天线条' },
]

/* ==================== 颜色提取工具 ==================== */

function extractColorsFromImage(img: HTMLImageElement, count = 5): string[] {
  const canvas = document.createElement('canvas')
  const maxDim = 100
  const scale = Math.min(maxDim / img.width, maxDim / img.height)
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

  const buckets: { r: number; g: number; b: number; count: number }[] = []
  const step = 4

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r + g + b < 30 || r + g + b > 720) continue

    let matched = false
    for (const bucket of buckets) {
      const dr = bucket.r / bucket.count - r
      const dg = bucket.g / bucket.count - g
      const db = bucket.b / bucket.count - b
      if (Math.sqrt(dr * dr + dg * dg + db * db) < 60) {
        bucket.r += r; bucket.g += g; bucket.b += b; bucket.count++
        matched = true
        break
      }
    }
    if (!matched) {
      buckets.push({ r, g, b, count: 1 })
    }
  }

  return buckets
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map(({ r, g, b, count }) => {
      const rr = Math.round(r / count).toString(16).padStart(2, '0')
      const gg = Math.round(g / count).toString(16).padStart(2, '0')
      const bb = Math.round(b / count).toString(16).padStart(2, '0')
      return `#${rr}${gg}${bb}`
    })
}

/* ==================== 主组件 ==================== */

type Phase = 'idle' | 'creating'

export default function Creation() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [extractedColors, setExtractedColors] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null)
  const [pattern, setPattern] = useState('caisson')
  const [color, setColor] = useState('')
  const [tile, setTile] = useState(false)
  const [active, setActive] = useState(true)

  const [caissonLayers, setCaissonLayers] = useState(3)
  const [caissonPetals, setCaissonPetals] = useState(16)
  const [caissonRotation, setCaissonRotation] = useState(45)

  const [lotusRings, setLotusRings] = useState(4)
  const [lotusPetals, setLotusPetals] = useState(6)

  const [apsaraCount, setApsaraCount] = useState(6)

  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const selectPreset = useCallback((preset: PresetImage) => {
    setExtractedColors(preset.colors)
    setColor(preset.colors[0])
    setActive(true)
    setPhase('creating')
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        setSelectedImage(img)
        const colors = extractColorsFromImage(img)
        setExtractedColors(colors)
        setColor(colors[0] || '#8BA4A0')
        setPhase('creating')
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  /* ==================== 创作阶段 ==================== */

  const canvasParams = useMemo(() => {
    // 将选中的颜色排到色板第一位，作为主色
    const palette = extractedColors.length > 0 && color
      ? [color, ...extractedColors.filter(c => c !== color)]
      : extractedColors.length > 0
        ? extractedColors
        : ['#5B7B9A', '#8BA4A0', '#C47A6D', '#C9A88D', '#D4B87A']
    return {
      pattern,
      wind: 50,
      time: 30,
      rhythm: 60,
      palette,
      tile,
      caissonLayers,
      caissonPetals,
      caissonRotation,
      lotusRings,
      lotusPetals,
      apsaraCount,
    }
  }, [pattern, color, tile, extractedColors, caissonLayers, caissonPetals, caissonRotation, lotusRings, lotusPetals, apsaraCount])

  if (phase === 'creating') {
    return (
      <div className="absolute inset-0 bg-[#0F0D0B] overflow-hidden flex flex-col">
        {/* 返回首页 */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-5 right-5 z-20 bg-[#151310]/90 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-dunhuang-gold/10 text-[#F9F5EB]/30 text-sm cursor-pointer hover:bg-[#151310] hover:text-dunhuang-gold/70 hover:border-dunhuang-gold/25 transition-all duration-300"
        >
          返回
        </button>
        {/* 画布 — 绝对定位居中 */}
        <div className="flex-1 relative">
          <div
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(600px, calc(100% - 64px))',
              height: 'min(600px, calc(100% - 64px))',
              zIndex: 1,
            }}
          >
            <GenerativeCanvas params={canvasParams} active={active} />
          </div>
        </div>

        {/* 底部参数栏 — 悬浮于画布前方 */}
        <div className="flex-shrink-0 flex items-center gap-2 px-5 py-2
          bg-[#0F0D0B]/95 backdrop-blur-sm border-t border-dunhuang-gold/8
          overflow-x-auto whitespace-nowrap relative z-10">
          <button
            onClick={() => setActive(false)}
            className={`px-3 py-1 text-[11px] rounded-md transition-all duration-300 flex-shrink-0
              ${!active
                ? 'text-[#F9F5EB]/12'
                : 'text-[#F9F5EB]/35 hover:text-dunhuang-red'}`}
          >
            清空
          </button>
          <div className="w-px h-3 bg-dunhuang-gold/10 flex-shrink-0" />
          {patterns.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setPattern(id); setActive(true) }}
              className={`px-2 py-1 text-[11px] rounded-md transition-all duration-300 flex-shrink-0
                ${pattern === id
                  ? 'bg-dunhuang-jade/15 text-dunhuang-jade'
                  : 'text-[#F9F5EB]/30 hover:text-[#F9F5EB]/55'
                }`}
            >
              {label}
            </button>
          ))}
          <div className="w-px h-3 bg-dunhuang-gold/10 flex-shrink-0" />
          {pattern === 'caisson' && (
            <>
              <SliderInline label="层数" value={caissonLayers} onChange={setCaissonLayers} min={2} max={5} step={1} />
              <SliderInline label="莲瓣" value={caissonPetals} onChange={setCaissonPetals} min={8} max={24} step={2} />
              <SliderInline label="旋转" value={caissonRotation} onChange={setCaissonRotation} min={0} max={360} />
              <div className="w-px h-3 bg-dunhuang-gold/10 flex-shrink-0" />
            </>
          )}
          {pattern === 'lotus' && (
            <>
              <SliderInline label="圆环" value={lotusRings} onChange={setLotusRings} min={2} max={8} step={1} />
              <SliderInline label="花瓣" value={lotusPetals} onChange={setLotusPetals} min={3} max={16} step={1} />
              <div className="w-px h-3 bg-dunhuang-gold/10 flex-shrink-0" />
            </>
          )}
          {pattern === 'apsara' && (
            <>
              <SliderInline label="飘带" value={apsaraCount} onChange={setApsaraCount} min={2} max={14} step={1} />
              <div className="w-px h-3 bg-dunhuang-gold/10 flex-shrink-0" />
            </>
          )}
          {extractedColors.map((hex) => (
            <button
              key={hex}
              onClick={() => setColor(hex)}
              className={`rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0
                ${color === hex ? 'ring-2 ring-dunhuang-gold ring-offset-1 ring-offset-[#0F0D0B] scale-110' : ''}`}
              style={{ backgroundColor: hex, width: 18, height: 18 }}
            />
          ))}
          <div className="w-px h-3 bg-dunhuang-gold/10 flex-shrink-0" />
          <button
            onClick={() => setPhase('idle')}
            className="text-[11px] text-[#F9F5EB]/30 hover:text-dunhuang-jade transition-colors flex-shrink-0"
          >
            ← 重新选择
          </button>
        </div>
      </div>
    )
  }

  /* ==================== 选图取色阶段 ==================== */

  return (
    <div className="absolute inset-0 bg-[#0F0D0B] overflow-hidden">
      {/* 返回首页 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 right-5 z-10 bg-[#151310]/90 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-dunhuang-gold/10 text-[#F9F5EB]/30 text-sm cursor-pointer hover:bg-[#151310] hover:text-dunhuang-gold/70 hover:border-dunhuang-gold/25 transition-all duration-300"
      >
        返回
      </button>
      <div className="h-full flex flex-col lg:flex-row">
        {/* ====== 左侧：上传面板 ====== */}
        <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col justify-center px-4 lg:pl-20 lg:pr-12">
          <div className="mb-10">
            <p className="text-[#F9F5EB]/55 text-xs md:text-sm leading-relaxed mb-3">
              上传一张你喜欢的图片，或从敦煌图库中选择一幅作品
            </p>
            <p className="text-[#F9F5EB]/30 text-xs leading-relaxed">
              系统将自动分析图片颜色，提取 5 种矿物色彩，用于生成敦煌纹样
            </p>
            <div className="flex items-center gap-3 mt-4 text-[#F9F5EB]/18 text-[10px]">
              <span>支持 PNG / JPG / WEBP</span>
              <span className="w-1 h-1 rounded-full bg-dunhuang-gold/30" />
              <span>拖拽或点击上传</span>
              <span className="w-1 h-1 rounded-full bg-dunhuang-gold/30" />
              <span>自动取色生成</span>
            </div>
          </div>

          <div
            className={`relative transition-all duration-500 ${dragOver ? 'scale-[1.02]' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileRef.current?.click()}
              className="group w-full flex flex-col items-center gap-3 py-6 lg:py-10 rounded-2xl
                bg-[#F9F5EB]/3 hover:bg-[#F9F5EB]/6
                transition-all duration-500 cursor-pointer
                outline-dashed outline-1 outline-dunhuang-gold/15
                hover:outline-dunhuang-jade/30"
            >
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-dunhuang-jade/12 flex items-center justify-center
                group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6 text-dunhuang-jade/60" fill="none" stroke="currentColor"
                  strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[#F9F5EB]/65 text-sm font-medium tracking-wider mb-0.5">
                  上传图片
                </p>
                <p className="text-[#F9F5EB]/25 text-xs">
                  拖拽或点击上传
                </p>
              </div>
            </button>

            {dragOver && (
              <div className="absolute inset-0 rounded-2xl bg-dunhuang-jade/12 flex items-center justify-center pointer-events-none">
                <p className="text-dunhuang-jade text-base font-medium tracking-wider">释放以上传</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-dunhuang-gold/10" />
            <span className="text-xs text-[#F9F5EB]/25 tracking-widest">或者</span>
            <div className="flex-1 h-px bg-dunhuang-gold/10" />
          </div>

          <p className="text-xs text-[#F9F5EB]/25 tracking-widest text-center">
            从右侧敦煌图库中选择
          </p>
        </div>

        {/* ====== 右侧：3D 卡片展示区 ====== */}
        <div className="flex-1 flex items-center lg:items-start justify-center pt-8 lg:pt-32">
          <PresetCarousel presets={presetLibrary} onSelect={selectPreset} />
        </div>
      </div>
    </div>
  )
}

/* ==================== 3D 纵深堆叠 — 左右对称 + 悬停摇摆 ==================== */

function PresetCarousel({
  presets,
  onSelect,
}: {
  presets: PresetImage[]
  onSelect: (p: PresetImage) => void
}) {
  const [active, setActive] = useState(0)

  const goTo = (index: number) => setActive(index)
  const prev = () => setActive((active - 1 + presets.length) % presets.length)
  const next = () => setActive((active + 1) % presets.length)

  return (
    <div className="flex flex-col items-center gap-8">
      {/* === 3D 舞台 === */}
      <div
        className="relative w-full max-w-[600px] h-72 flex items-center justify-center"
        style={{ perspective: '1200px', overflow: 'visible' }}
      >
        <div
          className="relative w-36 h-48 md:w-48 md:h-60"
          style={{ transformStyle: 'preserve-3d', overflow: 'visible' }}
        >
          {presets.map((preset, i) => {
            const d = i - active
            const ad = Math.abs(d)

            let transform: string
            let opacity: number
            let zIndex: number

            if (d === 0) {
              transform = 'translate3d(0, 0, 0) rotateY(-18deg) rotateX(5deg)'
              opacity = 1
              zIndex = 100
            } else {
              // 统一公式 — 所有卡片沿一条直线排列
              transform = `translate3d(${d * 65}px, ${ad * -38}px, ${ad * -120}px) rotateY(-18deg) rotateX(5deg)`
              opacity = Math.max(0, 1 - ad * 0.15)
              zIndex = 100 - ad
            }

            return (
              <button
                key={preset.id}
                onClick={() => (d === 0 ? onSelect(preset) : goTo(i))}
                className="absolute inset-0 focus:outline-none group/pop"
                style={{
                  transform,
                  opacity,
                  zIndex,
                  transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease',
                }}
              >
                <div
                  className="w-full h-full rounded-xl overflow-hidden relative
                    transition-all duration-300 ease-out
                    group-hover/pop:translate-x-4 group-hover/pop:-translate-y-1 group-hover/pop:scale-110"
                  style={{
                    border: d === 0
                      ? '0.5px solid rgba(255,255,255,0.2)'
                      : '0.5px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <img
                    src={preset.image}
                    alt={preset.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: preset.gradient, opacity: 0.15 }}
                  />
                  <div className="absolute left-0 top-[15%] bottom-[15%] w-[1.5px] bg-white/10 rounded-r-sm" />
                  <div className="absolute bottom-3 left-3 right-3 flex gap-1 justify-center">
                    {preset.colors.slice(0, 4).map((c) => (
                      <span key={c} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 导航 */}
      <div className="flex items-center gap-5">
        <button onClick={prev} className="nav-arrow">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex gap-2 items-center">
          {presets.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-500
                ${i === active ? 'w-5 h-1.5 bg-dunhuang-jade' : 'w-1.5 h-1.5 bg-dunhuang-gold/20 hover:bg-dunhuang-gold/50'}`}
            />
          ))}
        </div>
        <button onClick={next} className="nav-arrow">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <button
        onClick={() => onSelect(presets[active])}
        className="px-6 py-2.5 lg:px-10 lg:py-3 rounded-2xl text-xs lg:text-sm font-medium tracking-widest
          bg-dunhuang-jade text-white hover:bg-dunhuang-blue
          transition-all duration-300 active:scale-[0.98]"
      >
        开始创作
      </button>

      <style>{`
        .nav-arrow {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: rgba(201, 160, 132, 0.3);
          transition: all 0.3s ease;
        }
        .nav-arrow:hover {
          color: #C9A084;
          background: rgba(201, 160, 132, 0.08);
        }
      `}</style>
    </div>
  )
}

/* ==================== 内联滑块 ==================== */

function SliderInline({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0" style={{ width: 90 }}>
      <span className="text-[10px] text-[#F9F5EB]/30 flex-shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-0.5 accent-dunhuang-jade cursor-pointer"
        style={{ minWidth: 0 }}
      />
    </div>
  )
}
