import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile packages that need special handling
  transpilePackages: ['react-map-gl', 'mapbox-gl', '@vis.gl/react-mapbox'],
};

export default nextConfig;
