import { User } from "@supabase/supabase-js";

const GUEST_USER_LOCALSTORAGE_KEY = "skrambol-guest";

function setGuestUserToLocalStorage(input: User | null) {
  if (!input) {
    throw new Error("No User input");
  }

  return localStorage.setItem(
    GUEST_USER_LOCALSTORAGE_KEY,
    JSON.stringify(input)
  );
}

function getGuestUserFromLocalStorage() {
  const user = localStorage.getItem(GUEST_USER_LOCALSTORAGE_KEY);
  return user && JSON.parse(user);
}

export { setGuestUserToLocalStorage, getGuestUserFromLocalStorage };
