'use strict';

/**
 * Created by shin on 2015-06-11.
 * @ngdoc directive
 * @name headerDirective
 * @description
 *  상단 네비게이션을 구성한다.
 *  동작은 모두 rootCtrl의 변수를 조작 한다.
 */

angular.module('AirPollutionApp')
    .directive('headerDirective', function() {

        function controller ( $scope ) {

            /**
             * variables
             * @type {object} vm : this
             */
            var vm = this;

            /**
             * vm variables
             * @type {array} navList : 네비게이션 아이템
             * @type {boolean} navShow : 네비게이션 컨트롤
             * @private
             */
            vm.navList;
            vm.navShow = false;
            vm.navButtonMSg = '메뉴열기 ▼';


            /**
             *******************************
             *********  functions  *********
             *******************************
             */

            /**
             * @name navClick
             * @description
             *  네비게이션 클릭 핸들러
             */
            vm.navClick = function(item) {
                $scope.root.h1Title = item;
                vm.navShow = false;
                vm.navButtonMSg = '메뉴열기 ▼';
            }

            /**
             * @name navClick
             * @description
             *  네비게이션 클릭 핸들러
             */
            vm.navButtonClick = function () {

                if ( vm.navShow ) {
                    vm.navShow = false;
                    vm.navButtonMSg = '메뉴열기 ▼';
                } else {
                    vm.navShow = true;
                    vm.navButtonMSg = '메뉴닫기 ▲';
                }

            }

            /**
             * @name init
             * @description
             *  최초로딩시 기본값을 설정 한다.
             */
            function init () {
                $scope.root.h1Title = '서울의 실시간 자치구별 대기환경정보';
                vm.navList = [
                    { 'label' : '서울의 실시간 자치구별 대기환경정보', 'link' : 'current.googlemap' },
                    { 'label' : '서울의 일별 평균 대기오염도', 'link' : 'old.googlemap' }
                ];
            }

            init ();

        }

        return {
            replace : true,
            templateUrl : 'js/views/header.html',
            controller : [ '$scope', controller ],
            controllerAs : 'header'
        }
    });