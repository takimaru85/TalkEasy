import { QUESTIONS_PER_SESSION as N, fromBank, mcq } from '../engine';
import type { LearningActivity, LearningSubject, Option } from '../types';

interface Fact {
  emoji: string;
  prompt: string;
  speak?: string;
  answer: string;
  distractors: string[];
  explain?: string;
}

function factActivity(key: string, title: string, emoji: string, description: string, bank: Fact[]): LearningActivity {
  return {
    key,
    subjectKey: 'ap',
    title,
    emoji,
    description,
    generate: (d, rng) =>
      fromBank(rng, bank, N, (f) =>
        mcq(rng, d, f.prompt, { label: f.answer }, f.distractors.map((x): Option => ({ label: x })), {
          promptEmoji: f.emoji,
          speak: f.speak ?? f.prompt,
          explain: f.explain ?? `Yes! ${f.answer}.`,
        }),
      ),
  };
}

const FAMILY: Fact[] = [
  { emoji: '👨', prompt: 'Who is this?', answer: 'Tatay (father)', distractors: ['Nanay (mother)', 'Lola (grandmother)', 'Kuya (older brother)'] },
  { emoji: '👩', prompt: 'Who is this?', answer: 'Nanay (mother)', distractors: ['Tatay (father)', 'Lolo (grandfather)', 'Ate (older sister)'] },
  { emoji: '👴', prompt: 'Who is this?', answer: 'Lolo (grandfather)', distractors: ['Kuya', 'Tatay', 'Baby'] },
  { emoji: '👵', prompt: 'Who is this?', answer: 'Lola (grandmother)', distractors: ['Ate', 'Nanay', 'Baby'] },
  { emoji: '👧', prompt: 'An older sister is called…', answer: 'Ate', distractors: ['Kuya', 'Lolo', 'Tito'] },
  { emoji: '👦', prompt: 'An older brother is called…', answer: 'Kuya', distractors: ['Ate', 'Lola', 'Tita'] },
  { emoji: '👨‍👩‍👧‍👦', prompt: 'Father, mother and children together are a…', answer: 'family', distractors: ['school', 'store', 'team'] },
  { emoji: '🏠', prompt: 'A family lives together in a…', answer: 'home', distractors: ['bus', 'market', 'river'] },
  { emoji: '🍽️', prompt: 'Family members help by…', answer: 'doing chores', distractors: ['making a mess', 'hiding', 'shouting'] },
  { emoji: '🤝', prompt: 'When family members love each other they…', answer: 'help and care', distractors: ['fight', 'ignore', 'run away'] },
];

const COMMUNITY: Fact[] = [
  { emoji: '🏘️', prompt: 'A group of families living near each other is a…', answer: 'community', distractors: ['forest', 'ocean', 'classroom'] },
  { emoji: '👮', prompt: 'Who keeps the community safe?', answer: 'police officer', distractors: ['baker', 'farmer', 'driver'] },
  { emoji: '👨‍🚒', prompt: 'Who puts out fires?', answer: 'firefighter', distractors: ['teacher', 'nurse', 'farmer'] },
  { emoji: '👩‍⚕️', prompt: 'Who helps sick people get better?', answer: 'doctor', distractors: ['driver', 'baker', 'police'] },
  { emoji: '👩‍🏫', prompt: 'Who helps children learn at school?', answer: 'teacher', distractors: ['firefighter', 'fisherman', 'driver'] },
  { emoji: '👨‍🌾', prompt: 'Who grows rice and vegetables?', answer: 'farmer', distractors: ['doctor', 'teacher', 'police'] },
  { emoji: '🎣', prompt: 'Who catches fish for us to eat?', answer: 'fisherman', distractors: ['teacher', 'nurse', 'baker'] },
  { emoji: '🛺', prompt: 'Who drives the jeepney or tricycle?', answer: 'driver', distractors: ['doctor', 'farmer', 'teacher'] },
  { emoji: '🧹', prompt: 'To keep our community clean we…', answer: 'throw trash properly', distractors: ['litter', 'break things', 'shout'] },
  { emoji: '🙋', prompt: 'A good community member…', answer: 'helps neighbors', distractors: ['takes things', 'is noisy at night', 'ignores rules'] },
];

