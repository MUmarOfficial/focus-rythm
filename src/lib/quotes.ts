export interface QuoteItem {
  id: string;
  text: string;
  subtext?: string;
}

export const WORK_QUOTES: QuoteItem[] = [
  { id: 'w1', text: 'Small, repeated efforts cut through any complex problem.' },
  { id: 'w2', text: 'One clean function at a time. Do not rush the architecture.' },
  { id: 'w3', text: 'Focus is not about doing more; it is about protecting your attention.' },
  { id: 'w4', text: 'Debugging teaches patience. True mastery is built in the difficult moments.' },
  { id: 'w5', text: 'Silence the noise outside. Right now, this single problem is your world.' },
  { id: 'w6', text: 'Depth creates clarity. Shallow distractions produce shallow results.' },
  { id: 'w7', text: 'Stay with the resistance. That is where real understanding happens.' },
  { id: 'w8', text: 'Code simply and think deeply. Elegance is what remains when excess is removed.' },
  { id: 'w9', text: 'Progress is quiet. Consistency over weeks outruns sudden bursts of effort.' },
  { id: 'w10', text: 'Trust the rhythm. A steady pace will take you further than urgent panic.' },
  { id: 'w11', text: 'You do not need to finish everything today. Just move this block forward.' },
  { id: 'w12', text: 'Clarity arrives through disciplined observation and continuous iteration.' },
  { id: 'w13', text: 'Protect your cognitive energy. Treat your concentration as your highest craft.' },
  { id: 'w14', text: 'Break the problem down until the next step feels completely obvious.' }
];

export const REST_PROMPTS: QuoteItem[] = [
  { id: 'r1', text: 'Drink a glass of water slowly and step away from the keyboard.' },
  { id: 'r2', text: 'Close your eyes for 30 seconds and let your optic nerve completely rest.' },
  { id: 'r3', text: 'Roll your shoulders back, drop your chin gently, and release neck tension.' },
  { id: 'r4', text: 'Look out a window or focus on a distant object for 20 seconds.' },
  { id: 'r5', text: 'Take five slow, deep breaths: inhale for 4 seconds, exhale for 6.' },
  { id: 'r6', text: 'Stand up, shake out your hands and wrists, and walk around your room.' },
  { id: 'r7', text: 'Unclench your jaw, soften your forehead, and let your spine settle naturally.' },
  { id: 'r8', text: 'Rest your palms in your lap. Notice the quiet rhythm of your breathing.' },
  { id: 'r9', text: 'Stretch both arms above your head and gently lean side to side.' }
];

export const REST_BENEFITS: QuoteItem[] = [
  { id: 'b1', text: 'Rest is not lost time; it is when your brain synthesizes newly learned patterns.' },
  { id: 'b2', text: 'Short mental breaks prevent decision fatigue and keep code quality elevated.' },
  { id: 'b3', text: 'Allowing your attention to drift clears cognitive buffer and sparks creative solutions.' },
  { id: 'b4', text: 'Recovery allows your nervous system to stay steady across multiple hours.' },
  { id: 'b5', text: 'Taking deliberate breaks is a mark of professional stamina, not weakness.' },
  { id: 'b6', text: 'A rested mind spots subtle logic bugs long before they reach production.' },
  { id: 'b7', text: 'Memory consolidation requires downtime. Let your subconscious do its work.' },
  { id: 'b8', text: 'Stepping back gives you fresh perspective when you re-enter the problem space.' },
  { id: 'b9', text: 'Sustained focus is a muscle; recovery between sets is what builds capacity.' }
];

export class QuoteSelector {
  private recentIds: string[] = [];
  private maxRecent: number;

  constructor(maxRecent = 4) {
    this.maxRecent = maxRecent;
  }

  select(list: QuoteItem[]): QuoteItem {
    if (!list.length) {
      return { id: 'fallback', text: 'Stay focused on the present moment.' };
    }
    // Filter candidates not recently selected
    const candidates = list.filter((item) => !this.recentIds.includes(item.id));
    const pool = candidates.length > 0 ? candidates : list;
    const choice = pool[Math.floor(Math.random() * pool.length)];

    this.recentIds.push(choice.id);
    if (this.recentIds.length > this.maxRecent) {
      this.recentIds.shift();
    }
    return choice;
  }
}

export const workQuoteSelector = new QuoteSelector(5);
export const restPromptSelector = new QuoteSelector(4);
export const restBenefitSelector = new QuoteSelector(4);
