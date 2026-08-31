import { BottomNavigation } from 'monkey-tracker';

const frame: React.CSSProperties = { position: 'relative', width: 390, height: 150, background: '#F6F1E7', overflow: 'hidden' };
const noop = () => {};

export function HomeActive() {
  return (
    <div style={frame}>
      <BottomNavigation active="home" onHome={noop} onUpdate={noop} onHistory={noop} />
    </div>
  );
}

export function HistoryActive() {
  return (
    <div style={frame}>
      <BottomNavigation active="history" onHome={noop} onUpdate={noop} onHistory={noop} />
    </div>
  );
}
