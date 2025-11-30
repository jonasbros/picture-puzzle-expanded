import { create } from "zustand";

import { User } from "@supabase/supabase-js";

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (user: User) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
