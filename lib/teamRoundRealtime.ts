type TeamRoundProgressRealtimeRow = {
  team_id?: string | null;
  round_id?: string | null;
  status?: string | null;
  game_status?: string | null;
};

type TeamRoundRealtimePayload = {
  new: TeamRoundProgressRealtimeRow;
  old: TeamRoundProgressRealtimeRow;
};

type GamesRealtimeRow = {
  id?: string | null;
  status?: string | null;
  is_active?: boolean | null;
};

type GamesRealtimePayload = {
  new: GamesRealtimeRow;
  old: GamesRealtimeRow;
};

type TeamRealtimeRow = {
  team_id?: string | null;
  is_approved?: boolean | null;
};

type TeamRealtimePayload = {
  new: TeamRealtimeRow;
  old: TeamRealtimeRow;
};

export type MeaningfulTeamRoundState = {
  round: string | number | null;
  roundStatus: string | null;
  gameStatus: string | null;
};

export function buildMeaningfulTeamRoundState(
  data: Record<string, unknown> | null | undefined
): MeaningfulTeamRoundState {
  return {
    round:
      (typeof data?.roundId === "string" && data.roundId) ||
      (typeof data?.round_id === "string" && data.round_id) ||
      (typeof data?.roundNumber === "number" ? data.roundNumber : null) ||
      (typeof data?.round === "number" ? data.round : null),
    roundStatus:
      (typeof data?.messageCode === "string" && data.messageCode) ||
      (typeof data?.round_status === "string" && data.round_status) ||
      (typeof data?.status === "string" && data.status) ||
      null,
    gameStatus:
      (typeof data?.teamState === "string" && data.teamState) ||
      (typeof data?.game_status === "string" && data.game_status) ||
      null,
  };
}

export function isMeaningfulTeamRoundStateEqual(
  left: MeaningfulTeamRoundState | null,
  right: MeaningfulTeamRoundState | null
) {
  if (left === right) return true;
  if (!left || !right) return false;

  return (
    left.round === right.round &&
    left.roundStatus === right.roundStatus &&
    left.gameStatus === right.gameStatus
  );
}

export function shouldProcessTeamRoundProgressEvent(
  payload: TeamRoundRealtimePayload,
  currentTeamId: string | null | undefined
) {
  const nextTeamId = payload.new.team_id ?? null;
  const previousTeamId = payload.old.team_id ?? null;

  if (!currentTeamId) return false;
  if (nextTeamId !== currentTeamId && previousTeamId !== currentTeamId) return false;

  const previousState = buildMeaningfulTeamRoundState(payload.old);
  const incomingState = buildMeaningfulTeamRoundState(payload.new);

  return !isMeaningfulTeamRoundStateEqual(previousState, incomingState);
}

export function shouldProcessGameUpdateEvent(payload: GamesRealtimePayload) {
  return (
    payload.new.status !== payload.old.status ||
    payload.new.is_active !== payload.old.is_active
  );
}

export function shouldProcessCurrentTeamUpdateEvent(
  payload: TeamRealtimePayload,
  currentTeamId: string | null | undefined
) {
  const nextTeamId = payload.new.team_id ?? null;
  const previousTeamId = payload.old.team_id ?? null;

  if (!currentTeamId) return false;
  if (nextTeamId !== currentTeamId && previousTeamId !== currentTeamId) return false;

  return payload.new.is_approved !== payload.old.is_approved;
}

export function logRealtimeDecision({
  table,
  currentTeamId,
  eventTeamId,
  shouldFetch,
  reason,
}: {
  table: string;
  currentTeamId?: string | null;
  eventTeamId?: string | null;
  shouldFetch: boolean;
  reason: string;
}) {
  console.log(`[Realtime][${table}]`, {
    currentTeamId: currentTeamId ?? null,
    eventTeamId: eventTeamId ?? null,
    shouldFetch,
    reason,
  });
}
