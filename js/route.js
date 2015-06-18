'use strict';

/**
 * @name AirPollutionApp
 */
angular
    .module('AirPollutionApp',[
        'ui.router',
        'ui.slider'
    ])
    .config(['$stateProvider', '$urlRouterProvider' , function($stateProvider, $urlRouterProvider){

        $urlRouterProvider.otherwise("/current/openstreetmap");

        $stateProvider
            .state('current', {
                url: "/current",
                templateUrl: 'js/current/current.html',
                controller : 'currentCtrl as current'
            })
                .state('current.googlemap', {
                    url: "/googlemap?type",
                    templateUrl: 'js/views/googlemap.html',
                    controller: 'currentGooglemapCtrl as currentGooglemapCtrl'
                })
                .state('current.openstreetmap', {
                    url: "/openstreetmap?type",
                    templateUrl: 'js/views/openstreet.html',
                    controller: 'currentOpenstreetCtrl as currentOpenstreet'
                })

            .state('old', {
                url: "/old",
                templateUrl: 'js/old/old.html',
                controller : 'oldCtrl as old'
            })
                .state('old.googlemap', {
                    url: "/googlemap?date&type",
                    templateUrl: 'js/views/googlemap.html',
                    controller: 'oldGooglemapCtrl as oldGooglemapCtrl'
                })
                .state('old.openstreetmap', {
                    url: "/openstreetmap?date&type",
                    templateUrl: 'js/views/openstreet.html',
                    controller: 'oldOpenstreetCtrl as oldOpenstreet'
                })
    }]);