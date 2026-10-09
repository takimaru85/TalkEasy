/**
 * Native autolinking overrides.
 *
 * Google ML Kit (the engine behind Scan Assignment) is NOT linked into the iOS app. ML Kit sends
 * diagnostic usage data to Google by default, which an iOS Kids Category app must not do, so the iOS
 * binary does not contain it and Scan Assignment is hidden on iOS (see src/scan/availability.ts).
 * Android is unchanged: the package is still linked there.
 */
module.exports = {
  dependencies: {
    '@react-native-ml-kit/text-recognition': {
      platforms: {
        ios: null,
      },
    },
  },
};
