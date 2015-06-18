'use strict';

/**
 * @name currentOpenstreetCtrl
 * @desc openstreet 맵 선택시 동작된다.
 */

function currentOpenstreetCtrl ( $scope, $compile, $stateParams, CHART_PRESETS ) {

    /**
     * variables
     * @type {object} vm : this
     * @type {number} defaultLatitude : 최초 맵이 가지는 위도
     * @type {number} defaultLongitude : 최초 맵이 가지는 경도
     * @type {number} defaultZoom : 최초 맵이 확대값
     * @type {object} layer : 구경계 그림
     */
    var vm = this;
    var defaultLatitude;
    var defaultLongitude;
    var defaultZoom;
    var layer;


    /**
     * @type {object} vm.map : 현재 챠트
     * @type {object} vm.settings : 챠트를 그리기위한 데이터
     * @private
     */
    vm.map;
    vm.settings = $scope.$parent.current.settings;


    /**
     * @type {string} $scope.infoMsg : 대기 표시기호
     * @$scope
     */
    $scope.infoMsg = null;
    $scope.$parent.$watch('current.settings.checkType', function ( value ) {

        // 값이 있고 맵이 있음을 판단.
        if ( value ) {
            if ( !vm.map ) {
                init();
            } else {
                makeLayer();
            }
        }

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
        if ( $stateParams.type ){
            vm.settings.checkType = $stateParams.type;
            vm.settings.changeAirType(vm.settings.buttonList[$stateParams.type].label);
        }

        // 지도를 셋팅한다.
        window['map'] = vm.map = L.map('map',{ zoomControl: false }).setView( [ defaultLatitude, defaultLongitude ], defaultZoom );

        // vworld 이미지 사용
        L.tileLayer('http://xdworld.vworld.kr:8080/2d/Satellite/201301/{z}/{x}/{y}.jpeg', {
            attribution: 'Map data &copy; <a href="http://map.vworld.kr">VWORLD</a>',
            maxZoom: 18
        }).addTo(vm.map);
        new L.Control.Zoom({ position: 'bottomright' }).addTo(vm.map);

        // 맵에 info 레이어를 띄운다.
        makeInfo();

        // 관측소 좌표를 얻는다.
        drawMap();

    }

    /**
     * @name makeInfo
     * @description
     *  지도에 info 레이어를 만든다.
     */
    function makeInfo(){

        var map = vm.map;
        vm.info = L.control({position: 'bottomleft'});

        vm.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');

            $compile(angular.element(this._div).attr('info-directive',''))($scope);

            return this._div;
        };

        vm.info.update = function (props) {

            if ( props ) {
                // 점검중인지를 판단한다.
                var val = props['properties']['values'][vm.settings.checkType];
                val += (val == '점검중') ? '' : vm.settings.units;

                $scope.infoMsg = ( props['properties']['values']['MSRSTENAME'] + ' : ' + val );

            } else {
                $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;
            }
            $scope.$apply('infoMsg');
        };

        vm.info.addTo(map);

    }

    /**
     * @name drawMap
     * @description
     *  서울시 데이터를 얻는다.
     */
    function drawMap(){

        makeMarker();
        makeLayer();

    }

    /**
     * @name makeMarker
     * @description
     *  지도위에 마커를 생성한다.
     */
    function makeMarker () {
        for ( var item in vm.settings.weatherObj ) {
            var level = vm.settings.weatherObj[item]['weather'];
            var img = L.icon({iconUrl: 'img/icon/' + level + '.png'});

            L.marker(
                vm.settings.weatherObj[item]['position'],
                {icon: img}
            ).addTo(map);
        }
    }

    /**
     * @name makeLayer
     * @description
     *  구 경계를 그린 레이어를 띄운다.
     */
    function makeLayer(){

        if ( ! vm.settings.areaData ) {
            return;
        }

        if ( vm.map && layer ) {
            vm.map.removeLayer(layer);
        }

        // 구 색상 표시
        function style(feature) {
            return {
                fillColor: CHART_PRESETS.getColor[vm.settings.checkType](feature.properties.values[vm.settings.checkType]),
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

        layer = L.geoJson(vm.settings.areaData.features, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(vm.map);

    }

}

angular.module('AirPollutionApp').controller('currentOpenstreetCtrl', [ '$scope', '$compile', '$stateParams', 'CHART_PRESETS', currentOpenstreetCtrl]);