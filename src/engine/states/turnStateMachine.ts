import type { AnimationEvent } from "../types";
import { resolveActionChoice, validateManualAction } from "./actionChoice";
import { processEndOfTurn } from "./endOfTurn";
import { processExecution } from "./execution";
import { processStartOfTurn } from "./startOfTurn";
import {
  toBattleSnapshot,
  type BattleAction,
  type BattleState,
  type TurnProcessResult,
} from "./battleState";

export interface TurnOptions {
  rng?: () => number;
  manualAction?: BattleAction;
  /** Skip start-of-turn when resuming after manual action input. */
  resumeFromActionChoice?: boolean;
  /** Events accumulated before resuming a paused turn. */
  priorEvents?: AnimationEvent[];
}

function appendBattleResultEvents(
  events: AnimationEvent[],
  state: BattleState,
  actorId: string
): AnimationEvent[] {
  if (!state.isComplete || !state.result) return events;

  const resultEvent =
    state.result === "win"
      ? ({ type: "battle_win" as const, actorId })
      : ({ type: "battle_lose" as const, actorId });

  return [...events, resultEvent];
}

function buildTurnResult(
  state: BattleState,
  events: AnimationEvent[],
  actionRequired: boolean,
  waitingActorId?: string
): TurnProcessResult {
  return {
    state,
    events,
    snapshot: toBattleSnapshot(state),
    actionRequired,
    waitingActorId,
  };
}

/**
 * Runs the 4-phase turn state machine for a single ready actor.
 * Server completes all phases before returning the animation queue payload.
 */
export function processEntityTurn(
  state: BattleState,
  actorId: string,
  options: TurnOptions = {}
): TurnProcessResult {
  const rng = options.rng ?? Math.random;
  const allEvents: AnimationEvent[] = [...(options.priorEvents ?? [])];
  let currentState = state;

  if (!options.resumeFromActionChoice) {
    const start = processStartOfTurn(currentState, actorId);
    allEvents.push(...start.events);
    currentState = start.state;

    if (currentState.isComplete) {
      return buildTurnResult(
        currentState,
        appendBattleResultEvents(allEvents, currentState, actorId),
        false
      );
    }

    if (start.ccSkipped) {
      const end = processEndOfTurn(currentState, actorId);
      allEvents.push(...end.events);
      return buildTurnResult(end.state, allEvents, false);
    }
  }

  const action = resolveActionChoice(
    currentState,
    actorId,
    options.manualAction
  );

  if (!action) {
    return buildTurnResult(currentState, allEvents, true, actorId);
  }

  if (
    options.manualAction &&
    !validateManualAction(currentState, actorId, action)
  ) {
    return buildTurnResult(currentState, allEvents, true, actorId);
  }

  const execution = processExecution(currentState, actorId, action, rng);
  allEvents.push(...execution.events);
  currentState = execution.state;

  if (currentState.isComplete) {
    return buildTurnResult(
      currentState,
      appendBattleResultEvents(allEvents, currentState, actorId),
      false
    );
  }

  const end = processEndOfTurn(currentState, actorId);
  allEvents.push(...end.events);

  return buildTurnResult(end.state, allEvents, false);
}
