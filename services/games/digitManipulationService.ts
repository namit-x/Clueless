import { initializeTeamRoundProgressRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";

/**
 * Digit Manipulation Game Start Handler
 * 
 * Initializes and starts a Digit Manipulation game.
 * 
 * Process:
 * 1. Initialize team round progress (all teams × all rounds)
 * 2. Activate the game
 * 
 * @param gameId - The ID of the digit manipulation game to start
 * @returns - Updated game object with activated status
 */
export async function startDigitManipulationGame(gameId: string) {

    // Initialize all team-round combinations with LOCKED status
    await initializeTeamRoundProgressRepo(gameId);

    // Activate the game
    return activateGameRepo(gameId);
}
