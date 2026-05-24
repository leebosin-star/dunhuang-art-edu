// ===== 敦煌色彩系统 — 色彩数据定义 =====
// DHP Color System · Core Data

// ============================================================
// SIX MAIN COLORS (KMeans k=6, LAB color space)
// ============================================================
const DUNHUANG_COLORS = [
  {
    id: 'white',
    name: '敦煌白',
    displayName: '窟白',
    chapterName: '窟壁生白',
    code: 'DHP-W-M',
    hex: '#E6E3D8',
    eduHex: '#F9F5EB',
    lab: 'L=90.1, a=-0.5, b=4.5',
    rgb: '230, 227, 216',
    weight: 34.7,
    description: '温暖的灰白色，源于石灰底的氧化。作为壁画底色与纸本基调，承载了整体色彩系统的呼吸感与历史肌理。',
    pigments: '石灰（碳酸钙）、高岭土',
    category: '基底色（背景与纸本色）'
  },
  {
    id: 'yellow',
    name: '敦煌黄',
    displayName: '煌金',
    chapterName: '窟壁煌光',
    code: 'DHP-Y-M',
    hex: '#C9BDA4',
    eduHex: '#D7B072',
    lab: 'L=76.9, a=2.5, b=8.0',
    rgb: '201, 189, 164',
    weight: 22.4,
    description: '赭石与黄土的混合色调。低饱和度的矿物黄广泛见于壁画服饰、建筑装饰与背景铺陈中。',
    pigments: '赭石（铁氧化物）、黄土',
    category: '暖色系（赭石与黄土地色）'
  },
  {
    id: 'red',
    name: '敦煌红',
    displayName: '铅丹',
    chapterName: '铅丹映壁',
    code: 'DHP-R-M',
    hex: '#9E5C4A',
    eduHex: '#9E0507',
    lab: 'L=45.0, a=24.5, b=18.2',
    rgb: '158, 92, 74',
    weight: 20.5,
    description: '朱砂、铅丹与赭石混合形成的核心红色。敦煌壁画中最丰富多变的色相，用于佛像袈裟、飞天飘带等关键元素。',
    pigments: '朱砂（硫化汞）、铅丹（四氧化三铅）、赭石',
    category: '暖色系（朱砂与铅丹色系）'
  },
  {
    id: 'black',
    name: '敦煌黑',
    displayName: '墨玄',
    chapterName: '墨定乾坤',
    code: 'DHP-K-M',
    hex: '#2B2124',
    eduHex: '#37312C',
    lab: 'L=14.0, a=4.0, b=0.5',
    rgb: '43, 33, 36',
    weight: 14.2,
    description: '墨与氧化颜料的沉淀。微泛红调的深邃黑色，用于线条勾勒、轮廓界定，是敦煌线条美学的色彩根基。',
    pigments: '墨（碳黑）、氧化铁黑',
    category: '深色系（墨线与暗部）'
  },
  {
    id: 'green',
    name: '敦煌绿',
    displayName: '石绿',
    chapterName: '翠微山色',
    code: 'DHP-G-M',
    hex: '#86998A',
    eduHex: '#7DC8B7',
    lab: 'L=60.5, a=-8.2, b=6.0',
    rgb: '134, 153, 138',
    weight: 4.7,
    description: '石绿（孔雀石）为主。低饱和度的绿色在壁画中用于飘带、植物纹样与天界装饰，虽占比不大但具有关键的冷暖平衡作用。',
    pigments: '石绿（孔雀石、碱式碳酸铜）、氯铜矿',
    category: '冷色系（石绿与矿物冷色）'
  },
  {
    id: 'blue',
    name: '敦煌蓝',
    displayName: '石青',
    chapterName: '青穹佛国',
    code: 'DHP-B-M',
    hex: '#687597',
    eduHex: '#5366C5',
    lab: 'L=48.2, a=2.0, b=-18.5',
    rgb: '104, 117, 151',
    weight: 3.6,
    description: '青金石（天然群青）研磨而成。小而精的蓝色簇群在壁画中如点睛之笔，象征天界与佛国，是敦煌色彩中最珍贵的色系。',
    pigments: '青金石（天然群青）、石青（蓝铜矿）',
    category: '冷色系（青金石与佛国蓝）'
  }
];

