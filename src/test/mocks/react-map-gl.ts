/**
 * react-map-gl Mock
 *
 * Manual mock for react-map-gl to avoid module resolution issues in tests.
 * This file is aliased via vitest.component.config.ts.
 */

import React from 'react';

// Mock Map component
export const Map = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
  React.createElement('div', { 'data-testid': 'map-container', ...props }, children);

// Mock Marker component
export const Marker = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
  React.createElement('div', { 'data-testid': 'marker', ...props }, children);

// Mock Popup component
export const Popup = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
  React.createElement('div', { 'data-testid': 'popup', ...props }, children);

// Mock NavigationControl component
export const NavigationControl = (props: Record<string, unknown>) =>
  React.createElement('div', { 'data-testid': 'navigation-control', ...props });

// Mock GeolocateControl component
export const GeolocateControl = (props: Record<string, unknown>) =>
  React.createElement('div', { 'data-testid': 'geolocate-control', ...props });

// Mock ScaleControl component
export const ScaleControl = (props: Record<string, unknown>) =>
  React.createElement('div', { 'data-testid': 'scale-control', ...props });

// Mock FullscreenControl component
export const FullscreenControl = (props: Record<string, unknown>) =>
  React.createElement('div', { 'data-testid': 'fullscreen-control', ...props });

// Mock Source component
export const Source = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
  React.createElement('div', { 'data-testid': 'source', ...props }, children);

// Mock Layer component
export const Layer = (props: Record<string, unknown>) =>
  React.createElement('div', { 'data-testid': 'layer', ...props });

// Mock useMap hook
export const useMap = () => ({
  current: null,
});

// Mock useControl hook
export const useControl = () => null;

// Mock MapRef type (for TypeScript)
export type MapRef = {
  getMap: () => unknown;
  getCenter: () => { lng: number; lat: number };
  getZoom: () => number;
  flyTo: (options: unknown) => void;
};

// Default export (same as Map)
export default Map;
