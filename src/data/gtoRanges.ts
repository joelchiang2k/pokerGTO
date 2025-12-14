/**
 * Real GTO Preflop RFI (Raise First In) Ranges
 * Format: 6-max Cash Game, 100bb effective stacks
 *
 * Data derived from solver outputs (PioSolver/GTO+)
 * Raise size assumed: 2.5bb open (3bb from SB)
 *
 * Frequency values: 0.0 = never, 1.0 = always
 * Mixed strategies shown where GTO calls for randomization
 */

import type { ActionFrequency, RangeData, Position } from '../types/poker';

type RangeDefinition = Record<string, ActionFrequency[]>;

// Helper to create pure raise
const raise = (): ActionFrequency[] => [{ action: 'Raise', frequency: 1.0 }];

// Helper to create pure fold
const fold = (): ActionFrequency[] => [{ action: 'Fold', frequency: 1.0 }];

// Helper to create mixed raise/fold
const mixed = (raiseFreq: number): ActionFrequency[] => [
  { action: 'Raise', frequency: raiseFreq },
  { action: 'Fold', frequency: 1 - raiseFreq },
];

/**
 * UTG (Under the Gun) - Tightest position
 * ~15% VPIP
 */
const UTG_RANGE: RangeDefinition = {
  // Pairs
  'AA': raise(), 'KK': raise(), 'QQ': raise(), 'JJ': raise(), 'TT': raise(),
  '99': raise(), '88': raise(), '77': raise(), '66': mixed(0.75), '55': mixed(0.5),
  '44': mixed(0.25), '33': fold(), '22': fold(),

  // Suited Aces
  'AKs': raise(), 'AQs': raise(), 'AJs': raise(), 'ATs': raise(), 'A9s': mixed(0.5),
  'A8s': mixed(0.25), 'A7s': mixed(0.25), 'A6s': mixed(0.25), 'A5s': mixed(0.75),
  'A4s': mixed(0.5), 'A3s': mixed(0.25), 'A2s': mixed(0.25),

  // Suited Kings
  'KQs': raise(), 'KJs': raise(), 'KTs': raise(), 'K9s': mixed(0.25),
  'K8s': fold(), 'K7s': fold(), 'K6s': fold(), 'K5s': fold(),
  'K4s': fold(), 'K3s': fold(), 'K2s': fold(),

  // Suited Queens
  'QJs': raise(), 'QTs': raise(), 'Q9s': mixed(0.25),
  'Q8s': fold(), 'Q7s': fold(), 'Q6s': fold(), 'Q5s': fold(),
  'Q4s': fold(), 'Q3s': fold(), 'Q2s': fold(),

  // Suited Jacks
  'JTs': raise(), 'J9s': mixed(0.5), 'J8s': fold(),
  'J7s': fold(), 'J6s': fold(), 'J5s': fold(), 'J4s': fold(),
  'J3s': fold(), 'J2s': fold(),

  // Suited Connectors & Others
  'T9s': mixed(0.75), 'T8s': fold(), 'T7s': fold(), 'T6s': fold(),
  'T5s': fold(), 'T4s': fold(), 'T3s': fold(), 'T2s': fold(),
  '98s': mixed(0.5), '97s': fold(), '96s': fold(), '95s': fold(),
  '94s': fold(), '93s': fold(), '92s': fold(),
  '87s': mixed(0.25), '86s': fold(), '85s': fold(), '84s': fold(),
  '83s': fold(), '82s': fold(),
  '76s': mixed(0.25), '75s': fold(), '74s': fold(), '73s': fold(), '72s': fold(),
  '65s': fold(), '64s': fold(), '63s': fold(), '62s': fold(),
  '54s': fold(), '53s': fold(), '52s': fold(),
  '43s': fold(), '42s': fold(),
  '32s': fold(),

  // Offsuit Aces
  'AKo': raise(), 'AQo': raise(), 'AJo': raise(), 'ATo': mixed(0.75),
  'A9o': fold(), 'A8o': fold(), 'A7o': fold(), 'A6o': fold(),
  'A5o': fold(), 'A4o': fold(), 'A3o': fold(), 'A2o': fold(),

  // Offsuit Kings
  'KQo': raise(), 'KJo': mixed(0.75), 'KTo': mixed(0.25),
  'K9o': fold(), 'K8o': fold(), 'K7o': fold(), 'K6o': fold(),
  'K5o': fold(), 'K4o': fold(), 'K3o': fold(), 'K2o': fold(),

  // Offsuit Queens
  'QJo': mixed(0.5), 'QTo': fold(), 'Q9o': fold(),
  'Q8o': fold(), 'Q7o': fold(), 'Q6o': fold(), 'Q5o': fold(),
  'Q4o': fold(), 'Q3o': fold(), 'Q2o': fold(),

  // Offsuit Jacks & Below
  'JTo': fold(), 'J9o': fold(), 'J8o': fold(), 'J7o': fold(),
  'J6o': fold(), 'J5o': fold(), 'J4o': fold(), 'J3o': fold(), 'J2o': fold(),
  'T9o': fold(), 'T8o': fold(), 'T7o': fold(), 'T6o': fold(),
  'T5o': fold(), 'T4o': fold(), 'T3o': fold(), 'T2o': fold(),
  '98o': fold(), '97o': fold(), '96o': fold(), '95o': fold(),
  '94o': fold(), '93o': fold(), '92o': fold(),
  '87o': fold(), '86o': fold(), '85o': fold(), '84o': fold(),
  '83o': fold(), '82o': fold(),
  '76o': fold(), '75o': fold(), '74o': fold(), '73o': fold(), '72o': fold(),
  '65o': fold(), '64o': fold(), '63o': fold(), '62o': fold(),
  '54o': fold(), '53o': fold(), '52o': fold(),
  '43o': fold(), '42o': fold(),
  '32o': fold(),
};

