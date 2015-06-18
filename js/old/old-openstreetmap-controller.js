'use strict';

/**
 * @name oldOpenstreetCtrl
 * @desc openstreet 맵 선택시 동작된다.
 */

function oldOpenstreetCtrl ( $scope, $compile, $stateParams, CHART_PRESETS ) {

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
    var makerList = [];


    /**
     * @type {object} vm.map : 현재 챠트
     * @type {object} vm.settings : 챠트를 그리기위한 데이터
     * @private
     */
    vm.map;
    vm.settings = $scope.$parent.old.settings;


    /**
     * @type {string} $scope.infoMsg : 대기 표시기호
     * @$scope
     */
    $scope.infoMsg = null;

    // 대기 종류가 바뀌었을때 동작 한다.
    $scope.$parent.$watch('old.settings.checkType', function ( value ) {

        // 값이 있고 맵이 있음을 판단.
        if ( value ) {
            if ( !vm.map ) {
                init();
            } else {
                drawMap();
            }
        }

    });

    // 날짜가 바뀌었을때 동작 한다.
    $scope.$on('oldChangDate', function () {
        drawMap();
    });

    // 화면 로딩이 끝났을경우 동작한다. (주소 전달값 전달)
    $scope.$emit('maploading', $stateParams.date );


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
        $scope.$parent.old.mapType = 'openstreetmap';

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

        // 맵을 그린다.
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

                $scope.infoMsg = ( props['properties']['values']['MSRSTE_NM'] + ' : ' + val );

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
     *  맵을 그린다.
     */
    function drawMap(){

        makeMarker();
        makeLayer();

    }

    /**
     * @name makeMarker
     * @description
     *  관측소를 띄운다.
     */
    function makeMarker(){

        // 관측소 정보를 루핑 시킨다.
        for(var marker in vm.settings.pointData){

            // 기존 관측소를 지운다.
            if(makerList[marker]){
                vm.map.removeLayer(makerList[marker]);
            }

            // 각각의 관측소에 대한 정보를 담는다.
            var props = angular.copy(vm.settings.pointData[marker]);
            // ex) 성북구 : 0.053ppm
            var text = props.properties.values['MSRSTE_NM'] +' : '+ props.properties.values[vm.settings.checkType] + vm.settings.units;

            // Define an icon called cssIcon
            var cssIcon = L.divIcon({
                className: 'css_icon'
            });

            // 관측소를 맵에 띄운다.
            makerList[marker] = L.marker([vm.settings.pointData[marker]['latitude'], vm.settings.pointData[marker]['longitude']], {icon: cssIcon}).addTo(vm.map);

            // 관측소의 색상을 지정하고 마우스 오버시에 info창을 갱신할 데이터를 저장한다.
            angular.element(makerList[marker]._icon)
                .css('background',CHART_PRESETS.getColor[vm.settings.checkType](vm.settings.pointData[marker].properties.values[vm.settings.checkType]))
                .data('props',props);

            makerList[marker].bindPopup(text);

            makerList[marker].on({
                click : function(e) {
                    this.openPopup();
                },
                mouseover : function(e){
                    vm.info.update(angular.element(e.target._icon).data('props'));
                    angular.element(e.target._icon).addClass('active');
                },
                mouseout : function (e) {
                    angular.element(e.target._icon).removeClass('active');
                }
            })

        }
    }

    /**
     * @name makeLayer
     * @description
     *  구 경계를 그린 레이어를 띄운다.
     */
    function makeLayer(){

        if ( ! vm.settings.areaData) {
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

angular.module('AirPollutionApp').controller('oldOpenstreetCtrl', [ '$scope', '$compile', '$stateParams', 'CHART_PRESETS', oldOpenstreetCtrl]);