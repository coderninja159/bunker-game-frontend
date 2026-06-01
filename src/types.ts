/**
 * Core Type Definitions for "Bunker" Multiplayer Game (Frontend Client Projections)
 */

export type HazardType = 
  | 'extreme_cold' 
  | 'toxic_air' 
  | 'radiation' 
  | 'mechanical_failure' 
  | 'wildlife_aggression' 
  | 'psychological_stress' 
  | 'resource_scarcity';

export interface LocationContext {
  id: string;
  type: 'FOREST' | 'ALIEN_PLANET' | 'UNDERGROUND_BUNKER' | 'UNDERWATER_DOME' | 'DESERT_OUTPOST';
  name: string;
  description: string;
  primaryHazards: HazardType[];
}

export interface CardCompatibility {
  mitigates: HazardType[];
  vulnerabilities: HazardType[];
  synergies: string[];
}

export enum CardType {
  BIOLOGY = 'biology',
  PROFESSION = 'profession',
  HOBBY = 'hobby',
  PHOBIA = 'phobia',
  BAGGAGE = 'baggage',
  SPECIAL = 'special'
}

export interface Card {
  id: string;
  type: CardType;
  value: string;
  isRevealed: boolean;
  metadata?: Record<string, any>;
  compatibility?: CardCompatibility;
}

export interface PlayerProfile {
  biology: Card;
  profession: Card;
  hobby: Card;
  phobia: Card;
  baggage: Card;
}

export interface Player {
  id: string;
  name: string;
  isAlive: boolean;
  isHost: boolean;
  isConnected: boolean;
  profile: PlayerProfile;
  specialCards: Card[];
  votesReceived: number;
  votedFor: string | null;
  hasVoted: boolean;
}

export enum GameStatus {
  LOBBY = 'lobby',
  DISASTER_REVEAL = 'disaster_reveal',
  DISCUSSION = 'discussion',
  VOTING = 'voting',
  ELIMINATION = 'elimination',
  GAME_OVER_WON = 'game_over_won',
  GAME_OVER_LOST = 'game_over_lost'
}

export type RoundPhase = 'discussion' | 'voting' | 'elimination';

export interface BunkerSpecs {
  capacity: number;
  duration: string;
  supplies: string[];
  hazards: string[];
}

export interface DisasterContext {
  id: string;
  title: string;
  description: string;
  bunker: BunkerSpecs;
}

export interface GameConfig {
  maxPlayers: number;
  discussionTimeLimit: number;
  votingTimeLimit: number;
  allowSelfVoting: boolean;
  reconnectTimeout: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  requiredMitigationTags: string[];
  penaltyType: 'health_damage' | 'resource_loss' | 'bunker_defect';
  penaltyValue: number;
  isMitigated: boolean;
}

export interface CurrentRound {
  roundNumber: number;
  phase: RoundPhase;
  activeSpeakerId: string | null;
  timerRemaining: number;
}

export interface EliminationRecord {
  roundNumber: number;
  playerId: string;
  playerName: string;
  reason: 'vote' | 'disconnect' | 'special_card';
  revealedProfileOnElimination: PlayerProfile;
}

// Client safe projections
export interface ClientCard {
  id: string;
  type: CardType;
  value: string | undefined; // Redacted if !isRevealed and not owned by client
  isRevealed: boolean;
  metadata?: Record<string, any>;
  compatibility?: CardCompatibility;
}

export interface ClientPlayerProfile {
  biology: ClientCard;
  profession: ClientCard;
  hobby: ClientCard;
  phobia: ClientCard;
  baggage: ClientCard;
}

export interface ClientPlayer {
  id: string;
  name: string;
  isAlive: boolean;
  isHost: boolean;
  isConnected: boolean;
  profile: ClientPlayerProfile;
  specialCardsCount: number; // Only sends the count to others
  votesReceived: number;
  hasVoted: boolean;
}

export interface ClientGameStatePayload {
  roomId: string;
  status: GameStatus;
  config: GameConfig;
  disaster: DisasterContext | null;
  location: LocationContext | null;
  activeIncident: Incident | null;
  players: Record<string, ClientPlayer>;
  playerOrder: string[];
  currentRound: CurrentRound;
  eliminationHistory: EliminationRecord[];
  localPlayer: {
    id: string;
    specialCards: Card[]; // Full card models for user's own special deck
  };
}
