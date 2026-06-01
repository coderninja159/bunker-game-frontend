import React from 'react';
import { Card, ClientCard, ClientPlayerProfile, Incident } from '../types';
import { Heart, Briefcase, Smile, Brain, ShieldAlert, Sparkles, Lock, Eye } from 'lucide-react';

interface PlayerCardHandProps {
  profile: ClientPlayerProfile | null;
  specialCards: Card[];
  activeIncident: Incident | null;
  roomId: string;
  onRevealCard: (cardId: string) => void;
  isSelfAlive: boolean;
}

export const PlayerCardHand: React.FC<PlayerCardHandProps> = ({
  profile,
  specialCards,
  activeIncident,
  onRevealCard,
  isSelfAlive
}) => {
  if (!profile) {
    return (
      <div className="w-full text-center py-10 text-slate-500 font-mono">
        LOADING BIO-METRIC DECK...
      </div>
    );
  }

  const cardsList = [
    { key: 'biology', card: profile.biology, title: 'Biology / Health', icon: Heart, border: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10' },
    { key: 'profession', card: profile.profession, title: 'Profession', icon: Briefcase, border: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/10' },
    { key: 'hobby', card: profile.hobby, title: 'Hobby / Skill', icon: Smile, border: 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-950/10' },
    { key: 'phobia', card: profile.phobia, title: 'Psychology / Phobia', icon: Brain, border: 'border-red-500/30 text-red-400 bg-red-950/10' },
    { key: 'baggage', card: profile.baggage, title: 'Baggage / Secret', icon: ShieldAlert, border: 'border-amber-500/30 text-amber-400 bg-amber-950/10' },
  ];

  // Logic to determine if a card matches the incident mitigation tags
  const doesCardMitigate = (card: ClientCard | Card) => {
    if (!activeIncident || activeIncident.isMitigated) return false;
    const valueStr = (card.value || '').toLowerCase();
    const typeStr = card.type.toLowerCase();

    return activeIncident.requiredMitigationTags.some(tag => {
      const lowerTag = tag.toLowerCase();
      // Match if card type matches tag (e.g. tag is 'biology' or 'profession')
      if (typeStr === lowerTag) return true;
      // Match if card value contains tag (e.g. tag is 'welder' and profession value is 'Undersea Welder')
      if (valueStr.includes(lowerTag)) return true;
      return false;
    });
  };

  return (
    <div className="w-full mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" /> CHARACTER CHARACTERISTIC CARDS
        </h3>
        {!isSelfAlive && (
          <span className="px-2 py-0.5 text-xs bg-red-950/40 border border-red-500/30 text-red-400 rounded font-mono uppercase">
            DECEASED - HAND LOCKED
          </span>
        )}
      </div>

      {/* Main attributes container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cardsList.map(({ key, card, title, icon: Icon, border }) => {
          const isMitigating = doesCardMitigate(card);
          const isRevealed = card.isRevealed;

          return (
            <div
              key={key}
              className={`relative rounded-xl border flex flex-col h-44 transition-all duration-300 ${
                isMitigating 
                  ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/50 animate-pulse'
                  : isRevealed
                  ? border
                  : 'border-slate-800 bg-slate-900/20'
              } ${isSelfAlive && !isRevealed ? 'hover:scale-[1.02] cursor-pointer' : ''}`}
              onClick={() => {
                if (isSelfAlive && !isRevealed) {
                  onRevealCard(card.id);
                }
              }}
            >
              {/* Mitigating Alert Badge */}
              {isMitigating && (
                <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-mono text-[9px] font-black tracking-widest uppercase shadow-lg z-20">
                  MITIGATING CARD
                </div>
              )}

              {/* Revealed Status Indicator */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-mono tracking-wider">
                {isRevealed ? (
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <Eye className="w-3 h-3 text-slate-400" /> PUBLIC
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Lock className="w-3 h-3 text-amber-500" /> SECURE
                  </span>
                )}
              </div>

              {/* Card Header Info */}
              <div className="p-3 border-b border-slate-800/80 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isMitigating ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 truncate">
                  {title}
                </span>
              </div>

              {/* Card Body content */}
              <div className="flex-1 p-4 flex flex-col justify-center text-center">
                {isRevealed ? (
                  <p className="text-sm font-medium text-slate-200 leading-snug break-words">
                    {card.value}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500 py-2">
                    <Lock className="w-6 h-6 stroke-[1.5]" />
                    {isSelfAlive ? (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/80 animate-pulse font-semibold">
                        CLICK TO REVEAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
                        CLASSIFIED
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Compatibility Footer (if revealed and exists) */}
              {isRevealed && card.compatibility?.mitigates && card.compatibility.mitigates.length > 0 && (
                <div className="px-3 py-1.5 bg-slate-950/40 border-t border-slate-800/40 text-[9px] font-mono text-slate-400 text-left rounded-b-xl flex items-center justify-between">
                  <span className="truncate">Resists: {card.compatibility.mitigates.join(', ')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Special actions card deck if player has any */}
      {specialCards && specialCards.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /> SPECIAL ACTION CARDS (TACTICAL OVERLAY)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specialCards.map((card: Card) => {
              const isMitigating = doesCardMitigate(card);
              return (
                <div
                  key={card.id}
                  className={`relative p-4 rounded-xl border flex flex-col justify-between h-36 transition-all duration-300 ${
                    isMitigating
                      ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/50'
                      : 'border-purple-500/30 bg-purple-950/5 text-purple-200'
                  }`}
                >
                  {isMitigating && (
                    <span className="absolute -top-2 left-4 bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold tracking-widest uppercase">
                      MITIGATOR
                    </span>
                  )}
                  
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-2">
                      <span>TACTICAL ACTION</span>
                      <span>ID: {card.id.slice(0, 4)}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-300 leading-snug">
                      {card.value}
                    </p>
                  </div>

                  <button
                    disabled={!isSelfAlive}
                    className={`w-full py-1 rounded text-[10px] font-mono uppercase tracking-wider transition ${
                      !isSelfAlive
                        ? 'bg-slate-900 border border-slate-800 text-slate-600'
                        : isMitigating
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold'
                        : 'bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300'
                    }`}
                  >
                    DEPLOY TACTICAL ACTION
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
