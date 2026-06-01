import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useThemeContext } from '../context/ThemeContext';
import { LiveSurvivalBar } from './LiveSurvivalBar';
import { PlayerCardHand } from './PlayerCardHand';
import { IncidentAlertModal } from './IncidentAlertModal';
import { 
  Shield, Radio, AlertTriangle, Users, HardDrive, 
  Play, LogOut, RefreshCw, Plus, MapPin
} from 'lucide-react';
import { GameStatus } from '../types';

export const GameDashboard: React.FC = () => {
  const {
    gameState,
    connectionStatus,
    playerId,
    error,
    createRoom,
    joinRoom,
    startGame,
    revealCard,
    castVote,
    clearSession
  } = useGameState();

  const { theme, setLocation } = useThemeContext();

  // Local entry states
  const [joinRoomId, setJoinRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Room config state
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [discussionTime, setDiscussionTime] = useState(60);
  const [votingTime, setVotingTime] = useState(30);

  // Sync theme with game location context
  useEffect(() => {
    if (gameState?.location) {
      setLocation(gameState.location);
    } else {
      setLocation(null);
    }
  }, [gameState?.location, setLocation]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    createRoom({
      maxPlayers,
      discussionTimeLimit: discussionTime,
      votingTimeLimit: votingTime
    }, (res) => {
      if (res.success) {
        joinRoom(res.roomId, playerName);
      }
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim() || !playerName.trim()) return;
    joinRoom(joinRoomId.toUpperCase(), playerName);
  };

  // Find local player in states
  const localPlayer = gameState && playerId ? gameState.players[playerId] : null;

  // Handle manual mock location switcher for theme demo!
  const triggerMockLocation = (type: 'FOREST' | 'ALIEN_PLANET' | 'UNDERGROUND_BUNKER' | 'UNDERWATER_DOME' | 'DESERT_OUTPOST') => {
    const locations = {
      FOREST: { id: 'l1', type: 'FOREST' as const, name: 'Deep Moss Forest', description: 'Dense redwood pines surrounded by a lingering mist and heavy precipitation.', primaryHazards: ['extreme_cold' as const, 'wildlife_aggression' as const] },
      ALIEN_PLANET: { id: 'l2', type: 'ALIEN_PLANET' as const, name: 'Xenon-IV Toxic Wastes', description: 'Radioactive crystalline structures glowing under lavender night atmospheres.', primaryHazards: ['toxic_air' as const, 'radiation' as const] },
      UNDERGROUND_BUNKER: { id: 'l3', type: 'UNDERGROUND_BUNKER' as const, name: 'Silo Alpha Vault', description: 'Cold concrete structures with reinforced steel panels and warning sirens.', primaryHazards: ['mechanical_failure' as const, 'resource_scarcity' as const] },
      UNDERWATER_DOME: { id: 'l4', type: 'UNDERWATER_DOME' as const, name: 'Mariana Trench Habitat', description: 'A glass-domed pressurized biodome nested under abyssal ocean depths.', primaryHazards: ['extreme_cold' as const, 'mechanical_failure' as const] },
      DESERT_OUTPOST: { id: 'l5', type: 'DESERT_OUTPOST' as const, name: 'Kalahari Dust Outpost', description: 'Arid sand dunes surrounding a solar-collector shelter with high temperatures.', primaryHazards: ['resource_scarcity' as const, 'extreme_cold' as const] },
    };
    setLocation(locations[type]);
  };

  // LOBBY / ROOM CREATING AND JOINING SCREEN
  if (!gameState) {
    return (
      <div className="min-h-screen w-full bg-slate-950 bg-tech-grid flex items-center justify-center p-4 scanline select-none relative">
        <div className="crt-overlay" />
        
        {/* Glow accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-orange-500/20 p-6 rounded-2xl shadow-[0_0_35px_rgba(249,115,22,0.15)] relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-orange-500 animate-terminal-glow">
              <Shield className="w-10 h-10 stroke-[1.5] animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-widest text-slate-100 uppercase">
            BUNKER TERMINAL
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider mt-1 uppercase">
            Decentralized Life Support Coordinator
          </p>

          {error && (
            <div className="mt-4 p-2.5 bg-red-950/40 border border-red-500/30 rounded-lg text-xs font-mono text-red-400">
              {error}
            </div>
          )}

          {/* Form panels */}
          {!isCreating ? (
            <form onSubmit={handleJoin} className="mt-6 flex flex-col gap-4 text-left">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">
                  Surviving Registry Name
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter name (e.g. Surgeon Adams)"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-orange-500/50 rounded-xl text-slate-200 outline-none text-sm transition font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">
                  Enclosure Channel ID
                </label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  placeholder="6-character room code"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-orange-500/50 rounded-xl text-slate-200 outline-none text-sm tracking-wider uppercase transition font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-slate-950 font-bold font-mono text-xs uppercase tracking-widest rounded-xl transition shadow-[0_0_15px_rgba(249,115,22,0.3)] mt-2 flex items-center justify-center gap-1.5"
              >
                <Radio className="w-4 h-4" /> Link Enclosure System
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.98] text-slate-300 font-bold font-mono text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Config Secure Chamber
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-4 text-left">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">
                  Host Officer Title
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter host name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-orange-500/50 rounded-xl text-slate-200 outline-none text-sm transition font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-tighter text-slate-500 font-bold block mb-1">
                    Max Staff
                  </label>
                  <input 
                    type="number" 
                    min={4} 
                    max={12} 
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none text-xs transition font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-tighter text-slate-500 font-bold block mb-1">
                    Turn Timer (s)
                  </label>
                  <input 
                    type="number" 
                    min={30} 
                    max={180} 
                    value={discussionTime}
                    onChange={(e) => setDiscussionTime(parseInt(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none text-xs transition font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-tighter text-slate-500 font-bold block mb-1">
                    Vote Timer (s)
                  </label>
                  <input 
                    type="number" 
                    min={15} 
                    max={90} 
                    value={votingTime}
                    onChange={(e) => setVotingTime(parseInt(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none text-xs transition font-mono text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-slate-950 font-bold font-mono text-xs uppercase tracking-widest rounded-xl transition shadow-[0_0_15px_rgba(249,115,22,0.3)] mt-2 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Instantiate Enclosure
              </button>

              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-full py-2.5 bg-transparent hover:bg-slate-800/30 text-slate-500 hover:text-slate-400 font-mono text-[10px] uppercase tracking-wider transition text-center"
              >
                Back to Channel Linking
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE GAME STATE DISPLAY
  return (
    <div className={`min-h-screen w-full transition-colors duration-1000 ${theme.bgClass} flex flex-col p-4 md:p-6 scanline select-none relative pb-28`}>
      <div className="crt-overlay" />

      {/* Network Dropout Reconnecting Block */}
      {connectionStatus === 'reconnecting' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="p-6 bg-slate-900 border border-red-500/30 rounded-2xl flex flex-col items-center max-w-sm text-center shadow-[0_0_30px_rgba(239,68,68,0.25)]">
            <RefreshCw className="w-10 h-10 text-red-500 animate-spin mb-4" />
            <h2 className="text-lg font-bold font-mono text-red-400 uppercase tracking-widest">
              Telemetry Lost
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-2">
              Bunker frequency dropped out. Attempting automatically to link back to core life support telemetry...
            </p>
          </div>
        </div>
      )}

      {/* Incident Modal Overlay */}
      <IncidentAlertModal 
        activeIncident={gameState.activeIncident}
        timerRemaining={gameState.currentRound.timerRemaining}
        localPlayerProfile={localPlayer?.profile || null}
        localPlayerSpecialCards={gameState.localPlayer?.specialCards || []}
        onRevealCard={(cid) => revealCard(gameState.roomId, cid)}
        roomId={gameState.roomId}
      />

      {/* TOP HEADER HUD */}
      <header className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-900 border ${theme.cardBorder} flex items-center justify-center text-slate-200`}>
            <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">CHAMBER ENCRYPT</span>
              <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-xs font-bold text-slate-300">
                {gameState.roomId}
              </span>
            </div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-1.5">
              BUNKER CORE <span className={`text-sm uppercase font-mono ${theme.primary.split(' ')[0]}`}>// {theme.title}</span>
            </h1>
          </div>
        </div>

        {/* Phase progress banner */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">CHAMBER CYCLE STATUS</span>
            <span className={`text-sm font-mono font-black tracking-widest uppercase ${
              gameState.status === GameStatus.LOBBY ? 'text-blue-400' : 'text-orange-400 animate-pulse'
            }`}>
              {gameState.status.replace('_', ' ')}
            </span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-center min-w-[70px]">
            <span className="text-[9px] text-slate-500 uppercase block leading-none">CYCLE</span>
            <span className="text-lg font-bold text-slate-300">{gameState.currentRound.roundNumber}</span>
          </div>
        </div>
      </header>

      {/* ROOM INTEGRITY VITALS DASHBOARD */}
      <LiveSurvivalBar gameState={gameState} localPlayerId={playerId} />

      {/* CORE DUAL COLUMNS GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: AMBIENT ENVIRONMENT & ALARM LOGS */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Environment/Location HUD */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800 text-left">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> Climatic Shell Brief
            </h3>
            
            {gameState.location ? (
              <div>
                <h4 className={`text-md font-mono font-bold ${theme.primary.split(' ')[0]}`}>
                  {gameState.location.name}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {gameState.location.description}
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Climatic Hazards</span>
                  <div className="flex flex-wrap gap-1">
                    {gameState.location.primaryHazards.map((haz, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-red-950/20 border border-red-500/20 text-[10px] font-mono uppercase text-red-400 rounded">
                        {haz.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-600 font-mono text-xs">
                WAITING FOR SECTOR SYNC...
              </div>
            )}
          </div>

          {/* Disaster Context specs */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800 text-left">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Extinction Briefing
            </h3>
            {gameState.disaster ? (
              <div className="flex flex-col gap-3">
                <div>
                  <h4 className="text-sm font-mono font-bold text-amber-500 uppercase">
                    {gameState.disaster.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {gameState.disaster.description}
                  </p>
                </div>
                
                <div className="border-t border-slate-800/60 pt-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Chamber Lock Duration</span>
                  <span className="text-xs font-mono font-bold text-slate-300">{gameState.disaster.bunker.duration}</span>
                </div>

                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Supplies Registered</span>
                  <div className="flex flex-wrap gap-1">
                    {gameState.disaster.bunker.supplies.map((sup, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400 rounded">
                        {sup}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-600 font-mono text-xs">
                WAITING FOR SECTOR GENERATION...
              </div>
            )}
          </div>

        </section>

        {/* RIGHT COLUMN: SURVIVING COHORTS ANALYSIS */}
        <section className="lg:col-span-8 glass-panel rounded-xl p-5 border border-slate-800 text-left">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" /> SURVIVING COHORTS DECRYPT
            </h3>
            
            {/* Round speaker HUD info */}
            {gameState.currentRound.activeSpeakerId && (
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Discussion Turn Active
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {Object.values(gameState.players).map((player) => {
              if (player.id === playerId) return null; // Render other survivors here

              const cardTypes = ['biology', 'profession', 'hobby', 'phobia', 'baggage'] as const;
              
              return (
                <div 
                  key={player.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col gap-3 relative ${
                    !player.isAlive 
                      ? 'border-red-950/20 bg-red-950/5 opacity-40' 
                      : player.id === gameState.currentRound.activeSpeakerId
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800 bg-slate-900/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${!player.isAlive ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {player.name}
                      </span>
                      {player.isHost && (
                        <span className="text-[8px] font-mono bg-blue-500/20 border border-blue-500/40 text-blue-400 px-1 py-0.5 rounded uppercase font-bold">
                          CHAMBER HOST
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Connection status light */}
                      {!player.isAlive ? (
                        <span className="text-[9px] font-mono text-red-500 uppercase font-black">ELIMINATED</span>
                      ) : !player.isConnected ? (
                        <span className="text-[9px] font-mono text-amber-500 uppercase font-bold animate-pulse">DISCONNECTED</span>
                      ) : (
                        <span className="text-[9px] font-mono text-emerald-400 uppercase">ONLINE</span>
                      )}

                      {/* Vote panel for Discussion/Voting cycle */}
                      {gameState.status === GameStatus.VOTING && localPlayer?.isAlive && player.isAlive && (
                        <button
                          onClick={() => castVote(gameState.roomId, player.id)}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-slate-950 font-mono text-[9px] uppercase font-bold tracking-widest rounded transition"
                        >
                          CAST VOTE
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Character metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {cardTypes.map(key => {
                      const card = player.profile[key];
                      const isRevealed = card.isRevealed;
                      
                      return (
                        <div 
                          key={key} 
                          className={`p-2 rounded-lg border text-center ${
                            isRevealed 
                              ? 'border-slate-800 bg-slate-950/40' 
                              : 'border-slate-900/50 bg-slate-950/10 opacity-75'
                          }`}
                        >
                          <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500 block mb-0.5">{key}</span>
                          <p className="text-[10px] font-medium text-slate-300 leading-snug truncate">
                            {isRevealed ? card.value : 'CLASSIFIED'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER INTERACTIVE CONSOLE */}
      <footer className="fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-800 p-4 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Local surviving metrics */}
          <div className="text-left flex items-center gap-3">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl">
              <HardDrive className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Linked Officer Profile</span>
                <span className={`w-1.5 h-1.5 rounded-full ${localPlayer?.isConnected ? 'bg-emerald-400' : 'bg-red-500'}`} />
              </div>
              <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                {localPlayer?.name || 'SYNCING PROFILE...'} {localPlayer?.isHost && '(Host)'}
              </span>
            </div>
          </div>

          {/* Center: Tactical characteristic declassification hand */}
          <div className="flex-1 w-full max-w-2xl">
            {localPlayer && (
              <PlayerCardHand 
                profile={localPlayer.profile}
                specialCards={gameState.localPlayer?.specialCards || []}
                activeIncident={gameState.activeIncident}
                roomId={gameState.roomId}
                onRevealCard={(cid) => revealCard(gameState.roomId, cid)}
                isSelfAlive={localPlayer.isAlive}
              />
            )}
          </div>

          {/* Right: Controller button triggers */}
          <div className="flex items-center gap-3">
            {localPlayer?.isHost && gameState.status === GameStatus.LOBBY && (
              <button
                onClick={() => startGame(gameState.roomId)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-bold font-mono text-xs uppercase tracking-widest rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> START COHORT ENGINE
              </button>
            )}

            <button
              onClick={clearSession}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Disconnect
            </button>
          </div>
        </div>
      </footer>

      {/* ADMINISTRATIVE DIAGNOSTIC SWITCHER FOR THEME TESTING */}
      <div className="fixed bottom-24 right-4 z-50 glass-panel border border-slate-800 p-2.5 rounded-xl shadow-lg flex flex-col gap-1 text-left max-w-xs">
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-1">
          ⚙️ Theme Diagnostics (Mock Environment Switch)
        </span>
        <div className="grid grid-cols-5 gap-1">
          <button 
            onClick={() => triggerMockLocation('FOREST')} 
            className="px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono rounded font-bold hover:bg-emerald-500 hover:text-slate-950 uppercase transition"
          >
            FOREST
          </button>
          <button 
            onClick={() => triggerMockLocation('ALIEN_PLANET')} 
            className="px-1 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-[8px] font-mono rounded font-bold hover:bg-fuchsia-500 hover:text-slate-950 uppercase transition"
          >
            ALIEN
          </button>
          <button 
            onClick={() => triggerMockLocation('UNDERWATER_DOME')} 
            className="px-1 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[8px] font-mono rounded font-bold hover:bg-cyan-500 hover:text-slate-950 uppercase transition"
          >
            WATER
          </button>
          <button 
            onClick={() => triggerMockLocation('DESERT_OUTPOST')} 
            className="px-1 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[8px] font-mono rounded font-bold hover:bg-yellow-500 hover:text-slate-950 uppercase transition"
          >
            DESERT
          </button>
          <button 
            onClick={() => triggerMockLocation('UNDERGROUND_BUNKER')} 
            className="px-1 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[8px] font-mono rounded font-bold hover:bg-orange-500 hover:text-slate-950 uppercase transition"
          >
            BUNKER
          </button>
        </div>
      </div>
    </div>
  );
};
