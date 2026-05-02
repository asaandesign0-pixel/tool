/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Keyframe } from '../types.ts';

/**
 * Easing functions
 */
export const easingFunctions = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t * t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * Linearly interpolates between two values.
 */
export function lerp(v0: number, v1: number, t: number): number {
  return (1 - t) * v0 + t * v1;
}

/**
 * Interpolates properties for a given time.
 */
export function interpolateProperty(keyframes: Keyframe[], time: number, defaultValue: any): any {
  if (keyframes.length === 0) return defaultValue;
  if (time <= keyframes[0].time) return keyframes[0].value;
  if (time >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value;

  // Find the two keyframes around the current time
  for (let i = 0; i < keyframes.length - 1; i++) {
    const k0 = keyframes[i];
    const k1 = keyframes[i + 1];

    if (time >= k0.time && time <= k1.time) {
      const rawT = (time - k0.time) / (k1.time - k0.time);
      
      // Apply easing from the starting keyframe
      const easeFn = easingFunctions[k0.easing] || easingFunctions.linear;
      const t = easeFn(rawT);
      
      if (typeof k0.value === 'number' && typeof k1.value === 'number') {
        return lerp(k0.value, k1.value, t);
      }
      
      if (typeof k0.value === 'object' && k0.value !== null && k1.value !== null) {
        // Handle vector interpolation {x, y}
        const result: any = {};
        for (const key in k0.value) {
          if (typeof k0.value[key] === 'number') {
            result[key] = lerp(k0.value[key], k1.value[key], t);
          } else {
            result[key] = k1.value[key];
          }
        }
        return result;
      }

      // Discrete interpolation for types that can't be interpolated easily
      return t < 0.5 ? k0.value : k1.value;
    }
  }

  return defaultValue;
}
