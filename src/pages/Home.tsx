import { Link } from 'react-router-dom'

const modules = [
  {
    path: '/creation',
    title: '个性创作',
    desc: '参数化算法生成敦煌纹样，调节风骨、时间与乐律，创造独属于你的敦煌符号。',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    gradient: 'from-dunhuang-jade/20 to-dunhuang-azure/10',
  },
  {
    path: '/interaction',
    title: '实时互动',
    desc: '人在画中游。挥动手臂舞出飞天飘带，指尖轻触唤醒千年色彩。',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    gradient: 'from-dunhuang-gold/20 to-dunhuang-cinnabar/10',
  },
]

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <section className="text-center mb-20 animate-fade-in">
        <h1 className="text-3xl md:text-5xl mb-4 tracking-tight" style={{ color: '#5CC9C9' }}>
          敦煌美育色彩
        </h1>
        <p className="text-base md:text-lg mx-auto leading-relaxed whitespace-nowrap" style={{ color: 'rgba(92,201,201,0.5)' }}>
          在数字世界中感知千年敦煌的矿物色彩，以算法为笔，以身体为墨。
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {modules.map(({ path, title, desc, icon, gradient }, i) => (
          <Link
            key={path}
            to={path}
            className={`no-underline dun-card p-6 md:p-10 group bg-gradient-to-br ${gradient}`}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-dun bg-dunhuang-moon/60 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-6 h-6 text-dunhuang-jade"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d={icon} />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl text-dunhuang-azure mb-2">{title}</h2>
                <p className="text-dunhuang-azure/60 leading-relaxed">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
