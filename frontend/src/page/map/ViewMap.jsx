import React, { useEffect, useState } from "react";
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  ZoomControl,
} from "react-kakao-maps-sdk";
import "./ViewMap.css";
import { Box, Input, ListRoot, Stack } from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { Button } from "../../components/ui/button.jsx";

function ViewMap() {
  const [map, setMap] = useState(null);
  const [info, setInfo] = useState();
  const [markers, setMarkers] = useState([]);
  const [markerPosition, setMarkerPosition] = useState({});
  const [locationName, setLocationName] = useState("");
  const [markerOpen, setMarkerOpen] = useState(false);
  const [customOverlay, setCustomOverlay] = useState(null);
  const [overlayMarkers, setOverlayMarkers] = useState([]);
  const [currCategory, setCurrCategory] = useState("");
  var contentNode = document.createElement("div");
  useEffect(() => {
    // 아무것도 안할때의 이벤트 추가해놓기

    contentNode.className = "placeinfo_wrap";
    // 커스텀 오버레이의 컨텐츠 노드에 mousedown, touchstart 이벤트가 발생했을때
    // 지도 객체에 이벤트가 전달되지 않도록 이벤트 핸들러로 kakao.maps.event.preventMap 메소드를 등록합니다
    addEventHandle(contentNode, "mousedown", kakao.maps.event.preventMap);
    addEventHandle(contentNode, "touchstart", kakao.maps.event.preventMap);
    // customOverlay.setContent(contentNode);
    // 카테고리 이벤트 추가
    addCategoryClickEvent();
  }, []);

  function addEventHandle(target, type, callback) {
    if (target.addEventListener) {
      target.addEventListener(type, callback);
    } else {
      target.attachEvent("on" + type, callback);
    }
  }

  const handleSearch = () => {
    if (!map) return;
    const ps = new kakao.maps.services.Places(map);

    ps.keywordSearch(locationName, (data, status, _pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        const bounds = new kakao.maps.LatLngBounds();

        // 마커에 데이터 넣는 코드
        let markers = [];
        var listEl = document.getElementById("placeList"),
          menuEl = document.getElementById("menu_wrap"),
          fragment = document.createDocumentFragment(),
          listStr = "";

        // 검색 버튼 클릭시 , 기존창 지워야 함
        removeAllChildNods(listEl);

        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          markers.push({
            position: {
              lat: data[i].y,
              lng: data[i].x,
            },
            content: data[i].place_name,
          });
          //데이터 리스트에 집어 넣는 함수
          var itemEl = getItem(i, data[i]);

          // @ts-ignore
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));

          fragment.appendChild(itemEl);
        }
        setMarkers(markers);
        // 마커 밑 info  끝

        listEl.appendChild(fragment);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
        // customOverlay.setPosition(bounds);
        // console.log(bounds);
        displayPagination(_pagination);
      }
    });
  };

  function getItem(index, data) {
    // 호출 되면 ,  docu 하나 만듬 li 태그 가지는
    //   거기에   li태그 만들어질 str 을 작성하고
    //    클래스 네임 주고 반환
    var el = document.createElement("li"),
      itemStr =
        '<span class="markerbg marker_' +
        (index + 1) +
        '"></span>' +
        '<div class="info">' +
        "   <h5>" +
        data.place_name +
        "</h5>";

    if (data.road_address_name) {
      itemStr +=
        "    <span>" +
        data.road_address_name +
        "</span>" +
        '   <span class="jibun gray">' +
        data.address_name +
        "</span>";
    } else {
      itemStr += "    <span>" + data.address_name + "</span>";
    }

    itemStr += '  <span class="tel">' + data.phone + "</span>" + "</div>";

    el.innerHTML = itemStr;

    return el;
  }

  const handleMapClick = (_target, mouseEvent) => {
    // mouseEvent 객체에서 latLng 가져오기
    const clickedPosition = mouseEvent.latLng;
    setMarkerPosition({
      lat: clickedPosition.getLat(),
      lng: clickedPosition.getLng(),
    });
  };

  function displayPagination(pagination) {
    var paginationEl = document.getElementById("pagination"),
      fragment = document.createDocumentFragment(),
      i;

    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
      paginationEl.removeChild(paginationEl.lastChild);
    }

    for (i = 1; i <= pagination.last; i++) {
      var el = document.createElement("a");
      el.href = "#";
      el.innerHTML = i;

      if (i === pagination.current) {
        el.className = "on";
      } else {
        el.onclick = (function (i) {
          return function () {
            pagination.gotoPage(i);
          };
        })(i);
      }

      fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
  }

  // 검색시 리스트 초기화 후 붙이기
  function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
      el.removeChild(el.lastChild);
    }
  }

  function addCategoryClickEvent() {
    var category = document.getElementById("category"),
      children = category.children;

    for (var i = 0; i < children.length; i++) {
      children[i].onclick = onClickCategory;
    }
  }

  function onClickCategory() {
    var id = this.id,
      className = this.className;
    console.log(id);

    // Todo 이거 어케 건드리지 ..
    // customOverlay.setMap(null);
    // 켜져있으면  끄고 카테고리 변경
    if (className === "on") {
      setCurrCategory("");
      changeCategoryClass();
      removeMarker();
    } else {
      console.log("실행 전", currCategory);
      console.log(id);
      setCurrCategory(id);
      console.log("실행 후", currCategory);
      changeCategoryClass(this);
      //  이거 흠
      searchCategoryPlaces();
    }
  }

  // 클릭된 카테고리에만 클릭된 스타일을 적용하는 함수입니다
  function changeCategoryClass(el) {
    var category = document.getElementById("category"),
      children = category.children,
      i;

    for (i = 0; i < children.length; i++) {
      children[i].className = "";
    }
    // 자기 자신의 클래스 네임 on > csss 변경
    if (el) {
      el.className = "on";
    }
  }

  // 카테고리 검색을 요청하는 함수입니다
  function searchCategoryPlaces() {
    console.log(currCategory, "1");
    if (!currCategory) {
      return;
    }

    const ps = new kakao.maps.services.Places(map);
    // 커스텀 오버레이를 숨깁니다

    customOverlay.setMap(null);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    ps.categorySearch(currCategory, placesSearchCB, { useMapBounds: true });
  }

  function placesSearchCB(data, status, pagination) {
    console.log("실행 확인");
    if (status === kakao.maps.services.Status.OK) {
      // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
      console.log(" displayPlaces 실행 전");
      displayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      // 검색결과가 없는경우 해야할 처리가 있다면 이곳에 작성해 주세요
      alert("검색 결과 x");
    } else if (status === kakao.maps.services.Status.ERROR) {
      // 에러로 인해 검색결과가 나오지 않은 경우 해야할 처리가 있다면 이곳에 작성해 주세요
      alert("에러 발생");
    }
    console.log("끝");
  }

  function displayPlaces(places) {
    console.log(places);
    // 몇번째 카테고리가 선택되어 있는지 얻어옵니다
    // 이 순서는 스프라이트 이미지에서의 위치를 계산하는데 사용됩니다
    var order = document
      .getElementById(currCategory)
      .getAttribute("data-order");

    for (var i = 0; i < places.length; i++) {
      // 마커를 생성하고 지도에 표시합니다
      var marker = addMarker(
        new kakao.maps.LatLng(places[i].y, places[i].x),
        order,
      );
      // setOverlayMarkers((prev) => [...prev, { ...marker }]);

      // 마커와 검색결과 항목을 클릭 했을 때
      // 장소정보를 표출하도록 클릭 이벤트를 등록합니다
      (function (marker, place) {
        kakao.maps.event.addListener(marker, "click", function () {
          displayPlaceInfo(place);
        });
      })(marker, places[i]);
    }
  }

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
  function addMarker(position, order) {
    var imageSrc =
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png", // 마커 이미지 url, 스프라이트 이미지를 씁니다
      imageSize = new kakao.maps.Size(27, 28), // 마커 이미지의 크기
      imgOptions = {
        spriteSize: new kakao.maps.Size(72, 208), // 스프라이트 이미지의 크기
        spriteOrigin: new kakao.maps.Point(46, order * 36), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
        offset: new kakao.maps.Point(11, 28), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
      },
      markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
      marker = new kakao.maps.Marker({
        position: position, // 마커의 위치
        image: markerImage,
      });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker); // 배열에 생성된 마커를 추가합니다

    return marker;
  }

  // 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수
  function displayPlaceInfo(place) {
    console.log(place);
    var content =
      '<div class="placeinfo">' +
      '   <a class="title" href="' +
      place.place_url +
      '" target="_blank" title="' +
      place.place_name +
      '">' +
      place.place_name +
      "</a>";

    if (place.road_address_name) {
      content +=
        '    <span title="' +
        place.road_address_name +
        '">' +
        place.road_address_name +
        "</span>" +
        '  <span class="jibun" title="' +
        place.address_name +
        '">(지번 : ' +
        place.address_name +
        ")</span>";
    } else {
      content +=
        '    <span title="' +
        place.address_name +
        '">' +
        place.address_name +
        "</span>";
    }

    content +=
      '    <span class="tel">' +
      place.phone +
      "</span>" +
      "</div>" +
      '<div class="after"></div>';

    contentNode.innerHTML = content;
    customOverlay.setPosition(new kakao.maps.LatLng(place.y, place.x));
    customOverlay.setMap(map);
  }

  // 커스텀 마커 삭제
  function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    setMarkers([]);
  }

  return (
    <Box display={"flex"} w={"100%"} className={"map_wrap"}>
      <Stack w={"20%"} className={"menu_wrap"}>
        <Field>
          <Input
            value={locationName}
            onChange={(e) => {
              setLocationName(e.target.value);
            }}
          />
        </Field>

        <Button onClick={handleSearch}> 검색하기</Button>

        <ListRoot id={"placeList"} as={"ol"}></ListRoot>
        <div id={"pagination"}></div>
      </Stack>
      <Stack w={"80%"}>
        <Map
          className="map"
          center={{ lat: 33.450701, lng: 126.570667 }}
          level={3}
          style={{ width: "100%", height: "800px" }}
          onCreate={setMap}
          onClick={handleMapClick}
          onIdle={searchCategoryPlaces}
        >
          {markers.map((marker) => (
            <MapMarker
              key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
              position={marker.position}
              // onClick={() => setInfo(marker)}
              onMouseOver={
                // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
                () => {
                  setInfo(marker);
                  setMarkerOpen(true);
                }
              }
              // 마커에 마우스아웃 이벤트를 등록합니다
              onMouseOut={
                // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
                () => setMarkerOpen(false)
              }
            >
              {markerOpen && info && info.content === marker.content && (
                <div style={{ color: "#5e5959" }}>{marker.content}</div>
              )}
            </MapMarker>
          ))}

          <CustomOverlayMap
            onCreate={setCustomOverlay}
            position={{ lat: 33.450701, lng: 126.570667 }}
          >
            <Box> hello</Box>
          </CustomOverlayMap>

          <ZoomControl />
        </Map>
        <ul id="category">
          <li id="BK9" data-order="0">
            <span className="category_bg bank"></span>
            은행
          </li>
          <li id="MT1" data-order="1">
            <span className="category_bg mart"></span>
            마트
          </li>
          <li id="PM9" data-order="2">
            <span className="category_bg pharmacy"></span>
            약국
          </li>
          <li id="OL7" data-order="3">
            <span className="category_bg oil"></span>
            주유소
          </li>
          <li id="CE7" data-order="4">
            <span className="category_bg cafe"></span>
            카페
          </li>
          <li id="CS2" data-order="5">
            <span className="category_bg store"></span>
            편의점
          </li>
        </ul>
      </Stack>
      {currCategory}
    </Box>
  );
}

export default ViewMap;
