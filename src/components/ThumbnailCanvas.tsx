import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';
import { CanvasMode, LayerItem, GamingPreset, TextEffect } from '../types';

interface ThumbnailCanvasProps {
  mode: CanvasMode;
  onActiveObjectChange: (properties: any) => void;
  onLayersUpdate: (layers: LayerItem[]) => void;
}

export interface ThumbnailCanvasRef {
  addText: (text?: string, presetStyle?: Partial<fabric.IText>) => void;
  addEmoji: (emoji: string) => void;
  updateActiveTextProperty: (property: string, value: any) => void;
  applyTextPreset: (preset: GamingPreset) => void;
  applyTextEffectPreset: (effect: TextEffect) => void;
  uploadBackground: (url: string | File) => Promise<void>;
  updateBackgroundFilter: (filterName: 'outline' | 'blur' | 'brightness' | 'contrast' | 'overlayOpacity' | 'overlayColor' | 'zoom' | 'offsetX' | 'offsetY', value: any) => void;
  removeBackground: () => void;
  setBgEditMode: (enabled: boolean) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  toggleLayerVisibility: (id: string, visible?: boolean) => void;
  toggleLayerLock: (id: string, locked?: boolean) => void;
  renameLayer: (id: string, name: string) => void;
  changeLayerIndex: (id: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  exportImage: (format: 'png' | 'jpeg' | 'webp', qualityLevel: 'low' | 'medium' | 'high' | 'ultra') => string;
  selectLayer: (id: string) => void;
}

export const ThumbnailCanvas = forwardRef<ThumbnailCanvasRef, ThumbnailCanvasProps>(
  ({ mode, onActiveObjectChange, onLayersUpdate }, ref) => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

    // References to special layers
    const bgImageRef = useRef<fabric.Image | null>(null);
    const bgOverlayRef = useRef<fabric.Rect | null>(null);

    // Tracking properties
    const [bgFilters, setBgFilters] = useState({
      blur: 0,
      brightness: 1,
      contrast: 1,
      overlayColor: '#000000',
      overlayOpacity: 0.2,
      zoom: 1,
      offsetX: 0,
      offsetY: 0
    });

    const [isBgEditActive, setIsBgEditActive] = useState(false);

    // Grid snapping properties
    const SNAP_THRESHOLD = 12;
    const [snapGuides, setSnapGuides] = useState<{
      vertical: boolean;
      verticalX: number;
      horizontal: boolean;
      horizontalY: number;
    }>({
      vertical: false,
      verticalX: 0,
      horizontal: false,
      horizontalY: 0
    });

    // 1. Initialize canvas and handlers
    useEffect(() => {
      if (!canvasRef.current || !canvasContainerRef.current) return;

      const width = mode === 'thumbnail' ? 1280 : 1080;
      const height = mode === 'thumbnail' ? 720 : 1920;

      // Base dimensions for styling, container uses aspect ratio scaling
      const fCanvas = new fabric.Canvas(canvasRef.current, {
        width: width,
        height: height,
        backgroundColor: '#0c0d12',
        preserveObjectStacking: true,
      });

      // Override default edit properties
      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerColor = '#2563eb'; // Blue handles
      fabric.Object.prototype.cornerStrokeColor = '#ffffff';
      fabric.Object.prototype.cornerSize = 12;
      fabric.Object.prototype.cornerStyle = 'circle';
      fabric.Object.prototype.borderDashArray = [4, 4];
      fabric.Object.prototype.borderColor = '#2563eb';
      fabric.Object.prototype.padding = 4;

      // Create a persistent background overlay rectangle (initially fully transparent)
      const overlay = new fabric.Rect({
        left: 0,
        top: 0,
        width: width,
        height: height,
        fill: '#000000',
        opacity: 0.2,
        selectable: false,
        evented: false,
        name: 'Background Overlay',
        excludeFromExport: false
      });
      // Set custom property to exclude from generic layer lists
      (overlay as any).isSystem = true;
      (overlay as any).customId = 'system-overlay';
      fCanvas.add(overlay);
      bgOverlayRef.current = overlay;

      setFabricCanvas(fCanvas);

      // Clean up on component unmount
      return () => {
        fCanvas.dispose();
      };
    }, []);

    // 2. Adjust Canvas Dimensions when switching Mode
    useEffect(() => {
      if (!fabricCanvas) return;
      const width = mode === 'thumbnail' ? 1280 : 1080;
      const height = mode === 'thumbnail' ? 720 : 1920;

      fabricCanvas.setDimensions({ width, height });

      // Update Overlay dimensions
      if (bgOverlayRef.current) {
        bgOverlayRef.current.set({ width, height });
      }

      // Update background image viewport adaptation
      if (bgImageRef.current) {
        fitBgImage(bgImageRef.current, width, height);
      }

      fabricCanvas.renderAll();
      syncLayers(fabricCanvas);
    }, [mode, fabricCanvas]);

    // 3. Set up listeners for fabric canvas events
    useEffect(() => {
      if (!fabricCanvas) return;

      const handleSelection = () => {
        const activeObj = fabricCanvas.getActiveObject();
        if (!activeObj) {
          onActiveObjectChange(null);
          return;
        }

        // Get rich styles
        const props = {
          id: (activeObj as any).customId,
          type: activeObj.type,
          text: (activeObj as any).text || '',
          fontFamily: (activeObj as any).fontFamily || 'Inter',
          fontSize: (activeObj as any).fontSize || 40,
          fontWeight: (activeObj as any).fontWeight || 'normal',
          fill: (activeObj as any).fill || '#ffffff',
          stroke: (activeObj as any).stroke || null,
          strokeWidth: (activeObj as any).strokeWidth || 0,
          shadow: (activeObj as any).shadow || null,
          shadowColor: activeObj.shadow ? (activeObj.shadow as any).color : '#000000',
          shadowBlur: activeObj.shadow ? (activeObj.shadow as any).blur : 0,
          shadowOffsetX: activeObj.shadow ? (activeObj.shadow as any).offsetX : 0,
          shadowOffsetY: activeObj.shadow ? (activeObj.shadow as any).offsetY : 0,
          opacity: activeObj.opacity || 1,
          charSpacing: (activeObj as any).charSpacing || 0,
          lineHeight: (activeObj as any).lineHeight || 1.1,
          textAlign: (activeObj as any).textAlign || 'left',
          skewX: activeObj.skewX || 0,
          angle: activeObj.angle || 0,
          locked: activeObj.lockMovementX || false,
        };
        onActiveObjectChange(props);
        syncLayers(fabricCanvas);
      };

      const handleObjectMoved = (e: fabric.IEvent) => {
        setSnapGuides({ vertical: false, verticalX: 0, horizontal: false, horizontalY: 0 });
        syncLayers(fabricCanvas);
      };

      const handleObjectMoving = (e: fabric.IEvent) => {
        const obj = e.target;
        if (!obj || obj === bgImageRef.current || (obj as any).isSystem) return;

        const canvasWidth = fabricCanvas.width || 1280;
        const canvasHeight = fabricCanvas.height || 720;
        const centerLeft = canvasWidth / 2;
        const centerTop = canvasHeight / 2;

        const objCenter = obj.getCenterPoint();
        let showVGuide = false;
        let showHGuide = false;
        let newLeft = obj.left;
        let newTop = obj.top;

        // Alignment Checks (Center vertical snapping)
        if (Math.abs(objCenter.x - centerLeft) < SNAP_THRESHOLD) {
          obj.setPositionByOrigin(new fabric.Point(centerLeft, objCenter.y), 'center', 'center');
          showVGuide = true;
          newLeft = obj.left;
        }

        // Center horizontal snapping
        if (Math.abs(objCenter.y - centerTop) < SNAP_THRESHOLD) {
          obj.setPositionByOrigin(new fabric.Point(objCenter.x, centerTop), 'center', 'center');
          showHGuide = true;
          newTop = obj.top;
        }

        // Edge checks (left, right, top, bottom)
        const boundRect = obj.getBoundingRect();
        
        // Snap to left edge
        if (Math.abs(boundRect.left) < SNAP_THRESHOLD) {
          obj.set({ left: obj.left! - boundRect.left });
          newLeft = obj.left;
        }
        // Snap to right edge
        if (Math.abs(boundRect.left + boundRect.width - canvasWidth) < SNAP_THRESHOLD) {
          obj.set({ left: obj.left! + (canvasWidth - (boundRect.left + boundRect.width)) });
          newLeft = obj.left;
        }
        // Snap to top edge
        if (Math.abs(boundRect.top) < SNAP_THRESHOLD) {
          obj.set({ top: obj.top! - boundRect.top });
          newTop = obj.top;
        }
        // Snap to bottom edge
        if (Math.abs(boundRect.top + boundRect.height - canvasHeight) < SNAP_THRESHOLD) {
          obj.set({ top: obj.top! + (canvasHeight - (boundRect.top + boundRect.height)) });
          newTop = obj.top;
        }

        setSnapGuides({
          vertical: showVGuide,
          verticalX: centerLeft,
          horizontal: showHGuide,
          horizontalY: centerTop
        });
      };

      // Custom guides drawing on render
      fabricCanvas.on('after:render', () => {
        const ctx = fabricCanvas.getContext();
        // Draw snap guidelines
        ctx.save();
        
        if (snapGuides.vertical) {
          ctx.strokeStyle = '#f43f5e'; // Rose-500
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(snapGuides.verticalX, 0);
          ctx.lineTo(snapGuides.verticalX, fabricCanvas.height || 720);
          ctx.stroke();
        }

        if (snapGuides.horizontal) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(0, snapGuides.horizontalY);
          ctx.lineTo(fabricCanvas.width || 1280, snapGuides.horizontalY);
          ctx.stroke();
        }

        ctx.restore();
      });

      // Register listener callbacks
      fabricCanvas.on('selection:created', handleSelection);
      fabricCanvas.on('selection:updated', handleSelection);
      fabricCanvas.on('selection:cleared', handleSelection);
      fabricCanvas.on('object:modified', handleSelection);
      fabricCanvas.on('object:added', () => syncLayers(fabricCanvas));
      fabricCanvas.on('object:removed', () => syncLayers(fabricCanvas));
      fabricCanvas.on('object:moving', handleObjectMoving);
      fabricCanvas.on('object:moe', handleObjectMoved); // Custom end
      fabricCanvas.on('mouse:up', () => {
        setSnapGuides({ vertical: false, verticalX: 0, horizontal: false, horizontalY: 0 });
        fabricCanvas.renderAll();
      });

      // Synchronize initial layout
      syncLayers(fabricCanvas);

      return () => {
        fabricCanvas.off('selection:created', handleSelection);
        fabricCanvas.off('selection:updated', handleSelection);
        fabricCanvas.off('selection:cleared', handleSelection);
        fabricCanvas.off('object:modified', handleSelection);
        fabricCanvas.off('object:added');
        fabricCanvas.off('object:removed');
        fabricCanvas.off('object:moving', handleObjectMoving);
      };
    }, [fabricCanvas, snapGuides]);

