import { useState } from 'react';
import Hub from './components/Hub';
import GachaScreen from './components/GachaScreen';
import RosterScreen from './components/RosterScreen';
import StageSelectScreen from './components/StageSelectScreen';
import BattleScreen from './components/BattleScreen';

type Screen = 'hub' | 'gacha' | 'roster' | 'stages' | { battle: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>('hub');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {screen === 'hub' && <Hub onNavigate={(s) => setScreen(s)} />}
      {screen === 'gacha' && <GachaScreen onBack={() => setScreen('hub')} />}
      {screen === 'roster' && <RosterScreen onBack={() => setScreen('hub')} />}
      {screen === 'stages' && (
        <StageSelectScreen onBack={() => setScreen('hub')} onEnterStage={(stageId) => setScreen({ battle: stageId })} />
      )}
      {typeof screen === 'object' && <BattleScreen stageId={screen.battle} onExit={() => setScreen('stages')} />}
    </div>
  );
}
