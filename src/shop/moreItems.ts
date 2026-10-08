import type { ShopCategory, ShopItem, Rarity } from './catalog';

/**
 * THE BIG STICKER BOOK: over three hundred more keepsakes for the Rewards Shop. Like the first stickers and
 * trophies they are COLLECTIBLES ONLY: they change nothing about how TalkEasy works, can be worn as the badge
 * beside the child's name, and are paid for with stars from verified practice.
 *
 * Written as `emoji|Name` per group; this file turns them into `ShopItem`s. The picture is the emoji itself, so the
 * art is offline, always crisp and costs no bitmap. Prices rise with rarity: common 5-25 stars, rare 30-80, epic
 * 100-225 (trophies: rare 40-120, epic 150-400), spread across each group so a child always has something near
 * and something to save for.
 */
const STICKER_GROUPS: { group: string; rows: string[] }[] = [
  { group: 'animal', rows: [
    '🐶|Puppy', '🐱|Kitty', '🐭|Mouse', '🐹|Hamster', '🐰|Bunny', '🦊|Fox', '🐻|Bear', '🐼|Panda', '🐨|Koala', '🐯|Tiger',
    '🦁|Lion', '🐮|Cow', '🐷|Piglet', '🐸|Frog', '🐵|Monkey', '🐔|Hen', '🐧|Penguin', '🐦|Little Bird', '🦆|Duck', '🦉|Owl',
    '🦋|Butterfly', '🐝|Busy Bee', '🐞|Ladybug', '🐢|Turtle', '🐙|Octopus', '🐠|Fish', '🐬|Dolphin', '🐳|Whale', '🦒|Giraffe', '🐘|Elephant',
  ] },
  { group: 'food', rows: [
    '🍎|Apple', '🍌|Banana', '🍇|Grapes', '🍓|Strawberry', '🍉|Watermelon', '🍊|Orange', '🍍|Pineapple', '🥭|Mango', '🍒|Cherries', '🍑|Peach',
    '🥕|Carrot', '🌽|Corn', '🥦|Broccoli', '🍞|Bread', '🧀|Cheese', '🥚|Egg', '🍕|Pizza', '🍔|Burger', '🌭|Hot Dog', '🍟|Fries',
    '🍦|Ice Cream', '🍩|Donut', '🍪|Cookie', '🎂|Birthday Cake', '🧁|Cupcake', '🍫|Chocolate', '🍿|Popcorn', '🥛|Milk', '🍯|Honey', '🍙|Rice Ball',
  ] },
  { group: 'space', rows: [
    '🚀|Rocket', '🛸|Flying Saucer', '🌍|Planet Earth', '🌙|Moon', '⭐|Star', '🌟|Glowing Star', '☄️|Comet', '🪐|Ringed Planet', '🌞|Sun', '🔭|Telescope',
    '👩‍🚀|Astronaut', '👽|Alien', '🤖|Robot', '🛰️|Satellite', '🌌|Galaxy', '✨|Sparkles', '💫|Dizzy Star', '🌠|Shooting Star', '🌑|New Moon', '🌕|Full Moon',
    '🌒|Crescent Moon', '🔴|Red Planet', '🔵|Blue Planet', '🟣|Purple Planet', '🟡|Gold Planet', '🧑‍🚀|Space Explorer', '🪂|Parachute', '🌈|Space Rainbow', '🪨|Moon Rock', '🔆|Bright Star',
  ] },
  { group: 'nature', rows: [
    '🌳|Tree', '🌲|Pine Tree', '🌴|Palm Tree', '🌵|Cactus', '🌸|Cherry Blossom', '🌼|Daisy', '🌻|Sunflower', '🌹|Rose', '🌷|Tulip', '🍀|Clover',
    '🍁|Maple Leaf', '🍄|Mushroom', '🌾|Rice Plant', '🌿|Herb', '☘️|Shamrock', '🪴|Potted Plant', '🌱|Seedling', '💐|Bouquet', '⛰️|Mountain', '🌋|Volcano',
    '🏝️|Island', '🏖️|Beach', '🏞️|Park', '🌊|Wave', '🐚|Seashell',
  ] },
  { group: 'vehicle', rows: [
    '🚗|Car', '🚕|Taxi', '🚌|Bus', '🚎|Trolley Bus', '🚓|Police Car', '🚑|Ambulance', '🚒|Fire Truck', '🚚|Truck', '🚜|Tractor', '🏍️|Motorbike',
    '🚲|Bicycle', '🛴|Scooter', '🚂|Train', '🚄|Fast Train', '🚁|Helicopter', '✈️|Airplane', '⛵|Sailboat', '🚤|Speedboat', '🚢|Ship', '🛶|Canoe',
    '🛵|Moped', '🚡|Cable Car', '🚟|Sky Rail', '🛺|Tricycle', '🏎️|Race Car',
  ] },
  { group: 'sport', rows: [
    '⚽|Soccer Ball', '🏀|Basketball', '🏐|Volleyball', '🎾|Tennis Ball', '🏓|Ping Pong', '🏸|Badminton', '🥊|Boxing Glove', '🏊|Swimmer', '🚴|Cyclist', '🧗|Climber',
    '🤸|Gymnast', '⛸️|Ice Skate', '🛹|Skateboard', '🎯|Bullseye', '🎳|Bowling', '🪁|Kite', '🧩|Puzzle', '🎲|Dice', '♟️|Chess Pawn', '🎮|Game Controller',
    '🕹️|Joystick', '🪀|Yo-yo', '🥇|Gold Medal', '🥈|Silver Medal', '🥉|Bronze Medal',
  ] },
  { group: 'music and art', rows: [
    '🎵|Music Note', '🎶|Melody', '🎸|Guitar', '🎹|Piano', '🥁|Drum', '🎺|Trumpet', '🎻|Violin', '🎤|Microphone', '🎧|Headphones', '🎨|Paint Palette',
    '🖌️|Paintbrush', '🖍️|Crayon', '✏️|Pencil', '📚|Stack of Books', '📖|Open Book', '🎭|Drama Masks', '🎬|Clapperboard', '📷|Camera', '🖼️|Picture Frame', '🪕|Banjo',
  ] },
  { group: 'weather', rows: [
    '☀️|Sunshine', '🌤️|Partly Sunny', '⛅|Sun and Cloud', '☁️|Cloud', '🌧️|Rainy Day', '⛈️|Thunderstorm', '🌩️|Lightning Cloud', '🌨️|Snow Cloud', '❄️|Snowflake', '☃️|Snowman',
    '🌈|Rainbow', '🌪️|Whirlwind', '🌫️|Foggy Day', '💧|Raindrop', '☔|Umbrella', '🌬️|Breezy Wind', '🌡️|Thermometer', '🔥|Flame', '🌀|Swirl', '🌅|Sunrise',
  ] },
  { group: 'face', rows: [
    '😀|Big Grin', '😃|Happy Smile', '😄|Laughing Face', '😁|Beaming Face', '😆|Giggling Face', '😊|Blushing Smile', '😇|Little Angel', '🙂|Gentle Smile', '😉|Wink', '😍|Heart Eyes',
    '🤩|Star Struck', '😎|Cool Shades', '🤗|Hugging Face', '🤔|Thinking Face', '😴|Sleepy Face', '🥳|Party Face', '😮|Wow Face', '🥰|Loved Face', '😌|Calm Face', '🤠|Cowboy Hat',
  ] },
  { group: 'fun', rows: [
    '🎈|Balloon', '🎁|Gift Box', '🎀|Pink Ribbon', '🔔|Bell', '🕯️|Candle', '💡|Light Bulb', '🔑|Key', '🧸|Teddy Bear', '🪆|Nesting Doll', '🎒|Backpack',
    '👓|Glasses', '🧢|Cap', '👑|Crown', '💎|Gem', '🧲|Magnet', '🔮|Crystal Ball', '🪄|Magic Wand', '🧪|Test Tube', '⏰|Alarm Clock', '📌|Pushpin',
    '✂️|Scissors', '📎|Paper Clip', '🛍️|Shopping Bag', '🧭|Compass', '🔦|Flashlight',
  ] },
  { group: 'celebration', rows: [
    '🎉|Party Popper', '🎊|Confetti', '🎆|Fireworks', '🎇|Sparkler', '🎄|Christmas Tree', '🏮|Red Lantern', '🎃|Pumpkin', '🇵🇭|Philippine Flag', '🥂|Cheers', '🎗️|Awareness Ribbon',
    '🧧|Red Envelope', '🪅|Piñata', '🎐|Wind Chime', '🎏|Fish Streamer', '🎋|Wish Tree', '💝|Heart Gift', '💌|Love Letter', '🎠|Carousel', '🎡|Ferris Wheel', '🎪|Circus Tent',
  ] },
];

