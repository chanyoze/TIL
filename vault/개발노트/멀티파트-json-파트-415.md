---
sidebar_label: "멀티파트 JSON 파트 415"
sidebar_position: 7
tags: [spring, multipart, requestpart, httpmessageconverter, springdoc, gradle, jasypt, mapstruct, git-revert, 로컬환경]
raw: RAW-DOC:raw/notes/2026-07-30-multipart-json-part-415-조치기록.md
raw2: RAW-DOC:raw/notes/2026-08-03-multipart-json-part-415-2차조치.md
---

# 멀티파트 요청에서 JSON 파트가 415를 내는 이유

파일과 JSON을 한 번에 받는 API — 이미지 몇 장과 등록 정보를 같이 보내는 흔한 형태 — 를 만들면 이런 오류를 만날 수 있다.

```
org.springframework.web.HttpMediaTypeNotSupportedException
Message: Content-Type 'application/octet-stream' is not supported
```

**우리는 `octet-stream`을 보낸 적이 없는데** 메시지에는 그게 등장한다. 처음엔 Swagger UI에서만 재현돼서 "문서 도구 문제"로 보이기도 한다. 실제로는 그렇지 않았다. 아래는 원인과 해결, 그리고 같은 조사 과정에서 드러난 **사설 저장소 기반 프로젝트의 로컬 실행 관문들**을 일반화해 정리한 메모다.

---

# 1부 — 415의 정체

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

> ⚠️ **이 방법으로 먼저 조치했다가 "너무 복잡하다"는 피드백을 받고 되돌렸다.**
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

⚠️ 대신 **검증 실패 시 응답 본문 형태가 바뀐다.** 기존에는 `MethodArgumentNotValidException` 핸들러가, 이제는 공통 예외 핸들러가 응답을 만든다. 정상 경로는 동일하지만 **오류 응답은 계약 변경**이므로 API 소비자에게 알려야 한다.

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

마지막 줄이 중요하다. 누군가 나중에 `add(0, ...)`으로 바꾸면 **즉시 실패하는 회귀 방지 장치**가 된다.

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

⚠️ 파라미터 레벨 `@Schema`와 메서드 레벨 `@RequestBody`를 **동시에 쓰지 않는다.** 둘 다 같은 request body를 형성하려 해서 springdoc 출력이 불안정해진다. 둘 다 필요하면 파트를 필드로 가진 **문서 전용 wrapper DTO**를 만들고, 메서드 레벨 `@Content` 하나에 `schema`와 `encoding`을 함께 넣는다.

## 검토했지만 택하지 않은 방안들

| 방안 | 판정 |
|---|---|
| **공통 모듈**의 Jackson 변환기에 `octet-stream` 지원 추가 | 기각. 그 모듈을 쓰는 **모든 서비스**에서 Jackson이 모든 octet-stream 본문을 자기 담당으로 주장한다. 메서드 두 개를 위해 플랫폼 전체를 폭발 반경에 넣는 것 |
| **서비스 하나**의 Jackson 변환기에 `octet-stream` 지원 추가 | **2차 조치로 채택.** 위와 같은 기법이지만 범위가 다르다 |
| `@Encoding`만 적용 | 단독 불충분(위 참조). 2차 조치에서 서버 조치와 **함께** 적용 |
| `@RequestPart String` + 파싱 | charset 리스크 |
| 공통 모듈에 옵트인 커스텀 애노테이션 + `HandlerMethodArgumentResolver` | 케이스가 두 곳뿐이라 보류. 공통 모듈 수정은 버전업 → 배포 → 각 서비스 의존성 갱신 사이클 비용이 붙는다 |
| 비파일 `@RequestPart` 자동 encoding `OperationCustomizer` | **2차 조치로 채택**(서비스 로컬). 공통 모듈로 올리는 것은 여전히 후보 |

⚠️ 위 표의 첫 두 줄을 눈여겨볼 만하다. **같은 기법인데 범위만 다르고 판정이 반대다.**

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

# 2부 — 사설 저장소 기반 프로젝트의 로컬 실행 관문

