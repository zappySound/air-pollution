'use strict';

/**
 * @ngdoc directive
 * @name dateDirective
 * @description
 *  상단의 대기별 선택 버튼을 만든다.
 */

angular.module('AirPollutionApp')
    .directive('dateDirective', function() {

        function controller ( $scope, $interval, ParseDataService ) {
            /**
             * variables
             * @type {object} vm : this
             * @type {object} interval : 재생
             * @type {object} isAnimate : 재생중인지 판단
             */
            var vm = this;
            var interval;
            var isAnimate;

            /**
             * @name slider
             * @description
             *  슬라이더를 셋팅 한다.
             */
            vm.settings = $scope.ngModel;

            vm.slider = {
                'options': {
                    create: function( event, ui ) {
                        makeSliderDates(ParseDataService.getDateArray(365));
                    },
                    start : function (event, ui) {
                        if ( isAnimate ) {
                            vm.stop();
                            isAnimate = true;
                        }
                    },
                    stop : function (event, ui) {
                        sliderChangeCb(ui.value);
                        if ( isAnimate ) {
                            vm.play();
                        }
                    }
                }
            }


            /**
             *******************************
             *********  functions  *********
             *******************************
             */

            /**
             * @name sliderChangeCb
             * @description
             *  슬라이더 콜백 함수
             */
            function sliderChangeCb ( value ) {
                $scope.$emit('changeDate');
            }

            /**
             * @name clickSlideButton
             * @description
             *  슬라이더를 범례를 클릭했을 경우 동작 한다.
             */
            vm.clickSlideButton = function(val) {
                vm.settings.sliderVal = val;
                $scope.$emit('changeDate');
            }

            /**
             * @name makeSliderDates
             * @description
             *  슬라이더 범례를 생성 한다.
             */
            function makeSliderDates() {

                var dateArray = ParseDataService.getDateArray(vm.sliderVal);
                var  monthNum = parseInt(dateArray[1][1], 10);
                var  year;
                var   month;
                var  i = 0;
                var  diff;
                var  left;

                vm.dateButtonList = [];

                for (; i < 5; i++) {
                    year = dateArray[1][0];
                    month = monthNum - 2 * (i + 1);
                    if (month < 1) {
                        year -= 1;
                        month += 12;
                    }

                    diff = parseInt((+(dateArray[2]) - +(new Date(year, (month - 1)))) / 86400000, 10);
                    left = (365 - diff) * 100 / 365;

                    if (month < 10) {
                        month = '0' + month;
                    } else {
                        month = '' + month;
                    }
                    vm.dateButtonList.push({ 'text':year + '.' + month, 'value':365 - diff, 'left' : (left).toFixed(1) + '%'});
                }

            }

            /**
             * @name vm.play
             * @description
             *  지도를 재생 시킨다.
             */
            vm.play = function() {

                isAnimate = true;

                interval = $interval(function(){
                    if ( vm.settings.sliderVal >= 365 ){
                        vm.settings.sliderVal =  0;
                    } else {
                        vm.settings.sliderVal +=  1;
                    }
                    sliderChangeCb(vm.settings.sliderVal);
                }, 1000)
            }

            /**
             * @name vm.play
             * @description
             *  지도 재생을 멈춘다.
             */
            vm.stop = function() {
                if ( isAnimate ) {
                    $interval.cancel(interval);
                    interval = undefined;
                    isAnimate = false;
                }
            }

        }

        return {
            templateUrl : 'js/views/date.html',
            scope : {
                ngModel : '='
            },
            controller : [ '$scope', '$interval', 'ParseDataService', controller ],
            controllerAs : 'date'
        }

    });