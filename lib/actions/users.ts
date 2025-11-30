"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createUserService } from "@/lib/services/user-service";
import { 
  CreateUserInput, 
  UpdateUserInput, 
  UpdateUsernameInput 
} from "@/lib/validations/user";

export async function createUserAction(data: CreateUserInput) {
  try {
    const supabase = await createClient();
    const userService = createUserService(supabase);

    const user = await userService.createUser(data);

    revalidatePath("/users");

    return { success: true, data: user };
  } catch (error) {
    console.error("Create user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

export async function updateUserAction(id: string, data: UpdateUserInput) {
  try {
    const supabase = await createClient();
    const userService = createUserService(supabase);

    const user = await userService.updateUser(id, data);

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);

    return { success: true, data: user };
  } catch (error) {
    console.error("Update user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

export async function updateUsernameAction(id: string, data: UpdateUsernameInput) {
  try {
    const supabase = await createClient();
    const userService = createUserService(supabase);

    const result = await userService.updateUsername(id, data);

    if (!result.success) {
      return {
        success: false,
        error: result.message,
      };
    }

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);

    return { success: true, data: result };
  } catch (error) {
    console.error("Update username error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update username",
    };
  }
}

export async function getUserByIdAction(id: string) {
  try {
    const supabase = await createClient();
    const userService = createUserService(supabase);

    const user = await userService.getUserById(id);

    return { success: true, data: user };
  } catch (error) {
    console.error("Get user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}