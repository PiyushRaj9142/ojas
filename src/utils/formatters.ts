export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatWeight(kg: number, unit: 'kg' | 'quintal' = 'kg'): string {
  if (unit === 'quintal') {
    return `${(kg / 100).toFixed(1)} qtl`;
  }
  return `${kg} kg`;
}

export function formatTemp(tempC: number, unit: '°C' | '°F' = '°C'): string {
  if (unit === '°F') {
    return `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
  }
  return `${tempC.toFixed(1)}°C`;
}

export function formatPower(kw: number): string {
  return `${kw.toFixed(1)} kW`;
}

export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`;
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}
