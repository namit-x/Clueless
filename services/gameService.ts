import { supabaseAdmin } from "@/lib/supabase/server";

export async function createGame(data: any) {
    const { id, ...gameData } = data;
    const { data: game, error } = await supabaseAdmin
        .from("games")
        .insert([gameData])
        .select()
        .single();

    if (error) {
        console.log(error.message);
        throw new Error(error.message);
    }

    return game;
}

export async function getCurrentGameForTeam() {
    try {
        const { data, error } = await supabaseAdmin
            .from("games")
            .select("id, name, description, order_index, status")
            .eq("is_active", false)
            .order("order_index", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(
                "[GameService][getCurrentGameForTeam] Database query failed:",
                error.message
            );
            throw new Error("Database error while fetching current game");
        }

        return data;
    } catch (error: any) {
        console.error(
            "[GameService][getCurrentGameForTeam] Unexpected service error:",
            error.message
        );
        throw new Error("Service failed to retrieve current game");
    }
}