    // 4. Synchronize all non-system objects to state layer listing
    const syncLayers = (canvas: fabric.Canvas) => {
      const items: LayerItem[] = [];
      const objects = canvas.getObjects();
      const activeObj = canvas.getActiveObject();

      // Reverse order lists so the topmost layers are shown first (human/canva layer listing)
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if ((obj as any).isSystem) continue; // Skip overlay logic in lists

        let layerType: 'text' | 'image' | 'emoji' | 'rect' | 'unknown' = 'unknown';
        if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
          // Check if custom ID indicates it's an emoji layer
          const customId = (obj as any).customId || '';
          const layerTypeStr = customId.startsWith('emo_') ? 'emoji' : 'text';
          layerType = layerTypeStr as 'emoji' | 'text';
        } else if (obj === bgImageRef.current) {
          layerType = 'image';
        } else if (obj.type === 'rect') {
          layerType = 'rect';
        }

        items.push({
          id: (obj as any).customId || 'unknown',
          name: (obj as any).customName || (obj.type === 'textbox' ? `Text: "${(obj as any).text.substring(0, 15)}..."` : obj.type === 'image' ? 'Background Image' : 'Layer Element'),
          type: layerType,
          visible: obj.visible !== false,
          locked: obj.lockMovementX === true,
          active: activeObj === obj
        });
      }

      onLayersUpdate(items);
    };

    // Helper: auto-center and stretch/scale the background size to fill format perfectly (Cover fit)
    const fitBgImage = (img: fabric.Image, canvasWidth: number, canvasHeight: number) => {
      const imgWidth = img.width || 1;
      const imgHeight = img.height || 1;

      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const coverScale = Math.max(scaleX, scaleY);

      // Save initial optimal fit factors to let custom zoom scale relative to fit
      (img as any).baseScale = coverScale;

      const currentZoom = bgFilters.zoom;
      
      img.set({
        scaleX: coverScale * currentZoom,
        scaleY: coverScale * currentZoom,
        left: canvasWidth / 2 + bgFilters.offsetX,
        top: canvasHeight / 2 + bgFilters.offsetY,
        originX: 'center',
        originY: 'center',
      });
      img.setCoords();
    };

    // 5. Expose Functions via ImperativeHandle to parents
    useImperativeHandle(ref, () => ({
      // Add text block with default gaming styling or specific partial overlays
      addText: (text = 'GAMING TEXT', presetStyle = {}) => {
        if (!fabricCanvas) return;

        const canvasWidth = fabricCanvas.width || 1280;
        const canvasHeight = fabricCanvas.height || 720;

        const customId = 'txt_' + Math.random().toString(36).substring(2, 9);
        const textObj = new fabric.Textbox(text, {
          left: canvasWidth / 2,
          top: canvasHeight / 3 + (Math.random() * 80 - 40),
          originX: 'center',
          originY: 'center',
          fontSize: 70,
          fontFamily: 'Luckiest Guy',
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 8,
          textAlign: 'center',
          width: 600,
          cornerSize: 10,
          transparentCorners: false,
          paintFirst: 'stroke', // Outlines behind characters
          ...presetStyle,
        });

        // Set rich text box outlines & shadow safely
        if (!(presetStyle as any)?.shadow) {
          textObj.set({
            shadow: new fabric.Shadow({
              color: '#000000',
              blur: 8,
              offsetX: 4,
              offsetY: 6,
            })
          });
        }

        // Custom identifying parameters
        (textObj as any).customId = customId;
        (textObj as any).customName = `Text: "${text.substring(0, 10)}"`;

        fabricCanvas.add(textObj);
        fabricCanvas.setActiveObject(textObj);
        fabricCanvas.renderAll();
        syncLayers(fabricCanvas);
      },

      // Add floating emoji
      addEmoji: (emoji: string) => {
        if (!fabricCanvas) return;

        const canvasWidth = fabricCanvas.width || 1280;
        const canvasHeight = fabricCanvas.height || 720;
        const customId = 'emo_' + Math.random().toString(36).substring(2, 9);

        const emojiObj = new fabric.Textbox(emoji, {
          left: canvasWidth / 2 + (Math.random() * 120 - 60),
          top: canvasHeight / 2 + (Math.random() * 120 - 60),
          originX: 'center',
          originY: 'center',
          fontSize: 80,
          fontFamily: 'Segoe UI Emoji', // Fallback modern emoji platform rendering
          textAlign: 'center',
          width: 120,
          lockScalingFlip: true,
        });

        (emojiObj as any).customId = customId;
        (emojiObj as any).customName = `Emoji: ${emoji}`;

        fabricCanvas.add(emojiObj);
        fabricCanvas.setActiveObject(emojiObj);
        fabricCanvas.renderAll();
        syncLayers(fabricCanvas);
      },

      // Update specific parameter on designated active text
      updateActiveTextProperty: (property: string, value: any) => {
        if (!fabricCanvas) return;
        const activeObj = fabricCanvas.getActiveObject();
        if (!activeObj || (activeObj as any).isSystem) return;

        if (property === 'fill' && value.type === 'gradient') {
          // Setting text gradient colors using Fabric v5 format
          const gradient = new fabric.Gradient({
            type: 'linear',
            coords: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: activeObj.height || 100, // Top vertical to bottom
            },
            colorStops: [
              { offset: 0, color: value.startColor },
              { offset: 1, color: value.endColor }
            ]
          });
          activeObj.set('fill', gradient);
        } else if (property === 'shadowColor' || property === 'shadowBlur' || property === 'shadowOffsetX' || property === 'shadowOffsetY') {
          // Shadow properties adjustment
          const currentShadow = activeObj.shadow as fabric.Shadow || new fabric.Shadow({ color: '#000000', blur: 0, offsetX: 0, offsetY: 0 });
          const parts = {
            color: property === 'shadowColor' ? value : currentShadow.color,
            blur: property === 'shadowBlur' ? parseFloat(value) || 0 : currentShadow.blur,
            offsetX: property === 'shadowOffsetX' ? parseFloat(value) || 0 : currentShadow.offsetX,
            offsetY: property === 'shadowOffsetY' ? parseFloat(value) || 0 : currentShadow.offsetY,
          };
          activeObj.set({
            shadow: new fabric.Shadow(parts)
          });
        } else if (property === 'textCase') {
          // Uppercase vs lowercase transforms
          const textObj = activeObj as fabric.Textbox;
          const originalText = (textObj as any).originalText || textObj.text || '';
          if (!(textObj as any).originalText) {
            (textObj as any).originalText = originalText;
          }

          if (value === 'uppercase') {
            textObj.set({ text: originalText.toUpperCase() });
          } else if (value === 'lowercase') {
            textObj.set({ text: originalText.toLowerCase() });
          } else {
            textObj.set({ text: originalText });
          }
        } else if (property === 'strokeWidth' || property === 'charSpacing' || property === 'lineHeight' || property === 'fontSize' || property === 'opacity' || property === 'skewX') {
          // Float casts
          activeObj.set(property as any, parseFloat(value));
        } else {
          // Direct styling parameters (fontFamily, fill, align, stroke, etc.)
          activeObj.set(property as any, value);
        }

        // Custom name override if actual text changes
        if (property === 'text') {
          (activeObj as any).customName = `Text: "${value.substring(0, 15)}"`;
        }

        fabricCanvas.renderAll();
        syncLayers(fabricCanvas);
      },

      // Apply complete Gaming Preset styling
      applyTextPreset: (preset: GamingPreset) => {
        if (!fabricCanvas) return;
        const activeObj = fabricCanvas.getActiveObject() as fabric.Textbox;
        if (!activeObj || !['textbox', 'i-text', 'text'].includes(activeObj.type || '')) return;

        activeObj.set({
          fontFamily: preset.fontFamily,
          stroke: preset.stroke,
          strokeWidth: preset.strokeWidth,
          lineHeight: preset.lineHeight || 1.1,
          charSpacing: preset.charSpacing || 0,
          paintFirst: 'stroke',
          shadow: new fabric.Shadow({
            color: preset.shadowColor,
            blur: preset.shadowBlur,
            offsetX: preset.shadowOffsetX,
            offsetY: preset.shadowOffsetY,
          })
        });

        // Set gradient or solid fill color
        if (preset.gradientColor) {
          const gradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: 0, y2: activeObj.height || 100 },
            colorStops: [
              { offset: 0, color: preset.fill },
              { offset: 1, color: preset.gradientColor }
            ]
          });
          activeObj.set('fill', gradient);
        } else {
          activeObj.set('fill', preset.fill);
        }

        fabricCanvas.renderAll();
        syncLayers(fabricCanvas);
      },

      // Apply quick text effect presets
      applyTextEffectPreset: (effect: TextEffect) => {
        if (!fabricCanvas) return;
        const activeObj = fabricCanvas.getActiveObject();
        if (!activeObj || !['textbox', 'i-text', 'text'].includes(activeObj.type || '')) return;

        activeObj.set({
          fontFamily: effect.fontFamily,
          stroke: effect.stroke,
          strokeWidth: effect.strokeWidth,
          paintFirst: 'stroke',
          shadow: new fabric.Shadow({
            color: effect.shadowColor,
            blur: effect.shadowBlur,
            offsetX: effect.shadowOffsetX,
            offsetY: effect.shadowOffsetY,
          })
        });

        // Set gradient or fill
        if (effect.gradient) {
          const gradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: 0, y2: activeObj.height || 80 },
            colorStops: [
              { offset: 0, color: effect.fill },
              { offset: 1, color: effect.gradient }
            ]
          });
          activeObj.set('fill', gradient);
        } else {
          activeObj.set('fill', effect.fill);
        }

        fabricCanvas.renderAll();
        syncLayers(fabricCanvas);
      },

      // Dynamic Background uploader (supports URL string or raw File blob)
      uploadBackground: async (source: string | File) => {
        if (!fabricCanvas) return;

        const loadBgFromSrc = (src: string) => {
          fabric.Image.fromURL(src, (img) => {
            // Remove previous background image if existing
            if (bgImageRef.current) {
              fabricCanvas.remove(bgImageRef.current);
            }

            img.set({
              selectable: false,
              evented: false,
              hoverCursor: 'default',
              name: 'Background Image',
            });

            // Assign standard identifying properties
            (img as any).customId = 'bg-image';
            (img as any).customName = 'Background Image';

            // Insert background element strictly at the bottom (index 0)
            fabricCanvas.add(img);
            img.sendToBack();

            bgImageRef.current = img;

            // Retouch overlay layer index so overlay matches over the image
            if (bgOverlayRef.current) {
              bgOverlayRef.current.bringToFront();
              // Text layers stay overhead
              const objects = fabricCanvas.getObjects();
              objects.forEach(obj => {
                if (!(obj as any).isSystem && obj !== img) {
                  obj.bringToFront();
                }
              });
            }

            // Fit scaling viewport bounds
            fitBgImage(img, fabricCanvas.width || 1280, fabricCanvas.height || 720);
            applyBackgroundFilters(img);

            fabricCanvas.renderAll();
            syncLayers(fabricCanvas);
          }, { crossOrigin: 'anonymous' });
        };

        if (typeof source === 'string') {
          loadBgFromSrc(source);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              loadBgFromSrc(e.target.result as string);
            }
          };
          reader.readAsDataURL(source);
        }
      },

      // Remove background image completely
      removeBackground: () => {
        if (!fabricCanvas) return;
        if (bgImageRef.current) {
          fabricCanvas.remove(bgImageRef.current);
          bgImageRef.current = null;
          fabricCanvas.renderAll();
          syncLayers(fabricCanvas);
        }
      },

      // Enter/exit "Zoom & Position Background" adjust mode
      setBgEditMode: (enabled: boolean) => {
        if (!fabricCanvas || !bgImageRef.current) return;
        setIsBgEditActive(enabled);

        const img = bgImageRef.current;
        if (enabled) {
          // Unlock image from canvas backing, allow standard handles controls
          img.set({
            selectable: true,
            evented: true,
            lockRotation: true,
            hoverCursor: 'move',
          });
          fabricCanvas.setActiveObject(img);
        } else {
          // Lock visual assets inside canvas backings
          img.set({
            selectable: false,
            evented: false,
            hoverCursor: 'default',
          });
          fabricCanvas.discardActiveObject();
        }
        fabricCanvas.renderAll();
      },

      // Dynamic adjustments of Background Properties & Visuals
      updateBackgroundFilter: (filterName: string, value: any) => {
        if (!fabricCanvas) return;

        const updatedFilters = { ...bgFilters, [filterName]: value };
        setBgFilters(updatedFilters);

        // Adjust solid Overlay controls directly
        if (bgOverlayRef.current) {
          if (filterName === 'overlayOpacity') {
            bgOverlayRef.current.set('opacity', parseFloat(value));
          }
          if (filterName === 'overlayColor') {
            bgOverlayRef.current.set('fill', value);
          }
        }

        // Apply Image Filters / Viewports adjustments
        const img = bgImageRef.current;
        if (img) {
          if (filterName === 'zoom' || filterName === 'offsetX' || filterName === 'offsetY') {
            // Recalculate covered scale relative to zoom limits
            const canvasWidth = fabricCanvas.width || 1280;
            const canvasHeight = fabricCanvas.height || 720;
            const baseScale = (img as any).baseScale || 1;

            img.set({
              scaleX: baseScale * updatedFilters.zoom,
              scaleY: baseScale * updatedFilters.zoom,
              left: canvasWidth / 2 + updatedFilters.offsetX,
              top: canvasHeight / 2 + updatedFilters.offsetY,
            });
            img.setCoords();
          } else {
            // Apply image visual filters (Blur, Contrast, Brightness)
            applyBackgroundFilters(img, updatedFilters);
          }
        }

        fabricCanvas.renderAll();
      },

      deleteLayer: (id: string) => {
        if (!fabricCanvas) return;
        const obj = fabricCanvas.getObjects().find(o => (o as any).customId === id);
        if (obj && !(obj as any).isSystem) {
          fabricCanvas.remove(obj);
          fabricCanvas.renderAll();
          syncLayers(fabricCanvas);
        }
      },

      duplicateLayer: (id: string) => {
        if (!fabricCanvas) return;
        const obj = fabricCanvas.getObjects().find(o => (o as any).customId === id);
        if (obj && !(obj as any).isSystem) {
          // Clone details
          obj.clone((cloned: fabric.Object) => {
            cloned.set({
              left: (obj.left || 0) + 40,
              top: (obj.top || 0) + 40,
            });
            (cloned as any).customId = 'layer_' + Math.random().toString(36).substring(2, 9);
            (cloned as any).customName = `${(obj as any).customName} (Copy)`;
            fabricCanvas.add(cloned);
            fabricCanvas.setActiveObject(cloned);
            fabricCanvas.renderAll();
            syncLayers(fabricCanvas);
          });
        }
      },

      toggleLayerVisibility: (id: string, visible?: boolean) => {
        if (!fabricCanvas) return;
        const obj = fabricCanvas.getObjects().find(o => (o as any).customId === id);
        if (obj) {
          const nextVisible = visible !== undefined ? visible : !obj.visible;
          obj.set('visible', nextVisible);
          if (!nextVisible && fabricCanvas.getActiveObject() === obj) {
            fabricCanvas.discardActiveObject();
          }
          fabricCanvas.renderAll();
          syncLayers(fabricCanvas);
        }
      },

      toggleLayerLock: (id: string, locked?: boolean) => {
        if (!fabricCanvas) return;
        const obj = fabricCanvas.getObjects().find(o => (o as any).customId === id);
        if (obj) {
          const nextLocked = locked !== undefined ? locked : !obj.lockMovementX;
          obj.set({
            lockMovementX: nextLocked,
            lockMovementY: nextLocked,
            lockScalingX: nextLocked,
            lockScalingY: nextLocked,
            lockRotation: nextLocked,
            hasControls: !nextLocked
          });
          fabricCanvas.renderAll();
          syncLayers(fabricCanvas);
        }
      },

      renameLayer: (id: string, name: string) => {
        if (!fabricCanvas) return;
        const obj = fabricCanvas.getObjects().find(o => (o as any).customId === id);
        if (obj) {
          (obj as any).customName = name;
          fabricCanvas.renderAll();
          syncLayers(fabricCanvas);
        }
      },

      changeLayerIndex: (id: string, direction: 'forward' | 'backward' | 'front' | 'back') => {
        if (!fabricCanvas) return;
        const obj = fabricCanvas.getObjects().find(o => (o as any).customId === id);
        if (!obj || (obj as any).isSystem) return;

        if (direction === 'forward') {
          fabricCanvas.bringForward(obj);
        } else if (direction === 'backward') {
          // Do not send below background layer
          const index = fabricCanvas.getObjects().indexOf(obj);
          if (index > 1) { // 0 is bg-image (if exists), 1 is overlay
            fabricCanvas.sendBackwards(obj);
          }
        } else if (direction === 'front') {
          fabricCanvas.bringToFront(obj);
        } else if (direction === 'back') {
          // Place immediately above system overlay (index 1)
          const objects = fabricCanvas.getObjects();
          let targetIdx = 1;
          const currentIdx = objects.indexOf(obj);
          
          if (currentIdx > targetIdx) {
            for (let i = currentIdx; i > targetIdx + 1; i--) {
              fabricCanvas.sendBackwards(obj);
            }
          }
        }

        fabricCanvas.renderAll();
        syncLayers(fabricCanvas);
      },

      selectLayer: (id: string) => {
        if (!fabricCanvas) return;
        const obj = fabricCanvas.getObjects().find(o => (o as any).customId === id);
        if (obj && obj.visible && !obj.lockMovementX) {
          fabricCanvas.setActiveObject(obj);
          fabricCanvas.renderAll();
        }
      },

      exportImage: (format = 'png', qualityLevel = 'high') => {
        if (!fabricCanvas) return '';

        // Differentiate scaling parameters based on quality configurations
        let scaleFactor = 1;
        if (qualityLevel === 'low') scaleFactor = 0.5;
        else if (qualityLevel === 'medium') scaleFactor = 1;
        else if (qualityLevel === 'high') scaleFactor = 2; // High-res 2x
        else if (qualityLevel === 'ultra') scaleFactor = 3; // Ultra crystallize 3x

        // Clear active bounding box highlights for the export frames
        const currentActive = fabricCanvas.getActiveObject();
        if (currentActive) {
          fabricCanvas.discardActiveObject();
          fabricCanvas.renderAll();
        }

        const dataUrl = fabricCanvas.toDataURL({
          format: format === 'jpg' ? 'jpeg' : format,
          quality: format === 'png' ? undefined : 0.92,
          multiplier: scaleFactor,
        });

        // Restore user active selection safely
        if (currentActive) {
          fabricCanvas.setActiveObject(currentActive);
          fabricCanvas.renderAll();
        }

        return dataUrl;
      }
    }));

    // Helper: apply and mount standard fabric image filter sets (Blur, Contrast, Brightness)
    const applyBackgroundFilters = (img: fabric.Image, filters = bgFilters) => {
      img.filters = [];

      // Blur Filter
      if (filters.blur > 0) {
        // Safe blur mapping (Fabric v5 Blur accepts radius value)
        img.filters.push(new fabric.Image.filters.Blur({
          blur: filters.blur / 20 // scale down to typical fabric levels
        }));
      }

      // Brightness Filter
      if (filters.brightness !== 1) {
        // Brightness accepts scale factor differences (range -1 to 1)
        img.filters.push(new fabric.Image.filters.Brightness({
          brightness: filters.brightness - 1
        }));
      }

      // Contrast Filter
      if (filters.contrast !== 1) {
        // Contrast accepts scale differences (range -1 to 1)
        img.filters.push(new fabric.Image.filters.Contrast({
          contrast: filters.contrast - 1
        }));
      }

      img.applyFilters();
    };

    return (
      <div 
        ref={canvasContainerRef}
        id="canvas-studio-container"
        className="relative flex items-center justify-center p-4 w-full h-full min-h-[400px] overflow-hidden"
      >
        <div 
          className="shadow-2xl border border-neutral-800 rounded bg-neutral-950 overflow-hidden relative"
          style={{
            width: mode === 'thumbnail' ? '1280px' : '1080px',
            height: mode === 'thumbnail' ? '720px' : '1920px',
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: mode === 'thumbnail' ? '16/9' : '9/16',
          }}
        >
          {/* Backing standard HTML Canvas */}
          <canvas id="studio-main-canvas" ref={canvasRef} className="max-w-full max-h-full" />
        </div>
      </div>
    );
  }
);

ThumbnailCanvas.displayName = 'ThumbnailCanvas';
