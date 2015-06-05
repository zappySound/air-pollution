'use strict';

/**
 * @ngdoc directive
 * @name tableView
 * @description
 *  날짜 및 대기 변경시 테이블을 셋팅한다.
 */

angular.module('AirPollutionApp')
    .directive('tableView', function() {
        function controller ($scope, ParseDataService, CHART_PRESETS) {

            /**
             * variables
             * @type {object} vm : this
             */
            var vm = this;

            /**
             * @type {string} vm.checkType : 선택된 대기
             * @type {string} vm.checkLabel : 선택된 대기 문자열
             * @type {string} vm.sliderVal : 슬라이더 선택날짜
             * @type {object} vm.dateString : 선택된 날짜
             * @type {object} vm.airStateList : 데이블 배열
             * @private
             */
            vm.checkType;
            vm.checkLabel;
            vm.sliderVal;
            vm.dateString;
            vm.airStateList = [];

            /**
             *******************************
             *********  functions  *********
             *******************************
             */

            /**
             * old controller에서 발생한 슬라이더.
             */
            $scope.$on( 'tableUpdate', function ( event, checkType, checkLabel, sliderVal, dateString  ) {

                vm.checkType = checkType;
                vm.checkLabel = checkLabel;
                vm.sliderVal = sliderVal;
                vm.dateString = dateString;

                init();

            });

            /**
             * @name init
             * @description
             *  최초 셋팅.
             */
            function init () {

                var promise;

                if( !vm.checkType ) {
                    vm.checkType = $scope.old.checkType;
                    vm.checkLabel = $scope.old.checkLabel;
                    vm.sliderVal = $scope.old.sliderVal;
                    vm.dateString = $scope.old.dateString;
                }

                // 서울시 데이터 를 얻는다.
                promise = ParseDataService.getParseData( CHART_PRESETS.seoulDataUrl + vm.dateString );

                // 데이터를 $scope에 담는다.
                promise.then(function ( data ) {
                    if( data['DailyAverageAirQuality'] ) {
                        addAirStateList ( data['DailyAverageAirQuality']['row'] )
                    }
                });
            }

            /**
             * @name addAirStateList
             * @description
             *  뷰화면 갱신을 위해 데이터를 스코프에 담는다.
             */
            function addAirStateList ( data ) {

                var insertArr;
                var insertObj;


                insertArr = [];
                for ( var item in data ) {
                    insertArr.push({
                        "name" : data[item]['MSRSTE_NM'],
                        "value" : data[item][vm.checkType] + CHART_PRESETS.units[vm.checkType]
                    })
                }

                insertObj = {
                    'date' : vm.dateString,
                    'type' : vm.checkLabel,
                    'values' : insertArr
                };

                vm.airStateList.unshift(insertObj);

                // 최신 상태릐 3개 테이블만 보여준다.
                if ( vm.airStateList.length >= 4 ) {
                    vm.airStateList.pop();
                }

            }

            init();

        }
        return {
            restrict: 'EA',
            templateUrl: "js/views/table.html",
            controller : controller,
            controllerAs : 'table'
        }
    });