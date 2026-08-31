import { Chip } from 'monkey-tracker';

const row: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16, background: '#F6F1E7', maxWidth: 460 };
const noop = () => {};

export function Activities() {
  const items = ['Studying', 'Working', 'Eating', 'Chilling', 'Sleeping', 'Gaming'];
  return (
    <div style={row}>
      {items.map((label) => <Chip key={label} label={label} selected={label === 'Gaming'} onPress={noop} />)}
    </div>
  );
}

export function Moods() {
  const items = ['Crispy', 'Cozy', 'Focused', 'Wobbly', 'Happy', 'Frazzled'];
  return (
    <div style={row}>
      {items.map((label) => <Chip key={label} label={label} selected={label === 'Cozy'} onPress={noop} />)}
    </div>
  );
}

export function Availability() {
  const items = ['Free', 'Text only', 'Busy', 'Asleep'];
  return (
    <div style={row}>
      {items.map((label) => <Chip key={label} label={label} selected={label === 'Busy'} onPress={noop} />)}
    </div>
  );
}

export function SelectedAndUnselected() {
  return (
    <div style={row}>
      <Chip label="Unselected" onPress={noop} />
      <Chip label="Selected" selected onPress={noop} />
    </div>
  );
}
