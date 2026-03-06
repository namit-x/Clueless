import { supabaseAdmin } from "@/lib/supabase/server";

export async function createGame(data: any) {
    const { data: game, error } = await supabaseAdmin
        .from("games")
        .insert([data])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return game;
}