위 버그를 잡는 과정에서 로컬 환경을 새로 세워야 했는데, **관문 하나를 통과하면 다음 관문이 드러나는** 구조였다. 사설 Maven 저장소에서 공통 모듈을 받아 쓰는 Spring Boot 프로젝트라면 대체로 같은 순서를 만난다.

## 관문 0 — IDE에 프로젝트가 안 보인다

`.gitignore`가 `.classpath`/`.project`/`.settings`를 제외하고 있으면 clone에 IDE 메타데이터가 없다. **폴더가 존재하는지와 IDE가 프로젝트로 인식하는지는 별개다** — 워크스페이스 메타데이터에 등록되어야 보인다.

Gradle 프로젝트라면 `File > Import > Gradle > Existing Gradle Project`가 낫다. 의존성 해석이 실패해도 **프로젝트 자체는 나타나고 오류 마커만 붙는다.** 반면 `gradlew eclipse`로 메타데이터를 먼저 만드는 경로는 의존성 해석이 성공해야 하므로, 인증 문제가 있으면 여기서 막힌다.

## 관문 1 — 사설 저장소 인증 (빨간줄 수천 개)

**증상**: import 후 소스 전체가 오류.

**진짜 에러를 봐야 한다.** IDE 오류 목록이 아니라 빌드 도구를 직접 돌린다.

```
Could not resolve all files for configuration ':compileClasspath'.
 > Could not find org.projectlombok:lombok:.
 > Could not find com.example:common-module-core:.
                                                ^ 버전이 비어 있다
```

**콜론 뒤 버전이 빈 것**이 결정적 증거다. 프로젝트가 의존성을 버전 없이 선언하고 BOM에서 받는 구조라면:

```gradle
dependencyManagement {
    imports {
        mavenBom "com.example:common-module:1.2.3"                          // 사설 저장소, 인증 필요
        mavenBom "org.springframework.boot:spring-boot-dependencies:3.5.16"
    }
}
```

첫 BOM이 인증 실패하면 `dependencyManagement` 블록 전체가 무너지고 **버전이 하나도 배정되지 않는다.** 그래서 공개 저장소에 있는 lombok까지 같이 실패한다.

> **BOM**(Bill of Materials)은 라이브러리 버전들을 한곳에 모아 선언한 명세다. 이걸 import하면 개별 의존성에서 버전을 생략할 수 있다.

**반증 증거로 확인하기**: 오류 목록에서 **버전이 명시된 의존성만 빠져 있다면** 저장소 연결 자체는 정상이고 문제는 "버전 없음"이다. 이 한 가지 관찰로 네트워크·프록시 의심을 걷어낼 수 있다.

**왜 오류가 수천 개인가**:

```
인증 실패 → BOM 실패 → 전체 버전 미배정 → lombok이 클래스패스에서 빠짐
         → @Data가 getter/setter를 생성하지 않음
         → 모든 모델·서비스·컨트롤러의 getXxx() 호출이 미해결
         → 수천 개 오류
```

**오류는 수천 개, 원인은 하나다.** 이 구조를 알면 목록을 하나씩 볼 필요가 없다.

**조치**: 자격증명은 **사용자 홈**(`~/.gradle/gradle.properties`)에 둔다. 레포 안의 `gradle.properties`는 보통 git 추적 대상이라 토큰이 커밋될 위험이 있다. 우선순위도 홈이 더 높다.

```
-P 커맨드라인  >  GRADLE_USER_HOME/gradle.properties  >  프로젝트 gradle.properties
```

이미 CLI 도구(`gh` 등)에 로그인돼 있다면 토큰을 새로 발급하지 않고 재사용할 수 있다. 다만 OAuth 토큰은 재로그인 시 값이 바뀌어 같은 증상이 재발할 수 있으니, 오래 쓸 거면 만료가 긴 개인 토큰을 따로 발급하는 편이 낫다. 필요한 권한은 **패키지 읽기** 스코프다.

