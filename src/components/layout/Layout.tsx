import { Outlet, Link, useLocation } from 'react-router-dom'
import DunhuangParticles from './DunhuangParticles'

const navItems = [
  { path: '/creation', label: '个性创作' },
  { path: '/interaction', label: '实时互动' },
]

const fullScreenPaths = ['/creation', '/interaction']
const immersivePaths = ['/interaction'] // 完全沉浸，无导航

export default function Layout() {
  const { pathname } = useLocation()
  const isFullScreen = fullScreenPaths.includes(pathname)
  const isImmersive = immersivePaths.includes(pathname)

  return (
    <div className="min-h-screen flex flex-col">
      <DunhuangParticles />
      {!isImmersive && (
        <header className={`z-50 bg-[#0F0D0B]/90 backdrop-blur-md border-b border-dunhuang-gold/10 ${isFullScreen ? 'absolute top-0 left-0 right-0' : 'sticky top-0'}`}>
          <nav className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
            <Link
              to="/"
              className="font-heading text-lg md:text-xl font-semibold text-dunhuang-gold tracking-wide no-underline"
            >
              敦煌美育色彩
            </Link>

            <ul className="hidden sm:flex items-center gap-1 list-none m-0 p-0">
              {navItems.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`px-4 py-2 rounded-dun text-sm font-medium no-underline transition-all duration-300
                      ${pathname === path
                        ? 'bg-dunhuang-jade/15 text-dunhuang-jade'
                        : 'text-[#F9F5EB]/40 hover:text-[#F9F5EB]/70 hover:bg-[#F9F5EB]/5'
                      }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {pathname === '/creation' && (
                <li>
                  <Link
                    to="/"
                    className="px-4 py-2 rounded-dun text-sm font-medium no-underline transition-all duration-300 text-dunhuang-gold/60 hover:text-dunhuang-gold hover:bg-dunhuang-gold/5"
                  >
                    返回
                  </Link>
                </li>
              )}
              {pathname === '/' && (
                <li>
                  <a
                    href="/color-exploration.html#realtime"
                    className="px-4 py-2 rounded-dun text-sm font-medium no-underline transition-all duration-300 text-dunhuang-gold/50 hover:text-dunhuang-gold hover:bg-dunhuang-gold/5"
                  >
                    返回
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </header>
      )}

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
