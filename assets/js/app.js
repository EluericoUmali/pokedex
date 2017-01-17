var appController = angular.module("appController", []);
appController.controller("pokemonController", ['$scope','$http', '$filter', 'pokedexFetch', function($scope, $http, $filter, pokedexFetch) {
        var getAttack = [];
        var getDefense = [];
        var getHp = [];
        var getSpAttack = [];
        var getSpDef = [];
        var getSpeed = [];
        var cid = [];
        var originalPageLimit = 10;
        $scope.getPokemonDetails = [];
        $scope.getPokemonTypes = [];
        $scope.getPokemonSkills = [];
        $scope.pokedexSort = 'id';
        $scope.loadingImg = true;
        $scope.loadLimit = originalPageLimit;

        $scope.collectBase = function(item) {
            getAttack.push(item.Attack);
            getDefense.push(item.Defense);
            getHp.push(item.HP);
            getSpAttack.push(item['Sp.Atk']);
            getSpDef.push(item['Sp.Def']);
            getSpeed.push(item.Speed);  
        }

        $scope.getMaxBase = function(arr) {
            return pokedexFetch.getMaxValue(arr);
        }
        
        $scope.populateBase = function() {
            $scope.baseAttack = pokedexFetch.getMaxValue(getAttack);
            $scope.baseDefense = pokedexFetch.getMaxValue(getDefense);
            $scope.baseHp = pokedexFetch.getMaxValue(getHp);
            $scope.baseSpAttack = pokedexFetch.getMaxValue(getSpAttack);
            $scope.baseSpDefense = pokedexFetch.getMaxValue(getSpDef);
            $scope.baseSpeed = pokedexFetch.getMaxValue(getSpeed);
        }

        $scope.isNullEmptyUndef = function(value) {
            return !value;
        }

        $scope.getSkillDetails = function(value) {
            $scope.lvlSpecsDisplay = false;
            $http.get('data/skills.json').success (function(data){
                for (var i = 0; i < data.length; i++) {
                    var cTypeId = data[i].type;
                    if (value && data[i].id == value) {
                        $scope.lvlSpecsDisplay = true;
                        $scope.lvlSpecSkills = data[i];
                    }
                    var arrTypes = $scope.getPokemonTypes[0];
                    var cTypeName = [];
                    if (!$scope.isNullEmptyUndef(arrTypes)) {
                        for(var t=0; t<arrTypes.length; t++) {
                            if (arrTypes[t].cname === cTypeId) {
                                cTypeName.push(arrTypes[t].ename);
                            }
                        }
                        data[i]['typename'] = cTypeName.join(' / ');
                    }
                };
                $scope.getPokemonSkills.push(data);
            });
        }

        $scope.getAllPokemonDetails = function(selectedPokemonId) {
            $scope.loadingImg = true;
            pokedexFetch.getPokedexTypes(function(data){
                $scope.getPokemonTypes.push(data);
            });
            $scope.getSkillDetails();
            pokedexFetch.getPokedexItems(function(data){
                for(var i=0; i<data.length; i++) {              
                    $scope.collectBase(data[i].base);
                    var cTypeName = [];
                    var cSkills = [];
                    if(!$scope.isNullEmptyUndef(data[i].type)) {
                        if (data[i].type.length) {
                            for(var l=0; l<data[i].type.length; l++) {
                                var cTypeId =  data[i].type[l];
                                var arrTypes = $scope.getPokemonTypes[0];
                                if (!$scope.isNullEmptyUndef(arrTypes)) {
                                    for(var t=0; t<arrTypes.length; t++) {
                                        if (arrTypes[t].cname === cTypeId) {
                                            cTypeName.push(arrTypes[t].ename);
                                        }
                                    }
                                }
                            }
                        }
                        if(cTypeName.length) {
                            data[i]['typename'] = cTypeName.join(' / ');
                        }
                    }
                    
                    if(!$scope.isNullEmptyUndef(data[i].skills.level_up)) {
                        var skillLvl = data[i].skills.level_up;
                        if (skillLvl.length) {
                            for(var x=0; x<skillLvl.length; x++) {
                                var lvlId = skillLvl[x];
                                if (!$scope.isNullEmptyUndef($scope.getPokemonSkills[0])) {
                                    var arrRecordSkills = $scope.getPokemonSkills[0];
                                    for(var y=0; y<arrRecordSkills.length; y++) {
                                        if (arrRecordSkills[y].id == lvlId) {
                                            cSkills.push(arrRecordSkills[y]);
                                        }
                                    }
                                }
                            }
                            if (!$scope.isNullEmptyUndef(cSkills) && cSkills.length) {
                                data[i]['lvlSkills'] = cSkills;
                            }
                        }
                    }
                    cid.push(data[i].id);
                }
                $scope.populateBase();
                $scope.loadingImg = false;
                $scope.loadMoreDiv = true;
                $scope.characterDisplay = data;
                $scope.getPokemonDetails = data;
                $scope.itemsLeft = $scope.getPokemonDetails.length; 
                $scope.totalItems = $scope.getPokemonDetails.length;
            });
        }

        $scope.getAllPokemonDetails(0);

        $scope.loadMoreDisplay = function() {
            var totalPages = Math.floor($scope.getPokemonDetails.length / originalPageLimit);
            var newLimit = $scope.loadLimit + originalPageLimit;
            $scope.loadMoreDiv = false;
            if (newLimit < (totalPages * originalPageLimit)) {
                $scope.loadLimit = newLimit;
                $scope.loadMoreDiv = true;
            }
        }

        $scope.searchCharacter = function() {
            var value = $scope.searchCharacterDetails;
            var fetchTotalItems = $scope.getPokemonDetails.length;
            var i = 0;
            $scope.loadMoreDiv = true;
            $scope.characterDisplay = $filter('filter')($scope.getPokemonDetails, 
                function (item) {
                if ($scope.searchFilter(item.ename, value) || $scope.searchFilter(item.typename, value)) {
                    i++;
                    return true;
                }
                return false;
            });
            if (value) {
                $scope.itemsLeft = i; 
                $scope.totalItems = fetchTotalItems;
                $scope.loadMoreDiv = true;
                if (i) {
                    $scope.noResults = false;
                    if ((i < originalPageLimit)) {
                        $scope.loadMoreDiv = false;
                    }
                } else {
                    $scope.loadMoreDiv = false;
                    $scope.noResults = true;
                }
            } else {
                $scope.itemsLeft = fetchTotalItems; 
                $scope.totalItems = fetchTotalItems;
                $scope.characterDisplay = $scope.getPokemonDetails;
                $scope.loadLimit = originalPageLimit;
            }
        }

        $scope.searchFilter = function(item, value) {
            if (item.toLowerCase().indexOf(value.toLowerCase()) !== -1 ) {
                return true;
            }
            return false;
        }

        $scope.getTargetClass = function(value, flag) {
            var panelClass = angular.element(document.querySelector(value));
            if (panelClass.hasClass('show')) {
                panelClass.removeClass('show');
            } else {
                panelClass.addClass('show');
            }
        }

        $scope.openPanel = function(id) {
            $scope.lvlSpecsDisplay = false;
            $scope.lvlSpecSkills = [];
            for(var i=0; i<cid.length; i++) {
                if (id != cid[i]) {
                    var removePanelClass = angular.element(document.querySelector('#pokemon-'+cid[i]));
                    removePanelClass.removeClass('show');
                }
            }
            $scope.getTargetClass('#pokemon-'+id, 1);           
        }

        $scope.skillsDisplay = function(value, flag) {
            $scope.lvlSpecsDisplay = false;    
            if (flag) {
                $scope.getSkillDetails(value);
                $scope.lvlSpecsDisplay = true;    
            }
            
        }
    }]
);