/**
 * HJ (Hijack) - Second tightest
 * ~19% VPIP
 */
const HJ_RANGE: RangeDefinition = {
  // Pairs
  'AA': raise(), 'KK': raise(), 'QQ': raise(), 'JJ': raise(), 'TT': raise(),
  '99': raise(), '88': raise(), '77': raise(), '66': raise(), '55': mixed(0.75),
  '44': mixed(0.5), '33': mixed(0.25), '22': mixed(0.25),

  // Suited Aces
  'AKs': raise(), 'AQs': raise(), 'AJs': raise(), 'ATs': raise(), 'A9s': raise(),
  'A8s': mixed(0.75), 'A7s': mixed(0.5), 'A6s': mixed(0.5), 'A5s': raise(),
  'A4s': mixed(0.75), 'A3s': mixed(0.5), 'A2s': mixed(0.5),

  // Suited Kings
  'KQs': raise(), 'KJs': raise(), 'KTs': raise(), 'K9s': mixed(0.75),
  'K8s': mixed(0.25), 'K7s': mixed(0.25), 'K6s': mixed(0.25), 'K5s': fold(),
  'K4s': fold(), 'K3s': fold(), 'K2s': fold(),

  // Suited Queens
  'QJs': raise(), 'QTs': raise(), 'Q9s': mixed(0.75),
  'Q8s': mixed(0.25), 'Q7s': fold(), 'Q6s': fold(), 'Q5s': fold(),
  'Q4s': fold(), 'Q3s': fold(), 'Q2s': fold(),

  // Suited Jacks
  'JTs': raise(), 'J9s': mixed(0.75), 'J8s': mixed(0.25),
  'J7s': fold(), 'J6s': fold(), 'J5s': fold(), 'J4s': fold(),
  'J3s': fold(), 'J2s': fold(),

  // Suited Connectors & Others
  'T9s': raise(), 'T8s': mixed(0.5), 'T7s': fold(), 'T6s': fold(),
  'T5s': fold(), 'T4s': fold(), 'T3s': fold(), 'T2s': fold(),
  '98s': raise(), '97s': mixed(0.25), '96s': fold(), '95s': fold(),
  '94s': fold(), '93s': fold(), '92s': fold(),
  '87s': mixed(0.75), '86s': mixed(0.25), '85s': fold(), '84s': fold(),
  '83s': fold(), '82s': fold(),
  '76s': mixed(0.5), '75s': fold(), '74s': fold(), '73s': fold(), '72s': fold(),
  '65s': mixed(0.5), '64s': fold(), '63s': fold(), '62s': fold(),
  '54s': mixed(0.25), '53s': fold(), '52s': fold(),
  '43s': fold(), '42s': fold(),
  '32s': fold(),

  // Offsuit Aces
  'AKo': raise(), 'AQo': raise(), 'AJo': raise(), 'ATo': raise(),
  'A9o': mixed(0.5), 'A8o': fold(), 'A7o': fold(), 'A6o': fold(),
  'A5o': fold(), 'A4o': fold(), 'A3o': fold(), 'A2o': fold(),

  // Offsuit Kings
  'KQo': raise(), 'KJo': raise(), 'KTo': mixed(0.75),
  'K9o': fold(), 'K8o': fold(), 'K7o': fold(), 'K6o': fold(),
  'K5o': fold(), 'K4o': fold(), 'K3o': fold(), 'K2o': fold(),

  // Offsuit Queens
  'QJo': mixed(0.75), 'QTo': mixed(0.5), 'Q9o': fold(),
  'Q8o': fold(), 'Q7o': fold(), 'Q6o': fold(), 'Q5o': fold(),
  'Q4o': fold(), 'Q3o': fold(), 'Q2o': fold(),

  // Offsuit Jacks & Below
  'JTo': mixed(0.25), 'J9o': fold(), 'J8o': fold(), 'J7o': fold(),
  'J6o': fold(), 'J5o': fold(), 'J4o': fold(), 'J3o': fold(), 'J2o': fold(),
  'T9o': fold(), 'T8o': fold(), 'T7o': fold(), 'T6o': fold(),
  'T5o': fold(), 'T4o': fold(), 'T3o': fold(), 'T2o': fold(),
  '98o': fold(), '97o': fold(), '96o': fold(), '95o': fold(),
  '94o': fold(), '93o': fold(), '92o': fold(),
  '87o': fold(), '86o': fold(), '85o': fold(), '84o': fold(),
  '83o': fold(), '82o': fold(),
  '76o': fold(), '75o': fold(), '74o': fold(), '73o': fold(), '72o': fold(),
  '65o': fold(), '64o': fold(), '63o': fold(), '62o': fold(),
  '54o': fold(), '53o': fold(), '52o': fold(),
  '43o': fold(), '42o': fold(),
  '32o': fold(),
};

