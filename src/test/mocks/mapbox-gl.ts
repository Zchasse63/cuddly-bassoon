/**
 * mapbox-gl Mock
 *
 * Manual mock for mapbox-gl to avoid module resolution issues in tests.
 * This file is aliased via vitest.component.config.ts.
 */

// Mock LngLat class
export class LngLat {
  lng: number;
  lat: number;

  constructor(lng: number, lat: number) {
    this.lng = lng;
    this.lat = lat;
  }

  toArray() {
    return [this.lng, this.lat];
  }

  toString() {
    return `LngLat(${this.lng}, ${this.lat})`;
  }

  wrap() {
    return new LngLat(this.lng, this.lat);
  }
}

// Mock LngLatBounds class
export class LngLatBounds {
  private _sw: LngLat;
  private _ne: LngLat;

  constructor(sw?: [number, number], ne?: [number, number]) {
    this._sw = new LngLat(sw?.[0] ?? 0, sw?.[1] ?? 0);
    this._ne = new LngLat(ne?.[0] ?? 0, ne?.[1] ?? 0);
  }

  getSouthWest() {
    return this._sw;
  }

  getNorthEast() {
    return this._ne;
  }

  extend() {
    return this;
  }

  getCenter() {
    return new LngLat((this._sw.lng + this._ne.lng) / 2, (this._sw.lat + this._ne.lat) / 2);
  }
}

// Mock Map class
type EventCallback = (...args: unknown[]) => void;
type ListenerMap = globalThis.Map<string, EventCallback[]>;
export class Map {
  private _container: HTMLElement;
  private _listeners: ListenerMap = new globalThis.Map();

  constructor(options?: { container?: string | HTMLElement }) {
    this._container =
      typeof options?.container === 'string'
        ? document.createElement('div')
        : (options?.container ?? document.createElement('div'));
  }

  on(event: string, callback: EventCallback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event)?.push(callback);
    return this;
  }

  off(event: string, callback: EventCallback) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  once(event: string, callback: EventCallback) {
    const wrapper = (...args: unknown[]) => {
      this.off(event, wrapper);
      callback(...args);
    };
    return this.on(event, wrapper);
  }

  remove() {}
  getCanvas() {
    return document.createElement('canvas');
  }
  getContainer() {
    return this._container;
  }
  resize() {}
  setCenter() {
    return this;
  }
  getCenter() {
    return new LngLat(0, 0);
  }
  setZoom() {
    return this;
  }
  getZoom() {
    return 10;
  }
  flyTo() {
    return this;
  }
  jumpTo() {
    return this;
  }
  easeTo() {
    return this;
  }
  panTo() {
    return this;
  }
  addSource() {
    return this;
  }
  getSource() {
    return null;
  }
  removeSource() {
    return this;
  }
  addLayer() {
    return this;
  }
  getLayer() {
    return null;
  }
  removeLayer() {
    return this;
  }
  setPaintProperty() {
    return this;
  }
  setLayoutProperty() {
    return this;
  }
  getBounds() {
    return new LngLatBounds();
  }
  fitBounds() {
    return this;
  }
  setStyle() {
    return this;
  }
  getStyle() {
    return {};
  }
  loaded() {
    return true;
  }
  project() {
    return { x: 0, y: 0 };
  }
  unproject() {
    return new LngLat(0, 0);
  }
  queryRenderedFeatures() {
    return [];
  }
  addControl() {
    return this;
  }
  removeControl() {
    return this;
  }
  triggerRepaint() {}
}

// Mock Marker class
export class Marker {
  private _lngLat: LngLat = new LngLat(0, 0);
  private _element: HTMLElement;

  constructor(options?: { element?: HTMLElement }) {
    this._element = options?.element ?? document.createElement('div');
  }

  setLngLat(lngLat: [number, number] | LngLat) {
    if (Array.isArray(lngLat)) {
      this._lngLat = new LngLat(lngLat[0], lngLat[1]);
    } else {
      this._lngLat = lngLat;
    }
    return this;
  }

  getLngLat() {
    return this._lngLat;
  }

  addTo() {
    return this;
  }

  remove() {
    return this;
  }

  setPopup() {
    return this;
  }

  getPopup() {
    return null;
  }

  getElement() {
    return this._element;
  }
}

// Mock Popup class
export class Popup {
  private _lngLat: LngLat = new LngLat(0, 0);

  setLngLat(lngLat: [number, number] | LngLat) {
    if (Array.isArray(lngLat)) {
      this._lngLat = new LngLat(lngLat[0], lngLat[1]);
    } else {
      this._lngLat = lngLat;
    }
    return this;
  }

  getLngLat() {
    return this._lngLat;
  }

  setHTML() {
    return this;
  }

  setText() {
    return this;
  }

  setDOMContent() {
    return this;
  }

  addTo() {
    return this;
  }

  remove() {
    return this;
  }

  isOpen() {
    return false;
  }
}

// Mock controls
export class NavigationControl {}
export class GeolocateControl {}
export class ScaleControl {}
export class FullscreenControl {}
export class AttributionControl {}

// Default export
const mapboxgl = {
  Map,
  Marker,
  Popup,
  LngLat,
  LngLatBounds,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
  AttributionControl,
  supported: () => true,
  accessToken: '',
};

export default mapboxgl;
