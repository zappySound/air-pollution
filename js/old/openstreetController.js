'use strict';

/**
 * @name openstreetCtrl
 * @desc openstreet 맵 선택시 동작된다.
 */

function openstreetCtrl($scope, $stateParams, $compile, CHART_PRESETS, ParseDataService) {

    /**
     * variables
     * @type {object} vm : this
     * @type {number} defaultLatitude : 최초 맵이 가지는 위도
     * @type {number} defaultLongitude : 최초 맵이 가지는 경도
     * @type {number} defaultZoom : 최초 맵이 확대값
     * @type {object} layer : 구경계 그림
     * @type {array} makerList : 마커
     */
    var vm = this;
    var defaultLatitude;
    var defaultLongitude;
    var defaultZoom;
    var layer;
    var makerList = [];

    /**
     * @type {string} vm.airType : 선택된 대기
     * @type {string} vm.airLabel : 선택된 대기 문자
     * @type {string} vm.date : 선택된 날짜
     * @type {string} vm.sliderVal : 슬라이더 선택날짜
     * @type {object} vm.areaData : 구 경계와 관련된 데이터
     * @type {object} vm.info : 맵상단 info창
     * @type {object} vm.map : 현재 챠트
     * @type {object} vm.pointData : 관측소와 관련된 데이터
     * @private
     */
    vm.airType;
    vm.date;
    vm.sliderVal;
    vm.areaData;
    vm.info;
    vm.map;
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
    $scope.$on('mainToMap', function (event, type, label) {

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

        // info 레이어 갱신
        vm.info.update();

    });


    /**
     * main controller에서 발생한 슬라이더.
     */
    $scope.$on('mainSliderChange', function (event, sliderVal, dateString ) {
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

        // 최초 셋팅
        defaultLongitude = CHART_PRESETS.defaultMapSetting.longitude;
        defaultLatitude = CHART_PRESETS.defaultMapSetting.latitude;
        defaultZoom = CHART_PRESETS.defaultMapSetting.defaultZoom;

        // 가이드 창의 메세지를 정한다.
        $scope.infoMsg = CHART_PRESETS.defaultInfoMsg;

        // 최초 로딩시에 상단 버튼을 바꿔준다.
        $scope.$parent.old.mapType = 'openstreetmap';

        //최초 로딩시에 대기 종류 셋팅 후 관련 범례및 범례 색상 설정
        if(!$stateParams.type){
            vm.airType = $scope.$parent.old.checkType;
        }else{
            $scope.$parent.old.checkType = vm.airType = $stateParams.type;
        }
        $scope.airLabel = $scope.$parent.old.checkLabel;
        $scope.grades = CHART_PRESETS.grades[vm.airType];
        $scope.units = CHART_PRESETS.units[vm.airType];
        $scope.unitsColor = [];
        for(var item in $scope.grades){
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
                $scope.infoMsg = (props['values']['MSRSTE_NM'] + ' : ' + props['values'][vm.airType] + $scope.units );
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

        //최초 로딩 일경우.
        if(!vm.sliderVal){

            // url 전달값이 있을경우
            if( $stateParams.date ) {

                var  diff;
                var dateArray = ParseDataService.getDateArray(365);
                var year = $stateParams.date.substr(0, 4);
                var month = parseInt($stateParams.date.substr(4, 2))-1;
                var day = $stateParams.date.substr(6, 2);
                vm.date = $stateParams.date;

                // 가장 최신 날짜에서 전달값을 뺀 날짜수 계산
                diff = parseInt((+(dateArray[2]) - +(new Date(year, month, day))) / 86400000, 10);
                diff = 365 - diff;

                // 슬라이더 셋팅 및 현재 날짜 셋팅
                $scope.$parent.old.sliderVal = vm.sliderVal = diff;

            // url 전달 값이 없을경우
            }else{
                // 슬라이더 값을 가져온뒤 현재 날짜 셋팅
                vm.sliderVal = $scope.$parent.old.sliderVal;
                vm.date = ParseDataService.getDateArray(vm.sliderVal)[0];
            }
        }

        // 좌표를 얻는다.
        promise = ParseDataService.getParseData(CHART_PRESETS.seoulDataUrl + vm.date);

        // 관측소와 구경계에 대한 데이터를 얻는다.
        promise.then(function (data) {
            getPosition(data);
            getPolygon(data);
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
                var values = ParseDataService.mergeData(seoulData['DailyAverageAirQuality']['row'],data[item]['name'], 'MSRSTE_NM');
                data[item]['values'] = values;
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
        promise = ParseDataService.getParseData(CHART_PRESETS.polygonUrl);

        // 서울시 데이터와 좌표를 합친다.
        promise.then(function (data) {
            for (var item in data['features']) {
                var values = ParseDataService.mergeData(seoulData['DailyAverageAirQuality']['row'],data['features'][item]['properties']['name'], 'MSRSTE_NM');
                data['features'][item]['values'] = values;
            }
            vm.areaData = data;

            //구 경계 색상 갱신
            makeLayer();

        });

    }

    /**
     * @name makeMarker
     * @description
     *  관측소를 띄운다.
     */
    function makeMarker(){

        // 관측소 정보를 루핑 시킨다.
        for(var marker in vm.pointData){

            // 기존 관측소를 지운다.
            if(makerList[marker]){
                vm.map.removeLayer(makerList[marker]);
            }

            // 각각의 관측소에 대한 정보를 담는다.
            var props = angular.copy(vm.pointData[marker]);
            // ex) 성북구 : 0.053ppm
            var text = props.values['MSRSTE_NM'] +' : '+ props.values[vm.airType] + $scope.units;

            // Define an icon called cssIcon
            var cssIcon = L.divIcon({
                className: 'css-icon'
            });

            // 관측소를 맵에 띄운다.
            makerList[marker] = L.marker([vm.pointData[marker]['latitude'], vm.pointData[marker]['longitude']], {icon: cssIcon}).addTo(vm.map);

            // 관측소의 색상을 지정하고 마우스 오버시에 info창을 갱신할 데이터를 저장한다.
            angular.element(makerList[marker]._icon)
                .css('background',CHART_PRESETS.getColor[vm.airType](vm.pointData[marker].values[vm.airType]))
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

        if ( ! vm.areaData) {
            return;
        }

        if ( vm.map && layer ) {
            vm.map.removeLayer(layer);
        }

        // 구 색상 표시
        function style(feature) {

            return {
                fillColor: CHART_PRESETS.getColor[vm.airType](feature.values[vm.airType]),
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
                console.log(e.target.getBounds());
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

angular.module('AirPollutionApp').controller('openstreetCtrl', openstreetCtrl);