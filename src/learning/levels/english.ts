import { mcq } from '../engine';
import type { Option } from '../types';
import { PICTURE_WORDS } from '../content/english';
import { parseFacts, topicLevels, type LevelDef } from './bank';

const LETTER_WORDS: [string, string, string][] = [
  ['A', 'apple', '🍎'], ['B', 'ball', '⚽'], ['C', 'cat', '🐱'], ['D', 'dog', '🐶'], ['E', 'egg', '🥚'], ['F', 'fish', '🐟'],
  ['G', 'goat', '🐐'], ['H', 'hat', '🎩'], ['I', 'ice cream', '🍦'], ['J', 'jam', '🫙'], ['K', 'kite', '🪁'], ['L', 'lion', '🦁'],
  ['M', 'moon', '🌙'], ['N', 'nest', '🪺'], ['O', 'orange', '🍊'], ['P', 'pig', '🐷'], ['Q', 'queen', '👸'], ['R', 'rain', '🌧️'],
  ['S', 'sun', '☀️'], ['T', 'tree', '🌳'], ['U', 'umbrella', '☂️'], ['V', 'van', '🚐'], ['W', 'water', '💧'], ['X', 'box', '📦'],
  ['Y', 'yarn', '🧶'], ['Z', 'zebra', '🦓'],
];
const ALPHABET = LETTER_WORDS.map((l) => l[0]);

const RHYMES = parseFacts([
  'Which word rhymes with cat?|hat|dog|sun|bed|🐱',
  'Which word rhymes with sun?|run|cat|pen|top|☀️',
  'Which word rhymes with bed?|red|bag|pig|cup|🛏️',
  'Which word rhymes with pig?|big|pen|bus|fan|🐷',
  'Which word rhymes with hop?|top|hen|bat|sit|🐰',
  'Which word rhymes with fan?|man|fox|bed|lip|',
  'Which word rhymes with bug?|hug|bat|hen|pot|🐛',
  'Which word rhymes with dog?|log|cat|pin|mud|🐶',
  'Which word rhymes with ten?|hen|dot|jam|bus|🔟',
  'Which word rhymes with cake?|lake|dog|sock|ball|🎂',
  'Which word rhymes with star?|car|moon|tree|bird|⭐',
  'Which word rhymes with ball?|wall|bat|toy|fish|⚽',
  'Which word rhymes with boat?|coat|bike|road|shoe|⛵',
  'Which word rhymes with rain?|train|sun|wind|snow|🌧️',
  'Which word rhymes with bee?|tree|bug|ant|fly|🐝',
  'Which word rhymes with moon?|spoon|sun|star|sky|🌙',
  'Which word rhymes with king?|ring|queen|crown|castle|🤴',
  'Which word rhymes with bear?|chair|cub|paw|fur|🐻',
  'Which word rhymes with mouse?|house|cat|cheese|tail|🐭',
  'Which word rhymes with night?|light|dark|moon|bed|🌃',
  'Which word rhymes with snail?|tail|shell|slow|slug|🐌',
  'Which word rhymes with clock?|sock|time|watch|hour|🕐',
  'Which word rhymes with nose?|rose|face|smell|eye|👃',
  'Which word rhymes with fish?|dish|swim|fin|sea|🐟',
]);

