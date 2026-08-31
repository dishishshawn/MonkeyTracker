import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Accessory, Activity, Mood, Pose } from '../types';
import { colors } from '../theme';

/**
 * One monkey, drawn in layers: a base body whose fur and face tone are color
 * props, with activity, pose, accessory and mood composed over it at fixed
 * anchors. Ported from the Claude Design illustration system.
 */

const INK = '#2E2A21';

const SHADE: Record<string, string> = {
  '#996744': '#7E5236', '#7C5540': '#654433', '#C07A62': '#A2624D',
  '#5F7562': '#4C5F50', '#77B9E8': '#5E9CC9', '#F49ABB': '#DA7C9F',
};
const DEFAULT_SKIN: Record<string, string> = {
  '#996744': '#EBC6A6', '#7C5540': '#F2C9A9', '#C07A62': '#EBC6A6',
  '#5F7562': '#F2C9A9', '#77B9E8': '#EBC6A6', '#F49ABB': '#FFD9E8',
};
const CHEEK: Record<string, string> = {
  '#EBC6A6': '#D98E82', '#F2C9A9': '#E99C94', '#FFD9E8': '#F17EA9',
  '#C9906F': '#A96055', '#8C5A45': '#704334',
};
/** Face tone must stay clearly lighter than fur; these pairs muddy, so step up. */
const MUDDY: Record<string, true> = {
  '#7C5540|#8C5A45': true, '#996744|#8C5A45': true,
  '#C07A62|#C9906F': true, '#996744|#C9906F': true,
};

const AUTO_POSE: Record<Activity, Pose> = {
  Studying: 'Locked in', Working: 'Locked in', Gaming: 'Locked in',
  Sleeping: 'Flopped', Chilling: 'Flopped', 'At the gym': 'Victory',
  Eating: 'Auto', Cooking: 'Auto', Commuting: 'Auto', 'Out & about': 'Waving',
};

type Eye = 'open' | 'closed' | 'narrow' | 'wide' | 'half';
type Mouth = 'smile' | 'small' | 'straight' | 'wavy' | 'open';

/**
 * Social and Quiet have no drawn face in the design system — it shipped Fizzy
 * and Melted instead, which are not moods this app has. Social borrows Fizzy's
 * chatty open mouth; Quiet uses the neutral Calm face the unknown state uses.
 */
const MOOD_FACE: Record<Mood | 'Calm', [Eye, Mouth]> = {
  Happy: ['open', 'smile'], Cozy: ['closed', 'small'], Focused: ['narrow', 'straight'],
  Wobbly: ['wide', 'wavy'], Crispy: ['wide', 'straight'], Tender: ['closed', 'smile'],
  Sleepy: ['half', 'small'], Frazzled: ['wide', 'wavy'],
  Social: ['open', 'open'], Quiet: ['open', 'straight'], Calm: ['open', 'straight'],
};

export interface MonkeyProps {
  fur: string;
  skin?: string;
  activity?: Activity;
  pose?: Pose;
  accessory?: Accessory;
  mood?: Mood;
  /** Expired status. Drawn at full weight; only the color fields empty to paper. */
  unknown?: boolean;
  /** 'bust' crops to head and ears and drops the activity layer, for small sizes. */
  crop?: 'full' | 'bust';
  ground?: boolean;
  width?: number | string;
  height?: number | string;
}

