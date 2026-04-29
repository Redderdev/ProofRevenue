/**
 * Supabase Auth Integration Layer
 * 
 * Replaces custom bcrypt/JWT auth with Supabase Auth while maintaining compatibility
 * with existing application flow.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase-client';

export interface AuthUser {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ensureUserProfile = async (
  client: SupabaseClient,
  user: { id: string; email?: string | null }
) => {
  const { data: profile, error: profileError } = await client
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Profile lookup error:', profileError);
    return;
  }

  if (profile) {
    return;
  }

  const { error: insertError } = await client
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      is_active: true,
      failed_login_attempts: 0,
    });

  if (insertError && !insertError.message.includes('duplicate')) {
    console.error('Profile creation error:', insertError);
  }
};

/**
 * Validate password strength (same requirements as before)
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Sign up user with Supabase Auth
 * Creates user in Supabase auth table and public.users profile
 */
export const signUpUser = async (
  email: string,
  password: string,
  client: SupabaseClient = supabase
): Promise<{ user: AuthUser }> => {
  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`);
  }

  // Sign up with Supabase Auth
  const { data, error } = await client.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    console.error('Supabase signup error:', error);
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('User creation failed');
  }

  // Create user profile in public.users table
  await ensureUserProfile(client, { id: data.user.id, email: data.user.email });

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      isActive: true,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at ?? data.user.created_at,
    },
  };
};

/**
 * Sign in user with Supabase Auth
 */
export const signInUser = async (
  email: string,
  password: string,
  client: SupabaseClient = supabase
): Promise<{ user: AuthUser; session: any }> => {
  const { data, error } = await client.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });

  if (error) {
    console.error('Supabase signin error:', error);
    throw new Error(error.message);
  }

  if (!data.user || !data.session) {
    throw new Error('Sign-in failed');
  }

  await ensureUserProfile(client, { id: data.user.id, email: data.user.email });

  // Record successful login - reset failed attempts
  await client
    .from('users')
    .update({
      failed_login_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.user.id);

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      isActive: true,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at ?? data.user.created_at,
    },
    session: data.session,
  };
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (
  client: SupabaseClient = supabase
): Promise<AuthUser | null> => {
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  // Fetch user profile
  const { data: profile } = await client
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email!,
    isActive: profile?.is_active ?? true,
    createdAt: data.user.created_at,
    updatedAt: data.user.updated_at ?? data.user.created_at,
  };
};

/**
 * Sign out user
 */
export const signOutUser = async (client: SupabaseClient = supabase): Promise<void> => {
  const { error } = await client.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    throw new Error(error.message);
  }
};

/**
 * Get current session
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Get session error:', error);
    return null;
  }

  return data.session;
};

/**
 * Listen for auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email!,
        isActive: true,
        createdAt: session.user.created_at,
        updatedAt: session.user.updated_at ?? session.user.created_at,
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Refresh session
 */
export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Refresh session error:', error);
    return null;
  }

  return data.session;
};
