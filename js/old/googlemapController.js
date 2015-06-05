'use strict';

/**
 * @name googlemapCtrl
 * @desc googlemap 맵 선택시 동작된다.
 */

function googlemapCtrl($scope, $compile, $stateParams, ParseDataService, CHART_PRESETS) {

    /**
     * variables
     * @type {object} vm : this
     * @type {number} defaultLatitude : 최초 맵이 가지는 위도
     * @type {number} defaultLongitude : 최초 맵이 가지는 경도
     * @type {number} defaultZoom : 최초 맵이 확대값
     * @type {dom element} mapContainer : 맵 컨테이너
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
     * @type {string} vm.airType : 선택된 대기
     * @type {string} vm.date : 선택된 날짜
     * @type {string} vm.sliderVal : 슬라이더 선택날짜
     * @type {object} vm.areaData : 구 경계와 관련된 데이터
     * @type {object} vm.info : 맵상단 info창
     * @type {object} vm.map : 현재 챠트
     * @type {object} vm.infoPopup : 관측소 클릭시 열리는 팝업
     * @type {object} vm.pointData : 관측소와 관련된 데이터
     * @private
     */
    vm.date;
    vm.sliderVal;
    vm.areaData;
    vm.info;
    vm.map;
    vm.infoPopup;
    vm.pointData;

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

        // 마커 갱신
        makeMarker();

        // 구 경계 색상 갱신
        makeLayer();

    });

    /**
     * old controller에서 발생한 슬라이더.
     */
    $scope.$on( 'mainSliderChange', function ( event, sliderVal, dateString ) {
        vm.sliderVal = sliderVal;
        vm.date = dateString;
        getSeoulData();
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
        if ( !$stateParams.type ){
            vm.airType = $scope.$parent.old.checkType;
        } else {
            $scope.$parent.old.checkType = vm.airType = $stateParams.type;
        }

        // 대기 정보 관련 셋팅
        $scope.airLabel = $scope.$parent.old.checkLabel;
        $scope.grades = CHART_PRESETS.grades[vm.airType];
        $scope.units = CHART_PRESETS.units[vm.airType];
        $scope.unitsColor = [];

        // 범례 색상 셋팅
        for ( var item in $scope.grades ){
            $scope.unitsColor.push(CHART_PRESETS.getColor[vm.airType]($scope.grades[item]));
        }

        // 구글맵을 띄운다.
        var mapOptions = {
            center: new google.maps.LatLng( defaultLatitude, defaultLongitude ),
            zoom: defaultZoom,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // 맵을 변수에 담는다.
        vm.map = new google.maps.Map( mapContainer, mapOptions );

        // 관측소 클릭시 열리는 팝업을 셋팅 한다.
        vm.infoPopup = new google.maps.InfoWindow();

        // 맵에 범례 표시를 띄운다.
        angular.element( mapContainer ).append($compile('<div legend-directive class="info legend gmap"></div>')($scope));

        // 맵에 상세 정보를 띄운다.
        angular.element( mapContainer ).append($compile('<div info-directive class="info guide gmap"></div>')($scope));

        // 서울 열린 데이터 광장의 데이터를 얻는다.
        getSeoulData();

    }

    /**
     * @name getSeoulData
     * @description
     *  서울시 데이터를 얻는다.
     */
    function getSeoulData(){

        var promise;

        //최초 로딩 일경우.
        if ( !vm.sliderVal ){

            // url 전달값이 있을경우
            if ( $stateParams.date ) {

                var  diff;
                var dateArray = ParseDataService.getDateArray( 365 );
                var year = $stateParams.date.substr( 0, 4 );
                var month = parseInt( $stateParams.date.substr( 4, 2 ) )-1;
                var day = $stateParams.date.substr( 6, 2 );
                vm.date = $stateParams.date;

                // 가장 최신 날짜에서 전달값을 뺀 날짜수 계산
                diff = parseInt( ( + ( dateArray[2] ) - +( new Date( year, month, day ) ) ) / 86400000, 10 );
                diff = 365 - diff;

                // 슬라이더 셋팅 및 현재 날짜 셋팅
                $scope.$parent.old.sliderVal = vm.sliderVal = diff;

            // url 전달 값이 없을경우
            } else {
                // 슬라이더 값을 가져온뒤 현재 날짜 셋팅
                vm.sliderVal = $scope.$parent.old.sliderVal;
                vm.date = ParseDataService.getDateArray( vm.sliderVal )[0];
            }

        }

        // 서울시 데이터 를 얻는다.
        promise = ParseDataService.getParseData( CHART_PRESETS.seoulDataUrl + vm.date );

        // 관측소와 구경계에 대한 데이터를 얻는다.
        promise.then(function ( data ) {
            getPosition( data );
            getPolygon( data );
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
        promise = ParseDataService.getParseData( CHART_PRESETS.observatoryUrl );

        // 서울시 데이터와 좌표를 합친다.
        promise.then( function ( data ) {
            for ( var item in data ) {
                var values = ParseDataService.mergeData( seoulData['DailyAverageAirQuality']['row'], data[item]['name'], 'MSRSTE_NM' );
                data[ item ][ 'values' ] = values;
            }
            vm.pointData = data;
            makeMarker();
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
                var values = ParseDataService.mergeData( seoulData[ 'DailyAverageAirQuality' ][ 'row' ], data[ 'features' ][item][ 'properties' ][ 'name' ], 'MSRSTE_NM' );
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
    function makeLayer (){

        if ( ! vm.areaData) {
            return;
        }

        // 구 색상 표시
        function style ( feature ) {
            return {
                fillColor: CHART_PRESETS.getColor[ vm.airType ]( feature.A.values[ vm.airType ] ),
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
                for ( var value in vm.areaData.features ) {
                    if ( feature.A.name == vm.areaData.features[ value ].properties.name ) {
                        feature.A[ 'values' ] = vm.areaData.features[value].properties[ 'values' ];
                    }
                }
            });
        // 구 경계가 없을 경우
        } else {
            // 구경계를 새로 그리고 이벤트등을 등록 한다.
            layer = vm.map.data.addGeoJson( vm.areaData );
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
                .addClass( 'css-icon gmap' )
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
                        vm.infoPopup.setContent(args[ 'MSRSTE_NM' ] + ' : ' + args[ vm.airType ] + $scope.units );
                        vm.infoPopup.open(vm.map,self);
                        e.stopPropagation();
                    }
                });

            angular.element( div ).css( 'background', CHART_PRESETS.getColor[ vm.airType ]( args[ vm.airType ] ) );

        }

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
        for ( var marker in vm.pointData ){

            var _selfData = vm.pointData[ marker ];

            // 기존에 관측소가 그려져 있을경우
            if ( makerList[ marker ] ) {
                // 대기 정보만 업데이트 하고 색만 다시 칠한다.
                makerList[ marker ].args = _selfData[ 'values' ];
                makerList[ marker ].draw();
            // 관측소가 그려져 있지 않을 경우
            } else {
                // 관측소를 새로 그린다.
                makerList[ marker ] = new CustomMarker (
                    new google.maps.LatLng( _selfData[ 'latitude' ], _selfData[ 'longitude' ] ),
                    vm.map,
                    _selfData[ 'values' ]
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
            $scope.infoMsg = ( args[ 'MSRSTE_NM' ] + ' : ' + args[ vm.airType ] + $scope.units );
        } else {
            $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;
        }

        $scope.$apply('infoMsg');
    }


    init();

}

angular.module('AirPollutionApp').controller('googlemapCtrl', [ '$scope', '$compile', '$stateParams', 'ParseDataService', 'CHART_PRESETS', googlemapCtrl]);