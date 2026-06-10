import React, { useState } from 'react';
import { LayerItem } from '../types';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUp, 
  ChevronsDown,
  Edit2,
  Check,
  Type,
  Image as ImageIcon,
  Smile,
  Square
} from 'lucide-react';

interface SidebarLayersProps {
  layers: LayerItem[];
  onRenameLayer: (id: string, name: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onChangeDepth: (id: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  onSelectLayer: (id: string) => void;
}

export default function SidebarLayers({
  layers,
  onRenameLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onDuplicateLayer,
  onChangeDepth,
  onSelectLayer
}: SidebarLayersProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setTempName(currentName);
  };

  const saveRename = (id: string) => {
    if (tempName.trim()) {
      onRenameLayer(id, tempName.trim());
    }
    setEditingId(null);
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type size={14} className="text-brand-gold shrink-0" />;
      case 'image':
        return <ImageIcon size={14} className="text-brand-accent shrink-0" />;
      case 'emoji':
        return <Smile size={14} className="text-pink-400 shrink-0" />;
      case 'rect':
        return <Square size={14} className="text-emerald-400 shrink-0" />;
      default:
        return <Layers size={14} className="text-brand-muted shrink-0" />;
    }
  };

  return (
    <div id="layers-manager-panel" className="flex flex-col gap-4 p-1 h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b border-brand-border pb-2">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Layers size={15} className="text-brand-accent" />
          Layer Management ({layers.length})
        </h3>
        {layers.length > 0 && (
          <span className="text-[10px] text-brand-muted bg-[#131316] border border-brand-border px-1.5 py-0.5 rounded font-mono">
            STACKED ORDER
          </span>
        )}
      </div>

      {layers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-brand-border rounded-lg">
          <Layers size={28} className="text-neutral-700 mb-2" />
          <p className="text-neutral-400 text-xs">No layers found</p>
          <p className="text-neutral-500 text-[10px] mt-1 max-w-[180px] leading-relaxed">
            Layers will appear here as soon as you choose a background image or add text layers!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {layers.map((layer, index) => {
            const isEditing = editingId === layer.id;
            
            return (
              <div
                key={layer.id}
                onClick={() => !isEditing && onSelectLayer(layer.id)}
                className={`group flex flex-col gap-1.5 p-2 rounded border transition-all ${
                  layer.active
                    ? 'bg-brand-accent/10 border-brand-accent shadow-sm'
                    : 'bg-brand-bg/40 hover:bg-brand-bg border-brand-border/80'
                } ${!isEditing ? 'cursor-pointer' : ''}`}
              >
                {/* 1. Layer title & properties row */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {getLayerIcon(layer.type)}
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={() => saveRename(layer.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename(layer.id)}
                        className="px-2 py-0.5 bg-brand-bg border border-brand-border rounded text-xs text-white focus:outline-none focus:border-brand-accent w-full"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className={`text-xs font-medium truncate ${layer.active ? 'text-white' : 'text-neutral-300'}`}>
                        {layer.name}
                      </span>
                    )}
                  </div>

                  {/* Inline text / name edit triggers */}
                  {!isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(layer.id, layer.name);
                      }}
                      className="p-1 text-neutral-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Rename Layer"
                    >
                      <Edit2 size={10} />
                    </button>
                  )}
                </div>

                {/* 2. Layer controls cluster */}
                <div className="flex items-center justify-between border-t border-brand-border/40 pt-1.5 mt-0.5">
                  {/* Layer ordering stack sliders depth */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeDepth(layer.id, 'front'); }}
                      disabled={index === 0}
                      title="Bring to Absolute Front"
                      className="p-1 hover:bg-brand-bg rounded text-brand-muted hover:text-white disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronsUp size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeDepth(layer.id, 'forward'); }}
                      disabled={index === 0}
                      title="Bring Forward"
                      className="p-1 hover:bg-brand-bg rounded text-brand-muted hover:text-white disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeDepth(layer.id, 'backward'); }}
                      disabled={index === layers.length - 1}
                      title="Send Backward"
                      className="p-1 hover:bg-brand-bg rounded text-brand-muted hover:text-white disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeDepth(layer.id, 'back'); }}
                      disabled={index === layers.length - 1}
                      title="Send to Absolute Back"
                      className="p-1 hover:bg-brand-bg rounded text-brand-muted hover:text-white disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronsDown size={11} />
                    </button>
                  </div>

                  {/* Visibility, Locks, Duplicate & Delete */}
                  <div className="flex items-center gap-1.5">
                    {/* Layer Visibility */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                      title={layer.visible ? "Hide Layer" : "Show Layer"}
                      className={`p-1 rounded cursor-pointer ${layer.visible ? 'text-brand-muted hover:text-white' : 'text-amber-500 bg-amber-500/10'}`}
                    >
                      {layer.visible ? <Eye size={12} /> : <EyeOff size={11} />}
                    </button>

                    {/* Layer Lock */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                      title={layer.locked ? "Unlock layer adjustments" : "Lock layer parameters"}
                      className={`p-1 rounded cursor-pointer ${layer.locked ? 'text-amber-500 bg-amber-500/10' : 'text-brand-muted hover:text-white'}`}
                    >
                      {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
                    </button>

                    {/* Duplicate Layer */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicateLayer(layer.id); }}
                      title="Duplicate Layer"
                      className="p-1 hover:text-brand-accent rounded text-brand-muted cursor-pointer"
                    >
                      <Copy size={11} />
                    </button>

                    {/* Delete Layer */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                      title="Delete Layer"
                      className="p-1 hover:text-brand-red rounded text-brand-muted cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
