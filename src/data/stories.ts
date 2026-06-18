export interface StoryLine {
  speaker: string;
  text: string;
  mood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';
}

export interface StoryChapter {
  id: string;
  charId: string;
  title: string;
  levelRequired: number;
  lines: StoryLine[];
  rewardCoins: number;
  rewardRubies: number;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  // ── Róza Défteros ──
  {
    id: 'roza-ch1', charId: 'roza-defteros', title: 'The Lord\'s Daughter', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Róza Défteros', text: 'I was born in Tesialyrodi. A walled town on the river — twenty thousand souls, give or take.' },
      { speaker: 'Róza Défteros', text: 'My father is the Lord. Wealthy. Respected. Always busy with the affairs of important people.', mood: 'neutral' },
      { speaker: 'Róza Défteros', text: 'I barely saw him growing up. Or my mother. They had a town to govern, after all.' },
      { speaker: 'Róza Défteros', text: 'It was Casilda who raised me, mostly. My maid. She was more of a mother to me than anyone.', mood: 'happy' },
      { speaker: 'Narrator', text: 'Róza\'s expression softens. For a moment, the brilliant mage looks like a child remembering home.' },
    ],
  },
  {
    id: 'roza-ch2', charId: 'roza-defteros', title: 'The First Vision', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Róza Défteros', text: 'At birth, I was raised by the clergy. The sisters of the faith. They taught me prayers and scripture.' },
      { speaker: 'Róza Défteros', text: 'When I was six years old… I saw something. A vision. But I was too young to understand it. I just cried.', mood: 'sad' },
      { speaker: 'Narrator', text: 'She pauses, her eyes distant — looking at something only she can see.' },
      { speaker: 'Róza Défteros', text: 'As years passed, the vision grew clearer. I started to become conscious of it. I told the sisters.', mood: 'neutral' },
      { speaker: 'Róza Défteros', text: 'They said I was daydreaming. Stressed. I was confused — surely they of all people would understand.', mood: 'surprised' },
      { speaker: 'Róza Défteros', text: 'They were closest to the goddess. How could they not know what I was seeing?', mood: 'sad' },
    ],
  },
  {
    id: 'roza-ch3', charId: 'roza-defteros', title: 'The Prophecy Revealed', levelRequired: 30,
    rewardCoins: 1200, rewardRubies: 8,
    lines: [
      { speaker: 'Róza Défteros', text: 'I tried to ignore it. I thought perhaps it was the stress — the duties, the expectations. So I buried it.' },
      { speaker: 'Róza Défteros', text: 'Then one day, in a small town, I was buying groceries. Something ordinary. Something safe.', mood: 'neutral' },
      { speaker: 'Narrator', text: 'Róza\'s hands tremble as she speaks. The memory still holds her.' },
      { speaker: 'Róza Défteros', text: 'Out of nowhere, the vision became perfectly clear. I saw everything. All of it.', mood: 'surprised' },
      { speaker: 'Róza Défteros', text: 'It was like a scene from a fairytale. And it frightened me beyond words.' },
      { speaker: 'Róza Défteros', text: 'In the midst of it all, I saw her. A very tall woman. A gold eye cover. A floating crown of gold. White robes within, black robes without.', mood: 'surprised' },
      { speaker: 'Róza Défteros', text: 'I was convinced — I was seeing the deity. The one we worship. The one the sisters pray to every morning.' },
      { speaker: 'Narrator', text: 'Róza closes her eyes. When she opens them, they are steady again.' },
      { speaker: 'Róza Défteros', text: 'And then my vision blurred. All the answers I had been yearning for — they slipped away, just out of reach.', mood: 'sad' },
    ],
  },
  {
    id: 'roza-ch4', charId: 'roza-defteros', title: 'The Search Begins', levelRequired: 40,
    rewardCoins: 1500, rewardRubies: 10,
    lines: [
      { speaker: 'Róza Défteros', text: 'Now I understood. The vision was a prophecy. I went back to the sisters — this time I asked directly.' },
      { speaker: 'Róza Défteros', text: '"Tell me about the prophecy," I said. They looked at me as if I had gone mad.', mood: 'neutral' },
      { speaker: 'Róza Défteros', text: '"There is no prophecy," they said. "Our god was a human. Not a deity."', mood: 'angry' },
      { speaker: 'Narrator', text: 'Róza\'s voice drops. The betrayal in her tone is quiet but absolute.' },
      { speaker: 'Róza Défteros', text: 'I was in utter shock. The sisters — who devoted their entire lives to the religion — did not know their own deity?' },
      { speaker: 'Róza Défteros', text: 'How? How is that possible?', mood: 'angry' },
      { speaker: 'Róza Défteros', text: 'I wanted answers. And if the sisters could not give them to me, then I would find them myself.' },
      { speaker: 'Róza Défteros', text: 'I would search for the pilgrimages. I would find the deity. Whatever it takes.', mood: 'neutral' },
      { speaker: 'Narrator', text: 'She turns toward the road ahead. The light of Lustra Borealis flickers in her palm — a torch for a journey with no map.' },
    ],
  },

  // ── Auxentios Brígach ──
  {
    id: 'aux-ch1', charId: 'auxentios-brigach', title: 'The Guard\'s Oath', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Auxentios Brígach', text: 'I took an oath to protect Tesialyrodi. Every stone, every soul within its walls.' },
      { speaker: 'Auxentios Brígach', text: 'The Lord — Róza\'s father — he trusted me despite my mixed blood. Féinlárnach and Psevdìan.', mood: 'neutral' },
      { speaker: 'Auxentios Brígach', text: 'My family was not always here. They came from the Northern Regions. Evacuated south during the Great War.' },
      { speaker: 'Auxentios Brígach', text: 'We settled in the Défteros lands. The Lord gave us purpose. I gave him my blade.', mood: 'neutral' },
    ],
  },
  {
    id: 'aux-ch2', charId: 'auxentios-brigach', title: 'The Sword of Demon Remains', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Auxentios Brígach', text: 'This sword is a family relic. The Sword of the Demon Remains.' },
      { speaker: 'Narrator', text: 'He draws the blade slowly. Its edge catches the light with a strange, dark shimmer.' },
      { speaker: 'Auxentios Brígach', text: 'My great-great-grandfather crafted it at the end of the Great War Era. A hundred and fifty years ago.', mood: 'neutral' },
      { speaker: 'Auxentios Brígach', text: 'Forged from materials taken from fallen demons. It carries their strength — and their memory.' },
      { speaker: 'Auxentios Brígach', text: 'Róza once told me I think too much before I strike. She is probably right.', mood: 'happy' },
      { speaker: 'Auxentios Brígach', text: 'But caution has kept me alive where recklessness killed better swordsmen. My blade is deliberate. My honour is absolute.' },
    ],
  },
  {
    id: 'aux-ch3', charId: 'auxentios-brigach', title: 'Beyond the Walls', levelRequired: 30,
    rewardCoins: 1200, rewardRubies: 8,
    lines: [
      { speaker: 'Auxentios Brígach', text: 'When Róza left Tesialyrodi to search for answers, I could not let her go alone.' },
      { speaker: 'Auxentios Brígach', text: 'I am a guard. My oath is to protect. And she is the Lord\'s daughter.', mood: 'neutral' },
      { speaker: 'Auxentios Brígach', text: 'But that is not the only reason. Róza is brilliant. Curious. And utterly reckless when she fixates on something.' },
      { speaker: 'Auxentios Brígach', text: 'Someone needs to be the careful one. That has always been me.', mood: 'happy' },
      { speaker: 'Narrator', text: 'He rests his hand on the Sword of Demon Remains. The oath follows him wherever he goes.' },
    ],
  },

  // ── Tomoe Yoshimi ──
  {
    id: 'tomoe-ch1', charId: 'tomoe-yoshimi', title: 'The Strongest General', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Tomoe Yoshimi', text: 'During the War Era, I held the rank of High General. The highest military title a demon can receive.' },
      { speaker: 'Tomoe Yoshimi', text: 'I was respected across the kingdom for my strength. Honoured. Feared.', mood: 'neutral' },
      { speaker: 'Narrator', text: 'Her red eyes are steady. There is no boast in her voice — only fact.' },
      { speaker: 'Tomoe Yoshimi', text: 'What made me different was not raw power. It was honour. Most demons see it as weakness. I saw it as the only thing that separates a warrior from a monster.' },
      { speaker: 'Tomoe Yoshimi', text: 'Judge me by my blade, not my blood.', mood: 'neutral' },
    ],
  },
  {
    id: 'tomoe-ch2', charId: 'tomoe-yoshimi', title: 'A Technique Refined', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Tomoe Yoshimi', text: 'There is a combat technique — ancient, complicated, devastatingly powerful. Most demons spend years learning it. Decades, even.' },
      { speaker: 'Tomoe Yoshimi', text: 'I mastered it in weeks.', mood: 'neutral' },
      { speaker: 'Narrator', text: 'She says it without pride. As if reporting the weather.' },
      { speaker: 'Tomoe Yoshimi', text: 'The Demon Lord himself acknowledged my strength. He said I was stronger than him. He crowned me with that title publicly.' },
      { speaker: 'Tomoe Yoshimi', text: '"The Strongest Demon General of the War Era." Because of my power and my status, I was rarely sent to the battlefield.', mood: 'neutral' },
      { speaker: 'Tomoe Yoshimi', text: 'They kept me in reserve. A weapon too valuable to risk. I never agreed with that decision.', mood: 'angry' },
    ],
  },
  {
    id: 'tomoe-ch3', charId: 'tomoe-yoshimi', title: 'The Kingdom Changes', levelRequired: 30,
    rewardCoins: 1200, rewardRubies: 8,
    lines: [
      { speaker: 'Tomoe Yoshimi', text: 'The Demon Kingdom is not what you imagine. There are no rivers of fire, no screaming souls.' },
      { speaker: 'Tomoe Yoshimi', text: 'It is a place of order. Of ritual. Of ancient power held in check by discipline.', mood: 'neutral' },
      { speaker: 'Tomoe Yoshimi', text: 'But after the war… things changed. Those in power began to forget the old ways. Honour became inconvenient.' },
      { speaker: 'Tomoe Yoshimi', text: 'I left because staying meant watching everything I believed in rot from the inside.', mood: 'sad' },
      { speaker: 'Tomoe Yoshimi', text: 'My katana remembers the old ways. And when the time comes, I will return to remind them.', mood: 'angry' },
    ],
  },

  // ── Casilda ──
  {
    id: 'casilda-ch1', charId: 'casilda', title: 'A Life in Solitaria', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Casilda', text: 'I am from the Solitaria culture. My family were migrants — third generation.' },
      { speaker: 'Casilda', text: 'During the civil war, my grandparents followed the leaders of the Psevdìs faith south, to a secluded peninsula where they would be safe from the demon invaders.', mood: 'neutral' },
      { speaker: 'Casilda', text: 'They settled there alongside the locals who founded the faith. It was a simple life. Poor, but honest.' },
      { speaker: 'Narrator', text: 'She speaks without bitterness. As if poverty were simply weather — something you endure, not something you resent.' },
      { speaker: 'Casilda', text: 'I grew up in a small village. The closest city was hours away. I would walk there to buy and sell goods for my family.', mood: 'neutral' },
    ],
  },
  {
    id: 'casilda-ch2', charId: 'casilda', title: 'When Everything Was Taken', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Casilda', text: 'When my parents died, the tax collectors came. My father owed money. They took everything — the farm, the land, all of it.', mood: 'sad' },
      { speaker: 'Casilda', text: 'I was forced to leave. I gathered what little money I had and rented a room in town. But I could not find work.' },
      { speaker: 'Casilda', text: 'No job. No husband. No prospects. The money was running out. I was eighteen years old and I had nothing.', mood: 'sad' },
      { speaker: 'Narrator', text: 'Her voice is steady, but her hands grip the edge of her broom tightly.' },
      { speaker: 'Casilda', text: 'I began to think… that there was only one way left for a woman like me to survive in that town.', mood: 'sad' },
    ],
  },
  {
    id: 'casilda-ch3', charId: 'casilda', title: 'The Little Girl', levelRequired: 30,
    rewardCoins: 1200, rewardRubies: 8,
    lines: [
      { speaker: 'Casilda', text: 'I dressed in the best clothes I had. I used the last of my change to buy perfume. I put on makeup.' },
      { speaker: 'Casilda', text: 'I stood on the street and waited. Men looked at me. Some approached.', mood: 'neutral' },
      { speaker: 'Casilda', text: 'But when I saw their faces… the way they looked at me… I broke down. I could not do it. I sat on the ground and cried.', mood: 'sad' },
      { speaker: 'Narrator', text: 'Casilda wipes her eyes. The memory is old, but the wound has never fully closed.' },
      { speaker: 'Casilda', text: 'Then a little girl walked up to me. She was three years old. She asked why I was crying and tried to give me a hug.', mood: 'surprised' },
      { speaker: 'Casilda', text: 'I looked up at her and cried even harder. She patted my head and said, "It\'s okay. It\'s okay."', mood: 'sad' },
      { speaker: 'Casilda', text: 'Her parents came. They asked what had happened. The little girl begged them — "Can we take her home? She\'s pretty. I like her."', mood: 'happy' },
      { speaker: 'Narrator', text: 'Casilda smiles through tears.' },
      { speaker: 'Casilda', text: 'They were the Lords of the town. The Défteros family. They offered me a job and a place to stay. That little girl… was Róza.', mood: 'happy' },
      { speaker: 'Casilda', text: 'I have no magic. No divine blood. No ancient sword. I have a broom and I have heart. And that is enough.', mood: 'neutral' },
    ],
  },

  // ── Fleur Theòs ──
  {
    id: 'fleur-ch1', charId: 'fleur-theos', title: 'The Mortal Guise', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Fleur Theòs', text: 'You seem… surprised. Did you expect a Demi-God to tower above you at all times?' },
      { speaker: 'Fleur Theòs', text: 'In this form I walk gently. I feel the grass beneath my feet, the wind on my skin. It is… pleasant.', mood: 'happy' },
      { speaker: 'Narrator', text: 'She smiles — but her eyes hold the weight of aeons.' },
      { speaker: 'Fleur Theòs', text: 'Do not mistake gentleness for weakness. I chose this guise. I can unchoose it.' },
      { speaker: 'Fleur Theòs', text: 'Walk with me a while. I would like to understand what drives you mortals forward.', mood: 'neutral' },
    ],
  },
  {
    id: 'fleur-ch2', charId: 'fleur-theos', title: 'The War\'s End', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Fleur Theòs', text: 'During the War Era, I was a Pure Elf Mage. The strongest of my kind — though that title meant little when the world was burning.' },
      { speaker: 'Fleur Theòs', text: 'The Royal Kingdom and the Demon Kingdom had fought for so long that neither side remembered why. Only that they must.', mood: 'neutral' },
      { speaker: 'Narrator', text: 'Her voice carries the weight of someone who has witnessed civilisations rise and fall.' },
      { speaker: 'Fleur Theòs', text: 'I ended the war. Not with diplomacy. Not with compromise. With devastation.' },
      { speaker: 'Fleur Theòs', text: 'I created No Man\'s Land — a scar between the two kingdoms so vast, so ruined by magic, that neither side could cross it.' },
      { speaker: 'Fleur Theòs', text: 'They called it peace. I call it exhaustion.', mood: 'sad' },
    ],
  },
  {
    id: 'fleur-ch3', charId: 'fleur-theos', title: 'Three Metres Tall', levelRequired: 30,
    rewardCoins: 1200, rewardRubies: 8,
    lines: [
      { speaker: 'Narrator', text: 'The air shimmers. The temperature drops. Fleur\'s mortal form begins to dissolve.' },
      { speaker: 'Fleur Theòs', text: 'You wished to see? Then see.', mood: 'neutral' },
      { speaker: 'Narrator', text: 'She stands three metres tall. Light bends around her. The ground trembles with each breath she takes.' },
      { speaker: 'Fleur Theòs', text: 'This is what I am. Pure. Eternal. Beyond your comprehension — and yet, I stand beside you.' },
      { speaker: 'Fleur Theòs', text: 'The power that carved No Man\'s Land flows through me still. Every moment of every day, I hold it in check.', mood: 'neutral' },
      { speaker: 'Fleur Theòs', text: 'Do not kneel. I did not reveal myself to be worshipped. I revealed myself so you would trust me.', mood: 'sad' },
    ],
  },

  // ── Anwältin Von Berater ──
  {
    id: 'anwaltin-ch1', charId: 'anwaltin-von-berater', title: 'Beyond Comprehension', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Anwältin Von Berater', text: 'You want to understand my power? That is sweet. Truly.', mood: 'happy' },
      { speaker: 'Anwältin Von Berater', text: 'I can create a black hole in the palm of my hand. I can reach into your mind and rewrite your deepest convictions.' },
      { speaker: 'Narrator', text: 'She says this the way someone might describe making tea.' },
      { speaker: 'Anwältin Von Berater', text: 'But I choose kindness. I choose sweetness. Because power without restraint is just destruction.', mood: 'neutral' },
      { speaker: 'Anwältin Von Berater', text: 'Threaten what I love, though, and I will collapse reality around you without hesitation.', mood: 'angry' },
    ],
  },
];
