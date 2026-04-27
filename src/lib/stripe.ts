import Stripe from 'stripe';

export const getStripeServerClient = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });
};

// Helper to create Stripe OAuth URL
export const getStripeOAuthUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: process.env.STRIPE_CLIENT_ID || '',
    state,
    scope: 'read:org_settings,read:account',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/oauth-callback`,
  });

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
};

// Helper to exchange OAuth code for access token
export const exchangeOAuthCode = async (code: string): Promise<string> => {
  const response = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_secret: process.env.STRIPE_SECRET_KEY || '',
      code,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange OAuth code');
  }

  const data = (await response.json()) as { access_token?: string; stripe_user_id?: string };
  return data.stripe_user_id || '';
};
