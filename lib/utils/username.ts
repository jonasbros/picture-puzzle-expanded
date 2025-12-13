/**
 * Utility functions for handling usernames with duplicate numbers
 */

/**
 * Formats a username with its duplicate number as username#0001
 * @param username - The base username
 * @param duplicate - The duplicate number (defaults to 1)
 * @returns Formatted username like "john#0001"
 */
export function formatUsername(
  username: string,
  duplicate: number = 1
): string {
  const paddedNumber = duplicate.toString().padStart(4, "0");
  return `${username}#${paddedNumber}`;
}

/**
 * Parses a formatted username back into its components
 * @param formattedUsername - Username like "john#0001"
 * @returns Object with username and duplicate number
 */
export function parseUsername(formattedUsername: string): {
  username: string;
  duplicate: number;
} {
  const match = formattedUsername.match(/^(.+)#(\d+)$/);

  if (match) {
    return {
      username: match[1],
      duplicate: parseInt(match[2], 10),
    };
  }

  // If no # found, assume it's a base username with duplicate 1
  return {
    username: formattedUsername,
    duplicate: 1,
  };
}

/**
 * Type for user data with formatted display name
 */
export interface UserWithDisplayName {
  id: string;
  username: string;
  username_duplicate: number;
  is_guest: boolean;
  displayName: string; // Computed: username#0001
}

/**
 * Adds a formatted display name to user data
 * @param user - User object with username and username_duplicate
 * @returns User object with added displayName property
 */
export function addDisplayName<
  T extends { username: string; username_duplicate: number }
>(user: T): T & { displayName: string } {
  return {
    ...user,
    displayName: formatUsername(user.username, user.username_duplicate),
  };
}
