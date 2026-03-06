import { createGame } from "@/services/gameService";

export async function createGameController(body: any) {
    const game = await createGame(body);
    return game;
}