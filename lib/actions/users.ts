"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createUserService } from "@/lib/services/user-service";
import { CreateUserInput } from "@/lib/validations/user";

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