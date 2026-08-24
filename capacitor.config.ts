import type { CapacitorConfig } from '@capacitor/cli';

// appId matches the Android package only. iOS deliberately differs:
//
//   com.arfhause.holyquran.indexed  → Play production (the live Android app)
//                                     not registered on the App Store at all
//   com.arfhause.kuran.multilang    → App Store production (the live iOS app)
//                                     Play closed testing, no users
//
// The two identifiers exist in both stores with opposite roles, so the iOS
// PRODUCT_BUNDLE_IDENTIFIER in ios/App/App.xcodeproj is NOT a mistake and must
// not be "corrected" to match this file. Changing it breaks signing (no
// provisioning profile) and would ship updates to the wrong app.
//
// Capacitor only reads appId when generating a platform, so neither existing
// platform is affected by what this says.

const config: CapacitorConfig = {
  appId: 'com.arfhause.holyquran.indexed',
  appName: 'The Holy Quran: Indexed',
  webDir: 'dist',
};

export default config;
