import { FontOption, GamingPreset, TextEffect, PresetTextWording } from './types';

export const FONTS: FontOption[] = [
  { name: 'Luckiest Guy', cssValue: 'Luckiest Guy' },
  { name: 'Bangers', cssValue: 'Bangers' },
  { name: 'Anton', cssValue: 'Anton' },
  { name: 'Bebas Neue', cssValue: 'Bebas Neue' },
  { name: 'Russo One', cssValue: 'Russo One' },
  { name: 'Rubik Dirt', cssValue: 'Rubik Dirt' },
  { name: 'Black Ops One', cssValue: 'Black Ops One' },
  { name: 'Permanent Marker', cssValue: 'Permanent Marker' },
  { name: 'Inter (Default)', cssValue: 'Inter' }
];

export const FONT_PRESETS: { [key: string]: GamingPreset } = {
  'Gaming Horror': {
    name: 'Gaming Horror',
    fontFamily: 'Permanent Marker',
    fill: '#ff2a2a',
    stroke: '#000000',
    strokeWidth: 6,
    shadowColor: '#ff0000',
    shadowBlur: 15,
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    fontSize: 72,
    textCase: 'none',
    charSpacing: 0,
    lineHeight: 1.1
  },
  'Gaming CTR': {
    name: 'Gaming CTR',
    fontFamily: 'Bebas Neue',
    fill: '#ffff00',
    stroke: '#000000',
    strokeWidth: 10,
    shadowColor: 'rgba(0, 0, 0, 0.95)',
    shadowBlur: 2,
    shadowOffsetX: 8,
    shadowOffsetY: 8,
    fontSize: 90,
    textCase: 'uppercase',
    charSpacing: 100,
    lineHeight: 1
  },
  'Gaming Action': {
    name: 'Gaming Action',
    fontFamily: 'Russo One',
    fill: '#00ffff',
    gradientColor: '#0055ff',
    stroke: '#000000',
    strokeWidth: 8,
    shadowColor: '#002288',
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 6,
    fontSize: 80,
    textCase: 'uppercase'
  },
  'Gaming Survival': {
    name: 'Gaming Survival',
    fontFamily: 'Rubik Dirt',
    fill: '#e28743',
    stroke: '#1e0e03',
    strokeWidth: 5,
    shadowColor: '#000000',
    shadowBlur: 8,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    fontSize: 70
  },
  'Gaming Adventure': {
    name: 'Gaming Adventure',
    fontFamily: 'Luckiest Guy',
    fill: '#ffd700',
    gradientColor: '#ff6600',
    stroke: '#330000',
    strokeWidth: 10,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 15,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    fontSize: 85
  }
};

export const TEXT_EFFECTS: TextEffect[] = [
  {
    id: 'viral_gaming',
    name: 'Viral Gaming',
    fontFamily: 'Luckiest Guy',
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 12,
    shadowColor: 'rgba(0,0,0,1)',
    shadowBlur: 10,
    shadowOffsetX: 6,
    shadowOffsetY: 8
  },
  {
    id: 'horror_gaming',
    name: 'Horror Gaming',
    fontFamily: 'Permanent Marker',
    fill: '#ffffff',
    gradient: '#ff1111',
    stroke: '#000000',
    strokeWidth: 8,
    shadowColor: 'rgba(255,0,0,0.8)',
    shadowBlur: 20,
    shadowOffsetX: 4,
    shadowOffsetY: 4
  },
  {
    id: 'discovery_style',
    name: 'Discovery Style',
    fontFamily: 'Anton',
    fill: '#ffffff',
    gradient: '#ffcc00',
    stroke: '#000000',
    strokeWidth: 10,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 8,
    shadowOffsetX: 5,
    shadowOffsetY: 5
  },
  {
    id: 'danger_style',
    name: 'Danger Style',
    fontFamily: 'Bangers',
    fill: '#ff3333',
    stroke: '#ffffff',
    strokeWidth: 6,
    shadowColor: '#000000',
    shadowBlur: 15,
    shadowOffsetX: 8,
    shadowOffsetY: 8
  },
  {
    id: 'limbo_style',
    name: 'Limbo Style',
    fontFamily: 'Bebas Neue',
    fill: '#ffffff',
    stroke: '#111111',
    strokeWidth: 4,
    shadowColor: 'rgba(255,255,255,0.7)',
    shadowBlur: 25,
    shadowOffsetX: 0,
    shadowOffsetY: 0
  }
];

export const PRESET_WORDINGS: PresetTextWording[] = [
  {
    id: 'preset_1',
    texts: [
      { text: 'FOUND A', fontFamily: 'Anton', fill: '#ffffff', stroke: '#000000', strokeWidth: 8, shadowColor: '#000000', shadowBlur: 10 },
      { text: 'BOAT? 😱', fontFamily: 'Luckiest Guy', fill: '#ffff00', stroke: '#000000', strokeWidth: 10, shadowColor: '#000000', shadowBlur: 12 }
    ]
  },
  {
    id: 'preset_2',
    texts: [
      { text: "DON'T", fontFamily: 'Bebas Neue', fill: '#ffffff', stroke: '#000000', strokeWidth: 8, shadowColor: '#000000', shadowBlur: 8 },
      { text: 'FALL! 😱', fontFamily: 'Russo One', fill: '#ff1111', stroke: '#000000', strokeWidth: 12, shadowColor: '#330000', shadowBlur: 15 }
    ]
  },
  {
    id: 'preset_3',
    texts: [
      { text: 'WHAT IS THIS?! 😨', fontFamily: 'Bangers', fill: '#ff00ff', stroke: '#ffffff', strokeWidth: 5, shadowColor: '#000000', shadowBlur: 10 }
    ]
  },
  {
    id: 'preset_4',
    texts: [
      { text: 'RUN NOW! 💀', fontFamily: 'Permanent Marker', fill: '#ffffff', stroke: '#ff0000', strokeWidth: 6, shadowColor: '#000000', shadowBlur: 20 }
    ]
  },
  {
    id: 'preset_5',
    texts: [
      { text: 'THEY SAW ME! 😱', fontFamily: 'Luckiest Guy', fill: '#ffff00', stroke: '#000000', strokeWidth: 10, shadowColor: '#ff0000', shadowBlur: 15 }
    ]
  }
];

export const BOTTOM_CAPTIONS: string[] = [
  'ONE MISTAKE & IT\'S OVER!',
  'LIMBO GETS WEIRDER...',
  'WATCH TILL THE END',
  'SUBSCRIBE FOR PART 2',
  'PART 2 TOMORROW'
];

export const EMOJIS: string[] = [
  '😱', '😨', '😭', '💀', '🔥', '⚠️', '🚨', '👀', '🤯', '👑',
  '💯', '👾', '💣', '🎮', '⚔️', '🎯', '🤫', '🥵', '🥶', '💰'
];

export const STARTER_BACKGROUNDS = [
  {
    name: 'Cyberpunk Red Neon',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&auto=format&fit=crop&q=80'
  },
  {
    name: 'Epic Arena Battle',
    url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=1280&auto=format&fit=crop&q=80'
  },
  {
    name: 'Anime Cyber City',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1280&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fiery Dark Canyon',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80'
  }
];
