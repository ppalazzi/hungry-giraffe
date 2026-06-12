import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { GameCanvas } from './components/GameCanvas';
import { GameOverlay } from './components/GameOverlay';
import './App.css';

function App() {
  const { gameState, dispatch } = useGameLoop();
  useKeyboardControls(dispatch);

  return (
    <div className="game-container">
      <GameCanvas gameState={gameState} />
      <GameOverlay gameState={gameState} dispatch={dispatch} />
    </div>
  );
}

export default App;
