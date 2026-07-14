export {
  cloneBattleState,
  findEntity,
  updateEntity,
  getEntitiesBySide,
  getOpponents,
  toBattleSnapshot,
  checkBattleOutcome,
  type BattleAction,
  type BattleState,
  type TurnProcessResult,
} from "./battleState";

export { processStartOfTurn, type StartOfTurnResult } from "./startOfTurn";
export {
  resolveActionChoice,
  validateManualAction,
} from "./actionChoice";
export { processExecution, type ExecutionResult } from "./execution";
export { processEndOfTurn, type EndOfTurnResult } from "./endOfTurn";
export { processEntityTurn, type TurnOptions } from "./turnStateMachine";
export {
  advanceBattleStep,
  tickBattleGauges,
  handlePlayerIntent,
  type AdvanceBattleResult,
  type AdvanceBattleOptions,
} from "./battleAdvance";
