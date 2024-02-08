
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

// calculate the probability that the target will be met within num_draws total lines
// num_draws: total number of lines we can "draw"/pick out of the pool, once
function get_p(line, target, pool, num_junk, num_draws) {

}


// calculate the flame value of a tier based on line type and level
// this is the flame number we see on the item directly (e.g. +30 STR, +5% All Stat, +4 Weapon Attack, etc)
// for stat based flames, value = tier * stat_per_tier[level_range]
// for weapons, there are different values per tier based on flame advantage and we need the base attack value of the weapon
function get_tier_value(line_type, tier, level, is_adv, base_att) {

  // will be different per line type
  for (const level_range_str in stat_per_tier) {
    if (is_in_level_range(level_range_str, level)){
      return tier * stat_per_tier[level_range_str]
    }
  }
}

// return the flame score for a given value based on the line type and class
function get_score(value, line_type, class_type){
  
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
    const tier_value = get_tier_value(null, tier, 160, false, null)
    line.tiers[tier] = {
      p: TIER_PROBABILITIES[flame_type][key],
      value: tier_value,
      score: get_score(tier_value, line_type, class_type)
    }
  }

  return line
}

// calculate the probability of obtaining a target flame score
function getProbability() {

  getLineData(null, 100, false, "powerful", null)

}

getProbability()
