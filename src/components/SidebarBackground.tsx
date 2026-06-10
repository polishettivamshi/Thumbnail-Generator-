import React, { useRef, useState } from 'react';
import { Image, Trash2, Sliders, Sun, ShieldAlert, Sparkles, Move, Check } from 'lucide-react';
import { STARTER_BACKGROUNDS } from '../constants';

interface SidebarBackgroundProps {
  onBackgroundSelect: (url: string) => void;
  onBackgroundUpload: (file: File) => void;
  onBackgroundRemove: () => void;
  onFilterChange: (filter: 'zoom' | 'offsetX' | 'offsetY' | 'blur' | 'brightness' | 'contrast' | 'overlayOpacity' | 'overlayColor', value: any) => void;
  isBgEditMode: boolean;
  setBgEditMode: (enabled: boolean) => void;
}

export default function SidebarBackground({
  onBackgroundSelect,
  onBackgroundUpload,
  onBackgroundRemove,
  onFilterChange,
  isBgEditMode,
  setBgEditMode
}: SidebarBackgroundProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  // States for filter sliders
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100); // displayed as percentage (100% = 1.0)
  const [contrast, setContrast] = useState(100); // displayed as percentage (100% = 1.0)
  const [overlayOpacity, setOverlayOpacity] = useState(20); // displayed as percentage (20% = 0.2)
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onBackgroundUpload(file);
        setSelectedPresetUrl('');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onBackgroundUpload(e.target.files[0]);
      setSelectedPresetUrl('');
    }
  };

  const resetAllFilters = () => {
    setBlur(0);
    setBrightness(100);
    setContrast(100);
    setOverlayOpacity(20);
    setOverlayColor('#000000');
    setZoom(1);
    setOffsetX(0);
    setOffsetY(1);

    onFilterChange('blur', 0);
    onFilterChange('brightness', 1);
    onFilterChange('contrast', 1);
    onFilterChange('overlayOpacity', 0.2);
    onFilterChange('overlayColor', '#000000');
    onFilterChange('zoom', 1);
    onFilterChange('offsetX', 0);
    onFilterChange('offsetY', 0);
  };

  return (
    <div id="bg-controls-panel" className="flex flex-col gap-5 p-1 h-full overflow-y-auto">
      {/* Upload Box */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
          <Image size={16} className="text-brand-accent" />
          Background Layer
        </h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-accent bg-brand-accent/10'
              : 'border-brand-border hover:border-brand-accent/50 bg-brand-bg/40 hover:bg-brand-bg/70'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Image size={32} className="text-neutral-400 mb-2" />
          <p className="text-white text-xs font-semibold">Drag & Drop Image Here</p>
          <p className="text-neutral-400 text-[10px] mt-1">or Click to upload raw file</p>
        </div>
      </div>

      {/* Preset Backdrops selector */}
      <div>
        <h4 className="text-neutral-300 font-medium text-xs mb-2 flex items-center gap-1">
          <Sparkles size={13} className="text-brand-gold" />
          Starter Gaming Backgrounds
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {STARTER_BACKGROUNDS.map((bg) => (
            <button
              key={bg.name}
              onClick={() => {
                onBackgroundSelect(bg.url);
                setSelectedPresetUrl(bg.url);
              }}
              className={`group relative h-16 rounded overflow-hidden border transition-all ${
                selectedPresetUrl === bg.url
                  ? 'border-brand-accent ring-1 ring-brand-accent/40'
                  : 'border-brand-border hover:border-brand-accent/40'
              }`}
            >
              <img
                src={bg.url}
                alt={bg.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1 transition-opacity group-hover:bg-black/30">
                <span className="text-white text-[9px] font-medium truncate w-full flex items-center justify-between">
                  {bg.name}
                  {selectedPresetUrl === bg.url && <Check size={10} className="text-brand-accent shrink-0 ml-1" />}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Position & Zoom Controls */}
      <div className="bg-brand-bg/40 p-3 rounded-lg border border-brand-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium text-xs flex items-center gap-1">
            <Move size={14} className="text-brand-accent" /> Frame Position / Zoom
          </span>
          <button
            onClick={() => setBgEditMode(!isBgEditMode)}
            className={`px-3 py-1 text-[10px] font-semibold rounded-full border transition-all flex items-center gap-1 ${
              isBgEditMode
                ? 'bg-brand-accent text-white border-brand-accent/50 ring-2 ring-brand-accent/20'
                : 'bg-brand-sidebar text-neutral-300 border-brand-border hover:bg-brand-border'
            }`}
          >
            <Move size={12} className={isBgEditMode ? 'animate-pulse' : ''} />
            {isBgEditMode ? 'Edit on Canvas Active' : 'Resize / Reposition'}
          </button>
        </div>

        {isBgEditMode && (
          <p className="text-brand-accent text-[10px] mb-3 leading-relaxed">
            💡 Drag & stretch the background image directly on the live canvas to align perfectly!
          </p>
        )}

        <div className="flex flex-col gap-3">
          {/* Zoom Slider */}
          <div>
            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
              <span>Zoom Scale</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setZoom(val);
                onFilterChange('zoom', val);
              }}
              className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent animate-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Move X */}
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                <span>Offset X</span>
                <span>{offsetX}px</span>
              </div>
              <input
                type="range"
                min="-500"
                max="500"
                step="5"
                value={offsetX}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setOffsetX(val);
                  onFilterChange('offsetX', val);
                }}
                className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
              />
            </div>

            {/* Move Y */}
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                <span>Offset Y</span>
                <span>{offsetY}px</span>
              </div>
              <input
                type="range"
                min="-500"
                max="500"
                step="5"
                value={offsetY}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setOffsetY(val);
                  onFilterChange('offsetY', val);
                }}
                className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Filters Sliders */}
      <div className="bg-brand-bg/40 p-3 rounded-lg border border-brand-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-xs flex items-center gap-1">
            <Sliders size={14} className="text-brand-accent" /> Cinematic Enhancements
          </span>
          <button
            onClick={resetAllFilters}
            className="text-[10px] text-brand-accent hover:text-white transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        {/* Blur slider */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>Blur Background</span>
            <span>{blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="1"
            value={blur}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setBlur(val);
              onFilterChange('blur', val);
            }}
            className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>

        {/* Brightness slider */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>Brightness</span>
            <span>{brightness}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="180"
            value={brightness}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setBrightness(val);
              onFilterChange('brightness', val / 100);
            }}
            className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>

        {/* Contrast slider */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>Contrast</span>
            <span>{contrast}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="180"
            value={contrast}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setContrast(val);
              onFilterChange('contrast', val / 100);
            }}
            className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>

        {/* Overlay Block */}
        <div className="border-t border-brand-border pt-3 mt-1">
          <span className="text-white text-[11px] font-medium block mb-2">Shadow Vignette / Overlay</span>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="color"
                value={overlayColor}
                onChange={(e) => {
                  setOverlayColor(e.target.value);
                  onFilterChange('overlayColor', e.target.value);
                }}
                className="w-8 h-8 rounded border border-brand-border bg-transparent cursor-pointer overflow-hidden p-0"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                <span>Vignette Opacity</span>
                <span>{overlayOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={overlayOpacity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setOverlayOpacity(val);
                  onFilterChange('overlayOpacity', val / 100);
                }}
                className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Remove Option */}
      <button
        onClick={() => {
          onBackgroundRemove();
          setSelectedPresetUrl('');
          resetAllFilters();
        }}
        className="w-full py-2 bg-brand-red/5 border border-brand-red/30 hover:bg-brand-red/10 text-brand-red rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Trash2 size={13} />
        Reset to Transparent Layer
      </button>
    </div>
  );
}