const OPPOSITES = parseFacts([
  'The opposite of hot is…|cold|warm|wet|big|🔥',
  'The opposite of big is…|small|tall|long|fat|🐘',
  'The opposite of up is…|down|over|high|out|⬆️',
  'The opposite of day is…|night|noon|sun|light|☀️',
  'The opposite of happy is…|sad|glad|fun|kind|😊',
  'The opposite of open is…|closed|wide|empty|full|🚪',
  'The opposite of fast is…|slow|quick|late|far|🐇',
  'The opposite of full is…|empty|heavy|round|big|🥛',
  'The opposite of old is…|new|tall|long|dry|👴',
  'The opposite of tall is…|short|small|thin|low|🦒',
  'The opposite of wet is…|dry|cold|hot|soft|💧',
  'The opposite of in is…|out|up|on|off|📦',
  'The opposite of hard is…|soft|heavy|loud|cold|🪨',
  'The opposite of light (not heavy) is…|heavy|dark|slow|thin|🪶',
  'The opposite of loud is…|quiet|noisy|big|fast|🔊',
  'The opposite of clean is…|dirty|neat|new|wet|🧼',
  'The opposite of near is…|far|close|here|low|📍',
  'The opposite of laugh is…|cry|smile|jump|sing|😂',
  'The opposite of come is…|go|stay|run|walk|👋',
  'The opposite of start is…|stop|go|run|play|🏁',
  'The opposite of long is…|short|tall|wide|thin|📏',
  'The opposite of sweet is…|sour|soft|hot|fresh|🍬',
  'The opposite of push is…|pull|lift|drop|throw|🚪',
  'The opposite of awake is…|asleep|up|tired|busy|😴',
]);

const PLURALS = parseFacts([
  'One dog, two…|dogs|dog|doges|dogz|🐶🐶',
  'One cat, three…|cats|cat|cates|catz|🐱🐱🐱',
  'One book, two…|books|book|bookes|bookz|📖📖',
  'One egg, two…|eggs|egg|egges|eggz|🥚🥚',
  'One bus, two…|buses|bus|buss|busz|🚌🚌',
  'One box, two…|boxes|box|boxs|boxz|📦📦',
  'One fish, two…|fish|fishes|fishs|fishy|🐟🐟',
  'One child, two…|children|childs|childes|child|🧒🧒',
  'One man, two…|men|mans|manes|mens|👨👨',
  'One foot, two…|feet|foots|feets|footes|🦶🦶',
  'One tooth, many…|teeth|tooths|toothes|teeths|🦷',
  'One mouse, two…|mice|mouses|mices|mouse|🐭🐭',
  'One bird, two…|birds|bird|birdes|birdz|🐦🐦',
  'One tree, many…|trees|tree|treez|treees|🌳🌳🌳',
  'One dish, two…|dishes|dishs|dish|dishies|🍽️🍽️',
  'One cup, two…|cups|cup|cupes|cupz|☕☕',
  'One baby, two…|babies|babys|babyes|baby|👶👶',
  'One leaf, many…|leaves|leafs|leafes|leav|🍃🍃',
  'One watch, two…|watches|watchs|watch|watchies|⌚⌚',
  'One star, many…|stars|star|stares|starz|⭐⭐⭐',
  'One pig, two…|pigs|pig|piges|pigz|🐷🐷',
  'One hat, two…|hats|hat|hates|hatz|🎩🎩',
  'One bee, many…|bees|bee|beez|beeses|🐝🐝🐝',
  'One shoe, two…|shoes|shoe|shoees|shoez|👟👟',
]);

const ACTIONS = parseFacts([
  'Birds can…|fly|swim|drive|read|🐦',
  'Fish can…|swim|walk|fly|dig|🐟',
  'I use my eyes to…|see|hear|smell|taste|👀',
  'I use my ears to…|hear|see|smell|touch|👂',
  'I use my nose to…|smell|hear|see|taste|👃',
  'A frog can…|jump|fly|bark|sing|🐸',
  'We kick a…|ball|cloud|song|wind|⚽',
  'Mom will cook the…|rice|moon|sky|wind|🍚',
  'I brush my…|teeth|dog|chair|door|🪥',
  'We read a…|book|spoon|shoe|rock|📖',
  'Dad can drive a…|car|cloud|egg|pen|🚗',
  'A baby can…|cry|fly|drive|cook|👶',
  'I wash my…|hands|moon|roof|road|🧼',
  'The sun will…|shine|bark|swim|jump|☀️',
  'Fire is…|hot|cold|wet|soft|🔥',
  'The bell will…|ring|bark|swim|grow|🔔',
  'A bee can…|buzz|bark|moo|roar|🐝',
  'Dogs can…|bark|moo|quack|meow|🐶',
  'Ducks can…|quack|roar|bark|meow|🦆',
  'We sing a…|song|chair|door|shoe|🎵',
  'The rain will…|fall|bark|run|sing|🌧️',
  'I drink…|milk|sand|paper|rock|🥛',
  'A cow says…|moo|woof|meow|quack|🐄',
  'I can write with a…|pen|cup|shoe|bed|🖊️',
]);

