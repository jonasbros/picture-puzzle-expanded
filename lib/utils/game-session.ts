const GAME_SESSION_LOCALSTORAGE_KEY = "skrambol__game-session";

function setGameSessionFromLocalStorage(gameSession: object) {
  if (!gameSession) {
    throw new Error("No game session input provided");
  }

  return localStorage.setItem(
    GAME_SESSION_LOCALSTORAGE_KEY,
    JSON.stringify(gameSession)
  );
}

function getGameSessionFromLocalStorage() {
  const gameSession = localStorage.getItem(GAME_SESSION_LOCALSTORAGE_KEY);
  return gameSession && JSON.parse(gameSession);
}

function clearGameSessionFromLocalStorage() {
  localStorage.removeItem(GAME_SESSION_LOCALSTORAGE_KEY);
}

export {
  setGameSessionFromLocalStorage,
  getGameSessionFromLocalStorage,
  clearGameSessionFromLocalStorage,
};