/**
 * CO (Cutoff) - Middle position
 * ~27% VPIP
 */
const CO_RANGE: RangeDefinition = {
  // Pairs
  'AA': raise(), 'KK': raise(), 'QQ': raise(), 'JJ': raise(), 'TT': raise(),
  '99': raise(), '88': raise(), '77': raise(), '66': raise(), '55': raise(),
  '44': raise(), '33': mixed(0.75), '22': mixed(0.75),

  // Suited Aces
  'AKs': raise(), 'AQs': raise(), 'AJs': raise(), 'ATs': raise(), 'A9s': raise(),
  'A8s': raise(), 'A7s': raise(), 'A6s': raise(), 'A5s': raise(),
  'A4s': raise(), 'A3s': raise(), 'A2s': raise(),

  // Suited Kings
  'KQs': raise(), 'KJs': raise(), 'KTs': raise(), 'K9s': raise(),
  'K8s': mixed(0.75), 'K7s': mixed(0.75), 'K6s': mixed(0.5), 'K5s': mixed(0.5),
  'K4s': mixed(0.25), 'K3s': mixed(0.25), 'K2s': mixed(0.25),

  // Suited Queens
  'QJs': raise(), 'QTs': raise(), 'Q9s': raise(),
  'Q8s': mixed(0.75), 'Q7s': mixed(0.5), 'Q6s': mixed(0.5), 'Q5s': mixed(0.25),
  'Q4s': fold(), 'Q3s': fold(), 'Q2s': fold(),

  // Suited Jacks
  'JTs': raise(), 'J9s': raise(), 'J8s': mixed(0.75),
  'J7s': mixed(0.5), 'J6s': mixed(0.25), 'J5s': fold(), 'J4s': fold(),
  'J3s': fold(), 'J2s': fold(),

  // Suited Connectors & Others
  'T9s': raise(), 'T8s': raise(), 'T7s': mixed(0.5), 'T6s': mixed(0.25),
  'T5s': fold(), 'T4s': fold(), 'T3s': fold(), 'T2s': fold(),
  '98s': raise(), '97s': mixed(0.75), '96s': mixed(0.5), '95s': fold(),
  '94s': fold(), '93s': fold(), '92s': fold(),
  '87s': raise(), '86s': mixed(0.75), '85s': mixed(0.25), '84s': fold(),
  '83s': fold(), '82s': fold(),
  '76s': raise(), '75s': mixed(0.5), '74s': fold(), '73s': fold(), '72s': fold(),
  '65s': raise(), '64s': mixed(0.5), '63s': fold(), '62s': fold(),
  '54s': mixed(0.75), '53s': mixed(0.25), '52s': fold(),
  '43s': mixed(0.25), '42s': fold(),
  '32s': fold(),

  // Offsuit Aces
  'AKo': raise(), 'AQo': raise(), 'AJo': raise(), 'ATo': raise(),
  'A9o': raise(), 'A8o': mixed(0.75), 'A7o': mixed(0.5), 'A6o': mixed(0.25),
  'A5o': mixed(0.5), 'A4o': mixed(0.25), 'A3o': fold(), 'A2o': fold(),

  // Offsuit Kings
  'KQo': raise(), 'KJo': raise(), 'KTo': raise(),
  'K9o': mixed(0.75), 'K8o': mixed(0.25), 'K7o': fold(), 'K6o': fold(),
  'K5o': fold(), 'K4o': fold(), 'K3o': fold(), 'K2o': fold(),

  // Offsuit Queens
  'QJo': raise(), 'QTo': mixed(0.75), 'Q9o': mixed(0.5),
  'Q8o': fold(), 'Q7o': fold(), 'Q6o': fold(), 'Q5o': fold(),
  'Q4o': fold(), 'Q3o': fold(), 'Q2o': fold(),

  // Offsuit Jacks
  'JTo': mixed(0.75), 'J9o': mixed(0.25), 'J8o': fold(), 'J7o': fold(),
  'J6o': fold(), 'J5o': fold(), 'J4o': fold(), 'J3o': fold(), 'J2o': fold(),

  // Offsuit Others
  'T9o': mixed(0.5), 'T8o': fold(), 'T7o': fold(), 'T6o': fold(),
  'T5o': fold(), 'T4o': fold(), 'T3o': fold(), 'T2o': fold(),
  '98o': mixed(0.25), '97o': fold(), '96o': fold(), '95o': fold(),
  '94o': fold(), '93o': fold(), '92o': fold(),
  '87o': fold(), '86o': fold(), '85o': fold(), '84o': fold(),
  '83o': fold(), '82o': fold(),
  '76o': fold(), '75o': fold(), '74o': fold(), '73o': fold(), '72o': fold(),
  '65o': fold(), '64o': fold(), '63o': fold(), '62o': fold(),
  '54o': fold(), '53o': fold(), '52o': fold(),
  '43o': fold(), '42o': fold(),
  '32o': fold(),
};

