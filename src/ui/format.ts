export function formatRelativeAge(timestamp: string, now = Date.now()): string {
  const value = new Date(timestamp).getTime();
  if (!Number.isFinite(value)) return 'Unknown time';
  const minutes = Math.max(0, Math.floor((now - value) / 60_000));
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
}

export function formatTimelineTime(timestamp: string): string {
  const value = new Date(timestamp);
  if (!Number.isFinite(value.getTime())) return 'Unknown time';
  return value.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
