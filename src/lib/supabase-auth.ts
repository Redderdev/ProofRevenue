/**
 * Supabase Auth Integration Layer
 * 
 * Replaces custom bcrypt/JWT auth with Supabase Auth while maintaining compatibility
 * with existing application flow.
 */
import { supabase } from './supabase-client';

export interface AuthUser {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
export const signUpUser = async (email: string, password: string): Promise<{ user: AuthUser }> => {
  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`);
  }

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
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
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: data.user.email,
      is_active: true,
      failed_login_attempts: 0,
    })
    .select()
    .single();

  if (profileError && !profileError.message.includes('duplicate')) {
    console.error('Profile creation error:', profileError);
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      isActive: true,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at,
    },
  };
};

/**
 * Sign in user with Supabase Auth
 */
export const signInUser = async (email: string, password: string): Promise<{ user: AuthUser; session: any }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
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

  // Record successful login - reset failed attempts
  await supabase
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
      updatedAt: data.user.updated_at,
    },
    session: data.session,
  };
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email!,
    isActive: profile?.is_active ?? true,
    createdAt: data.user.created_at,
    updatedAt: data.user.updated_at,
  };
};

/**
 * Sign out user
 */
export const signOutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

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
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email!,
        isActive: true,
        createdAt: session.user.created_at,
        updatedAt: session.user.updated_at,
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
