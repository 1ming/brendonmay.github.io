// flame data copied from main.js for now

// probability for how many lines are "drawn" in total
// for flame advantaged items, the number of lines is always 4
const non_advantaged = { 1: 0.40, 2: 0.40, 3: 0.15, 4: 0.05 };

// probability computations for non-flame advantaged items
// doing this here so the recursive function doesn't have to compute
// the "chance to draw one more line" and instead just directly references
// an entry in p_another_line

// probability to get *at least* this many lines (aka probability to have drawn line X)
// computed from probability to get a specific number of lines in *total*
// P(X) = probability to draw exactly X lines in total
// P(>=X) = probability to draw at least X lines
// then P(>=3) = P(3) + P(4)
// Note: i just manually computed this from non_advantaged and put the result here
const p_line = { 1: 1.0, 2: 0.6, 3: 0.2, 4: 0.05 };

// probability to draw X lines (or more) if you already drew X-1 lines
// "chance to draw one more line"
// P(>=X | >=(X-1)) = P(>=X) / P(>=(X-1))
// P(>=3 | >=(2)) = P(>=3) / P(>=2)
const p_another_line = { 1: 1.0, 2: 0.6, 3: p_line[3] / p_line[2], 4: p_line[4] / p_line[3] };


const MAX_NUM_LINES = 4;

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
var stat_equivalences = { "all_stat": 10, "secondary_stat": 0.083333, "attack": 3, "dmg": 15 };

// for xenon
// var stat_equivalences = { "all_stat": 25, "attack": 6, "dmg": 15 };

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

// coincidentally, both weapons and armour have 19 possible line types
// use this value to compute how many lumped junk lines there are for probability calculations
// Note: despite weapons having two extra lines (Dmg % and Boss Dmg %), they cannot
// get Jump or Speed (which we lump into Junk below)
// referenced from: https://strategywiki.org/wiki/MapleStory/Bonus_Stats
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
  DMG: "Damage %",  // weapons only
  BOSS_DMG: "Boss Damage %",  // weapons only
  JUNK: "Junk",
};

const COMBO_LINES = [
  LINETYPE.COMBO_MAIN_SECOND,
  LINETYPE.COMBO_MAIN_JUNK,
  LINETYPE.COMBO_SECOND_JUNK,
  LINETYPE.COMBO_XENON_DOUBLE,
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
  [LINETYPE.DMG]: (value) => value * stat_equivalences.dmg,
  [LINETYPE.BOSS_DMG]: (value) => value * stat_equivalences.dmg,
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
    [LINETYPE.ALLSTAT]: 1, [LINETYPE.ATTACK]: 1,
  },
  [CLASS_TYPE.TEST]: {
    [LINETYPE.ATTACK]: 1, [LINETYPE.COMBO_MAIN_JUNK]: 3, [LINETYPE.MAIN_STAT]: 1,
  }
};

