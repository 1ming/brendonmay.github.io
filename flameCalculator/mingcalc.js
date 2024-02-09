
// flame data copied from main.js for now

// probability for how many lines are "drawn" in total
// for flame advantaged items, the number of lines is always 4
const non_advantaged = { 1: 0.40, 2: 0.40, 3: 0.15, 4: 0.05 }

// for non-flame advantaged items, each tier is reduced by 2 (e.g. tier 3 becomes tier 1)
const TIER_PROBABILITIES = {
  drop: { 3: 0.25, 4: 0.3, 5: 0.3, 6: 0.14, 7: 0.01 },
  powerful: { 3: 0.2, 4: 0.3, 5: 0.36, 6: 0.14, 7: 0 },
  eternal: { 3: 0, 4: 0.29, 5: 0.45, 6: 0.25, 7: 0.01 },
  fusion: { 3: 0.5, 4: 0.4, 5: 0.1, 6: 0, 7: 0 },
  masterFusion: { 3: 0.25, 4: 0.35, 5: 0.3, 6: 0.1, 7: 0 },
  meisterFusion: { 3: 0, 4: 0.4, 5: 0.45, 6: 0.14, 7: 0.01 },
};

var stat_equivalences = { "all_stat": 12, "secondary_stat": 0.066667, "attack": 3, "dmg": 15 }

var stat_per_tier = {
  "120-139": 7,
  "140-159": 8,
  "160-179": 9,
  "180-199": 10,
  "200-229": 11,
  "230-249": 12,
  "250+": 12,
}

// these are for weapons only
var watt_per_tier_adv = { //as a percentage of base
  "160-199": { 3: 0.15, 4: 0.22, 5: 0.3025, 6: 0.3993, 7: 0.512435 },
  "200+": { 3: 0.18, 4: 0.264, 5: 0.363, 6: 0.47916, 7: 0.614922 }
}

var watt_per_tier_non_adv = { //as a percentage of base
  "160-199": { 1: 0.05, 2: 0.11, 3: 0.185, 4: 0.2662, 5: 0.366025, 6: 0.43923, 7: 0.512435 },
  "200+": { 1: 0.06, 2: 0.132, 3: 0.2178, 4: 0.31944, 5: 0.43923, 6: 0.527076, 7: 0.614922 }
}

// for armour, weapon or magic attack is 1:1 flame score regardless of level

let combo_stat_per_tier = {
  "120-139": 4,
  "140-159": 4,
  "160-179": 5,
  "180-199": 5,
  "200-229": 6,
  "230-249": 6,
  "250+": 7,
}

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
}


const NUM_LINE_TYPES = 19

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
  XENON_STAT: "Xenon Stat",
  XENON_COMBO_2: "Xenon Combo Stat/Stat",
  XENON_COMBO_1: "Xenon Combo Stat/Junk",
  XENON_ALLSTAT: "Xenon All Stat %",
}

const COMBO_LINES = [
  LINETYPE.COMBO_MAIN_SECOND,
  LINETYPE.COMBO_MAIN_JUNK,
  LINETYPE.COMBO_SECOND_JUNK,
  LINETYPE.XENON_COMBO_2,
  LINETYPE.XENON_COMBO_1,
]

// map a function to calculate flame score for each line type
const FLAME_SCORE = {
  [LINETYPE.MAIN_STAT]: (value) => value,
  [LINETYPE.SECONDARY_STAT]: (value) => stat_equivalences.secondary_stat * value,
  [LINETYPE.COMBO_MAIN_SECOND]: (value) => value + stat_equivalences.secondary_stat * value,
  [LINETYPE.COMBO_MAIN_JUNK]: (value) => value,
  [LINETYPE.COMBO_SECOND_JUNK]: (value) => stat_equivalences.secondary_stat * value,
  [LINETYPE.ALLSTAT]: (value) => value * stat_equivalences.all_stat,
  [LINETYPE.XENON_STAT]: (value) => value / 3,
  [LINETYPE.XENON_COMBO_2]: (value) => 2 * value / 3,
  [LINETYPE.XENON_COMBO_1]: (value) => value / 3,
  [LINETYPE.XENON_ALLSTAT]: (value) => value * stat_equivalences.all_stat
}

const CLASS_TYPE = {
  NORMAL: "Normal",
  XENON: "Xenon",
}

// the quantity of each line type that contributes to the flame score for a class
// used to generate the pool of valid (non-junk) lines
const CLASS_LINES = {
  [CLASS_TYPE.NORMAL]: {
    [LINETYPE.MAIN_STAT]: 1, [LINETYPE.SECONDARY_STAT]: 1, [LINETYPE.COMBO_MAIN_SECOND]: 1,
    [LINETYPE.COMBO_MAIN_JUNK]: 2, [LINETYPE.COMBO_SECOND_JUNK]: 2, [LINETYPE.ALLSTAT]: 1
  },
  [CLASS_TYPE.XENON]: {
    [LINETYPE.XENON_STAT]: 3, [LINETYPE.XENON_COMBO_1]: 2, [LINETYPE.XENON_COMBO_2]: 4,
    [LINETYPE.XENON_ALLSTAT]: 1
  }
}


