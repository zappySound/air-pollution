'use strict';

/**
 * @ngdoc directive
 * @name currentTableView
 * @description
 *  날짜 및 대기 변경시 테이블을 셋팅한다.
 */

angular.module('AirPollutionApp')
    .directive('currentTableView', function() {
        function controller ($scope, ParseDataService, CHART_PRESETS) {

            /**
             * variables
             * @type {object} vm : this
             */
            var vm = this;

            /**
             * @type {string} vm.checkType : 선택된 대기
             * @type {string} vm.checkLabel : 선택된 대기 문자열
             * @type {object} vm.airStateList : 데이블 배열
             * @private
             */
            vm.checkType;
            vm.checkLabel;
            vm.airStateList = [];
            vm.dateString;

            /**
             *******************************
             *********  functions  *********
             *******************************
             */

            /**
             * old controller에서 발생한 슬라이더.
             */
            $scope.$on( 'tableUpdate', function ( event, checkType, checkLabel  ) {

                vm.checkType = checkType;
                vm.checkLabel = checkLabel;

                init();

            });

            /**
             * @name init
             * @description
             *  최초 셋팅.
             */
            function init () {

                var promise;

                vm.dateString = $scope.current.currentDate;

                if( !vm.checkType ) {
                    vm.checkType = $scope.current.checkType;
                    vm.checkLabel = $scope.current.checkLabel;
                }

                // 서울시 데이터 를 얻는다.
                promise = ParseDataService.getParseData( CHART_PRESETS.currentSeoulDataUrl );

                // 데이터를 $scope에 담는다.
                promise.then(function ( data ) {
                    if ( angular.isDefined(data['ListAirQualityByDistrictService']['row']) ) {
                        var tempData = data['ListAirQualityByDistrictService']['row'];
                    }

                    for ( var item in tempData ){
                        for ( var value in tempData[item] ){
                            ParseDataService.editData(tempData[item],value);
                        }
                    }
                    addAirStateList ( tempData );
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

                    // 점검중인지를 판단한다.
                    var val = data[item][vm.checkType];
                    val += (val == '점검중') ? '' : CHART_PRESETS.units[vm.checkType];

                    insertArr.push({
                        "name" : data[item]['MSRSTENAME'],
                        "value" : val
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