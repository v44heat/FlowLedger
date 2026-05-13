// backend/src/modules/categorization/categorization.engine.ts

export type Category =
  | 'Food & Dining'
  | 'Transport'
  | 'Groceries'
  | 'Utilities'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Education'
  | 'Savings & Investment'
  | 'Mobile & Internet'
  | 'Transfer'
  | 'Income'
  | 'Withdrawal'
  | 'Uncategorized';

export interface CategorizationResult {
  category: Category;
  confidence: number;
  method: 'rule' | 'memory' | 'behavioral' | 'fallback';
}

// ─── Layer 1: Rule-Based Keyword Maps ─────────────────────────────────────────
const MERCHANT_RULES: Record<string, Category> = {
  // Transport
  uber: 'Transport',
  bolt: 'Transport',
  'little cab': 'Transport',
  faras: 'Transport',
  'kenya bus': 'Transport',
  'matatu': 'Transport',
  'boda': 'Transport',
  'safiri': 'Transport',
  'ez rider': 'Transport',
  'shuttle': 'Transport',
  'buupass': 'Transport',

  // Food & Dining
  'java house': 'Food & Dining',
  kfc: 'Food & Dining',
  mcdonalds: 'Food & Dining',
  artcaffe: 'Food & Dining',
  'chicken inn': 'Food & Dining',
  'pizza inn': 'Food & Dining',
  'debonairs': 'Food & Dining',
  galitos: 'Food & Dining',
  'urban eatery': 'Food & Dining',
  'mama mboga': 'Food & Dining',
  'restaurant': 'Food & Dining',
  'hotel': 'Food & Dining',
  'cafe': 'Food & Dining',

  // Groceries
  naivas: 'Groceries',
  quickmart: 'Groceries',
  carrefour: 'Groceries',
  chandarana: 'Groceries',
  cleanshelf: 'Groceries',
  'tuskys': 'Groceries',
  'market': 'Groceries',
  'supermarket': 'Groceries',

  // Utilities
  kplc: 'Utilities',
  'kenya power': 'Utilities',
  'nairobi water': 'Utilities',
  'nawasco': 'Utilities',
  'stima': 'Utilities',
  'okoa stima': 'Utilities',
  'pay bill': 'Utilities',

  // Mobile & Internet
  safaricom: 'Mobile & Internet',
  airtel: 'Mobile & Internet',
  telkom: 'Mobile & Internet',
  'zuku': 'Mobile & Internet',
  'faiba': 'Mobile & Internet',

  // Entertainment
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'dstv': 'Entertainment',
  'showmax': 'Entertainment',
  'cinema': 'Entertainment',
  'imax': 'Entertainment',
  'sky.garden': 'Entertainment',
  'bar': 'Entertainment',
  'club': 'Entertainment',
  'lounge': 'Entertainment',

  // Health
  'pharmacy': 'Health',
  'hospital': 'Health',
  'clinic': 'Health',
  'chemist': 'Health',
  'aga khan': 'Health',
  'nairobi hospital': 'Health',
  'kenyatta': 'Health',
  'lancet': 'Health',

  // Education
  'school': 'Education',
  'university': 'Education',
  'college': 'Education',
  'tuition': 'Education',
  'knec': 'Education',
  'helb': 'Education',

  // Savings & Investment
  'sacco': 'Savings & Investment',
  'mshwari': 'Savings & Investment',
  'kcb mpesa': 'Savings & Investment',
  'fuliza': 'Savings & Investment',
  'nse': 'Savings & Investment',
  'britam': 'Savings & Investment',
  'cic': 'Savings & Investment',
  'jubilee': 'Savings & Investment',

  // Shopping
  'jumia': 'Shopping',
  'kilimall': 'Shopping',
  'amazon': 'Shopping',
  'glovo': 'Shopping',
};

// ─── Layer 3: Behavioral Rules ────────────────────────────────────────────────
const inferBehavioral = (
  amount: number,
  hour: number,
  transactionType: string
): { category: Category; confidence: number } | null => {
  if (transactionType === 'CREDIT') return { category: 'Income', confidence: 0.75 };

  // Small morning amounts → likely transport
  if (amount >= 30 && amount <= 200 && hour >= 5 && hour <= 9) {
    return { category: 'Transport', confidence: 0.55 };
  }
  // Weekend nights → entertainment
  if (amount >= 200 && amount <= 3000 && hour >= 20) {
    return { category: 'Entertainment', confidence: 0.45 };
  }
  // Withdrawals
  if (transactionType === 'WITHDRAW') {
    return { category: 'Withdrawal', confidence: 0.9 };
  }
  return null;
};

// ─── Main Engine ──────────────────────────────────────────────────────────────
export const categorize = (
  merchantName: string,
  rawDescription: string,
  amount: number,
  transactionType: string,
  transactionDate: Date,
  merchantMemory?: { category: string; timesConfirmed: number } | null
): CategorizationResult => {
  const haystack = `${merchantName} ${rawDescription}`.toLowerCase();
  const hour = transactionDate.getHours();

  // Layer 2: Merchant memory (highest priority for user corrections)
  if (merchantMemory && merchantMemory.timesConfirmed >= 1) {
    const conf = Math.min(0.6 + merchantMemory.timesConfirmed * 0.08, 0.98);
    return {
      category: merchantMemory.category as Category,
      confidence: conf,
      method: 'memory',
    };
  }

  // Layer 1: Rule-based
  for (const [keyword, cat] of Object.entries(MERCHANT_RULES)) {
    if (haystack.includes(keyword)) {
      return { category: cat, confidence: 0.82, method: 'rule' };
    }
  }

  // Layer 3: Behavioral
  const behavioral = inferBehavioral(amount, hour, transactionType);
  if (behavioral) {
    return { ...behavioral, method: 'behavioral' };
  }

  // Layer 4: Fallback
  return { category: 'Uncategorized', confidence: 0.2, method: 'fallback' };
};