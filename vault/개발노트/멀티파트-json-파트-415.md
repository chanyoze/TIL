---
title: "멀티파트 요청에서 JSON 파트가 415를 내는 이유 (1) — 원인과 해결"
sidebar_label: "멀티파트 JSON 파트 415 (1) 원인과 해결"
sidebar_position: 7
tags: [spring, multipart, requestpart, httpmessageconverter, springdoc, git-revert]
raw:
  - RAW-DOC:raw/notes/2026-07-30-multipart-json-part-415-조치기록.md
  - RAW-DOC:raw/notes/2026-08-03-multipart-json-part-415-2차조치.md
date: 2026-07-30
kind: 동결
---

파일과 JSON을 한 번에 받는 API — 이미지 몇 장과 등록 정보를 같이 보내는 흔한 형태 — 를 만들면 이런 오류를 만날 수 있다.

```
org.springframework.web.HttpMediaTypeNotSupportedException
Message: Content-Type 'application/octet-stream' is not supported
```

**우리는 `octet-stream`을 보낸 적이 없는데** 메시지에는 그게 등장한다. 처음엔 Swagger UI에서만 재현돼서 "문서 도구 문제"로 보이기도 한다. 실제로는 그렇지 않았다. 이 글은 원인과 해결을 일반화해 정리한 메모다. 같은 조사 과정에서 드러난 **사설 저장소 기반 프로젝트의 로컬 실행 관문들**은 [2편](./멀티파트-json-파트-415-2-로컬-실행-관문.md)에 따로 정리했다.

---


## Content-Type은 두 층으로 존재한다

멀티파트 요청이 실제로 네트워크에 흐르는 모양을 보면 답이 나온다.

```http
POST /api/v1/member/item HTTP/1.1
Content-Type: multipart/form-data; boundary=----xyz      ← ① 요청 전체의 형식

------xyz
Content-Disposition: form-data; name="member"
Content-Type: application/json                            ← ② 이 파트만의 형식

{"userName":"홍길동","userId":"test01"}
------xyz
Content-Disposition: form-data; name="photo"; filename="a.jpg"
Content-Type: image/jpeg                                  ← ② 이 파트만의 형식

<이미지 바이너리>
------xyz--
```

- **①** 요청 전체의 Content-Type = "이건 멀티파트 봉투다"
- **②** 파트 각각의 Content-Type = "이 편지는 JSON이다", "이 편지는 JPEG이다"

②는 **없어도 요청 자체는 성립한다.** 그래서 많은 클라이언트가 붙이지 않는다. 이게 이 문제의 출발점이다.

## 왜 파트별 Content-Type이 필요한가

파일 파트는 서버가 **내용을 해석할 필요가 없다.** 바이트를 받아 저장소에 넣으면 끝이다.

JSON 파트는 다르다. 서버가 문자열을 **객체로 변환(역직렬화)** 해야 한다. 변환기를 골라야 하고, 고르려면 "이게 무슨 형식인지"를 알아야 한다. 그 정보가 파트의 Content-Type이다.

## 같은 애노테이션인데 타입에 따라 경로가 갈린다

```java
@RequestPart("photo")  MultipartFile aPhotoFile      // 해석 안 함 → 바이트 그대로 전달
@RequestPart("member") MemberPostReqDto aModel       // 해석 필요 → 변환기를 골라야 함
```

`MultipartFile`이면 Spring이 바이트를 그냥 넘긴다. **DTO(Data Transfer Object, 계층 간 데이터 운반용 객체)면 `HttpMessageConverter`를 찾아야 한다.** `HttpMessageConverter`는 HTTP 본문과 자바 객체를 서로 변환하는 Spring의 인터페이스로, JSON은 보통 Jackson 구현체가 담당한다.

그리고 변환기를 고를 때 Spring이 보는 것은 — **①이 아니라 ②다.** 여기가 가장 착각하기 쉬운 지점이다.

## Spring이 빈칸을 채운다

`AbstractMessageConverterMethodArgumentResolver`의 실제 동작:

```java
if (contentType == null) {
    noContentType = true;
    contentType = MediaType.APPLICATION_OCTET_STREAM;   // ← 빈칸을 이렇게 채움
}
// ...
if (body == NO_VALUE) {
    throw new HttpMediaTypeNotSupportedException(contentType, getSupportedMediaTypes(targetClass), httpMethod);
}
```

