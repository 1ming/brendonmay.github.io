// flame data copied from main.js for now

// probability for how many lines are "drawn" in total
// for flame advantaged items, the number of lines is always 4
const non_advantaged = { 1: 0.40, 2: 0.40, 3: 0.15, 4: 0.05 };

// for non-flame advantaged items, each tier is reduced by 2 (e.g. tier 3 becomes tier 1)
const TIER_PROBABILITIES = {
  drop: { 3: 0.25, 4: 0.3, 5: 0.3, 6: 0.14, 7: 0.01 },
  powerful: { 3: 0.2, 4: 0.3, 5: 0.36, 6: 0.14, 7: 0 },
  eternal: { 3: 0, 4: 0.29, 5: 0.45, 6: 0.25, 7: 0.01 },
  fusion: { 3: 0.5, 4: 0.4, 5: 0.1, 6: 0, 7: 0 },
  masterFusion: { 3: 0.25, 4: 0.35, 5: 0.3, 6: 0.1, 7: 0 },
  meisterFusion: { 3: 0, 4: 0.4, 5: 0.45, 6: 0.14, 7: 0.01 },
};

// these values will get altered by user input on the website
var stat_equivalences = { "all_stat": 12, "secondary_stat": 0.066667, "attack": 3, "dmg": 15 };

var stat_per_tier = {
  "120-139": 7,
  "140-159": 8,
  "160-179": 9,
  "180-199": 10,
  "200-229": 11,
  "230-249": 12,
  "250+": 12,
};

// these are for weapons only
var watt_per_tier_adv = { //as a percentage of base
  "160-199": { 3: 0.15, 4: 0.22, 5: 0.3025, 6: 0.3993, 7: 0.512435 },
  "200+": { 3: 0.18, 4: 0.264, 5: 0.363, 6: 0.47916, 7: 0.614922 }
};

var watt_per_tier_non_adv = { //as a percentage of base
  "160-199": { 1: 0.05, 2: 0.11, 3: 0.185, 4: 0.2662, 5: 0.366025, 6: 0.43923, 7: 0.512435 },
  "200+": { 1: 0.06, 2: 0.132, 3: 0.2178, 4: 0.31944, 5: 0.43923, 6: 0.527076, 7: 0.614922 }
};

// for armour: weapon or magic attack is 1:1 the tier value regardless of level

let combo_stat_per_tier = {
  "120-139": 4,
  "140-159": 4,
  "160-179": 5,
  "180-199": 5,
  "200-229": 6,
  "230-249": 6,
  "250+": 7,
};

let hp_stat_per_tier = {
  "120-129": 360,
  "130-139": 390,
  "140-149": 420,
  "150-159": 450,
  "160-169": 480,
  "170-179": 510,
  "180-189": 540,
  "190-199": 570,
  "200-209": 600,
  "210-219": 620,
  "220-229": 640,
  "230-239": 660,
  "240-249": 680,
  "250+": 700,
};

function geoDistrQuantile(p) {
  var mean = 1 / p;

  var median = Math.log(1 - 0.5) / Math.log(1 - p);
  var seventy_fifth = Math.log(1 - 0.75) / Math.log(1 - p);
  var eighty_fifth = Math.log(1 - 0.85) / Math.log(1 - p);
  var nintey_fifth = Math.log(1 - 0.95) / Math.log(1 - p);

  return { mean: mean, median: median, seventy_fifth: seventy_fifth, eighty_fifth: eighty_fifth, nintey_fifth: nintey_fifth };
}


const NUM_LINE_TYPES = 19;

// categorize lines based on how they will affect flame score calculations
// for example, most classes will have:
// 1x Main, 1x Secondary, 1x Main/Second, 2x Main/Junk, 2x Second/Junk
const LINETYPE = {
  MAIN_STAT: "Main Stat",
  SECONDARY_STAT: "Secondary Stat",
  COMBO_MAIN_SECOND: "Combo Main/Second",
  COMBO_MAIN_JUNK: "Combo Main/Junk",
  COMBO_SECOND_JUNK: "Combo Second/Junk",
  ALLSTAT: "All Stat %",
  COMBO_XENON_DOUBLE: "Xenon Main/Main",
  ATTACK: "Attack",
};

const COMBO_LINES = [
  LINETYPE.COMBO_MAIN_SECOND,
  LINETYPE.COMBO_MAIN_JUNK,
  LINETYPE.COMBO_SECOND_JUNK,
];

// map a function to calculate flame score for each line type
const FLAME_SCORE = {
  [LINETYPE.MAIN_STAT]: (value) => value,
  [LINETYPE.SECONDARY_STAT]: (value) => stat_equivalences.secondary_stat * value,
  [LINETYPE.COMBO_MAIN_SECOND]: (value) => value + stat_equivalences.secondary_stat * value,
  [LINETYPE.COMBO_MAIN_JUNK]: (value) => value,
  [LINETYPE.COMBO_XENON_DOUBLE]: (value) => 2 * value,
  [LINETYPE.COMBO_SECOND_JUNK]: (value) => stat_equivalences.secondary_stat * value,
  [LINETYPE.ALLSTAT]: (value) => value * stat_equivalences.all_stat,
  [LINETYPE.ATTACK]: (value) => value * stat_equivalences.attack,
};

