import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import { CreateUserInput, UpdateUserInput, UpdateUsernameInput } from "@/lib/validations/user";

type User = Database["public"]["Tables"]["users"]["Row"];
type UpdateUsernameResult = {
  success: boolean;
  username: string | null;
  username_duplicate: number | null;
  message: string;
};

export interface IUserRepository {
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  updateUsername(id: string, data: UpdateUsernameInput): Promise<UpdateUsernameResult>;
  getById(id: string): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(data: CreateUserInput): Promise<User> {
    // Get next available username_duplicate if not provided
    let usernameDuplicate = data.username_duplicate;

    const { data: nextDuplicateResult, error: duplicateError } =
      await this.supabase.rpc("get_next_username_duplicate", {
        p_username: data.username,
      });

    if (duplicateError) throw duplicateError;
    usernameDuplicate = nextDuplicateResult;

    const { data: user, error } = await this.supabase
      .from("users")
      .insert({
        email: data.email || null,
        username: data.username,
        is_guest: data.is_guest || false,
        username_duplicate: usernameDuplicate,
        avatar: data.avatar || null,
        preferences: data.preferences || null,
      })
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const updateData: Record<string, any> = {};
    
    if (data.email !== undefined) updateData.email = data.email;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.preferences !== undefined) updateData.preferences = data.preferences;
    
    // Handle username separately if provided (without using the function)
    if (data.username !== undefined) updateData.username = data.username;

    const { data: user, error } = await this.supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  async updateUsername(id: string, data: UpdateUsernameInput): Promise<UpdateUsernameResult> {
    const { data: result, error } = await this.supabase.rpc("update_user_username", {
      p_user_id: id,
      p_new_username: data.username,
    });

    if (error) throw error;
    return result[0]; // RPC returns array, take first result
  }

  async getById(id: string): Promise<User | null> {
    const { data: user, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return user;
  }
}
