export type MatchFormat = 'TEST' | 'ODI' | 'T20';

export interface PlayerRatings {
  batting: number; // 0-100
  bowling: number; // 0-100
  fielding: number; // 0-100
  fitness: number; // 0-100
  temperament: number; // 0-100
  form: number; // 0-100
  handedness: 'R' | 'L';
  bowlingStyle: 'PACE' | 'SWING' | 'SEAM' | 'OFF_SPIN' | 'LEG_SPIN' | 'LEFT_ARM_ORTHODOX' | 'LEFT_ARM_UNORTHODOX' | 'NONE';
}

export interface PlayerProfile {
  id: string;
  name: string;
  age: number;
  nationality: string;
  role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'KEEPER';
  ratings: PlayerRatings;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
  players: PlayerProfile[];
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  pitchType: 'GREEN' | 'FLAT' | 'DUSTY' | 'BALANCED';
  dimensions: { longBoundary: number; shortBoundary: number };
}

export interface WeatherState {
  condition: 'CLEAR' | 'CLOUDY' | 'HAZY' | 'RAIN_LIGHT' | 'RAIN_HEAVY' | 'NIGHT';
  temperatureC: number;
  humidityPct: number;
  windKph: number;
  windDirectionDeg: number; // 0-360
  cloudCoveragePct: number; // 0-100
}

export interface TossResult {
  winnerTeamId: string;
  decision: 'BAT' | 'BOWL';
}

export interface MatchConfig {
  format: MatchFormat;
  oversPerSide: number; // 90*5 for test sessions via engine logic
  ballBrand: 'DUKES' | 'KOOKABURRA' | 'SG';
  usedBallOvers: number; // start-age of ball for tests
  stadium: Stadium;
  weather: WeatherState;
  teams: { home: Team; away: Team };
}

export interface DeliveryOutcome {
  runs: number;
  wicket: null | { type: 'BOWLED' | 'LBW' | 'CAUGHT' | 'RUN_OUT' | 'STUMPED' | 'HIT_WICKET' };
  extras: { wides?: number; noBalls?: number; legByes?: number; byes?: number };
  ballSpeedKph: number;
  swingDegrees: number;
  seamDeviationDeg: number;
  spinRpm: number;
  launchAngleDeg: number;
  impactPoint: { x: number; y: number; z: number };
}

export interface OverState {
  overNumber: number;
  deliveries: DeliveryOutcome[];
}

export interface InningsState {
  battingTeamId: string;
  bowlingTeamId: string;
  score: number;
  wickets: number;
  overs: OverState[];
}

export interface MatchState {
  config: MatchConfig;
  toss: TossResult;
  innings: InningsState[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'INTERRUPTED';
}