const CLASS_TYPE = {
  NORMAL: "Normal",
  XENON: "Xenon",
  TEST: "Test",
};

// the quantity of each line type that contributes to the flame score for a class
// used to generate the pool of valid (non-junk) lines
const CLASS_LINES = {
  [CLASS_TYPE.NORMAL]: {
    [LINETYPE.MAIN_STAT]: 1, [LINETYPE.SECONDARY_STAT]: 1, [LINETYPE.COMBO_MAIN_SECOND]: 1,
    [LINETYPE.COMBO_MAIN_JUNK]: 2, [LINETYPE.COMBO_SECOND_JUNK]: 2, [LINETYPE.ALLSTAT]: 1, [LINETYPE.ATTACK]: 1,
  },
  [CLASS_TYPE.XENON]: {
    [LINETYPE.MAIN_STAT]: 3, [LINETYPE.COMBO_XENON_DOUBLE]: 3, [LINETYPE.COMBO_MAIN_JUNK]: 3,
    [LINETYPE.XENON_ALLSTAT]: 1, [LINETYPE.ATTACK]: 1,
  },
  [CLASS_TYPE.TEST]: {
    [LINETYPE.MAIN_STAT]: 1, [LINETYPE.ATTACK]: 1,
  }
};


// check if a level number is within a level range string
// data for value per tier has a level range string as key (e.g. "140-149")
function is_in_level_range(level_range_str, level_num) {
  if (level_range_str.endsWith("+")) {
    return level_num >= Number(level_range_str.replace("+", ""));
  }

  const level_ranges = level_range_str.split("-");
  const low = Number(level_ranges[0]);
  const high = Number(level_ranges[1]);
  return level_num >= low && level_num <= high;
}

// remove a line from the pool by index
function removed_from_pool(pool, index) {
  const new_pool = [];
  for (const item in pool) {
    if (item !== index) {
      new_pool.push(pool[item]);
    }
  }
  return new_pool;
}

// update pool such that lines that cannot possibly lead to success are removed
// note: lines in the pool are ordered by f_max, descending
// where f_max = the maximum possible flame score for a line to get (using its highest tier)
// n = number of remaining draws
function prune_pool(current_pool, target, num_draws) {
  // first, check if the best combination of lines could even meet the target
  // if not, remove all items from the pool to end this path early
  const max_score = current_pool.slice(0, num_draws).reduce((acc, item) => acc + item.f_max, 0);
  if (max_score < target) {
    return [];
  }

  const new_pool = current_pool.slice(0, num_draws - 1);  // first n - 1 items
  const f0 = new_pool.reduce((acc, item) => acc + item.f_max, 0);
  const remaining_pool = current_pool.slice(num_draws - 1);
  for (const line of remaining_pool) {
    if ((f0 + line.f_max) >= target) {
      // only add things to the pool that potentially lead to a successful path
      new_pool.push(line);
    }
    else {
      // any lines after this one will also be too low
      break;
    }
  }

  return new_pool;

}


// calculate the probability that the target will be met within num_draws total lines
// num_draws: total number of lines we can "draw"/pick out of the pool, once
// pool: list of valid lines that have not yet been drawn
function get_p_recursive(line, target, pool, num_junk, num_draws, debug_data, parents) {
  debug_data.count++;
  const num_remaining_items = pool.length + num_junk;
  let p = 0;

  const new_parents = parents.slice(0)

  // find possible branches
  // generate list of adjusted targets and their corresponding probabilities
  // after applying the flame score gained from a certain tier of this line
  // null/junk lines do not have different tiers so there will only be 
  // 1 branch with a probability of 100%
  const new_targets = [];  // list of "tuples" (new_target_value, probability, tier)
  if (line == null) {
    new_targets.push([target, 1, null]);
  }
  else {
    for (const tier in line.tiers) {
      const p_tier = line.tiers[tier].p;
      const score_tier = line.tiers[tier].score;
      if (score_tier >= target) {
        p += p_tier;
        debug_data.lines_picked.push(line.name + " (finished), " + tier + ", " + score_tier + "/" + target);
        debug_data.paths.push(new_parents.concat(`${line.name}, ${tier}`));
        debug_data.success++;
      }
      else {
        // debug_data.lines_picked.push(line.name + " (partial), " + tier + ", " + score_tier + "/" + target);
        new_targets.push([target - score_tier, p_tier, tier]);
      }
    }
  }

  // if there's no more draws after this, just return the probability of succeeding based
  // on this line
  if (num_draws === 0 || pool.length === 0) {
    return p;
  }

  // for each different possible target, prune the pool in case some lines
  // become junk (no possible way to sum up to target)
  for (const branch of new_targets) {
    const new_target = branch[0];
    const p_target = branch[1];
    const tier = branch[2];
    const line_label = `${line != null ? line.name : "null"}, ${tier}`

    const new_pool = prune_pool(pool, new_target, num_draws);

    if (new_pool.length === 0) {
      // no combination of subsequent draws could result in success for this target
      continue;
    }

    // any pruned lines become junk
    num_junk += pool.length - new_pool.length;

    // recurse on all successor lines in pool
    for (let i = 0; i < new_pool.length; i++) {
      p += p_target * (1 / num_remaining_items) * get_p_recursive(
        new_pool[i], new_target, new_pool.toSpliced(i, 1), num_junk, num_draws - 1, debug_data, new_parents.concat(line_label));
    }

    // recurse on all junk lines (lumped)
    if (num_junk > 0) {
      p += p_target * (num_junk / num_remaining_items) * get_p_recursive(
        null, new_target, new_pool, num_junk - 1, num_draws - 1, debug_data, new_parents.concat(line_label));
    }
  }

  return p;

}

