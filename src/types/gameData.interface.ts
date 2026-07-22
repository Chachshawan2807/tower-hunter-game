import type {
  PlayerEquipmentResponse,
  PlayerStatsResponse,
  SkillProgressionResponse,
  UserProfile,
} from "../api/types";

export interface GameDataCache {
  userId: string;
  revision: string;
  cachedAt: string;
  user: UserProfile;
  stats: PlayerStatsResponse;
  equipment: PlayerEquipmentResponse;
  skillProgression: SkillProgressionResponse;
  mailboxCount: number;
}

export interface UserBootstrapResponse {
  user: UserProfile;
  stats: PlayerStatsResponse;
  equipment: PlayerEquipmentResponse;
  skillProgression: SkillProgressionResponse;
  mailboxCount: number;
  revision: string;
}
