'use strict';

/**
 * @ngdoc directive
 * @name buttonsDirective
 * @description
 *  상단의 대기별 선택 버튼을 만든다.
 */

angular.module('AirPollutionApp')
    .directive('buttonsDirective', function() {
        return {
            templateUrl : 'js/views/buttons.html'
        }
    });