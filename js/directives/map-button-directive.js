'use strict';

/**
 * @ngdoc directive
 * @name mapButtonDirective
 * @description
 *  지도 변경용 버튼을 표시한다.
 */

angular.module('AirPollutionApp')
    .directive('mapButtonDirective', function() {

        return {
            restrict: 'EA',
            templateUrl: "js/views/mapButton.html"
        }
    });