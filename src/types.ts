export type CanvasMode = 'thumbnail' | 'shorts';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface FontOption {
  name: string;
  cssValue: string;
}

export interface GamingPreset {
  name: string;
  fontFamily: string;
  fill: string;
  gradientColor?: string;
  stroke: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  fontSize: number;
  textCase?: 'uppercase' | 'lowercase' | 'none';
  charSpacing?: number;
  lineHeight?: number;
}

export interface LayerItem {
  id: string; // Fabric object custom property
  name: string;
  type: 'text' | 'image' | 'emoji' | 'rect' | 'unknown';
  visible: boolean;
  locked: boolean;
  active: boolean;
}

export interface TextEffect {
  id: string;
  name: string;
  fontFamily: string;
  fill: string;
  gradient?: string;
  stroke: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface PresetTextWording {
  id: string;
  texts: {
    text: string;
    fontFamily: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
    shadowColor: string;
    shadowBlur: number;
  }[];
}