**헛다리 짚기 쉬운 정상 상태들**:
- Gradle IDE 플러그인은 `.classpath`에 jar를 직접 나열하지 않는다. 컨테이너로 동적 주입하므로 **jar 항목이 안 보이는 건 정상**이다
- 툴체인이 요구하는 JDK가 시스템에 없어도 Gradle이 자동 프로비저닝해 `~/.gradle/jdks`에 받아둘 수 있다

## 관문 2 — 설정 암호화 마스터 키

**증상**: 엉뚱한 프로퍼티 이름으로 기동 실패.

```
APPLICATION FAILED TO START
Failed to bind properties under 'some.external.api.id' to java.lang.String
```

**그 프로퍼티가 원인이 아니다.** 바인딩 순서상 제일 먼저 걸린 암호화 항목일 뿐이다.

> **jasypt**는 설정 파일의 값을 암호화해 보관하는 라이브러리다. `ENC(...)`로 감싼 값을 기동 시 마스터 비밀번호로 복호화한다.

```yaml
jasypt:
  encryptor:
    password: ${JASYPT_PASSWORD}          # 환경변수로 주입
    algorithm: PBEWithMD5AndDES
    iv-generator-classname: org.jasypt.iv.NoIvGenerator
```

환경변수가 없으면 복호화가 실패하고, 그게 바인딩 오류로 포장되어 나온다.

**부분 우회는 대개 불가능하다.** 문제로 지목된 항목만 평문으로 덮어써도, 같은 파일에 DB·저장소 자격증명이 전부 암호화되어 있으면 다음 항목에서 막힌다. 그 자격증명 자체가 암호화돼 있으므로 우회하려면 평문 값을 따로 알아야 한다. **결국 비밀이 필요하다면 마스터 키 하나 받는 것이 최단 경로다.**

**값을 받았으면 추측하지 말고 실측한다.** jasypt는 CLI를 내장하고 있어서 앱을 띄우지 않고 검증할 수 있다.

```bash
java -cp jasypt-1.9.3.jar org.jasypt.intf.cli.JasyptPBEStringDecryptionCLI \
  input="<ENC 안의 내용>" password="<받은 비밀번호>" \
  algorithm=PBEWithMD5AndDES ivGeneratorClassName=org.jasypt.iv.NoIvGenerator
```

⚠️ **틀린 비밀번호도 증상이 같다**(동일한 바인딩 오류). 기동이 안 되면 값부터 재확인한다.

⚠️ 프로필별 프로퍼티 파일이 git 추적 대상인지 확인하고, **평문 비밀을 넣지 않는다.**

## 관문 2.5 — 빌드 데몬이 낡은 환경을 물고 있다

이건 놓치면 확실히 재발하는 함정이다.

영구 환경변수를 등록해도 **이미 실행 중인 프로세스는 모른다.** IDE는 재시작하면 되지만, **Gradle 데몬은 별도 프로세스로 백그라운드에 살아 있다.**

```
데몬 시작:   08:54 / 09:19 / 09:44
환경변수 등록: 10:05
```

이 상태에서 IDE의 Gradle 작업으로 앱을 띄우면 낡은 데몬을 재사용하고, 포크되는 앱 JVM이 **데몬의 환경**을 물려받는다. IDE를 재시작했는데도 같은 오류가 나는 이유다.

```bash
gradlew --stop     # 데몬 전부 종료. 다음 실행 때 현재 환경으로 새로 뜬다
```

## 관문 3 — 애노테이션 프로세서가 IDE에서만 동작하지 않는다

**증상**: 특정 빈만 없다고 기동 실패.

```
No qualifying bean of type '...XxxConverter' available
```

`XxxConverter`가 MapStruct 인터페이스라면 실제 빈은 생성된 `XxxConverterImpl`이다.

> **MapStruct**는 객체 간 매핑 코드를 컴파일 시점에 생성하는 라이브러리다. `@Mapper` 인터페이스만 선언하면 구현 클래스가 자동 생성된다.
> **APT**(Annotation Processing Tool)는 컴파일 중에 애노테이션을 읽어 소스를 생성하는 자바 기능이다. lombok·MapStruct가 이 위에서 동작한다.

