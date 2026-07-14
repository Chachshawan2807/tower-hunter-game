import {
  selectNextActor,
  tickActionGauge,
} from "../formulas/actionGauge";
import type { AnimationQueuePayload, PlayerIntent } from "../types";
import {
  type BattleAction,
  type BattleState,
  type TurnProcessResult,
} from "./battleState";
import { processEntityTurn } from "./turnStateMachine";

const MAX_GAUGE_TICKS = 1000;

export interface AdvanceBattleResult {
  state: BattleState;
  turnResult?: TurnProcessResult;
  payload?: AnimationQueuePayload;
  actionRequired: boolean;
  waitingActorId?: string;
}

export interface AdvanceBattleOptions {
  rng?: () => number;
  manualAction?: BattleAction;
  actorId?: string;
  resumeFromActionChoice?: boolean;
  priorEvents?: TurnProcessResult["events"];
}

function buildAnimationPayload(
  turnResult: TurnProcessResult
): AnimationQueuePayload {
  return {
    events: turnResult.events,
    finalState: turnResult.snapshot,
  };
}

/**
 * Advances action gauges until an actor is ready, then processes their turn.
 */
export function advanceBattleStep(
  state: BattleState,
  options: AdvanceBattleOptions = {}
): AdvanceBattleResult {
  if (state.isComplete) {
    return { state, actionRequired: false };
  }

  let currentState = state;
  let actorId = options.actorId;

  if (!actorId) {
    for (let tick = 0; tick < MAX_GAUGE_TICKS; tick++) {
      const readyActor = selectNextActor(
        currentState.entities.map((entity) => ({
          id: entity.id,
          gauge: entity.actionGauge,
          speed: entity.stats.speed,
        }))
      );

      if (readyActor) {
        actorId = readyActor;
        break;
      }

      currentState = tickBattleGauges(currentState);
    }

    if (!actorId) {
      return { state: currentState, actionRequired: false };
    }
  }

  const turnResult = processEntityTurn(currentState, actorId, {
    rng: options.rng,
    manualAction: options.manualAction,
    resumeFromActionChoice: options.resumeFromActionChoice,
    priorEvents: options.priorEvents,
  });

  return {
    state: turnResult.state,
    turnResult,
    payload: buildAnimationPayload(turnResult),
    actionRequired: turnResult.actionRequired,
    waitingActorId: turnResult.waitingActorId,
  };
}

export function tickBattleGauges(state: BattleState): BattleState {
  return {
    ...state,
    entities: state.entities.map((entity) => ({
      ...entity,
      actionGauge: tickActionGauge(
        entity.actionGauge,
        entity.stats.speed
      ),
    })),
  };
}

/**
 * Maps a player intent into a battle advance call.
 */
export function handlePlayerIntent(
  state: BattleState,
  intent: PlayerIntent,
  waitingActorId?: string,
  priorEvents?: TurnProcessResult["events"]
): AdvanceBattleResult {
  if (intent.type === "toggle_auto_battle") {
    return {
      state: { ...state, autoBattle: intent.enabled },
      actionRequired: false,
    };
  }

  if (intent.type === "request_action" && waitingActorId) {
    const manualAction: BattleAction = {
      type: "basic_attack",
      targetId: intent.targetId,
      skillId: intent.skillId,
    };

    return advanceBattleStep(state, {
      actorId: waitingActorId,
      manualAction,
      resumeFromActionChoice: true,
      priorEvents,
    });
  }

  return { state, actionRequired: Boolean(waitingActorId), waitingActorId };
}
