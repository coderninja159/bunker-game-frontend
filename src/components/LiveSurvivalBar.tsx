import React, { useMemo } from 'react';
import { ClientGameStatePayload, ClientPlayer } from '../types';
import { useThemeContext } from '../context/ThemeContext';
import { Shield, Users, Radio, Activity } from 'lucide-react';

interface LiveSurvivalBarProps {
  gameState: ClientGameStatePayload;
  localPlayerId: string | null;
}

export const LiveSurvivalBar: React.FC<LiveSurvivalBarProps> = ({ gameState, localPlayerId }) => {
  const { theme } = useThemeContext();
  const { players, activeIncident, disaster, currentRound } = gameState;

  // Real-time calculation of bunker survival metrics
  const survivalMetrics = useMemo(() => {
    const playerList = Object.values(players);
    const totalPlayers = playerList.length;
    if (totalPlayers === 0) return { percent: 100, status: "ME'YORIDA", scoreColor: 'text-emerald-400' };

    const alivePlayers = playerList.filter(p => p.isAlive);
    const aliveCount = alivePlayers.length;
    const capacity = disaster?.bunker?.capacity || 4;

    let score = 75; // Baseline survival potential

    // 1. Capacity Constraints
    if (aliveCount > capacity) {
      // Overcrowding penalty
      const excess = aliveCount - capacity;
      score -= excess * 12;
    } else if (aliveCount < Math.ceil(capacity / 2)) {
      // Underpopulation penalty (lack of labor)
      score -= (Math.ceil(capacity / 2) - aliveCount) * 8;
    }

    // 2. Incident Penalties
    if (activeIncident && !activeIncident.isMitigated) {
      score -= activeIncident.penaltyValue || 15;
    }

    // 3. Revealed Character Traits analysis
    let traitScoreModifier = 0;
    alivePlayers.forEach(p => {
      // Profession matching
      const prof = p.profile?.profession?.value?.toLowerCase() || '';
      if (prof.includes('surgeon') || prof.includes('doctor') || prof.includes('medic') || prof.includes('engineer') || prof.includes('welder') || prof.includes('botanist') || prof.includes('farmer') || prof.includes('soldier')) {
        traitScoreModifier += 4;
      } else if (prof.includes('politician') || prof.includes('influencer') || prof.includes('thief') || prof.includes('scammer')) {
        traitScoreModifier -= 3;
      }

      // Phobia & Baggage penalty if revealed
      const phobia = p.profile?.phobia;
      if (phobia?.isRevealed && phobia.value) {
        traitScoreModifier -= 2;
      }
      
      const baggage = p.profile?.baggage;
      if (baggage?.isRevealed && baggage.value) {
        const bagVal = baggage.value.toLowerCase();
        if (bagVal.includes('radioactive') || bagVal.includes('infected') || bagVal.includes('weapon')) {
          traitScoreModifier -= 4;
        }
      }
    });
    
    score += traitScoreModifier;

    // Bounds limit
    score = Math.max(0, Math.min(100, score));

    // Status classifications (Uzbek localized)
    let status = "ME'YORIDA";
    let scoreColor = 'text-emerald-400';
    if (score < 30) {
      status = 'TIZIM BUZILISHI';
      scoreColor = 'text-red-500 animate-pulse';
    } else if (score < 60) {
      status = 'XAVF OGOHLANTIRISHI';
      scoreColor = 'text-yellow-400';
    } else if (score > 85) {
      status = 'XAVFSIZ PANOHGOH';
      scoreColor = 'text-cyan-400';
    }

    return {
      percent: Math.round(score),
      status,
      scoreColor,
      aliveCount,
      capacity
    };
  }, [players, activeIncident, disaster]);

  const progressPercentage = survivalMetrics.percent;

  // Get color for survival progress bar
  const getProgressBarColor = () => {
    if (progressPercentage < 30) return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]';
    if (progressPercentage < 60) return 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.7)]';
    return `bg-gradient-to-r from-emerald-500 to-${theme.themeColor === '#10b981' ? 'emerald' : 'cyan'}-400 shadow-[0_0_12px_var(--theme-glow)]`;
  };

  return (
    <div className="w-full glass-panel border border-slate-800 rounded-xl p-5 mb-6 relative overflow-hidden backdrop-blur-md bg-slate-900/40">
      {/* Visual cyber scan lines */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Core Gauge Ring */}
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto">
          <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
            {/* SVG circle track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * progressPercentage) / 100}
                className={`transition-all duration-1000 ease-out ${
                  progressPercentage < 30 ? 'text-red-500' : progressPercentage < 60 ? 'text-orange-500' : 'text-emerald-400'
                }`}
              />
            </svg>
            
            {/* Value HUD */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-bold font-mono ${survivalMetrics.scoreColor}`}>
                {progressPercentage}%
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">
                OMON QOLISH
              </span>
            </div>
          </div>

          <div className="flex flex-col text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Activity className="w-4 h-4 text-slate-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-mono text-slate-400">TIZIM BUTUNLIGI</span>
            </div>
            <h2 className={`text-lg font-mono font-bold tracking-wide mt-0.5 ${survivalMetrics.scoreColor}`}>
              {survivalMetrics.status}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mt-1">
              Bunker sig'imi: {survivalMetrics.capacity} kishi. Hozirgi aholi: {survivalMetrics.aliveCount} tirik omon qolgan.
            </p>
          </div>
        </div>

        {/* Survival Indicator Bar and stats */}
        <div className="w-full md:w-1/3 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase">Bunker Butunligi Holati</span>
            <span className={survivalMetrics.scoreColor}>{progressPercentage >= 30 ? 'BARQAROR' : 'XAVFLI'}</span>
          </div>
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[2px]">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor()}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Maks. Sig'im: {survivalMetrics.capacity}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Tiriklar: {survivalMetrics.aliveCount}
            </span>
          </div>
        </div>
      </div>

      {/* Roster of survivors */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 justify-center sm:justify-start">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> HAYOTNI TA'MINLASH TELEMETRIYA RO'YXATI
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.values(players).map((player: ClientPlayer) => {
            const isSelf = player.id === localPlayerId;
            const isSpeaker = player.id === currentRound.activeSpeakerId;
            const hasVoted = player.hasVoted;
            
            return (
              <div 
                key={player.id}
                className={`p-2.5 rounded-lg border text-left transition-all relative h-auto flex flex-col justify-between ${
                  !player.isAlive 
                    ? 'border-red-950/30 bg-red-950/5 opacity-50' 
                    : isSpeaker 
                    ? `border-emerald-500 bg-emerald-950/10 shadow-[0_0_10px_rgba(16,185,129,0.15)]`
                    : player.id === localPlayerId
                    ? `border-slate-600 bg-slate-900/30`
                    : 'border-slate-800 bg-slate-900/10'
                }`}
              >
                {/* Speaker indicator tag */}
                {isSpeaker && (
                  <span className="absolute -top-1.5 right-2 px-1.5 py-0.5 text-[8px] bg-emerald-500 text-slate-950 rounded font-bold font-mono tracking-tighter uppercase animate-pulse">
                    GAPIRMOQDA
                  </span>
                )}

                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className={`text-xs font-medium truncate ${isSelf ? 'text-slate-100 font-bold' : 'text-slate-300'}`}>
                    {player.name} {isSelf && '(Siz)'}
                  </span>
                  
                  {/* Status lights */}
                  <span className="flex items-center flex-shrink-0">
                    {!player.isAlive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Eliminated" />
                    ) : !player.isConnected ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" title="Disconnected" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected" />
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto text-[10px] font-mono text-slate-500">
                  <span>Ovozlar: {player.votesReceived}</span>
                  {hasVoted ? (
                    <span className="text-emerald-400 font-bold" title="Ovoz berdi">OVOZ BERDI</span>
                  ) : (
                    <span className="text-slate-600">KUTMOQDA</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
