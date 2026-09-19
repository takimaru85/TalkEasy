import { QUESTIONS_PER_SESSION as N, fromBank, mcq } from '../engine';
import type { LearningActivity, LearningSubject, Option } from '../types';

interface Situation {
  emoji: string;
  prompt: string;
  answer: string;
  distractors: string[];
  explain?: string;
}

function situationActivity(key: string, title: string, emoji: string, description: string, bank: Situation[]): LearningActivity {
  return {
    key,
    subjectKey: 'esp',
    title,
    emoji,
    description,
    generate: (d, rng) =>
      fromBank(rng, bank, N, (s) =>
        mcq(rng, d, s.prompt, { label: s.answer }, s.distractors.map((x): Option => ({ label: x })), {
          promptEmoji: s.emoji,
          explain: s.explain ?? `Yes! ${s.answer}.`,
        }),
      ),
  };
}

const MANNERS: Situation[] = [
  { emoji: '🎁', prompt: 'Someone gives you a gift. You say…', answer: 'Thank you', distractors: ['Go away', 'Nothing', 'Give me more'] },
  { emoji: '🙏', prompt: 'You want something. You say…', answer: 'Please', distractors: ['Now!', 'Hurry', 'Mine!'] },
  { emoji: '😔', prompt: 'You bumped into a friend by accident. You say…', answer: 'I am sorry', distractors: ['Move!', 'Ha ha', 'It was you'] },
  { emoji: '👋', prompt: 'You see your teacher in the morning. You say…', answer: 'Good morning', distractors: ['Bye', 'Nothing', 'Hey you'] },
  { emoji: '👵🤲', prompt: 'You greet Lola with respect by doing…', answer: 'mano po', distractors: ['a jump', 'a shout', 'nothing'] },
  { emoji: '🍽️', prompt: 'At the table, we chew with our mouth…', answer: 'closed', distractors: ['open', 'full and talking', 'noisy'] },
  { emoji: '🤫', prompt: 'When the teacher is talking, we…', answer: 'listen quietly', distractors: ['talk loudly', 'run around', 'sleep'] },
  { emoji: '🚪', prompt: 'Before entering a room, we…', answer: 'knock and say excuse me', distractors: ['kick the door', 'shout', 'hide'] },
  { emoji: '✋', prompt: 'If you want to speak in class, you…', answer: 'raise your hand', distractors: ['shout', 'stand on the chair', 'leave'] },
  { emoji: '🗣️', prompt: 'When talking to elders we say…', answer: 'po and opo', distractors: ['hey', 'nothing', 'oi'] },
];

const SHARING: Situation[] = [
  { emoji: '🖍️', prompt: 'Your friend has no crayons. You…', answer: 'share your crayons', distractors: ['hide them', 'laugh', 'say no'] },
  { emoji: '🍪', prompt: 'You have two cookies and your sister has none. You…', answer: 'give her one', distractors: ['eat both', 'hide them', 'throw one'] },
  { emoji: '🧸', prompt: 'Two friends want the same toy. They should…', answer: 'take turns', distractors: ['fight', 'break it', 'cry'] },
  { emoji: '☂️', prompt: 'It is raining and your classmate has no umbrella. You…', answer: 'share your umbrella', distractors: ['run away', 'laugh', 'ignore'] },
  { emoji: '📚', prompt: 'Sharing means…', answer: 'letting others use what you have', distractors: ['keeping everything', 'taking things', 'hiding things'] },
  { emoji: '🎮', prompt: 'When you share, your friends feel…', answer: 'happy', distractors: ['sad', 'angry', 'scared'] },
  { emoji: '🍱', prompt: 'A classmate forgot lunch. You can…', answer: 'share some food', distractors: ['eat in front of them', 'tease', 'ignore'] },
  { emoji: '🖍️➡️', prompt: 'After borrowing something, you…', answer: 'return it and say thank you', distractors: ['keep it', 'lose it', 'break it'] },
];

