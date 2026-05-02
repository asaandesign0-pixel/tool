/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useProject } from '../../store/ProjectStore.tsx';
import { interpolateProperty } from '../../engine/interpolation.ts';
import { Layer } from '../../types.ts';

/**
 * Renderer component manages the canvas and synchronization of video playback for preview.
 */
export const Renderer: React.FC = () => {
  const { state } = useProject();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElementsRef = useRef<Record<string, HTMLVideoElement>>({});
  
  // Track previous time to update video seek positions
  const prevTimeRef = useRef(state.currentTime);

  // Sync video elements with layers
  useEffect(() => {
    state.layers.forEach(layer => {
      if (layer.type === 'video' && layer.src && !videoElementsRef.current[layer.id]) {
        const video = document.createElement('video');
        video.src = layer.src;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.preload = 'auto';
        videoElementsRef.current[layer.id] = video;
      }
    });

    // Cleanup unused videos
    const layerIds = new Set(state.layers.map(l => l.id));
    Object.keys(videoElementsRef.current).forEach(id => {
      if (!layerIds.has(id)) {
        delete videoElementsRef.current[id];
      }
    });
  }, [state.layers]);

  // Handle Playback sync
  useEffect(() => {
    const videos = Object.values(videoElementsRef.current);
    if (state.isPlaying) {
      videos.forEach(v => {
        // Only play if within duration is handled by seek sync usually
        // but for smooth preview we might want them playing
      });
    } else {
      videos.forEach(v => v.pause());
    }
  }, [state.isPlaying]);

  // Main Render Loop
  useEffect(() => {
    let animationId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = state.project;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Sort layers by zIndex
      const sortedLayers = [...state.layers].sort((a, b) => a.zIndex - b.zIndex);

      sortedLayers.forEach(layer => {
        const localTime = state.currentTime - layer.startTime;
        
        // Only render if active at current time
        if (!layer.visible || localTime < 0 || localTime > layer.duration) return;

        // Interpolate properties
        const pos = interpolateProperty(layer.position.keyframes, state.currentTime, layer.position.value);
        const scale = interpolateProperty(layer.scale.keyframes, state.currentTime, layer.scale.value);
        const rotation = interpolateProperty(layer.rotation.keyframes, state.currentTime, layer.rotation.value);
        const opacity = interpolateProperty(layer.opacity.keyframes, state.currentTime, layer.opacity.value);
        const blur = interpolateProperty(layer.blur.keyframes, state.currentTime, layer.blur.value);

        ctx.save();
        
        // Filter effects
        ctx.filter = `blur(${blur}px) brightness(${interpolateProperty(layer.brightness.keyframes, state.currentTime, layer.brightness.value)}%) contrast(${interpolateProperty(layer.contrast.keyframes, state.currentTime, layer.contrast.value)}%)`;
        ctx.globalAlpha = opacity;
        
        ctx.translate(pos.x, pos.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        if (layer.type === 'video' && layer.src) {
          const video = videoElementsRef.current[layer.id];
          if (video && video.readyState >= 2) {
            // Sync video seek position if time changed significantly or playing
            if (Math.abs(video.currentTime - localTime) > 0.1) {
              video.currentTime = localTime;
            }
            ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
          }
        } else if (layer.type === 'text') {
          ctx.font = `${layer.fontSize || 100}px Inter, sans-serif`;
          ctx.fillStyle = layer.color || '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(layer.text || '', 0, 0);
        } else if (layer.type === 'solid') {
           ctx.fillStyle = layer.color || '#ff0000';
           ctx.fillRect(-250, -250, 500, 500); // Sample fixed size solid
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [state.currentTime, state.layers, state.project]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black p-8 overflow-hidden rounded-lg">
      <div 
        className="shadow-2xl ring-1 ring-white/10 bg-[#1a1a1a] relative overflow-hidden"
        style={{ 
          aspectRatio: `${state.project.width}/${state.project.height}`,
          maxHeight: '100%',
          maxWidth: '100%'
        }}
      >
        <canvas
          ref={canvasRef}
          width={state.project.width}
          height={state.project.height}
          className="w-full h-full object-contain"
        />

        {/* Professional Overlays */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           {/* Thirds Grid */}
           <div className="absolute inset-0 border-x border-white/20 flex justify-between">
              <div className="w-[1px] h-full bg-white/20 ml-[33.33%]" />
              <div className="w-[1px] h-full bg-white/20 mr-[33.33%]" />
           </div>
           <div className="absolute inset-0 border-y border-white/20 flex flex-col justify-between">
              <div className="h-[1px] w-full bg-white/20 mt-[33.33%]" />
              <div className="h-[1px] w-full bg-white/20 mb-[33.33%]" />
           </div>
           {/* Center Crosshair */}
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white/40 flex items-center justify-center">
              <div className="w-full h-[0.5px] bg-white" />
              <div className="h-full w-[0.5px] bg-white absolute" />
           </div>
           {/* Safe Zones */}
           <div className="absolute inset-[10%] border border-dashed border-white/10 rounded" />
        </div>
        
        {/* Overlay for time indication */}
        <div className="absolute top-4 left-4 text-[10px] font-mono text-white/40 uppercase tracking-tight pointer-events-none">
           {state.project.width} x {state.project.height} | {state.currentTime.toFixed(2)}s
        </div>
      </div>
    </div>
  );
};
