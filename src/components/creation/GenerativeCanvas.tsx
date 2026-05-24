import { useRef, useEffect } from 'react'
import { drawCaissonPattern, drawCaissonTile } from '../../engine/symmetry'
import { renderLotus } from '../../engine/lotus'
import { renderFeitianLines } from '../../engine/flowField'

export interface CanvasParams {
  pattern: string       // 'caisson' | 'lotus' | 'apsara'
  wind: number
  time: number
  rhythm: number
  palette: string[]
  tile: boolean
  caissonLayers?: number
  caissonPetals?: number
  caissonRotation?: number
  lotusRings?: number
  lotusPetals?: number
  apsaraCount?: number
}

interface Props {
  params: CanvasParams
  active: boolean
}

export default function GenerativeCanvas({ params, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const dpr = window.devicePixelRatio || 1

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    if (!active) {
      ctx.clearRect(0, 0, w, h)
      return
    }

    const cx = w / 2
    const cy = h / 2
    const size = Math.min(w, h)
    const palette = params.palette.length > 0 ? params.palette : ['#5B7B9A', '#8BA4A0', '#C47A6D', '#C9A88D', '#D4B87A']

    const grain = params.time / 100
    const density = params.rhythm / 100
    const curvature = params.wind / 100

    if (params.pattern === 'apsara') {
      let frame = 0
      let raf = 0
      const count = params.apsaraCount ?? 6

      const animate = () => {
        ctx.clearRect(0, 0, w, h)
        renderFeitianLines(ctx, w, h, curvature, count / 14, grain, palette, frame)
        frame++
        raf = requestAnimationFrame(animate)
      }
      raf = requestAnimationFrame(animate)

      return () => cancelAnimationFrame(raf)
    }

    ctx.clearRect(0, 0, w, h)

    if (params.pattern === 'caisson') {
      const layers = params.caissonLayers ?? Math.floor(2 + density * 3)
      const petals = params.caissonPetals ?? Math.floor(8 + density * 16)
      const rotation = ((params.caissonRotation ?? params.wind) / 100) * Math.PI / 4
      const caissonComplexity = Math.max(0.1, (layers - 1) / 4 + (petals - 8) / 32)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.translate(-cx, -cy)
      if (params.tile) {
        const tileSize = Math.floor(280 - density * 180)
        drawCaissonTile(ctx, w, h, tileSize, Math.min(1, caissonComplexity), grain, palette)
      } else {
        drawCaissonPattern(ctx, cx, cy, size * 0.46, Math.min(1, caissonComplexity), grain, palette)
      }
      ctx.restore()
    } else if (params.pattern === 'lotus') {
      const rings = params.lotusRings ?? 4
      const petals = params.lotusPetals ?? 6
      renderLotus(ctx, {
        cx, cy,
        radius: size * 0.46,
        petalCount: petals,
        petalWidth: 0.3,
        petalLength: 0.6,
        curvature: 0.3,
        layers: rings,
        grain,
        palette,
      })
    }
  }, [params, active])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ background: 'transparent', display: 'block' }}
    />
  )
}