// these are only found on weapons but apply to all classes
const WEAPON_ONLY_LINES = {
  [LINETYPE.DMG]: 1,
  [LINETYPE.BOSS_DMG]: 1,
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

function line_counter(line, count) {
  return {
    line: line,
    count: count,
  };
}

function get_num_lines(pool) {
  const num_lines = pool.reduce((acc, item) => acc + item.count, 0);
  return num_lines;
}



// get the max potential flame score that can be achieved
// by the first n lines from the pool
// assume pool is already ordered from highest to lowest flame score
// Note: this is only meant to be used to filter out branches that lead nowhere
// and reduce the number of iterations for the recursive function
function get_max_potential_score(pool, n) {
  let score = 0;
  let lines_used = 0;

  for (let item of pool) {
    for (let i = 0; i < item.count; i++) {
      if (lines_used === n) {
        return score;
      }
      score += item.line.f_max;
      lines_used++;
    }
  }

  return score;
}

// calculate the probability that the target will be met
// pool: list of valid lines that have not yet been drawn
// Note: this function preserves the order of lines in the pool
// and assumes that they are in order from highest to lowest max flame score potential
// when passed in
// This enables us to use get_max_potential_score() without re-sorting it each time
function get_p_recursive(line, target, is_adv, pool, num_junk, num_drawn, debug_data, parents) {
  debug_data.count++;
  const num_remaining_items = get_num_lines(pool) + num_junk;
  let p = 0;

  // find possible branches
  // generate list of adjusted targets and their corresponding probabilities
  // after applying the flame score gained from a certain tier of this line
  // null/junk lines do not have different tiers so there will only be 
  // 1 branch with a probability of 100%
  const new_targets = [];  // list of "tuples" (new_target_value, probability, tier)
  if (line == null) {
    new_targets.push([target, 1, "null"]);
  }
  else if (line.name === LINETYPE.JUNK) {
    new_targets.push([target, 1, "[Junk]"]);
  }
  else {
    for (const tier in line.tiers) {
      const p_tier = line.tiers[tier].p;
      const score_tier = line.tiers[tier].score;
      const line_label = `1/${num_remaining_items},${line.name}${line.id > 0 ? line.id : ""},${tier},p=${p_tier},s=${score_tier}`;

      if (score_tier >= target) {
        p += p_tier;
        // debug_data.lines_picked.push(line.name + " (finished), " + tier + ", " + score_tier + "/" + target);
        debug_data.paths.push(parents.concat(line_label));
        debug_data.success++;
      }
      else {
        // debug_data.lines_picked.push(line.name + " (partial), " + tier + ", " + score_tier + "/" + target);
        new_targets.push([target - score_tier, p_tier, line_label]);
      }
    }
  }

  // base case: reached the maximum number of lines that can be drawn
  if (num_drawn === MAX_NUM_LINES) {
    return p;
  }

  // probability to draw one more line
  // flame advantaged items always draw the maximum number of lines
  const p_line_num = is_adv ? 1.0 : p_another_line[num_drawn + 1];

  // for each different possible target, prune the pool in case some lines
  // become junk (no possible way to sum up to target)
  for (const branch of new_targets) {
    const new_target = branch[0];
    const p_target = branch[1];
    const line_label = branch[2];

    const new_parents = line == null ? parents.slice(0) : parents.concat(line_label);

    // don't pursue this branch if it's not possible to achieve the target
    // even if the highest flame score items were drawn from the pool
    const max_score = get_max_potential_score(pool, MAX_NUM_LINES - num_drawn);
    if (new_target > max_score) {
      continue;
    }

    // recurse on all successor lines in pool
    // for each successor, decrement its count from the pool when recursing on it
    // to indicate that it was "selected"
    for (const selection of pool) {
      const new_pool = [];
      const new_count = selection.count - 1;

      // add the other items to the pool
      for (const other_line of pool) {
        if (other_line.line !== selection.line) {
          new_pool.push(line_counter(other_line.line, other_line.count));
        }
        else if (new_count > 0) {
          // only add the selected item to the pool if there are any left
          new_pool.push(line_counter(selection.line, new_count));
        }
      }

      p += p_target * (selection.count / num_remaining_items) * p_line_num * get_p_recursive(
        selection.line, new_target, is_adv, new_pool, num_junk, num_drawn + 1, debug_data, new_parents);
    }

    // recurse on all junk lines (lumped)
    if (num_junk > 0) {
      p += p_target * (num_junk / num_remaining_items) * p_line_num * get_p_recursive(
        null, new_target, is_adv, pool, num_junk - 1, num_drawn + 1, debug_data, new_parents);
    }
  }

  return p;

}

// TODO ming: decide how to organize this later
// calculate the flame value (not flame score) of a tier based on line type and level
// this is the flame number we see on the item directly (e.g. +30 STR, +5% All Stat, +4 Weapon Attack, etc)
function get_tier_value(line_type, tier, level, is_adv, base_att) {
  // attack flames are different for weapons vs armour
  if (line_type === LINETYPE.ATTACK) {
    if (base_att != null) {
      // weapons only: depends on flame adv and base att value
      const perc_per_tier = is_adv ? watt_per_tier_adv : watt_per_tier_non_adv;
      for (const level_range_str in perc_per_tier) {
        if (is_in_level_range(level_range_str, level)) {
          return base_att * perc_per_tier[level_range_str][tier];
        }
      }
    }
    else {
      // armour
      return tier;
    }
  }
  else if (line_type === LINETYPE.ALLSTAT || line_type === LINETYPE.DMG) {
    // 1% all stat per tier, 1% dmg per tier
    return tier;
  }
  else if (line_type === LINETYPE.BOSS_DMG) {
    // 2% boss dmg per tier
    return tier * 2;
  }
  else {
    // stat and combo lines
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
function getLineData(line_type, level, is_adv, flame_type, class_type, base_att) {
  const line = {
    name: line_type,
    f_max: 0,
    tiers: {},
    tier_ids: []  // to be used as ordered list of keys for accessing specific tier info
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

    line.tier_ids.push(tier);
    const tier_value = get_tier_value(line_type, tier, level, is_adv, base_att);
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


// debug paths
function debug_paths(paths) {
  const results = {};

  for (const path of paths) {
    let new_path = Object.assign([], path);
    new_path.sort();
    const path_string = new_path.join(" - ");

    if (!(path_string in results)) {
      results[path_string] = 0;
    }
    results[path_string]++;
  }

  return results;
}

// debug get unique combinations of linetype and tiers that satisfy
// the target flame score
// this is just to make it easier to compare results to the live website
function debug_unique_combos(paths) {
  const unique_combos = {};

  const pattern = ".+?,(?<linetype>.+?),(?<tier>\\d),.+?,s=(?<score>.+)";

  // use a string of all the linetypes and tiers as the "key" for this combo
  // format: [total score] type1:tier, type2:tier, ...
  for (const path of paths) {
    let total_score = 0;
    let items = [];
    for (const line of path) {
      const result = line.match(pattern);
      const { linetype, tier, score } = result.groups;

      total_score += parseFloat(score);
      items.push(`${linetype}:${tier}`);
    }
    items.sort();
    let s = `[${total_score.toString()}] ` + items.join(", ");

    if (!(s in unique_combos)) {
      unique_combos[s] = 1;
    }
    else {
      unique_combos[s]++;
    }

  }

  return unique_combos;
}



// calculate the probability of obtaining a target flame score
function getProbability(class_type, level, flame_type, is_adv, target, base_att) {
  // generate pool of valid line objects containing attributes such as:
  // tiers, values, probabilities which are based on flame type used and level
  const valid_lines = [];
  for (const key in CLASS_LINES[class_type]) {
    valid_lines.push(line_counter(getLineData(key, level, is_adv, flame_type, class_type, base_att), CLASS_LINES[class_type][key]));
  }

  // also add weapon exclusive lines if the item is a weapon
  if (base_att != null) {
    for (const key in WEAPON_ONLY_LINES) {
      valid_lines.push(line_counter(getLineData(key, level, is_adv, flame_type, class_type, base_att), WEAPON_ONLY_LINES[key]));
    }
  }

  // sort lines in decreasing order of f_max (maximum possible flame score)
  // this is used to make pruning the probability tree easier
  valid_lines.sort((a, b) => (b.line.f_max - a.line.f_max));

  // compute the probability of obtaining the target flame score
  // ming: sums up across all successful paths of the "probability tree" (not sure about the term)
  let debug_data = {
    count: 0,
    success: 0,
    lines_picked: [],
    paths: [],
    sets: {},
  };
  const result = get_p_recursive(null, target, is_adv, valid_lines, NUM_LINE_TYPES - get_num_lines(valid_lines), 0, debug_data, []);
  const num_flames = 1 / result;
  const stats = geoDistrQuantile(result);
  const paths = debug_paths(debug_data.paths);
  const unique_combos = debug_unique_combos(debug_data.paths);

  console.log(`Method 1: p=${result}, flames=${num_flames}, unique combos=${Object.keys(unique_combos).length}, iterations=${debug_data.count}`);

  return result;
}

// for testing
const class_type = CLASS_TYPE.NORMAL;
const level = 160;
// const flame_type = "eternal";
const flame_type = "powerful";
const is_adv = true;
// const target = 146  // first score that requires 4 specific lines to be drawn
// const target = 165  // first time where method 1 and 2 diverge (i think method 1 is wrong here?)

const target = 175;
const base_att = null;

// const target = 500;
// const base_att = 149;


getProbability(class_type, level, flame_type, is_adv, target, base_att);