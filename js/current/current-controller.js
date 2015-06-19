'use strict';


/**
 * Created by shin on 2015-06-11.
 * @name currentCtrl
 * @desc
 *  실시간 대기 환경 컨트롤러
 */

function currentCtrl( $scope, $window, $stateParams, $state, CHART_PRESETS, ParseDataService ) {

    /**
     * variables
     * @type {object} vm : this
     * @type {number} countWeather : 각 지역별 데이터 파싱 카운팅
     * @type {object} weatherDataFin : 각 지역별 데이터 파싱 완료 판단
     */
    var vm = $scope.selectedView = this;
    var countWeather;
    var weatherDataFin;

    /**
     * @type {string} settings.areaData : 구경계 좌표
     * @type {string} settings.buttonList : 대기선택  버튼
     * @type {string} settings.checkType : 선택된 대기
     * @type {function} settings.changeAirType : 대기종류 버튼 클릭 핸들러
     * @type {string} settings.currentDate : 선택된 데이터의 기준날짜
     * @type {string} settings.seoulData : 서울시 데이터
     * @type {string} settings.weatherObj : 날씨 데이터
     * @type {string} settings.viewLabel : 화면 모드
     * @private
     */
    vm.settings = {
        areaData : null,
        buttonList : null,
        changeAirType : null,
        checkType : null,
        currentDate : null,
        seoulData : null,
        weatherObj : null,
        viewLabel : 'current'
    };

    // 상단 네비게이션 설정
    $scope.$parent.root.h1Title = '서울의 실시간 자치구별 대기환경정보';

    /**
     * @name chgMapType
     * @description
     *  맵 종류를 선택 한다..
     */
    vm.chgMapType = function(){
        $state.go('current.' + vm.mapType);
    }


    /**
     *******************************
     *********  functions  *********
     *******************************
     */

    /**
     * @name getSeoulData
     * @description
     *  서울시 데이터를 얻는다.
     */
    function getSeoulData(){

        var promise;

        // 서울시 데이터 를 얻는다.
        promise = ParseDataService.getParseData( CHART_PRESETS.currentSeoulDataUrl );

        // 관측소와 구경계에 대한 데이터를 얻는다.
        promise.then(function ( data ) {

            if ( angular.isDefined(data['ListAirQualityByDistrictService']['row']) ) {

                var tempData = angular.copy(data['ListAirQualityByDistrictService']['row']);

                // 받은 데이터의 날짜를 표시한다.
                setCurrentDate( data['ListAirQualityByDistrictService']['row'][0]['MSRDATE'] );

                // 대기관련 key를 바꾼다.
                for ( var item in tempData ){
                    for ( var value in tempData[item] ) {
                        ParseDataService.editData(tempData[item],value);
                    }
                }

                vm.settings.seoulData = tempData;

                getPolygon( vm.settings.seoulData );

            } else {
                alert(' error!!!! ');
            }

        });

    }

    /**
     * @name setCurrentDate
     * @description
     *  현재 날짜 문자열을 만든다.
     */
    function setCurrentDate (data) {

        var currentDate = '';

        currentDate += data.substr( 0, 4 ) + '.';
        currentDate += data.substr( 4, 2 ) + '.';
        currentDate += data.substr( 6, 2 ) + '(';
        currentDate += data.substr( 8, 2 ) + ':';
        currentDate += data.substr( 10, 2 ) + ') 기준';

        vm.settings.currentDate = currentDate;

    }

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
     * @name getPosition
     * @description
     *  관측소 좌표를 얻는다.
     */
    function getPosition(){

        var promise;

        // 좌표를 얻는다.
        promise = ParseDataService.getParseData( CHART_PRESETS.weatherDataUrl );

        promise.then( function ( data ) {

            // 날씨 아이콘을 띄우기 위한 객체를 생성한다.
            vm.settings.weatherObj = angular.copy(data);
            // 각 지역별 날씨를 파싱하고 완료시점을 체크하기위한 변수.
            countWeather = 0;
            weatherDataFin = false;

            for (var item in vm.settings.weatherObj) {
                // 각 지역별 날씨를 얻는다.
                getWeather(data[item]['kmaPosition'], vm.settings.weatherObj[item]);
            }
        });

    }

    /**
     * @name getWeather
     * @param {object} pos : 기상청 격자 좌표
     * @param {object} obj : 날씨 포지션 객체
     * @description
     *  각 지역별 날씨를 얻는다.
     */
    function getWeather (pos, obj) {

        var promise;

        promise = ParseDataService.getParseWeather( CHART_PRESETS.kmaDataUrl + '?gridx=' + pos[0] + '&gridy=' + pos[1] );

        promise.then( function ( data ) {
            // 얻은 데이터중에 현재 하늘상태를 가져온다.
            var el = angular.element(data).find('body').find('data').find('wfEn')[0];
            var value = angular.element(el).text();
            value = value.toLowerCase().replace(/\s/gi, '').replace(/\//gi, '');
            // 삽입된 데이터 갯수를 늘려준다.
            countWeather++;
            // 각 지역별 날씨를 weatherObj와 합친다.
            makeWeatherObj( obj, value );
        });

    }

    /**
     * @name getWeather
     * @param {object} obj : 날씨 포지션 객체
     * @param {object} value : 날씨 상태
     * @description
     *  각 지역별 날씨를 weatherObj와 합친다.
     */
    function makeWeatherObj ( obj, value ) {

        var level;

        switch ( value ) {
            case 'clear' :
                level = 1;
                break;
            case 'partlycloudy' :
                level = 2;
                break;
            case 'mostlycloudy' :
                level = 3;
                break;
            case 'cloudy' :
                level = 4;
                break;
            case 'rain' :
                level = 5;
                break;
            case 'snowrain' :
                level = 6;
                break;
            case 'snow' :
                level = 6;
                break;
        }

        obj['weather'] = level;

        if ( countWeather >= vm.settings.weatherObj.length ) {
            weatherDataFin = true;
            appStart();
        }

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
                var values = ParseDataService.mergeData( seoulData, data[ 'features' ][item][ 'properties' ][ 'name' ] , 'MSRSTENAME');
                data[ 'features' ][ item ][ 'properties' ][ 'values' ] = values;
            }
            vm.settings.areaData = data;

            appStart();

        });

    }


    /**
     * @name appStart
     * @description
     *  데이터가 모두 셋팅되면 앱을 실행 한다.
     */
    function appStart () {
        if ( vm.settings.seoulData && weatherDataFin && vm.settings.areaData ) {
            defaultSettings();
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
            'PM10' :{'label' : '미세먼지', 'value' : 'PM10', 'id' : 'radio5'},
            'PM25' :{'label' : '초미세먼지', 'value' : 'PM25', 'id' : 'radio6'}
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

        // 날씨데이터를 얻는다.
        getPosition();

    }

    init();

}

angular.module( 'AirPollutionApp' ).controller( 'currentCtrl', [ '$scope', '$window', '$stateParams', '$state', 'CHART_PRESETS', 'ParseDataService', currentCtrl ] );