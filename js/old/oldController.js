'use strict';

/**
 * @name oldCtrl
 * @desc
 *  서울의 일별 평균온도.
 */

function oldCtrl($scope, $timeout, $window, $interval, ParseDataService) {

    /**
     * variables
     * @type {object} vm : this
     * @type {function} interval : 슬라이더 재생
     * @type {function} isAnimate : 슬라이더 재생중인지 판단.
     */
    var vm = this;
    var interval;
    var isAnimate;

    /**
     * @type {string} vm.checkType : 선택된 대기
     * @type {string} vm.checkLabel : 선택된 대기 문자
     * @type {number} vm.sliderVal : slider value
     * @type {array} vm.dateButtonList : 슬라이더 범례
     * @type {array} vm.dateString : 선택된 날짜
     * @type {array} vm.mapType : 선택된 맵
     * @private
     */
    vm.checkType;
    vm.checkLabel;
    vm.sliderVal;
    vm.dateButtonList;
    vm.dateString;

    // 상단 대기 선택 버튼을 만든다.
    vm.buttonList = [
        {'label' : '이산화질소', 'value' : 'NO2', 'id' : 'radio1'},
        {'label' : '오존', 'value' : 'O3', 'id' : 'radio2'},
        {'label' : '일산화탄소', 'value' : 'CO', 'id' : 'radio3'},
        {'label' : '아황산가스', 'value' : 'SO2', 'id' : 'radio4'},
        {'label' : '미세먼지', 'value' : 'PM10', 'id' : 'radio5'}
    ];

    /**
     *******************************
     *********  functions  *********
     *******************************
     */

    /**
     * @name init
     * @description
     *  최초 대기 종류 및 날짜를 셋팅한다.
     */
    function init() {
        $scope.$parent.main.h1Title = '서울의 일별 평균 대기오염도';
        vm.checkType = 'NO2';
        vm.checkLabel = '이산화질소';
        vm.sliderVal = 365;
    }

    /**
     * @name chgMapType
     * @description
     *  맵 종류를 선택 한다..
     */
    vm.chgMapType = function(){
        $window.location.href='/#/old/' + vm.mapType;

    }

    /**
     * @name btnSet
     * @description
     *  버튼을 셋팅한다.
     */
    vm.btnSet = function(){
        $timeout(function(){
            $('#control').buttonset();
            $('#chkMapType').buttonset();
        },100);
    }

    /**
     * @name colorTypeChange
     * @description
     *  버튼을 클릭했을때 동작 한다.
     */
    vm.colorTypeChange = function(label){
        vm.checkLabel = label;
        // 각 맵에 이벤트를 보낸다
        $scope.$broadcast('mainToMap', vm.checkType, vm.checkLabel);
        // 테이블 뷰를 셋팅한다.
        $scope.$broadcast('tableUpdate', vm.checkType, vm.checkLabel, vm.sliderVal, vm.dateString );
    }

    /**
     * @name slider
     * @description
     *  슬라이더를 셋팅 한다.
     */
    vm.slider = {
        'options': {
            create: function( event, ui ) {
                makeSliderDates(ParseDataService.getDateArray(vm.sliderVal));
                sliderChangeCb(ui.value);
            },
            change: function(event, ui) {
                sliderChangeCb(ui.value);
            },
            slide: function(event, ui) {
                vm.dateString = ParseDataService.getDateArray(vm.sliderVal)[0];
            },
            start : function (event, ui) {
                if ( isAnimate ) {
                    vm.stop();
                    isAnimate = true;
                }
            },
            stop : function (event, ui) {
                if ( isAnimate ) {
                    vm.play();
                }
            }
        }
    }

    /**
     * @name sliderChangeCb
     * @description
     *  슬라이더 콜백 함수
     */
    function sliderChangeCb() {

        vm.dateString = ParseDataService.getDateArray(vm.sliderVal)[0];

        // 각 맵에 이벤트를 보낸다
        $scope.$broadcast('mainSliderChange', vm.sliderVal, vm.dateString);

        // 테이블 뷰를 셋팅한다.
        $scope.$broadcast('tableUpdate', vm.checkType, vm.checkLabel, vm.sliderVal, vm.dateString );

    }

    /**
     * @name clickSlideButton
     * @description
     *  슬라이더를 범례를 클릭했을 경우 동작 한다.
     */
    vm.clickSlideButton = function(val) {
        vm.sliderVal = val;
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
            if ( vm.sliderVal >= 365 ){
                vm.sliderVal =  0;
            } else {
                vm.sliderVal +=  1;
            }
        }, 500)
    }

    /**
     * @name vm.play
     * @description
     *  지도 재생을 멈춘다..
     */
    vm.stop = function() {
        if ( isAnimate ) {
            $interval.cancel(interval);
            interval = undefined;
            isAnimate = false;
        }
    }

    init();

}

angular.module('AirPollutionApp').controller('oldCtrl', [ '$scope', '$timeout', '$window', '$interval', 'ParseDataService', oldCtrl]);