// TODO ming: decide how to organize this later
// calculate the flame value (not flame score) of a tier based on line type and level // this is the flame number we see on the item directly (e.g. +30 STR, +5% All Stat, +4 Weapon Attack, etc)
function get_tier_value(line_type, tier, level, is_adv, base_att) {
  if (base_att != null) {
    // weapon flame changes based on flame advantage and base attack
    const perc_per_tier = is_adv ? watt_per_tier_adv : watt_per_tier_non_adv;
    for (const level_range_str in perc_per_tier) {
      if (is_in_level_range(level_range_str, level)) {
        return base_att * perc_per_tier[level_range_str][tier];
      }
    }
  }
  else if (line_type === LINETYPE.ALLSTAT || line_type === LINETYPE.ATTACK) {
    // 1% all stat per tier, 1 att per tier for non-weapons
    return tier;
  }
  else {
    const stat_tier_dict = COMBO_LINES.includes(line_type) ? combo_stat_per_tier : stat_per_tier;
    for (const level_range_str in stat_tier_dict) {
      if (is_in_level_range(level_range_str, level)) {
        return tier * stat_tier_dict[level_range_str];
      }
    }
  }
}

// get the probability, value, and flame score of each tier for this particular line type
// return format: {name: line type, tiers: {tier_id: <data>, ...}}
// where each data item object is {p: probability, value: flame value, score: flame score}
// flame value: the number shown on the equip
// flame score: the flame score calculated using the value based on line type, class type, etc
function getLineData(line_type, level, is_adv, flame_type, class_type) {
  const line = {
    name: line_type,
    f_max: 0,
    tiers: {},
  };

  // get the active tiers and corresponding probability based on the type of flame used
  // for each tier, determine what the value is based on the line type and the character level
  // also calculate the flame score based on class type
  for (const key in TIER_PROBABILITIES[flame_type]) {
    // all tiers are reduced by 2 for non-flame advantaged items
    const tier = is_adv ? key : key - 2;
    const p_tier = TIER_PROBABILITIES[flame_type][key];
    if (p_tier === 0) {
      // don't include tiers that have no chance of appearing
      continue;
    }

    const tier_value = get_tier_value(line_type, tier, level, is_adv, null);
    line.tiers[tier] = {
      p: p_tier,
      value: tier_value,
      score: FLAME_SCORE[line_type](tier_value)
    };

    // update the maximum possible flame score we can get from this line (highest tier)
    if (line.tiers[tier].score > line.f_max) {
      line.f_max = line.tiers[tier].score;
    }
  }

  return line;
}

// calculate the probability of obtaining a target flame score
function getProbability(class_type, level, flame_type, is_adv) {
  // generate pool of valid line objects containing attributes such as:
  // tiers, values, probabilities which are based on flame type used and level
  const valid_lines = [];
  for (const key in CLASS_LINES[class_type]) {
    for (let i = 0; i < CLASS_LINES[class_type][key]; i++) {
      valid_lines.push(getLineData(key, level, is_adv, flame_type, class_type));
    }
  }

  // sort lines in decreasing order of f_max (maximum possible flame score)
  // this is used to make pruning the probability tree easier
  valid_lines.sort((a, b) => (b.f_max - a.f_max));

  // compute the probability of obtaining the target flame score
  // ming: sums up across all successful paths of the "probability tree" (not sure about the term)
  let debug_data = {
    count: 0,
    success: 0,
    lines_picked: [],
    paths: []
  };
  const result = get_p_recursive(null, 169, valid_lines, NUM_LINE_TYPES - valid_lines.length, 4, debug_data, []);
  const num_flames = 1 / result;
  const stats = geoDistrQuantile(result);

  return result;
}

// for testing
const class_type = CLASS_TYPE.NORMAL;
const level = 150;
const flame_type = "powerful";
const is_adv = true;

getProbability(class_type, level, flame_type, is_adv);
