import * as supabaseAuth from "./clients/supabase";

const authClient = (provider: string) => {
  switch (provider) {
    case "supabase":
      return supabaseAuth;
    // Future providers can be added here
    default:
      throw new Error(`Unknown auth provider: ${provider}`);
  }
};

export default authClient;
