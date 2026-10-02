// Metro config.
//
// Added so the app can be RUN IN A BROWSER for development checks. expo-sqlite's web build loads
// SQLite as a WebAssembly module, and Metro does not treat `.wasm` as an asset by default, so the
// bundle fails to resolve it and the app hangs on the splash screen with no database.
//
// This affects the web bundle only; the native builds are unchanged. Safe to delete if you never
// want to run TalkEasy in a browser.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('wasm')) config.resolver.assetExts.push('wasm');

module.exports = config;
