appCharacter.factory("pokedexFetch", function($http){
    return { 
        getPokedexItems: function(data){ $http.get('data/pokedex.json').success(data); },
        getPokedexTypes: function(data){ $http.get('data/types.json').success(data); },
        getPokedexSkills: function(data){ $http.get('data/skills.json').success(data); },
        getMaxValue: function(arr) { return Math.max.apply(Math, arr); }
  };
});