![Alt Text](https://github.com/{user}/{repo}/img/image.gif)

##air-pollution

이 데모는 [서울 열린 데이터 광장](http://data.seoul.go.kr/) 과 [기상청](http://www.kma.go.kr/) 에서 제공하는 Open API 의 데이터를 사용하고,
GOOGLE Map 과 Open Street Map (with leaflet, vworld)이 제공하는 지도를 사용하여 제작 되었습니다.

##제작자
데이터 시각화 및 frontend 전문 개발 회사인 [링크잇](http://www.linkit.kr/) 에서 데모용으로 작업 되었으며,
수정 및 재배포, 상업적 이용등에 자유롭게 사용 하실 수 있습니다.
(챠트개발에 사용된 HIGHCHART는 이 서비스와는 별개로 자체적인 라이센스를 가지고 있으므로 사용시 반드시 라이센스를 확인 후 사용해주시기 바랍니다.)
(외부 데이터 인증키의 경우 현재 작성된 상태로 사용하셔도 무방 하지만 가급적 새로 발급 받아 사용 하시는것을 권장 합니다.)

##빌드

```sh
$ npm install
$ bower install
$ gulp dev
```

##설정

* /js/config.js 에서 값을 변경 할 수 있습니다.
    * currentSeoulDataKey : 실시간 대기환경 api key
    * seoulDataKey : 일별 대기환경 api key
    * defaultMapSetting : 최초 맵 좌표 센터 설정 (초기값 : 서울시)
    * defaultInfoMsg : 우측상단 정보창 메시지
    * currentSeoulDataUrl : 실시간 대기환경 api url
    * seoulDataUrl : 일별 대기환경 api url
    * kmaDataUrl : 기상청 동네예보 api url
    * weatherDataUrl : 각 자치구 좌표
    * observatoryUrl : 관측소 좌표
    * polygonUrl : 자치구 경계 좌표
    * grades : 대기별 범례
    * units : 대기별 단위 기호
    * getColor : 대기별 농도 색상
    * getLevel : 데이터별 단계를 나눔

##화면
* 서울의 실시간 대기 및 날씨 (google map, open street map)
    * url 전달 값 : type (기본값 : NO2)
* 서울의 일별 평균 대기오염도 (google map, open street map)
    * url 전달 값 : date, type (기본값 : 어제 날짜 , NO2)

##폴더 구조

```
├── js                                # 화면을 구성하기위해 작성된 폴더 입니다
│   ├── config.js                     # 각종 설정 파일
│   ├── route.js                      # url 설정 파일
│   ├── controllers                   # 공통 컨트롤러 폴더
│   ├── current                       # 서울의 실시간 대기 및 날씨 관련 폴더
│   ├── directives                    # 공통 디렉티브 폴더
│   ├── old                           # 서울의 일별 평균 대기오염도 폴더
│   ├── services                      # 공통 서비스 폴더
│   ├── views                         # 공통 html 모듈 폴더
├── bower.json                        # bower 세팅
├── gulpfile.js                       # gulp task 정의
├── package.json                      # npm 셋팅
├── index.html                        # root 파일
├── demo-data                         # 좌표 및 폴리곤 데이터 폴더
├── fonts                             # 폰트 폴더
├── img                               # 이미지 폴더
```

