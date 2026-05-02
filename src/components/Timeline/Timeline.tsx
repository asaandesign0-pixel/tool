/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, Plus, ZoomIn, ZoomOut, Scissors, SquareArrowRight } from 'lucide-react';
import { useProject } from '../../store/ProjectStore.tsx';
import { Layer } from '../../types.ts';

export const Timeline: React.FC = () => {
  const { state, dispatch } = useProject();
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const pixelsPerSecond = state.zoom;
  const totalWidth = state.project.duration * pixelsPerSecond;

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft;
    const time = (x - 160) / pixelsPerSecond; // Subtract track header width (160px)
    if (time >= 0) {
      dispatch({ type: 'SET_TIME', time });
    }
  }, [dispatch, pixelsPerSecond]);

  const togglePlayback = () => {
    dispatch({ type: 'SET_PLAYING', isPlaying: !state.isPlaying });
  };

  // Playback timer
  useEffect(() => {
    let timerId: number;
    if (state.isPlaying) {
      const startTimestamp = performance.now();
      const startTime = state.currentTime;

      const step = (now: number) => {
        const elapsed = (now - startTimestamp) / 1000;
        const newTime = startTime + elapsed;
        
        if (newTime >= state.project.duration) {
          dispatch({ type: 'SET_PLAYING', isPlaying: false });
          dispatch({ type: 'SET_TIME', time: state.project.duration });
        } else {
          dispatch({ type: 'SET_TIME', time: newTime });
          timerId = requestAnimationFrame(step);
        }
      };
      timerId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(timerId);
  }, [state.isPlaying, state.project.duration, dispatch]);

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-t border-white/10 text-[#E0E0E0] select-none shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-white/5 bg-black/40">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => dispatch({ type: 'SET_TIME', time: 0 })}
              className="p-1.5 hover:bg-white/5 rounded border border-transparent hover:border-white/10 text-zinc-500 hover:text-white transition-all"
            >
              <SkipBack size={14} />
            </button>
            <button 
              onClick={togglePlayback}
              className="p-1.5 hover:bg-white/5 rounded border border-transparent hover:border-white/10 text-blue-500 hover:text-blue-400 transition-all"
            >
              {state.isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
          </div>
          
          <div className="text-[11px] font-mono text-blue-400 bg-black/50 px-2 py-0.5 rounded border border-white/5">
            {state.currentTime.toFixed(2)}s
          </div>
        </div>

        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-1 border border-white/5 rounded-md px-1 bg-zinc-800/50">
              <button 
                onClick={() => dispatch({ type: 'UPDATE_TIMELINE_ZOOM', zoom: Math.max(20, state.zoom - 20) })}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <ZoomOut size={12} />
              </button>
              <div className="w-[1px] h-3 bg-white/10" />
              <button 
                onClick={() => dispatch({ type: 'UPDATE_TIMELINE_ZOOM', zoom: state.zoom + 20 })}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <ZoomIn size={12} />
              </button>
           </div>
        </div>
      </div>

      {/* Rulers & Tracks Area */}
      <div 
        ref={timelineRef}
        className="flex-1 overflow-auto overflow-x-auto relative scrollbar-thin"
        onMouseDown={handleTimelineClick}
      >
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-blue-400 z-50 pointer-events-none transition-transform duration-75"
          style={{ transform: `translateX(${160 + state.currentTime * pixelsPerSecond}px)` }}
        >
          <div className="clip-playhead-gem" />
        </div>

        {/* Header Spacer for alignment */}
        <div className="flex flex-col min-w-full" style={{ width: 160 + totalWidth }}>
          {/* Timeline Ruler */}
          <div className="flex h-8 border-b border-white/5 sticky top-0 z-40 bg-zinc-950">
            <div className="w-40 border-r border-white/5 bg-black/20 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E0E0E0]">Timeline</span>
            </div>
            <div className="relative flex-1 h-full flex items-center">
              {Array.from({ length: Math.ceil(state.project.duration) + 1 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute top-0 h-full border-l border-white/5"
                  style={{ left: i * pixelsPerSecond }}
                >
                  <span className="ml-1 text-[9px] text-zinc-500 font-mono mt-1 block">{i}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tracks */}
          <div className="flex-1 bg-[#111111]">
            {state.layers.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-zinc-600 italic">
                 <Plus size={24} className="mb-2 opacity-10" />
                 <span className="text-[10px] uppercase tracking-widest">Awaiting active layers...</span>
               </div>
            ) : (
              [...state.layers].reverse().map((layer, index) => (
                <TimelineTrack key={layer.id} layer={layer} index={state.layers.length - index} pixelsPerSecond={pixelsPerSecond} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineTrack: React.FC<{ layer: Layer; index: number; pixelsPerSecond: number }> = ({ layer, index, pixelsPerSecond }) => {
  const { state, dispatch } = useProject();
  const isSelected = state.selectedLayerId === layer.id;

  return (
    <div 
      className={`group flex h-10 border-b border-white/5 transition-all ${isSelected ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'SELECT_LAYER', id: layer.id });
      }}
    >
      {/* Track Header */}
      <div className={`w-40 px-3 flex items-center border-r border-white/5 space-x-2 ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`}>
        <span className="text-[10px] opacity-40 font-mono w-3">{index}</span>
        <div className="text-[11px] font-medium truncate flex-1">{layer.name}</div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className={`w-2 h-2 rounded-full border border-white/20 ${layer.visible ? 'bg-blue-500 border-blue-400' : ''}`}></div>
        </div>
      </div>

      {/* Track Body */}
      <div className="relative flex-1">
        {/* Clip */}
        <div 
          className={`absolute top-2 bottom-2 rounded-sm transition-all shadow-sm ${isSelected ? 'bg-blue-500/30 border border-blue-500 ring-1 ring-blue-500/20' : 'bg-white/10 border border-white/5'}`}
          style={{ 
            left: layer.startTime * pixelsPerSecond, 
            width: layer.duration * pixelsPerSecond 
          }}
        >
          {/* Keyframe markers */}
          <div className="absolute inset-0">
             {Object.entries(layer).map(([key, prop]) => {
               if (prop && prop.keyframes) {
                 return prop.keyframes.map((k: any) => (
                   <div 
                    key={k.id}
                    className={`absolute top-1/2 -translate-y-1/2 keyframe-diamond shadow-md shadow-black/50 easing-${k.easing}`}
                    style={{ left: (k.time - layer.startTime) * pixelsPerSecond }}
                    title={`${key}: ${k.value}`}
                   />
                 ));
               }
               return null;
             })}
          </div>
        </div>
      </div>
    </div>
  );
};
