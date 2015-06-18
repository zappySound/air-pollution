'use strict';

/**
 * @ngdoc directive
 * @name currentMapDirective
 * @description
 *  대기별 범례 색상을 설정 한다.
 */

angular.module('AirPollutionApp')
    .directive('legendDirective', function() {

        return {
            templateUrl : 'js/views/legend.html',
            scope : {
                ngModel : '='
            }
        }

    });