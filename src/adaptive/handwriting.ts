import type { Guide } from '@/components/adaptive/HandwritingCanvas';

/**
 * Handwriting / tracing practice content. Thirty-six levels from big strokes to short answers: lines, shapes,
 * letters, numbers, words, copying and writing. Levels 1-7 are the originals and keep their numbers, so what a
 * child already practised is still counted. Nothing here is graded — the purpose is motor practice and confidence.
 *
 * Every character a level asks the child to TRACE has a stroke-order arrow (`strokeOrder.ts`), so the traced words
 * below use only letters that have one. Copy and write levels need none: the child writes from the model.
 */
export interface WritingItem {
  /** What the child is asked to do (spoken aloud). */
  prompt: string;
  /** Big label shown above the canvas. */
  display: string;
  guide: Guide;
  /** For "copy" levels the model is shown above the canvas, not traced. */
  model?: string;
}

export interface WritingLevel {
  level: number;
  /** Which of the seven level pictures (`level:1`..`level:7`) the card wears. */
  art: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  emoji: string;
  description: string;
  items: WritingItem[];
}

const letters = (s: string) => s.split('').map((ch) => ({ prompt: `Trace the letter ${ch}`, display: ch, guide: { kind: 'text', text: ch } as Guide }));
const numbers = (s: string) => s.split('').map((ch) => ({ prompt: `Trace the number ${ch}`, display: ch, guide: { kind: 'text', text: ch } as Guide }));
const numberList = (n: string[]) => n.map((x) => ({ prompt: `Trace the number ${x}`, display: x, guide: { kind: 'text', text: x } as Guide }));
const traceWords = (w: string[]) => w.map((word) => ({ prompt: `Trace the word ${word}`, display: word, guide: { kind: 'text', text: word } as Guide }));
const copyWords = (w: string[]) => w.map((word) => ({ prompt: `Copy the word ${word}`, display: word, model: word, guide: { kind: 'none' } as Guide }));
const copyLetters = (s: string) => s.split('').map((ch) => ({ prompt: `Copy the letter ${ch}`, display: ch, model: ch, guide: { kind: 'none' } as Guide }));
const copyPhrases = (p: string[]) => p.map((x) => ({ prompt: `Copy ${x}`, display: x, model: x, guide: { kind: 'none' } as Guide }));
const writeAnswers = (rows: [string, string][]) => rows.map(([prompt, display]) => ({ prompt, display, guide: { kind: 'none' } as Guide }));

/** A later level. Its picture is one of the seven kinds: 3 letters, 4 numbers, 5 words, 6 copy, 7 write. */
const L = (level: number, title: string, emoji: string, description: string, art: WritingLevel['art'], items: WritingItem[]): WritingLevel => ({ level, art, title, emoji, description, items });