/**
 * BTN (Button) - Loosest steal position
 * ~45% VPIP
 */
const BTN_RANGE: RangeDefinition = {
  // Pairs - all raise
  'AA': raise(), 'KK': raise(), 'QQ': raise(), 'JJ': raise(), 'TT': raise(),
  '99': raise(), '88': raise(), '77': raise(), '66': raise(), '55': raise(),
  '44': raise(), '33': raise(), '22': raise(),

  // Suited Aces - all raise
  'AKs': raise(), 'AQs': raise(), 'AJs': raise(), 'ATs': raise(), 'A9s': raise(),
  'A8s': raise(), 'A7s': raise(), 'A6s': raise(), 'A5s': raise(),
  'A4s': raise(), 'A3s': raise(), 'A2s': raise(),

  // Suited Kings
  'KQs': raise(), 'KJs': raise(), 'KTs': raise(), 'K9s': raise(),
  'K8s': raise(), 'K7s': raise(), 'K6s': raise(), 'K5s': raise(),
  'K4s': raise(), 'K3s': mixed(0.75), 'K2s': mixed(0.75),

  // Suited Queens
  'QJs': raise(), 'QTs': raise(), 'Q9s': raise(),
  'Q8s': raise(), 'Q7s': raise(), 'Q6s': raise(), 'Q5s': mixed(0.75),
  'Q4s': mixed(0.75), 'Q3s': mixed(0.5), 'Q2s': mixed(0.5),

  // Suited Jacks
  'JTs': raise(), 'J9s': raise(), 'J8s': raise(),
  'J7s': raise(), 'J6s': mixed(0.75), 'J5s': mixed(0.5), 'J4s': mixed(0.5),
  'J3s': mixed(0.25), 'J2s': mixed(0.25),

  // Suited Connectors & Others
  'T9s': raise(), 'T8s': raise(), 'T7s': raise(), 'T6s': mixed(0.75),
  'T5s': mixed(0.5), 'T4s': mixed(0.25), 'T3s': fold(), 'T2s': fold(),
  '98s': raise(), '97s': raise(), '96s': raise(), '95s': mixed(0.5),
  '94s': mixed(0.25), '93s': fold(), '92s': fold(),
  '87s': raise(), '86s': raise(), '85s': mixed(0.75), '84s': mixed(0.5),
  '83s': fold(), '82s': fold(),
  '76s': raise(), '75s': raise(), '74s': mixed(0.5), '73s': mixed(0.25), '72s': fold(),
  '65s': raise(), '64s': raise(), '63s': mixed(0.5), '62s': fold(),
  '54s': raise(), '53s': mixed(0.75), '52s': mixed(0.25),
  '43s': mixed(0.75), '42s': mixed(0.25),
  '32s': mixed(0.5),

  // Offsuit Aces
  'AKo': raise(), 'AQo': raise(), 'AJo': raise(), 'ATo': raise(),
  'A9o': raise(), 'A8o': raise(), 'A7o': raise(), 'A6o': raise(),
  'A5o': raise(), 'A4o': raise(), 'A3o': raise(), 'A2o': raise(),

  // Offsuit Kings
  'KQo': raise(), 'KJo': raise(), 'KTo': raise(),
  'K9o': raise(), 'K8o': raise(), 'K7o': mixed(0.75), 'K6o': mixed(0.75),
  'K5o': mixed(0.5), 'K4o': mixed(0.5), 'K3o': mixed(0.25), 'K2o': mixed(0.25),

  // Offsuit Queens
  'QJo': raise(), 'QTo': raise(), 'Q9o': raise(),
  'Q8o': mixed(0.75), 'Q7o': mixed(0.5), 'Q6o': mixed(0.25), 'Q5o': fold(),
  'Q4o': fold(), 'Q3o': fold(), 'Q2o': fold(),

  // Offsuit Jacks
  'JTo': raise(), 'J9o': raise(), 'J8o': mixed(0.75), 'J7o': mixed(0.5),
  'J6o': fold(), 'J5o': fold(), 'J4o': fold(), 'J3o': fold(), 'J2o': fold(),

  // Offsuit Others
  'T9o': raise(), 'T8o': mixed(0.75), 'T7o': mixed(0.25), 'T6o': fold(),
  'T5o': fold(), 'T4o': fold(), 'T3o': fold(), 'T2o': fold(),
  '98o': mixed(0.75), '97o': mixed(0.5), '96o': fold(), '95o': fold(),
  '94o': fold(), '93o': fold(), '92o': fold(),
  '87o': mixed(0.75), '86o': mixed(0.25), '85o': fold(), '84o': fold(),
  '83o': fold(), '82o': fold(),
  '76o': mixed(0.5), '75o': fold(), '74o': fold(), '73o': fold(), '72o': fold(),
  '65o': mixed(0.5), '64o': fold(), '63o': fold(), '62o': fold(),
  '54o': mixed(0.25), '53o': fold(), '52o': fold(),
  '43o': fold(), '42o': fold(),
  '32o': fold(),
};

