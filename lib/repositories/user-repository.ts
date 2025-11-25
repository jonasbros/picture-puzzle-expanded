import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import { CreateUserInput } from "@/lib/validations/user";

type User = Database["public"]["Tables"]["users"]["Row"];

export interface IUserRepository {
  create(data: CreateUserInput): Promise<User>;
}

export class UserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(data: CreateUserInput): Promise<User> {
    const { data: user, error } = await this.supabase
      .from("users")
      .insert({
        email: data.email || null,
        username: data.username,
        is_guest: data.is_guest || false,
        username_duplicate: data.username_duplicate || 0,
        avatar: data.avatar || null,
        preferences: data.preferences || null,
      })
      .select()
      .single();

    if (error) throw error;
    return user;
  }
}