확인해보면 이런 상태다.

| | 상태 |
|---|---|
| 빌드 도구가 생성한 `XxxConverterImpl.java` | 있음 (`build/generated/sources/annotationProcessor/...`) |
| IDE가 컴파일한 `*ConverterImpl.class` | **0개** |
| `.factorypath` | 없음 |
| `.settings/org.eclipse.jdt.apt.core.prefs` | 없음 |

**원인**: 이 설정 파일들을 만드는 것은 빌드 스크립트의 `eclipse` 태스크다. **Gradle import(Buildship)는 그 태스크를 실행하지 않는다.** 그래서 IDE 쪽에서는 애노테이션 프로세서가 한 번도 돌지 않았다.

> **Buildship**은 Eclipse의 Gradle 통합 플러그인이다. `.classpath`에 jar를 나열하는 대신 Gradle이 계산한 클래스패스를 컨테이너로 주입한다.

IDE 실행 구성(Boot Dashboard 등)은 IDE가 컴파일한 출력 디렉터리로 앱을 띄우므로 그 빈이 비어 있다. **기동 로그의 클래스패스 경로가 `bin/main` 같은 IDE 출력이면 이 경로를 타고 있다는 신호다.**

**오류·경고가 없었던 이유**: 인터페이스는 존재하니 컴파일은 통과하고, 구현체는 **런타임에만** 필요하다.

**조치 세 가지**

1. **빌드 도구로 실행한다** — `gradlew bootRun`. Gradle은 APT를 정상 수행하므로 문제를 우회한다. 가장 간단하지만 IDE 실행 기능을 포기하는 것이다
2. **IDE 쪽 APT를 수동 생성한다** — `gradlew eclipse`로 `.factorypath`와 APT 설정을 만든 뒤 IDE 새로고침 + 전체 Clean(APT는 전체 재빌드 때 돈다)
3. **빌드 스크립트에 동기화 훅을 건다** — 아래. **유일한 영구 해결책이다**

### 2번은 왜 임시방편인가

이 함정은 한 번 고쳐도 **조용히 재발한다.** 세 가지 이유가 있다.

- **개인 PC에만 적용된다.** `.factorypath`·`.settings`는 보통 `.gitignore` 대상이라 다른 사람은 새 clone에서 똑같이 겪는다
- **조용히 썩는다.** `.factorypath`에는 프로세서 jar의 **절대경로와 버전**이 박힌다. 프로세서를 BOM에서 버전 없이 받는 구조라면 BOM이 올라가는 순간 없는 파일을 가리키게 되고, **APT가 소리 없이 멈춘다.** 컴파일은 통과하고 런타임에만 빈이 없다고 죽는다 — 처음 증상과 똑같이
- **덮어써진다.** IDE의 Gradle 새로고침·재import·`cleanEclipse` 중 아무거나 하면 날아간다

⚠️ 그리고 `gradlew eclipse`는 `.classpath`도 다시 쓴다. Gradle IDE 플러그인으로 프로젝트를 가져온 상태라면 **의존성 컨테이너 항목이 사라지고 jar 직접 나열 방식으로 바뀐다.** 실행 전에 백업해두고, APT 파일만 남긴 뒤 `.classpath`는 되돌리는 편이 안전하다.

### 3번 — 빌드 스크립트 한 줄

Gradle의 `EclipseModel`에는 **IDE가 프로젝트를 동기화할 때 실행할 태스크**를 지정하는 API가 있다.

```gradle
eclipse {
    synchronizationTasks 'eclipseClasspath'   // 동기화 때마다 자동 실행
    // autoBuildTasks 'someTask'              // 자동 빌드 때 실행할 것이 있다면
}
```

이러면 `.factorypath`를 만드는 로직이 **import·새로고침 때마다 현재 의존성 버전으로 재생성된다.** 절대경로가 썩는 문제도, 팀원이 따로 조치해야 하는 문제도 같이 사라진다.

