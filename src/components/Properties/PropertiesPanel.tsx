/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Timer, Trash2, Key, Target, RotateCw, Maximize, Eye, EyeOff } from 'lucide-react';
import { useProject } from '../../store/ProjectStore.tsx';
import { Layer } from '../../types.ts';

export const PropertiesPanel: React.FC = () => {
  const { state, dispatch } = useProject();
  const selectedLayer = state.layers.find(l => l.id === state.selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="w-72 h-full bg-zinc-900 border-l border-white/10 flex flex-col items-center justify-center text-zinc-600 p-8 text-center italic">
        <Target size={32} className="mb-4 opacity-10" />
        <p className="text-[10px] uppercase tracking-widest leading-loose">Select a layer to adjust properties and add keyframes</p>
      </div>
    );
  }

  const handlePropChange = (propName: string, value: any) => {
    if (['visible', 'locked', 'name', 'text', 'color', 'fontSize'].includes(propName)) {
      dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, updates: { [propName]: value } });
      return;
    }

    const prop = (selectedLayer as any)[propName];
    if (prop && prop.keyframes) {
      const hasKeyframe = prop.keyframes.some((k: any) => Math.abs(k.time - state.currentTime) < 0.001);
      if (hasKeyframe) {
        dispatch({ type: 'ADD_KEYFRAME', layerId: selectedLayer.id, property: propName, time: state.currentTime, value });
      } else {
        dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, updates: { [propName]: { ...prop, value } } });
      }
    }
  };

  const toggleKeyframe = (propName: string) => {
     const prop = (selectedLayer as any)[propName];
     const currentValue = prop.value;
     
     const existingIdx = prop.keyframes.findIndex((k: any) => Math.abs(k.time - state.currentTime) < 0.001);
     if (existingIdx !== -1) {
       dispatch({ type: 'REMOVE_KEYFRAME', layerId: selectedLayer.id, property: propName, keyframeId: prop.keyframes[existingIdx].id });
     } else {
       dispatch({ type: 'ADD_KEYFRAME', layerId: selectedLayer.id, property: propName, time: state.currentTime, value: currentValue });
     }
  };

  return (
    <div className="w-72 h-full bg-zinc-900 border-l border-white/10 flex flex-col text-[#E0E0E0] overflow-y-auto scrollbar-thin">
      <div className="sidebar-header">
        <h2 className="sidebar-label">Layer Properties</h2>
        <button 
          onClick={() => dispatch({ type: 'REMOVE_LAYER', id: selectedLayer.id })}
          className="ml-auto p-1.5 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 rounded transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="p-4 space-y-8">
        {/* Layer Info */}
        <section className="space-y-4">
           <div className="flex items-center space-x-2">
              <input 
                value={selectedLayer.name}
                onChange={e => handlePropChange('name', e.target.value)}
                className="bg-black/40 border border-white/5 focus:border-blue-500/50 rounded px-2 py-1.5 text-[11px] font-medium outline-none w-full"
              />
              <button 
                onClick={() => handlePropChange('visible', !selectedLayer.visible)}
                className={`p-2 rounded border border-white/5 ${selectedLayer.visible ? 'text-zinc-500' : 'text-blue-400 bg-blue-500/5 border-blue-500/20'}`}
              >
                {selectedLayer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
           </div>
           
           {selectedLayer.type === 'text' && (
              <div className="space-y-4 pt-2">
                 <div className="flex flex-col space-y-1.5">
                    <label className="property-label">Text Content</label>
                    <textarea 
                      value={selectedLayer.text}
                      onChange={e => handlePropChange('text', e.target.value)}
                      className="bg-black/40 border border-white/5 rounded p-2 text-[11px] outline-none min-h-[60px] focus:border-blue-500/30"
                    />
                 </div>
                 <div className="flex space-x-2">
                    <div className="flex flex-col flex-1 space-y-1.5">
                       <label className="property-label">Size</label>
                       <input 
                        type="number"
                        value={selectedLayer.fontSize}
                        onChange={e => handlePropChange('fontSize', parseInt(e.target.value))}
                        className="bg-black/40 border border-white/5 rounded px-2 py-1 text-[11px] outline-none value-text"
                       />
                    </div>
                    <div className="flex flex-col flex-1 space-y-1.5">
                       <label className="property-label">Color</label>
                       <input 
                        type="color"
                        value={selectedLayer.color}
                        onChange={e => handlePropChange('color', e.target.value)}
                        className="bg-black/40 h-7 w-full border border-white/5 rounded cursor-pointer"
                       />
                    </div>
                 </div>
              </div>
           )}
        </section>

        {/* Transform */}
        <section className="space-y-4 pt-4 border-t border-white/5">
           <div className="flex justify-between items-center mb-2">
              <span className="property-label">Transform</span>
              <div className="w-3 h-3 border border-blue-600 rotate-45 flex items-center justify-center">
                 <div className="w-1 h-1 bg-blue-600"></div>
              </div>
           </div>
           
           <PropertyInput 
             label="Position X" 
             value={selectedLayer.position.value.x} 
             keyframes={selectedLayer.position.keyframes}
             currentTime={state.currentTime}
             layerId={selectedLayer.id}
             propName="position"
             onChange={(v) => handlePropChange('position', { ...selectedLayer.position.value, x: v })}
             onToggleKey={(() => toggleKeyframe('position'))}
           />
           <PropertyInput 
             label="Position Y" 
             value={selectedLayer.position.value.y} 
             keyframes={selectedLayer.position.keyframes}
             currentTime={state.currentTime}
             layerId={selectedLayer.id}
             propName="position"
             onChange={(v) => handlePropChange('position', { ...selectedLayer.position.value, y: v })}
             onToggleKey={(() => toggleKeyframe('position'))}
           />
           <PropertyInput 
             label="Scale" 
             value={selectedLayer.scale.value} 
             min={0} max={10} step={0.01}
             keyframes={selectedLayer.scale.keyframes}
             currentTime={state.currentTime}
             layerId={selectedLayer.id}
             propName="scale"
             onChange={(v) => handlePropChange('scale', v)}
             onToggleKey={(() => toggleKeyframe('scale'))}
           />
           <PropertyInput 
             label="Rotation" 
             value={selectedLayer.rotation.value} 
             min={-360} max={360}
             keyframes={selectedLayer.rotation.keyframes}
             currentTime={state.currentTime}
             layerId={selectedLayer.id}
             propName="rotation"
             onChange={(v) => handlePropChange('rotation', v)}
             onToggleKey={(() => toggleKeyframe('rotation'))}
           />
           <PropertyInput 
             label="Opacity" 
             value={selectedLayer.opacity.value} 
             min={0} max={1} step={0.01}
             keyframes={selectedLayer.opacity.keyframes}
             currentTime={state.currentTime}
             layerId={selectedLayer.id}
             propName="opacity"
             onChange={(v) => handlePropChange('opacity', v)}
             onToggleKey={(() => toggleKeyframe('opacity'))}
           />
        </section>

        {/* Effects */}
        <section className="space-y-4 pt-4 border-t border-white/5">
           <div className="flex justify-between items-center mb-2">
              <span className="property-label">Effects engine</span>
              <div className="w-3 h-3 border border-white/10 rotate-45"></div>
           </div>
           <PropertyInput 
             label="Blur" 
             value={selectedLayer.blur.value} 
             min={0} max={100}
             keyframes={selectedLayer.blur.keyframes}
             currentTime={state.currentTime}
             layerId={selectedLayer.id}
             propName="blur"
             onChange={(v) => handlePropChange('blur', v)}
             onToggleKey={(() => toggleKeyframe('blur'))}
           />
           <PropertyInput 
             label="Brightness" 
             value={selectedLayer.brightness.value} 
             min={0} max={300}
             keyframes={selectedLayer.brightness.keyframes}
             currentTime={state.currentTime}
             layerId={selectedLayer.id}
             propName="brightness"
             onChange={(v) => handlePropChange('brightness', v)}
             onToggleKey={(() => toggleKeyframe('brightness'))}
           />
           <PropertyInput 
             label="Contrast" 
             value={selectedLayer.contrast.value} 
             min={0} max={300}
             keyframes={selectedLayer.contrast.keyframes}
             currentTime={state.currentTime}
             layerId={selectedLayer.id}
             propName="contrast"
             onChange={(v) => handlePropChange('contrast', v)}
             onToggleKey={(() => toggleKeyframe('contrast'))}
           />
        </section>
      </div>
    </div>
  );
};

