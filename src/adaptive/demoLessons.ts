import type { LessonActivityInput, LessonInput } from './types';

/**
 * Demo lessons seeded on first launch (and once on upgrade) so the Adaptive Learning section
 * works immediately. Each lesson shows how a normal school lesson becomes an accessible one:
 * the objective stays, the answer METHOD is flexible. Parents/teachers edit or replace these.
 */
export interface DemoLesson {
  subjectName: string;
  lesson: Omit<LessonInput, 'subjectId'>;
  activities: LessonActivityInput[];
}

const easy = 'easy' as const;

export const DEMO_LESSONS: DemoLesson[] = [
  {
    subjectName: 'Science',
    lesson: {
      title: 'What plants need',
      gradeLevel: 'Grade 2',
      content: 'Plants need sunlight, water and air to make their own food. This is called photosynthesis.',
      vocabulary: ['☀️ Sunlight', '💧 Water', '🌬️ Air'],
      objectives: 'Name what a plant needs to grow.',
      assignedDate: null,
      isActive: true,
    },
    activities: [
      {
        type: 'mcq', question: 'What does a plant need to grow?', image: '🌱',
        choices: [{ label: 'Sunlight', emoji: '☀️', correct: true }, { label: 'Shoes', emoji: '👟', correct: false }, { label: 'Television', emoji: '📺', correct: false }, { label: 'Cars', emoji: '🚗', correct: false }],
        pairs: [], answers: [], hint: 'It comes from the sky in the daytime.', difficulty: easy, allowedMethods: ['tap', 'speak', 'type', 'assisted'],
      },
      {
        type: 'picture', question: 'Which one does a plant drink?', image: null,
        choices: [{ label: 'Water', emoji: '💧', correct: true }, { label: 'Juice', emoji: '🧃', correct: false }, { label: 'Milk', emoji: '🥛', correct: false }],
        pairs: [], answers: [], hint: 'Rain gives plants this.', difficulty: easy, allowedMethods: ['picture', 'speak', 'assisted'],
      },
      {
        type: 'speaking', question: 'Tell me three things plants need.', image: '🌱',
        choices: [{ label: 'Sunlight', emoji: '☀️', correct: true }, { label: 'Water', emoji: '💧', correct: true }, { label: 'Air', emoji: '🌬️', correct: true }, { label: 'Shoes', emoji: '👟', correct: false }, { label: 'Car', emoji: '🚗', correct: false }],
        pairs: [], answers: ['sunlight', 'water', 'air', 'sun'], hint: 'Sun, rain, wind…', difficulty: easy, allowedMethods: ['speak', 'tap', 'type', 'write', 'assisted'],
      },
      {
        type: 'matching', question: 'Match the plant part to its job.', image: null, choices: [],
        pairs: [{ left: 'Roots', leftEmoji: '🌱', right: 'Drink water' }, { left: 'Leaves', leftEmoji: '🍃', right: 'Catch sunlight' }, { left: 'Flower', leftEmoji: '🌸', right: 'Makes seeds' }],
        answers: [], hint: 'Roots are under the ground.', difficulty: easy, allowedMethods: ['match', 'assisted'],
      },
    ],
  },
  {
    subjectName: 'Mathematics',
    lesson: {
      title: 'Adding to 10',
      gradeLevel: 'Grade 2',
      content: 'When we add, we put groups together and count them all. 5 + 5 = 10.',
      vocabulary: ['➕ Add', '🟰 Equals', '🔟 Ten'],
      objectives: 'Add two numbers with a total of 10 or less.',
      assignedDate: null,
      isActive: true,
    },
    activities: [
      {
        type: 'speaking', question: 'What is 5 + 5?', image: '🖐️🖐️',
        choices: [{ label: '10', correct: true }, { label: '8', correct: false }, { label: '12', correct: false }],
        pairs: [], answers: ['10', 'ten'], hint: 'Count all your fingers.', difficulty: easy, allowedMethods: ['speak', 'tap', 'type', 'write', 'assisted'],
      },
      {
        type: 'mcq', question: '3 + 4 = ?', image: '🍎🍎🍎 ➕ 🍎🍎🍎🍎',
        choices: [{ label: '7', correct: true }, { label: '6', correct: false }, { label: '8', correct: false }, { label: '5', correct: false }],
        pairs: [], answers: ['7', 'seven'], hint: 'Count the apples.', difficulty: easy, allowedMethods: ['tap', 'speak', 'type', 'assisted'],
      },
      {
        type: 'typing', question: 'Type the answer: 6 + 2 = ?', image: null,
        choices: [{ label: '8', correct: true }, { label: '9', correct: false }, { label: '7', correct: false }],
        pairs: [], answers: ['8', 'eight'], hint: 'Start at 6 and count two more.', difficulty: easy, allowedMethods: ['type', 'tap', 'speak', 'write', 'assisted'],
      },
    ],
  },
  {
    subjectName: 'English',
    lesson: {
      title: 'Animal sounds',
      gradeLevel: 'Grade 2',
      content: 'Animals make different sounds. A dog says woof. A cat says meow. A cow says moo.',
      vocabulary: ['🐶 Dog — woof', '🐱 Cat — meow', '🐮 Cow — moo'],
      objectives: 'Match animals to their sounds and name a mammal.',
      assignedDate: null,
      isActive: true,
    },
    activities: [
      {
        type: 'matching', question: 'Match the animal with its sound.', image: null, choices: [],
        pairs: [{ left: 'Dog', leftEmoji: '🐶', right: 'Woof' }, { left: 'Cat', leftEmoji: '🐱', right: 'Meow' }, { left: 'Cow', leftEmoji: '🐮', right: 'Moo' }],
        answers: [], hint: 'Think of the sound each one makes.', difficulty: easy, allowedMethods: ['match', 'assisted'],
      },
      {
        type: 'picture', question: 'Which one is a mammal?', image: null,
        choices: [{ label: 'Dog', emoji: '🐶', correct: true }, { label: 'Fish', emoji: '🐟', correct: false }, { label: 'Snake', emoji: '🐍', correct: false }],
        pairs: [], answers: ['dog'], hint: 'Mammals have fur and drink milk when they are babies.', difficulty: easy, allowedMethods: ['picture', 'speak', 'assisted'],
      },
      {
        type: 'writing', question: 'Write the word: cat', image: '🐱',
        choices: [], pairs: [], answers: ['cat'], hint: 'c – a – t', difficulty: easy, allowedMethods: ['write', 'type', 'speak', 'assisted'],
      },
    ],
  },
  {
    subjectName: 'Filipino',
    lesson: {
      title: 'Mga hayop (Animals)',
      gradeLevel: 'Grade 2',
      content: 'Aso ang tawag sa dog. Pusa ang tawag sa cat. Ibon ang tawag sa bird.',
      vocabulary: ['🐶 Aso', '🐱 Pusa', '🐦 Ibon'],
      objectives: 'Recognise Filipino words for common animals.',
      assignedDate: null,
      isActive: true,
    },
    activities: [
      {
        type: 'picture', question: 'Alin ang aso?', image: null,
        choices: [{ label: 'Aso', emoji: '🐶', correct: true }, { label: 'Pusa', emoji: '🐱', correct: false }, { label: 'Ibon', emoji: '🐦', correct: false }],
        pairs: [], answers: ['aso', 'dog'], hint: 'Aso means dog.', difficulty: easy, allowedMethods: ['picture', 'speak', 'assisted'],
      },
      {
        type: 'mcq', question: 'Ano ang tawag sa cat?', image: '🐱',
        choices: [{ label: 'Pusa', correct: true }, { label: 'Aso', correct: false }, { label: 'Isda', correct: false }],
        pairs: [], answers: ['pusa'], hint: 'It starts with P.', difficulty: easy, allowedMethods: ['tap', 'speak', 'type', 'assisted'],
      },
    ],
  },
];