> 이 사례에서 흥미로웠던 점: 빌드 스크립트에 `.factorypath` 생성 로직이 **이미 들어 있었다.** 누군가 만들어뒀는데 **실행 트리거만 빠져 있던** 것이다. 증상만 보고 개인 PC를 고치면 그 사실을 영영 모른다. **"왜 이 로직이 있는데 안 돌지?"를 한 번 물어보면 임시방편과 영구 해결이 갈린다.**

⚠️ **`build`와 `bootRun`은 다르다.** `build`는 컴파일·테스트·아카이브까지만 하고 **서버를 띄우지 않는다.** 서버 실행은 `application` 그룹의 `bootRun`이다.

## 관문 4 — 기동 시점에 필요한 로컬 인증 파일

**증상**:

```
XxxDbConfig.createSSLContext(...)
  → java.io.FileNotFoundException: <경로>/truststore.jks
```

> **truststore**는 "이 인증서는 믿는다"를 모아둔 파일이다. TLS 통신에서 상대 서버 인증서를 검증할 때 쓴다.

암호화된 설정에서 경로를 받아오는 형태라면 파일이 로컬에 없을 수 있다. 그리고 이 파일은 **지연 로딩이 아니라 기동 시점에 확정적으로 읽힌다** — 공통 모듈 안의 테스트용 컨트롤러가 싱글톤으로 해당 템플릿 빈을 끌어당기는 구조라면 피할 수 없다.

**우회 방안 비교**

| 방안 | 규모 | git 추적 파일 |
|---|---|---|
| 실제 파일 받기 | 파일 1개 배치 | 안 건드림 |
| **자리표시자 truststore 생성** | 파일 1개(레포 밖) | 안 건드림 |
| 해당 모듈 의존성·코드 주석 처리 | **8곳 이상** | 빌드 스크립트 + 소스 다수 |
| 자동 설정 제외(`spring.autoconfigure.exclude`) | 1줄 | **실패** |

**자동 설정 제외가 실패하는 이유** — 이게 흥미롭다. 해당 설정 클래스가 정식 `@AutoConfiguration`이라 제외는 된다. 그런데 공통 모듈이 `@ComponentScan("com.example")`처럼 **넓은 네임스페이스를 스캔**하면, 설정 클래스를 제외해도 그 모듈 안의 서비스·컨트롤러는 여전히 컴포넌트 스캔으로 등록된다. 제외로 사라진 리포지토리 빈을 그 서비스가 요구하므로 **`NoSuchBeanDefinitionException`으로 자리만 옮겨 죽는다.** 그 빈들에 `@ConditionalOn*`이 없으면 끌 수도 없다.

**의존성 주석 처리가 커지는 이유**: `spring-data-mongodb` 같은 라이브러리가 **공통 모듈을 통해서만 전이(transitive)로** 들어오는 경우가 있다. 빌드 스크립트에 직접 선언이 없으면 그 한 줄을 지우는 순간 관련 소스 전체가 컴파일되지 않는다. 지우기 전에 **누가 그 라이브러리를 import하는지 먼저 세어봐야 한다.**

> 참고로 애플리케이션 코드가 `ObjectProvider<MongoTemplate>` + `getIfAvailable()`처럼 **빈 부재를 견디게** 작성돼 있으면, 진짜 걸림돌은 애플리케이션이 아니라 **의존 모듈 jar 안의 빈**이다. 이 구분을 먼저 해야 우회 범위를 정확히 잡을 수 있다.

**자리표시자 생성 시 주의** — 코드가 기대하는 keystore **형식**을 먼저 확인한다. `KeyStore.getInstance("JKS")`를 쓰는데 최신 JDK의 `keytool` 기본값(PKCS12)으로 만들면 "Invalid keystore format"이라는 **다른 오류**로 갈아탄다.

```bash
keytool -genkeypair -alias local-dev-placeholder -keyalg RSA -keysize 2048 -validity 3650 \
  -dname "CN=local-dev-placeholder, OU=DO-NOT-USE, O=placeholder" \
  -keystore "<경로>/truststore.jks" \
  -storetype JKS -storepass <설정된 비밀번호> -keypass <동일> -noprompt
```

