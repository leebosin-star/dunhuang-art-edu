import { Outlet, Link, useLocation } from 'react-router-dom'
import DunhuangParticles from './DunhuangParticles'

const DHP_NAV_CSS = `.dhp-nav{position:fixed;top:0;left:0;right:0;z-index:100;mix-blend-mode:difference;padding:28px 48px;display:flex;align-items:center;justify-content:space-between;pointer-events:none}.dhp-nav-logo{font-size:.78rem;font-weight:600;letter-spacing:.12em;color:#fff;text-decoration:none;pointer-events:auto}.dhp-nav-links{display:flex;gap:40px;list-style:none;margin:0;padding:0;pointer-events:auto}.dhp-nav-links a{color:rgba(255,255,255,.4);text-decoration:none;font-size:.74rem;letter-spacing:.1em;transition:color .4s}.dhp-nav-links a:hover{color:#fff}.dhp-nav-links a.active{color:#fff}@media(max-width:640px){.dhp-nav{padding:18px 24px}.dhp-nav-links{display:none}}`

const navItems = [
  { path: '/creation', label: '个性创作' },
  { path: '/interaction', label: '实时互动' },
]

const fullScreenPaths = ['/creation', '/interaction']
const immersivePaths = ['/interaction', '/creation'] // 完全沉浸，无导航

export default function Layout() {
  const { pathname } = useLocation()
  const isFullScreen = fullScreenPaths.includes(pathname)
  const isImmersive = immersivePaths.includes(pathname)

  return (
    <div className="min-h-screen flex flex-col">
      <DunhuangParticles />
      {!isImmersive && <>
        <style dangerouslySetInnerHTML={{ __html: DHP_NAV_CSS }} />
        <header className="dhp-nav">
          <Link to="/" className="dhp-nav-logo">
            DHP · 敦煌美育色彩系统
          </Link>

          <ul className="dhp-nav-links">
            {navItems.map(({ path, label }) => (
              <li key={path}>
                <Link to={path} className={pathname === path ? 'active' : ''}>{label}</Link>
              </li>
            ))}
            {pathname === '/' && <li><a href="/color-exploration.html#realtime">返回</a></li>}
          </ul>
        </header>
      </>}

      <main className={`${isFullScreen ? 'flex-1 relative' : 'flex-1'} ${isImmersive ? '' : isFullScreen ? 'pt-16' : ''}`}>
        <Outlet />
      </main>

      {!isFullScreen && (
        <footer className="py-6 text-center text-sm text-[#F9F5EB]/25 border-t border-dunhuang-gold/8">
          敦煌色彩美育 &copy; {new Date().getFullYear()}
        </footer>
      )}
    </div>
  )
}
