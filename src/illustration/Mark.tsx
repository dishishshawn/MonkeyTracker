import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * One ink weight for every small mark: availability (a hoop at four degrees of
 * closure), location precision (one frame with four amounts of landscape drawn
 * inside it), mood, and room decor. A mark is always shorthand beside its word,
 * never the whole message.
 */

const INK = '#2E2A21';

export type Glyph =
  | 'free' | 'text' | 'busy' | 'asleep'
  | 'hidden' | 'perch' | 'nearby' | 'trail'
  | 'crispy' | 'cozy' | 'focused' | 'wobbly' | 'happy' | 'tender' | 'sleepy'
  | 'fizzy' | 'frazzled' | 'melted'
  | 'plant' | 'stack' | 'lamp' | 'mug' | 'rug' | 'window';

export interface MarkProps {
  glyph: Glyph;
  color?: string;
  size?: number;
}

export function Mark({ glyph, color = INK, size = 20 }: MarkProps) {
  return (
    <Svg viewBox="0 0 32 32" width={size} height={size}>
      <G fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        {glyph === 'free' && (
          <G>
            <Path d="M21.5 7.6 A10 10 0 1 0 24.5 21" />
            <Path d="M16 22 L16 16 Q16 12 20 11 M16 16 Q16 12 12 11.5" strokeWidth={1.9} />
          </G>
        )}
        {glyph === 'text' && (
          <G>
            <Path d="M16 6 A10 10 0 1 1 9 23.5 L6 27 L7 21.5" />
            <Path d="M12 15.5 L20 15.5 M12 19.5 L17 19.5" />
          </G>
        )}
        {glyph === 'busy' && (
          <G>
            <Circle cx={16} cy={16} r={10} />
            <Path d="M10.5 19.5 L21.5 19.5" strokeWidth={2.6} />
            <Circle cx={16} cy={19.5} r={2.2} fill={color} stroke="none" />
          </G>
        )}
        {glyph === 'asleep' && (
          <G>
            <Path d="M22 8 A10 10 0 1 0 24 20 A8 8 0 0 1 22 8 Z" />
            <Path d="M24 6 L28.5 6 L24 11 L28.5 11" strokeWidth={1.8} />
          </G>
        )}

        {glyph === 'hidden' && (
          <G>
            <Rect x={4} y={7} width={24} height={18} rx={4} />
            <Path d="M10 7 Q12 16 10 25 M16 7 Q14 16 16 25 M22 7 Q24 16 22 25" strokeWidth={1.8} opacity={0.75} />
          </G>
        )}
        {glyph === 'perch' && (
          <G>
            <Rect x={4} y={7} width={24} height={18} rx={4} />
            <Path d="M6 22 Q13 11 20 22" />
            <Circle cx={23.5} cy={14.5} r={2.4} fill={color} stroke="none" />
          </G>
        )}
        {glyph === 'nearby' && (
          <G>
            <Rect x={4} y={7} width={24} height={18} rx={4} />
            <Path d="M6 22 Q11 14 16 22 Q21 13 26 22" />
            <Circle cx={16} cy={17} r={2} fill={color} stroke="none" />
          </G>
        )}
        {glyph === 'trail' && (
          <G>
            <Rect x={4} y={7} width={24} height={18} rx={4} />
            <Path d="M7 22 Q12 10 17 17 Q21 23 25 11" strokeDasharray="3 3.4" />
          </G>
        )}

        {glyph === 'crispy' && (
          <G>
            <Path d="M18 5 L11 16 L17 16 L13 27" />
            <Path d="M25 10 L27.5 8.5 M25 21 L27.5 22.5" strokeWidth={1.8} />
          </G>
        )}
        {glyph === 'cozy' && <Path d="M5 12 Q16 4 27 12 M5 19 Q16 11 27 19 M5 26 Q16 18 27 26" />}
        {glyph === 'focused' && (
          <G>
            <Circle cx={16} cy={16} r={10.5} opacity={0.5} />
            <Circle cx={16} cy={16} r={5.5} />
            <Circle cx={16} cy={16} r={1.6} fill={color} stroke="none" />
          </G>
        )}
        {glyph === 'wobbly' && (
          <G>
            <Path d="M4 12 Q9 5 14 12 T24 12 Q26 15 28 13" />
            <Path d="M4 22 Q9 15 14 22 T24 22 Q26 25 28 23" />
          </G>
        )}
        {glyph === 'happy' && (
          <G>
            <Circle cx={16} cy={16} r={6} />
            <Path d="M16 4.5 L16 7.5 M16 24.5 L16 27.5 M4.5 16 L7.5 16 M24.5 16 L27.5 16 M8 8 L10 10 M24 24 L22 22 M24 8 L22 10 M8 24 L10 22" />
          </G>
        )}
        {glyph === 'tender' && <Path d="M16 26 Q4 17 9 10 Q14 5.5 16 12 Q18 5.5 23 10 Q28 17 16 26 Z" />}
        {glyph === 'sleepy' && (
          <G>
            <Path d="M23 9 A9.5 9.5 0 1 1 15 6.5 A7.5 7.5 0 0 0 23 9 Z" />
            <Circle cx={26} cy={22} r={1.6} fill={color} stroke="none" />
          </G>
        )}
        {glyph === 'fizzy' && (
          <G>
            <Circle cx={11} cy={22} r={4} />
            <Circle cx={20} cy={15} r={3} />
            <Circle cx={13} cy={8} r={2.2} />
            <Circle cx={24} cy={24} r={1.8} />
          </G>
        )}
        {glyph === 'frazzled' && <Path d="M6 21 Q4 12 12 11 Q20 10 19 17 Q18 22 13 20 Q9 18 13 15 Q18 12 24 17 Q28 20 26 25" />}
        {glyph === 'melted' && (
          <G>
            <Path d="M5 9 Q16 6 27 9" />
            <Path d="M9 9 Q9 20 14 20 Q19 20 19 12 Q19 8 23 9 Q26 10 25 18 Q24.5 24 21 26" />
          </G>
        )}

        {glyph === 'plant' && (
          <G>
            <Path d="M9 18 L11 28 L21 28 L23 18 Z" />
            <Path d="M16 18 L16 8 M16 12 Q10 10 9 5 Q15 5 16 11 M16 14 Q22 12 23 7 Q17 7 16 13" />
          </G>
        )}
        {glyph === 'stack' && (
          <G>
            <Rect x={6} y={20} width={20} height={6} rx={1.6} />
            <Rect x={8} y={14} width={17} height={6} rx={1.6} />
            <Rect x={7} y={8} width={14} height={6} rx={1.6} />
          </G>
        )}
        {glyph === 'lamp' && (
          <G>
            <Path d="M10 6 L22 6 L26 16 L6 16 Z" />
            <Path d="M16 16 L16 26 M10 27 L22 27" />
          </G>
        )}
        {glyph === 'mug' && (
          <G>
            <Path d="M6 11 L24 11 L22 25 L8 25 Z" />
            <Path d="M24 14 A4.5 4.5 0 0 1 23 22" />
            <Path d="M12 7 Q14 4.5 12 2.5 M18 7 Q20 4.5 18 2.5" strokeWidth={1.8} opacity={0.7} />
          </G>
        )}
        {glyph === 'rug' && (
          <G>
            <Ellipse cx={16} cy={18} rx={12} ry={7} />
            <Ellipse cx={16} cy={18} rx={6} ry={3.4} opacity={0.6} />
            <Path d="M3.5 18 L1 18 M28.5 18 L31 18 M16 25 L16 27.5 M16 11 L16 8.5" strokeWidth={1.8} opacity={0.7} />
          </G>
        )}
        {glyph === 'window' && (
          <G>
            <Rect x={5} y={5} width={22} height={22} rx={4} />
            <Path d="M16 5 L16 27 M5 16 L27 16" />
            <Circle cx={21.5} cy={10.5} r={2.4} fill={color} stroke="none" opacity={0.5} />
          </G>
        )}
      </G>
    </Svg>
  );
}
