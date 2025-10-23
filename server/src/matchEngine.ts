import type { MatchConfig, MatchState, DeliveryOutcome } from '../../shared/types.js';

export class MatchEngine {
  public state: MatchState;

  constructor(config: MatchConfig) {
    const tossWinner = Math.random() > 0.5 ? config.teams.home.id : config.teams.away.id;
    this.state = {
      config,
      toss: { winnerTeamId: tossWinner, decision: 'BAT' },
      innings: [],
      status: 'NOT_STARTED',
    };
  }

  public start() {
    this.state.status = 'IN_PROGRESS';
    // Initialize innings etc.
  }

  public bowlDelivery(): DeliveryOutcome {
    // Placeholder physics-driven outcome logic stub
    const speed = 120 + Math.random() * 40; // kph
    const swing = (Math.random() - 0.5) * 6;
    const seam = (Math.random() - 0.5) * 4;
    const spinRpm = Math.random() * 2500;
    const runs = Math.max(0, Math.round(Math.random() * 6 - Math.abs(swing) * 0.1));
    const wicket = Math.random() < 0.05 ? { type: 'BOWLED' as const } : null;
    return {
      runs,
      wicket,
      extras: {},
      ballSpeedKph: speed,
      swingDegrees: swing,
      seamDeviationDeg: seam,
      spinRpm,
      launchAngleDeg: 0,
      impactPoint: { x: 0, y: 0, z: 0 },
    };
  }
}
