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
    id: 'fleur-ch2', charId: 'fleur-theos', title: 'Three Metres Tall', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Narrator', text: 'The air shimmers. The temperature drops. Fleur\'s mortal form begins to dissolve.' },
      { speaker: 'Fleur Theòs', text: 'You wished to see? Then see.', mood: 'neutral' },
      { speaker: 'Narrator', text: 'She stands three metres tall. Light bends around her. The ground trembles with each breath she takes.' },
      { speaker: 'Fleur Theòs', text: 'This is what I am. Pure. Eternal. Beyond your comprehension — and yet, I stand beside you.' },
      { speaker: 'Fleur Theòs', text: 'Do not kneel. I did not reveal myself to be worshipped. I revealed myself so you would trust me.', mood: 'sad' },
    ],
  },

  // ── Róza Défteros ──
  {
    id: 'roza-ch1', charId: 'roza-defteros', title: 'Light Compressed', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Róza Défteros', text: 'Have you ever wondered what happens when you compress light to near-infinite density?', mood: 'happy' },
      { speaker: 'Narrator', text: 'She doesn\'t wait for an answer. A sphere of blinding radiance appears in her palm.' },
      { speaker: 'Róza Défteros', text: 'I call it Lustra Borealis. A field of light that travels at the speed of… itself. I invented it when I was fourteen.' },
      { speaker: 'Róza Défteros', text: 'Father never approved, of course. The Lord of Tesialyrodi prefers swords to sorcery.', mood: 'sad' },
      { speaker: 'Róza Défteros', text: 'But I am Psevdìan. Magic is not a choice — it is who I am.', mood: 'neutral' },
    ],
  },
  {
    id: 'roza-ch2', charId: 'roza-defteros', title: 'The Lord\'s Daughter', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Róza Défteros', text: 'You want to know about Tesialyrodi? It is a walled town on the river. Twenty thousand souls.', mood: 'neutral' },
      { speaker: 'Róza Défteros', text: 'My father governs it. The great church bell tolls at dawn. The guards patrol the walls. It is… orderly.' },
      { speaker: 'Róza Défteros', text: 'Auxentios is one of those guards. He is kind. Deliberate. He thinks before he swings his blade.', mood: 'happy' },
      { speaker: 'Róza Défteros', text: 'I left because I needed to understand what lies beyond the walls. Father did not stop me.' },
      { speaker: 'Róza Défteros', text: 'I think he knew I would leave eventually. Curiosity is a force stronger than stone.', mood: 'neutral' },
    ],
  },

  // ── Tomoe Yoshimi ──
  {
    id: 'tomoe-ch1', charId: 'tomoe-yoshimi', title: 'Honour of a Demon', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Tomoe Yoshimi', text: 'You look at me and see horns. Fangs. A demon.', mood: 'neutral' },
      { speaker: 'Tomoe Yoshimi', text: 'But I ask — have I not fought beside you? Bled for you? Protected you?', mood: 'angry' },
      { speaker: 'Narrator', text: 'Her katana catches the light. Her red eyes burn with something deeper than anger.' },
      { speaker: 'Tomoe Yoshimi', text: 'Honour is not a human invention. My kind have practised it longer than your civilisation has existed.' },
      { speaker: 'Tomoe Yoshimi', text: 'Judge me by my blade, not my blood.', mood: 'neutral' },
    ],
  },
  {
    id: 'tomoe-ch2', charId: 'tomoe-yoshimi', title: 'The Demon Kingdom', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Tomoe Yoshimi', text: 'The Demon Kingdom… it is not what you imagine. There are no rivers of fire, no screaming souls.' },
      { speaker: 'Tomoe Yoshimi', text: 'It is a place of order. Of ritual. Of ancient power held in check by discipline.', mood: 'neutral' },
      { speaker: 'Tomoe Yoshimi', text: 'I left because the Kingdom was changing. Those in power began to forget the old ways.' },
      { speaker: 'Tomoe Yoshimi', text: 'My katana remembers. And when the time comes, I will return to remind them.', mood: 'angry' },
    ],
  },

  // ── Auxentios Brígach ──
  {
    id: 'aux-ch1', charId: 'auxentios-brigach', title: 'The Guard\'s Oath', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Auxentios Brígach', text: 'I took an oath to protect Tesialyrodi. Every stone, every soul within its walls.' },
      { speaker: 'Auxentios Brígach', text: 'The Lord — Róza\'s father — he trusted me despite my mixed blood. Féinlárnach and Psevdìan.', mood: 'neutral' },
      { speaker: 'Auxentios Brígach', text: 'Not everyone was so welcoming. But I earned my place. One careful swing at a time.' },
      { speaker: 'Auxentios Brígach', text: 'Now I walk beyond the walls. The oath does not end at the gate — it follows me wherever I go.', mood: 'happy' },
    ],
  },
  {
    id: 'aux-ch2', charId: 'auxentios-brigach', title: 'Caution and Honour', levelRequired: 20,
    rewardCoins: 800, rewardRubies: 5,
    lines: [
      { speaker: 'Auxentios Brígach', text: 'Róza once told me I think too much before I strike. She is probably right.', mood: 'happy' },
      { speaker: 'Auxentios Brígach', text: 'But caution has kept me alive where recklessness killed better swordsmen.' },
      { speaker: 'Auxentios Brígach', text: 'My blade is deliberate. My honour is absolute. And my caution is often the difference between life and death.', mood: 'neutral' },
      { speaker: 'Narrator', text: 'He rests his hand on his sword hilt — not in threat, but in quiet certainty.' },
    ],
  },

  // ── Casilda ──
  {
    id: 'casilda-ch1', charId: 'casilda', title: 'The Broom and the Spirit', levelRequired: 10,
    rewardCoins: 500, rewardRubies: 3,
    lines: [
      { speaker: 'Casilda', text: 'I have no magic. No divine blood. No ancient sword passed down through generations.' },
      { speaker: 'Casilda', text: 'I have a broom. And I have heart. That is enough.', mood: 'happy' },
      { speaker: 'Narrator', text: 'She says it plainly, without irony. And somehow, you believe her.' },
      { speaker: 'Casilda', text: 'Solitaria was an ordinary place. I was an ordinary woman. Then the extraordinary came knocking — and I answered.', mood: 'neutral' },
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