// ============================================================
// A1-A4 AUXILIARY COLORS (user-provided, traditional pigment names)
// ============================================================
const AUXILIARY_COLORS = {
  white: [
    { id: 'A1', name: '沙白', hex: '#EAE4DA' },
    { id: 'A2', name: '铅白', hex: '#FFFFFF' }
  ],
  yellow: [
    { id: 'A1', name: '秋香', hex: '#F2E8B3' },
    { id: 'A2', name: '赫壁', hex: '#DFC390' },
    { id: 'A3', name: '雄黄', hex: '#BF793B' },
    { id: 'A4', name: '赫金', hex: '#F2D479' }
  ],
  red: [
    { id: 'A1', name: '丹霞', hex: '#D35325' },
    { id: 'A2', name: '朱砂', hex: '#AA2F28' },
    { id: 'A3', name: '胭脂', hex: '#D6604C' },
    { id: 'A4', name: '肉粉', hex: '#F4BEA0' }
  ],
  black: [
    { id: 'A1', name: '漆黑', hex: '#030526' },
    { id: 'A2', name: '焦墨', hex: '#26151C' },
    { id: 'A3', name: '玄灰', hex: '#7B7A77' },
    { id: 'A4', name: '烟灰', hex: '#94989B' }
  ],
  green: [
    { id: 'A1', name: '艾绿', hex: '#66858A' },
    { id: 'A2', name: '碧玉', hex: '#80BD9E' },
    { id: 'A3', name: '孔雀', hex: '#5CB7A0' },
    { id: 'A4', name: '苍松', hex: '#8AB083' }
  ],
  blue: [
    { id: 'A1', name: '群青', hex: '#153D96' },
    { id: 'A2', name: '天蓝', hex: '#4C78D2' },
    { id: 'A3', name: '回青', hex: '#70C0DB' },
    { id: 'A4', name: '粉青', hex: '#8A9BD8' }
  ]
};

// ============================================================
// E-SERIES EXTENDED COLORS (sampled from 936 representative colors)
// ============================================================
const E_SERIES = {
  white: [
    '#f6ebdb', '#f6f3e8', '#f1f0ef', '#fcfbf4', '#ede8e0',
    '#f8f4e3', '#eee6da', '#f5f6ef', '#f9f7f0', '#eeeae1',
    '#f6f5ef', '#eff0ec', '#fefefe', '#f7f5ed', '#cbc5bf',
    '#f2f0ea', '#f3edd8', '#e9e3d2', '#dce4d6', '#ebe2ce'
  ],
  yellow: [
    '#d5bb99', '#e5d1be', '#c8b69c', '#e6d8c3', '#ecdabe',
    '#d6c6af', '#efe8cb', '#dab298', '#e4d1b4', '#cfb388',
    '#dec9b1', '#b8a9a3', '#cbb192', '#e5d0bc', '#f4e3ca',
    '#bfb7a7', '#edecd1', '#e3d0bb', '#9b837c', '#dac4b3'
  ],
  red: [
    '#a52a18', '#8c1408', '#a04432', '#c6987e', '#901910',
    '#97644d', '#d77048', '#b67b68', '#e09a6b', '#b28d70',
    '#be8f7a', '#b15d47', '#ad1713', '#d6976f', '#b77a44',
    '#be7c63', '#c98261', '#cb3d20', '#b63a29', '#a35841'
  ],
  black: [
    '#110d10', '#10100f', '#0f070d', '#796759', '#917e7f',
    '#735d5f', '#69555c', '#70626a', '#6e7666', '#4d443c',
    '#150e19', '#574d52', '#1f1c1d', '#746b65', '#8d7164',
    '#3f2e3b', '#2b2730', '#304c36', '#171014', '#595161'
  ],
  green: [
    '#bacbb7', '#cadbc3', '#a0b99a', '#a8c29b', '#b8d0bd',
    '#9cc6ac', '#bcd7ba', '#8bb499', '#c0d1bd', '#8bb9a9',
    '#92bc9c', '#afc3a5', '#a8c4b5', '#669d7e', '#8ea88b',
    '#b7c79a', '#c4d8c2', '#acc0a1', '#acbfa7', '#b0c99f'
  ],
  blue: [
    '#7e93b5', '#6c6d7d', '#64727c', '#8d9caf', '#7085a2',
    '#6684a3', '#97c3d4', '#7d7a89', '#8cb0c4', '#8c9abb',
    '#a3a9c6', '#5a72a2', '#5d6db7', '#7c838b', '#4b5fa8',
    '#475cae', '#70909f', '#8b9ec5', '#719099', '#335084'
  ]
};