const TROPHIES: string[] = [
  '🏆|Champion Cup', '🥇|First Place', '🌟|Super Star', '📚|Reading Star', '🧮|Math Whiz', '🔬|Science Explorer', '🔤|Super Speller', '✍️|Neat Writer', '🤝|Kind Helper', '🦁|Brave Heart',
  '🎯|Sharp Shooter', '🧠|Clever Thinker', '🎨|Little Artist', '🎵|Music Maker', '🗣️|Clear Speaker', '👂|Good Listener', '🌱|Growing Strong', '🌍|Earth Keeper', '🧹|Tidy Helper', '🪥|Sparkling Smile',
  '😴|Sleep Champion', '💧|Water Hero', '🥦|Healthy Eater', '🏃|Speedy Runner', '🧗|Mountain Climber', '🚀|Space Pilot', '🔭|Star Gazer', '🧪|Young Scientist', '📖|Story Lover', '🔢|Number Ninja',
  '🧩|Puzzle Master', '🎭|Drama Star', '🤸|Flexible Friend', '🕊️|Peace Maker', '🙏|Polite Pal', '💛|Golden Heart', '🌈|Rainbow Spirit', '🛡️|Safety Shield', '🗺️|Great Explorer', '🕰️|Always On Time',
  '🌟|Perfect Week', '🔥|Super Streak', '🎖️|Medal of Courage', '🏅|Practice Medal', '👑|Learning Royalty', '🐉|Dragon Tamer', '🦄|Magic Maker', '🌠|Wish Maker', '🛸|Cosmic Champion', '🥳|Celebration Star',
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Cycle through rarities so each group has plenty of cheap ones and a few to save for. */
function tierOf(i: number): Rarity {
  const m = i % 10;
  return m < 6 ? 'common' : m < 9 ? 'rare' : 'epic';
}

function priceOf(rarity: Rarity, i: number, trophy: boolean): number {
  if (rarity === 'common') return trophy ? 10 : 5 + 5 * (i % 5);
  if (rarity === 'rare') return trophy ? 40 + 16 * (i % 6) : 30 + 10 * (i % 6);
  return trophy ? 150 + 50 * (i % 6) : 100 + 25 * (i % 6);
}

function build(): ShopItem[] {
  const out: ShopItem[] = [];
  const seen = new Set<string>();
  const add = (category: ShopCategory, prefix: string, emoji: string, name: string, describe: string, i: number, trophy: boolean) => {
    const id = `${prefix}-${slug(name)}`;
    if (seen.has(id)) return;
    seen.add(id);
    const rarity = tierOf(i);
    out.push({ id, category, rarity, name, description: describe, stars: priceOf(rarity, i, trophy), emoji });
  };
  let n = 0;
  for (const g of STICKER_GROUPS) {
    g.rows.forEach((row, i) => {
      const [emoji, name] = row.split('|');
      add('stickers', 'st', emoji, name, `A ${name.toLowerCase()} sticker to wear beside your name.`, i + n, false);
    });
    n += 3; // shifts the pattern so the groups do not all peak on the same row
  }
  TROPHIES.forEach((row, i) => {
    const [emoji, name] = row.split('|');
    add('trophies', 'tr', emoji, name, `The ${name} trophy, for being your best.`, i, true);
  });
  return out;
}

export const MORE_SHOP_ITEMS: ShopItem[] = build();
