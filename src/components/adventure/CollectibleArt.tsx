import React, { useId } from 'react';
import Svg, { Defs, Ellipse, LinearGradient, Stop } from 'react-native-svg';
import { SVG_DECORATIVE } from '@/utils/svgA11y';
import { View } from 'react-native';
import { getAvatar, type AvatarId } from '@/shop/avatars';
import { AvatarArt } from './AvatarArt';
import { WorldArt } from './WorldArt';
import type { WorldArtName } from '@/adventure/worlds';
import { drawCollectible } from './art/collectionArt';
import type { CollectionArtKey } from '@/collection/artKeys';
import type { Fill, Grad } from './art/kit';

/**
 * One entry point for a collectible's picture, by the `art` key in the registry: `avatar:<id>` is the official
 * avatar picture, `world:<name>` is a drawing the app already had (Star, Earth, Moon, Saturn, Rocket), and
 * anything else is drawn in `art/collectionArt.tsx`. `locked` mutes it to a faint silhouette: the shape stays
 * recognisable enough to be tempting, without giving the colours away.
 */
export function CollectibleArt({ art, size, locked }: { art: string; size: number; locked?: boolean }) {
  const base = `co${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const safe = Number.isFinite(size) && size > 0 ? size : 1;
  let body: React.ReactNode;
  if (art.startsWith('avatar:')) {
    const id = art.slice(7) as AvatarId;
    body = getAvatar(id) ? <AvatarArt id={id} size={safe} /> : null;
  } else if (art.startsWith('world:')) {
    body = <WorldArt name={art.slice(6) as WorldArtName} size={safe} locked={locked} />;
  } else {
    const grad: Grad = (id, top, bottom) => (
      <LinearGradient key={id} id={`${base}${id}`} x1="0" y1="0" x2="0.35" y2="1">
        <Stop offset="0" stopColor={top} />
        <Stop offset="1" stopColor={bottom} />
      </LinearGradient>
    );
    const g: Fill = (id) => `url(#${base}${id})`;
    const drawn = drawCollectible(art as CollectionArtKey, grad, g);
    body = (
      <Svg width={safe} height={safe} viewBox="0 0 64 64" {...SVG_DECORATIVE} pointerEvents="none">
        <Defs>{drawn.defs}</Defs>
        <Ellipse cx={32} cy={60} rx={17} ry={2.4} fill="#000000" opacity={0.2} />
        {drawn.art}
      </Svg>
    );
  }
  return (
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: safe, height: safe, opacity: locked ? 0.3 : 1 }}>
      {body}
    </View>
  );
}
