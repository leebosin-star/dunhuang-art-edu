/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dunhuang: {
          // DHP 敦煌色彩系统 — 暗色基底
          'bg':       '#0F0D0B',  // 敦煌底色
          'card':     '#151310',  // 卡片/section 背景
          'white':    '#F9F5EB',  // 窟白 — 主文字
          'gold':     '#C9A084',  // 煌金 — 点缀高亮
          'red':      '#9E0507',  // 铅丹 — 警示重点
          'black':    '#37312C',  // 墨玄 — 深色元素
          'green':    '#7DC8B7',  // 石绿 — 青绿交互
          'blue':     '#5366C5',  // 石青 — 标题强调
          'yellow':   '#D7B072',  // 煌金色调
          // 保留旧名称兼容
          'moon':     '#0F0D0B',
          'lotus':    '#151310',
          'ochre':    '#C9A084',
          'jade':     '#7DC8B7',
          'azure':    '#5366C5',
          'cinnabar': '#9E0507',
        },
      },
      fontFamily: {
        heading: ['"Noto Serif SC"', 'Georgia', 'serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['Inter', 'system-ui', 'monospace'],
      },
      borderRadius: {
        'dun': '1rem',   // 敦煌圆角 — 藻井弧形
        'dun-lg': '1.5rem',
      },
      boxShadow: {
        'dun': '0 8px 32px rgba(139, 164, 160, 0.12)',
        'dun-lg': '0 16px 48px rgba(139, 164, 160, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
