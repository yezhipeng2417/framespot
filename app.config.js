/*
 * @Description: 
 * @Date: 2025-04-02 13:53:34
 * @LastEditTime: 2025-04-03 22:20:52
 * @FilePath: /framespot/app.config.js
 * @LastEditors: Xinyi Yan
 */
require('dotenv').config();

module.exports = {
  name: 'FrameSpot',
  slug: 'framespot',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'life.nomorework.framespot',
    config: {
      usesAppleSignIn: true
    }
  },
  android: {
    package: 'com.yourcompany.framespot'
  },
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: "d01c0a23-54fc-42ca-b500-a12aa3c74ebd"
    }
  },
  plugins: [
    [
      'expo-apple-authentication',
      {
        "bundleIdentifier": "life.nomorework.framespot"
      }
    ]
  ],
  scheme: 'framespot',
  newArchEnabled: true,
  developmentClient: true
}; 