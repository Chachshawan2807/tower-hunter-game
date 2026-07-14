import { murimBody } from "./murim.mjs";
import { knightBody } from "./knight.mjs";
import { fantasyBody } from "./fantasy.mjs";
import { beastBody } from "./beast.mjs";
import { demonBody } from "./demon.mjs";
import { merchantBody } from "./merchant.mjs";
import { villagerBody } from "./villager.mjs";

/** @type {Record<string, (id: string) => string>} */
export const BODIES = {
  murim: murimBody,
  knight: knightBody,
  fantasy: fantasyBody,
  beast: beastBody,
  demon: demonBody,
  merchant: merchantBody,
  villager: villagerBody,
};
