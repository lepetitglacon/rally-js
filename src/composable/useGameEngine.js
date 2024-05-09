import GameEngine from "./GameEngine.js";

const gameEngine = new GameEngine()

export function useGameEngine() {
    return {gameEngine}
}