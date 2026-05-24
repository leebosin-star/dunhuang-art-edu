import { useEffect, useRef } from 'react'

const SIX_COLORS = ['#F9F5EB', '#D7B072', '#9E0507', '#37312C', '#7DC8B7', '#5366C5']

export default function DunhuangParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    let mx = -100, my = -100
    let animId = 0

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors: string[] = []
    for (let i = 0; i < 34; i++) colors.push(...SIX_COLORS)

    const particles = Array.from({ length: 200 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      homeX: 0,
      homeY: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 0.6 + Math.random() * 2.2,
      alpha: 0.1 + Math.random() * 0.28,
    }))

    // set home positions after resize-aware
    particles.forEach(p => { p.homeX = Math.random() * W; p.homeY = Math.random() * H })

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }

    function loop() {
      animId = requestAnimationFrame(loop)
      const repelRadius = 90, repelForce = 0.015

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = p.x - mx, dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < repelRadius) {
          const force = (1 - dist / repelRadius) * repelForce
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }
        p.vx += (p.homeX - p.x) * 0.00006
        p.vy += (p.homeY - p.y) * 0.00006
        p.vx *= 0.998
        p.vy *= 0.998
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 0.8) { p.vx *= 0.8 / speed; p.vy *= 0.8 / speed }
        p.x += p.vx
        p.y += p.vy
        if (p.x < -30) p.x = W + 30
        if (p.x > W + 30) p.x = -30
        if (p.y < -30) p.y = H + 30
        if (p.y > H + 30) p.y = -30
      }

      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = p.x - mx, dy = p.y - my
        const distToMouse = Math.sqrt(dx * dx + dy * dy)
        const alphaBoost = distToMouse < 120 ? (1 - distToMouse / 120) * 0.2 : 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.min(0.6, p.alpha + alphaBoost)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  )
}
