import { useState } from 'react';
import Hub from './components/Hub';
import ContractScreen from './components/GachaScreen';
import PartyScreen from './components/RosterScreen';
import TravelScreen from './components/TravelScreen';
import BattleScreen from './components/BattleScreen';
import CharacterScreen from './components/CharacterScreen';
import LuggageScreen from './components/LuggageScreen';
import AccountScreen from './components/AccountScreen';
import QuestsScreen from './components/QuestsScreen';
import StoryViewer from './components/StoryViewer';
import DailyLoginScreen from './components/DailyLoginScreen';
import ArenaScreen from './components/ArenaScreen';

type Screen =
  | 'hub'
  | 'contract'
  | 'party'
  | 'travel'
  | 'characters'
  | 'luggage'
  | 'account'
  | 'quests'
  | 'stories'
  | 'daily'
  | 'arena'
  | { battle: string; exitTo: 'hub' | 'travel'; area?: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>('hub');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {screen === 'hub' && <Hub onNavigate={(s) => setScreen(s)} />}
      {screen === 'contract' && <ContractScreen onBack={() => setScreen('hub')} />}
      {screen === 'party' && <PartyScreen onBack={() => setScreen('hub')} />}
      {screen === 'characters' && <CharacterScreen onBack={() => setScreen('hub')} />}
      {screen === 'luggage' && <LuggageScreen onBack={() => setScreen('hub')} />}
      {screen === 'account' && <AccountScreen onBack={() => setScreen('hub')} />}
      {screen === 'quests' && <QuestsScreen onBack={() => setScreen('hub')} />}
      {screen === 'stories' && <StoryViewer onBack={() => setScreen('hub')} />}
      {screen === 'daily' && <DailyLoginScreen onBack={() => setScreen('hub')} />}
      {screen === 'arena' && (
        <ArenaScreen
          onBack={() => setScreen('hub')}
          onBattle={(id, area) => setScreen({ battle: id, exitTo: 'hub', area })}
        />
      )}
      {screen === 'travel' && (
        <TravelScreen
          onBack={() => setScreen('hub')}
          onBattle={(id, area) => setScreen({ battle: id, exitTo: 'travel', area })}
        />
      )}
      {typeof screen === 'object' && (
        <BattleScreen
          stageId={screen.battle}
          area={screen.area}
          onExit={() => setScreen(screen.exitTo)}
        />
      )}
    </div>
  );
}
