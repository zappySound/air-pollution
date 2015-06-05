'use strict';

/**
 * @name rootCtrl
 * @desc
 *  서울시 대기 데이터 시각화.
 */

function rootCtrl($scope) {

    var vm = this;

    vm.h1Title = '서울의 실시간 자치구별 대기환경정보';
    vm.currentDate;

    vm.navList = [
        { 'label' : '서울의 실시간 자치구별 대기환경정보', 'link' : 'current.googlemap' },
        { 'label' : '서울의 일별 평균 대기오염도', 'link' : 'old.googlemap' }
    ];

    vm.navShow = false;

    vm.navClick = function(item) {
        vm.h1Title = item;
        vm.navShow = false;
    }

}

angular.module('AirPollutionApp').controller('rootCtrl', rootCtrl);