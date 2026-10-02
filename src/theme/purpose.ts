import type { AdventureKey } from './adventure';

/**
 * Colour by PURPOSE, not by position.
 *
 * The Home screen gives each destination its own hue on purpose — eight places, eight colours, so
 * no two are confused at a glance. A list of practice areas is a different problem: there are
 * eleven of them and they fall into a handful of kinds, so colouring each one differently says
 * nothing and just looks busy. Here the colour carries meaning instead:
 *
 *   listening     blue    — taking information in
 *   communication green   — using it with another person
 *   practice      orange  — working on the mechanics
 *   expression    purple  — voice, feeling, emphasis
 *   attention     red     — what matters, what to aim at
 *
 * Because several areas share a colour, colour is never the only thing telling them apart: each
 * card also carries its own emoji and names its purpose in the eyebrow line. That is the same rule
 * the rest of the app follows — never by colour alone — and it is what makes a shared palette safe
 * for a colour-blind child.
 */
export type AreaPurpose = 'listening' | 'communication' | 'practice' | 'expression' | 'attention';

export const PurposeColor: Record<AreaPurpose, AdventureKey> = {
  listening: 'sky',
  communication: 'grass',
  practice: 'sun',
  expression: 'grape',
  attention: 'coral',
};

/** The eyebrow shown above a card's title, so the grouping is readable and not merely coloured. */
export const PurposeLabelKey: Record<AreaPurpose, 'vcPurposeListening' | 'vcPurposeCommunication' | 'vcPurposePractice' | 'vcPurposeExpression' | 'vcPurposeAttention'> = {
  listening: 'vcPurposeListening',
  communication: 'vcPurposeCommunication',
  practice: 'vcPurposePractice',
  expression: 'vcPurposeExpression',
  attention: 'vcPurposeAttention',
};
