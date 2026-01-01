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
  bio?: string;
  skills?: string[];
  tags?: string[];
  linkedin_url?: string;
  whatsapp_number?: string;
  member_since?: string;
  batch?: string;
  department?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'connected';
  created_at: string;
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

/**
 * Get all profiles (for members list)
 * Excludes the current user
 */
export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Exclude current user if logged in
    if (user) {
      query = query.neq('id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    return (data as Profile[]) || [];
  } catch (err) {
    console.error('Exception fetching profiles:', err);
    return [];
  }
}

/**
 * CONNECTION HELPERS
 */

/**
 * Get connection status between current user and another user
 * Returns: 'none' | 'pending' | 'connected'
 */
export async function getConnectionStatus(
  otherUserId: string
): Promise<'none' | 'pending' | 'connected'> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'none';
    }

    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .single();

    if (error || !data) {
      return 'none';
    }

    return data.status as 'pending' | 'connected';
  } catch (err) {
    console.error('Exception checking connection status:', err);
    return 'none';
  }
}

/**
 * Create a connection request
 */
export async function createConnectionRequest(
  receiverId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('connections')
      .insert({
        requester_id: user.id,
        receiver_id: receiverId,
        status: 'pending',
      });

    if (error) {
      console.error('Error creating connection request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception creating connection request:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all connections for current user
 */
export async function getUserConnections(): Promise<Connection[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'connected');

    if (error) {
      console.error('Error fetching connections:', error);
      return [];
    }

    return (data as Connection[]) || [];
  } catch (err) {
    console.error('Exception fetching connections:', err);
    return [];
  }
}

/**
 * Delete a connection
 */
export async function deleteConnection(
  connectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      console.error('Error deleting connection:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception deleting connection:', err);
    return { success: false, error: err.message };
  }
}


