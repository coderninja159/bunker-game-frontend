import React, { useMemo } from 'react';
import { Card, ClientCard, ClientPlayerProfile, Incident } from '../types';
import { ShieldAlert, Hourglass, ShieldCheck, Siren } from 'lucide-react';

interface IncidentAlertModalProps {
  activeIncident: Incident | null;
  timerRemaining: number;
  localPlayerProfile: ClientPlayerProfile | null;
  localPlayerSpecialCards: Card[];
  onRevealCard: (cardId: string) => void;
  roomId: string;
}

export const IncidentAlertModal: React.FC<IncidentAlertModalProps> = ({
  activeIncident,
  timerRemaining,
  localPlayerProfile,
  localPlayerSpecialCards,
  onRevealCard
}) => {
  // If no incident or it is mitigated, don't show the modal overlay
  if (!activeIncident || activeIncident.isMitigated) return null;

  // Find matching cards in player's profile and special cards
  const matchingCards = useMemo(() => {
    if (!localPlayerProfile) return [];
    
    const allPlayerCards: ClientCard[] = [
      localPlayerProfile.biology,
      localPlayerProfile.profession,
      localPlayerProfile.hobby,
      localPlayerProfile.phobia,
      localPlayerProfile.baggage,
      ...localPlayerSpecialCards
    ];

    return allPlayerCards.filter(card => {
      const valueStr = (card.value || '').toLowerCase();
      const typeStr = card.type.toLowerCase();

      return activeIncident.requiredMitigationTags.some(tag => {
        const lowerTag = tag.toLowerCase();
        if (typeStr === lowerTag) return true;
        if (valueStr.includes(lowerTag)) return true;
        return false;
      });
    });
  }, [activeIncident, localPlayerProfile, localPlayerSpecialCards]);

  const hasMatches = matchingCards.length > 0;

  // Visual status for the warning level
  const getTimerStyles = () => {
    if (timerRemaining <= 10) return 'text-red-500 animate-ping font-bold';
    if (timerRemaining <= 25) return 'text-orange-400 font-bold';
    return 'text-yellow-400 font-semibold';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark frosted overlay with flashing hazard warnings */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md border border-red-500/20 animate-pulse-warning pointer-events-none" />

      {/* Main warning console container */}
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-red-500 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden z-10">
        
        {/* Flashing hazard header stripe */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 px-6 py-3 flex items-center justify-between border-b-2 border-red-500">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-white animate-bounce" />
            <span className="text-sm font-black font-mono tracking-widest text-white animate-pulse">
              CRITICAL INCIDENT PROTOCOL
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1 rounded-md text-xs font-mono font-bold text-red-400 border border-red-500/40">
            <Hourglass className="w-3.5 h-3.5" />
            <span className={getTimerStyles()}>{timerRemaining}S</span>
          </div>
        </div>

        {/* Console Body */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] flex-shrink-0">
              <ShieldAlert className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-mono tracking-wide text-red-400">
                {activeIncident.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                {activeIncident.description}
              </p>
            </div>
          </div>

          {/* Incident Requirements Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/55 rounded-xl border border-slate-800/80 mb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Required Capability
              </span>
              <div className="flex flex-wrap gap-1">
                {activeIncident.requiredMitigationTags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded font-mono uppercase font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Failure Consequences
              </span>
              <span className="text-xs font-mono text-red-400 uppercase font-bold">
                {activeIncident.penaltyType.replace('_', ' ')} (-{activeIncident.penaltyValue}%)
              </span>
            </div>
          </div>

          {/* Local mitigation helper console */}
          <div className="mt-5 border-t border-slate-800/60 pt-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">
              BIO-METRIC SCANNER RESULT
            </h3>

            {hasMatches ? (
              <div className="p-3 border border-emerald-500/30 bg-emerald-950/5 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    Compatible Mitigation Key Detected!
                  </span>
                </div>
                
                <div className="space-y-2.5">
                  {matchingCards.map(card => (
                    <div 
                      key={card.id} 
                      className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="text-left">
                        <span className="text-[10px] uppercase font-mono text-slate-500">
                          {card.type}
                        </span>
                        <p className="text-xs font-semibold text-slate-200">
                          {card.isRevealed ? card.value : 'CLASSIFIED DATA'}
                        </p>
                      </div>
                      
                      {!card.isRevealed ? (
                        <button
                          onClick={() => onRevealCard(card.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded transition shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        >
                          Declassify Mitigator
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-500/20 px-2.5 py-1.5 rounded">
                          DEPLOYED PUBLICLY
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center text-slate-500 font-mono text-xs leading-relaxed">
                <p>NO DIRECT COMPATIBILITY IN YOUR BIO-METRIC HAND.</p>
                <p className="mt-1 text-[10px] text-slate-600 font-sans uppercase">
                  Coordinate with other bunker members immediately via radio to find mitigators.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
