'use strict';

/**
 * @name currentOpenstreetCtrl
 * @desc openstreet 맵 선택시 동작된다.
 */

function currentOpenstreetCtrl ( $scope, $compile, $stateParams, ParseDataService, CHART_PRESETS ) {

    /**
     * variables
     * @type {object} vm : this
     * @type {number} countWeather : 날씨 데이터 삽입을 위한 카운트
     * @type {number} defaultLatitude : 최초 맵이 가지는 위도
     * @type {number} defaultLongitude : 최초 맵이 가지는 경도
     * @type {number} defaultZoom : 최초 맵이 확대값
     * @type {object} layer : 구경계 그림
     * @type {object} weatherObj : 날씨 표시용 데이터 객체
     */
    var vm = this;
    var countWeather;
    var defaultLatitude;
    var defaultLongitude;
    var defaultZoom;
    var layer;
    var weatherObj;


    /**
     * @type {string} $scope.airLabel : 선택된 대기 문자
     * @type {string} $scope.units : 대기 표시기호
     * @type {string} $scope.infoMsg : 대기 표시기호
     * @type {object} $scope.grades : 선탣된 대기에 대한 범례
     * @type {array} $scope.unitsColor : 범례 색상
     * @$scope
     */
    $scope.airLabel;
    $scope.units;
    $scope.infoMsg;
    $scope.grades;
    $scope.unitsColor = [];


    /**
     * old controller에서 발생한 대기종류 버튼클릭 이벤트를 받는다.
     */
    $scope.$on( 'mainToMap', function ( event, type, label ) {

        //대기종류 변경시 셋팅 후 관련 범례및 범례 색상 설정
        vm.airType = type;
        $scope.airLabel = label;
        $scope.grades = CHART_PRESETS.grades[vm.airType];
        $scope.units = CHART_PRESETS.units[vm.airType];
        $scope.unitsColor = [];
        for(var item in $scope.grades){
            $scope.unitsColor.push(CHART_PRESETS.getColor[vm.airType]($scope.grades[item]));
        }

        // 구 경계 색상 갱신
        makeLayer();

    });

    /**
     *******************************
     *********  functions  *********
     *******************************
     */

    /**
     * @name init
     * @description
     *  최초 셋팅. 지도 타입에 맞춰 지도를 그린다.
     */
    function init() {

        // 최초 셋팅
        defaultLongitude = CHART_PRESETS.defaultMapSetting.longitude;
        defaultLatitude = CHART_PRESETS.defaultMapSetting.latitude;
        defaultZoom = CHART_PRESETS.defaultMapSetting.defaultZoom;

        // 가이드 창의 메세지를 정한다.
        $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;

        // 최초 로딩시에 상단 버튼을 바꿔준다.
        $scope.$parent.current.mapType = 'openstreetmap';

        //최초 로딩시에 대기 종류 셋팅
        if ( !$stateParams.type ){
            vm.airType = $scope.$parent.current.checkType;
        } else {
            $scope.$parent.current.checkType = vm.airType = $stateParams.type;
        }

        // 대기 정보 관련 셋팅
        $scope.airLabel = $scope.$parent.current.checkLabel;
        $scope.grades = CHART_PRESETS.grades[vm.airType];
        $scope.units = CHART_PRESETS.units[vm.airType];
        $scope.unitsColor = [];

        // 범례 색상 셋팅
        for ( var item in $scope.grades ){
            $scope.unitsColor.push(CHART_PRESETS.getColor[vm.airType]($scope.grades[item]));
        }

        // 지도를 셋팅한다.
        window['map'] = vm.map = L.map('map').setView( [ defaultLatitude, defaultLongitude ], defaultZoom );

        // vworld 이미지 사용
        L.tileLayer('http://xdworld.vworld.kr:8080/2d/Satellite/201301/{z}/{x}/{y}.jpeg', {
            attribution: 'Map data &copy; <a href="http://map.vworld.kr">VWORLD</a>',
            maxZoom: 18
        }).addTo(vm.map);

        // 맵에 범례 표시를 띄운다
        makeLegend();

        // 맵에 info 레이어를 띄운다.
        makeInfo();

        // 관측소 좌표를 얻는다.
        getSeoulData();

    }

    /**
     * @name makeLegend
     * @description
     *  지도에 범례를 만든다.
     */
    function makeLegend(){

        var legend = L.control({position: 'bottomright'});
        var map = vm.map;

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            $compile(angular.element(div).attr('legend-directive',''))($scope);
            return div;
        };

        legend.addTo(map);

    }

    /**
     * @name makeLegend
     * @description
     *  지도에 info 레이어를 만든다.
     */
    function makeInfo(){

        var map = vm.map;
        vm.info = L.control();

        vm.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');

            $compile(angular.element(this._div).attr('info-directive',''))($scope);

            return this._div;
        };

        vm.info.update = function (props) {

            if ( props ) {
                // 점검중인지를 판단한다.
                var val = props['properties']['values'][vm.airType];
                val += (val == '점검중') ? '' : $scope.units;

                $scope.infoMsg = ( props['properties']['values']['MSRSTENAME'] + ' : ' + val );

            } else {
                $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;
            }
            $scope.$apply('infoMsg');
        };

        vm.info.addTo(map);

    }

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
            console.log(data)
            // 받은 데이터의 날짜를 표시한다.
            $scope.$emit( 'setCurrentDate', data['ListAirQualityByDistrictService']['row'][0]['MSRDATE']);

            getPosition( data );
            getPolygon( data );
        });

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
            weatherObj = angular.copy(data);
            // 각 지역별 날씨를 파싱하고 완료시점을 체크하기위한 변수.
            countWeather = 0;

            for (var item in weatherObj) {
                // 각 지역별 날씨를 얻는다.
                getWeather(data[item]['kmaPosition'], weatherObj[item]);
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

        if ( countWeather >= weatherObj.length ) {
            // 데이터 가공이 끝나면 마커를 생성 한다.
            makeMarker();
        }

    }

    /**
     * @name makeMarker
     * @description
     *  지도위에 마커를 생성한다.
     */
    function makeMarker () {

        for ( var item in weatherObj ) {
            var level = weatherObj[item]['weather'];
            var img = L.icon({iconUrl: 'img/icon/' + level + '.png'});

            L.marker(
                weatherObj[item]['position'],
                {icon: img}
            ).addTo(map);
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
                var values = ParseDataService.mergeData( seoulData[ 'ListAirQualityByDistrictService' ][ 'row' ], data[ 'features' ][item][ 'properties' ][ 'name' ] , 'MSRSTENAME');

                // 기존의 데이터 형식의 키가 다르므로 기존 로직의 형태와 맞게 데이터를 가공한다.
                for ( var value in values ){
                    ParseDataService.editData(values,value);
                }
                data[ 'features' ][ item ][ 'properties' ][ 'values' ] = values;
            }
            vm.areaData = data;

            //구 경계 색상 갱신
            makeLayer();

        });

    }

    /**
     * @name makeLayer
     * @description
     *  구 경계를 그린 레이어를 띄운다.
     */
    function makeLayer(){

        if ( ! vm.areaData) {
            return;
        }

        if ( vm.map && layer ) {
            vm.map.removeLayer(layer);
        }

        // 구 색상 표시
        function style(feature) {
            return {
                fillColor: CHART_PRESETS.getColor[vm.airType](feature.properties.values[vm.airType]),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        // 각각의 구에 이벤트 등록
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }

        // 구에 마우스 올렸을 때 색상 강조
        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 2,
                color: '#777',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }

            vm.info.update(layer.feature)

        }

        // 구에서 마우스 내렸을 때 색상 복원
        function resetHighlight(e) {
            layer.resetStyle(e.target);
            vm.info.update();
        }

        var zoomToFeature;

        if ('ontouchstart' in window) {
            // 구를 클릭했을 때 확대
            zoomToFeature = function(e) {
                var layer = e.target;

                if (!L.Browser.ie && !L.Browser.opera) {
                    layer.bringToFront();
                }

                info.update(layer.feature.properties);

                vm.map.fitBounds(e.target.getBounds());
            }
        } else {
            // 구를 클릭했을 때 확대
            zoomToFeature = function(e) {
                vm.map.fitBounds(e.target.getBounds());
            }
        }

        layer = L.geoJson(vm.areaData.features, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(vm.map);

    }

    init();

}

angular.module('AirPollutionApp').controller('currentOpenstreetCtrl', [ '$scope', '$compile', '$stateParams', 'ParseDataService', 'CHART_PRESETS', currentOpenstreetCtrl]);