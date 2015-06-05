'use strict';

/**
 * @ngdoc directive
 * @name legendDirective
 * @description
 *  범례를 표시한다.
 */

angular.module('AirPollutionApp')
    .directive('legendDirective', function() {
        return {
            restrict: 'EA',
            templateUrl: "js/views/legend.html"
        }
    });