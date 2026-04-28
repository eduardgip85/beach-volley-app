import { supabase } from "../../../config/supabase";
import type { UserProfile } from "../types/auth.types";

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

function mapProfile(profile: any): UserProfile {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    avatarUrl: profile.avatar_url,
    createdAt: profile.created_at,
  };
}

export async function registerUser({
  email,
  password,
  fullName,
}: RegisterData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  const userId = authData.user?.id;

  if (!userId) {
    throw new Error("User could not be created");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName,
    email,
    role: "player",
  });

  if (profileError) throw profileError;

  return authData;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return mapProfile(data);
}