const SIGHT = parseFacts([
  'Find the word: the|the|then|she|toe|',
  'Find the word: and|and|end|any|an|',
  'Find the word: you|you|your|yes|toy|',
  'Find the word: was|was|saw|has|war|',
  'Find the word: said|said|sad|sid|slid|',
  'Find the word: are|are|ate|era|air|',
  'Find the word: they|they|them|then|the|',
  'Find the word: have|have|hove|save|hive|',
  'Find the word: with|with|wish|wit|will|',
  'Find the word: this|this|that|thus|his|',
  'Find the word: that|that|than|what|chat|',
  'Find the word: what|what|that|when|wait|',
  'Find the word: we|we|me|he|be|',
  'Find the word: my|my|me|by|may|',
  'Find the word: like|like|bike|lake|lick|',
  'Find the word: come|come|came|home|cone|',
  'Find the word: go|go|so|do|no|',
  'Find the word: look|look|book|lock|loop|',
  'Find the word: little|little|litter|lintel|brittle|',
  'Find the word: there|there|these|three|where|',
  'Find the word: where|where|there|were|wheel|',
  'Find the word: when|when|then|went|what|',
  'Find the word: could|could|would|cloud|should|',
  'Find the word: because|because|became|decause|beacon|',
]);

const SENTENCES = parseFacts([
  'The cat is ____ .|sleeping|blue|a car|wet|🐱💤',
  'I eat an ____ .|apple|chair|shoe|moon|🍎',
  'The sun is ____ .|hot|cold|wet|green|☀️',
  'Birds can ____ .|fly|swim|drive|read|🐦',
  'I sleep on a ____ .|bed|spoon|tree|fish|🛏️',
  'We drink ____ .|water|rocks|paper|shoes|💧',
  'The dog says ____ .|woof|meow|moo|quack|🐶',
  'I read a ____ .|book|ball|hat|cake|📖',
  'Fish live in ____ .|water|trees|cars|beds|🐟',
  'At night I see the ____ .|moon|sun|bus|egg|🌙',
  'I wear a ____ on my head.|hat|shoe|sock|bag|🎩',
  'The frog is ____ .|green|purple|square|loud|🐸',
  'My mom ____ me a hug.|gave|gaved|give|gives|🤗',
  'We ____ to school every day.|go|goes|gone|going|🏫',
  'The baby ____ in the crib.|sleeps|sleep|sleeping|slept|👶',
  'I ____ my teeth every morning.|brush|brushes|brushed|brushing|🪥',
  'The boy ____ a big red ball.|has|have|having|had|⚽',
  'She ____ a pretty song.|sings|sing|singing|sang|🎤',
  'They ____ in the park.|play|plays|playing|played|🛝',
  'The bird ____ in the sky.|flies|fly|flying|flew|🐦',
  'It ____ raining outside.|is|are|am|be|🌧️',
  'I ____ happy today.|am|is|are|be|😊',
  'He ____ a good friend.|is|are|am|be|🤝',
  'We ____ playing a game.|are|is|am|be|🎲',
]);

