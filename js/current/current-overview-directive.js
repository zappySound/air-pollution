'use strict';

/**
 * @ngdoc directive
 * @name currentTopArea
 * @description
 *  상단의 대기별 선택 버튼을 만든다.
 */

angular.module('AirPollutionApp')
    .directive('currentOverviewDirective', function() {

        function controller ( $scope ) {

        }

        return {
            replace : true,
            templateUrl : 'js/current/overview.html',
            controller : [ '$scope', controller ]
        }

    });