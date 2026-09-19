/**
 * Curated icon catalogue for the parent icon picker.
 * Every name is a MaterialCommunityIcons glyph bundled with @expo/vector-icons,
 * so icons render without any network access.
 *
 * To add an icon: pick a name from https://icons.expo.fyi (family "MaterialCommunityIcons")
 * and append it to the relevant group.
 */
export interface IconGroup {
  title: string;
  icons: string[];
}

export const ICON_GROUPS: IconGroup[] = [
  {
    title: 'Needs',
    icons: [
      'cup-water', 'water', 'food-apple', 'food', 'silverware-fork-knife', 'toilet', 'pill',
      'medication', 'bandage', 'hand-heart', 'help-circle', 'bathtub', 'shower', 'tooth',
      'bed', 'power-sleep', 'sleep', 'medical-bag', 'wheelchair', 'human-wheelchair',
    ],
  },
  {
    title: 'People',
    icons: [
      'face-man', 'face-woman', 'account-child', 'human-male', 'human-female', 'human-child',
      'doctor', 'mother-heart', 'account-heart', 'teddy-bear', 'baby-face',
    ],
  },
  {
    title: 'Choices',
    icons: [
      'thumb-up', 'thumb-down', 'check', 'close', 'plus', 'flag-checkered', 'hand-okay',
      'hand-wave', 'stop', 'play', 'pause', 'refresh', 'volume-high', 'volume-mute',
      'arrow-up', 'arrow-down', 'heart', 'star', 'lightbulb',
    ],
  },
  {
    title: 'Feelings',
    icons: [
      'emoticon-happy', 'emoticon-excited', 'emoticon-sad', 'emoticon-cry', 'emoticon-angry',
      'emoticon-frown', 'emoticon-neutral', 'emoticon-sick', 'emoticon-confused', 'emoticon-cool',
      'emoticon-kiss', 'emoticon-tongue', 'emoticon-dead', 'ghost', 'heart-pulse',
    ],
  },
  {
    title: 'Food & drink',
    icons: [
      'coffee', 'cup', 'bottle-soda', 'baby-bottle', 'cookie', 'ice-cream', 'candy',
      'fruit-cherries', 'carrot', 'bread-slice', 'rice', 'noodles', 'hamburger', 'pizza',
      'cupcake', 'cheese', 'egg', 'pot-steam',
    ],
  },
  {
    title: 'Daily routine',
    icons: [
      'weather-sunny', 'white-balance-sunny', 'weather-sunset', 'weather-night',
      'moon-waning-crescent', 'clock-outline', 'timer-outline', 'tshirt-crew', 'shoe-sneaker',
      'hair-dryer', 'glasses', 'car', 'bus', 'home', 'school', 'hospital-box', 'sofa', 'lamp',
    ],
  },
  {
    title: 'Play & activities',
    icons: [
      'gamepad-variant', 'puzzle', 'pencil', 'brush', 'palette', 'music', 'headphones',
      'book-open-variant', 'television', 'television-play', 'camera', 'basketball', 'soccer',
      'swim', 'bike', 'walk', 'run', 'yoga', 'dumbbell', 'arm-flex', 'human-handsup',
      'hand-clap', 'stethoscope', 'eye', 'ear-hearing',
    ],
  },
  {
    title: 'Weather & other',
    icons: [
      'weather-rainy', 'weather-cloudy', 'snowflake', 'fire', 'fan', 'bell', 'phone',
      'alert-circle', 'lock', 'lock-open', 'cog',
    ],
  },
];

export const ALL_ICONS: string[] = ICON_GROUPS.flatMap((g) => g.icons);

export const DEFAULT_ICON = 'star';
