import { tileColor } from './colors';

/**
 * TalkEasy's interface icon language.
 *
 * The app used emoji as UI icons (headers, section titles, menu tiles). They render differently on
 * every phone and a screen full of them is loud. Every interface emoji now maps to one line icon
 * (MaterialCommunityIcons, bundled and offline) plus a soft tint; `Glyph` draws it as an
 * `IconTile` — a tinted rounded square with the icon in the tint's deep tone.
 *
 * Learning pictures (🍎 🐶 in exercises, a parent's own lesson pictures) are content, not chrome,
 * and deliberately stay pictures.
 *
 * Adding one: map the emoji to an icon that exists in MaterialCommunityIcons (validated by
 * `npm run check:speech`) and one of the TileColors tints.
 */
export interface UiIcon {
  icon: string;
  tint: string;
}

const blue = tileColor('blue');
const green = tileColor('green');
const yellow = tileColor('yellow');
const orange = tileColor('orange');
const coral = tileColor('coral');
const pink = tileColor('pink');
const purple = tileColor('purple');
const teal = tileColor('teal');
const grey = tileColor('grey');

export const UI_ICONS: Record<string, UiIcon> = {
  // Sections & navigation
  '🗣️': { icon: 'message-processing-outline', tint: blue },
  '🎒': { icon: 'bag-personal-outline', tint: green },
  '📝': { icon: 'file-document-edit-outline', tint: orange },
  '📚': { icon: 'bookshelf', tint: purple },
  '📅': { icon: 'calendar-blank-outline', tint: orange },
  '📆': { icon: 'calendar-today', tint: blue },
  '🗓️': { icon: 'calendar-month-outline', tint: teal },
  '🧩': { icon: 'puzzle-outline', tint: teal },
  '⭐': { icon: 'star-outline', tint: yellow },
  '🌟': { icon: 'star-shooting-outline', tint: yellow },
  '👨‍👩‍👧': { icon: 'account-group-outline', tint: coral },
  '👪': { icon: 'account-group-outline', tint: coral },
  '🏫': { icon: 'google-classroom', tint: green },
  '🎓': { icon: 'school-outline', tint: yellow },
  '🎯': { icon: 'target', tint: coral },
  '🎤': { icon: 'microphone-outline', tint: coral },
  '🔊': { icon: 'volume-high', tint: blue },
  '💬': { icon: 'chat-outline', tint: blue },
  '📋': { icon: 'clipboard-text-outline', tint: blue },
  '📌': { icon: 'pin-outline', tint: coral },
  '🕒': { icon: 'clock-outline', tint: purple },
  '🔜': { icon: 'arrow-right-circle-outline', tint: teal },
  '✨': { icon: 'creation', tint: purple },
  '✏️': { icon: 'pencil-outline', tint: orange },
  '🖼️': { icon: 'image-outline', tint: teal },
  '🛠️': { icon: 'tools', tint: grey },
  '🙋': { icon: 'hand-back-right-outline', tint: orange },
  '✋': { icon: 'hand-back-right-outline', tint: orange },
  '🙂': { icon: 'emoticon-outline', tint: yellow },
  '😊': { icon: 'emoticon-happy-outline', tint: pink },
  '📈': { icon: 'chart-line', tint: green },
  '👆': { icon: 'gesture-tap', tint: blue },
  '👀': { icon: 'eye-outline', tint: purple },
  '🏆': { icon: 'trophy-outline', tint: yellow },
  '🎁': { icon: 'gift-outline', tint: pink },
  '❓': { icon: 'comment-question-outline', tint: blue },
  '✅': { icon: 'check-circle-outline', tint: green },

  // Levels (Speech Practice) and assistance levels: a signal meter, not coloured dots
  '🟢': { icon: 'signal-cellular-1', tint: green },
  '🟡': { icon: 'signal-cellular-2', tint: yellow },
  '🔵': { icon: 'signal-cellular-3', tint: blue },

  // School subjects (seeded + the parent's subject picker)
  '📖': { icon: 'alphabetical-variant', tint: blue },
  '🇵🇭': { icon: 'flag-outline', tint: yellow },
  '🔢': { icon: 'numeric', tint: green },
  '🔬': { icon: 'flask-outline', tint: teal },
  '🏘️': { icon: 'home-group', tint: orange },
  '💗': { icon: 'heart-outline', tint: pink },
  '🎨': { icon: 'palette-outline', tint: purple },
  '🎵': { icon: 'music-note-outline', tint: purple },
  '⚽': { icon: 'soccer', tint: green },
  '💻': { icon: 'laptop', tint: blue },
  '🌍': { icon: 'earth', tint: teal },
  '🧪': { icon: 'test-tube', tint: teal },
  '🎭': { icon: 'drama-masks', tint: purple },
  '🙏': { icon: 'hands-pray', tint: pink },

  // Learn activities
  '🔤': { icon: 'alphabetical-variant', tint: blue },
  '🍎': { icon: 'food-apple-outline', tint: coral },
  '🍌': { icon: 'book-alphabet', tint: yellow },
  '🔎': { icon: 'magnify', tint: blue },
  '➕': { icon: 'plus-circle-outline', tint: green },
  '➖': { icon: 'minus-circle-outline', tint: orange },
  '✖️': { icon: 'close-circle-outline', tint: purple },
  '⚖️': { icon: 'scale-balance', tint: teal },
  '🔺': { icon: 'shape-outline', tint: coral },
  '💰': { icon: 'cash', tint: green },
  '🐾': { icon: 'paw-outline', tint: orange },
  '🌱': { icon: 'sprout-outline', tint: green },
  '🧍': { icon: 'human', tint: blue },
  '🌦️': { icon: 'weather-partly-rainy', tint: teal },
  '👮': { icon: 'police-badge-outline', tint: blue },
  '🤝': { icon: 'handshake-outline', tint: orange },
  '🙇': { icon: 'human-greeting-variant', tint: purple },
  '💪': { icon: 'arm-flex-outline', tint: coral },

  // Writing practice levels
  '〰️': { icon: 'sine-wave', tint: blue },

  // Answer methods (Adaptive Learning)
  '🔗': { icon: 'link-variant', tint: teal },
  '⌨️': { icon: 'keyboard-outline', tint: blue },
  '✍️': { icon: 'draw', tint: orange },

  // Activity categories
  '🎲': { icon: 'dice-5-outline', tint: yellow },
  '🏃': { icon: 'run', tint: green },
  '🌳': { icon: 'tree-outline', tint: teal },
  '🖐️': { icon: 'hand-back-right-outline', tint: orange },
  '🧹': { icon: 'broom', tint: grey },
};

/** Icon + tint for an emoji, or null when it is content that should stay a picture. */
export function uiIcon(value: string | null | undefined): UiIcon | null {
  if (!value) return null;
  // Emoji arrive with or without the variation selector (U+FE0F) depending on the keyboard.
  const bare = value.replace(new RegExp(String.fromCharCode(0xfe0f), 'g'), '');
  return UI_ICONS[value] ?? UI_ICONS[bare] ?? Object.entries(UI_ICONS).find(([k]) => k.replace(new RegExp(String.fromCharCode(0xfe0f), 'g'), '') === bare)?.[1] ?? null;
}

/** The subject icons a parent can pick from (line icons, stored by name). */
export const SUBJECT_ICON_CHOICES = [
  'alphabetical-variant', 'flag-outline', 'numeric', 'flask-outline', 'home-group', 'heart-outline',
  'palette-outline', 'music-note-outline', 'soccer', 'laptop', 'earth', 'pencil-outline',
  'bookshelf', 'test-tube', 'drama-masks', 'hands-pray',
];
