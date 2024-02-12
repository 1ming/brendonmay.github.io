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
  JUNK: "Junk",
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
    [LINETYPE.ALLSTAT]: 1, [LINETYPE.ATTACK]: 1,
  },
  [CLASS_TYPE.TEST]: {
    [LINETYPE.ATTACK]: 1, [LINETYPE.COMBO_MAIN_JUNK]: 3, [LINETYPE.MAIN_STAT]: 1,
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
      const line_label = `${line.name}${line.id > 0 ? line.id : ""}, ${tier}`;

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
    const line_label = branch[2];

    const new_pool = prune_pool(pool, new_target, num_draws);

    if (new_pool.length === 0) {
      // no combination of subsequent draws could result in success for this target
      continue;
    }

    // any pruned lines become junk
    num_junk += pool.length - new_pool.length;

    const new_parents = line == null ? parents.slice(0) : parents.concat(line_label);

    if (line != null) {
      // debug_data.sets = update_sets(debug_data.sets, new_parents);
    }

    // recurse on all successor lines in pool
    for (let i = 0; i < new_pool.length; i++) {
      p += p_target * (1 / num_remaining_items) * get_p_recursive(
        new_pool[i], new_target, new_pool.toSpliced(i, 1), num_junk, num_draws - 1, debug_data, new_parents);
    }

    // recurse on all junk lines (lumped)
    if (num_junk > 0) {
      p += p_target * (num_junk / num_remaining_items) * get_p_recursive(
        null, new_target, new_pool, num_junk - 1, num_draws - 1, debug_data, new_parents);
    }
  }

  return p;

}

// get line object tier data
function get_tier_data(lineptr, lines_data) {
  const tier_key = lines_data[lineptr.line_type].tier_ids[lineptr.tier_id];
  return Object.assign({}, lines_data[lineptr.line_type].tiers[tier_key]);

}

// get the maximum total score of a set of line pointers that can
// be achieved within the specified number of draws
// expects line_pointers to be sorted from highest to lowest score
function get_max_total_score(line_pointers, num_draws) {
  let max_score = 0;
  let total_draws = num_draws;
  for (const lp of line_pointers) {
    let line_count = 0;

    // some lines can appear multiple times (lp.count)
    while (line_count < lp.count) {
      max_score += lp.score;
      line_count++;
      total_draws--;

      if (total_draws === 0) {
        return max_score;
      }
    }
  }

  return max_score;
}


// find all sets of lines and corresponding tiers whose flame scores sum >= target
// line_pointers: list of lineptr objects which point to a line type, tier and have a count
// where count = number of duplicates of that line remaining in the pool
// the concept is that we have a 2D table of flame score values
// where rows = line type, columns = tier
// the lineptr objects "point" to a cell within a row (each row has only 1 lineptr at a time)
// to avoid having duplicate rows when there are multiple instances of the same line type
// i included a "count" attribute to be used as a multiplier when calculating p
// each level of recursion is the act of "drawing" another line, so max levels is 4
//
// general algorithm:
// initialize all lineptrs to the highest tier cell in their row
// for each row, repeatedly check if the selected cell meets the target
// if so, add it to the output and decrement the pointer (go down 1 tier)
// if not, stop here and add this pointer to the list of "failed" pointers
// if there are still draws remaining, then for each cell in the row whose
// tier <= "failed" pointer, we recurse with updated input:
// - target is reduced by the score of this cell
// - line_pointers list is all the "failed" poitners that came after this one in the list
// - line counts are updated if we are recursing on another line of the same type
// - num_draws is reduced by 1
// when we come back to the caller, it adds itself as the "parent" to each set in the output
//
// to avoid duplicate combinations or unnecessary work:
// - each cell can only recurse on lines that come after it
// - any time we reach the target, we don't create new subproblems from this cell
// - return early if it's not possible to meet the target even with the best scoring cells
function get_sets_recursive(line_pointers, target, num_draws, lines_data, debug_data) {
  debug_data.function++;
  const output = [];

  // first check if this target is reachable at all with the best possible combination
  // sort line pointers by flame score
  line_pointers.sort((a, b) => (b.score - a.score));
  const max_score = get_max_total_score(line_pointers, num_draws);
  if (max_score < target) {
    debug_data.failed++;
    return [];
  }

  // add items that meet target into the output
  // set new line pointers to the highest scoring item that does not meet the target for the next round
  const failed_lps = [];
  for (const lp of line_pointers) {
    // traverse the tiers until we reach a score that is lower than the target
    let new_tier_id = lp.tier_id;
    while (new_tier_id >= 0) {
      const tier_key = lines_data[lp.line_type].tier_ids[new_tier_id]
      const score = lines_data[lp.line_type].tiers[tier_key].score
      if (score >= target) {
        output.push([lineptr(lp.line_type, new_tier_id, score, lp.count)]);
        debug_data.success++;
        new_tier_id--;
      }
      else {
        failed_lps.push(lineptr(lp.line_type, new_tier_id, score, lp.count));
        break;
      }
    }
  }

  // base case: we can't draw any more lines after this so don't recurse
  if (num_draws === 1) {
    return output;
  }

  // recurse on each tier that is <= that of the failed line pointers
  const n = failed_lps.length - 1;
  for (let i = 0; i <= n; i++) {
    const new_lps = [];
    let tier_id = failed_lps[i].tier_id;

    const new_count = failed_lps[i].count - 1;
    if (new_count > 0) {
      // add this entry to the pool again since we still have more of them
      new_lps.push(lineptr(failed_lps[i].line_type, failed_lps[i].tier_id, failed_lps[i].score, new_count));
    }

    // add all line pointers that come after this one
    for (let j = i + 1; j <= n; j++) {
      new_lps.push(Object.assign({}, failed_lps[j]));
    }

    // kick off the next round on each remaining tier of this line
    while (tier_id >= 0) {
      const tier_key = lines_data[failed_lps[i].line_type].tier_ids[tier_id]
      const tier_score = lines_data[failed_lps[i].line_type].tiers[tier_key].score
      const new_output = get_sets_recursive(new_lps, target - tier_score, num_draws - 1, lines_data, debug_data);
      for (const item of new_output) {
        if (failed_lps[i].line_type === item[item.length - 1].line_type) {
          // the previous element was the same line type so mark the count of this one (its parent) as 1
          // to indicate it was "picked" in addition to any of the same remaining lines
          output.push(item.concat(lineptr(failed_lps[i].line_type, tier_id, tier_score, 1)));
        }
        else {
          output.push(item.concat(lineptr(failed_lps[i].line_type, tier_id, tier_score, failed_lps[i].count)));
        }
      }

      tier_id--;
    }
  }
  return output;
}

