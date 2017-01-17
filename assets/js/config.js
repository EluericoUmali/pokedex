var appCharacter = angular.module('pokedexApp', ['ngRoute','appController']);

appCharacter.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'views/view.html',
            controller: 'pokemonController'
    }).
        otherwise({
            redirectTo: '/'
    });
}]);
