"use strict";

let capitalize = function(words) {
  let wordsArray = words.split(' ');
  let capWords = [];
  wordsArray.forEach(function(word){
    let capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    capWords.push(capitalized);
  });
  let capString = capWords.join(' ');
  return capString;
}

let randomInRange = function(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

let generateList = function(link) {
      fetch(link)
      .then(function(response) {
        return response.json()
      })
      .then(myJson => {
        let all_pokemon = myJson['pokemon_entries'];
        all_pokemon.forEach(function(pokemon){
          // iterate through national pokedex JSON à la forEach()
          let pokeUrl = pokemon["pokemon_species"]["url"];
          let pokeNumber = (pokeUrl.split('/'))[6]; // get number from URL
          let pokeNumberRegional = pokemon["entry_number"];
          let spriteLink = "./pokemon_photos/" + pokeNumber + ".png";
          let pokeNameOriginal = pokemon["pokemon_species"]["name"];
          let pokeName = pokeNameOriginal.replace('-',' ')
          pokeName = capitalize(pokeName);
          // dynamically create list
          $("#list-container").append("<div id='div"+pokeNumber+"' class='pokemon' data-poke-name='"+pokeNameOriginal+"'>");
           $('<img/>', {
             src: spriteLink,
             width: '100px',
             height: '100px',
             id: "sprite"+pokeNumber
           }).appendTo($('#div'+pokeNumber));
           let displayPokeNumber;
           if (pokeNumberRegional >= 0 && pokeNumberRegional < 10) {
              displayPokeNumber = "00"+pokeNumberRegional.toString();
           } else if (pokeNumberRegional >= 10 && pokeNumberRegional <= 100) {
              displayPokeNumber = "0"+pokeNumberRegional.toString();
           } else {
              displayPokeNumber = pokeNumberRegional.toString();
           }
          $('#div'+pokeNumber).append("<h3>"+pokeName + '<br/> (#' + displayPokeNumber + ")</h3>");
        }); // end of forEach
      }); // <-- end of fetch().then()... chain
    }

let generatePokedexes = function() {
  $("#pokedex-selector").empty();
  fetch("https://pokeapi.co/api/v2/pokedex/")
  .then(response => response.json())
  .then(myJson => {
    let pokedexes = myJson["results"];
    pokedexes.forEach(function(pokedex) {
      let pokedexName = pokedex["name"];
      let pokedexLink = "https://pokeapi.co/api/v2/pokedex/" + pokedexName;
      let pokedexDisplayName = capitalize(pokedexName.replace('-',' '));
      $('#pokedex-selector').append("<option class='pokedex-selector-option' value='"+pokedexName + "'>"+ pokedexDisplayName+"</option>");
    });
  })
}

//------------------------------------------------
let runProgram = function(){

  generatePokedexes();

  generateList("https://pokeapi.co/api/v2/pokedex/national/");

  $('#search-bar').val(''); // <-- clear value in case stays after refresh

  // fire when pokedex is changed
  $("#pokedex-selector").on('change', function() {
    $("#list-container").empty();
    $('#search-bar').val('');
    let pokedexName = $(this).val();
    let link = "https://pokeapi.co/api/v2/pokedex/" + pokedexName + '/';
    generateList(link);
  });

  // fire when search bar value changes
  $("#search-bar").on("keyup keydown", function(event){
    let search = $("#search-bar").val().toLowerCase();
    $("#list-container").children(".pokemon").hide(); // <-- hide all pokemon when new search begins$('.active').next().remove();
    $('.active').next().remove();
    $("#prev-wrapper").children().unwrap();
    $("#next-wrapper").children().unwrap();
    $('.active').removeClass("active");
    $("#list-container").children().each(function(){
      if (/^\d+$/.test(search)) {
        let pokeNumber = $(this).children('h3').html().slice(-4, -1);
        let searchNum = Number(search);
        if (pokeNumber == searchNum) {
          $(this).show();
        }
      } else if (typeof search === "string" && /^[a-zA-Z ]+$/i.test(search)) {
        let adjustedSearch = search.replace(" ", "-");
        let fullPokeName = $(this).attr("data-poke-name");
        let slicedPokeName = fullPokeName.slice(0, search.length);
        if (slicedPokeName === adjustedSearch) {
          $(this).show()
        }
      }
    }); // <-- end of #list-container.each()
    if (search.length == 0) { // i.e. search bar is empty
      $("#list-container").children(".pokemon").show();
    }
  });

  // fire when random button is clicked
  $('#random-button').on('click', function(){
    $('.active').next().remove();
    $("#prev-wrapper").children().unwrap();
    $("#next-wrapper").children().unwrap();
    $('.active').removeClass("active");
    $('#list-container').children('.pokemon').hide();
    let numberOfPokemon = $('#list-container').children('.pokemon').length;
    let random = randomInRange(1,numberOfPokemon);
    $("#list-container").children('.pokemon').each(function(){
      let pokeNumber = $(this).children('h3').html().slice(-4, -1);
      if (pokeNumber == random) {
        $(this).show();
      };
    });
  });

  // fire when show all button is clicked
  $("#show-all-button").on('click', function(){
    $('#search-bar').val('');
    if ($('#list-container').children('.pokemon').hasClass('active')) {
      // ^^ i.e. means detail page currently being showing-move
      $('.active').next().remove();
      $("#prev-wrapper").children().unwrap();
      $("#next-wrapper").children().unwrap();
      $('.active').removeClass("active");
    }
    $('#list-container').children('.pokemon').show();
  });

  // fire when individual pokemon is clicked
  $('#list-container').on('click', '.pokemon', function(){
    // $(this) is the clicked pokemon's div
    if (!$(this).siblings().hasClass("wrapper")){
      let firstSib = $(this).siblings().first()
      firstSib.nextUntil($(this)).addBack().wrapAll('<div class="wrapper" id="prev-wrapper"></div>');
      $(this).nextAll().wrapAll('<div class="wrapper" id="next-wrapper"></div>');
    } else {
      $("#prev-wrapper").children().unwrap();
      $("#next-wrapper").children().unwrap();
    }
    if ($(this).hasClass("active")) {
          $(this).removeClass("active");
          $(this).next().remove();
    } else {
        let pokeNameAndNumber = $(this).text();
        let divId = $(this).attr('id');
        let pokeNumber = divId.slice(3);
        let pokeName = (pokeNameAndNumber.split(' '))[0];
        // ^^ ...is there a way to write a test for this ?
        let link = 'https://pokeapi.co/api/v2/pokemon/' + pokeNumber + '/';
        fetch(link)
        .then(response => response.json())
        .then(pokeInfo => {
          $(this).after("<div class='details-container'></div>");
          $('<div/>', {
            id: "details" + pokeNumber,
            class: "details",
          }).appendTo(".details-container");
          $(this).addClass("active");
          $('#details'+pokeNumber).append("<h2>"+pokeName+"</h2>");
          let nationalNumber = "#" + pokeNumber;
          $('#details'+pokeNumber).append("<h4>National Pokedex Order:</h4><p>"+nationalNumber+"</p>");
          // types
          let listOfTypes = pokeInfo["types"];
          let types = ""
          listOfTypes.forEach(function(type) {
            let typeName = type["type"]["name"];
            typeName = capitalize(typeName);
            types = types + typeName + " - ";
          });
          types = types.slice(0,-2); // remove final "-"
          $('#details'+pokeNumber).append('<h4>Type:</h4><p>'+types+'</p>');
          // height and weight
          let height = pokeInfo["height"];
          height = (height * 0.1).toFixed(1); // height data comes as number of .1 meters
          let weight = pokeInfo["weight"];
          weight = (weight * 0.1).toFixed(1); // weight data comes in number of .1 meters
          $("#details"+pokeNumber).append("<h4>Height and Weight:</h4>");
          $("#details"+pokeNumber).append("<p>HT: "+height+" m</p>");
          $("#details"+pokeNumber).append("<p>WT: "+weight+" kg</p>");
          // abilities
          let listOfAbilities = pokeInfo["abilities"];
          let abilities = ""
          listOfAbilities.forEach(function(ability) {
            let abilityName = ability["ability"]["name"];
            abilityName = abilityName.replace('-',' ');
            abilityName = capitalize(abilityName);
            abilities = abilities + abilityName + " - ";
          });
          abilities = abilities.slice(0, -2); // remove final "-"
          $('#details'+pokeNumber).append('<h4>Abilities:</h4><p>'+abilities+'</p>');
          // stats
          let listOfStats = pokeInfo["stats"];
          let stats = [];
          listOfStats.forEach(function(stat) { // stat is by index number, not name
            let statName = stat["stat"]["name"];
            statName = statName.replace('-',' ');
            statName = capitalize(statName);
            let baseStat = stat["base_stat"];
            let statInfo = [statName, baseStat];
            stats.push(statInfo);
          });
          stats[(stats.length-1)][0] = stats[(stats.length-1)][0].toUpperCase();
          // ^^ capitalize final stat, from Hp to HP
          $('#details'+pokeNumber).append('<h4>Stats:</h4>');
          stats.forEach(function(stat){
            $('#details'+pokeNumber).append('<p>'+stat[0]+': '+stat[1]+'</p>');
          });
          // moves
          let listOfMoves = pokeInfo["moves"];
          let moves = [];
          let movesSet = new Set();
          listOfMoves.forEach(function(move) {
            let moveName = move["move"]["name"];
            moveName = moveName.replace('-',' ');
            moveName = capitalize(moveName);
            let levelLearnedVersions = move["version_group_details"];
            levelLearnedVersions.forEach(function(version){
              if (version["move_learn_method"]["name"] == "level-up" && version["version_group"]["name"] == "sun-moon") {
                // using Son/Moon data because that is most recent Pokemon version
                let levelLearned = version["level_learned_at"];
                let newMove = [moveName, levelLearned];
                if (movesSet.has(moveName)) {
                  moves.forEach(function(item) {
                    if (item.includes("moveName") && item[1] < newMove[1]){
                      moves.push[newMove];
                    }
                  });
                } else {
                    moves.push(newMove);
                    movesSet.add(moveName);
                }
              }
            });
          });
          moves.sort(function(a,b){return a[1] > b[1]});
          $('#details'+pokeNumber).append('<h4>Moves:</h4>');
          moves.forEach(function(move){
            $('#details'+pokeNumber).append('<p class="move" data-move-name="'+move+'">'+move[0]+' (Lev. '+move[1]+')</p>');
          });
        // evolution
        let speciesLink = "https://pokeapi.co/api/v2/pokemon-species/" + pokeNumber + '/';
        fetch(speciesLink)
        .then(response => response.json())
        .then(speciesData => {
          let evolutionLink = speciesData["evolution_chain"]["url"];
          console.log(evolutionLink)
          return fetch(evolutionLink);
        })
        .then(response => response.json())
        .then(evolutionData => {
          let chain = evolutionData["chain"];
          console.log(chain);
          $("#details"+pokeNumber).append("<h4>Evolution Chain:</h4><br/>")
          let chainData = [];
          let evolutionRecursion = function(remainingChain){
            if (remainingChain == undefined){
              // base case, no remaining evolution
              return chainData;
            } else {
              let itemData = [];
              let firstItemData = [];
              if (remainingChain.evolution_details.length == 0) { // i.e. is base version
                let name = remainingChain["species"]["name"];
                console.log(name);
                let level;
                let trigger;
                let heldItem;
                if (remainingChain["evolution_details"].length !== 0){
                  level = remainingChain["evolution_details"][0]["min_level"];
                  trigger = remainingChain["evolution_details"][0]["trigger"]["name"];
                } else {
                  level = ""; // otherwise level would be undefined
                }
                if (level !== null) {
                  firstItemData.push([name,level]);
                } else if (trigger == "use-item"){ // i.e. evolutions occurs on item
                  heldItem = remainingChain["evolution_details"][0]["item"]["name"]
                  firstItemData.push([name,heldItem]);
                } else { // i.e. evolution occurs on trigger other than item
                  firstItemData.push([name,trigger])
                }
                chainData.push(firstItemData);
              }
              remainingChain.evolves_to.forEach(function(item) {
                let name = item["species"]["name"];
                console.log(name);
                let level;
                let trigger;
                let heldItem;
                if (item["evolution_details"].length !== 0){
                  level = item["evolution_details"][0]["min_level"];
                  trigger = item["evolution_details"][0]["trigger"]["name"];
                } else {
                  level = ""; // otherwise level would be undefined
                }
                if (level !== null) {
                  itemData.push([name,level]);
                } else if (trigger == "use-item"){ // i.e. evolutions occurs on item
                  heldItem = item["evolution_details"][0]["item"]["name"]
                  itemData.push([name,heldItem]);
                } else if (trigger == "level-up"){
                    let conditionTrigger = "Level Up with condition";
                    itemData.push([name,conditionTrigger]);
                } else { // i.e. evolution occurs on trigger other than item
                  itemData.push([name,trigger]);
                }
              });
              chainData.push(itemData);
              remainingChain = remainingChain["evolves_to"][0];
              evolutionRecursion(remainingChain);
            }
          }
          evolutionRecursion(chain);
          console.log(chainData);
          chainData.forEach(function(evolutionLevel, i){
            evolutionLevel.forEach(function(pokemon) {
              let pokeName = capitalize(pokemon[0]);
              let triggerEvent = pokemon[1];
              if (typeof triggerEvent == "string") {
                triggerEvent = triggerEvent.replace('-',' ');
                console.log(triggerEvent)
              } // ^^ to clean up trigger name
              if (evolutionLevel.length > 1) { // add dash if parallel evolution
                if (triggerEvent !== "") {
                  if (/^\d+$/.test(triggerEvent)) { // i.e. only numbers so trigger is level-up
                    $("#details"+pokeNumber).append("<p> - "+pokeName+" (Lev. "+triggerEvent+")</p>");
                  } else {
                    $("#details"+pokeNumber).append("<p> - "+pokeName+" ("+capitalize(triggerEvent)+")</p>");
                  }
                } else {
                  $("#details"+pokeNumber).append("<p>"+pokeName+"</p>");
              }
            } else {
              if (triggerEvent !== "") {
                if (/^\d+$/.test(triggerEvent)) { // i.e. only numbers so trigger is level-up
                  $("#details"+pokeNumber).append("<p>"+pokeName+" (Lev. "+triggerEvent+")</p>");
                } else {
                  $("#details"+pokeNumber).append("<p>"+pokeName+" ("+capitalize(triggerEvent)+")</p>");
                }
              } else {
                $("#details"+pokeNumber).append("<p>"+pokeName+"</p>");
              }
            }
          }); // <-- end of second forEach()
        }); // <-- end of first forEach()
        }) // <-- close evolution .then()

        // more info
        .then(() => {
          let bulbaLink = "https://bulbapedia.bulbagarden.net/wiki/"+ pokeName;
          $("#details"+pokeNumber).append("<h4>More info:</h4><br/>");
          $("#details"+pokeNumber).append('<p><a href="'+bulbaLink+'" target="_blank">Read more about '+pokeName+' on Bulbapedia</p></a>');
        });
      }); // <-- closes first fetch
      } // <-- closes else
    }); // <-- closes $("#list-container").on(click) function

    // fire when individual move name is clicked
    $('#list-container').on("click", ".move", function(){
      if ($(this).next().hasClass("showing-move")) {
        $(this).next().remove();
      }
      else {
        let divId = $(this).parent().attr('id');
        let pokeNumber = divId.slice(3);
        let data = $(this).attr('data-move-name');
        let moveName = (data.split(","))[0];
        moveName = moveName.toLowerCase().replace(' ','-');
        let moveDataUrl = "https://pokeapi.co/api/v2/move/" + moveName;
        fetch(moveDataUrl)
        .then(response => response.json())
        .then(data => {
          let moveData = {
            "PP": data["pp"],
            "accuracy": data["accuracy"],
            "power": data["power"],
            "name": data["name"],
            "flavorText": data["flavor_text_entries"][2]["flavor_text"],
          }; return moveData;
        })
        .then(moveData => {
          $('<div/>', {
            id: moveName+'-info',
            class: 'move-detail-div showing-move',
          }).insertAfter($(this));
            let moveDataKeys = Object.keys(moveData);
            let moveDataValues = Object.values(moveData);
            let flavorText = moveData.flavorText;
            let moveNameFormatted = capitalize(moveName.replace('-',' '));
            $('#'+moveName+'-info').append("<h3>"+moveNameFormatted+"</h3>");
            $('#'+moveName+'-info').append("<p><i>"+flavorText+"</i></p><br/><br/>");
            moveDataValues.forEach(function(value, i){
              let attribute = moveDataKeys[i];
              if (attribute === "PP" || attribute === "accuracy" || attribute === "power") {
                if (value === null) {
                  value = "N/A";
                }
                $('#'+moveName+'-info').append("<h4> "+capitalize(attribute)+": </h4>");
                $('#'+moveName+'-info').append("<p> "+value+"</p><br/>");
              }
            }); // <-- end of forEach()
            //$('#'+moveName+'-info').append("<a href='https://i.redd.it/nsptl0gtc7311.jpg' target='blank'><p>Easter Egg</p></a>");
          }); // <-- end of .then()
        } // <-- end of else
      }); // <-- end of on.click('.move')
} // <-- closes runProgram()
//----------------------------------
runProgram();