export function Monkey({
  fur: furBase, skin, activity: activityProp = 'Chilling', pose: poseProp = 'Auto',
  accessory: accessoryProp = 'None', mood: moodProp = 'Happy', unknown = false,
  crop = 'full', ground = true, width = '100%', height = '100%',
}: MonkeyProps) {
  const bust = crop === 'bust';

  let skinBase = skin ?? DEFAULT_SKIN[furBase] ?? '#EBC6A6';
  if (MUDDY[`${furBase}|${skinBase}`]) skinBase = '#F2C9A9';

  const showActivity = !unknown && !bust;
  const activity = activityProp;
  const accessory = unknown ? 'None' : accessoryProp;
  let mood: Mood | 'Calm' = unknown ? 'Calm' : moodProp;
  if (activity === 'Sleeping' && !unknown) mood = 'Sleepy';
  let pose: Pose = poseProp !== 'Auto' ? poseProp : AUTO_POSE[activity];
  if (unknown) pose = 'Auto';

  const face = MOOD_FACE[mood] ?? MOOD_FACE.Happy;
  const eye: Eye = activity === 'Sleeping' && !unknown ? 'closed' : face[0];
  const mouth: Mouth = face[1];

  // Unknown empties the color fields to paper but keeps every line at full weight.
  const furC = unknown ? '#FFFDF8' : furBase;
  const skinC = unknown ? '#FFFDF8' : skinBase;
  const shadeC = unknown ? '#EFE7D6' : (SHADE[furBase] ?? '#7E5236');
  const cheekC = CHEEK[skinBase] ?? '#D98E82';
  const act = (name: Activity) => showActivity && activity === name;

  return (
    <Svg viewBox={bust ? '11 14 98 78' : '0 0 120 152'} width={width} height={height}>
      {!bust && ground && <Ellipse cx={60} cy={144} rx={32} ry={5.5} fill="#2E2A21" opacity={0.1} />}

      {act('Commuting') && (
        <G>
          <Rect x={14} y={92} width={24} height={32} rx={10} fill={INK} />
          <Rect x={16} y={94} width={20} height={28} rx={8} fill="#CEC5ED" />
          <Rect x={18} y={104} width={16} height={7} rx={3.5} fill={INK} opacity={0.45} />
        </G>
      )}
      {act('Sleeping') && (
        <G transform="rotate(-8 60 108)">
          <Rect x={16} y={94} width={88} height={40} rx={18} fill={INK} />
          <Rect x={18.5} y={96.5} width={83} height={35} rx={16} fill="#FFFDF8" />
        </G>
      )}

      <Path d="M84 118 C108 118 114 96 99 86" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <Path d="M84 118 C108 118 114 96 99 86" fill="none" stroke={furC} strokeWidth={6.5} strokeLinecap="round" />

      <G>
        <Path d="M48 124 L43 134" stroke={INK} strokeWidth={21} strokeLinecap="round" />
        <Path d="M72 124 L77 134" stroke={INK} strokeWidth={21} strokeLinecap="round" />
        <Path d="M48 124 L43 134" stroke={furC} strokeWidth={15} strokeLinecap="round" />
        <Path d="M72 124 L77 134" stroke={furC} strokeWidth={15} strokeLinecap="round" />
        <Ellipse cx={40} cy={135} rx={8.5} ry={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
        <Ellipse cx={80} cy={135} rx={8.5} ry={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
      </G>

      <Ellipse cx={60} cy={108} rx={29} ry={27} fill={furC} stroke={INK} strokeWidth={3} />
      <Ellipse cx={60} cy={113} rx={17.5} ry={14.5} fill={skinC} />
      <Path d="M42 96 A29 27 0 0 0 40 112" fill="none" stroke={shadeC} strokeWidth={5} strokeLinecap="round" opacity={0.7} />

      {pose === 'Auto' && (
        <G>
          <Path d="M36 97 L29 119" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M84 97 L91 119" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M36 97 L29 119" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Path d="M84 97 L91 119" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Circle cx={28} cy={122} r={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
          <Circle cx={92} cy={122} r={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
        </G>
      )}
      {pose === 'Waving' && (
        <G>
          <Path d="M36 97 L29 119" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M84 95 L99 70" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M36 97 L29 119" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Path d="M84 95 L99 70" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Circle cx={28} cy={122} r={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
          <Circle cx={101} cy={66} r={7.5} fill={skinC} stroke={INK} strokeWidth={2.8} />
        </G>
      )}
      {pose === 'Locked in' && (
        <G>
          <Path d="M36 97 L49 116" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M84 97 L71 116" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M36 97 L49 116" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Path d="M84 97 L71 116" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Circle cx={51} cy={118} r={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
          <Circle cx={69} cy={118} r={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
        </G>
      )}
      {pose === 'Flopped' && (
        <G>
          <Path d="M36 101 L18 111" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M84 101 L102 111" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M36 101 L18 111" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Path d="M84 101 L102 111" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Circle cx={16} cy={112} r={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
          <Circle cx={104} cy={112} r={6.5} fill={skinC} stroke={INK} strokeWidth={2.6} />
        </G>
      )}
      {pose === 'Victory' && (
        <G>
          <Path d="M36 96 L22 70" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M84 96 L98 70" stroke={INK} strokeWidth={19} strokeLinecap="round" />
          <Path d="M36 96 L22 70" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Path d="M84 96 L98 70" stroke={furC} strokeWidth={13} strokeLinecap="round" />
          <Circle cx={19} cy={66} r={7.5} fill={skinC} stroke={INK} strokeWidth={2.8} />
          <Circle cx={101} cy={66} r={7.5} fill={skinC} stroke={INK} strokeWidth={2.8} />
        </G>
      )}

      <G>
        <Circle cx={27} cy={50} r={11.5} fill={furC} stroke={INK} strokeWidth={3} />
        <Circle cx={27} cy={50} r={6} fill={skinC} />
        <Circle cx={93} cy={50} r={11.5} fill={furC} stroke={INK} strokeWidth={3} />
        <Circle cx={93} cy={50} r={6} fill={skinC} />
        <Circle cx={60} cy={54} r={31} fill={furC} stroke={INK} strokeWidth={3} />
        <Path d="M39 32 A31 31 0 0 0 32 58" fill="none" stroke={shadeC} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
        <Ellipse cx={60} cy={62} rx={21.5} ry={18} fill={skinC} stroke={INK} strokeWidth={2.4} />

        {!unknown && (
          <G>
            <Ellipse cx={44} cy={67} rx={5} ry={3.2} fill={cheekC} opacity={0.75} />
            <Ellipse cx={76} cy={67} rx={5} ry={3.2} fill={cheekC} opacity={0.75} />
          </G>
        )}

        {eye === 'open' && (
          <G>
            <Circle cx={51.5} cy={55} r={3.6} fill={INK} />
            <Circle cx={68.5} cy={55} r={3.6} fill={INK} />
            <Circle cx={52.8} cy={53.7} r={1.2} fill="#FFFDF8" />
            <Circle cx={69.8} cy={53.7} r={1.2} fill="#FFFDF8" />
          </G>
        )}
        {eye === 'closed' && (
          <G>
            <Path d="M47 56.5 Q51.5 51 56 56.5" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
            <Path d="M64 56.5 Q68.5 51 73 56.5" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
          </G>
        )}
        {eye === 'narrow' && (
          <G>
            <Path d="M47.5 55 L55.5 55" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <Path d="M64.5 55 L72.5 55" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <Path d="M46.5 47.5 L56 49.5" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
            <Path d="M73.5 47.5 L64 49.5" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          </G>
        )}
        {eye === 'wide' && (
          <G>
            <Circle cx={51.5} cy={55} r={5} fill="#FFFDF8" stroke={INK} strokeWidth={2.2} />
            <Circle cx={68.5} cy={55} r={5} fill="#FFFDF8" stroke={INK} strokeWidth={2.2} />
            <Circle cx={51.5} cy={55.6} r={2.4} fill={INK} />
            <Circle cx={68.5} cy={55.6} r={2.4} fill={INK} />
          </G>
        )}
        {eye === 'half' && (
          <G>
            <Path d="M47.9 55.4 A3.6 3.6 0 0 1 55.1 55.4 Z" fill={INK} />
            <Path d="M64.9 55.4 A3.6 3.6 0 0 1 72.1 55.4 Z" fill={INK} />
            <Path d="M47.9 55.4 L55.1 55.4" stroke={INK} strokeWidth={2} strokeLinecap="round" />
            <Path d="M64.9 55.4 L72.1 55.4" stroke={INK} strokeWidth={2} strokeLinecap="round" />
          </G>
        )}

        <Circle cx={57} cy={65.5} r={1.5} fill={INK} opacity={0.5} />
        <Circle cx={63} cy={65.5} r={1.5} fill={INK} opacity={0.5} />

        {mouth === 'smile' && <Path d="M53 69.5 Q60 76.5 67 69.5" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />}
        {mouth === 'small' && <Path d="M56.5 70.5 Q60 73.5 63.5 70.5" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />}
        {mouth === 'straight' && <Path d="M54 71 L66 71" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />}
        {mouth === 'wavy' && <Path d="M52 71.5 Q56 67.5 60 71.5 T68 71.5" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />}
        {mouth === 'open' && <Ellipse cx={60} cy={72} rx={5} ry={4.6} fill={INK} />}

        {act('Chilling') && (
          <G>
            <Path d="M28 44 A32 32 0 0 1 92 44" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
            <Path d="M28 44 A32 32 0 0 1 92 44" fill="none" stroke={colors.mossDark} strokeWidth={4} strokeLinecap="round" />
            <Rect x={18} y={42} width={18} height={22} rx={9} fill={colors.mossDark} stroke={INK} strokeWidth={2.6} />
            <Rect x={84} y={42} width={18} height={22} rx={9} fill={colors.mossDark} stroke={INK} strokeWidth={2.6} />
          </G>
        )}

        {accessory === 'Glasses' && (
          <G>
            <Circle cx={51.5} cy={55} r={8.5} fill="#FFFDF8" fillOpacity={0.22} stroke={INK} strokeWidth={2.6} />
            <Circle cx={68.5} cy={55} r={8.5} fill="#FFFDF8" fillOpacity={0.22} stroke={INK} strokeWidth={2.6} />
            <Path d="M43 54 L38 52" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
            <Path d="M77 54 L82 52" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          </G>
        )}
        {accessory === 'Beanie' && (
          <G>
            <Path d="M31 40 A29 29 0 0 1 89 40 Z" fill={colors.peach} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <Rect x={28} y={36} width={64} height={10} rx={5} fill={colors.peach} stroke={INK} strokeWidth={3} />
            <Circle cx={60} cy={15} r={7} fill={colors.yellow} stroke={INK} strokeWidth={3} />
            <Path d="M60 22 L60 28" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          </G>
        )}
        {accessory === 'Crown' && (
          <Path d="M36 36 L40 16 L50 28 L60 12 L70 28 L80 16 L84 36 Z" fill={colors.yellow} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        )}
        {accessory === 'Flower' && (
          <G transform="translate(24 28)">
            <Circle cx={0} cy={-7} r={5.2} fill="#F49ABB" stroke={INK} strokeWidth={2.2} />
            <Circle cx={6.7} cy={-2.2} r={5.2} fill="#F49ABB" stroke={INK} strokeWidth={2.2} />
            <Circle cx={4.1} cy={5.7} r={5.2} fill="#F49ABB" stroke={INK} strokeWidth={2.2} />
            <Circle cx={-4.1} cy={5.7} r={5.2} fill="#F49ABB" stroke={INK} strokeWidth={2.2} />
            <Circle cx={-6.7} cy={-2.2} r={5.2} fill="#F49ABB" stroke={INK} strokeWidth={2.2} />
            <Circle cx={0} cy={0} r={4} fill={colors.yellow} stroke={INK} strokeWidth={2.2} />
          </G>
        )}
      </G>

      {act('Studying') && (
        <G>
          <Path d="M38 112 L60 106 L60 124 L38 130 Z" fill="#FFFDF8" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
          <Path d="M82 112 L60 106 L60 124 L82 130 Z" fill="#FFFDF8" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
          <Path d="M44 116 L55 113" stroke={INK} strokeWidth={1.8} strokeLinecap="round" opacity={0.45} />
          <Path d="M65 113 L76 116" stroke={INK} strokeWidth={1.8} strokeLinecap="round" opacity={0.45} />
        </G>
      )}
      {act('Working') && (
        <G>
          <Rect x={40} y={98} width={40} height={26} rx={4} fill="#CEC5ED" stroke={INK} strokeWidth={2.8} />
          <Rect x={45} y={103} width={30} height={16} rx={2} fill="#FFFDF8" />
          <Rect x={34} y={122} width={52} height={7} rx={3.5} fill="#B7ADD9" stroke={INK} strokeWidth={2.8} />
        </G>
      )}
      {act('Eating') && (
        <G>
          <Path d="M42 112 A18 18 0 0 0 78 112 Z" fill={colors.peach} stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
          <Path d="M40 112 L80 112" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
          <Path d="M52 108 Q56 100 62 106" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" opacity={0.6} />
          <Path d="M78 106 L92 96" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
        </G>
      )}
      {act('At the gym') && (
        <G>
          <Path d="M40 116 L80 116" stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <Path d="M40 116 L80 116" stroke="#FFFDF8" strokeWidth={4} strokeLinecap="round" />
          <Circle cx={36} cy={116} r={9} fill={colors.mossDark} stroke={INK} strokeWidth={2.8} />
          <Circle cx={84} cy={116} r={9} fill={colors.mossDark} stroke={INK} strokeWidth={2.8} />
        </G>
      )}
      {act('Cooking') && (
        <G>
          <Path d="M56 104 Q58 96 63 101" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
          <Ellipse cx={56} cy={114} rx={17} ry={6.5} fill="#4B4A42" stroke={INK} strokeWidth={2.8} />
          <Path d="M73 112 L92 106" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <Path d="M73 112 L92 106" stroke={colors.peach} strokeWidth={3} strokeLinecap="round" />
        </G>
      )}
      {act('Gaming') && (
        <G>
          <Rect x={41} y={108} width={38} height={17} rx={8.5} fill="#CEC5ED" stroke={INK} strokeWidth={2.8} />
          <Path d="M50 116.5 L56 116.5 M53 113.5 L53 119.5" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          <Circle cx={68} cy={114} r={2.4} fill={INK} />
          <Circle cx={72} cy={119} r={2.4} fill={INK} />
        </G>
      )}
      {act('Out & about') && (
        <G>
          <Path d="M86 104 A9 9 0 0 1 104 104" fill="none" stroke={INK} strokeWidth={2.8} />
          <Rect x={82} y={104} width={26} height={24} rx={4} fill={colors.peach} stroke={INK} strokeWidth={2.8} />
        </G>
      )}
      {act('Sleeping') && (
        <G>
          <Path d="M92 34 L102 34 L92 44 L102 44" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M100 18 L108 18 L100 26 L108 26" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </G>
      )}

      {unknown && !bust && (
        <G>
          <Circle cx={46} cy={16} r={3} fill={colors.moss} opacity={0.55} />
          <Circle cx={60} cy={12} r={3} fill={colors.moss} opacity={0.55} />
          <Circle cx={74} cy={16} r={3} fill={colors.moss} opacity={0.55} />
        </G>
      )}
    </Svg>
  );
}