파트에 Content-Type이 없으면 **그냥 포기하는 게 아니라 "정체불명 바이너리(`application/octet-stream`)"로 간주한다.** 그런데 바이너리를 자바 객체로 바꿔주는 변환기는 존재하지 않는다. → 415.

**에러 메시지의 `octet-stream`은 클라이언트가 보낸 값이 아니라 Spring이 채운 기본값이다.** 이 한 줄을 알면 메시지가 갑자기 읽힌다.

## Swagger 전용 문제가 아니다

Swagger UI는 OpenAPI 스펙을 읽어 요청을 조립한다. 스펙에 `encoding.<파트>.contentType`이 없으면 그 파트에 Content-Type을 안 붙인다. 그래서 Swagger에서 먼저 터진다.

하지만 파트 헤더를 생략하는 건 Swagger만의 특성이 아니다.

- **Postman**도 form-data **텍스트 행의 Content-Type 칸**을 비우면 안 붙인다. 그 칸은 기본으로 숨어 있어 대부분 비어 있다.
- 외부 연계 클라이언트도 사용 라이브러리에 따라 생략할 수 있다.

즉 실제 문제는 "Swagger가 이상하다"가 아니라 **"서버가 파트 Content-Type을 반드시 요구하는 구조였다"** 는 것이다. Swagger는 그걸 먼저 드러낸 것뿐이다.

> **판별 방법**: 브라우저 개발자도구 Network에서 요청 전체의 Content-Type이 `multipart/form-data; boundary=...`인지 확인한다. 멀티파트가 맞다면 매핑 단계 거부는 불가능하므로, 오류는 파트 해석 단계에서 온 것이 확정된다.

## 다른 파일 업로드 API는 왜 멀쩡한가

같은 프로젝트의 다른 업로드 엔드포인트를 보면 전부 이 조합이었다.

```java
@RequestPart("file") MultipartFile file,
@RequestParam("isDeleteBefore") String isDeleteBefore
```

**파일 + 단순 스칼라**뿐이다. 해석이 필요한 DTO 파트가 없으니 변환기를 고를 일이 없고, 파트 Content-Type을 볼 일도 없다. 415가 날 수 있는 구조가 아니다.

---

## 해결 — 두 계층 중 어디를 고칠 것인가

이 문제는 고칠 수 있는 지점이 두 곳이고, **둘은 경쟁 관계가 아니라 서로 다른 층**이다.

| 계층 | 방법 | 효과 |
|---|---|---|
| 문서(OpenAPI 스펙) | `@Encoding`으로 "이 파트는 JSON"이라고 명시 | Swagger UI가 헤더를 붙인다 |
| 서버(요청 수용) | 파트 Content-Type 없이도 받게 만든다 | 모든 클라이언트에 적용된다 |

### 문서 계층만으로 부족한 이유

```java
@io.swagger.v3.oas.annotations.parameters.RequestBody(
    content = @Content(
        mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
        encoding = @Encoding(name = "member", contentType = MediaType.APPLICATION_JSON_VALUE)
    )
)
```

맞는 접근이지만, **우리 스펙을 실행 시점에 읽는 것은 Swagger UI뿐이다.** 외부 연계 클라이언트는 요청을 보낼 때 우리 문서를 조회하지 않는다. 그쪽은 여전히 415다. 서버가 받는 범위는 전혀 변하지 않는다.

바꿔 말하면 이 방법은 **"클라이언트가 헤더를 붙이게 만드는" 우회**이고, 통제 가능한 클라이언트가 Swagger뿐일 때만 완결된다.

### 1차 조치 — `byte[]`로 받아 직접 역직렬화 (뒤에 철회)

