/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Keyframe {
  id: string;
  time: number; // in seconds
  value: number | string | any;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface AnimatableProperty<T> {
  value: T;
  keyframes: Keyframe[];
}

export type LayerType = 'video' | 'text' | 'image' | 'solid';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  startTime: number; // in seconds
  duration: number; // in seconds
  
  // Transform properties
  position: AnimatableProperty<{ x: number; y: number }>;
  scale: AnimatableProperty<number>;
  rotation: AnimatableProperty<number>;
  opacity: AnimatableProperty<number>;
  
  // Effects specific properties
  blur: AnimatableProperty<number>;
  brightness: AnimatableProperty<number>;
  contrast: AnimatableProperty<number>;
  
  // Content specific
  src?: string; // URL for video/image
  text?: string;
  fontSize?: number;
  color?: string;
  
  // Meta
  zIndex: number;
}

export interface ProjectSettings {
  width: number;
  height: number;
  fps: number;
  duration: number; // total sequence duration
}

export interface EditorState {
  project: ProjectSettings;
  layers: Layer[];
  currentTime: number;
  selectedLayerId: string | null;
  isPlaying: boolean;
  zoom: number; // timeline zoom level
}