const LEVELS: WritingLevel[] = [
  {
    level: 1, art: 1, title: 'Trace lines', emoji: '〰️', description: 'Big strokes: across, down, zigzag, wave.',
    items: [
      { prompt: 'Trace the line across', display: '—', guide: { kind: 'line', variant: 'horizontal' } },
      { prompt: 'Trace the line down', display: '|', guide: { kind: 'line', variant: 'vertical' } },
      { prompt: 'Trace the slanted line', display: '/', guide: { kind: 'line', variant: 'diagonal' } },
      { prompt: 'Trace the zigzag', display: 'ᐱᐱ', guide: { kind: 'line', variant: 'zigzag' } },
      { prompt: 'Trace the wave', display: '〰️', guide: { kind: 'line', variant: 'wave' } },
    ],
  },
  {
    level: 2, art: 2, title: 'Trace shapes', emoji: '🔺', description: 'Circle, square, triangle.',
    items: [
      { prompt: 'Trace the circle', display: '○', guide: { kind: 'shape', variant: 'circle' } },
      { prompt: 'Trace the square', display: '□', guide: { kind: 'shape', variant: 'square' } },
      { prompt: 'Trace the triangle', display: '△', guide: { kind: 'shape', variant: 'triangle' } },
    ],
  },
  { level: 3, art: 3, title: 'Trace letters', emoji: '🔤', description: 'Big letters, then small letters.', items: [...letters('AOLTC'), ...letters('aoltc'), ...letters('BEMSD')] },
  { level: 4, art: 4, title: 'Trace numbers', emoji: '🔢', description: 'Numbers 0 to 9.', items: numbers('0123456789') },
  { level: 5, art: 5, title: 'Trace words', emoji: '📝', description: 'Short words with a guide.', items: traceWords(['cat', 'dog', 'sun', 'mom', 'dad', 'me']) },
  { level: 6, art: 6, title: 'Copy words', emoji: '✏️', description: 'Look at the word and write it.', items: copyWords(['cat', 'sun', 'red', 'big', 'aso', 'pusa']) },
  {
    level: 7, art: 7, title: 'Write answers', emoji: '💬', description: 'Short answers, any way you like.',
    items: [
      { prompt: 'Write your name', display: 'My name', guide: { kind: 'none' } },
      { prompt: 'Write how old you are', display: 'My age', guide: { kind: 'none' } },
      { prompt: 'Write one thing you like', display: 'I like…', guide: { kind: 'none' } },
      { prompt: 'Write 2 plus 2', display: '2 + 2 =', guide: { kind: 'none' } },
    ],
  },

  // ---- Levels 8-36: the long road. Each is short (3 to 8 items), so one level is a few minutes. ----
  L(8, 'Big letters A to E', '🅰️', 'Trace A, B, C, D and E.', 3, letters('ABCDE')),
  L(9, 'Big letters L to T', '🔠', 'Trace L, M, O, S and T.', 3, letters('LMOST')),
  L(10, 'Small letters a to g', '🔤', 'Trace a, c, d, e and g.', 3, letters('acdeg')),
  L(11, 'Small letters l to s', '🔡', 'Trace l, m, n, o and s.', 3, letters('lmnos')),
  L(12, 'Small letters t and u', '🔤', 'Trace t and u, then a few again.', 3, letters('tuoea')),
  L(13, 'Numbers 0 to 4', '🔢', 'Trace 0, 1, 2, 3 and 4.', 4, numbers('01234')),
  L(14, 'Numbers 5 to 9', '🔢', 'Trace 5, 6, 7, 8 and 9.', 4, numbers('56789')),
  L(15, 'Numbers 10 to 20', '🔟', 'Two-digit numbers to trace.', 4, numberList(['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'])),
  L(16, 'Words with c', '📝', 'cat, can, cut, cot.', 5, traceWords(['cat', 'can', 'cut', 'cot'])),
  L(17, 'Words with d', '📝', 'dad, dog, dot, den.', 5, traceWords(['dad', 'dog', 'dot', 'den'])),
  L(18, 'Words with e, g and l', '📝', 'egg, end, eat, leg, log.', 5, traceWords(['egg', 'end', 'eat', 'leg', 'log'])),
  L(19, 'Words with m', '📝', 'mom, man, men, mat, mud.', 5, traceWords(['mom', 'man', 'men', 'mat', 'mud'])),
  L(20, 'Words with n and o', '📝', 'nut, net, nod, oat.', 5, traceWords(['nut', 'net', 'nod', 'oat'])),
  L(21, 'Words with s', '📝', 'sat, sad, sun, set, sea.', 5, traceWords(['sat', 'sad', 'sun', 'set', 'sea'])),
  L(22, 'Words with t', '📝', 'tag, tan, ten, tug, ton.', 5, traceWords(['tag', 'tan', 'ten', 'tug', 'ton'])),
  L(23, 'Words with g, l and u', '📝', 'gum, gun, lot, lag, mug.', 5, traceWords(['gum', 'gun', 'lot', 'lag', 'mug'])),
  L(24, 'Longer words', '📝', 'seat, coat, goat, dust, last.', 5, traceWords(['seat', 'coat', 'goat', 'dust', 'last'])),
  L(25, 'Names with a capital', '🧒', 'Sam, Tom, Dan, Ted, Cam.', 5, traceWords(['Sam', 'Tom', 'Dan', 'Ted', 'Cam'])),
  L(26, 'Number words', '🔢', 'one, ten, tone, note.', 5, traceWords(['one', 'ten', 'tone', 'note'])),
  L(27, 'Copy big letters A to M', '✏️', 'Look at the letter and write it.', 6, copyLetters('ABCDEFGHIJKLM')),
  L(28, 'Copy big letters N to Z', '✏️', 'Look at the letter and write it.', 6, copyLetters('NOPQRSTUVWXYZ')),
  L(29, 'Copy small letters a to m', '✏️', 'Look at the letter and write it.', 6, copyLetters('abcdefghijklm')),
  L(30, 'Copy small letters n to z', '✏️', 'Look at the letter and write it.', 6, copyLetters('nopqrstuvwxyz')),
  L(31, 'Copy animal words', '🐟', 'dog, fish, bird, frog, duck, cat.', 6, copyWords(['dog', 'fish', 'bird', 'frog', 'duck', 'cat'])),
  L(32, 'Copy things words', '🏠', 'apple, house, tree, water, milk, cake.', 6, copyWords(['apple', 'house', 'tree', 'water', 'milk', 'cake'])),
  L(33, 'Copy little phrases', '💬', 'Short phrases to write.', 6, copyPhrases(['I am happy', 'I like cats', 'Thank you', 'Good morning', 'Come and play'])),
  L(34, 'Copy sentences', '📖', 'A whole sentence, one word at a time.', 6, copyPhrases(['The sun is hot.', 'I can run and play.', 'My mom is kind.', 'We eat and drink.'])),
  L(35, 'Write more answers', '💬', 'Write about you and your day.', 7, writeAnswers([
    ['Write your favorite color', 'My favorite color'],
    ['Write a friend’s name', 'My friend'],
    ['Write what you ate today', 'I ate…'],
    ['Write one animal you like', 'An animal I like'],
    ['Write where you live', 'I live in…'],
  ])),
  L(36, 'Write number answers', '➕', 'Write the answer to each little sum.', 7, writeAnswers([
    ['Write 1 plus 1', '1 + 1 ='],
    ['Write 3 plus 2', '3 + 2 ='],
    ['Write 5 minus 1', '5 − 1 ='],
    ['Write 10 minus 5', '10 − 5 ='],
    ['Write 4 plus 4', '4 + 4 ='],
  ])),

  // ---- Levels 37-100: every letter now has a stroke-order arrow, so the whole alphabet and any word can be traced. ----
  L(37, 'Big letters F to J', '🅱️', 'Trace F, G, H, I and J.', 3, letters('FGHIJ')),
  L(38, 'Big letters K to R', '🔠', 'Trace K, N, P, Q and R.', 3, letters('KNPQR')),
  L(39, 'Big letters U to Z', '🔠', 'Trace U, V, W, X, Y and Z.', 3, letters('UVWXYZ')),
  L(40, 'Small letters b to j', '🔡', 'Trace b, f, h, i and j.', 3, letters('bfhij')),
  L(41, 'Small letters k to v', '🔡', 'Trace k, p, q, r and v.', 3, letters('kpqrv')),
  L(42, 'Small letters w to z', '🔡', 'Trace w, x, y and z.', 3, letters('wxyz')),
  L(51, 'Letter pairs Aa to Ee', '🔤', 'A big and a small letter together.', 3, traceWords(['Aa', 'Bb', 'Cc', 'Dd', 'Ee'])),
  L(52, 'Letter pairs Ff to Jj', '🔤', 'A big and a small letter together.', 3, traceWords(['Ff', 'Gg', 'Hh', 'Ii', 'Jj'])),
  L(53, 'Letter pairs Kk to Oo', '🔤', 'A big and a small letter together.', 3, traceWords(['Kk', 'Ll', 'Mm', 'Nn', 'Oo'])),
  L(54, 'Letter pairs Pp to Tt', '🔤', 'A big and a small letter together.', 3, traceWords(['Pp', 'Qq', 'Rr', 'Ss', 'Tt'])),
  L(55, 'Letter pairs Uu to Zz', '🔤', 'A big and a small letter together.', 3, traceWords(['Uu', 'Vv', 'Ww', 'Xx', 'Yy', 'Zz'])),
  L(56, 'Numbers 21 to 30', '🔢', 'Count on and trace 21 to 30.', 4, numberList(['21', '22', '23', '24', '25', '26', '27', '28', '29', '30'])),
  L(57, 'Numbers 31 to 40', '🔢', 'Count on and trace 31 to 40.', 4, numberList(['31', '32', '33', '34', '35', '36', '37', '38', '39', '40'])),
  L(58, 'Numbers 41 to 50', '🔢', 'Count on and trace 41 to 50.', 4, numberList(['41', '42', '43', '44', '45', '46', '47', '48', '49', '50'])),
  L(59, 'Numbers 51 to 60', '🔢', 'Count on and trace 51 to 60.', 4, numberList(['51', '52', '53', '54', '55', '56', '57', '58', '59', '60'])),
  L(60, 'Numbers 61 to 70', '🔢', 'Count on and trace 61 to 70.', 4, numberList(['61', '62', '63', '64', '65', '66', '67', '68', '69', '70'])),
  L(61, 'Numbers 71 to 80', '🔢', 'Count on and trace 71 to 80.', 4, numberList(['71', '72', '73', '74', '75', '76', '77', '78', '79', '80'])),
  L(62, 'Numbers 81 to 90', '🔢', 'Count on and trace 81 to 90.', 4, numberList(['81', '82', '83', '84', '85', '86', '87', '88', '89', '90'])),
  L(63, 'Numbers 91 to 100', '🔢', 'Count on and trace 91 to 100.', 4, numberList(['91', '92', '93', '94', '95', '96', '97', '98', '99', '100'])),
  L(64, 'Counting by fives', '🖐️', '5, 10, 15 and on to 50.', 4, numberList(['5', '10', '15', '20', '25', '30', '35', '40', '45', '50'])),
  L(65, 'Counting by tens', '🔟', '10, 20, 30 and on to 100.', 4, numberList(['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'])),
  L(0, 'Counting down', '🚀', 'Blast off! 10 down to 1.', 4, numberList(['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'])),
  L(59, 'Words with b', '📝', 'bat, bed, big, box, bus.', 5, traceWords(['bat', 'bed', 'big', 'box', 'bus'])),
  L(60, 'Words with f', '📝', 'fan, fig, fox, fun, fur.', 5, traceWords(['fan', 'fig', 'fox', 'fun', 'fur'])),
  L(61, 'Words with h', '📝', 'hat, hen, hop, hug, hut.', 5, traceWords(['hat', 'hen', 'hop', 'hug', 'hut'])),
  L(62, 'Words with j and k', '📝', 'jam, jet, jog, kid, key.', 5, traceWords(['jam', 'jet', 'jog', 'kid', 'key'])),
  L(63, 'Words with p', '📝', 'pan, pen, pig, pot, pup.', 5, traceWords(['pan', 'pen', 'pig', 'pot', 'pup'])),
  L(64, 'Words with r and q', '📝', 'red, rat, run, rug, queen.', 5, traceWords(['red', 'rat', 'run', 'rug', 'queen'])),
  L(65, 'Words with v and w', '📝', 'van, vet, web, win, wet.', 5, traceWords(['van', 'vet', 'web', 'win', 'wet'])),
  L(66, 'Words with x, y and z', '📝', 'six, fix, yes, yam, zip, zoo.', 5, traceWords(['six', 'fix', 'yes', 'yam', 'zip', 'zoo'])),
  L(67, 'Family words', '👪', 'mom, dad, baby, sister, brother.', 5, traceWords(['mom', 'dad', 'baby', 'sister', 'brother'])),
  L(68, 'Farm animals', '🐄', 'cat, dog, pig, hen, cow.', 5, traceWords(['cat', 'dog', 'pig', 'hen', 'cow'])),
  L(69, 'More animals', '🐸', 'fish, duck, frog, bird, bear.', 5, traceWords(['fish', 'duck', 'frog', 'bird', 'bear'])),
  L(70, 'Colour words', '🎨', 'red, blue, pink, green, black.', 5, traceWords(['red', 'blue', 'pink', 'green', 'black'])),
  L(71, 'Food words', '🍎', 'milk, rice, egg, fish, bread.', 5, traceWords(['milk', 'rice', 'egg', 'fish', 'bread'])),
  L(72, 'Body words', '🖐️', 'hand, foot, nose, head, ear.', 5, traceWords(['hand', 'foot', 'nose', 'head', 'ear'])),
  L(73, 'School words', '🎒', 'book, desk, pen, bag, ruler.', 5, traceWords(['book', 'desk', 'pen', 'bag', 'ruler'])),
  L(74, 'Nature words', '🌳', 'sun, moon, star, tree, rain.', 5, traceWords(['sun', 'moon', 'star', 'tree', 'rain'])),
  L(75, 'Home words', '🏠', 'bed, door, chair, table, lamp.', 5, traceWords(['bed', 'door', 'chair', 'table', 'lamp'])),
  L(76, 'Action words', '🏃', 'run, jump, sit, walk, play.', 5, traceWords(['run', 'jump', 'sit', 'walk', 'play'])),
  L(77, 'Feeling words', '😊', 'happy, sad, kind, calm, brave.', 5, traceWords(['happy', 'sad', 'kind', 'calm', 'brave'])),
  L(78, 'Days of the week', '📅', 'Mon, Tue, Wed, Thu, Fri, Sat, Sun.', 5, traceWords(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])),
  L(79, 'Months', '🗓️', 'Jan, Feb, Mar, Apr, May.', 5, traceWords(['Jan', 'Feb', 'Mar', 'Apr', 'May'])),
  L(80, 'Names with a capital', '🧒', 'Ann, Ben, Eva, Leo, Max, Zoe.', 5, traceWords(['Ann', 'Ben', 'Eva', 'Leo', 'Max', 'Zoe'])),
  L(81, 'Copy little words', '✏️', 'the, and, you, are, was, said.', 6, copyWords(['the', 'and', 'you', 'are', 'was', 'said'])),
  L(82, 'Copy more little words', '✏️', 'they, have, with, this, that, what.', 6, copyWords(['they', 'have', 'with', 'this', 'that', 'what'])),
  L(83, 'Copy colour words', '🎨', 'yellow, orange, purple, brown, white.', 6, copyWords(['yellow', 'orange', 'purple', 'brown', 'white'])),
  L(84, 'Copy number words 1 to 6', '🔢', 'one, two, three, four, five, six.', 6, copyWords(['one', 'two', 'three', 'four', 'five', 'six'])),
  L(85, 'Copy number words 7 to 12', '🔢', 'seven, eight, nine, ten, eleven, twelve.', 6, copyWords(['seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'])),
  L(86, 'Copy school days', '📅', 'Monday to Friday.', 6, copyWords(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])),
  L(87, 'Copy weekend and months', '🗓️', 'Saturday, Sunday, January, March.', 6, copyWords(['Saturday', 'Sunday', 'January', 'February', 'March'])),
  L(88, 'Copy family sentences', '👪', 'Write about the people you love.', 6, copyPhrases(['I love my mom.', 'My dad is kind.', 'I have a sister.', 'We are a family.'])),
  L(89, 'Copy animal sentences', '🐶', 'Write about animals.', 6, copyPhrases(['The cat is soft.', 'A dog can run.', 'The bird can fly.', 'Fish swim in water.'])),
  L(90, 'Copy longer sentences', '📖', 'Take your time with each word.', 6, copyPhrases(['I like to read books.', 'We play at the park.', 'The moon is in the sky.', 'I can write my name.'])),
  L(91, 'Copy questions', '❓', 'Questions end with a question mark.', 6, copyPhrases(['What is your name?', 'How old are you?', 'Can I play too?', 'Where is my hat?'])),
  L(92, 'Copy a rhyme', '🎵', 'Old rhymes to copy.', 6, copyPhrases(['Twinkle, twinkle, little star', 'Row, row, row your boat', 'Humpty Dumpty sat on a wall'])),
  L(93, 'Write about me', '🙂', 'Short answers about you.', 7, writeAnswers([
    ['Write your name', 'My name is…'],
    ['Write how old you are', 'I am… years old'],
    ['Write your favorite game', 'My favorite game'],
    ['Write one thing you can do well', 'I can…'],
    ['Write how you feel today', 'Today I feel…'],
  ])),
  L(94, 'Write about food', '🍎', 'Say what you like to eat.', 7, writeAnswers([
    ['Write your favorite food', 'My favorite food'],
    ['Write a food you do not like', 'I do not like…'],
    ['Write what you drink', 'I drink…'],
    ['Write a fruit', 'A fruit'],
  ])),
  L(95, 'Write about animals', '🐾', 'Write about animals you know.', 7, writeAnswers([
    ['Write an animal that flies', 'An animal that flies'],
    ['Write an animal that swims', 'An animal that swims'],
    ['Write your favorite animal', 'My favorite animal'],
    ['Write what a dog says', 'A dog says…'],
  ])),
  L(96, 'Write about family', '👪', 'Write about the people you love.', 7, writeAnswers([
    ['Write the name of someone you love', 'Someone I love'],
    ['Write what you do with your family', 'With my family I…'],
    ['Write who helps you', 'Who helps me'],
    ['Write a friend’s name', 'My friend'],
  ])),
  L(97, 'Write number words', '🔢', 'Write the number as a word.', 7, writeAnswers([
    ['Write the word for 1', '1 ='],
    ['Write the word for 2', '2 ='],
    ['Write the word for 3', '3 ='],
    ['Write the word for 5', '5 ='],
    ['Write the word for 10', '10 ='],
  ])),
  L(98, 'Write bigger sums', '➕', 'Write the answer to each sum.', 7, writeAnswers([
    ['Write 6 plus 4', '6 + 4 ='],
    ['Write 8 plus 7', '8 + 7 ='],
    ['Write 12 minus 5', '12 − 5 ='],
    ['Write 20 minus 10', '20 − 10 ='],
    ['Write 3 plus 3 plus 3', '3 + 3 + 3 ='],
  ])),
  L(99, 'Write a sentence', '✍️', 'Put your words into a sentence.', 7, writeAnswers([
    ['Write a sentence about the sun', 'The sun…'],
    ['Write a sentence about your home', 'My home…'],
    ['Write a sentence about school', 'At school I…'],
    ['Write a sentence about your day', 'Today I…'],
  ])),
  L(100, 'Write a little story', '🏆', 'Your own words, any way you like. You did it!', 7, writeAnswers([
    ['Write who your story is about', 'My story is about…'],
    ['Write where your story happens', 'It happens at…'],
    ['Write what happens', 'Then…'],
    ['Write how your story ends', 'At the end…'],
  ])),
];

/** Numbered by position, so the road is always 1, 2, 3 ... in the order it is written here (the number given to `L` is only a note). */
export const WRITING_LEVELS: WritingLevel[] = LEVELS.map((l, i) => ({ ...l, level: i + 1 }));

export function getWritingLevel(level: number): WritingLevel | undefined {
  return WRITING_LEVELS.find((l) => l.level === level);
}
