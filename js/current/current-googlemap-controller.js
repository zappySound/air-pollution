'use strict';

/**
 * @name currentGooglemapCtrl
 * @desc googlemap 맵 선택시 동작된다.
 */

function currentGooglemapCtrl($scope, $compile, $stateParams, CHART_PRESETS) {

    /**
     * variables
     * @type {object} vm : this
     * @type {number} defaultLatitude : 최초 맵이 가지는 위도
     * @type {number} defaultLongitude : 최초 맵이 가지는 경도
     * @type {number} defaultZoom : 최초 맵이 확대값
     * @type {dom element} mapContainer : 맵 컨테이너
     * @type {object} layer : 구경계 그림
     */
    var vm = this;
    var defaultLatitude;
    var defaultLongitude;
    var defaultZoom;
    var mapContainer;
    var layer;


    /**
     * @type {object} vm.settings : 챠트를 그리기위한 데이터
     * @type {object} vm.map : 현재 챠트
     * @private
     */
    vm.map;
    vm.settings = $scope.$parent.current.settings;

    /**
     * @type {string} $scope.infoMsg : 대기 표시기호
     * @$scope
     */
    $scope.infoMsg = null;

    // 선택된 대기가 바뀌었을 경우 동작
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

        // 최초 구글맵 셋팅 변수
        defaultLongitude = CHART_PRESETS.defaultMapSetting.longitude;
        defaultLatitude = CHART_PRESETS.defaultMapSetting.latitude;
        defaultZoom = CHART_PRESETS.defaultMapSetting.defaultZoom;
        mapContainer = document.getElementById( "map" );

        // 가이드 창의 메세지를 정한다.
        $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;

        // 최초 로딩시에 상단 버튼을 바꿔준다.
        $scope.$parent.current.mapType = 'googlemap';

        //최초 로딩시에 대기 종류 셋팅
        if ( $stateParams.type ){
            vm.settings.checkType = $stateParams.type;
            vm.settings.changeAirType(vm.settings.buttonList[$stateParams.type].label);
        }

        // 구글맵을 띄운다.
        var mapOptions = {
            center: new google.maps.LatLng( defaultLatitude, defaultLongitude ),
            zoom: defaultZoom,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHTBOTTOM
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // 맵을 변수에 담는다.
        vm.map = new google.maps.Map( mapContainer, mapOptions );

        // 맵에 상세 정보를 띄운다.
        angular.element( mapContainer ).append($compile('<div info-directive class="info guide gmap"></div>')($scope));

        // 맵을 그린다.
        drawMap();

    }

    /**
     * @name drawMap
     * @description
     *  맵을 그린다.
     */
    function drawMap(){

        makeMarker();
        makeLayer( vm.settings.seoulData );

    }

    /**
     * @name getWeather
     * @param {object} obj : 날씨 포지션 객체
     * @param {object} value : 날씨 상태
     * @description
     *  지도위에 마커를 생성한다.
     */
    function makeMarker () {
        for ( var item in vm.settings.weatherObj ) {

            var latLng = new google.maps.LatLng( vm.settings.weatherObj[item]['position'][0], vm.settings.weatherObj[item]['position'][1] );
            var level = vm.settings.weatherObj[item]['weather'];
            var img = 'img/icon/' + level + '.png';

            new google.maps.Marker({
                position: latLng,
                map: vm.map,
                icon: img
            });

        }
    }

    /**
     * @name makeLayer
     * @description
     *  구 경계를 그린 레이어를 띄운다.
     */
    function makeLayer (){

        if ( ! vm.settings.areaData ) {
            return;
        }

        // 구 색상 표시
        function style ( feature ) {
            return {
                fillColor: CHART_PRESETS.getColor[ vm.settings.checkType ]( feature.A.values[ vm.settings.checkType ] ),
                strokeWeight: 2,
                strokeOpacity: 1,
                strokeColor: 'white',
                fillOpacity: 0.8
            };
        }

        // 구에 마우스 올렸을 때 색상 강조
        function highlightFeature ( e ) {

            var layer = e.feature;

            vm.map.data.overrideStyle( layer, {
                strokeWeight: 2,
                strokeColor: '#777',
                fillOpacity: 0.8,
                zIndex:10
            });

            updateGuide( e, layer.A.values );

        }

        // 구에서 마우스 내렸을 때 색상 복원
        function resetHighlight ( e ) {
            vm.map.data.revertStyle();
            updateGuide( e );
        }

        var zoomToFeature;

        if ( 'ontouchstart' in window ) {
            // 구를 클릭했을 때 확대
            zoomToFeature = function ( e ) {
                var layer = e.target;

                if ( !L.Browser.ie && !L.Browser.opera ) {
                    layer.bringToFront();
                }

                info.update( layer.feature.properties );

                vm.map.fitBounds( e.target.getBounds() );
            }
        } else {
            // 구를 클릭했을 때 확대
            zoomToFeature = function ( e ) {

                var bounds = new google.maps.LatLngBounds();
                var northEast = new google.maps.LatLng( e.feature.A.bounds[0][0], e.feature.A.bounds[0][1] );
                var southWest = new google.maps.LatLng( e.feature.A.bounds[1][0], e.feature.A.bounds[1][1] );

                bounds.extend( northEast );
                bounds.extend( southWest );
                vm.map.fitBounds( bounds );
            }
        }

        // 기존에 구경계가 있을경우
        if ( vm.map && layer ) {
            // 대기 수치만 업데이트 한다.
            vm.map.data.forEach ( function ( feature ) {
                for ( var value in vm.settings.areaData.features ) {
                    if ( feature.A.name == vm.settings.areaData.features[ value ].properties.name ) {
                        feature.A[ 'values' ] = vm.settings.areaData.features[value].properties[ 'values' ];
                    }
                }
            });
            // 구 경계가 없을 경우
        } else {
            // 구경계를 새로 그리고 이벤트등을 등록 한다.
            layer = vm.map.data.addGeoJson( vm.settings.areaData );
            vm.map.data.addListener( 'mouseover', highlightFeature );
            vm.map.data.addListener( 'mouseout', resetHighlight );
            vm.map.data.addListener( 'click', zoomToFeature );
        }

        vm.map.data.setStyle( style );

    }

    /**
     * @name updateGuide
     * @description
     *  관측소를 클릭시 동작.
     */
    function updateGuide ( e, args ) {
        if( args ) {
            // 점검중인지를 판단한다.
            var val = args[ vm.settings.checkType ];
            val += (val == '점검중') ? '' : vm.settings.units;

            $scope.infoMsg = ( args[ 'MSRSTENAME' ] + ' : ' + val );

        } else {
            $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;
        }

        $scope.$apply('infoMsg');
    }

}

angular.module('AirPollutionApp').controller('currentGooglemapCtrl', [ '$scope', '$compile', '$stateParams', 'CHART_PRESETS', currentGooglemapCtrl]);