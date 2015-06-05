'use strict';

/**
 * @ngdoc service
 * @name ParseDataService
 * @returns {Json} 데이터
 * @description
 *  데이터 파싱과 관련된 모든 동작
 */

function ParseDataService($q, $http, $filter, CHART_PRESETS) {

    var service = {};

    /**
     * 외부 데이터 파싱
     * @name service.getParseData
     * @param {string} polygonUrl : 외부데이터 url
     * @returns {promise} : 데이터
     */
    service.getParseData = function (url) {

        var deferred = $q.defer();

        $http.get(url)
            .success(function(data) {
                deferred.resolve(data);
            });

        return deferred.promise;

    }

    /**
     * 실시간 정보 형태 가공
     * @name service.editData
     * @param {string} polygonUrl : 외부데이터 url
     * @returns {promise} : 데이터
     */
    service.editData = function (values,value) {

        var newKey;
        var deleteObj;

        switch (value) {
            case 'NITROGEN' :
                newKey = 'NO2';
                deleteObj = true;
                break;
            case 'OZONE' :
                newKey = 'O3';
                deleteObj = true;
                break;
            case 'CARBON' :
                newKey = 'CO';
                deleteObj = true;
                break;
            case 'SULFUROUS' :
                newKey = 'SO2';
                deleteObj = true;
                break;
            default : newKey = value;
                deleteObj = false;
                break;
        }

        if ( deleteObj ) {
            values[newKey] = angular.copy(values[value]);
            delete(values[value]);
        }

    }

    /**
     * 날씨 데이터 파싱.
     * @name service.getParseWeather
     * @param {string} polygonUrl : 외부데이터 url
     * @returns {promise} : 데이터
     */
    service.getParseWeather = function (url) {

        var deferred = $q.defer();

        $.ajax({
            url: url,
            dataType: "xml",
            type: 'GET',
            success: function(res) {
                // text 얻음
                var myXML = res.responseText;
                // text를 XML데이터로 변환
                var convertedXML = $.parseXML(myXML);

                deferred.resolve(convertedXML);

            }
        });

        return deferred.promise;

    }

    /**
     * 최초 각 구에 해당하는 좌표값 파싱
     * @name service.getMergeData
     * @param {string} polygonUrl : 구경계 좌표 url
     * @returns {promise} : latitude, longitude, name
     */
    service.mergeData = function (a,b,label) {

        var result = {};

        for(var item in a) {

            if(a[item][label] == b){
                result = angular.copy(a[item]);
                break;
            }

        }

        return result;

    }

    /**
     * 날짜를 문자열과 배열로 얻음.
     * @name service.getDateArray
     * @param {string} polygonUrl : 구경계 좌표 url
     * @returns {array} : string, array
     */
    service.getDateArray = function(value){
        var date = [];
        var dateString = '';
        var dateArray = [];

        var todayDate = new Date();
        var previousDay = new Date(todayDate);
        previousDay.setDate(todayDate.getDate()-1);
        var dateObj = new Date(+(previousDay) - (365 - value) * 86400000);

        var year = todayDate.getFullYear();
        var month = todayDate.getMonth() + 1 < 10 ? '0' + (todayDate.getMonth() + 1) : todayDate.getMonth() + 1;
        var date = todayDate.getDate() < 10 ? '0' + todayDate.getDate() : todayDate.getDate();

        dateString = $filter('date')(dateObj, 'yyyyMMdd ');

        date = [dateString,[year, month, date],previousDay];

        return date;

    }

    return service;

}

angular.module('AirPollutionApp').service('ParseDataService', [ '$q', '$http', '$filter', 'CHART_PRESETS', ParseDataService]);

