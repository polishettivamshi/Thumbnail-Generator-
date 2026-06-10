import React, { useEffect, useState } from 'react';
import { FONTS, FONT_PRESETS, EMOJIS } from '../constants';
import { GamingPreset } from '../types';
import { 
  Type, 
  Bold, 
  Sparkles, 
  MoveRight, 
  Maximize2, 
  ArrowUpAZ, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy,
  Plus
} from 'lucide-react';

interface SidebarTextDetailProps {
  activeObjProps: any; // Fabric selected object properties
  onUpdateProperty: (prop: string, val: any) => void;
  onApplyPreset: (preset: GamingPreset) => void;
  onAddTextLayer: (text: string) => void;
  onAddEmoji: (emoji: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
}

export default function SidebarTextDetail({
  activeObjProps,
  onUpdateProperty,
  onApplyPreset,
  onAddTextLayer,
  onAddEmoji,
  onDeleteLayer,
  onDuplicateLayer
}: SidebarTextDetailProps) {
  const [newTextVal, setNewTextVal] = useState('CRITICAL HIT! 💥');
  const [useGradient, setUseGradient] = useState(false);
  const [startColor, setStartColor] = useState('#ffff00');
  const [endColor, setEndColor] = useState('#ff5500');

  // Input bindings
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Luckiest Guy');
  const [fontSize, setFontSize] = useState(70);
  const [charSpacing, setCharSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.1);
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowOffsetX, setShadowOffsetX] = useState(5);
  const [shadowOffsetY, setShadowOffsetY] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [skewX, setSkewX] = useState(0);
  const [angle, setAngle] = useState(0);
  const [textCase, setTextCase] = useState<'uppercase' | 'lowercase' | 'none'>('none');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');

  // Synchronize input fields values with the newly selected object
  useEffect(() => {
    if (activeObjProps) {
      setText(activeObjProps.text || '');
      setFontFamily(activeObjProps.fontFamily || 'Inter');
      setFontSize(activeObjProps.fontSize || 70);
      setCharSpacing(activeObjProps.charSpacing || 0);
      setLineHeight(activeObjProps.lineHeight || 1.1);
      
      // Handle fill if it is a gradient or solid
      if (activeObjProps.fill && typeof activeObjProps.fill === 'object' && activeObjProps.fill.colorStops) {
        setUseGradient(true);
        setStartColor(activeObjProps.fill.colorStops[0].color || '#ffffff');
        setEndColor(activeObjProps.fill.colorStops[1].color || '#ff0000');
      } else {
        setUseGradient(false);
        setTextColor(activeObjProps.fill || '#ffffff');
      }

      setStrokeColor(activeObjProps.stroke || '#000000');
      setStrokeWidth(activeObjProps.strokeWidth || 0);
      setShadowColor(activeObjProps.shadowColor || '#000000');
      setShadowBlur(activeObjProps.shadowBlur || 0);
      setShadowOffsetX(activeObjProps.shadowOffsetX || 0);
      setShadowOffsetY(activeObjProps.shadowOffsetY || 0);
      setOpacity(Math.round((activeObjProps.opacity || 1) * 100));
      setSkewX(activeObjProps.skewX || 0);
      setAngle(Math.round(activeObjProps.angle || 0));
      setTextAlign(activeObjProps.textAlign || 'center');
    }
  }, [activeObjProps]);

  const triggerAddText = () => {
    if (newTextVal.trim()) {
      onAddTextLayer(newTextVal);
    }
  };

  const handleGradientToggle = (checked: boolean) => {
    setUseGradient(checked);
    if (checked) {
      onUpdateProperty('fill', {
        type: 'gradient',
        startColor: startColor,
        endColor: endColor
      });
    } else {
      onUpdateProperty('fill', textColor);
    }
  };

