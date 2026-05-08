// Utility functions

export const eur = (value: number, options?: { compact?: boolean }): string => {
  if (options?.compact) {
    if (value >= 1_000_000) {
      return `€${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
    }
    if (value >= 10_000) {
      return `€${Math.round(value / 1000)}k`;
    }
    if (value >= 1_000) {
      return `€${(value / 1000).toFixed(1)}k`;
    }
    return `€${value}`;
  }

  // Format with consistent en-US locale for both server and client
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const num = (value: number): string => {
  // Format with consistent en-US locale for both server and client
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string | null): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

export const maskStripeId = (id: string): string => {
  if (id.length <= 8) return id;
  return id.slice(0, 8) + '···' + id.slice(-4);
};

// IP address from request
export const getIpAddress = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0] : request.headers.get('x-client-ip') || 'unknown';
};
