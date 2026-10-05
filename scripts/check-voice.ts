// Voice picking rules (pure). Run: npm run check:voice
import { pickBestVoice } from '../src/services/voicePick';

const fails: string[] = [];
const eq = (l: string, g: unknown, w: unknown) => { if (g !== w) fails.push(`${l}: got ${g}, want ${w}`); };
const v = (identifier: string, language: string, quality = 'Default') => ({ identifier, name: identifier, language, quality });

eq('no voices', pickBestVoice([], 'en-US'), null);
eq('enhanced beats default', pickBestVoice([v('a', 'en-US'), v('b', 'en-US', 'Enhanced')], 'en-US'), 'b');
eq('network voice never chosen', pickBestVoice([v('en-us-x-tpf-network', 'en-US', 'Enhanced'), v('en-us-x-tpf-local', 'en-US')], 'en-US'), 'en-us-x-tpf-local');
eq('only network available -> keep default', pickBestVoice([v('en-us-x-iom-network', 'en-US')], 'en-US'), null);
eq('exact region beats other region', pickBestVoice([v('gb', 'en-GB', 'Enhanced'), v('us', 'en-US')], 'en-US'), 'us');
eq('other region only -> keep default', pickBestVoice([v('gb', 'en-GB', 'Enhanced')], 'en-US'), null);
eq('other language ignored', pickBestVoice([v('es', 'es-ES', 'Enhanced')], 'en-US'), null);
eq('underscore tags', pickBestVoice([v('x', 'en_US', 'Enhanced')], 'en-US'), 'x');

if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('Voice pick OK');
