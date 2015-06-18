'use strict';

/**
 * @ngdoc directive
 * @name currentMapDirective
 * @description
 *  범례별 포함되는 자치구를 챠트와 그리드로 보여준다.
 */

angular.module('AirPollutionApp')
    .directive('piechartDirective', function() {

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
             * @type {string} chartData : 챠트 데이터
             * @private
             */
            vm.chartData;


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
                    makePieData();
                }
            });

            /**
             * 선택된 대기가 바꼈을 경우 동작 한다.
             */
            $scope.$watch('ngModel.checkType', function ( value ) {
                if ( value ) {
                    makePieData();
                }
            });


            /**
             * @name makePieData
             * @description
             *  챠트 데이터 파싱
             */
            function makePieData () {

                if ( $scope.ngModel.viewLabel == 'current' ) {
                    nameLabel = 'MSRSTENAME';
                } else {
                    nameLabel = 'MSRSTE_NM';
                }

                // 색상 셋팅
                var colorArr = [];

                // 챠트 데이터
                vm.chartData = [[],[],[]];


                // 서울시 데이터에서 색상을 셋팅한다.
                for ( var item in $scope.ngModel.seoulData ) {

                    var color = CHART_PRESETS.getColor[$scope.ngModel.checkType]($scope.ngModel.seoulData[item][$scope.ngModel.checkType]);

                    colorArr.push(color);
                }

                // 중복되는 색상은 삭제 한다.
                colorArr = colorArr.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);

                for ( var item in $scope.ngModel.seoulData ) {

                    var color = CHART_PRESETS.getColor[$scope.ngModel.checkType]($scope.ngModel.seoulData[item][$scope.ngModel.checkType]);

                    // 중복된 칼라를 제거한 배열을 루프
                    for ( var item2 in colorArr ) {
                        // 현재 데이터의 색상과 매칭
                        if( color == colorArr[item2] ) {
                            // 배열이 비어 있다면
                            if( !vm.chartData[0][item2] ) {
                                // 수치에 따른 정렬을 위해 변수 생성
                                var level = CHART_PRESETS.getLevel[$scope.ngModel.checkType]($scope.ngModel.seoulData[item][$scope.ngModel.checkType]);
                                // 범례표시
                                var legend = $scope.ngModel.grades[level-1] + ' ~ ' + $scope.ngModel.grades[level]

                                // 데이터 삽입
                                // 0 = 그래프 데이터, 1 = 색상패턴, 2 - 그리드 데이터
                                vm.chartData[0][item2] = [$scope.ngModel.seoulData[item][nameLabel],1];
                                vm.chartData[1][item2] = color;
                                vm.chartData[2][item2] = {
                                    'name' : $scope.ngModel.seoulData[item][nameLabel],
                                    'color' : color,
                                    'level' : level,
                                    'legend' : legend
                                };

                            } else {
                                // 기존 배열이 존재 할경우 해당배열에 문자열만 추가 시킨다.
                                var results =  vm.chartData[0][item2][0].match(/,/g);
                                var taste = results && (results.length%4 == 0) ? ',<br>' : ',';
                                vm.chartData[0][item2][0] += taste+$scope.ngModel.seoulData[item][nameLabel];
                                vm.chartData[0][item2][1]++;
                                vm.chartData[2][item2]['name'] += ', '+$scope.ngModel.seoulData[item][nameLabel];

                            }
                        }
                    }
                }

                // 그리드 데이터 정렬
                vm.chartData[2].sort(function(a,b) {
                    return a.level - b.level;
                });

                makePieChart();

            }


            /**
             * @name makePieChart
             * @description
             *  챠트를 그린다.
             */
            function makePieChart () {
                // 기존챠트 삭제
                chart = null;
                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'piechartContainer',
                        type: 'pie',
                        margin : 0,
                        padding : 0,
                        options3d: {
                            enabled: true,
                            alpha: 35,
                            beta: 0
                        }
                    },
                    colors : vm.chartData[1],
                    title: null,
                    tooltip: {
                        pointFormat: ''
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            animation : false,
                            cursor: 'pointer',
                            depth: 35,
                            dataLabels: {
                                enabled: true,
                                distance : -30,
                                x:10
                            },
                            backgroundColor:'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Browser share',
                        data: vm.chartData[0],
                        dataLabels: {
                            color: '#ffffff',
                            align: 'right',
                            y: 0, // 10 pixels down from the top
                            style: {
                                fontSize: '8px'
                            },
                            formatter: function () {
                                return this.y;
                            }
                        }
                    }]
                });

                chart.series[0].data[0].select();
            }


        }

        return {
            templateUrl : 'js/views/piechart.html',
            scope : {
                ngModel : '='
            },
            controller : [ '$scope', 'CHART_PRESETS', controller ],
            controllerAs : 'pie'
        }

    });