import { RARITY_COUNTS, ruleFor } from './extra';
import type { Collectible, CollectionCategory, Rarity } from './registry';

/**
 * THE THOUSAND: a large expansion built from two small word lists per category — an ADJECTIVE that decides the
 * rarity and adds a line about its personality, and a NOUN that decides the picture and what the thing is. A
 * Little Star Panda and a Royal Star Panda are the same animal with a different rarity. Pairs are picked by a
 * fixed formula (no randomness), so the collection is identical on every device and every build, and a child's
 * recorded finds always keep meaning the same thing.
 *
 * Every name is unique, every fact reads as a sentence, and every item is earned by VERIFIED practice through the
 * same `ruleFor` as the rest of the collection.
 */
interface Adj { w: string; tier: Rarity; trait: string }
interface Noun { w: string; emoji: string; fact: string }

const ADJ: Adj[] = [
  // common
  { w: 'Little', tier: 'common', trait: 'is small but very brave' },
  { w: 'Happy', tier: 'common', trait: 'smiles at every star' },
  { w: 'Sleepy', tier: 'common', trait: 'naps on soft clouds' },
  { w: 'Fluffy', tier: 'common', trait: 'is as soft as a cloud' },
  { w: 'Tiny', tier: 'common', trait: 'fits in your pocket' },
  { w: 'Cheerful', tier: 'common', trait: 'hums a happy tune' },
  { w: 'Round', tier: 'common', trait: 'is perfectly round' },
  { w: 'Cozy', tier: 'common', trait: 'loves a warm blanket' },
  { w: 'Giggly', tier: 'common', trait: 'giggles at twinkling stars' },
  { w: 'Curious', tier: 'common', trait: 'asks about everything' },
  { w: 'Friendly', tier: 'common', trait: 'waves hello to everyone' },
  { w: 'Sunny', tier: 'common', trait: 'shines bright all day' },
  // uncommon
  { w: 'Bouncy', tier: 'uncommon', trait: 'bounces from moon to moon' },
  { w: 'Shiny', tier: 'uncommon', trait: 'sparkles in the light' },
  { w: 'Sparkly', tier: 'uncommon', trait: 'leaves a trail of sparkles' },
  { w: 'Speedy', tier: 'uncommon', trait: 'zooms faster than a comet' },
  { w: 'Dreamy', tier: 'uncommon', trait: 'dreams of faraway galaxies' },
  { w: 'Jolly', tier: 'uncommon', trait: 'laughs with a big jolly laugh' },
  { w: 'Bubbly', tier: 'uncommon', trait: 'floats on little bubbles' },
  { w: 'Glittery', tier: 'uncommon', trait: 'is covered in glitter' },
  { w: 'Rainbow', tier: 'uncommon', trait: 'shimmers in every colour' },
  { w: 'Minty', tier: 'uncommon', trait: 'smells fresh like mint' },
  { w: 'Peachy', tier: 'uncommon', trait: 'glows a soft peach colour' },
  { w: 'Snowy', tier: 'uncommon', trait: 'sparkles like fresh snow' },
  // rare
  { w: 'Silver', tier: 'rare', trait: 'shines like silver moonlight' },
  { w: 'Frosty', tier: 'rare', trait: 'comes from the icy edge of space' },
  { w: 'Glowing', tier: 'rare', trait: 'glows softly in the dark' },
  { w: 'Starry', tier: 'rare', trait: 'is dotted with tiny stars' },
  { w: 'Midnight', tier: 'rare', trait: 'only comes out after dark' },
  { w: 'Coral', tier: 'rare', trait: 'glows a warm coral pink' },
  { w: 'Jade', tier: 'rare', trait: 'gleams a deep green' },
  { w: 'Violet', tier: 'rare', trait: 'shimmers in violet light' },
  { w: 'Amber', tier: 'rare', trait: 'glows like warm amber' },
  { w: 'Misty', tier: 'rare', trait: 'floats in a soft mist' },
  // epic
  { w: 'Golden', tier: 'epic', trait: 'shines with golden light' },
  { w: 'Crystal', tier: 'epic', trait: 'is clear and sparkling like a crystal' },
  { w: 'Thunder', tier: 'epic', trait: 'rumbles with a friendly thunder' },
  { w: 'Aurora', tier: 'epic', trait: 'dances with green and pink lights' },
  { w: 'Ruby', tier: 'epic', trait: 'gleams a deep ruby red' },
  { w: 'Sapphire', tier: 'epic', trait: 'sparkles a deep sapphire blue' },
  { w: 'Emerald', tier: 'epic', trait: 'glitters an emerald green' },
  { w: 'Opal', tier: 'epic', trait: 'shows every colour of the opal' },
  // legendary
  { w: 'Royal', tier: 'legendary', trait: 'wears a tiny invisible crown' },
  { w: 'Ancient', tier: 'legendary', trait: 'is older than the oldest star' },
  { w: 'Radiant', tier: 'legendary', trait: 'glows brighter than a thousand lamps' },
  { w: 'Celestial', tier: 'legendary', trait: 'floats among the heavens' },
  { w: 'Majestic', tier: 'legendary', trait: 'is a wonder to see' },
  { w: 'Stellar', tier: 'legendary', trait: 'shines like a star' },
  // mythic
  { w: 'Eternal', tier: 'mythic', trait: 'will shine forever' },
  { w: 'Infinite', tier: 'mythic', trait: 'goes on and on without end' },
];

