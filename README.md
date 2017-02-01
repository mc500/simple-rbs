# Simple Meeting Room Booking Overview

이 애플리케이션은 Bluemix Cloudant NoSQL DB service를 이용하여 meeting room에 대한 예약 관리 기능을 REST API로 제공합니다. API Spec은 [swagger-UI](http://swagger.io/swagger-ui/)를 이용하여 Web Browser로 접근 하여 제공하는 기능을 확인이 가능합니다.

<br/>
이 어플리케이션을 블루믹스로 배포합니다.
<br/>
<a href="https://bluemix.net/deploy?repository=https://github.com/mc500/simple-rbs" target="_blank"&gt;&lt;img src="http://bluemix.net/deploy/button.png" alt="Deploy to Bluemix" >

## site

site는 room을 관리하는 단위를 말하며 사무실의 경우 건물을 나타냅니다

## room

room은 site의 하위 정보로 관리되며 예약을 할 수 있는 대상이 됩니다.

## Notes

Spec에 정의된 모든 API가 다 구현되어 있는 것은 아니므로 미구현 API는 별도 tag로 관리되는 내용을 참고 바랍니다.

## License

  This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).