/**
 * SB (Small Blind) - Raise or fold vs BB
 * ~40% VPIP (RFI when folded to)
 */
const SB_RANGE: RangeDefinition = {
  // Pairs - mostly raise
  'AA': raise(), 'KK': raise(), 'QQ': raise(), 'JJ': raise(), 'TT': raise(),
  '99': raise(), '88': raise(), '77': raise(), '66': raise(), '55': raise(),
  '44': raise(), '33': mixed(0.75), '22': mixed(0.75),

  // Suited Aces
  'AKs': raise(), 'AQs': raise(), 'AJs': raise(), 'ATs': raise(), 'A9s': raise(),
  'A8s': raise(), 'A7s': raise(), 'A6s': raise(), 'A5s': raise(),
  'A4s': raise(), 'A3s': raise(), 'A2s': raise(),

  // Suited Kings
  'KQs': raise(), 'KJs': raise(), 'KTs': raise(), 'K9s': raise(),
  'K8s': raise(), 'K7s': raise(), 'K6s': raise(), 'K5s': raise(),
  'K4s': raise(), 'K3s': mixed(0.75), 'K2s': mixed(0.75),

  // Suited Queens
  'QJs': raise(), 'QTs': raise(), 'Q9s': raise(),
  'Q8s': raise(), 'Q7s': raise(), 'Q6s': mixed(0.75), 'Q5s': mixed(0.75),
  'Q4s': mixed(0.5), 'Q3s': mixed(0.5), 'Q2s': mixed(0.25),

  // Suited Jacks
  'JTs': raise(), 'J9s': raise(), 'J8s': raise(),
  'J7s': mixed(0.75), 'J6s': mixed(0.5), 'J5s': mixed(0.5), 'J4s': mixed(0.25),
  'J3s': fold(), 'J2s': fold(),

  // Suited Connectors & Others
  'T9s': raise(), 'T8s': raise(), 'T7s': mixed(0.75), 'T6s': mixed(0.5),
  'T5s': mixed(0.25), 'T4s': fold(), 'T3s': fold(), 'T2s': fold(),
  '98s': raise(), '97s': raise(), '96s': mixed(0.75), '95s': mixed(0.25),
  '94s': fold(), '93s': fold(), '92s': fold(),
  '87s': raise(), '86s': raise(), '85s': mixed(0.5), '84s': mixed(0.25),
  '83s': fold(), '82s': fold(),
  '76s': raise(), '75s': mixed(0.75), '74s': mixed(0.25), '73s': fold(), '72s': fold(),
  '65s': raise(), '64s': mixed(0.75), '63s': mixed(0.25), '62s': fold(),
  '54s': raise(), '53s': mixed(0.5), '52s': fold(),
  '43s': mixed(0.5), '42s': fold(),
  '32s': mixed(0.25),

  // Offsuit Aces
  'AKo': raise(), 'AQo': raise(), 'AJo': raise(), 'ATo': raise(),
  'A9o': raise(), 'A8o': raise(), 'A7o': raise(), 'A6o': raise(),
  'A5o': raise(), 'A4o': raise(), 'A3o': mixed(0.75), 'A2o': mixed(0.75),

  // Offsuit Kings
  'KQo': raise(), 'KJo': raise(), 'KTo': raise(),
  'K9o': raise(), 'K8o': mixed(0.75), 'K7o': mixed(0.75), 'K6o': mixed(0.5),
  'K5o': mixed(0.5), 'K4o': mixed(0.25), 'K3o': mixed(0.25), 'K2o': fold(),

  // Offsuit Queens
  'QJo': raise(), 'QTo': raise(), 'Q9o': mixed(0.75),
  'Q8o': mixed(0.5), 'Q7o': mixed(0.25), 'Q6o': fold(), 'Q5o': fold(),
  'Q4o': fold(), 'Q3o': fold(), 'Q2o': fold(),

  // Offsuit Jacks
  'JTo': raise(), 'J9o': mixed(0.75), 'J8o': mixed(0.5), 'J7o': fold(),
  'J6o': fold(), 'J5o': fold(), 'J4o': fold(), 'J3o': fold(), 'J2o': fold(),

  // Offsuit Others
  'T9o': raise(), 'T8o': mixed(0.5), 'T7o': fold(), 'T6o': fold(),
  'T5o': fold(), 'T4o': fold(), 'T3o': fold(), 'T2o': fold(),
  '98o': mixed(0.75), '97o': mixed(0.25), '96o': fold(), '95o': fold(),
  '94o': fold(), '93o': fold(), '92o': fold(),
  '87o': mixed(0.5), '86o': fold(), '85o': fold(), '84o': fold(),
  '83o': fold(), '82o': fold(),
  '76o': mixed(0.25), '75o': fold(), '74o': fold(), '73o': fold(), '72o': fold(),
  '65o': mixed(0.25), '64o': fold(), '63o': fold(), '62o': fold(),
  '54o': fold(), '53o': fold(), '52o': fold(),
  '43o': fold(), '42o': fold(),
  '32o': fold(),
};

