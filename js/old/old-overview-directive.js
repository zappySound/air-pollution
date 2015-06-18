'use strict';

/**
 * @ngdoc directive
 * @name oldOverviewDirective
 * @description
 *  상단의 대기별 선택 버튼을 만든다.
 */

angular.module('AirPollutionApp')
    .directive('oldOverviewDirective', function() {

        function controller ( $scope ) {

        }

        return {
            replace : true,
            templateUrl : 'js/old/overview.html',
            controller : [ '$scope', controller ]
        }

    });