interface PropertyInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  keyframes: any[];
  currentTime: number;
  layerId: string;
  propName: string;
  onChange: (v: number) => void;
  onToggleKey: () => void;
}

const PropertyInput: React.FC<PropertyInputProps> = ({ label, value, min, max, step = 1, keyframes, currentTime, layerId, propName, onChange, onToggleKey }) => {
  const { dispatch } = useProject();
  const activeKeyframe = keyframes.find((k: any) => Math.abs(k.time - currentTime) < 0.001);
  const isKeyframeActive = !!activeKeyframe;
  const isPropertyAnimated = keyframes.length > 0;

  return (
    <div className="flex flex-col space-y-2 group">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{label}</label>
        <div className="flex items-center space-x-2">
          {isKeyframeActive && (
            <select 
              value={activeKeyframe.easing}
              onChange={(e) => dispatch({ 
                type: 'UPDATE_KEYFRAME_EASING', 
                layerId, 
                property: propName, 
                keyframeId: activeKeyframe.id, 
                easing: e.target.value as any 
              })}
              className="bg-black/60 border border-white/10 text-[9px] uppercase tracking-tighter px-1 py-0.5 rounded outline-none text-blue-400 font-bold"
            >
              <option value="linear">Linear</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
            </select>
          )}
          <button 
            onClick={onToggleKey}
            className={`p-1 rounded transition-all ${isKeyframeActive ? 'text-yellow-500 bg-yellow-500/10' : isPropertyAnimated ? 'text-white/40' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <Timer size={11} className={isPropertyAnimated && !isKeyframeActive ? 'opacity-40' : ''} />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex-1 h-1 bg-white/5 rounded relative">
          <div 
            className="absolute left-0 top-0 bottom-0 bg-blue-600 rounded-full" 
            style={{ width: `${((value - (min ?? -2000)) / ((max ?? 2000) - (min ?? -2000))) * 100}%` }}
          />
          <input 
            type="range"
            min={min ?? -2000}
            max={max ?? 2000}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-[10px] value-text w-12 text-right">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
};
