import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dasi.camera',
  appName: 'DASI 다시',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#fbf9f5'
    }
  }
};

export default config;
