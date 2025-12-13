import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import {
  UserRepository,
  IUserRepository,
} from "@/lib/repositories/user-repository";
import {
  createUserSchema,
  updateUserSchema,
  updateUsernameSchema,
  CreateUserInput,
  UpdateUserInput,
  UpdateUsernameInput,
} from "@/lib/validations/user";

type User = Database["public"]["Tables"]["users"]["Row"];
type UpdateUsernameResult = {
  success: boolean;
  username: string | null;
  username_duplicate: number | null;
  message: string;
};

export interface IUserService {
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: string, data: UpdateUserInput): Promise<User>;
  updateUsername(
    id: string,
    data: UpdateUsernameInput
  ): Promise<UpdateUsernameResult>;
  getUserById(id: string): Promise<User | null>;
}

export class UserService implements IUserService {
  private repository: IUserRepository;
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.repository = new UserRepository(supabase);
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const validatedData = createUserSchema.parse(data);

    // Business logic: Check for duplicate email (only if email is provided)
    if (validatedData.email) {
      const { data: existingUser, error } = await this.supabase
        .from("users")
        .select("id")
        .eq("email", validatedData.email)
        .is("deleted_at", null)
        .single();

      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      // If error is not "no rows found", throw it
      if (error && error.code !== "PGRST116") {
        throw error;
      }
    }

    return await this.repository.create(validatedData);
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const validatedData = updateUserSchema.parse(data);

    // Business logic: Check for duplicate email (only if email is provided and changed)
    if (validatedData.email) {
      const { data: existingUser, error } = await this.supabase
        .from("users")
        .select("id")
        .eq("email", validatedData.email)
        .neq("id", id) // Exclude current user
        .is("deleted_at", null)
        .single();

      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      // If error is not "no rows found", throw it
      if (error && error.code !== "PGRST116") {
        throw error;
      }
    }

    return await this.repository.update(id, validatedData);
  }

  async updateUsername(
    id: string,
    data: UpdateUsernameInput
  ): Promise<UpdateUsernameResult> {
    const validatedData = updateUsernameSchema.parse(data);
    return await this.repository.updateUsername(id, validatedData);
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.repository.getById(id);
  }
}

// Factory function for easy instantiation
export function createUserService(
  supabase: SupabaseClient<Database>
): IUserService {
  return new UserService(supabase);
}
