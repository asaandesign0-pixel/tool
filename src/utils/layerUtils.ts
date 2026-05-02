/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layer, LayerType } from '../types.ts';

export function createLayer(type: LayerType, name: string, options: Partial<Layer> = {}): Layer {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    type,
    visible: true,
    locked: false,
    startTime: 0,
    duration: 5,
    zIndex: 0,
    
    position: { value: { x: 960, y: 540 }, keyframes: [] },
    scale: { value: 1, keyframes: [] },
    rotation: { value: 0, keyframes: [] },
    opacity: { value: 1, keyframes: [] },
    
    blur: { value: 0, keyframes: [] },
    brightness: { value: 100, keyframes: [] },
    contrast: { value: 100, keyframes: [] },
    ...options
  };
}
