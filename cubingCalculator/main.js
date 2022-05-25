//function l(what) {return document.getElementById(what);}
import {getProbability} from "./getProbability.js";
import C from "./c.js";
import Game from "./game.js";
import {geoDistrQuantile} from "./statistics.js";
import {cubingCost, tier_rates, tier_rates_DMT} from "./cubes.js";
import {$desiredStats, updateDesiredStats} from "./updateDesiredStats";

function asset(what) {
  return "url(" + C.assetsDir + what + ")";
}

function soundasset(what) {
  return C.soundDir + what + "?raw=true";
}

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    $("#toast").toast('show')
  }, 1000)

  // setTimeout(function(){
  //   $("#toast").toast('hide')
  // }, 3000)
  document.getElementById("currentTier").addEventListener("change", function () {
    const currentTier = parseInt($(this).val());
    const $desiredTier = $('#desiredTier');
    const desiredTier = parseInt($desiredTier.val());
    $desiredTier.empty();

    if (currentTier <= 1) {
      $desiredTier.append("<option value=1>Epic</option>");
    }
    if (currentTier <= 2) {
      $desiredTier.append("<option value=2>Unique</option>");
    }
    $desiredTier.append("<option value=3 selected>Legendary</option>");

    const desiredStatsElement = document.getElementById("desiredStats");
    if (currentTier !== desiredTier){
      desiredStatsElement.disabled = true
      desiredStatsElement.value = "any"
    }
    else {
      updateDesiredStats();
      desiredStatsElement.disabled = false;
    }
  });

  document.getElementById('desiredTier').addEventListener("change", function () {
    const desiredTier = $(this).val();
    const currentTier = $('#currentTier').val();
    const desiredStatsElement = document.getElementById("desiredStats");

    if (currentTier === desiredTier) {
      updateDesiredStats();
      desiredStatsElement.disabled = false;
    }
    else {
      $desiredStats.empty();
      $desiredStats.append("<option id='any' value='any'>Any</option>");
      desiredStatsElement.disabled = true;
    }
  });

  document.getElementById("itemType").addEventListener("change", function () {
    // document.getElementById('error-container').style.display = '';
    var desiredTier = document.getElementById('desiredTier').value
    if (desiredTier !== 0) {
      updateDesiredStats();
      document.getElementById("desiredStats").selectedIndex = 0; //Option 10
    }
  });

  // document.getElementById("totalTrials").addEventListener("change", function () {
  //   document.getElementById('error-container').style.display = '';
  // });

  // document.getElementById("desiredStats").addEventListener("change", function () {
  //   document.getElementById('error-container').style.display = '';
  // });

  document.getElementById("itemLevel").addEventListener("change", function () {
    // Set selected option as variable
    var itemLevel = parseInt($(this).val());
    var itemType = document.getElementById('itemType').value;
    const desiredTier = document.getElementById('desiredTier').value
    const currentTier = document.getElementById('currentTier').value

    if (itemLevel < 71 || itemLevel > 200) {
      $desiredStats.empty();
      $desiredStats.append("<option value='N/A' disabled selected>Your item level must be between 71 and 200</option>");
      document.getElementById('calculateButton').disabled = true;
    } else {
      updateDesiredStats();
      document.getElementById('calculateButton').disabled = false;
    }


  });

  document.getElementById("calculateButton").addEventListener("click", function () {
    function loaderOn() {
      $('#loader1').show();
      $('#loader2').show();
      setTimeout(runCalculator, 100);
    }

    function loaderOff() {
      $('#loader1').hide();
      $('#loader2').hide()
    }

    function getTierCosts(currentTier, desiredTier, cubeType, DMT) {
      var tier_up_rates = tier_rates
      if (DMT) tier_up_rates = tier_rates_DMT
      if (currentTier == 3) return {mean: 0, median: 0, seventy_fifth: 0, eighty_fifth: 0, nintey_fifth: 0}
      if (currentTier == 2) {
        var p = tier_up_rates[cubeType][currentTier]
        var stats = geoDistrQuantile(p)
        var mean = Math.round(stats.mean)
        var median = Math.round(stats.median)
        var seventy_fifth = Math.round(stats.seventy_fifth)
        var eighty_fifth = Math.round(stats.eighty_fifth)
        var nintey_fifth = Math.round(stats.nintey_fifth)

        return {mean: mean, median: median, seventy_fifth: seventy_fifth, eighty_fifth: eighty_fifth, nintey_fifth: nintey_fifth}
      }
      if (currentTier == 1) {
        var p = tier_up_rates[cubeType][currentTier]
        var stats = geoDistrQuantile(p)
        var mean = Math.round(stats.mean)
        var median = Math.round(stats.median)
        var seventy_fifth = Math.round(stats.seventy_fifth)
        var eighty_fifth = Math.round(stats.eighty_fifth)
        var nintey_fifth = Math.round(stats.nintey_fifth)

        var p = tier_up_rates[cubeType][currentTier + 1]
        var stats = geoDistrQuantile(p)
        mean += Math.round(stats.mean)
        median += Math.round(stats.median)
        seventy_fifth += Math.round(stats.seventy_fifth)
        eighty_fifth += Math.round(stats.eighty_fifth)
        nintey_fifth += Math.round(stats.nintey_fifth)

        return {mean: mean, median: median, seventy_fifth: seventy_fifth, eighty_fifth: eighty_fifth, nintey_fifth: nintey_fifth}
      }
      if (currentTier == 0) {
        var p = tier_up_rates[cubeType][currentTier]
        var stats = geoDistrQuantile(p)
        var mean = Math.round(stats.mean)
        var median = Math.round(stats.median)
        var seventy_fifth = Math.round(stats.seventy_fifth)
        var eighty_fifth = Math.round(stats.eighty_fifth)
        var nintey_fifth = Math.round(stats.nintey_fifth)

        var p = tier_up_rates[cubeType][currentTier + 1]
        var stats = geoDistrQuantile(p)
        mean += Math.round(stats.mean)
        median += Math.round(stats.median)
        seventy_fifth += Math.round(stats.seventy_fifth)
        eighty_fifth += Math.round(stats.eighty_fifth)
        nintey_fifth += Math.round(stats.nintey_fifth)

        var p = tier_up_rates[cubeType][currentTier + 2]
        var stats = geoDistrQuantile(p)
        mean += Math.round(stats.mean)
        median += Math.round(stats.median)
        seventy_fifth += Math.round(stats.seventy_fifth)
        eighty_fifth += Math.round(stats.eighty_fifth)
        nintey_fifth += Math.round(stats.nintey_fifth)

        return {mean: mean, median: median, seventy_fifth: seventy_fifth, eighty_fifth: eighty_fifth, nintey_fifth: nintey_fifth}
      }
    }

    function runCalculator() {
      var itemType = document.getElementById('itemType').value;
      var cubeType = document.getElementById('cubeType').value;
      var currentTier = parseInt(document.getElementById('currentTier').value);
      //var totalTrials = parseInt(document.getElementById('totalTrials').value);
      var itemLevel = parseInt(document.getElementById('itemLevel').value);
      var desiredTier = parseInt(document.getElementById('desiredTier').value);
      var DMT = document.getElementById('DMT').checked

      //Todo: meso/drop/CDhat/
      var desiredStat = document.getElementById('desiredStats').value;

      //insert logic here
      var p = getProbability(itemType, desiredStat, cubeType, currentTier, desiredTier, itemLevel)
      var tier_up = getTierCosts(currentTier, desiredTier, cubeType, DMT)
      var stats = geoDistrQuantile(p)

      if (desiredStat == "any") {
        stats.mean = 0
        stats.median = 0
        stats.seventy_fifth = 0
        stats.eighty_fifth = 0
        stats.nintey_fifth = 0
      }

      var mean = Math.round(stats.mean) + tier_up.mean
      var median = Math.round(stats.median) + tier_up.median
      var seventy_fifth = Math.round(stats.seventy_fifth) + tier_up.seventy_fifth
      var eighty_fifth = Math.round(stats.eighty_fifth) + tier_up.eighty_fifth
      var nintey_fifth = Math.round(stats.nintey_fifth) + tier_up.nintey_fifth

      var mean_cost = cubingCost(cubeType, itemLevel, mean)
      var median_cost = cubingCost(cubeType, itemLevel, median)
      var seventy_fifth_cost = cubingCost(cubeType, itemLevel, seventy_fifth)
      var eighty_fifth_cost = cubingCost(cubeType, itemLevel, eighty_fifth)
      var ninety_fifth_cost = cubingCost(cubeType, itemLevel, nintey_fifth)


      //new logic ends here


      //var results = repeatExperiment(cubeType, itemLevel, itemType, desiredStat, totalTrials, currentTier, desiredTier);

      var averageCubeCount = mean //results.averageCubeCount
      var averageCost = mean_cost //results.averageCost
      var medianCost = median_cost //results.medianCost
      var medianCubeCount = median //results.medianCubeCount
      //var mesoDataForGraph = results.mesoDataForGraph
      var costSevenFive = seventy_fifth_cost //results.costSevenFive
      var costEightFive = eighty_fifth_cost //results.costEightFive
      var costNineFive = ninety_fifth_cost //results.costNineFive
      var cubeSevenFive = seventy_fifth //results.cubeSevenFive
      var cubeEightFive = eighty_fifth //results.cubeEightFive
      var cubeNineFive = nintey_fifth //results.cubeNineFive

      //console.log(repeatExperiment('red', 150, 'weapon', '2LATT', 1, 3, 3))
      // Highcharts.chart('container', {
      //   title: {
      //     text: 'Frequency Histogram'
      //   },

      //   xAxis: [{
      //     title: {
      //       text: ''
      //     },
      //     alignTicks: false,
      //     visible: false,
      //     opposite: true
      //   }, {
      //     title: {
      //       text: 'Meso Cost (in Billions)'
      //     },
      //     alignTicks: false,
      //     opposite: false
      //   }],

      //   yAxis: [{
      //     title: {
      //       text: ''
      //     },
      //     visible: false,
      //     opposite: true
      //   }, {
      //     title: {
      //       text: 'Frequency'
      //     },
      //     opposite: false
      //   }],

      //   plotOptions: {
      //     histogram: {
      //       accessibility: {
      //         pointDescriptionFormatter: function (point) {
      //           var ix = point.index + 1,
      //             x1 = point.x.toFixed(3),
      //             x2 = point.x2.toFixed(3),
      //             val = point.y;
      //           return ix + '. ' + x1 + ' to ' + x2 + ', ' + val + '.';
      //         }
      //       }
      //     }
      //   },

      //   series: [{
      //     name: 'Histogram',
      //     type: 'histogram',
      //     color: '#135273',
      //     xAxis: 1,
      //     yAxis: 1,
      //     baseSeries: 's1',
      //     zIndex: -1
      //   }, {
      //     name: '',
      //     type: 'scatter',
      //     visible: false,
      //     data: mesoDataForGraph,
      //     id: 's1',
      //     marker: {
      //       radius: 0
      //     }
      //   }]
      // });
      //document.getElementById("graphhere").style.display = '';
      document.getElementById('result').style.display = '';
      // document.getElementById('error-container').style.display = 'none';
      document.getElementById('result').innerHTML =
        `
    <div class="container secondarycon">
      <div class=" statBox statBox1" style="background-color:#aaa;">
        <h2 style="text-align:center;">Mesos Stats</h2>
            <p style="text-align:center;"">
                Average cost: ${averageCost.toLocaleString()}<br />
            Median cost: ${medianCost.toLocaleString()}<br />
            </p>
      </div>
      <div class=" statBox statBox2" style="background-color:#bbb;">
        <h2 style="text-align:center;">Mesos Percentiles</h2>
        <p style="text-align:center;"">
            75% chance within ${costSevenFive.toLocaleString()} mesos<br />
            85% chance within ${costEightFive.toLocaleString()} mesos<br />
            95% chance within ${costNineFive.toLocaleString()} mesos<br />
        </p>
      </div>
      
      <div class=" statBox statBox3" style="background-color:#aaa;">
        <h2 style="text-align:center;"">Cube Stats</h2>
            <p style="text-align:center;"">
                Average cubes: ${averageCubeCount.toLocaleString()} ${cubeType} cubes<br />
                Median cubes: ${medianCubeCount.toLocaleString()} ${cubeType} cubes<br />
            </p>
      </div>
      <div class=" statBox statBox4" style="background-color:#bbb;">
        <h2 style="text-align:center;">Cube Percentiles</h2>
        <p style="text-align:center;"">
            75% chance within ${cubeSevenFive.toLocaleString()} ${cubeType} cubes<br />
            85% chance within ${cubeEightFive.toLocaleString()} ${cubeType} cubes<br />
            95% chance within ${cubeNineFive.toLocaleString()} ${cubeType} cubes<br />
        </p>
      </div>
    </div>
        `
    }
    loaderOn();
    setTimeout(loaderOff, 100);

    //console.log(performExperiment('black', 150, 'earring', '2LDropOrMeso', 3, 3))

    //console.log(repeatExperiment('black', 150, 'hat', '3SecCD', 100, 3, 3))
  });
}, false);

// Populate the select options:
updateDesiredStats();

Game.init();
