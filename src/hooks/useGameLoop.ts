import { useRef, useState, useCallback, useEffect } from 'react';
import { GameState, GameAction } from '../game/types';
import { INITIAL_STATE, transition } from '../game/transitions';
import { update } from '../game/loop';
import { tickIntervalMs } from '../game/clock';

export interface UseGameLoopResult {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

export function useGameLoop(): UseGameLoopResult {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const rafIdRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>(INITIAL_STATE);

  const tick = useCallback((timestamp: number) => {
    const lastTime = lastFrameTimeRef.current ?? timestamp;
    const elapsed = timestamp - lastTime;
    lastFrameTimeRef.current = timestamp;

    if (gameStateRef.current.phase === 'playing') {
      accumulatorRef.current += elapsed;

      // The interval is re-read each pass: eating mid-catch-up can raise the
      // score past a speed boundary and shorten the very next beat.
      let interval = tickIntervalMs(gameStateRef.current.score);
      while (accumulatorRef.current >= interval) {
        gameStateRef.current = update(gameStateRef.current, timestamp);
        accumulatorRef.current -= interval;
        interval = tickIntervalMs(gameStateRef.current.score);
      }

      setGameState(gameStateRef.current);
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [tick]);

  const dispatch = useCallback((action: GameAction) => {
    const nextState = transition(gameStateRef.current, action);
    gameStateRef.current = nextState;

    if (
      action.type === 'START_GAME' ||
      action.type === 'PAUSE' ||
      action.type === 'RESUME' ||
      action.type === 'RESTART'
    ) {
      accumulatorRef.current = 0;
      lastFrameTimeRef.current = null;
    }

    setGameState(nextState);
  }, []);

  return { gameState, dispatch };
}