비밀번호는 설정값과 일치시켜야 파일이 열린다. 그리고 **왜 만든 자리표시자인지, 실제 파일을 받으면 덮어써야 한다는 메모를 같은 폴더에 남긴다.** 가짜 신뢰 저장소라는 걸 잊는 것이 이 방법의 유일한 위험이다.

**성립 근거와 대가**: 드라이버가 클라이언트 생성 시점에 접속하지 않는다면 앱은 뜬다. 대신 **그 저장소를 실제로 호출하는 기능은 런타임에 실패**하고, 백그라운드 접속 오류가 반복 로깅될 수 있다. 지금 검증할 기능이 그 저장소를 쓰지 않는지(예: grep으로 참조 0건 확인) 먼저 확인해야 한다.

---

# 부록 — 오류 판독 요령

## 실패한 컨텍스트는 캐시된다

테스트가 여러 건 실패했을 때 근본 원인은 하나일 수 있다.

```
XxxInitTest                > initializationError   ← FileNotFoundException (진짜 원인)
YyyControllerTest          > initializationError   ← DefaultCacheAwareContextLoaderDelegate:145
ZzzSmokeTest               > initializationError   ← DefaultCacheAwareContextLoaderDelegate:145
```

`DefaultCacheAwareContextLoaderDelegate`가 스택에 있으면 **Spring이 이미 실패한 컨텍스트를 캐시해 재사용한** 파생 실패다. 실제 예외를 들고 있는 한 건만 보면 된다. 이름이 무섭게 붙은 테스트(암복호화 스모크 테스트 등)가 목록에 있어도 그 기능의 문제가 아니다.

## 쫓지 말아야 할 무해한 로그

- `... jar referenced one or more files that do not exist` — 일부 벤더 jar의 Class-Path 매니페스트 관행
- `Overriding bean definition for bean '...'` — `allow-bean-definition-overriding: true` 설정의 정상 결과
- `Sharing is only supported for boot loader classes because bootstrap classpath has been appended` — JVM 클래스 공유 관련 무해 경고

## 오류 개수와 원인 개수를 분리하기

이번 사례의 교훈을 한 줄로 정리하면 이렇다.

> **오류가 수천 개라도 원인은 하나일 수 있고, 오류가 한 개라도 원인은 두 층일 수 있다.**

빨간줄 수천 개는 BOM 하나였고, 415 한 개는 문서 계층과 서버 계층 두 곳에 걸쳐 있었다. **오류 개수를 원인 개수의 힌트로 쓰지 않는 것**이 두 상황 모두에서 옳았다.

## 되돌리기 쉬움도 설계 평가 항목이다

이 노트가 1차와 2차로 나뉜 이유이기도 하다.

같은 문제를 두 번 고쳤는데, 첫 번째는 **기존 파일 본문을 60여 줄 수정**했고 두 번째는 **파일 몇 개를 추가**했을 뿐이다. 동작은 둘 다 정상이었지만 철회 비용이 전혀 달랐다.

| | 기존 파일 수정 | 파일 추가 |
|---|---|---|
| 철회 방법 | `revert` 커밋 + 검증 | 파일 삭제 |
| 공유 브랜치에 push된 뒤 | 타인 커밋과의 관계를 따져야 함 | 무관 |
| 리뷰어가 봐야 할 것 | 변경 전후 대조 | 새 파일 전체 |

**"코드가 몇 줄인가"보다 "잘못됐을 때 몇 분에 되돌리는가"가 실무에서 더 자주 문제가 된다.** 특히 남의 코드가 이미 위에 쌓인 공유 브랜치에서는 그렇다.

그리고 되돌린 뒤에 남는 기록도 중요하다 — **기각 사유는 적용 범위와 함께 적어야 한다.** "이 기법은 기각"이라고만 써두면, 범위만 바꾸면 성립하는 같은 기법을 다음에 스스로 막는다.
