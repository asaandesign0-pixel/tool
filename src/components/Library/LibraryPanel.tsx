/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Video, Type, Square, Layout, Sparkles, Plus } from 'lucide-react';
import { useProject } from '../../store/ProjectStore.tsx';
import { createLayer } from '../../utils/layerUtils.ts';

const SAMPLE_VIDEOS = [
  { id: 'v1', name: 'Nebula Space', url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-4001-large.mp4', duration: 10 },
  { id: 'v2', name: 'Ocean Waves', url: 'https://assets.mixkit.co/videos/preview/mixkit-crashing-waves-in-the-ocean-1563-large.mp4', duration: 15 },
  { id: 'v3', name: 'Aerial City', url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-metropolis-at-night-11-large.mp4', duration: 12 },
];

export const LibraryPanel: React.FC = () => {
  const { state, dispatch } = useProject();

  const addTextLayer = () => {
    const layer = createLayer('text', 'New Text', {
      text: 'TEXT OVERLAY',
      fontSize: 100,
      color: '#ffffff',
      duration: 5,
      startTime: state.currentTime,
    });
    dispatch({ type: 'ADD_LAYER', layer });
  };

  const addSolidLayer = () => {
    const layer = createLayer('solid', 'Solid Layer', {
      color: '#ff4e00',
      duration: 5,
      startTime: state.currentTime,
    });
    dispatch({ type: 'ADD_LAYER', layer });
  };

  const addVideoLayer = (video: typeof SAMPLE_VIDEOS[0]) => {
    const layer = createLayer('video', video.name, {
      src: video.url,
      duration: video.duration,
      startTime: state.currentTime,
    });
    dispatch({ type: 'ADD_LAYER', layer });
  };

  const applyPreset = (presetName: string) => {
    if (!state.selectedLayerId) return;
    const layerId = state.selectedLayerId;
    const time = state.currentTime;

    switch (presetName) {
      case 'fade-in':
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'opacity', time: time, value: 0, easing: 'ease-out' });
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'opacity', time: time + 0.8, value: 1, easing: 'ease-out' });
        break;
      case 'snap-zoom':
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'scale', time: time, value: 1, easing: 'ease-out' });
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'scale', time: time + 0.2, value: 1.4, easing: 'ease-out' });
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'scale', time: time + 0.5, value: 1.2, easing: 'ease-in-out' });
        break;
      case 'float-y':
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'position', time: time, value: { x: 960, y: 540 }, easing: 'ease-in-out' });
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'position', time: time + 1.5, value: { x: 960, y: 480 }, easing: 'ease-in-out' });
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'position', time: time + 3.0, value: { x: 960, y: 540 }, easing: 'ease-in-out' });
        break;
      case 'cam-shake':
        for (let i = 0; i < 15; i++) {
          const t = time + (i * 0.04);
          const intensity = Math.max(0, 1 - (i / 15));
          const xOffset = (Math.random() - 0.5) * 80 * intensity;
          const yOffset = (Math.random() - 0.5) * 80 * intensity;
          dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'position', time: t, value: { x: 960 + xOffset, y: 540 + yOffset }, easing: 'linear' });
        }
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'position', time: time + 0.65, value: { x: 960, y: 540 } });
        break;
      case 'pulse':
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'scale', time: time, value: 1, easing: 'ease-out' });
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'scale', time: time + 0.1, value: 1.15, easing: 'ease-in' });
        dispatch({ type: 'ADD_KEYFRAME', layerId, property: 'scale', time: time + 0.2, value: 1, easing: 'linear' });
        break;
    }
  };

  return (
    <div className="w-64 h-full bg-zinc-950 border-r border-white/10 flex flex-col text-[#E0E0E0] overflow-hidden">
      <div className="sidebar-header">
        <h2 className="sidebar-label">Asset Library</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {/* Core Layers */}
        <section className="space-y-3">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter mb-2">Build tools</h3>
          <div className="grid grid-cols-2 gap-2">
            <LibraryButton icon={<Type size={16} />} label="Text" onClick={addTextLayer} />
            <LibraryButton icon={<Layout size={16} />} label="Solid" onClick={addSolidLayer} />
          </div>
        </section>

        {/* Media */}
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">B-Roll Footage</h3>
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            {SAMPLE_VIDEOS.map(video => (
               <div 
                key={video.id}
                className="group relative flex flex-col bg-[#111111] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden rounded-md"
                onClick={() => addVideoLayer(video)}
               >
                 <div className="h-20 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                    <Video size={24} className="text-white/10 group-hover:text-blue-500/40 transition-colors z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 </div>
                 <div className="p-2">
                    <div className="text-[11px] font-medium truncate group-hover:text-blue-400 transition-colors">{video.name}</div>
                    <div className="text-[9px] opacity-40 uppercase tracking-tighter">HD • {video.duration}s</div>
                 </div>
               </div>
            ))}
          </div>
        </section>

        {/* Real Presets */}
        <section className="space-y-3">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter mb-2">Motion Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            <LibraryButtonAction label="Snap Zoom" onClick={() => applyPreset('snap-zoom')} />
            <LibraryButtonAction label="Soft Float" onClick={() => applyPreset('float-y')} />
            <LibraryButtonAction label="Impact" onClick={() => applyPreset('cam-shake')} />
            <LibraryButtonAction label="Pulse" onClick={() => applyPreset('pulse')} />
            <LibraryButtonAction label="Fade" onClick={() => applyPreset('fade-in')} />
            <LibraryButtonAction label="Glow" onClick={() => {}} />
          </div>
        </section>
      </div>
    </div>
  );
};

const LibraryButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/5 rounded hover:bg-white/10 hover:border-blue-500/30 transition-all text-zinc-300 hover:text-blue-400 group"
  >
    <div className="mb-1 text-zinc-400 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const LibraryButtonAction: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="text-[10px] bg-white/5 p-2 rounded hover:bg-white/10 border border-white/5 text-center uppercase tracking-widest text-zinc-400 hover:text-white transition-all cursor-pointer"
  >
    {label}
  </button>
);
