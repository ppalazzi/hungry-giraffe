import { useRef, useState, useCallback, useEffect } from 'react';
import { GameState, GameAction } from '../game/types';
import { INITIAL_STATE, transition } from '../game/transitions';
import { update } from '../game/loop';
import { MS_PER_TICK } from '../game/constants';

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

      while (accumulatorRef.current >= MS_PER_TICK) {
        gameStateRef.current = update(gameStateRef.current, timestamp);
        accumulatorRef.current -= MS_PER_TICK;
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
