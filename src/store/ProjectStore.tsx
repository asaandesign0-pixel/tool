/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { EditorState, Layer, LayerType, ProjectSettings, Keyframe } from '../types.ts';

type Action =
  | { type: 'SET_TIME'; time: number }
  | { type: 'SET_PLAYING'; isPlaying: boolean }
  | { type: 'SELECT_LAYER'; id: string | null }
  | { type: 'ADD_LAYER'; layer: Layer }
  | { type: 'UPDATE_LAYER'; id: string; updates: Partial<Layer> }
  | { type: 'REMOVE_LAYER'; id: string }
  | { type: 'UPDATE_TIMELINE_ZOOM'; zoom: number }
  | { type: 'UPDATE_PROJECT_SETTINGS'; settings: Partial<ProjectSettings> }
  | { type: 'ADD_KEYFRAME'; layerId: string; property: string; time: number; value: any; easing?: Keyframe['easing'] }
  | { type: 'UPDATE_KEYFRAME_EASING'; layerId: string; property: string; keyframeId: string; easing: Keyframe['easing'] }
  | { type: 'REMOVE_KEYFRAME'; layerId: string; property: string; keyframeId: string };

const initialState: EditorState = {
  project: {
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 30, // 30 seconds default
  },
  layers: [],
  currentTime: 0,
  selectedLayerId: null,
  isPlaying: false,
  zoom: 100, // pixels per second
};

function projectReducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_TIME':
      return { ...state, currentTime: Math.max(0, Math.min(action.time, state.project.duration)) };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.isPlaying };
    case 'SELECT_LAYER':
      return { ...state, selectedLayerId: action.id };
    case 'ADD_LAYER':
      return { ...state, layers: [...state.layers, action.layer], selectedLayerId: action.layer.id };
    case 'UPDATE_LAYER':
      return {
        ...state,
        layers: state.layers.map(l => (l.id === action.id ? { ...l, ...action.updates } : l)),
      };
    case 'REMOVE_LAYER':
      return {
        ...state,
        layers: state.layers.filter(l => l.id !== action.id),
        selectedLayerId: state.selectedLayerId === action.id ? null : state.selectedLayerId,
      };
    case 'UPDATE_TIMELINE_ZOOM':
      return { ...state, zoom: action.zoom };
    case 'UPDATE_PROJECT_SETTINGS':
      return { ...state, project: { ...state.project, ...action.settings } };
    case 'ADD_KEYFRAME': {
      const layerIndex = state.layers.findIndex(l => l.id === action.layerId);
      if (layerIndex === -1) return state;
      
      const newLayers = [...state.layers];
      const layer = { ...newLayers[layerIndex] };
      const propName = action.property as keyof Layer;
      const prop = (layer[propName] as any);
      
      if (prop && prop.keyframes) {
        const existingIdx = prop.keyframes.findIndex((k: Keyframe) => Math.abs(k.time - action.time) < 0.001);
        const newKeyframes = [...prop.keyframes];
        
        if (existingIdx !== -1) {
          newKeyframes[existingIdx] = { 
            ...newKeyframes[existingIdx], 
            value: action.value,
            easing: action.easing || newKeyframes[existingIdx].easing 
          };
        } else {
          newKeyframes.push({
            id: Math.random().toString(36).substr(2, 9),
            time: action.time,
            value: action.value,
            easing: action.easing || 'linear',
          });
        }
        
        newKeyframes.sort((a, b) => a.time - b.time);
        (layer[propName] as any) = { ...prop, keyframes: newKeyframes };
        newLayers[layerIndex] = layer;
      }
      
      return { ...state, layers: newLayers };
    }
    case 'UPDATE_KEYFRAME_EASING': {
      const layerIndex = state.layers.findIndex(l => l.id === action.layerId);
      if (layerIndex === -1) return state;

      const newLayers = [...state.layers];
      const layer = { ...newLayers[layerIndex] };
      const propName = action.property as keyof Layer;
      const prop = (layer[propName] as any);

      if (prop && prop.keyframes) {
        const keyframes = prop.keyframes.map((k: Keyframe) => 
          k.id === action.keyframeId ? { ...k, easing: action.easing } : k
        );
        (layer[propName] as any) = { ...prop, keyframes };
        newLayers[layerIndex] = layer;
      }

      return { ...state, layers: newLayers };
    }
    case 'REMOVE_KEYFRAME': {
      const layerIndex = state.layers.findIndex(l => l.id === action.layerId);
      if (layerIndex === -1) return state;
      
      const newLayers = [...state.layers];
      const layer = { ...newLayers[layerIndex] };
      const propName = action.property as keyof Layer;
      const prop = (layer[propName] as any);
      
      if (prop && prop.keyframes) {
        const newKeyframes = prop.keyframes.filter((k: Keyframe) => k.id !== action.keyframeId);
        (layer[propName] as any) = { ...prop, keyframes: newKeyframes };
        newLayers[layerIndex] = layer;
      }
      
      return { ...state, layers: newLayers };
    }
    default:
      return state;
  }
}

const ProjectContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
}
