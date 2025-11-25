import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import {
  UserRepository,
  IUserRepository,
} from "@/lib/repositories/user-repository";
import {
  createUserSchema,
  CreateUserInput,
} from "@/lib/validations/user";

type User = Database["public"]["Tables"]["users"]["Row"];

export interface IUserService {
  createUser(data: CreateUserInput): Promise<User>;
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
}

// Factory function for easy instantiation
export function createUserService(
  supabase: SupabaseClient<Database>
): IUserService {
  return new UserService(supabase);
}