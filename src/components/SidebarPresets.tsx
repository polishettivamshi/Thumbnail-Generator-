import React from 'react';
import { TEXT_EFFECTS, PRESET_WORDINGS, BOTTOM_CAPTIONS } from '../constants';
import { TextEffect, PresetTextWording } from '../types';
import { Sparkles, Film, Type, PlaySquare, ArrowRight, Zap } from 'lucide-react';

interface SidebarPresetsProps {
  onApplyEffect: (effect: TextEffect) => void;
  onApplyWording: (preset: PresetTextWording) => void;
  onAddBottomCaption: (caption: string) => void;
  activeObjectSelected: boolean;
}

export default function SidebarPresets({
  onApplyEffect,
  onApplyWording,
  onAddBottomCaption,
  activeObjectSelected
}: SidebarPresetsProps) {
  return (
    <div id="presets-panel" className="flex flex-col gap-5 p-1 h-full overflow-y-auto">
      {/* Type Effects (Active Object modifiers) */}
      <div>
        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-brand-border">
          <Sparkles size={15} className="text-brand-gold shrink-0" />
          <h3 className="text-white font-semibold text-sm">Viral Text Effects</h3>
        </div>
        
        {!activeObjectSelected && (
          <p className="text-brand-muted text-[10px] mb-3 leading-relaxed">
            💡 Select any text layer on your canvas to apply these styles in 1-click!
          </p>
        )}

        <div className="flex flex-col gap-2">
          {TEXT_EFFECTS.map((effect) => (
            <button
              key={effect.id}
              onClick={() => onApplyEffect(effect)}
              disabled={!activeObjectSelected}
              className={`flex items-center justify-between p-3 rounded border text-left transition-all ${
                activeObjectSelected
                  ? 'bg-brand-bg/40 border-brand-border hover:bg-brand-bg/90 hover:border-brand-accent/50 cursor-pointer'
                  : 'bg-brand-bg/10 border-brand-border/40 opacity-45 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-white text-xs font-semibold">{effect.name}</span>
                <span className="text-[10px] text-brand-muted font-mono mt-0.5">{effect.fontFamily}</span>
              </div>
              
              {/* Mini visual mockup of the style inside the button */}
              <div 
                className="px-2.5 py-1 rounded text-xs font-bold font-sans flex items-center justify-center shadow-md select-none"
                style={{
                  fontFamily: effect.fontFamily,
                  color: effect.fill,
                  backgroundColor: effect.id === 'limbo_style' ? '#111111' : '#222222',
                  border: `${effect.strokeWidth ? Math.min(effect.strokeWidth / 3, 3) : 0}px solid ${effect.stroke || 'transparent'}`,
                  textShadow: effect.shadowColor 
                    ? `${effect.shadowOffsetX ? effect.shadowOffsetX / 3 : 1}px ${effect.shadowOffsetY ? effect.shadowOffsetY / 3 : 2}px ${effect.shadowBlur ? effect.shadowBlur / 3 : 2}px ${effect.shadowColor}`
                    : 'none'
                }}
              >
                GAMER
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Wording layouts */}
      <div>
        <div className="flex items-center gap-2 mb-2.5 pb-1 border-b border-brand-border">
          <Type size={15} className="text-brand-accent shrink-0" />
          <h3 className="text-white font-semibold text-sm">Click-to-Insert Gaming Wordings</h3>
        </div>
        <p className="text-brand-muted text-[10px] mb-3 leading-relaxed">
          Instantly add professionally arranged, viral gaming slogans onto your canvas:
        </p>

        <div className="flex flex-col gap-2">
          {PRESET_WORDINGS.map((preset, idx) => (
            <button
              key={preset.id}
              onClick={() => onApplyWording(preset)}
              className="w-full bg-brand-bg/40 hover:bg-brand-bg border border-brand-border hover:border-brand-accent/40 p-2.5 rounded-lg text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                {preset.texts.map((t, lineIdx) => (
                  <span
                    key={lineIdx}
                    className="text-xs font-bold leading-none capitalize"
                    style={{
                      fontFamily: t.fontFamily,
                      color: t.fill,
                      textShadow: `1px 1px 2px ${t.shadowColor}`
                    }}
                  >
                    {t.text}
                  </span>
                ))}
              </div>
              <div className="p-1 px-1.5 bg-brand-bg border border-brand-border group-hover:bg-brand-accent group-hover:border-brand-accent rounded text-[9px] font-medium font-sans text-brand-muted group-hover:text-white transition-all flex items-center gap-1">
                <span>Add Layer</span>
                <ArrowRight size={10} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Bottom Slogan Captions panel */}
      <div>
        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-brand-border">
          <Film size={15} className="text-brand-accent shrink-0" />
          <h3 className="text-white font-semibold text-sm">Viral Bottom Captions</h3>
        </div>
        <p className="text-brand-muted text-[10px] mb-3 leading-relaxed">
          Standard viral caption subtitles positioned instantly at the bottom center of your thumbnail:
        </p>

        <div className="flex flex-col gap-2">
          {BOTTOM_CAPTIONS.map((caption) => (
            <button
              key={caption}
              onClick={() => onAddBottomCaption(caption)}
              className="w-full bg-brand-bg/40 hover:bg-brand-accent/10 text-neutral-300 hover:text-white border border-brand-border hover:border-brand-accent/60 p-2 py-2.5 rounded text-left text-xs font-mono font-bold transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate flex-1 pr-2">{caption}</span>
              <span className="p-0.5 bg-brand-bg border border-brand-border group-hover:border-brand-accent rounded text-[8px] text-brand-muted group-hover:text-white shrink-0 font-sans flex items-center gap-0.5 uppercase">
                <Zap size={8} /> Add
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
