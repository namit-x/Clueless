import { NextResponse } from "next/server";

export async function GET() {

  const dashboard = {
    team: {
      penalty_time_seconds: 40,
      is_active: true,
    },

    games: [
      {
        id: 1,
        name: "Treasure Hunt",
        order_index: 1,
        state: "ACTIVE",
        time_taken_seconds: 452,
        reward_word_earned: true,
      },
      {
        id: 2,
        name: "Digit Manipulation",
        order_index: 2,
        state: "ACTIVE",
      },
      {
        id: 3,
        name: "Blind Code",
        order_index: 3,
        state: "LOCKED",
      },
      {
        id: 4,
        name: "ASCII Quiz",
        order_index: 4,
        state: "LOCKED",
      },
    ],
  };

  return NextResponse.json(dashboard);
}