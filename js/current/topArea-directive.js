'use strict';

/**
 * @ngdoc directive
 * @name currentTopArea
 * @description
 *  상단의 대기별 선택 버튼을 만든다.
 */

angular.module('AirPollutionApp')
    .directive('currentTopArea', function() {
        return {
            templateUrl : 'js/current/top.html'
        }
    });