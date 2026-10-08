// Prints each layer's name and its opacity keyframes from the Cosmo avatar Lottie.
// Run: node scripts/inspect-cosmo-lottie.js
const a = require('../assets/talkeasy_cosmo_lottie/talkeasy_cosmo_avatar.json');
for (const l of a.layers) {
  const k = l.ks?.o?.k;
  console.log(l.nm, JSON.stringify(Array.isArray(k) ? k.map((x) => ({ frame: x.t, opacity: x.s?.[0] })) : k));
}
