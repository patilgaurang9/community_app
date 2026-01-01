import { supabase } from './supabase';

/**
 * Database helper functions for profiles table
 */

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  location?: string;
  job_title?: string;
  company?: string;
  industry?: string;
  dob?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error('Exception fetching profile:', err);
    return null;
  }
}

/**
 * Create or update user profile
 */
export async function upsertProfile(
  userId: string,
  profileData: Partial<Profile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error upserting profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception upserting profile:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update specific profile fields
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception updating profile:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete user profile
 */
export async function deleteProfile(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception deleting profile:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if profile exists
 */
export async function profileExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    return !error && !!data;
  } catch (err) {
    console.error('Exception checking profile existence:', err);
    return false;
  }
}

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user');
      return null;
    }

    return await getProfile(user.id);
  } catch (err) {
    console.error('Exception getting current user profile:', err);
    return null;
  }
}