const NOUNS: Record<CollectionCategory, Noun[]> = {
  companions: [
    { w: 'Star Panda', emoji: '🐼', fact: 'A panda loves to snack and cuddle.' },
    { w: 'Moon Fox', emoji: '🦊', fact: 'A fox is clever and quick on its feet.' },
    { w: 'Comet Bunny', emoji: '🐰', fact: 'A bunny hops high and twitches its nose.' },
    { w: 'Rocket Kitten', emoji: '🐱', fact: 'A kitten pounces and purrs.' },
    { w: 'Orbit Puppy', emoji: '🐶', fact: 'A puppy wags its tail when it is happy.' },
    { w: 'Galaxy Penguin', emoji: '🐧', fact: 'A penguin waddles and slides on its tummy.' },
    { w: 'Nebula Owl', emoji: '🦉', fact: 'An owl can turn its head almost all the way round.' },
    { w: 'Cosmic Bear', emoji: '🐻', fact: 'A bear loves a big, warm hug.' },
    { w: 'Lunar Koala', emoji: '🐨', fact: 'A koala sleeps up in the trees for much of the day.' },
    { w: 'Solar Otter', emoji: '🦦', fact: 'An otter floats on its back and holds hands while it sleeps.' },
    { w: 'Astro Turtle', emoji: '🐢', fact: 'A turtle carries its home on its back.' },
    { w: 'Meteor Whale', emoji: '🐋', fact: 'A whale sings songs that travel far under the sea.' },
    { w: 'Aurora Dolphin', emoji: '🐬', fact: 'A dolphin is a clever swimmer that loves to play.' },
    { w: 'Star Dragon', emoji: '🐲', fact: 'A dragon is a friendly make-believe creature.' },
    { w: 'Moonbeam Unicorn', emoji: '🦄', fact: 'A unicorn is a magical horse with one shiny horn.' },
    { w: 'Planet Lion', emoji: '🦁', fact: 'A lion has a big mane and a mighty roar.' },
    { w: 'Comet Monkey', emoji: '🐵', fact: 'A monkey swings and climbs with its long arms.' },
    { w: 'Orbit Elephant', emoji: '🐘', fact: 'An elephant uses its trunk like a hand.' },
    { w: 'Galaxy Frog', emoji: '🐸', fact: 'A frog leaps far with its strong back legs.' },
    { w: 'Starlight Duckling', emoji: '🐥', fact: 'A duckling follows its mother everywhere.' },
  ],
  planets: [
    { w: 'Planet', emoji: '🪐', fact: 'A planet travels around a star in a big circle called an orbit.' },
    { w: 'Moon', emoji: '🌙', fact: 'A moon travels around a planet.' },
    { w: 'World', emoji: '🌎', fact: 'Every world in space is a little different.' },
    { w: 'Asteroid', emoji: '🪨', fact: 'Asteroids are space rocks that orbit the Sun.' },
    { w: 'Ringed Planet', emoji: '🪐', fact: 'Some planets have beautiful rings made of ice and rock.' },
    { w: 'Ice Moon', emoji: '🧊', fact: 'Some moons are covered in a thick layer of ice.' },
    { w: 'Ocean World', emoji: '🌊', fact: 'An ocean world is covered in deep water.' },
    { w: 'Lava Moon', emoji: '🌋', fact: 'A lava moon has volcanoes that glow with melted rock.' },
    { w: 'Desert Planet', emoji: '🏜️', fact: 'A desert planet is warm, dry and sandy.' },
    { w: 'Jungle World', emoji: '🌴', fact: 'A jungle world is green with tall, leafy plants.' },
    { w: 'Cloud Planet', emoji: '☁️', fact: 'A cloud planet is wrapped in thick, swirling clouds.' },
    { w: 'Storm Planet', emoji: '🌪️', fact: 'Giant storms swirl across a stormy planet.' },
    { w: 'Candy Planet', emoji: '🍬', fact: 'A candy planet is a sweet make-believe world.' },
    { w: 'Sand Moon', emoji: '🏖️', fact: 'A sand moon is covered in soft, golden dust.' },
    { w: 'Flower World', emoji: '🌸', fact: 'A flower world is a make-believe garden in space.' },
    { w: 'Twin Moons', emoji: '🌗', fact: 'Some worlds have two moons in their sky.' },
    { w: 'Mountain Moon', emoji: '⛰️', fact: 'A mountain moon has tall peaks and deep valleys.' },
    { w: 'Crater Moon', emoji: '🌑', fact: 'Craters are bowl-shaped dents made by space rocks.' },
    { w: 'Dwarf Planet', emoji: '🔮', fact: 'A dwarf planet is round like a planet but much smaller.' },
    { w: 'Glow World', emoji: '✨', fact: 'A glow world shines softly all night long.' },
  ],
  vehicles: [
    { w: 'Rocket', emoji: '🚀', fact: 'Rockets zoom up past the clouds into space.' },
    { w: 'Space Shuttle', emoji: '🚀', fact: 'A space shuttle flies up like a rocket and lands like a plane.' },
    { w: 'Flying Saucer', emoji: '🛸', fact: 'A flying saucer spins and glows as it hovers.' },
    { w: 'Space Capsule', emoji: '🚀', fact: 'A capsule floats back home under big parachutes.' },
    { w: 'Moon Rover', emoji: '🚙', fact: 'A rover drives across dusty moons and planets.' },
    { w: 'Space Jet', emoji: '✈️', fact: 'A space jet zips from planet to planet.' },
    { w: 'Star Cruiser', emoji: '🛸', fact: 'A star cruiser glides between the stars.' },
    { w: 'Space Bike', emoji: '🏍️', fact: 'A space bike hovers just above the ground.' },
    { w: 'Space Train', emoji: '🚄', fact: 'A space train races along a track of starlight.' },
    { w: 'Moon Boat', emoji: '⛵', fact: 'A moon boat sails on a sea of stardust.' },
    { w: 'Space Bus', emoji: '🚌', fact: 'A space bus has seats for the whole crew.' },
    { w: 'Space Helicopter', emoji: '🚁', fact: 'A helicopter spins its blades to rise straight up.' },
    { w: 'Space Taxi', emoji: '🚕', fact: 'A space taxi takes explorers where they want to go.' },
    { w: 'Hover Scooter', emoji: '🛴', fact: 'A hover scooter glides over bumps and craters.' },
    { w: 'Sky Cable Car', emoji: '🚡', fact: 'A cable car glides high above the ground.' },
    { w: 'Space Tractor', emoji: '🚜', fact: 'A space tractor digs and carries heavy loads.' },
    { w: 'Star Ferry', emoji: '⛴️', fact: 'A ferry carries many passengers across the water.' },
    { w: 'Snow Sled', emoji: '🛷', fact: 'A sled slides fast over snow and ice.' },
    { w: 'Rescue Rocket', emoji: '🚑', fact: 'A rescue vehicle hurries to help explorers.' },
    { w: 'Fire Rocket', emoji: '🚒', fact: 'A fire vehicle sprays water to put out flames.' },
  ],
  discoveries: [
    { w: 'Comet', emoji: '☄️', fact: 'A comet has a long, glowing tail.' },
    { w: 'Shooting Star', emoji: '🌠', fact: 'A shooting star is a space rock glowing as it zooms.' },
    { w: 'Nebula', emoji: '🌌', fact: 'A nebula is a giant cloud of dust and gas where stars are born.' },
    { w: 'Galaxy', emoji: '🌌', fact: 'A galaxy is a huge family of stars.' },
    { w: 'Star', emoji: '⭐', fact: 'A star is a giant ball of hot, glowing gas.' },
    { w: 'Meteor', emoji: '☄️', fact: 'A meteor is a space rock that sparkles in the sky.' },
    { w: 'Sunbeam', emoji: '☀️', fact: 'A sunbeam takes about eight minutes to reach Earth.' },
    { w: 'Star Cluster', emoji: '✨', fact: 'A star cluster is a big group of stars close together.' },
    { w: 'Black Hole', emoji: '🕳️', fact: 'A black hole pulls in everything nearby, even light.' },
    { w: 'Supernova', emoji: '💥', fact: 'A supernova is the bright burst of a star at the end of its life.' },
    { w: 'Pulsar', emoji: '🌟', fact: 'A pulsar blinks like a lighthouse in space.' },
    { w: 'Wormhole', emoji: '🌀', fact: 'A wormhole is a pretend tunnel through space.' },
    { w: 'Space Rainbow', emoji: '🌈', fact: 'A space rainbow bends across the sky.' },
    { w: 'Cosmic Cloud', emoji: '☁️', fact: 'Clouds of gas float between the stars.' },
    { w: 'Star Dust', emoji: '✨', fact: 'Star dust is the tiny sparkle left by old stars.' },
    { w: 'Eclipse', emoji: '🌑', fact: 'In an eclipse, one thing in space hides another for a while.' },
    { w: 'Space Spark', emoji: '💫', fact: 'A little spark twirls through the dark.' },
    { w: 'Solar Flare', emoji: '🔥', fact: 'A solar flare is a burst of light from the Sun.' },
    { w: 'Moon Phase', emoji: '🌓', fact: 'The Moon seems to change shape as it moves around the Earth.' },
    { w: 'Far Galaxy', emoji: '🔭', fact: 'Far galaxies are so far away that their light takes ages to reach us.' },
  ],
  equipment: [
    { w: 'Helmet', emoji: '🥽', fact: 'A helmet gives astronauts air to breathe.' },
    { w: 'Space Gloves', emoji: '🧤', fact: 'Space gloves keep hands warm and safe.' },
    { w: 'Moon Boots', emoji: '👢', fact: 'Moon boots leave big footprints in the dust.' },
    { w: 'Backpack', emoji: '🎒', fact: 'A backpack carries snacks and star maps.' },
    { w: 'Telescope', emoji: '🔭', fact: 'A telescope helps us see faraway stars.' },
    { w: 'Space Camera', emoji: '📷', fact: 'A camera takes pictures of faraway places.' },
    { w: 'Lantern', emoji: '🏮', fact: 'A lantern lights up the dark.' },
    { w: 'Compass', emoji: '🧭', fact: 'A compass points the way.' },
    { w: 'Star Map', emoji: '🗺️', fact: 'A star map shows the way between planets.' },
    { w: 'Radio', emoji: '📻', fact: 'A radio talks to friends back home.' },
    { w: 'Flag', emoji: '🚩', fact: 'A flag marks a brand-new discovery.' },
    { w: 'Drill', emoji: '⛏️', fact: 'A drill digs into moon rocks.' },
    { w: 'Goggles', emoji: '🥽', fact: 'Goggles keep stardust out of your eyes.' },
    { w: 'Flashlight', emoji: '🔦', fact: 'A flashlight helps explorers see in dark craters.' },
    { w: 'Power Cell', emoji: '🔋', fact: 'A power cell keeps the ship humming.' },
    { w: 'Antenna', emoji: '📡', fact: 'An antenna listens for messages from space.' },
    { w: 'Tool Kit', emoji: '🧰', fact: 'A tool kit fixes anything on a space trip.' },
    { w: 'Magnet', emoji: '🧲', fact: 'A magnet pulls on things made of iron.' },
    { w: 'Space Lamp', emoji: '💡', fact: 'A lamp shines bright inside the ship.' },
    { w: 'Space Suit', emoji: '🧑‍🚀', fact: 'A space suit keeps astronauts safe and cosy.' },
  ],
  special: [
    { w: 'Gift', emoji: '🎁', fact: 'Nobody knows what is inside until it is opened.' },
    { w: 'Medal', emoji: '🎖️', fact: 'A medal is for brave explorers.' },
    { w: 'Trophy', emoji: '🏆', fact: 'A trophy shines for the best explorers.' },
    { w: 'Ticket', emoji: '🎫', fact: 'A ticket opens the door to a space show.' },
    { w: 'Balloon', emoji: '🎈', fact: 'A balloon floats up, up and away.' },
    { w: 'Cake', emoji: '🎂', fact: 'A cake is baked for a big space party.' },
    { w: 'Badge', emoji: '🏅', fact: 'A badge shows what you have achieved.' },
    { w: 'Crown', emoji: '👑', fact: 'A crown belongs to a true star explorer.' },
    { w: 'Key', emoji: '🗝️', fact: 'A key opens a hidden space door.' },
    { w: 'Potion', emoji: '🧪', fact: 'A potion bubbles and glows.' },
    { w: 'Scroll', emoji: '📜', fact: 'A scroll tells of the very first stars.' },
    { w: 'Crystal Ball', emoji: '🔮', fact: 'A crystal ball shows swirling galaxies.' },
    { w: 'Treasure Map', emoji: '🗺️', fact: 'A treasure map leads to a hidden asteroid.' },
    { w: 'Lucky Charm', emoji: '🍀', fact: 'A lucky charm brings good fortune.' },
    { w: 'Music Box', emoji: '🎵', fact: 'A music box plays a tune among the stars.' },
    { w: 'Fireworks', emoji: '🎆', fact: 'Fireworks light up the whole night.' },
    { w: 'Ice Cream', emoji: '🍦', fact: 'Ice cream is a favourite treat on a long trip.' },
    { w: 'Cookie', emoji: '🍪', fact: 'A cookie gives astronauts a sweet snack.' },
    { w: 'Gem', emoji: '💎', fact: 'A gem glitters in every colour.' },
    { w: 'Magic Wand', emoji: '🪄', fact: 'A magic wand sprinkles stardust.' },
    { w: 'Story Book', emoji: '📖', fact: 'A story book is full of space adventures.' },
    { w: 'Postcard', emoji: '💌', fact: 'A postcard says hello from the Moon.' },
    { w: 'Pizza', emoji: '🍕', fact: 'Space pizza is the favourite food of the crew.' },
    { w: 'Secret Door', emoji: '🚪', fact: 'A secret door hides a surprise.' },
  ],
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Which (adjective, noun) pairs are in the collection: one in seven, by a fixed formula, so every noun meets every rarity. */
const picked = (a: number, n: number, c: number) => (a * 13 + n * 7 + c * 5 + ((a * n) % 3)) % 7 === 0;

export function generateCollection(taken: ReadonlySet<string>): Collectible[] {
  const out: Collectible[] = [];
  const used = new Set(taken);
  (Object.keys(NOUNS) as CollectionCategory[]).forEach((category, c) => {
    NOUNS[category].forEach((noun, n) => {
      ADJ.forEach((adj, a) => {
        if (!picked(a, n, c)) return;
        // "Crystal Crystal Ball" and "Rainbow Space Rainbow" read badly, so skip a repeated word.
        if (noun.w.toLowerCase().split(' ').includes(adj.w.toLowerCase())) return;
        const name = `${adj.w} ${noun.w}`;
        const id = slug(name);
        if (used.has(id)) return;
        used.add(id);
        const rarity = adj.tier;
        const idx = RARITY_COUNTS[rarity]++;
        out.push({ id, name, category, rarity, art: `emoji:${noun.emoji}`, fact: `${name}: ${noun.fact} This one ${adj.trait}.`, ...ruleFor(rarity, idx) });
      });
    });
  });
  return out;
}