// check if a level number is within a level range string
// data for value per tier has a level range string as key (e.g. "140-149")
function is_in_level_range(level_range_str, level_num) {
  if (level_range_str.endsWith("+")) {
    return level_num >= Number(level_range_str.replace("+", ""))
  }

  const level_ranges = level_range_str.split("-")
  const low = Number(level_ranges[0])
  const high = Number(level_ranges[1])
  return level_num >= low && level_num <= high
}

// remove a line from the pool by key
function update_pool(pool, key){
  const new_pool = []
  for (const item in pool) {
    if (item != key) {
      new_pool.push(pool[item])
    }
  }
  return new_pool
}

// calculate the probability that the target will be met within num_draws total lines
// num_draws: total number of lines we can "draw"/pick out of the pool, once
// pool: list of valid lines that have not yet been drawn
function get_p_recursive(line, target, pool, num_junk, num_draws, debug_data, parents) {
  debug_data.count++
  if (num_draws == 0 || pool.length == 0) {
    return 0
  }

  const num_remaining_items = pool.length + num_junk
  let p = 0

  parents.push(line != null ? line.name : "null")

  if (line != null) {
    for (const tier in line.tiers) {
      if (line.tiers[tier].score >= target) {
        p += line.tiers[tier].p
        debug_data.lines_picked.push(line.name + " (finished), " + tier + ", " + target)
        debug_data.paths.push(parents)
      }
      else {
        const new_target = target - line.tiers[tier].score
        debug_data.lines_picked.push(line.name + " (partial), " + tier + ", " + target)

        // recurse on all other lines in pool
        for (const succ_line_key in pool) {
          // remove this item from the pool for the next round
          const new_pool = update_pool(pool, succ_line_key)
          p += (1 / num_remaining_items) * get_p_recursive(pool[succ_line_key], new_target, new_pool, num_junk, num_draws - 1, debug_data, parents)
        }
      }
    }
  }
  else{
    // recurse on all valid lines without changing the target
    for (const succ_line_key in pool) {
      // remove the  item from the pool for the next round
      const new_pool = update_pool(pool, succ_line_key)
      p += (1 / num_remaining_items) * get_p_recursive(pool[succ_line_key], target, new_pool, num_junk, num_draws - 1, debug_data, parents)
    }
  }

  if (pool.length > 0 && num_junk > 0) {
    // recurse on all junk lines (lumped)
    p += (num_junk / num_remaining_items) * get_p_recursive(null, target, pool, num_junk - 1, num_draws - 1, debug_data, parents)
  }

  return p

}

// TODO ming: decide how to organize this later
// calculate the flame value of a tier based on line type and level
// this is the flame number we see on the item directly (e.g. +30 STR, +5% All Stat, +4 Weapon Attack, etc)
// for stat based flames, value = tier * stat_per_tier[level_range]
// for weapons, there are different values per tier based on flame advantage and we need the base attack value of the weapon
function get_tier_value(line_type, tier, level, is_adv, base_att) {

  if (line_type == LINETYPE.ALLSTAT) {
    return tier
  }

  // will be different for weapons
  for (const level_range_str in stat_per_tier) {
    if (is_in_level_range(level_range_str, level)) {
      if (COMBO_LINES.includes(line_type)) {
        return tier * combo_stat_per_tier[level_range_str]
      }
      else {
        return tier * stat_per_tier[level_range_str]

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
    tiers: {}
  }

  // get the active tiers and corresponding probability based on the type of flame used
  // for each tier, determine what the value is based on the line type and the character level
  // also calculate the flame score based on class type
  for (const key in TIER_PROBABILITIES[flame_type]) {
    // all tiers are reduced by 2 for non-flame advantaged items
    const tier = is_adv ? key : key - 2
    const tier_value = get_tier_value(line_type, tier, level, is_adv, null)
    line.tiers[tier] = {
      p: TIER_PROBABILITIES[flame_type][key],
      value: tier_value,
      score: FLAME_SCORE[line_type](tier_value)
    }
  }

  return line
}

// calculate the probability of obtaining a target flame score
function getProbability(class_type, level, flame_type, is_adv) {
  // generate pool of valid line objects containing attributes such as:
  // tiers, values, probabilities which are based on flame type used and level
  const valid_lines = []
  for (const key in CLASS_LINES[class_type]) {
    for (let i = 0; i < CLASS_LINES[class_type][key]; i++) {
      valid_lines.push(getLineData(key, level, is_adv, flame_type, class_type))
    }
  }

  // compute the probability of obtaining the target flame score
  let debug_data = {
    count: 0,
    lines_picked: [],
    paths: []
  }
  const result = get_p_recursive(null, 20, valid_lines, NUM_LINE_TYPES - valid_lines.length, 2, debug_data, [])

  return result
}

// for testing
const class_type = CLASS_TYPE.NORMAL
const level = 130
const flame_type = "powerful"
const is_adv = true

getProbability(class_type, level, flame_type, is_adv)
