'use strict';

/**
 * @ngdoc directive
 * @name currentMapDirective
 * @description
 *  서울시 평균을 보여준다.
 */

angular.module('AirPollutionApp')
    .directive('averageDirective', function() {

        function controller ( $scope ) {

            /**
             * variables
             * @type {object} vm : this
             */
            var vm = this;

            /**
             * @type {string} total : 평균값
             * @private
             */
            vm.total;


            /**
             *******************************
             *********  functions  *********
             *******************************
             */

            /**
             * 선택된 날짜가 바꼈을 경우 동작 한다.
             */
            $scope.$on('oldChangDate', function ( e, value ) {
                if ( value ) {
                    totalValue ();
                }
            });

            /**
             * 선택된 대기가 바꼈을 경우 동작 한다.
             */
            $scope.$watch('ngModel.checkType', function ( value ) {
                if ( value ) {
                    totalValue ();
                }
            });

            /**
             * @name totalValue
             * @description
             *  평균값을 계산
             */
            function totalValue () {

                // 각 자치구의 값과 갯수를 센다.
                var count = 0;
                var len = 0;

                for ( var item in $scope.ngModel.seoulData ) {

                    var value = $scope.ngModel.seoulData[item][$scope.ngModel.checkType];

                    if ( value && value != '점검중' ) {
                        var expr = count+'+'+value;
                        count = math.format(math.parser().eval(expr), {
                            precision: 14
                        });
                        len++;
                    }

                }

                var c = count+'/'+len;
                vm.total = math.format(math.parser().eval(c), {
                    precision: 2
                });

            }

        }

        return {
            templateUrl : 'js/views/average.html',
            scope : {
                ngModel : '='
            },
            controller : [ '$scope', controller ],
            controllerAs : 'average'
        }

    });