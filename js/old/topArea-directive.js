'use strict';

/**
 * @ngdoc directive
 * @name buttonsDirective
 * @description
 *  상단의 대기별 선택 버튼을 만든다.
 */

angular.module('AirPollutionApp')
    .directive('topArea', function() {
        return {
            templateUrl : 'js/old/top.html'
        }
    });