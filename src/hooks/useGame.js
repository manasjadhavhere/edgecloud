// src/hooks/useGame.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, off } from "firebase/database";

/**
 * Real-time listener hook for a single game.
 * Returns the game metadata and all responses as arrays.
 */
export function useGame(gameId) {
  const [game, setGame] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);

    const unsubscribe = onValue(
      gameRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Game not found");
          setLoading(false);
          return;
        }
        const data = snapshot.val();
        const { responses: rawResponses, ...meta } = data;

        setGame(meta);
        setResponses(
          rawResponses
            ? Object.entries(rawResponses).map(([id, val]) => ({ id, ...val }))
            : []
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => off(gameRef, "value", unsubscribe);
  }, [gameId]);

  return { game, responses, loading, error };
}

/**
 * Hook to watch the currently active game ID from Firebase.
 * The host writes to /activeGame when they start a game.
 */
export function useActiveGame() {
  const [activeGameId, setActiveGameId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeRef = ref(db, "activeGame");
    const unsubscribe = onValue(activeRef, (snapshot) => {
      setActiveGameId(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    });
    return () => off(activeRef, "value", unsubscribe);
  }, []);

  return { activeGameId, loading };
}
