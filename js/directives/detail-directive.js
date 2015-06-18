'use strict';

/**
 * @ngdoc directive
 * @name detailDirective
 * @description
 *  화면에 테이블을 표시 한다.
 */

angular.module('AirPollutionApp')
    .directive('detailDirective', function() {

        function controller ( $scope ) {

            /**
             * variables
             * @type {object} vm : this
             */
            var vm = this;
            var nameLabel;
            var dateLabel;

            /**
             * @type {object} airStateList : 테이블 표시용 데이터
             * @type {object} settings : 대기 관련 데이터
             * @private
             */
            vm.airStateList = [];
            vm.settings = $scope.ngModel;

            /**
             * 선택된 날짜가 바꼈을 경우 동작 한다.
             */
            $scope.$on('oldChangDate', function ( e, value ) {
                if ( value && $scope.ngModel.checkType ) {
                    addAirStateList();
                }
            });

            /**
             * 선택된 대기가 바꼈을 경우 동작 한다.
             */
            $scope.$watch('ngModel.checkType', function ( value ) {
                if( value ) {
                    addAirStateList();
                }
            });

            /**
             *******************************
             *********  functions  *********
             *******************************
             */

            /**
             * @name addAirStateList
             * @description
             *  뷰화면 갱신을 위해 데이터를 스코프에 담는다.
             */
            function addAirStateList () {

                var insertArr;
                var insertObj;
                var data = vm.settings.seoulData;

                if ( $scope.ngModel.viewLabel == 'current' ) {
                    nameLabel = 'MSRSTENAME';
                    dateLabel = '';
                } else {
                    nameLabel = 'MSRSTE_NM';
                    dateLabel = vm.settings.dateString + ' - ';
                }


                insertArr = [];
                for ( var item in data ) {

                    // 점검중인지를 판단한다.
                    var val = data[item][vm.settings.checkType];
                    val += (val == '점검중') ? '' : vm.settings.units;

                    insertArr.push({
                        "name" : data[item][nameLabel],
                        "value" : val
                    })

                }

                insertObj = {
                    'title' : dateLabel + vm.settings.checkLabel,
                    'values' : insertArr
                };

                vm.airStateList.unshift(insertObj);

                // 최신 상태릐 3개 테이블만 보여준다.
                if ( vm.airStateList.length >= 4 ) {
                    vm.airStateList.pop();
                }

            }
        }

        return {
            restrict: 'EA',
            templateUrl: "js/views/detail.html",
            scope : {
                ngModel : '='
            },
            controller : [ '$scope', controller ],
            controllerAs : 'detail'
        }
    });