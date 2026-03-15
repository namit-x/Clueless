import { initializeTeamRoundProgressRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";

/**
 * Quiz Game Start Handler
 * 
 * Initializes and starts a Quiz game.
 * 
 * Process:
 * 1. Initialize team round progress (all teams × all rounds)
 * 2. Activate the game
 * 
 * @param gameId - The ID of the quiz game to start
 * @returns - Updated game object with activated status
 */
export async function startQuizGame(gameId: string) {

    // Initialize all team-round combinations with LOCKED status
    await initializeTeamRoundProgressRepo(gameId);

    // Activate the game
    return activateGameRepo(gameId);
}
