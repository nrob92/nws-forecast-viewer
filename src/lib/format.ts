export function formatDateTime(value: string, options: Intl.DateTimeFormatOptions = {}) {
  if (!value) {
    return 'Not provided';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    ...options,
  }).format(new Date(value));
}

export function formatPercent(value: number | null | undefined) {
  return typeof value === 'number' ? `${Math.round(value)}%` : 'Not available';
}

export function formatCoordinate(value: number) {
  return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

export function compactLocationLabel(label: string) {
  const pieces = label.split(',').map((piece) => piece.trim());
  return pieces.slice(0, 3).join(', ');
}
