'use strict';

/**
 * @ngdoc directive
 * @name currentMapDirective
 * @description
 *  상단의 대기별 선택 버튼을 만든다.
 */

angular.module('AirPollutionApp')
    .directive('currentMapDirective', function() {

        function controller ( $scope ) {

        }

        return {
            replace : true,
            templateUrl : 'js/views/map.html',
            controller : [ '$scope', controller ]
        }

    });