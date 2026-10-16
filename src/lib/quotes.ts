export interface QuoteItem {
  id: string;
  text: string;
  category?: string;
  subtext?: string;
}

export const WORK_QUOTES: QuoteItem[] = [
  // Cognitive Protocols & Technique
  { id: 'w1', category: 'FOCUS PROTOCOL', text: 'Define clear exit criteria before writing code. What does "done" look like for this round?' },
  { id: 'w2', category: 'ATTENTION SHIELD', text: 'Single-tab discipline: Silence communication streams. Protect your focus as your highest craft.' },
  { id: 'w3', category: 'FLOW STATE', text: 'The first 7 minutes generate friction. Push through resistance to reach effortless momentum.' },
  { id: 'w4', category: 'DEBUGGING CUE', text: 'Rubber-duck clarity: If stuck, explain the exact state transitions out loud or write them down.' },
  { id: 'w5', category: 'PROBLEM SOLVING', text: 'Sub-problem decomposition: Split the daunting task into 3 microscopic, trivial steps.' },
  { id: 'w6', category: 'CRAFT', text: 'One clean function at a time. Elegance is what remains when excess complexity is stripped away.' },
  { id: 'w7', category: 'DOPAMINE HYGIENE', text: 'Resist the urge to check status feeds or notification badges until the timer chime rings.' },
  { id: 'w8', category: 'CODE DESIGN', text: 'State machine thinking: Model system transitions on paper before touching UI or rendering logic.' },
  { id: 'w9', category: 'TEST-DRIVEN', text: 'Write the failing test or assertion first. Let automated feedback guide your implementation rhythm.' },
  { id: 'w10', category: 'PERSISTENCE', text: 'Stay with the resistance. The hardest debugging moments are where genuine mastery is forged.' },
  { id: 'w11', category: 'FLOW STATE', text: 'Silence the inner editor while drafting. Produce the working solution, then refactor cleanly.' },
  { id: 'w12', category: 'MEMORY SHIELD', text: 'Keep a quick scratchpad open for stray thoughts rather than tab-switching away.' },
  { id: 'w13', category: 'MINDSET', text: 'You do not need to finish everything today. Just move this block forward with deliberate care.' },
  { id: 'w14', category: 'MOMENTUM', text: 'Small, repeated efforts cut through any complex problem. Consistency outruns sudden bursts.' },
  { id: 'w15', category: 'CLARITY', text: 'Depth over speed. A robust 30-minute focus session beats 8 hours of fractured distraction.' },
  { id: 'w16', category: 'FOCUS PROTOCOL', text: 'Edge-case containment: Implement the happy path first, then methodically guard boundary cases.' },
  { id: 'w17', category: 'CADENCE', text: 'Trust the rhythm. A steady, sustainable pace will take you further than urgent panic.' },
  { id: 'w18', category: 'CRAFT', text: 'Clarity arrives through disciplined observation, clean types, and continuous iteration.' }
];

export const REST_PROMPTS: QuoteItem[] = [
  { id: 'r1', category: 'EYE RECOVERY', text: '20-20-20 Rule: Focus on an object 20 feet away for 20 seconds to relax ciliary eye muscles.' },
  { id: 'r2', category: 'PHYSIOLOGY', text: 'Physiological Sigh: Two deep inhales through your nose, followed by a long, slow exhale through your mouth.' },
  { id: 'r3', category: 'HYDRATION', text: 'Drink a glass of water slowly. Cognitive stamina drops measurably with mild dehydration.' },
  { id: 'r4', category: 'TENSION RELEASE', text: 'Roll shoulders back, drop chin gently, unclench your jaw, and let your spine settle naturally.' },
  { id: 'r5', category: 'MOBILITY', text: 'Stand up, reach both arms toward the ceiling, and gently stretch side to side.' },
  { id: 'r6', category: 'OPTIC REST', text: 'Palming Technique: Cup warm palms gently over closed eyes in complete darkness for 30 seconds.' },
  { id: 'r7', category: 'CIRCULATION', text: 'Stand up, shake out your hands and wrists, and take a quick walk away from your screen.' },
  { id: 'r8', category: 'BREATHWORK', text: 'Cadence Breathing: Inhale for 4 seconds, hold for 4, exhale for 6. Let your pulse settle.' },
  { id: 'r9', category: 'DIGITAL DETOX', text: 'Step away from the screen entirely. Avoid opening your phone during this interval.' },
  { id: 'r10', category: 'HORIZON RESET', text: 'Look out a window toward the distant horizon. Natural light resets cognitive alertness.' },
  { id: 'r11', category: 'ERGONOMICS', text: 'Interlace fingers, rotate wrists in circles, and gently stretch your forearms.' }
];

export const REST_BENEFITS: QuoteItem[] = [
  { id: 'b1', category: 'NEUROSCIENCE', text: 'Synaptic Consolidation: The brain synthesizes newly learned code patterns during offline downtime.' },
  { id: 'b2', category: 'CREATIVITY', text: 'Default Mode Network: Breakthrough solutions predominantly trigger when active focus is disengaged.' },
  { id: 'b3', category: 'ENERGY', text: 'Cognitive Buffer Reset: Rest restores prefrontal cortex glycogen, preventing decision fatigue.' },
  { id: 'b4', category: 'VISION', text: 'Optic Relief: Stepping back from close monitors prevents digital eye strain and tension headaches.' },
  { id: 'b5', category: 'STAMINA', text: 'Taking deliberate breaks is a hallmark of professional stamina, ensuring peak output all day.' },
  { id: 'b6', category: 'CODE QUALITY', text: 'A rested mind spots subtle logic bugs long before they reach production.' },
  { id: 'b7', category: 'NERVOUS SYSTEM', text: 'Deep exhales stimulate the vagus nerve, down-regulating cortisol and steadying heart rate.' },
  { id: 'b8', category: 'PERSPECTIVE', text: 'Stepping back gives you fresh perspective and clarifies the next immediate step.' }
];

export class QuoteSelector {
  private recentIds: string[] = [];
  private maxRecent: number;

  constructor(maxRecent = 4) {
    this.maxRecent = maxRecent;
  }

  select(list: QuoteItem[]): QuoteItem {
    if (!list.length) {
      return { id: 'fallback', category: 'FOCUS', text: 'Stay focused on the present moment.' };
    }
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

export const workQuoteSelector = new QuoteSelector(6);
export const restPromptSelector = new QuoteSelector(5);
export const restBenefitSelector = new QuoteSelector(4);
