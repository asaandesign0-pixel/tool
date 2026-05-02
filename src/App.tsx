/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectProvider, useProject } from './store/ProjectStore.tsx';
import { Renderer } from './components/Preview/Renderer.tsx';
import { Timeline } from './components/Timeline/Timeline.tsx';
import { LibraryPanel } from './components/Library/LibraryPanel.tsx';
import { PropertiesPanel } from './components/Properties/PropertiesPanel.tsx';
import { Film, Settings, Download, Share2 } from 'lucide-react';

function EditorLayout() {
  const { state, dispatch } = useProject();
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-[#E0E0E0] overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-12 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-xs text-white">Ae</div>
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">MotionCore Engine</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <nav className="flex space-x-4 text-[11px] font-medium text-white/40 uppercase tracking-widest leading-none">
            <button className="hover:text-white transition-colors cursor-pointer">File</button>
            <button className="hover:text-white transition-colors cursor-pointer">Edit</button>
            <button className="hover:text-white transition-colors cursor-pointer">Composition</button>
            <button className="hover:text-white transition-colors cursor-pointer">Layer</button>
            <button className="hover:text-white transition-colors cursor-pointer">View</button>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-black/60 rounded-md p-1 border border-white/5 space-x-1">
             <button 
               onClick={() => dispatch({ type: 'UPDATE_PROJECT_SETTINGS', settings: { width: 1920, height: 1080 } })}
               className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded transition-all ${state.project.width === 1920 ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               Horizontal
             </button>
             <button 
               onClick={() => dispatch({ type: 'UPDATE_PROJECT_SETTINGS', settings: { width: 1080, height: 1920 } })}
               className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded transition-all ${state.project.width === 1080 ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               Vertical Reel
             </button>
          </div>
          <div className="text-[11px] font-mono bg-black px-2 py-1 rounded border border-white/5 text-blue-400">
             {Math.floor(state.currentTime / 60).toString().padStart(2, '0')}:
             {Math.floor(state.currentTime % 60).toString().padStart(2, '0')}:
             {Math.floor((state.currentTime % 1) * state.project.fps).toString().padStart(2, '0')}
          </div>
          <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase rounded transition-colors shadow-lg shadow-blue-900/20 active:scale-95">
             Export Render
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Library */}
        <LibraryPanel />

        {/* Center: Preview + Timeline */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1 min-h-0">
               <Renderer />
            </div>
          </div>
          
          <div className="h-[300px] flex-shrink-0">
            <Timeline />
          </div>
        </div>

        {/* Right Side: Properties */}
        <PropertiesPanel />
      </main>

      {/* Footer Status Bar */}
      <footer className="h-6 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-4 text-[10px] text-zinc-500 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Renderer Ready</span>
          <span>1920 x 1080 @ 30fps</span>
        </div>
        <div className="flex items-center space-x-4">
           <span>Memory: 247MB</span>
           <span className="text-zinc-300">v1.2.0-alpha</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <EditorLayout />
    </ProjectProvider>
  );
}