> **이 방법으로 먼저 조치했다가 "너무 복잡하다"는 피드백을 받고 되돌렸다.**
> 최종 채택안은 아래 [2차 조치](#2차-조치--컨버터가-파트를-수용하게-만들기)다.
> 원리 자체는 유효하고 판단 근거로 남길 가치가 있어 지우지 않았다.

```java
// before
@RequestPart("member") @Valid MemberPostReqDto aModel
//   → Spring이 파트 Content-Type을 보고 변환기를 고름 → 없으면 415

// after
@RequestPart("member") byte[] abMemberJson
//   → 어떤 Content-Type이든 통과
MemberPostReqDto aModel = readJsonPart(abMemberJson, MemberPostReqDto.class, "member");
//   → JSON 파싱을 직접 수행
```

**왜 통과하는가**: `ByteArrayHttpMessageConverter`는 지원 형식이 `*/*`로 선언되어 있다. 파트에 Content-Type이 없어 `octet-stream`으로 간주되어도 이 변환기가 받아낸다. 415가 날 여지가 사라진다.

### `String`이 아니라 `byte[]`인 이유 — 조용한 한글 깨짐

`String`으로 받아도 415는 해결된다(`StringHttpMessageConverter`도 `*/*`를 지원한다). 그런데 함정이 있다.

- 바이트를 문자로 바꾸려면 **charset**을 알아야 한다
- 파트에 Content-Type이 없으면 charset 정보도 없다
- 그러면 변환기가 **자기 기본 charset**을 쓴다. Spring Boot는 보통 UTF-8로 바인딩하지만, 스택 어딘가가 기본 생성자로 `StringHttpMessageConverter`를 심으면 ISO-8859-1이 된다
- → 한글 이름이 **예외 없이 조용히 깨진다.** 오류가 안 나므로 발견이 늦고, 이미 저장된 뒤에 알게 된다

`byte[]`는 바이트를 그대로 들고 있고, `ObjectMapper.readValue(byte[], ...)`가 **JSON 규격에 정의된 인코딩 판별**을 수행한다. 추측이 개입하지 않는다.

### 검증을 수동으로 옮기기

`@Valid`(Bean Validation 자동 검증)는 **Spring이 자동 변환해준 객체에만** 적용된다. 직접 파싱하면 그 절차 밖으로 나오므로 검증도 직접 호출해야 한다. 파싱·검증·예외 변환을 한 메서드에 모아두면 여러 엔드포인트가 재사용할 수 있다.

```java
@Autowired private ObjectMapper objectMapper;
@Autowired private Validator validator;      // jakarta.validation.Validator

private <T> T readJsonPart(byte[] abJson, Class<T> aClass, String asPartName) {
    T model;
    try {
        model = objectMapper.readValue(abJson, aClass);
    } catch (IOException e) {
        throw new CommonException(ErrorCode.INVALID_REQUEST,
            "'" + asPartName + "' 파트의 JSON 형식이 올바르지 않습니다.", e);
    }

    Set<ConstraintViolation<T>> setViolation = validator.validate(model);
    if (!setViolation.isEmpty()) {
        String sMessage = setViolation.stream()
                .map(v -> v.getPropertyPath() + " " + v.getMessage())
                .sorted()                                  // 위반 순서가 불정이라 정렬해 메시지를 고정
                .collect(Collectors.joining(", "));
        throw new CommonException(ErrorCode.INVALID_PARAMETER, sMessage);
    }
    return model;
}
```

`MethodArgumentNotValidException`을 손으로 만들어 던지는 방법도 있지만 권하지 않는다. 생성에 `MethodParameter`가 필요하고, 그건 리플렉션으로 메서드 시그니처를 잡아야 해서 **파라미터가 바뀌면 조용히 깨진다.** 프로젝트에 이미 공통 예외 체계가 있다면 그 관용구를 따르는 편이 안전하다.

대신 **검증 실패 시 응답 본문 형태가 바뀐다.** 기존에는 `MethodArgumentNotValidException` 핸들러가, 이제는 공통 예외 핸들러가 응답을 만든다. 정상 경로는 동일하지만 **오류 응답은 계약 변경**이므로 API 소비자에게 알려야 한다.

---

## 2차 조치 — 컨버터가 파트를 수용하게 만들기

1차 조치는 동작했지만 **"컨트롤러가 복잡해진다"** 는 피드백을 받았다. 타당한 지적이다. 파싱 헬퍼·`ObjectMapper`/`Validator` 주입·수동 검증이 엔드포인트마다 따라붙고, `@Valid`가 죽어 오류 응답 계약까지 바뀐다.

그래서 **415가 나는 지점 자체를 없애는 쪽**으로 다시 조치했다.

### 되돌리기 — 공유 브랜치라면 `revert`

1차 조치는 이미 공유 브랜치에 push됐고 그 위에 다른 사람의 커밋이 올라와 있었다. 이 조건에서 히스토리 재작성(reset+force push, rebase)은 **타인의 커밋을 날리거나 그 브랜치를 받아둔 전원이 로컬을 손봐야 한다.** `revert`가 거의 항상 정답이다.

`revert`는 기존 커밋을 지우지 않고 **반대 방향 패치를 담은 새 커밋을 맨 위에 쌓는다.** 두 커밋이 서로 다른 파일을 건드렸다면 충돌도 없다.

```bash
git pull --ff-only            # 뒤처져 있으면 push가 거부된다
git revert -n <되돌릴 커밋>    # -n: 커밋 메시지를 직접 쓰기 위해 분리
git commit -m "..."

# 검증은 눈으로 보지 말고 diff로 — 비어야 정상
git diff <조치 이전 커밋> HEAD -- <해당 파일>
```

> IDE(Eclipse/EGit)의 **Revert Commit**은 누르는 순간 **커밋까지 자동 생성**한다. 스테이징만 되는 게 아니다. 메시지 규칙이 있다면 Git Staging의 **Amend**로 고친다(push 전에만).

### 문제를 어디서 없앨 것인가

앞에서 본 대로 415는 "파트에 Content-Type이 없음 → `octet-stream`으로 간주 → DTO로 바꿀 변환기 없음"에서 온다. 1차 조치는 **파라미터 타입을 바꿔** 변환기 선택을 회피했다. 2차 조치는 **변환기 쪽을 넓혀** `octet-stream`도 JSON으로 읽게 한다.

```java
@Configuration
public class AppWebMvcConfig implements WebMvcConfigurer {

    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        for (int i = 0; i < converters.size(); i++) {
            if (converters.get(i) instanceof MappingJackson2HttpMessageConverter c) {
                converters.set(i, new OctetStreamTolerantJsonConverter(c.getObjectMapper()));
                break;                       // ← set(i, ...) 이지 add(0, ...) 이 아니다
            }
        }
    }

    static class OctetStreamTolerantJsonConverter extends MappingJackson2HttpMessageConverter {
        OctetStreamTolerantJsonConverter(ObjectMapper objectMapper) {
            super(objectMapper);
            setSupportedMediaTypes(List.of(
                    MediaType.APPLICATION_JSON,
                    new MediaType("application", "*+json"),
                    MediaType.APPLICATION_OCTET_STREAM));   // ← 415를 없애는 한 줄
        }

        @Override
        public boolean canWrite(Class<?> clazz, MediaType mediaType) {
            if (mediaType != null && MediaType.APPLICATION_OCTET_STREAM.equalsTypeAndSubtype(mediaType)) {
                return false;                // 읽기만 확장, 쓰기는 원래대로
            }
            return super.canWrite(clazz, mediaType);
        }
    }
}
```

**컨트롤러는 한 줄도 안 바뀐다.** `@RequestPart @Valid DTO` 원형이 살아 있고, 따라서 `@Valid`도 오류 응답 계약도 그대로다 — 1차 조치의 유일한 부작용이 사라진다.

### 반드시 지켜야 할 두 가지

이걸 틀리면 **415는 고쳐지지만 다른 기능이 깨진다.**

**1. 맨 앞에 끼워넣지 말고 제자리에서 교체한다**

기본 컨버터 등록 순서는 이렇다(`WebMvcConfigurationSupport.addDefaultHttpMessageConverters`).

```
ByteArray → String → Resource → ResourceRegion → Form → … → Jackson
```

앞쪽 컨버터들은 **대상 타입**으로 먼저 매칭된다(ByteArray는 `byte[]`만, String은 `String`만). Jackson을 `add(0, ...)`으로 맨 앞에 두면 `@RequestPart byte[]`나 파일 다운로드가 Jackson으로 넘어가 깨진다. **기존 Jackson이 있던 인덱스에 그대로 교체**해야 한다.

**2. `canWrite`에서 `octet-stream`을 제외한다**

지원 형식에 넣기만 하면 `octet-stream`이 **응답 협상 후보**가 된다. `Accept: application/octet-stream` 요청에 JSON 본문이 실려 나갈 수 있다. 그런데 이미 등록된 인스턴스에는 `canWrite`를 덧씌울 수 없으므로 — **서브클래싱이 강제된다.** 이게 이 방식의 실제 비용이다.

### 대가

적용 범위 안의 **모든 엔드포인트**에서 `@RequestBody DTO`에 `octet-stream`을 보내면 이전엔 415였는데 이제 JSON 파싱을 시도한다(실패 시 400). **잘못된 Content-Type을 조용히 받아주는 방향의 완화**이고, 이게 유일한 비용이다.

그래서 **어느 범위에 넣느냐가 판단의 전부**다. 공통 모듈에 넣으면 그 모듈을 쓰는 모든 서비스가 폭발 반경에 들어간다. 서비스 하나에만 넣으면 거기서 멈춘다.

> 적용 전에 **공통 모듈이 Jackson 컨버터를 이미 커스터마이징하는지** 확인해야 한다. `extendMessageConverters`/`configureMessageConverters`/`Jackson2ObjectMapperBuilderCustomizer`를 grep해 0건이면 교체로 잃는 설정이 없다. `ObjectMapper`는 기존 인스턴스에서 넘겨받으므로 그쪽 설정은 어차피 보존된다.

### 문서 계층도 같이 — 다만 자동으로

앞에서 "문서 계층만으로는 부족하다"고 했지만, **불필요하다는 뜻은 아니다.** 서버가 받아주더라도 Swagger UI가 헤더를 안 붙이면 문서와 실제가 어긋난 채로 남는다.

엔드포인트마다 `@Encoding`을 손으로 붙이면 파라미터 레벨 `@Schema`와 충돌하므로, **문서 생성 시점에 일괄 주입**하는 편이 안전하다.

```java
@Bean
public GlobalOperationCustomizer multipartJsonPartEncodingCustomizer() {
    return (operation, handlerMethod) -> {
        // multipart 요청 본문의 비파일 @RequestPart 파트에
        // encoding.<파트>.contentType = application/json 을 채운다
        // 이미 지정된 파트는 건드리지 않는다 → 개별 @Encoding 선언이 우선
    };
}
```

> `OperationCustomizer`가 아니라 **`GlobalOperationCustomizer`** 로 선언해야 설정 파일에 정의한 API 그룹 전체에 적용된다.

여기서 **판별 로직이 코드의 절반**을 차지한다. 무턱대고 모든 비파일 파트에 `application/json`을 붙이면 `@RequestPart("siteCode") String` 같은 단순값 파트까지 JSON으로 표시돼 **문서가 거짓이 된다.**

```java
if (partType.isArray())          partType = partType.getComponentType();
else if (Collection.class...)    partType = 제네릭 첫 인자;

if (MultipartFile | Part | Resource) return false;      // 파일 파트
return !BeanUtils.isSimpleValueType(partType);          // String·숫자·enum·byte[] 제외
```

### 두 방식 비교

| | 1차: `byte[]` + 직접 파싱 | 2차: 컨버터 확장 |
|---|---|---|
| 컨트롤러 | 엔드포인트마다 수정 | **무변경** |
| `@Valid` | 수동 대체 필요 | **유지** |
| 오류 응답 계약 | **바뀜** (통보 필요) | 안 바뀜 |
| 영향 범위 | 해당 엔드포인트만 | 적용 범위 전체 (완화) |
| 되돌리기 | 기존 파일 수정분 revert | **파일 삭제로 끝** |

**되돌리기 난이도까지 조치 방식의 평가 항목이다.** 1차는 기존 파일 본문을 60여 줄 고쳐 revert가 필요했고, 2차는 파일 추가뿐이라 지우면 원상복구된다.

### 검증 — 문서 도구와 무관함을 증명하기

"Swagger에서만 고쳐진 것 아니냐"는 의심은 **테스트로 답할 수 있다.** `MockMvc`는 HTTP 요청을 직접 조립하므로 Swagger·springdoc이 전혀 개입하지 않는다.

```java
MockPart part = new MockPart("member", json.getBytes(StandardCharsets.UTF_8));
// ← Content-Type 을 일부러 붙이지 않음
```

같은 요청을 **설정 전/후 컨버터 목록으로 각각** 태워 보면 결과가 갈린다.

| 조건 | 결과 |
|---|---|
| 설정 전 + 파트 CT 없음 | **415** — 버그 재현 |
| 설정 후 + 파트 CT 없음 | **200**, 한글 보존 |
| 설정 후 + 파트 CT `application/json` | **200** — 기존 클라이언트 무영향 |
| 설정 후 + 필수값 누락 | **400** — `@Valid` 유지 |
| Jackson 교체 위치 / 앞쪽 컨버터 순서 | 유지 |

마지막 줄이 중요하다. 누군가 나중에 `add(0, ...)`으로 바꾸면 이 테스트가 즉시 실패한다.

**다만 테스트를 남길지는 별개의 결정이다.** 이 사례에서는 Swagger UI와 Postman으로 실동작을 확인한 뒤 테스트를 남기지 않기로 했다. 그러면 순서 제약을 지키는 것은 **주석뿐**이 된다. 실동작 확인은 *지금*을 보증하지만, 테스트가 막던 것은 *다음 사람의 수정*이라 성격이 다르다.

테스트를 두지 않기로 했다면 최소한 아래 한 가지는 반드시 해야 한다.

### 실행 순서를 명시적으로 고정하기

`extendMessageConverters`는 등록된 **모든** `WebMvcConfigurer`를 차례로 호출한다(`WebMvcConfigurerComposite`). 그리고 그 목록은 `@Order`로 정렬된다.

여기 함정이 있다. 나중에 공통 모듈이나 다른 설정이 Jackson 컨버터를 손대는 configurer를 추가하고 **그것이 우리 뒤에 실행되면**, 그쪽 코드가 `instanceof MappingJackson2HttpMessageConverter`로 우리 확장판을 찾아 평범한 컨버터로 되돌린다. **우리 확장판도 그 타입이기 때문이다.**

```java
@Order(Ordered.LOWEST_PRECEDENCE)   // 항상 마지막에 실행 → 교체가 덮이지 않는다
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
```

이걸 빠뜨리면 **415가 조용히 부활한다.** 컴파일도 기동도 정상이고, 오류는 외부 연계에서만 난다 — 이 노트에 반복해서 나오는 "조용한 실패"와 정확히 같은 부류다.

### 문서 계층도 실제 전송으로 확인한다

스펙에 `encoding`이 들어갔는지만 보면 부족하다. **문서 도구가 그 값을 실제로 쓰는지**를 봐야 한다. 브라우저 개발자도구의 Network에서 나간 요청의 원문을 확인하면 된다.

```
------WebKitFormBoundaryXXXX
Content-Disposition: form-data; name="member"; filename="blob"
Content-Type: application/json          ← encoding 이 적용된 결과
```

> 파트에 `filename="blob"`이 붙는 것은 encoding을 지정하면 Swagger UI가 그 파트를 파일처럼 전송하기 때문이다. 서버는 파트 헤더의 Content-Type만 보므로 처리에는 영향이 없다.

이 줄이 **없어도 요청은 성공한다** — 서버 계층 조치가 받아주기 때문이다. 그래서 이 확인은 기능 검증이 아니라 **문서 정확성 검증**이다. 둘을 구분해야 "무엇이 아직 안 됐는지"를 정확히 말할 수 있다.

## 같이 정리할 것 두 가지

**`consumes`에서 `application/json` 제거**

```java
// before
consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE}
// after
consumes = MediaType.MULTIPART_FORM_DATA_VALUE
```

`@RequestPart`는 멀티파트 전용이므로 순수 JSON 요청과 양립할 수 없다. 남겨두면 Swagger UI에 형식 선택 드롭다운이 생겨 **무엇을 고르냐에 따라 폼과 결과가 바뀌는** 혼란을 만든다. 그리고 이미 실패하고 있었으므로 정상 동작 중인 JSON 호출자는 존재할 수 없다 — 제거는 안전하다.

**파라미터에 붙은 `@RequestBody`(Swagger 애노테이션) 제거**

`io.swagger.v3.oas.annotations.parameters.RequestBody`는 **요청 본문 전체**를 문서화하는 용도다. 파트 하나에 붙이는 건 위치가 틀린 것이고, 문서 생성을 방해한다. 파트 단위 문서화는 `@Parameter`를 쓴다.

```java
@Parameter(description = "회원 정보 (JSON)", schema = @Schema(implementation = MemberPostReqDto.class))
@RequestPart("member") byte[] abMemberJson
```

파라미터 레벨 `@Schema`와 메서드 레벨 `@RequestBody`를 **동시에 쓰지 않는다.** 둘 다 같은 request body를 형성하려 해서 springdoc 출력이 불안정해진다. 둘 다 필요하면 파트를 필드로 가진 **문서 전용 wrapper DTO**를 만들고, 메서드 레벨 `@Content` 하나에 `schema`와 `encoding`을 함께 넣는다.

## 검토했지만 택하지 않은 방안들

| 방안 | 판정 |
|---|---|
| **공통 모듈**의 Jackson 변환기에 `octet-stream` 지원 추가 | 기각. 그 모듈을 쓰는 **모든 서비스**에서 Jackson이 모든 octet-stream 본문을 자기 담당으로 주장한다. 메서드 두 개를 위해 플랫폼 전체를 폭발 반경에 넣는 것 |
| **서비스 하나**의 Jackson 변환기에 `octet-stream` 지원 추가 | **2차 조치로 채택.** 위와 같은 기법이지만 범위가 다르다 |
| `@Encoding`만 적용 | 단독 불충분(위 참조). 2차 조치에서 서버 조치와 **함께** 적용 |
| `@RequestPart String` + 파싱 | charset 리스크 |
| 공통 모듈에 옵트인 커스텀 애노테이션 + `HandlerMethodArgumentResolver` | 케이스가 두 곳뿐이라 보류. 공통 모듈 수정은 버전업 → 배포 → 각 서비스 의존성 갱신 사이클 비용이 붙는다 |
| 비파일 `@RequestPart` 자동 encoding `OperationCustomizer` | **2차 조치로 채택**(서비스 로컬). 공통 모듈로 올리는 것은 여전히 후보 |

위 표의 첫 두 줄을 눈여겨볼 만하다. **같은 기법인데 범위만 다르고 판정이 반대다.**

1차 조치 때는 "Jackson 변환기 확장 = 기각"이라고만 적어뒀다가, 2차 조치를 검토할 때 스스로 만든 기록에 막힐 뻔했다. **기각 사유는 반드시 적용 범위와 함께 적어야 한다** — 범위가 빠지면 기법 자체가 금지된 것처럼 읽힌다.

## 대안 하나 — 애초에 JSON 파트를 쓰지 않는 방법

"기존 API처럼 하면 되지 않나"라는 질문의 답이 이것이다.

```java
@ModelAttribute @Valid MemberPostReqDto aModel
```

`@ModelAttribute`는 `WebDataBinder`가 멀티파트의 일반 필드를 DTO 프로퍼티에 바인딩한다. **`HttpMessageConverter`를 아예 타지 않으므로 Content-Type 협상 자체가 없고**, 415가 구조적으로 불가능해진다. `@Valid`도 그대로 동작해서 오류 응답 형태 변경도 없다. 파싱 헬퍼도 필요 없다. DTO가 전부 평면 필드(중첩 객체·컬렉션 없음)라면 기술적 걸림돌도 없다.

**대신 통신 규격이 바뀐다.**

| | `byte[]` + 직접 파싱 | `@ModelAttribute` |
|---|---|---|
| 클라이언트가 보내는 것 | 파트 하나에 JSON 한 덩어리 | 필드 개수만큼 form-data 행 |
| 기존 클라이언트 | 그대로 동작 | **전부 수정 필요** |
| `@Valid` | 수동 대체 | 그대로 |
| 오류 응답 형태 | 바뀜 | 안 바뀜 |

**판단 기준은 통제 불가능한 클라이언트가 이미 붙어 있는지**다.

- 이미 JSON 파트 규격으로 연동이 끝났다 → 파트를 그대로 받는 방식. 규격을 지키므로 클라이언트 수정이 0이다
- 아직 연동 전이거나 규격 협의가 가능하다 → **`@ModelAttribute`가 낫다.** 코드가 더 적고, `@Valid`가 살고, 오류 응답 계약도 그대로다

새 API를 설계하는 중이라면 처음부터 후자를 고려할 만하다.

> 이 사례에서는 **"연동 규격을 상대와 다시 협의하지 않는다"** 는 결정이 나와 `@ModelAttribute`가 후보에서 빠졌다. 기술적으로는 가장 단순한 답이었지만, **기술 외적 제약이 선택지를 지우는 것이 정상이다.** 그 제약을 먼저 확인하지 않으면 구현해놓고 되돌리게 된다 — 실제로 한 번 그랬다.

---

이 버그를 잡으려고 로컬 환경을 새로 세우며 만난 관문들은 [2편 — 사설 저장소 프로젝트의 로컬 실행 관문](./멀티파트-json-파트-415-2-로컬-실행-관문.md)에 이어진다.
