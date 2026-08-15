export interface CutsceneLine {
  speaker: string;
  text: string;
  emotion?: 'neutral' | 'angry' | 'sad' | 'shocked' | 'determined';
}

export interface Cutscene {
  id: string;
  chapter: number;
  title: string;
  lines: CutsceneLine[];
  triggeredBy?: string; // 'start' | 'order_complete' | etc
  givesEvidence?: string; // evidence ID
  background?: string; // background image key
  rooms?: string[]; // rooms unlocked by this cutscene/chapter
}

export const CHAPTERS: Cutscene[][] = [
  // Chapter 1: The Betrayal (Days 1-3)
  [
    {
      id: 'cs_01',
      chapter: 1,
      title: 'The Return',
      lines: [
        { speaker: 'Emily', text: "I'm home, sweetheart... Brad? Claire? Anyone?", emotion: 'neutral' },
        { speaker: 'Emily', text: "The house is so quiet... Brad's car is in the driveway though.", emotion: 'neutral' },
        { speaker: 'Emily', text: "I'll check the master bedroom first.", emotion: 'determined' },
      ],
      triggeredBy: 'start',
    },
    {
      id: 'cs_02',
      chapter: 1,
      title: 'The Door',
      lines: [
        { speaker: 'Emily', text: "Brad? I saw the light under the door—", emotion: 'neutral' },
        { speaker: 'Emily', text: "Brad... and Claire?", emotion: 'shocked' },
        { speaker: 'Brad', text: "Emily! This... this isn't what it looks like!", emotion: 'angry' },
        { speaker: 'Claire', text: "Sister, please, let me explain—", emotion: 'sad' },
        { speaker: 'Emily', text: "ExplAIN?! You— both of you!", emotion: 'angry' },
        { speaker: 'Emily', text: "How long? How long has this been going on?!", emotion: 'angry' },
      ],
      triggeredBy: 'door_opened',
    },
    {
      id: 'cs_03',
      chapter: 1,
      title: 'The Confrontation',
      lines: [
        { speaker: 'Brad', text: "Emily, calm down—", emotion: 'angry' },
        { speaker: 'Emily', text: "Don't tell me to calm down! Pack your things, Brad. You're done.", emotion: 'determined' },
        { speaker: 'Claire', text: "Emily, you don't understand— your father—", emotion: 'sad' },
        { speaker: 'Emily', text: "Don't you dare bring Father into this!", emotion: 'angry' },
        { speaker: 'Brad', text: "Fine. You want out? You'll get out. But don't think you'll get a penny from me.", emotion: 'angry' },
        { speaker: 'Emily', text: "We'll see about that. I have rights to this house, to everything.", emotion: 'determined' },
      ],
      triggeredBy: 'cs_02_complete',
    },
    {
      id: 'cs_04',
      chapter: 1,
      title: 'Thrown Out',
      lines: [
        { speaker: 'Emily', text: "I can't believe— I just can't—", emotion: 'sad' },
        { speaker: 'Emily', text: "Twenty years of marriage. Twenty years.", emotion: 'sad' },
        { speaker: 'Emily', text: "And you, Claire. My own sister. You—", emotion: 'sad' },
        { speaker: 'Claire', text: "Emily, you never loved him the way he needed.", emotion: 'neutral' },
        { speaker: 'Emily', text: "Get out of my sight. Both of you. Get. Out.", emotion: 'angry' },
        { speaker: 'Brad', text: "This is my house, Emily. Not yours anymore. Leave.", emotion: 'angry' },
      ],
      triggeredBy: 'cs_03_complete',
    },
    {
      id: 'cs_05',
      chapter: 1,
      title: 'The Discovery',
      lines: [
        { speaker: 'Emily', text: "I need air. I need to think.", emotion: 'sad' },
        { speaker: 'Emily', text: "I'll go around to the back porch, catch my breath—", emotion: 'neutral' },
        { speaker: 'Emily', text: "Father?! FATHER!", emotion: 'shocked' },
        { speaker: 'Emily', text: "No, no, no— Father, stay with me! Stay with me!", emotion: 'sad' },
        { speaker: 'Emily', text: "He's not breathing... I need to call 911—", emotion: 'shocked' },
        { speaker: 'Emily', text: "What happened here? What did you do?", emotion: 'angry' },
      ],
      triggeredBy: 'backyard_trigger',
    },
    {
      id: 'cs_06',
      chapter: 1,
      title: 'The Detective',
      lines: [
        { speaker: 'Detective Morgan', text: "Ms. Harper, I'm Detective Morgan. I'm so sorry for your loss.", emotion: 'neutral' },
        { speaker: 'Emily', text: "My father... they say he fell. But something's wrong.", emotion: 'sad' },
        { speaker: 'Detective Morgan', text: "Our preliminary investigation suggests he lost his footing on the balcony.", emotion: 'neutral' },
        { speaker: 'Emily', text: "Father was careful. He was ALWAYS careful. He'd never—", emotion: 'determined' },
        { speaker: 'Detective Morgan', text: "I understand this is difficult. But we see no signs of foul play.", emotion: 'neutral' },
        { speaker: 'Emily', text: "I want to see his study. There might be something— evidence of what really happened.", emotion: 'determined' },
      ],
      triggeredBy: 'chapter_1_end',
    },
  ],
  // Chapter 2 placeholder (filled in later)
  [],
  // Chapter 3 placeholder
  [],
];

export function getCutscene(id: string): Cutscene | undefined {
  for (const chapter of CHAPTERS) {
    const found = (chapter as Cutscene[]).find(c => c.id === id);
    if (found) return found;
  }
  return undefined;
}

export function getChapter(chapterNum: number): Cutscene[] {
  return CHAPTERS[chapterNum - 1] || [];
}
