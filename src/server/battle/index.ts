export type { BattleSession, BattleStepResponse, StartBattleInput } from "./types";
export { createBattleState, DEFAULT_PLAYER_STATS } from "./factory";
export { buildBattleRewards, grantBattleRewards } from "./rewards";
export {
  startBattle,
  getBattleSession,
  runBattleStep,
  submitBattleIntent,
  runAutoBattle,
  BattleServiceError,
} from "./service";
