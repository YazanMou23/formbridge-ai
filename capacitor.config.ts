import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.formbridgeai.app',
  appName: 'FormBridge AI',
  webDir: 'out',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '18682670397-ktf7brq63spvjjpkee6aq2d9lui4gv71.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
  server: {
    // Allow Android WebView to make requests to the production API
    androidScheme: 'https',
  },
};

export default config;
