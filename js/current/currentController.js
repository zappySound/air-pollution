'use strict';

/**
 * @name currentCtrl
 * @desc 서울의 실시간 자치구별 대기환경정보
 */

function currentCtrl( $scope, $timeout, $window ) {

    /**
     * variables
     * @type {object} vm : this
     */
    var vm = this;

    /**
     * @type {string} vm.checkType : 선택된 대기
     * @type {string} vm.checkLabel : 선택된 대기 문자
     * @type {string} vm.currentDate : 선택된 데이터의 기준날짜
     * @private
     */
    vm.checkType;
    vm.checkLabel;
    vm.currentDate

    // 상단 대기 선택 버튼을 만든다.
    vm.buttonList = [
        {'label' : '이산화질소', 'value' : 'NO2', 'id' : 'radio1'},
        {'label' : '오존', 'value' : 'O3', 'id' : 'radio2'},
        {'label' : '일산화탄소', 'value' : 'CO', 'id' : 'radio3'},
        {'label' : '아황산가스', 'value' : 'SO2', 'id' : 'radio4'},
        {'label' : '미세먼지', 'value' : 'PM10', 'id' : 'radio5'},
        {'label' : '초미세먼지', 'value' : 'PM25', 'id' : 'radio6'}
    ];

    // 데이터의 기준날짜를 표시한다.
    $scope.$on( 'setCurrentDate', function( e, data ) {

        var currentDate = '';

        currentDate += data.substr( 0, 4 ) + '.';
        currentDate += data.substr( 4, 2 ) + '.';
        currentDate += data.substr( 6, 2 ) + '(';
        currentDate += data.substr( 8, 2 ) + ':';
        currentDate += data.substr( 10, 2 ) + ') 기준';

        vm.currentDate = currentDate;

    })

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
        $scope.$parent.main.h1Title = '서울의 실시간 자치구별 대기환경정보';
        vm.checkType = 'NO2';
        vm.checkLabel = '이산화질소';
    }

    /**
     * @name chgMapType
     * @description
     *  맵 종류를 선택 한다..
     */
    vm.chgMapType = function(){
        $window.location.href='/#/current/' + vm.mapType;
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
        $scope.$broadcast('tableUpdate', vm.checkType, vm.checkLabel);
    }

    init();

}

angular.module('AirPollutionApp').controller('currentCtrl', [ '$scope', '$timeout', '$window', currentCtrl]);