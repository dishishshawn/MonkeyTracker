import { MonkeyAvatar } from 'monkey-tracker';

const row: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 20, padding: 20, background: '#DCE9B2', alignItems: 'flex-end', maxWidth: 520 };

export function Colorways() {
  const furs = ['#4B3227', '#7C5540', '#C07A62', '#5F7562', '#7FA8D9', '#F0A8C8'];
  return (
    <div style={row}>
      {furs.map((accent) => <MonkeyAvatar key={accent} activity="Chilling" accent={accent} />)}
    </div>
  );
}

export function ActivityProps() {
  const acts = ['Studying', 'Cooking', 'Gaming', 'At the gym'] as const;
  return (
    <div style={row}>
      {acts.map((activity) => <MonkeyAvatar key={activity} activity={activity} accent="#4B3227" />)}
    </div>
  );
}

export function Accessories() {
  const items = ['Glasses', 'Beanie', 'Crown', 'Flower'] as const;
  return (
    <div style={row}>
      {items.map((accessory) => <MonkeyAvatar key={accessory} activity="Chilling" accent="#7C5540" accessory={accessory} />)}
    </div>
  );
}

export function Poses() {
  const items = ['Waving', 'Locked in', 'Flopped', 'Victory'] as const;
  return (
    <div style={row}>
      {items.map((pose) => <MonkeyAvatar key={pose} activity="Working" accent="#5F7562" pose={pose} />)}
    </div>
  );
}

export function Sizes() {
  return (
    <div style={row}>
      <MonkeyAvatar activity="Chilling" accent="#4B3227" size="small" />
      <MonkeyAvatar activity="Chilling" accent="#4B3227" size="large" />
    </div>
  );
}
