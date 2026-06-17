import { useState } from 'react';
import Hub from './components/Hub';
import ContractScreen from './components/GachaScreen';
import PartyScreen from './components/RosterScreen';
import TravelScreen from './components/TravelScreen';
import BattleScreen from './components/BattleScreen';
import CharacterScreen from './components/CharacterScreen';
import LuggageScreen from './components/LuggageScreen';

type Screen =
  | 'hub'
  | 'contract'
  | 'party'
  | 'travel'
  | 'characters'
  | 'luggage'
  | { battle: string; exitTo: 'hub' | 'travel' };

export default function App() {
  const [screen, setScreen] = useState<Screen>('hub');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {screen === 'hub' && <Hub onNavigate={(s) => setScreen(s)} />}
      {screen === 'contract' && <ContractScreen onBack={() => setScreen('hub')} />}
      {screen === 'party' && <PartyScreen onBack={() => setScreen('hub')} />}
      {screen === 'characters' && <CharacterScreen onBack={() => setScreen('hub')} />}
      {screen === 'luggage' && <LuggageScreen onBack={() => setScreen('hub')} />}
      {screen === 'travel' && (
        <TravelScreen
          onBack={() => setScreen('hub')}
          onBattle={(id) => setScreen({ battle: id, exitTo: 'travel' })}
        />
      )}
      {typeof screen === 'object' && (
        <BattleScreen
          stageId={screen.battle}
          onExit={() => setScreen(screen.exitTo)}
        />
      )}
    </div>
  );
}