const SYMBOLS: Fact[] = [
  { emoji: '🇵🇭', prompt: 'This is the flag of the…', answer: 'Philippines', distractors: ['Japan', 'USA', 'China'] },
  { emoji: '🇵🇭', prompt: 'How many stars are on the Philippine flag?', answer: '3', distractors: ['1', '5', '8'] },
  { emoji: '☀️', prompt: 'The sun on the flag has how many rays?', answer: '8', distractors: ['3', '5', '12'] },
  { emoji: '🦅', prompt: 'The national bird of the Philippines is the…', answer: 'Philippine eagle', distractors: ['maya', 'chicken', 'parrot'] },
  { emoji: '🌸', prompt: 'The national flower is…', answer: 'sampaguita', distractors: ['rose', 'sunflower', 'tulip'] },
  { emoji: '🌳', prompt: 'The national tree is…', answer: 'narra', distractors: ['mango', 'coconut', 'pine'] },
  { emoji: '🐃', prompt: 'The national animal is the…', answer: 'carabao', distractors: ['cow', 'horse', 'tiger'] },
  { emoji: '🗣️', prompt: 'The national language is…', answer: 'Filipino', distractors: ['English', 'Spanish', 'Chinese'] },
  { emoji: '🎵', prompt: 'The national anthem is…', answer: 'Lupang Hinirang', distractors: ['Bahay Kubo', 'Leron Leron Sinta', 'Happy Birthday'] },
  { emoji: '🏙️', prompt: 'The capital of the Philippines is…', answer: 'Manila', distractors: ['Cebu', 'Davao', 'Baguio'] },
  { emoji: '🙋‍♂️', prompt: 'A person born in the Philippines is a…', answer: 'Filipino', distractors: ['American', 'Japanese', 'Korean'] },
];

const PLACES: Fact[] = [
  { emoji: '🏫', prompt: 'Where do children go to learn?', answer: 'school', distractors: ['market', 'hospital', 'church'] },
  { emoji: '🏥', prompt: 'Where do sick people go?', answer: 'hospital', distractors: ['school', 'park', 'store'] },
  { emoji: '🛒', prompt: 'Where do we buy food?', answer: 'market', distractors: ['hospital', 'school', 'fire station'] },
  { emoji: '⛪', prompt: 'Where do people go to pray?', answer: 'church', distractors: ['market', 'gas station', 'bank'] },
  { emoji: '🌳🛝', prompt: 'Where do children play outside?', answer: 'park', distractors: ['hospital', 'bank', 'office'] },
  { emoji: '🏛️', prompt: 'Where does the barangay captain work?', answer: 'barangay hall', distractors: ['school', 'market', 'park'] },
  { emoji: '🚒', prompt: 'Where do fire trucks stay?', answer: 'fire station', distractors: ['church', 'market', 'library'] },
  { emoji: '📚', prompt: 'Where can we borrow books?', answer: 'library', distractors: ['market', 'hospital', 'gas station'] },
  { emoji: '👮', prompt: 'Where do police officers work?', answer: 'police station', distractors: ['bakery', 'school', 'park'] },
  { emoji: '🏘️👑', prompt: 'Who leads the barangay?', answer: 'barangay captain', distractors: ['teacher', 'doctor', 'driver'] },
];

export const AP: LearningSubject = {
  key: 'ap',
  name: 'Araling Panlipunan',
  emoji: '🏘️',
  color: '#FFD9B0',
  activities: [
    factActivity('ap.family', 'Family', '👨‍👩‍👧', 'Members of the family.', FAMILY),
    factActivity('ap.community', 'Community helpers', '👮', 'People who help in the community.', COMMUNITY),
    factActivity('ap.symbols', 'Philippine symbols', '🇵🇭', 'Flag, national symbols and language.', SYMBOLS),
    factActivity('ap.places', 'Places & roles', '🏫', 'Places in the community and who works there.', PLACES),
  ],
};
