import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Scene } from '../types';

/**
 * A half-panel scene on one grammar: same sky field, same hill line, same
 * horizon at y=150. Only the props change, so two different scenes can butt
 * together down the middle of one card without reading as two pictures.
 */

const INK = '#2E2A21';

export interface StageProps {
  scene?: Scene;
  /** Expired status: the scene props leave with the update, so nothing stale is implied. */
  unknown?: boolean;
  side?: 'left' | 'right';
  width?: number | string;
  height?: number | string;
}

export function Stage({ scene = 'Auto', unknown = false, side = 'left', width = '100%', height = '100%' }: StageProps) {
  const key = unknown ? 'unknown' : scene;
  const right = side === 'right';
  const cloudX = right ? 116 : 44;
  const cloudX2 = right ? 148 : 78;

  return (
    <Svg viewBox="0 0 180 216" width={width} height={height} preserveAspectRatio="xMidYMax slice">
      <Rect x={0} y={0} width={180} height={216} fill="#DCE9B2" />
      <G opacity={0.75}>
        <Ellipse cx={cloudX} cy={34} rx={26} ry={11} fill="#FFFDF8" />
        <Ellipse cx={cloudX2} cy={28} rx={16} ry={8} fill="#FFFDF8" />
      </G>
      <Path d="M-10 132 Q40 112 92 130 Q140 146 190 126 L190 160 L-10 160 Z" fill="#C6D993" />
      <Rect x={0} y={150} width={180} height={66} fill="#B7CD86" />
      <Path d="M0 150 L180 150" stroke="#9FB86D" strokeWidth={2} />

      {key === 'Auto' && (
        <G stroke="#52715A" strokeWidth={3} strokeLinecap="round" fill="none">
          <Path d="M18 150 L14 138 M24 150 L24 136 M30 150 L34 139" />
          <Path d="M150 150 L146 140 M158 150 L158 134 M166 150 L170 141" />
          <Ellipse cx={40} cy={168} rx={11} ry={6} fill="#9FB86D" stroke="none" />
        </G>
      )}

      {key === 'Desk nest' && (
        <G>
          <Rect x={6} y={124} width={168} height={9} rx={4} fill="#C07A62" stroke={INK} strokeWidth={2.6} />
          <Path d="M20 133 L20 158 M160 133 L160 158" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <Path d="M20 133 L20 158 M160 133 L160 158" stroke="#C07A62" strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M30 124 L30 96 Q30 84 46 84" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          <Path d="M38 78 L58 78 L52 92 L44 92 Z" fill="#F6D66B" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
          <Rect x={140} y={112} width={18} height={12} rx={3} fill="#FFFDF8" stroke={INK} strokeWidth={2.4} />
        </G>
      )}

      {key === 'Couch mode' && (
        <G>
          <Rect x={8} y={96} width={164} height={60} rx={20} fill="#CEC5ED" stroke={INK} strokeWidth={2.8} />
          <Rect x={8} y={122} width={30} height={38} rx={14} fill="#B7ADD9" stroke={INK} strokeWidth={2.8} />
          <Rect x={142} y={122} width={30} height={38} rx={14} fill="#B7ADD9" stroke={INK} strokeWidth={2.8} />
          <Rect x={46} y={104} width={26} height={26} rx={8} transform="rotate(-10 59 117)" fill="#F2B38F" stroke={INK} strokeWidth={2.6} />
        </G>
      )}

      {key === 'Outdoors' && (
        <G>
          <Path d="M22 150 L22 116" stroke="#7C5540" strokeWidth={9} strokeLinecap="round" />
          <Circle cx={22} cy={102} r={20} fill="#52715A" />
          <Circle cx={40} cy={112} r={13} fill="#36513F" />
          <Circle cx={6} cy={112} r={12} fill="#36513F" />
          <Ellipse cx={150} cy={160} rx={14} ry={7} fill="#9FB86D" />
          <Ellipse cx={168} cy={170} rx={9} ry={5} fill="#9FB86D" />
        </G>
      )}

      {key === 'Café' && (
        <G>
          <Rect x={122} y={126} width={56} height={8} rx={4} fill="#FFFDF8" stroke={INK} strokeWidth={2.6} />
          <Path d="M150 134 L150 158" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <Path d="M137 158 L163 158" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Rect x={135} y={112} width={16} height={14} rx={3} fill="#F2B38F" stroke={INK} strokeWidth={2.4} />
          <Path d="M151 116 A5 5 0 0 1 151 124" fill="none" stroke={INK} strokeWidth={2.4} />
          <Path d="M0 70 L60 70" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <Path d="M14 70 L14 84 M34 70 L34 90 M52 70 L52 80" stroke="#52715A" strokeWidth={2.4} strokeLinecap="round" />
          <Circle cx={14} cy={88} r={6} fill="#52715A" />
          <Circle cx={34} cy={94} r={7} fill="#36513F" />
          <Circle cx={52} cy={84} r={5} fill="#52715A" />
        </G>
      )}

      {key === 'Blanket fort' && (
        <G>
          <Path d="M-6 150 Q30 60 90 46 Q150 60 186 150 Z" fill="#F2B38F" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
          <Path d="M-6 150 Q30 60 90 46" fill="none" stroke="#E09A72" strokeWidth={6} />
          <Path d="M90 46 L90 34" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={90} cy={30} r={6} fill="#F6D66B" stroke={INK} strokeWidth={2.4} />
          <Path d="M40 150 Q90 120 140 150 Z" fill="#25251F" opacity={0.14} />
        </G>
      )}

      {key === 'unknown' && (
        <G fill="#52715A" opacity={0.35}>
          <Circle cx={34} cy={120} r={3} />
          <Circle cx={90} cy={112} r={3} />
          <Circle cx={146} cy={120} r={3} />
        </G>
      )}
    </Svg>
  );
}