/**
 * BB (Big Blind) - Defense ranges vs various positions
 * Note: BB doesn't "RFI" in the traditional sense since they're already in.
 * This represents BB raise (squeeze) when SB limps or folds and action is on BB.
 * For simplicity, showing a "BB vs limp" or "BB complete vs SB limp" range.
 *
 * In most trainers, BB is excluded from RFI training since it's a different spot.
 * Here we'll show a simplified "BB raise when checked to" range.
 */
const BB_RANGE: RangeDefinition = {
  // Pairs
  'AA': raise(), 'KK': raise(), 'QQ': raise(), 'JJ': raise(), 'TT': raise(),
  '99': raise(), '88': raise(), '77': raise(), '66': raise(), '55': raise(),
  '44': raise(), '33': raise(), '22': raise(),

  // Suited Aces
  'AKs': raise(), 'AQs': raise(), 'AJs': raise(), 'ATs': raise(), 'A9s': raise(),
  'A8s': raise(), 'A7s': raise(), 'A6s': raise(), 'A5s': raise(),
  'A4s': raise(), 'A3s': raise(), 'A2s': raise(),

  // Suited Kings
  'KQs': raise(), 'KJs': raise(), 'KTs': raise(), 'K9s': raise(),
  'K8s': raise(), 'K7s': raise(), 'K6s': raise(), 'K5s': raise(),
  'K4s': raise(), 'K3s': raise(), 'K2s': raise(),

  // Suited Queens
  'QJs': raise(), 'QTs': raise(), 'Q9s': raise(),
  'Q8s': raise(), 'Q7s': raise(), 'Q6s': raise(), 'Q5s': raise(),
  'Q4s': raise(), 'Q3s': raise(), 'Q2s': raise(),

  // Suited Jacks
  'JTs': raise(), 'J9s': raise(), 'J8s': raise(),
  'J7s': raise(), 'J6s': raise(), 'J5s': raise(), 'J4s': raise(),
  'J3s': mixed(0.75), 'J2s': mixed(0.75),

  // Suited Connectors & Others
  'T9s': raise(), 'T8s': raise(), 'T7s': raise(), 'T6s': raise(),
  'T5s': raise(), 'T4s': mixed(0.75), 'T3s': mixed(0.5), 'T2s': mixed(0.5),
  '98s': raise(), '97s': raise(), '96s': raise(), '95s': raise(),
  '94s': mixed(0.75), '93s': mixed(0.5), '92s': mixed(0.25),
  '87s': raise(), '86s': raise(), '85s': raise(), '84s': mixed(0.75),
  '83s': mixed(0.5), '82s': mixed(0.25),
  '76s': raise(), '75s': raise(), '74s': mixed(0.75), '73s': mixed(0.5), '72s': mixed(0.25),
  '65s': raise(), '64s': raise(), '63s': mixed(0.75), '62s': mixed(0.5),
  '54s': raise(), '53s': raise(), '52s': mixed(0.5),
  '43s': raise(), '42s': mixed(0.5),
  '32s': mixed(0.75),

  // Offsuit Aces
  'AKo': raise(), 'AQo': raise(), 'AJo': raise(), 'ATo': raise(),
  'A9o': raise(), 'A8o': raise(), 'A7o': raise(), 'A6o': raise(),
  'A5o': raise(), 'A4o': raise(), 'A3o': raise(), 'A2o': raise(),

  // Offsuit Kings
  'KQo': raise(), 'KJo': raise(), 'KTo': raise(),
  'K9o': raise(), 'K8o': raise(), 'K7o': raise(), 'K6o': raise(),
  'K5o': raise(), 'K4o': mixed(0.75), 'K3o': mixed(0.75), 'K2o': mixed(0.5),

  // Offsuit Queens
  'QJo': raise(), 'QTo': raise(), 'Q9o': raise(),
  'Q8o': raise(), 'Q7o': mixed(0.75), 'Q6o': mixed(0.75), 'Q5o': mixed(0.5),
  'Q4o': mixed(0.5), 'Q3o': mixed(0.25), 'Q2o': mixed(0.25),

  // Offsuit Jacks
  'JTo': raise(), 'J9o': raise(), 'J8o': mixed(0.75), 'J7o': mixed(0.75),
  'J6o': mixed(0.5), 'J5o': mixed(0.25), 'J4o': mixed(0.25), 'J3o': fold(), 'J2o': fold(),

  // Offsuit Others
  'T9o': raise(), 'T8o': raise(), 'T7o': mixed(0.75), 'T6o': mixed(0.5),
  'T5o': mixed(0.25), 'T4o': fold(), 'T3o': fold(), 'T2o': fold(),
  '98o': raise(), '97o': mixed(0.75), '96o': mixed(0.5), '95o': mixed(0.25),
  '94o': fold(), '93o': fold(), '92o': fold(),
  '87o': raise(), '86o': mixed(0.75), '85o': mixed(0.5), '84o': mixed(0.25),
  '83o': fold(), '82o': fold(),
  '76o': mixed(0.75), '75o': mixed(0.5), '74o': mixed(0.25), '73o': fold(), '72o': fold(),
  '65o': mixed(0.75), '64o': mixed(0.5), '63o': fold(), '62o': fold(),
  '54o': mixed(0.5), '53o': mixed(0.25), '52o': fold(),
  '43o': mixed(0.25), '42o': fold(),
  '32o': fold(),
};

// Export all ranges mapped by position
export const GTO_RANGES: Record<Position, RangeDefinition> = {
  'UTG': UTG_RANGE,
  'HJ': HJ_RANGE,
  'CO': CO_RANGE,
  'BTN': BTN_RANGE,
  'SB': SB_RANGE,
  'BB': BB_RANGE,
};

/**
 * Get the GTO range for a specific position
 */
export function getGTORange(position: Position): RangeData {
  return {
    position,
    hands: GTO_RANGES[position],
  };
}
