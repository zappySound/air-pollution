'use strict';

/**
 * @ngdoc directive
 * @name currentMapDirective
 * @description
 *  상단의 대기별 선택 버튼을 만든다.
 */

angular.module('AirPollutionApp')
    .directive('airtypeDirective', function() {

        function controller ( $scope, $timeout ) {

            /**
             * variables
             * @type {object} vm : this
             */
            var vm = this;

            /**
             *******************************
             *********  functions  *********
             *******************************
             */

            /**
             * @name btnSet
             * @description
             *  버튼에 디자인을 입힌다.
             */
            vm.btnSet = function(){
                $timeout(function(){
                    $('#control').buttonset();
                    $('#chkMapType').buttonset();
                },100);
            }

        }

        return {
            templateUrl : 'js/views/airtype.html',
            scope : {
                ngModel : '='
            },
            controller : [ '$scope', '$timeout', controller ],
            controllerAs : 'airType'
        }

    });