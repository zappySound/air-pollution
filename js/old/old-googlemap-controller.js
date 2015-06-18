'use strict';

/**
 * @name googlemapCtrl
 * @desc googlemap 맵 선택시 동작된다.
 */

function oldGooglemapCtrl($scope, $compile, $stateParams, ParseDataService, CHART_PRESETS) {

    /**
     * variables
     * @type {object} vm : this
     * @type {number} defaultLatitude : 최초 맵이 가지는 위도
     * @type {number} defaultLongitude : 최초 맵이 가지는 경도
     * @type {dom element} mapContainer : 맵 컨테이너
     * @type {number} defaultZoom : 최초 맵이 확대값
     * @type {object} layer : 구경계 그림
     * @type {array} makerList : 마커
     */
    var vm = this;
    var defaultLatitude;
    var defaultLongitude;
    var defaultZoom;
    var mapContainer;
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

    function init(){

        // 최초 구글맵 셋팅 변수
        defaultLongitude = CHART_PRESETS.defaultMapSetting.longitude;
        defaultLatitude = CHART_PRESETS.defaultMapSetting.latitude;
        defaultZoom = CHART_PRESETS.defaultMapSetting.defaultZoom;
        mapContainer = document.getElementById( "map" );

        // 가이드 창의 메세지를 정한다.
        $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;

        // 최초 로딩시에 상단 버튼을 바꿔준다.
        $scope.$parent.old.mapType = 'googlemap';

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

        // 관측소 클릭시 열리는 팝업을 셋팅 한다.
        vm.infoPopup = new google.maps.InfoWindow();

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
        makeLayer();

    }

    /**
     * @name makeLayer
     * @description
     *  구 경계를 그린 레이어를 띄운다.
     */
    function makeLayer (){

        if ( ! vm.settings.areaData) {
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
     * 구글맵에 레이어를 띄우기 위한 객체
     * @constructor
     * @param {Array} 좌표
     * @param {Object} 구글맵
     * @param {Object} 오버레이 id등...
     * @param {Number} 해당 오버레이의 인덱스
     * @constructor
     */
    function CustomMarker ( latlng, map, args ) {

        this.latlng = latlng;
        this.args = args;
        this.setMap( map );

    }

    // 구글맵 오버레이 생성
    CustomMarker.prototype = new google.maps.OverlayView();

    /**
     * 오버레이를 그리는 동작
     */
    CustomMarker.prototype.draw = function () {

        var self = this;
        var div = this.div;
        var args = this.args;

        if ( !div ){
            // 기존에 div가 없다면 생성후 셋팅
            div = this.div = document.createElement( 'DIV' );
            angular.element( div )
                .addClass( 'css_icon gmap' )
                .css( 'position', 'absolute' )
                .on({
                    mouseover : function ( e ) {
                        angular.element(e.target).addClass('active');
                        updateGuide( e, args );
                    },
                    mouseout : function ( e ) {
                        angular.element(e.target).removeClass('active');
                    },
                    click : function ( e ) {
                        vm.infoPopup.setContent(args[ 'MSRSTE_NM' ] + ' : ' + args[ vm.settings.checkType ] + vm.settings.units );
                        vm.infoPopup.open(vm.map,self);
                        e.stopPropagation();
                    }
                });

        }

        angular.element( div ).css( 'background', CHART_PRESETS.getColor[ vm.settings.checkType ]( args[ vm.settings.checkType ] ) );

        if ( this.getPanes() ) {
            var panes = this.getPanes();
            angular.element( panes.overlayImage ).append( div );

            var point = this.getProjection().fromLatLngToDivPixel( this.latlng );
        }

        if (point) {
            angular.element( div ).css({
                'left' : ( point.x - 8 ) + 'px',
                'top'  : ( point.y - 8 ) + 'px'
            });
        }

    };

    CustomMarker.prototype.remove = function () {
        if ( this.div ) {
            this.div.parentNode.removeChild( this.div );
            this.div = null;
        }
    }

    CustomMarker.prototype.getPosition = function () {
        return this.latlng;
    }

    /**
     * @name makeMarker
     * @description
     *  관측소를 띄운다.
     */
    function makeMarker (){

        // 관측소 정보를 루핑 시킨다.
        for ( var marker in vm.settings.pointData ){

            var _selfData = vm.settings.pointData[ marker ];

            // 기존에 관측소가 그려져 있을경우
            if ( makerList[ marker ] ) {
                // 대기 정보만 업데이트 하고 색만 다시 칠한다.
                makerList[ marker ].args = _selfData['properties'][ 'values' ];
                makerList[ marker ].draw();
                // 관측소가 그려져 있지 않을 경우
            } else {
                // 관측소를 새로 그린다.
                makerList[ marker ] = new CustomMarker (
                    new google.maps.LatLng( _selfData[ 'latitude' ], _selfData[ 'longitude' ] ),
                    vm.map,
                    _selfData['properties'][ 'values' ]
                );
            }
        }
    }

    /**
     * @name updateGuide
     * @description
     *  관측소를 클릭시 동작.
     */
    function updateGuide ( e, args ) {

        if( args ) {
            $scope.infoMsg = ( args[ 'MSRSTE_NM' ] + ' : ' + args[ vm.settings.checkType ] + vm.settings.units );
        } else {
            $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;
        }

        $scope.$apply('infoMsg');
    }


    init();

}

angular.module('AirPollutionApp').controller('oldGooglemapCtrl', [ '$scope', '$compile', '$stateParams', 'ParseDataService', 'CHART_PRESETS', oldGooglemapCtrl]);