const READING = parseFacts([
  'Ben has a red ball. He kicks it high. What color is the ball?|red|blue|green|yellow|⚽',
  'Ana has a cat. The cat likes milk. What does the cat like?|milk|rice|juice|bread|🐱',
  'It is raining. Mia opens her umbrella. What does Mia open?|her umbrella|her bag|the door|a book|🌧️',
  'The bird sits in the tree. It sings a song. Where is the bird?|in the tree|in the car|on the bed|in the water|🐦',
  'Tom eats an apple. It is sweet. How does the apple taste?|sweet|salty|sour|hot|🍎',
  'Lola bakes a cake. The cake is big. What does Lola bake?|a cake|a fish|an egg|a pie|🎂',
  'The dog runs fast. It wants to play. What does the dog want?|to play|to sleep|to eat|to swim|🐶',
  'We go to school on the bus. The bus is yellow. How do we go to school?|on the bus|in a boat|on a bike|in a plane|🚌',
  'Rina has two pets. One is a fish. One is a bird. How many pets does Rina have?|two|one|three|four|🐟',
  'Papa plants a tree. Every day it gets water. What does the tree get?|water|candy|shoes|paper|🌳',
  'Jose is sad. He lost his toy. Why is Jose sad?|He lost his toy|It is raining|He is hungry|He is sleepy|😢',
  'The moon is out. Stars are in the sky. It is…|night|morning|noon|lunch|🌙',
  'Mimi puts on her coat. It is cold. Why does Mimi wear a coat?|It is cold|It is hot|It is fun|It is red|🧥',
  'Dan and Lea share a snack. They are kind. What do Dan and Lea do?|share|fight|hide|run|🍪',
  'A bee lands on a flower. It drinks the nectar. What does the bee drink?|nectar|milk|juice|water|🐝',
  'Kuya helps Ate carry the bag. He is helpful. What does Kuya do?|helps Ate|plays alone|sleeps|runs away|🎒',
  'The sun comes up. The rooster crows. It is…|morning|night|midnight|evening|🐓',
  'Lito has a new shirt. It is blue. What color is the shirt?|blue|red|pink|white|👕',
  'Maya feeds the hens. They say cluck cluck. What does Maya feed?|the hens|the cows|the fish|the dogs|🐔',
  'We wash our hands before we eat. Why do we wash?|to be clean|to be loud|to be sad|to sleep|🧼',
  'The boat floats on the sea. It has a white sail. What floats on the sea?|a boat|a car|a bed|a bike|⛵',
  'Grandma tells a story. We all listen. Who tells the story?|Grandma|Dad|the dog|the baby|👵',
  'Pedro rides a bike to the store. He buys bread. What does Pedro buy?|bread|a book|a shirt|a toy|🚲',
  'The snail is slow. The rabbit is fast. Who is fast?|the rabbit|the snail|the turtle|the worm|🐇',
]);

const GRAMMAR = parseFacts([
  'Pick the right word: ___ apple|an|a|the apple|two|🍎',
  'Pick the right word: ___ dog|a|an|many|are|🐶',
  'Pick the right word: ___ egg|an|a|two|are|🥚',
  'Pick the right word: ___ umbrella|an|a|two|the one|☂️',
  'Pick the right word: ___ book|a|an|many|is|📖',
  'The cats ___ sleeping.|are|is|am|be|🐱',
  'The bird ___ singing.|is|are|am|be|🐦',
  'I ___ a girl.|am|is|are|be|👧',
  'We ___ friends.|are|is|am|be|🤝',
  'He ___ my brother.|is|are|am|be|👦',
  'Which sentence starts with a capital letter?|The sun is hot.|the sun is hot.|tHe sun is hot.|the Sun is hot.|☀️',
  'Which sentence is written correctly?|My name is Ana.|my name is ana.|My Name is ana.|my name Is Ana.|🧒',
  'A sentence ends with a…|period|comma|letter|number|✏️',
  'A question ends with a…|question mark|period|comma|star|❓',
  'Which is a question?|Where is my hat?|I like my hat.|The hat is red.|Put on a hat.|🎩',
  'The ball is ___ the box.|in|at|of|so|⚽',
  'The cat is ___ the table.|under|and|but|if|🐱',
  'The bird is ___ the tree.|on|is|or|a|🐦',
  'Which word names a person?|teacher|table|apple|run|👩‍🏫',
  'Which word names a place?|school|pencil|jump|red|🏫',
  'Which word names an animal?|goat|chair|cup|read|🐐',
  'Which word tells what we do?|jump|chair|red|big|🤸',
  'Which word tells a color?|green|run|table|sing|🟢',
  'She is a girl. “She” means…|a girl|a boy|a dog|a table|👧',
]);

