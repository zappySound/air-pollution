'use strict';


/**
 * Created by shin on 2015-06-11.
 * @name oldCtrl
 * @desc
 *  일별 평균 대기 오염도
 */

function oldCtrl( $scope, $window, CHART_PRESETS, ParseDataService ) {

    /**
     * variables
     * @type {object} vm : this
     * @type {object} defaultRender : 화면이 최초에 그려지는지 확인.
     * @type {object} appCount : 맵에 이벤트 전달전 데이터가 모두 갱신되었는지 확인.
     */
    var vm = $scope.selectedView = this;
    var defaultRender = true;
    var appCount = 0;

    /**
     * @type {string} settings.areaData : 구경계 좌표
     * @type {string} settings.buttonList : 대기선택  버튼
     * @type {string} settings.checkType : 선택된 대기
     * @type {function} settings.changeAirType : 대기종류 버튼 클릭 핸들러
     * @type {string} settings.currentDate : 선택된 데이터의 기준날짜
     * @type {string} settings.dateString : 선택된 날짜 문자열
     * @type {string} settings.pointData : 관측소 좌표
     * @type {string} settings.seoulData : 서울시 데이터
     * @type {string} settings.sliderVal : 날짜 슬라이더 값
     * @type {string} settings.viewLabel : 화면 모드
     * @private
     */
    vm.settings = {
        areaData : null,
        buttonList : null,
        checkType : null,
        changeAirType : null,
        currentDate : null,
        dateString : null,
        pointData : null,
        seoulData : null,
        sliderVal : 365,
        viewLabel : 'old'
    };

    // 상단 네비게이션 설정
    $scope.$parent.root.h1Title = '서울의 일별 평균 대기오염도';

    /**
     * @name chgMapType
     * @description
     *  맵 종류를 선택 한다.
     */
    vm.chgMapType = function(){
        $window.location.href='/#/old/' + vm.mapType;
    }

    /**
     * 날짜슬라이더 값이 변경 했을경우 동작한다.
     *  (서울시 데이터 갱신)
     */
    $scope.$on('changeDate', function( e, value ){
        vm.settings.dateString = ParseDataService.getDateArray(vm.settings.sliderVal)[0];
        getSeoulData();
    });

    /**
     * 날짜슬라이더 값이 변경 했을경우 동작한다.
     *  (서울시 현재날짜 문자열 갱신)
     */
    $scope.$watch('selectedView.settings.sliderVal', function( value ){
        vm.settings.dateString = ParseDataService.getDateArray(value)[0];
    });

    /**
     * 맵 화면이 로딩되었을경우 동작한다.
     *  (주소 전달값에 날짜 관련 값이 있을경우를 판단함.)
     */
    $scope.$on('maploading',function(e, value) {
        if ( value ) {
            var sliderVal = ParseDataService.getDateValue(value);
            if( sliderVal ) {
                vm.settings.sliderVal = sliderVal;
                vm.settings.dateString = value;
            }
        } else {
            vm.settings.dateString = ParseDataService.getDateArray(vm.settings.sliderVal)[0];
        }
        init();
    })

    /**
     *******************************
     *********  functions  *********
     *******************************
     */

    /**
     * @name changeAirType
     * @param {string} 선택된 대기 문자열
     * @description
     *  대기 버튼 클릭시 동작.
     */
    vm.settings.changeAirType = function (label) {

        // 화면 갱신
        vm.settings.checkLabel = label;
        vm.settings.grades = CHART_PRESETS.grades[vm.settings.checkType];
        vm.settings.units = CHART_PRESETS.units[vm.settings.checkType];
        vm.settings.unitsColor = [];

        // 범례 색상 셋팅
        for ( var item in vm.settings.grades ){
            vm.settings.unitsColor.push(CHART_PRESETS.getColor[vm.settings.checkType](vm.settings.grades[item]));
        }

    }

    /**
     * @name getSeoulData
     * @description
     *  서울시 데이터를 얻는다.
     */
    function getSeoulData(){

        var promise;

        if ( !vm.settings.dateString ) {

        }

        // 서울시 데이터 를 얻는다.
        promise = ParseDataService.getParseData( CHART_PRESETS.seoulDataUrl + vm.settings.dateString );

        // 관측소와 구경계에 대한 데이터를 얻는다.
        promise.then(function ( data ) {

            if ( data['DailyAverageAirQuality'] && data['DailyAverageAirQuality']['row'] ) {

                var tempData = angular.copy(data['DailyAverageAirQuality']['row']);

                appCount++;
                vm.settings.seoulData = tempData;

                getPolygon( tempData );
                getPosition( tempData );

            } else {
                alert(' error!!!! ');
            }

        });

    }

    /**
     * @name getPolygon
     * @param {object} position : this
     * @description
     *  구경계에 대한 좌표를 얻고 그린다.
     */
    function getPolygon( seoulData ) {

        var promise;

        // 구 경계를 그리기 위한 좌표를 얻는다.
        promise = ParseDataService.getParseData( CHART_PRESETS.polygonUrl );

        // 서울시 데이터와 좌표를 합친다.
        promise.then(function ( data ) {
            for ( var item in data[ 'features' ] ) {
                var values = ParseDataService.mergeData( seoulData, data[ 'features' ][item][ 'properties' ][ 'name' ] , 'MSRSTE_NM');
                data[ 'features' ][ item ][ 'properties' ][ 'values' ] = values;
            }
            vm.settings.areaData = data;
            appCount++;
            appStart();
        });

    }

    /**
     * @name getPosition
     * @description
     *  관측소 좌표를 얻는다.
     */
    function getPosition( seoulData ){

        var promise;

        // 좌표를 얻는다.
        promise = ParseDataService.getParseData(CHART_PRESETS.observatoryUrl);

        // 서울시 데이터와 좌표를 합친다.
        promise.then(function (data) {
            for (var item in data) {
                var values = ParseDataService.mergeData(seoulData,data[item]['name'], 'MSRSTE_NM');
                data[item]['properties'] = {'values' : values};
            }
            vm.settings.pointData = data;
            appCount++;
            appStart();
        });

    }

    /**
     * @name appStart
     * @description
     *  데이터가 모두 셋팅되면 앱을 실행 한다.
     */
    function appStart () {
        if ( appCount >= 3 ) {
            if ( defaultRender ) {
                defaultSettings();
                defaultRender = false;
            } else {
                $scope.$broadcast( 'oldChangDate', vm.settings.seoulData );
            }
            appCount = 0;
        }
    }

    /**
     * @name defaultSettings
     * @description
     *  최초 대기 종류 및 날짜를 셋팅한다.
     */
    function defaultSettings () {

        // 대기 정보 관련 셋팅
        vm.settings.checkType = 'NO2';
        vm.settings.changeAirType('이산화질소');
        vm.settings.buttonList = {
            'NO2' : {'label' : '이산화질소', 'value' : 'NO2', 'id' : 'radio1'},
            'O3' :{'label' : '오존', 'value' : 'O3', 'id' : 'radio2'},
            'CO' :{'label' : '일산화탄소', 'value' : 'CO', 'id' : 'radio3'},
            'SO2' :{'label' : '아황산가스', 'value' : 'SO2', 'id' : 'radio4'},
            'PM10' :{'label' : '미세먼지', 'value' : 'PM10', 'id' : 'radio5'}
        };

    }

    /**
     * @name init
     * @description
     *  최초 화면 구성을 위한 데이터를 얻는다.
     */
    function init () {

        // 서울시 데이터를 얻는다.
        getSeoulData();

    }

}

angular.module( 'AirPollutionApp' ).controller( 'oldCtrl', [ '$scope', '$window', 'CHART_PRESETS', 'ParseDataService', oldCtrl ] );