// ============================================================
// MURAL IMAGE MAPPINGS (images grouped by dominant color cluster)
// ============================================================
const MURAL_IMAGES = {
  white: [
    'chujiandunhuangshi/all/020260306_16444086.png',
    'chujiandunhuangshi/all/020260306_16451950.png',
    'chujiandunhuangshi/all/020260306_16461636.png',
    'chujiandunhuangshi/all/020260306_16470285.png',
    'chujiandunhuangshi/all/020260306_16521246.png'
  ],
  yellow: [
    'chujiandunhuangshi/all/020260306_16402441.png',
    'chujiandunhuangshi/all/020260306_16415000.png',
    'chujiandunhuangshi/all/020260306_16454703.png',
    'chujiandunhuangshi/all/020260306_16532277.png',
    'chujiandunhuangshi/all/020260306_16541362.png',
    'chujiandunhuangshi/all/020260306_17071927.png'
  ],
  red: [
    'chujiandunhuangshi/all/020260306_16432063.png',
    'chujiandunhuangshi/all/020260306_16434084.png',
    'chujiandunhuangshi/all/020260306_16440732.png',
    'chujiandunhuangshi/all/020260306_16482027.png'
  ],
  black: [
    'chujiandunhuangshi/all/020260306_16383971.png',
    'chujiandunhuangshi/all/020260306_16393866.png',
    'chujiandunhuangshi/all/020260306_16421938.png',
    'chujiandunhuangshi/all/020260306_16425616.png',
    'chujiandunhuangshi/all/020260306_16473991.png'
  ],
  green: [
    'chujiandunhuangshi/all/020260306_17125712.png',
    'chujiandunhuangshi/all/020260306_17141317.png',
    'chujiandunhuangshi/all/020260306_17143659.png'
  ],
  blue: [
    'chujiandunhuangshi/all/020260306_16405385.png'
  ]
};

// ============================================================
// 10-COLOR EXPANDED PALETTE (KMeans k=10 clustering)
// ============================================================
const EXPANDED_PALETTE = [
  { name: '最深褐', hex: '#2F2426', weight: 15.3 },
  { name: '灰褐', hex: '#ADA094', weight: 13.36 },
  { name: '赭石', hex: '#B97D63', weight: 12.58 },
  { name: '深灰褐', hex: '#71645E', weight: 12.58 },
  { name: '朱红', hex: '#B03D27', weight: 10.51 },
  { name: '灰绿', hex: '#A4BFA4', weight: 9.47 },
  { name: '米黄', hex: '#DFC7AA', weight: 8.95 },
  { name: '深赭', hex: '#7D3B2F', weight: 8.30 },
  { name: '灰蓝', hex: '#798CA7', weight: 5.97 },
  { name: '靛蓝', hex: '#435296', weight: 2.98 }
];

// V0 五色版本 (early k=5 clustering)
const V0_PALETTE = [
  { name: '灰褐', hex: '#C3C3A1', weight: 30.77 },
  { name: '暖褐', hex: '#B8876B', weight: 19.68 },
  { name: '灰蓝', hex: '#8A8C94', weight: 18.88 },
  { name: '深褐', hex: '#422F34', weight: 15.88 },
  { name: '赭红', hex: '#A03520', weight: 14.78 }
];

// ============================================================
// COLOR MATCHING RULES (for scheme generator)
// ============================================================
const MATCHING_RULES = {
  white: {
    primary: ['red', 'black'],
    accent: ['blue'],
    description: '窟白为底，搭配铅丹线条与墨玄文字，石青点缀 — 模拟壁画典型配色'
  },
  yellow: {
    primary: ['red', 'green'],
    accent: ['black'],
    description: '煌金色与铅丹构成暖色基调，石绿点缀增添层次感'
  },
  red: {
    primary: ['yellow', 'white'],
    accent: ['blue'],
    description: '铅丹与煌金构成经典的"朱红配金"敦煌范式，窟白留白平衡'
  },
  black: {
    primary: ['white', 'red'],
    accent: ['yellow'],
    description: '墨玄线条为骨，窟白为底，铅丹为肉 — 敦煌壁画的线面色彩结构'
  },
  green: {
    primary: ['yellow', 'white'],
    accent: ['red'],
    description: '石绿与煌金冷暖对比，窟白调和，铅丹激活整体画面'
  },
  blue: {
    primary: ['white', 'yellow'],
    accent: ['red'],
    description: '石青与窟白形成"佛国青白"意象，铅丹为点睛之笔'
  }
};

// ============================================================
// COLOR CONVERSION UTILITIES (for contrast checker & tools)
// ============================================================
function hexToRgb(hex) {
  var h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(function(c) {
    return Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  }).join('');
}

// WCAG 2.1 relative luminance
function relativeLuminance(hex) {
  var rgb = hexToRgb(hex);
  var rsrgb = rgb.r / 255;
  var gsrgb = rgb.g / 255;
  var bsrgb = rgb.b / 255;
  function linearize(c) {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * linearize(rsrgb) + 0.7152 * linearize(gsrgb) + 0.0722 * linearize(bsrgb);
}

// WCAG contrast ratio
function contrastRatio(hex1, hex2) {
  var l1 = relativeLuminance(hex1);
  var l2 = relativeLuminance(hex2);
  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Get DUNHUANG_COLORS entry by id
function getColorById(id) {
  for (var i = 0; i < DUNHUANG_COLORS.length; i++) {
    if (DUNHUANG_COLORS[i].id === id) return DUNHUANG_COLORS[i];
  }
  return null;
}