/** Ten topics x ten levels. Starting letters and picture words are built from the shared word lists. */
export function englishLevels(): LevelDef[] {
  const sub = 'english' as const;
  return [
    ...topicLevels({
      subject: sub, topicNo: 1, topic: 'Starting letters', emoji: '🔤', blurb: 'Which letter does the word start with?',
      make: (step, tier, rng) => {
        const from = ((step - 1) * 3) % LETTER_WORDS.length;
        const six = Array.from({ length: 6 }, (_, i) => LETTER_WORDS[(from + i) % LETTER_WORDS.length]);
        return rng.shuffle(six).map(([L, word, emoji]) =>
          mcq(rng, tier, `${word} starts with…`, { label: L }, ALPHABET.map((x): Option => ({ label: x })), {
            promptEmoji: emoji, speak: `${word}. Which letter does ${word} start with?`, explain: `Yes! ${L} is for ${word}.`,
          }),
        );
      },
    }),
    ...topicLevels({
      subject: sub, topicNo: 2, topic: 'Picture words', emoji: '🍎', blurb: 'See a picture, tap the word.',
      make: (step, tier, rng) => {
        const from = ((step - 1) * 3) % PICTURE_WORDS.length;
        const six = Array.from({ length: 6 }, (_, i) => PICTURE_WORDS[(from + i) % PICTURE_WORDS.length]);
        return rng.shuffle(six).map((item) =>
          mcq(rng, tier, 'What is this?', { label: item.word }, PICTURE_WORDS.map((w): Option => ({ label: w.word })), {
            promptEmoji: item.emoji, speak: 'What is this? Tap the word.', explain: `Yes! It is ${item.word}.`,
          }),
        );
      },
    }),
    ...topicLevels({ subject: sub, topicNo: 3, topic: 'Rhyming words', emoji: '🎵', blurb: 'Find the word that sounds the same at the end.', facts: RHYMES }),
    ...topicLevels({ subject: sub, topicNo: 4, topic: 'Opposites', emoji: '↔️', blurb: 'Hot and cold, up and down.', facts: OPPOSITES }),
    ...topicLevels({ subject: sub, topicNo: 5, topic: 'One and many', emoji: '🐶', blurb: 'One dog, two dogs.', facts: PLURALS }),
    ...topicLevels({ subject: sub, topicNo: 6, topic: 'Doing words', emoji: '🏃', blurb: 'What can we do?', facts: ACTIONS }),
    ...topicLevels({ subject: sub, topicNo: 7, topic: 'Sight words', emoji: '👀', blurb: 'Find the word you see most when you read.', facts: SIGHT }),
    ...topicLevels({ subject: sub, topicNo: 8, topic: 'Finish the sentence', emoji: '✏️', blurb: 'Pick the word that completes the sentence.', facts: SENTENCES }),
    ...topicLevels({ subject: sub, topicNo: 9, topic: 'Little stories', emoji: '📖', blurb: 'Listen to a short story, then answer.', facts: READING }),
    ...topicLevels({ subject: sub, topicNo: 10, topic: 'Grammar helpers', emoji: '🧩', blurb: 'a or an, is or are, capitals and full stops.', facts: GRAMMAR }),
  ];
}
