'use strict';

/**
 * api 키를 셋팅한다.
 * @type {{currentSeoulDataKey: string, seoulDataKey: string}}
 */
window['APIKKEYS'] = {
    /* 실시간 대기 정보 */
    currentSeoulDataKey : '6173694361796f7535354d6a4e4a69',
    /* 일별 대기 정보 */
    seoulDataKey : '4150495f32303830796f756e6767756b30323132'
}

/**
 * @name CHART_PRESETS
 */

angular.module('AirPollutionApp')
    .constant('CHART_PRESETS',{
        defaultMapSetting : {
            longitude : 127.01,
            latitude : 37.56022,
            defaultZoom : 11
        },
        defaultInfoMsg : '구 위에 마우스를 올려 보세요',
        /* 서울의 실시간 자치구별 대기환경정보 */
        currentSeoulDataUrl : 'http://openAPI.seoul.go.kr:8088/' + APIKKEYS.currentSeoulDataKey + '/json/ListAirQualityByDistrictService/1/100/',
        /* 서울의 일별 평균 대기오염도 */
        seoulDataUrl : 'http://openapi.seoul.go.kr:8088/' + APIKKEYS.seoulDataKey + '/json/DailyAverageAirQuality/1/100/',
        /* 기상청 url */
        kmaDataUrl : 'http://www.kma.go.kr/wid/queryDFS.jsp',
        /* 날씨 좌표 */
        weatherDataUrl : 'demo-data/weatherData.json',
        /* 관측소 좌표 */
        observatoryUrl : 'demo-data/positionData.json',
        /* 폴리곤 좌표 */
        polygonUrl : 'demo-data/seoulDistricts.json',
        grades : {
            'NO2' : ['0', '0.030', '0.060', '0.150', '0.200', '0.600'],
            'O3' : ['0', '0.040', '0.080', '0.120', '0.300', '0.500'],
            'CO' : ['0', '2.00', '9.00', '12.00', '15.00', '30.00'],
            'SO2' : ['0', '0.020', '0.050', '0.100', '0.150', '0.400'],
            'PM10' : ['0', '30', '80', '120', '200', '300'],
            'PM25' : ['0', '30', '80', '120', '200', '300']
        },
        units : {
            'NO2': 'ppm',
            'O3': 'ppm',
            'CO': 'ppm',
            'SO2': 'ppm',
            'PM10': '㎍/㎥',
            'PM25': '㎍/㎥'
        },
        getColor : {
            // 이산화질소농도
            NO2: function(d) {
                d = +(d) + 0.0001;

                return d > 0.60 ? '#B30000' :
                    d > 0.20 ? '#E34A33' :
                        d > 0.15 ? '#FC8D59' :
                            d > 0.06 ? '#FDBB84' :
                                d > 0.03 ? '#FDD49E' :
                                    '#FEF0D9';
            },
            // 오존농도
            O3: function(d) {
                d = +(d) + 0.0001;

                return d > 0.5 ? '#54278F' :
                    d > 0.3 ? '#756BB1' :
                        d > 0.12 ? '#9E9AC8' :
                            d > 0.08 ? '#BCBDDC' :
                                d > 0.04 ? '#DADAEB' :
                                    '#F2F0F7';
            },
            // 일산화탄소농도
            CO: function(d) {
                d = +(d) + 0.0001;

                return d > 30 ? '#993404' :
                    d > 15 ? '#D95F0E' :
                        d > 12 ? '#FE9929' :
                            d > 9 ? '#FEC44F' :
                                d > 2 ? '#FEE391' :
                                    '#FFFFD4';
            },
            // 아황산가스
            SO2: function(d) {
                d = +(d) + 0.0001;

                return d > 0.4 ? '#006D2C' :
                    d > 0.15 ? '#31A354' :
                        d > 0.1 ? '#74C476' :
                            d > 0.05 ? '#A1D99B' :
                                d > 0.02 ? '#C7E9C0' :
                                    '#EDF8E9';
            },
            // 미세먼지
            PM10: function(d) {
                d = +(d) + 0.0001;

                return d > 300 ? '#7A0177' :
                    d > 200 ? '#C51B8A' :
                        d > 120 ? '#F768A1' :
                            d > 80 ? '#FA9FB5' :
                                d > 30 ? '#FCC5C0' :
                                    '#FEEBE2';
            },
            // 초미세먼지
            PM25: function(d) {
                d = +(d) + 0.0001;

                return d > 300 ? '#4ac7c8' :
                    d > 200 ? '#6edaea' :
                        d > 120 ? '#89d7fc' :
                            d > 80 ? '#a7d5fc' :
                                d > 30 ? '#b8d4fb' :
                                    '#e2ecfd';
            }
        }
    });