import { QUESTIONS_PER_SESSION as N, fromBank, mcq } from '../engine';
import type { LearningActivity, LearningSubject, Option } from '../types';

interface Fact {
  /** Shown as picture. */
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
    subjectKey: 'science',
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

const ANIMALS: Fact[] = [
  { emoji: '🐶', prompt: 'What animal is this?', answer: 'dog', distractors: ['cat', 'cow', 'frog'] },
  { emoji: '🐱', prompt: 'What animal is this?', answer: 'cat', distractors: ['dog', 'bird', 'fish'] },
  { emoji: '🐃', prompt: 'What animal is this?', answer: 'carabao', distractors: ['horse', 'goat', 'pig'] },
  { emoji: '🐔', prompt: 'What animal is this?', answer: 'chicken', distractors: ['duck', 'cat', 'cow'] },
  { emoji: '🐟', prompt: 'Where does a fish live?', answer: 'in water', distractors: ['in a tree', 'in a nest', 'in a cave'] },
  { emoji: '🐦', prompt: 'What does a bird use to fly?', answer: 'wings', distractors: ['legs', 'tail', 'nose'] },
  { emoji: '🐸', prompt: 'A frog can…', answer: 'jump', distractors: ['fly', 'drive', 'read'] },
  { emoji: '🐄', prompt: 'Which animal gives us milk?', answer: 'cow', distractors: ['snake', 'bird', 'fish'] },
  { emoji: '🐔🥚', prompt: 'Which animal lays eggs?', answer: 'chicken', distractors: ['dog', 'cat', 'carabao'] },
  { emoji: '🦋', prompt: 'A butterfly comes from a…', answer: 'caterpillar', distractors: ['puppy', 'seed', 'egg of a bird'] },
  { emoji: '🐍', prompt: 'How does a snake move?', answer: 'it slides', distractors: ['it flies', 'it hops', 'it swims only'] },
  { emoji: '🐘', prompt: 'Which animal is the biggest?', answer: 'elephant', distractors: ['cat', 'mouse', 'chicken'] },
];

const PLANTS: Fact[] = [
  { emoji: '🌱', prompt: 'What does a plant need to grow?', answer: 'water and sunlight', distractors: ['candy', 'toys', 'ice cream'] },
  { emoji: '🌳', prompt: 'Which part of the tree is under the ground?', answer: 'roots', distractors: ['leaves', 'flowers', 'fruit'] },
  { emoji: '🌸', prompt: 'Which part of the plant is this?', answer: 'flower', distractors: ['root', 'stem', 'seed'] },
  { emoji: '🍃', prompt: 'Which part of the plant is this?', answer: 'leaf', distractors: ['root', 'fruit', 'seed'] },
  { emoji: '🌰', prompt: 'A plant starts from a…', answer: 'seed', distractors: ['rock', 'leaf', 'cloud'] },
  { emoji: '🍎🌳', prompt: 'Where do apples grow?', answer: 'on trees', distractors: ['under water', 'in the sky', 'in a car'] },
  { emoji: '🌻☀️', prompt: 'Plants make food using…', answer: 'sunlight', distractors: ['moonlight', 'music', 'sand'] },
  { emoji: '🥕', prompt: 'A carrot is a…', answer: 'root we can eat', distractors: ['flower', 'leaf', 'seed'] },
  { emoji: '🍚🌾', prompt: 'Rice comes from a…', answer: 'plant', distractors: ['fish', 'rock', 'cow'] },
  { emoji: '🌴', prompt: 'Which tree gives us coconuts?', answer: 'coconut tree', distractors: ['mango tree', 'pine tree', 'rose bush'] },
];

const BODY: Fact[] = [
  { emoji: '👀', prompt: 'We use our eyes to…', answer: 'see', distractors: ['hear', 'smell', 'taste'] },
  { emoji: '👂', prompt: 'We use our ears to…', answer: 'hear', distractors: ['see', 'taste', 'walk'] },
  { emoji: '👃', prompt: 'We use our nose to…', answer: 'smell', distractors: ['see', 'hear', 'jump'] },
  { emoji: '👅', prompt: 'We use our tongue to…', answer: 'taste', distractors: ['see', 'hear', 'run'] },
  { emoji: '✋', prompt: 'We use our hands to…', answer: 'hold things', distractors: ['smell', 'hear', 'see'] },
  { emoji: '🦶', prompt: 'We use our feet to…', answer: 'walk', distractors: ['taste', 'smell', 'hear'] },
  { emoji: '🦷', prompt: 'We use our teeth to…', answer: 'chew food', distractors: ['see', 'hear', 'run'] },
  { emoji: '❤️', prompt: 'Which part pumps blood?', answer: 'heart', distractors: ['nose', 'foot', 'ear'] },
  { emoji: '🫁', prompt: 'We breathe with our…', answer: 'lungs', distractors: ['hands', 'feet', 'teeth'] },
  { emoji: '🧠', prompt: 'Which part helps us think?', answer: 'brain', distractors: ['toe', 'knee', 'hair'] },
  { emoji: '🪥', prompt: 'To keep teeth healthy we…', answer: 'brush them', distractors: ['eat candy all day', 'never brush', 'hide them'] },
  { emoji: '🧼', prompt: 'Before eating we should…', answer: 'wash our hands', distractors: ['run outside', 'sleep', 'shout'] },
];

const WEATHER: Fact[] = [
  { emoji: '☀️', prompt: 'What is the weather?', answer: 'sunny', distractors: ['rainy', 'snowy', 'stormy'] },
  { emoji: '🌧️', prompt: 'What is the weather?', answer: 'rainy', distractors: ['sunny', 'windy', 'snowy'] },
  { emoji: '☁️', prompt: 'What is the weather?', answer: 'cloudy', distractors: ['sunny', 'rainy', 'stormy'] },
  { emoji: '🌬️', prompt: 'What is the weather?', answer: 'windy', distractors: ['rainy', 'sunny', 'foggy'] },
  { emoji: '⛈️', prompt: 'What is the weather?', answer: 'stormy', distractors: ['sunny', 'cloudy', 'windy'] },
  { emoji: '🌧️☂️', prompt: 'When it rains, we use…', answer: 'an umbrella', distractors: ['sunglasses', 'a kite', 'a fan'] },
  { emoji: '☀️🧢', prompt: 'When it is sunny and hot, we wear…', answer: 'a cap', distractors: ['a raincoat', 'boots', 'a jacket'] },
  { emoji: '🌈', prompt: 'After the rain, we may see a…', answer: 'rainbow', distractors: ['snowman', 'moon', 'star'] },
  { emoji: '🌪️', prompt: 'A typhoon has strong…', answer: 'wind and rain', distractors: ['snow', 'sunshine', 'sand'] },
  { emoji: '🌡️', prompt: 'A thermometer tells us if it is…', answer: 'hot or cold', distractors: ['loud or quiet', 'big or small', 'day or night'] },
];

const ENVIRONMENT: Fact[] = [
  { emoji: '🗑️', prompt: 'Where do we put trash?', answer: 'in the trash can', distractors: ['on the floor', 'in the river', 'on the road'] },
  { emoji: '💧🚰', prompt: 'To save water we should…', answer: 'turn off the tap', distractors: ['leave it running', 'break it', 'hide it'] },
  { emoji: '🌳', prompt: 'Trees give us…', answer: 'clean air and shade', distractors: ['noise', 'trash', 'cars'] },
  { emoji: '♻️', prompt: 'This sign means…', answer: 'recycle', distractors: ['stop', 'sleep', 'eat'] },
  { emoji: '🌊', prompt: 'Fish need the sea to be…', answer: 'clean', distractors: ['dirty', 'dry', 'hot'] },
  { emoji: '🔌', prompt: 'When we leave a room, we should…', answer: 'turn off the lights', distractors: ['turn on all lights', 'open the fridge', 'shout'] },
  { emoji: '🌱', prompt: 'Planting trees helps the…', answer: 'Earth', distractors: ['moon', 'television', 'car'] },
  { emoji: '🐢', prompt: 'Plastic in the sea can hurt…', answer: 'sea animals', distractors: ['cars', 'houses', 'books'] },
  { emoji: '☀️🌙', prompt: 'When the sun goes down it becomes…', answer: 'night', distractors: ['morning', 'noon', 'summer'] },
  { emoji: '🏔️', prompt: 'Which is a landform?', answer: 'mountain', distractors: ['river', 'sea', 'lake'] },
];

export const SCIENCE: LearningSubject = {
  key: 'science',
  name: 'Science',
  emoji: '🔬',
  color: '#BDF0EA',
  activities: [
    factActivity('science.animals', 'Animals', '🐾', 'Names, homes and what animals can do.', ANIMALS),
    factActivity('science.plants', 'Plants', '🌱', 'Parts of a plant and what plants need.', PLANTS),
    factActivity('science.body', 'My body', '🧍', 'Body parts and the five senses.', BODY),
    factActivity('science.weather', 'Weather', '🌦️', 'Sunny, rainy, windy, stormy.', WEATHER),
    factActivity('science.environment', 'Our environment', '🌍', 'Taking care of the Earth.', ENVIRONMENT),
  ],
};