// generate a line pointer object
// tier_id: used to index into the tier_ids field of a line object
function lineptr(line_type, tier_id, score, count) {
  const l = {
    line_type: line_type,
    tier_id: tier_id,
    score: score,
    count: count,
  };
  return l;
}

// number of ways we can order the same set of items (factorial)
// just doing a static lookup table since we only need to do this from 1 to 4
const NUM_WAYS = {
  1: 1,
  2: 2,
  3: 6,
  4: 24,
};

// get the probability for a certain combination to occur
function get_p_set(line_pointers, lines_data) {
  let p_total = 1;
  let lines_in_pool = NUM_LINE_TYPES;
  const num_lines = line_pointers.length;
  for (const lp of line_pointers) {
    const tier_data = get_tier_data(lp, lines_data);
    p_total = p_total * lp.count * tier_data.p / lines_in_pool;
    lines_in_pool--;
  }
  return p_total * NUM_WAYS[num_lines];
}

// generate all possible sets of lines that could meet the target within a certian number of draws
// and the number of ways they can be formed
function get_valid_combinations(class_type, level, flame_type, is_adv) {
  // compile data about each relevant line. to be used for lookup later.
  // generate initial line pointers for recursive function
  // start at the highest tier_id (will be the highest value)
  const lines_data = {};
  const line_pointers = [];
  for (const key in CLASS_LINES[class_type]) {
    lines_data[key] = getLineData(key, level, is_adv, flame_type, class_type);
    const tier_id = lines_data[key].tier_ids.length - 1;
    const score = lines_data[key].tiers[lines_data[key].tier_ids[tier_id]].score;
    line_pointers.push(lineptr(key, lines_data[key].tier_ids.length - 1, score, CLASS_LINES[class_type][key]));
  }

  let debug_data = {
    function: 0,
    failed: 0,
    success: 0,

  };

  // recursively find all sets of lines/tiers whose scores sum >= target
  const valid_sets = get_sets_recursive(line_pointers, 1, 4, lines_data, debug_data);
  let total_p = 0;
  for (const s of valid_sets) {
    total_p += get_p_set(s, lines_data);
  }
  const num_flames = 1 / total_p;
  const stats = geoDistrQuantile(total_p);

  for (const s of valid_sets) {
  // for (const s of valid_sets.slice(0, 20)) {
    console.table(s);
    const total_score = s.reduce((acc, item) => acc + item.score, 0);
    console.log(`total: ${total_score}`);
    console.log(`p: ${get_p_set(s, lines_data)}`);
  }
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
    paths: [],
    sets: {},
  };
  const result = get_p_recursive(null, 1, valid_lines, NUM_LINE_TYPES - valid_lines.length, 4, debug_data, []);
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
get_valid_combinations(class_type, level, flame_type, is_adv);