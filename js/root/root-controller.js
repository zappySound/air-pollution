'use strict';


/**
 * Created by shin on 2015-06-11.
 * @name rootCtrl
 * @desc
 *  서울시 대기 데이터 시각화.
 *  서울시 자치구별 대기 환경을 지도와 챠트를 이용해 시각화 한다.
 *  실시간 자치구별 대기환경과, 선택한 날짜에 대한 대기환경을 보여준다.
 */

function rootCtrl($scope) {

    /**
     * variables
     * @type {object} vm : this
     */
    var vm = this;

    /**
     * vm variables
     *
     * @private
     */
    vm.h1Title;

}

angular.module( 'AirPollutionApp' ).controller( 'rootCtrl', [ '$scope', rootCtrl ] );