const RESPECT: Situation[] = [
  { emoji: '👵', prompt: 'An old lady is standing in the jeepney. You…', answer: 'offer your seat', distractors: ['look away', 'laugh', 'push'] },
  { emoji: '🧑‍🏫', prompt: 'Respecting the teacher means…', answer: 'listening and following rules', distractors: ['shouting', 'running out', 'ignoring'] },
  { emoji: '🚫🗣️', prompt: 'Someone is different from you. You should…', answer: 'be kind', distractors: ['tease', 'laugh', 'stay away'] },
  { emoji: '🎒', prompt: 'You find a bag that is not yours. You…', answer: 'give it to the teacher', distractors: ['keep it', 'hide it', 'open and take things'] },
  { emoji: '🙊', prompt: 'A friend is talking. You…', answer: 'wait for your turn', distractors: ['interrupt', 'shout', 'walk away'] },
  { emoji: '🏳️', prompt: 'During the flag ceremony we…', answer: 'stand straight and stay quiet', distractors: ['play', 'sit and talk', 'run'] },
  { emoji: '🏡', prompt: 'At home we respect our parents by…', answer: 'obeying and helping', distractors: ['ignoring them', 'shouting', 'hiding'] },
  { emoji: '🧑‍🦽', prompt: 'A classmate uses a wheelchair. You…', answer: 'include them in games', distractors: ['leave them out', 'stare', 'tease'] },
];

const HELPING: Situation[] = [
  { emoji: '🧹', prompt: 'Mom is cleaning the house. You…', answer: 'help her', distractors: ['make a mess', 'watch TV', 'go out'] },
  { emoji: '📚', prompt: 'A classmate dropped their books. You…', answer: 'help pick them up', distractors: ['laugh', 'walk past', 'kick them'] },
  { emoji: '😢', prompt: 'A friend is crying. You…', answer: 'ask if they are okay', distractors: ['laugh', 'ignore', 'walk away'] },
  { emoji: '🌱', prompt: 'Helping at home can be…', answer: 'watering the plants', distractors: ['breaking a pot', 'sleeping all day', 'throwing toys'] },
  { emoji: '🧑‍🦯', prompt: 'A blind person wants to cross the street. You…', answer: 'ask if they need help', distractors: ['run', 'laugh', 'ignore'] },
  { emoji: '🍽️', prompt: 'After eating, you can help by…', answer: 'clearing the table', distractors: ['leaving the plates', 'throwing food', 'running off'] },
  { emoji: '🐶', prompt: 'A hungry dog needs…', answer: 'food and water', distractors: ['a scary noise', 'to be chased', 'nothing'] },
  { emoji: '🧒', prompt: 'A new student is alone at recess. You…', answer: 'invite them to play', distractors: ['ignore them', 'laugh', 'tell them to go away'] },
];

const EMOTIONS: Situation[] = [
  { emoji: '😊', prompt: 'How does this face feel?', answer: 'happy', distractors: ['sad', 'angry', 'scared'] },
  { emoji: '😢', prompt: 'How does this face feel?', answer: 'sad', distractors: ['happy', 'angry', 'sleepy'] },
  { emoji: '😠', prompt: 'How does this face feel?', answer: 'angry', distractors: ['happy', 'sad', 'sleepy'] },
  { emoji: '😨', prompt: 'How does this face feel?', answer: 'scared', distractors: ['happy', 'proud', 'sleepy'] },
  { emoji: '😴', prompt: 'How does this face feel?', answer: 'sleepy', distractors: ['angry', 'surprised', 'happy'] },
  { emoji: '😮', prompt: 'How does this face feel?', answer: 'surprised', distractors: ['sleepy', 'sad', 'angry'] },
  { emoji: '😠🧘', prompt: 'When you feel angry, you can…', answer: 'take deep breaths', distractors: ['hit', 'throw things', 'scream'] },
  { emoji: '😢🗣️', prompt: 'When you feel sad, it helps to…', answer: 'tell someone you trust', distractors: ['hide it', 'break a toy', 'run away'] },
  { emoji: '😊🎉', prompt: 'When a friend wins, you feel…', answer: 'happy for them', distractors: ['angry', 'jealous', 'bored'] },
  { emoji: '😨👩', prompt: 'When you feel scared you can…', answer: 'ask for help', distractors: ['hide forever', 'shout', 'do nothing'] },
];

export const ESP: LearningSubject = {
  key: 'esp',
  name: 'ESP / Values',
  emoji: '💗',
  color: '#FFC9DC',
  activities: [
    situationActivity('esp.manners', 'Good manners', '🙏', 'Please, thank you, po and opo.', MANNERS),
    situationActivity('esp.sharing', 'Sharing', '🤝', 'Sharing with friends and family.', SHARING),
    situationActivity('esp.respect', 'Respect', '🙇', 'Respect for elders, teachers and friends.', RESPECT),
    situationActivity('esp.helping', 'Helping others', '💪', 'Ways to help at home and school.', HELPING),
    situationActivity('esp.emotions', 'Emotions', '😊', 'Naming feelings and what to do with them.', EMOTIONS),
  ],
};
