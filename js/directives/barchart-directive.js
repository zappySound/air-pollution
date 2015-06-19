'use strict';

/**
 * @ngdoc directive
 * @name echart
 * @description
 *  오른쪽 그래프를 그린다..
 */

angular.module('AirPollutionApp')
    .directive('barchartDirective', function() {

        function controller ( $scope, CHART_PRESETS ) {

            /**
             * variables
             * @type {object} vm : this
             * @type {object} chart : 챠트
             */
            var vm = this;
            var chart;
            var nameLabel;

            /**
             * @type {string} barData : 챠트 데이터
             * @type {string} settings : 대기 관련 데이터
             * @private
             */
            vm.barData;
            vm.settings = $scope.ngModel;


            /**
             *******************************
             *********  functions  *********
             *******************************
             */

            /**
             * 선택된 날짜가 바꼈을 경우 동작 한다.
             */
            $scope.$on('oldChangDate', function ( e, value ) {
                if ( value && $scope.ngModel.checkType ) {
                    makeBarData();
                }
            });

            /**
             * 선택된 대기가 바꼈을 경우 동작 한다.
             */
            $scope.$watch('ngModel.checkType', function ( value ) {
                if ( value ) {
                    makeBarData();
                }
            });


            /**
             * @name makeBarData
             * @description
             *  챠트 데이터 파싱
             */
            function makeBarData () {

                vm.barData = [[],[]];

                var temData = [];

                if ( $scope.ngModel.viewLabel == 'current' ) {
                    nameLabel = 'MSRSTENAME';
                } else {
                    nameLabel = 'MSRSTE_NM';
                }

                for ( var item in vm.settings.seoulData ) {

                    var val = vm.settings.seoulData[item][vm.settings.checkType];

                    if ( val == '점검중' ) {
                        temData[item] = [vm.settings.seoulData[item][nameLabel],0];
                    } else {
                        var number = vm.settings.seoulData[item][vm.settings.checkType];
                        if( angular.isNumber( number ) ) {
                            temData[item] = [ vm.settings.seoulData[item][nameLabel], number ];
                        } else {
                            temData[item] = [ vm.settings.seoulData[item][nameLabel], math.eval(number) ];
                        }

                    }

                }

                temData.sort(function (a, b) {
                    if (a[1] < b[1]) {
                        return 1;
                    }
                    if (a[1] > b[1]) {
                        return -1;
                    }

                    return 0;
                });

                for ( var item in temData ) {
                    vm.barData[0][item] = [temData[item][0], eval(temData[item][1])];
                    vm.barData[1][item] = CHART_PRESETS.getColor[vm.settings.checkType](vm.barData[0][item][1]);
                }

                makeBarChart();

            }

            /**
             * @name makeBarChart
             * @description
             *  챠트를 그린다.
             */
            function makeBarChart () {

                chart = null;

                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'barchartContainer',
                        type: 'column',
                        marginLeft: 100,
                        marginTop: 50,
                        options3d: {
                            enabled: true,
                            alpha: -3,
                            beta: -20,
                            depth: 50,
                            viewDistance: 25
                        },
                        backgroundColor: 'transparent'
                    },
                    colors : vm.barData[1],
                    xAxis: {
                        type: 'category',
                        labels: {
                            rotation: -60,
                            style: {
                                color: '#ffffff',
                                fontSize: '8px'
                            }
                        },
                        gridLineWidth: 0,
                        minorGridLineWidth: 0
                    },
                    yAxis: {
                        min: 0,
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        labels: {
                            style: {
                                color: '#ffffff'
                            }
                        },
                        title: {
                            text: null
                        }
                    },
                    tooltip: {
                        formatter: function() {
                            return this.key + ' : <br>' + this.y + vm.settings.units;
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    title: null,
                    subtitle: null,
                    plotOptions: {
                        column: {
                            depth: 25,
                            animation : false
                        }
                    },
                    series: [{
                        data: vm.barData[0],
                        dataLabels: {
                            enabled: false,
                            color: '#FFFFFF',
                            align: 'right',
                            y: 0, // 10 pixels down from the top
                            style: {
                                fontSize: '8px'
                            }
                        }
                    }]
                });

            }


        }

        return {
            template : '<h2>농도별 자치구 정렬</h2><div id="barchartContainer" class="bar_chart_container"></div>',
            scope : {
                ngModel : '='
            },
            controller : [ '$scope', 'CHART_PRESETS', controller ],
            controllerAs : 'bar'
        }
    });