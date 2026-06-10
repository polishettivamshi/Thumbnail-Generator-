import React, { useRef, useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Tv, 
  Smartphone, 
  Download, 
  Trash2, 
  Plus, 
  Info,
  Layers as LayersIcon,
  Sparkles,
  Sliders,
  Type,
  FileImage,
  Image as ImageIcon
} from 'lucide-react';

import { ThumbnailCanvas, ThumbnailCanvasRef } from './components/ThumbnailCanvas';
import SidebarBackground from './components/SidebarBackground';
import SidebarTextDetail from './components/SidebarTextDetail';
import SidebarLayers from './components/SidebarLayers';
import SidebarPresets from './components/SidebarPresets';

import { CanvasMode, LayerItem, GamingPreset, TextEffect, PresetTextWording } from './types';
import { STARTER_BACKGROUNDS } from './constants';

export default function App() {
  const canvasRef = useRef<ThumbnailCanvasRef>(null);

  // Core application states
  const [mode, setMode] = useState<CanvasMode>('thumbnail');
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [activeObjProps, setActiveObjProps] = useState<any>(null);
  const [isBgEditMode, setIsBgEditMode] = useState(false);

  // Tabs layout controls
  const [leftTab, setLeftTab] = useState<'background' | 'text'>('text');
  const [rightTab, setRightTab] = useState<'layers' | 'presets'>('presets');

  // Export settings states
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [exportQuality, setExportQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  const [isExporting, setIsExporting] = useState(false);

  // Trigger default background on load
  useEffect(() => {
    // Lazy initial load of default background
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.uploadBackground(STARTER_BACKGROUNDS[0].url);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Quick background helpers
  const handleBackgroundSelect = (url: string) => {
    canvasRef.current?.uploadBackground(url);
  };

  const handleBackgroundUpload = (file: File) => {
    canvasRef.current?.uploadBackground(file);
  };

  const handleBackgroundRemove = () => {
    canvasRef.current?.removeBackground();
  };

  const handleFilterChange = (
    filter: 'zoom' | 'offsetX' | 'offsetY' | 'blur' | 'brightness' | 'contrast' | 'overlayOpacity' | 'overlayColor',
    value: any
  ) => {
    canvasRef.current?.updateBackgroundFilter(filter, value);
  };

  // Text modification helpers
  const handleUpdateProperty = (prop: string, val: any) => {
    canvasRef.current?.updateActiveTextProperty(prop, val);
  };

  const handleApplyPreset = (preset: GamingPreset) => {
    canvasRef.current?.applyTextPreset(preset);
  };

  const handleApplyWordingPreset = (preset: PresetTextWording) => {
    // Stagger text parts nicely on the canvas
    preset.texts.forEach((line, index) => {
      canvasRef.current?.addText(line.text, {
        fontFamily: line.fontFamily,
        fill: line.fill,
        stroke: line.stroke,
        strokeWidth: line.strokeWidth,
        fontSize: 80 - index * 5,
        top: mode === 'thumbnail' ? (200 + index * 95) : (500 + index * 110),
        shadow: {
          color: line.shadowColor,
          blur: line.shadowBlur,
          offsetX: 5,
          offsetY: 6
        } as any
      });
    });
    // Jump to text tab and layers tab for quick refinement
    setLeftTab('text');
  };

  const handleAddBottomCaption = (caption: string) => {
    const isShorts = mode === 'shorts';
    canvasRef.current?.addText(caption, {
      fontFamily: 'Anton',
      fontSize: isShorts ? 65 : 48,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 8,
      top: isShorts ? 1720 : 620, // place perfectly at the bottom segment
      textAlign: 'center',
      width: isShorts ? 900 : 1000,
      shadow: {
        color: '#000000',
        blur: 10,
        offsetX: 4,
        offsetY: 4
      } as any
    });
  };

  const handleAddTextLayer = (customText: string) => {
    canvasRef.current?.addText(customText);
    setLeftTab('text');
  };

  const handleAddEmoji = (emoji: string) => {
    canvasRef.current?.addEmoji(emoji);
    setLeftTab('text');
  };

  // Layer control actions
  const handleRenameLayer = (id: string, name: string) => {
    canvasRef.current?.renameLayer(id, name);
  };

  const handleToggleVisibility = (id: string) => {
    canvasRef.current?.toggleLayerVisibility(id);
  };

  const handleToggleLock = (id: string) => {
    canvasRef.current?.toggleLayerLock(id);
  };

  const handleDeleteLayer = (id: string) => {
    canvasRef.current?.deleteLayer(id);
  };

  const handleDuplicateLayer = (id: string) => {
    canvasRef.current?.duplicateLayer(id);
  };

  const handleChangeDepth = (id: string, direction: 'forward' | 'backward' | 'front' | 'back') => {
    canvasRef.current?.changeLayerIndex(id, direction);
  };

  const handleSelectLayer = (id: string) => {
    canvasRef.current?.selectLayer(id);
  };

  // Wipe board Clean
  const handleClearBoard = () => {
    if (window.confirm('Wipe board? This removes all custom texts, emojis, and styling.')) {
      // Remove all elements except background images
      layers.forEach(layer => {
        if (layer.id !== 'bg-image') {
          canvasRef.current?.deleteLayer(layer.id);
        }
      });
    }
  };

  // Export & Download handler
  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    setTimeout(() => {
      try {
        const dataUrl = canvasRef.current!.exportImage(exportFormat, exportQuality);
        if (!dataUrl) {
          alert('Failed to render content.');
          setIsExporting(false);
          return;
        }

        // Trigger safe file link download
        const link = document.createElement('a');
        const filename = `gaming-thumbnail-${Date.now()}.${exportFormat === 'jpeg' ? 'jpg' : exportFormat}`;
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Download issue:', err);
      } finally {
        setIsExporting(false);
      }
    }, 400); // Small buffer for render safety
  };

  return (
    <div className="min-h-screen bg-brand-bg text-neutral-200 font-sans flex flex-col overflow-hidden select-none">
      
      {/* 1. Header Toolbar */}
      <header className="h-14 bg-brand-sidebar border-b border-brand-border flex items-center justify-between px-4 shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/25 border border-brand-accent/30">
            <Gamepad2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
              STUDIO.GAMING
              <span className="text-[9px] bg-brand-bg border border-brand-border text-brand-accent px-1 py-0.5 rounded uppercase font-bold tracking-widest font-mono">
                BETA
              </span>
            </h1>
            <p className="text-[10px] text-brand-muted mt-1">Canva-like thumbnail creator for Esports & Gaming content</p>
          </div>
        </div>

        {/* Studio mode switcher */}
        <div className="flex items-center bg-brand-bg p-1 rounded-full border border-brand-border shrink-0">
          <button
            onClick={() => setMode('thumbnail')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'thumbnail'
                ? 'bg-brand-accent text-white shadow-lg'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <Tv size={13} />
            <span>YT Thumbnail (16:9)</span>
          </button>
          
          <button
            onClick={() => setMode('shorts')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'shorts'
                ? 'bg-brand-accent text-white shadow-lg'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <Smartphone size={13} />
            <span>YT Shorts (9:16)</span>
          </button>
        </div>

        {/* Global Export settings */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-[1px] bg-brand-border hidden sm:block" />
          
          <div className="flex items-center gap-1 bg-brand-bg p-0.5 rounded border border-brand-border text-[10px] text-brand-muted">
            <select
              value={exportFormat}
              onChange={(e: any) => setExportFormat(e.target.value)}
              className="bg-transparent border-none text-[10px] text-white font-bold p-1 cursor-pointer focus:outline-none"
            >
              <option value="png" className="bg-brand-sidebar">Format: PNG</option>
              <option value="jpeg" className="bg-brand-sidebar">Format: JPG</option>
              <option value="webp" className="bg-brand-sidebar">Format: WEBP</option>
            </select>

            <span className="text-brand-border">|</span>

            <select
              value={exportQuality}
              onChange={(e: any) => setExportQuality(e.target.value)}
              className="bg-transparent border-none text-[10px] text-white font-bold p-1 cursor-pointer focus:outline-none"
            >
              <option value="low" className="bg-brand-sidebar">Low (0.5x)</option>
              <option value="medium" className="bg-brand-sidebar">Medium (1.0x)</option>
              <option value="high" className="bg-brand-sidebar">High (2.0x)</option>
              <option value="ultra" className="bg-brand-sidebar">Ultra (3.0x HD)</option>
            </select>
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-4 py-2 bg-brand-accent hover:bg-opacity-90 disabled:opacity-40 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-lg shadow-brand-accent/15 transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>{isExporting ? 'Exporting...' : 'Export Art'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden w-full">
        
        {/* LEFT COLUMN: Controls for Background, custom Texts, emojis */}
        <section id="sidebar-left" className="w-[340px] bg-brand-sidebar border-r border-brand-border flex flex-col shrink-0 overflow-hidden">
          
          {/* Sub Tab switchers */}
          <div className="flex bg-brand-bg p-1 border-b border-brand-border">
            <button
              onClick={() => setLeftTab('text')}
              className={`flex-1 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                leftTab === 'text'
                  ? 'border border-brand-border text-brand-accent font-extrabold bg-brand-sidebar'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <Type size={13} className="text-brand-gold" />
              <span>Slogan Builder</span>
            </button>
            <button
              onClick={() => setLeftTab('background')}
              className={`flex-1 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                leftTab === 'background'
                  ? 'border border-brand-border text-brand-accent font-extrabold bg-brand-sidebar'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <ImageIcon size={13} className="text-brand-accent" />
              <span>Backdrop Filter</span>
            </button>
          </div>

          {/* Active Tab contents */}
          <div className="flex-1 overflow-y-auto p-4 content-box">
            {leftTab === 'background' ? (
              <SidebarBackground
                onBackgroundSelect={handleBackgroundSelect}
                onBackgroundUpload={handleBackgroundUpload}
                onBackgroundRemove={handleBackgroundRemove}
                onFilterChange={handleFilterChange}
                isBgEditMode={isBgEditMode}
                setBgEditMode={setIsBgEditMode}
              />
            ) : (
              <SidebarTextDetail
                activeObjProps={activeObjProps}
                onUpdateProperty={handleUpdateProperty}
                onApplyPreset={handleApplyPreset}
                onAddTextLayer={handleAddTextLayer}
                onAddEmoji={handleAddEmoji}
                onDeleteLayer={handleDeleteLayer}
                onDuplicateLayer={handleDuplicateLayer}
              />
            )}
          </div>
        </section>

        {/* MIDDLE STAGE AREA */}
        <section id="preview-stage" className="flex-1 bg-brand-bg flex flex-col min-w-0 p-4 relative">
          
          {/* Quick-action helper buttons at the top of the board */}
          <div className="flex items-center justify-between mb-3 shrink-0 bg-brand-sidebar/80 p-2 rounded-lg border border-brand-border max-w-full overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddTextLayer('DOUBLE CLICK TO EDIT')}
                className="px-3 py-1.5 bg-brand-bg hover:bg-brand-sidebar/60 border border-brand-border text-xs font-semibold text-white rounded flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={13} className="text-brand-gold" />
                <span>New Slogan</span>
              </button>
              
              <button
                onClick={() => handleAddEmoji('🔥')}
                className="px-3 py-1.5 bg-brand-bg hover:bg-brand-sidebar/60 border border-brand-border text-xs font-semibold text-white rounded flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>➕ Insert Emoji</span>
              </button>
            </div>

            <div className="flex items-center gap-2 font-sans">
              <span className="text-[10px] text-brand-muted font-mono flex items-center gap-1">
                <Info size={11} className="text-brand-muted shrink-0" />
                Canvas Aspect: {mode === 'thumbnail' ? '1280 × 720 px' : '1080 × 1920 px'}
              </span>
              <span className="text-brand-border">|</span>
              <button
                onClick={handleClearBoard}
                className="text-[10px] text-brand-red hover:text-opacity-80 transition-colors flex items-center gap-1 cursor-pointer font-bold px-2 py-1 rounded hover:bg-brand-red/10"
              >
                <Trash2 size={11} className="text-brand-red" />
                <span>Wipe Slogans</span>
              </button>
            </div>
          </div>

          {/* Interactive Fabric.js Canvas Viewport Board */}
          <div className="flex-1 flex items-center justify-center relative bg-[#131316] border border-brand-border/60 rounded-xl overflow-hidden p-2">
            <ThumbnailCanvas
              ref={canvasRef}
              mode={mode}
              onActiveObjectChange={setActiveObjProps}
              onLayersUpdate={setLayers}
            />
          </div>

          {/* Guidelines hint for thumbnail creations */}
          <div className="mt-3 text-center text-[10.5px] text-brand-muted flex items-center justify-center gap-1 bg-brand-sidebar/40 py-1.5 rounded-md border border-brand-border shrink-0">
            <span>🎨</span>
            <span>Tip: Drag, stretch, or rotate text with handles directly on preview. Double-click layers to re-type wording text.</span>
          </div>

        </section>

        {/* RIGHT COLUMN: Layer Management & Preset templates */}
        <section id="sidebar-right" className="w-[340px] bg-brand-sidebar border-l border-brand-border flex flex-col shrink-0 overflow-hidden">
          
          {/* Sub Tab switchers */}
          <div className="flex bg-brand-bg p-1 border-b border-brand-border">
            <button
              onClick={() => setRightTab('presets')}
              className={`flex-1 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'presets'
                  ? 'border border-brand-border text-brand-accent font-extrabold bg-brand-sidebar'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <Sparkles size={13} className="text-pink-400" />
              <span>Presets & Effects</span>
            </button>
            <button
              onClick={() => setRightTab('layers')}
              className={`flex-1 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'layers'
                  ? 'border border-brand-border text-brand-accent font-extrabold bg-brand-sidebar'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <LayersIcon size={13} className="text-brand-accent" />
              <span>Layers List</span>
            </button>
          </div>

          {/* Tab contents */}
          <div className="flex-1 overflow-y-auto p-4 content-box">
            {rightTab === 'layers' ? (
              <SidebarLayers
                layers={layers}
                onRenameLayer={handleRenameLayer}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onDeleteLayer={handleDeleteLayer}
                onDuplicateLayer={handleDuplicateLayer}
                onChangeDepth={handleChangeDepth}
                onSelectLayer={handleSelectLayer}
              />
            ) : (
              <SidebarPresets
                onApplyEffect={canvasRef.current?.applyTextEffectPreset || (() => {})}
                onApplyWording={handleApplyWordingPreset}
                onAddBottomCaption={handleAddBottomCaption}
                activeObjectSelected={activeObjProps !== null && ['textbox', 'i-text', 'text'].includes(activeObjProps.type || '')}
              />
            )}
          </div>
        </section>

      </main>

      {/* 3. Subtle Status Footer */}
      <footer className="h-7 bg-brand-sidebar border-t border-brand-border px-3.5 flex items-center justify-between text-[9.5px] text-brand-muted font-mono shrink-0 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Vite Hot Server Online
          </span>
          <span>•</span>
          <span>Source: Canvas Fabric Stack</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Active Layer ID: {activeObjProps ? activeObjProps.id : 'None Selected'}</span>
          <span>|</span>
          <span>Format Mode: {mode === 'thumbnail' ? '1280x720' : '1080x1920'}</span>
        </div>
      </footer>
    </div>
  );
}
