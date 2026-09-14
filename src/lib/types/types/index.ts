/**
 * Central export for all types
 * Import from here: import { User, Champion, STS2Card } from '$lib/types';
 */

// Core types
export type * from './core';

// Game-specific types
export type * from './games/lol';
export type * from './games/sts2';