  return (
    <div id="text-system-panel" className="flex flex-col gap-5 p-1 h-full overflow-y-auto">
      {/* 1. Add Text Block Creator */}
      <div className="bg-brand-bg/40 border border-brand-border p-3 rounded-lg">
        <label className="text-neutral-300 font-semibold text-xs mb-2 block flex items-center gap-1.5">
          <Type size={14} className="text-brand-gold" /> Wording Creator
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTextVal}
            onChange={(e) => setNewTextVal(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-brand-bg border border-brand-border rounded text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent transition-colors font-sans"
            placeholder="Type your thumbnail text here..."
          />
          <button
            onClick={triggerAddText}
            className="px-3 bg-brand-accent hover:opacity-95 text-white rounded text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
          >
            <Plus size={14} /> Add Title
          </button>
        </div>

        {/* Dynamic Emoji quick grid */}
        <div className="mt-3">
          <p className="text-[10px] text-brand-muted mb-1.5 font-medium">Quick Insert Popular Gaming Emojis:</p>
          <div className="flex flex-wrap gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onAddEmoji(emoji)}
                className="w-7 h-7 bg-brand-bg hover:bg-brand-sidebar rounded border border-brand-border hover:border-brand-accent/50 flex items-center justify-center text-sm transition-all cursor-pointer select-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeObjProps ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-2">
            <span className="text-white font-bold text-xs flex items-center gap-1">
              <Sparkles size={14} className="text-brand-accent animate-pulse" />
              Customize Text Properties
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => onDuplicateLayer(activeObjProps.id)}
                title="Duplicate Layer"
                className="p-1.5 bg-brand-bg hover:opacity-90 hover:text-white rounded border border-brand-border text-neutral-350 transition-colors cursor-pointer"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={() => onUpdateProperty('locked', !activeObjProps.locked)}
                title={activeObjProps.locked ? "Unlock Layout" : "Lock Layout"}
                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                  activeObjProps.locked
                    ? 'bg-amber-950/40 border-amber-800 text-amber-400 hover:bg-amber-900/30'
                    : 'bg-brand-bg hover:bg-brand-border border-brand-border text-neutral-350'
                }`}
              >
                {activeObjProps.locked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
              <button
                onClick={() => onDeleteLayer(activeObjProps.id)}
                title="Delete Layer"
                className="p-1.5 bg-brand-red/5 hover:bg-brand-red/10 border border-brand-red/40 text-brand-red rounded transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Active text input field editor */}
          <div>
            <label className="text-[10px] text-brand-muted font-semibold uppercase block mb-1">Text Wording</label>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onUpdateProperty('text', e.target.value);
              }}
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent transition-colors h-14 resize-none"
              placeholder="Edit text content..."
            />
          </div>

          {/* Core font setup */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-brand-muted font-semibold uppercase block mb-1">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  onUpdateProperty('fontFamily', e.target.value);
                }}
                className="w-full px-2 py-1.5 bg-brand-bg border border-brand-border rounded text-xs text-white focus:outline-none focus:border-brand-accent transition-colors"
              >
                {FONTS.map(f => (
                  <option key={f.name} value={f.cssValue} style={{ fontFamily: f.cssValue }}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-brand-muted font-semibold uppercase block mb-1">Font Size</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 10;
                    setFontSize(val);
                    onUpdateProperty('fontSize', val);
                  }}
                  className="w-full px-2 py-1 bg-brand-bg border border-brand-border rounded text-xs text-white focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>
          </div>

          {/* Custom Presets Shortcut inside Panel */}
          <div>
            <span className="text-[10px] text-brand-muted font-semibold uppercase block mb-1.5 flex items-center gap-1">
              <Bold size={11} className="text-brand-accent" /> Apply Gaming Font Preset
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(FONT_PRESETS).map((presetName) => (
                <button
                  key={presetName}
                  onClick={() => onApplyPreset(FONT_PRESETS[presetName])}
                  className="px-2 py-1 bg-brand-bg/40 hover:bg-brand-bg text-neutral-300 hover:text-white rounded text-[10px] border border-brand-border hover:border-brand-accent/40 font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={10} className="text-brand-gold" />
                  {presetName}
                </button>
              ))}
            </div>
          </div>

          {/* Color Fill Settings (Solid vs Gradient) */}
          <div className="bg-brand-bg/40 border border-brand-border/60 p-3 rounded-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-white text-[11px] font-bold">Text Fill Color</span>
              <label className="flex items-center gap-1.5 text-[10px] text-brand-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGradient}
                  onChange={(e) => handleGradientToggle(e.target.checked)}
                  className="rounded dark:bg-brand-bg accent-brand-accent"
                />
                Use Linear Gradient
              </label>
            </div>

            {useGradient ? (
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <span className="text-[9px] text-brand-muted block mb-0.5 uppercase">Gradient Start</span>
                  <div className="flex gap-1 items-center">
                    <input
                      type="color"
                      value={startColor}
                      onChange={(e) => {
                        setStartColor(e.target.value);
                        onUpdateProperty('fill', {
                          type: 'gradient',
                          startColor: e.target.value,
                          endColor: endColor
                        });
                      }}
                      className="w-6 h-6 rounded border border-brand-border bg-transparent cursor-pointer p-0"
                    />
                    <span className="text-[10px] font-mono text-neutral-300 uppercase">{startColor}</span>
                  </div>
                </div>

                <MoveRight size={14} className="text-neutral-500 mt-3" />

                <div className="flex-1">
                  <span className="text-[9px] text-brand-muted block mb-0.5 uppercase">Gradient End</span>
                  <div className="flex gap-1 items-center">
                    <input
                      type="color"
                      value={endColor}
                      onChange={(e) => {
                        setEndColor(e.target.value);
                        onUpdateProperty('fill', {
                          type: 'gradient',
                          startColor: startColor,
                          endColor: e.target.value
                        });
                      }}
                      className="w-6 h-6 rounded border border-brand-border bg-transparent cursor-pointer p-0"
                    />
                    <span className="text-[10px] font-mono text-neutral-300 uppercase">{endColor}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    onUpdateProperty('fill', e.target.value);
                  }}
                  className="w-8 h-8 rounded border border-brand-border bg-transparent cursor-pointer p-0"
                />
                <div>
                  <span className="text-[10px] text-brand-muted block uppercase">Solid Fill</span>
                  <span className="text-xs font-mono text-neutral-200 uppercase font-semibold">{textColor}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stroke Outlines */}
          <div className="bg-brand-bg/40 border border-brand-border/60 p-3 rounded-lg flex flex-col gap-2.5">
            <span className="text-white text-[11px] font-bold">Border/Stroke Outline</span>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => {
                    setStrokeColor(e.target.value);
                    onUpdateProperty('stroke', e.target.value);
                  }}
                  className="w-8 h-8 rounded border border-brand-border bg-transparent cursor-pointer p-0"
                />
                <div>
                  <span className="text-[9px] text-brand-muted block uppercase">Color</span>
                  <span className="text-xs font-mono font-semibold text-neutral-300 uppercase">{strokeColor}</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                  <span>Thickness</span>
                  <span>{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={strokeWidth}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setStrokeWidth(val);
                    onUpdateProperty('strokeWidth', val);
                  }}
                  className="w-full h-1 bg-brand-border rounded appearance-none cursor-pointer accent-brand-accent animate-none"
                />
              </div>
            </div>
          </div>

          {/* Shadow properties */}
          <div className="bg-brand-bg/40 border border-brand-border/60 p-3 rounded-lg flex flex-col gap-3">
            <span className="text-white text-[11px] font-bold">Shadow Depth Offset</span>
            
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => {
                  setShadowColor(e.target.value);
                  onUpdateProperty('shadowColor', e.target.value);
                }}
                className="w-8 h-8 rounded border border-brand-border bg-transparent cursor-pointer p-0 shrink-0"
              />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between text-[9px] text-brand-muted">
                    <span>X Offset</span>
                    <span>{shadowOffsetX}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={shadowOffsetX}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setShadowOffsetX(val);
                      onUpdateProperty('shadowOffsetX', val);
                    }}
                    className="w-full h-1 bg-brand-border rounded accent-brand-accent"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-brand-muted">
                    <span>Y Offset</span>
                    <span>{shadowOffsetY}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={shadowOffsetY}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setShadowOffsetY(val);
                      onUpdateProperty('shadowOffsetY', val);
                    }}
                    className="w-full h-1 bg-brand-border rounded accent-brand-accent"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                <span>Shadow Blur Glow</span>
                <span>{shadowBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={shadowBlur}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setShadowBlur(val);
                  onUpdateProperty('shadowBlur', val);
                }}
                className="w-full h-1 bg-brand-border rounded appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
          </div>

          {/* Letter spacing, line height & alignment details */}
          <div className="bg-brand-bg/40 border border-brand-border/60 p-3 rounded-lg flex flex-col gap-3">
            <span className="text-white text-[11px] font-bold">Text Alignment & Spacing</span>
            
            {/* Case & Alignment block */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-brand-muted block mb-1 uppercase font-bold">Text Case</span>
                <div className="flex bg-brand-bg p-0.5 rounded border border-brand-border">
                  <button
                    onClick={() => {
                      setTextCase('none');
                      onUpdateProperty('textCase', 'none');
                    }}
                    className={`flex-1 text-[10px] font-semibold py-1 rounded transition-all cursor-pointer ${textCase === 'none' ? 'bg-brand-accent text-white' : 'text-brand-muted hover:text-white'}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => {
                      setTextCase('uppercase');
                      onUpdateProperty('textCase', 'uppercase');
                    }}
                    className={`flex-1 text-[10px] font-semibold py-1 rounded transition-all cursor-pointer flex items-center justify-center gap-0.5 ${textCase === 'uppercase' ? 'bg-brand-accent text-white font-extrabold' : 'text-brand-muted hover:text-white'}`}
                  >
                    <ArrowUpAZ size={10} /> AAA
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-brand-muted block mb-1 uppercase font-bold">Align</span>
                <div className="flex bg-brand-bg p-0.5 rounded border border-brand-border">
                  <button
                    onClick={() => {
                      setTextAlign('left');
                      onUpdateProperty('textAlign', 'left');
                    }}
                    className={`flex-1 py-1 rounded flex items-center justify-center transition-all cursor-pointer ${textAlign === 'left' ? 'bg-brand-accent text-white' : 'text-brand-muted hover:text-white'}`}
                  >
                    <AlignLeft size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setTextAlign('center');
                      onUpdateProperty('textAlign', 'center');
                    }}
                    className={`flex-1 py-1 rounded flex items-center justify-center transition-all cursor-pointer ${textAlign === 'center' ? 'bg-brand-accent text-white' : 'text-brand-muted hover:text-white'}`}
                  >
                    <AlignCenter size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setTextAlign('right');
                      onUpdateProperty('textAlign', 'right');
                    }}
                    className={`flex-1 py-1 rounded flex items-center justify-center transition-all cursor-pointer ${textAlign === 'right' ? 'bg-brand-accent text-white' : 'text-brand-muted hover:text-white'}`}
                  >
                    <AlignRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Letter spacing */}
            <div>
              <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                <span>Letter Spacing</span>
                <span>{charSpacing}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="500"
                step="10"
                value={charSpacing}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCharSpacing(val);
                  onUpdateProperty('charSpacing', val);
                }}
                className="w-full h-1 bg-brand-border rounded appearance-none cursor-pointer accent-brand-accent"
              />
            </div>

            {/* Line height */}
            <div>
              <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                <span>Line Height</span>
                <span>{lineHeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={lineHeight}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLineHeight(val);
                  onUpdateProperty('lineHeight', val);
                }}
                className="w-full h-1 bg-brand-border rounded appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
          </div>

          {/* Opacity & Skew Transforms */}
          <div className="bg-brand-bg/40 border border-brand-border/60 p-3 rounded-lg flex flex-col gap-3">
            <span className="text-white text-[11px] font-bold">Transforms & Opacity</span>

            {/* Angle rotation */}
            <div>
              <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                <span>Rotate Canvas Text</span>
                <span>{angle}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={angle}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setAngle(val);
                  onUpdateProperty('angle', val);
                }}
                className="w-full h-1 bg-brand-border rounded accent-brand-accent"
              />
            </div>

            {/* Skew text */}
            <div>
              <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                <span>Skew Angle X</span>
                <span>{skewX}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={skewX}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSkewX(val);
                  onUpdateProperty('skewX', val);
                }}
                className="w-full h-1 bg-brand-border rounded appearance-none cursor-pointer accent-brand-accent"
              />
            </div>

            {/* Opacity block */}
            <div>
              <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                <span>Opacity Visibility</span>
                <span>{opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setOpacity(val);
                  onUpdateProperty('opacity', val / 100);
                }}
                className="w-full h-1 bg-brand-border rounded appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 border border-dashed border-brand-border rounded-lg">
          <Type size={32} className="text-brand-muted/40 mb-2" />
          <p className="text-neutral-300 text-xs font-semibold">No Text Layer Selected</p>
          <p className="text-brand-muted text-[10px] mt-1 max-w-[200px] leading-relaxed">
            Click on any canvas text layer to customize design, or use the creator above to add a dynamic new heading!
          </p>
        </div>
      )}
    </div>
  );
}
