import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile packages that need special handling
  transpilePackages: ['react-map-gl', 'mapbox-gl', '@vis.gl/react-mapbox'],

  // Skip type checking during build (we run it separately)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Experimental settings for Next.js 16
  experimental: {
    // Disable partial prerendering which can cause useContext issues
    ppr: false,
  },
};

export default nextConfig;
