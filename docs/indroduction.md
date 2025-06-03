## Introduction

Lexical은 신뢰성, 접근성, 성능을 핵심 가치로 삼는 확장 가능한 JavaScript 웹 텍스트 편집기 프레임워크입니다. 최고의 개발자 경험을 제공하는 것을 목표로 하며, 자신 있게 기능을 프로토타이핑하고 구현할 수 있도록 설계되었습니다.
고도로 유연한 아키텍처를 바탕으로, Lexical은 규모와 기능 요구에 따라 쉽게 확장할 수 있는 맞춤형 텍스트 편집기를 만들 수 있게 해줍니다.

Lexical은 `contentEditable` 요소에 연결되어 동작하며, 이후에는 선언형 API를 통해 DOM의 복잡한 예외 상황을 신경 쓰지 않고도 다양한 편집 기능을 구현할 수 있습니다. 대부분의 경우 DOM을 직접 다룰 필요가 없으며, 사용자 정의 노드를 만들 때만 예외적으로 DOM 접근이 필요합니다.

Lexical의 모듈형 아키텍처는 필요한 기능만 선택적으로 사용할 수 있도록 설계되어 있습니다.
핵심 패키지의 용량은 압축 기준 약 22KB로 매우 가볍고, 필요한 기능에 대해서만 비용(성능, 용량 등)을 지불하면 됩니다.
편집기의 요구사항이 확장됨에 따라 Lexical도 함께 확장할 수 있습니다.

또한, 지연 로딩(lazy-loading)을 지원하는 프레임워크와 함께 사용할 경우, 사용자가 실제로 편집기에 상호작용할 때까지 플러그인을 로드하지 않도록 하여 초기 성능을 최적화할 수 있습니다.

---

## What can be built with Lexical?

Lexical은 브라우저 기본 기능만으로는 구현하기 어려운 고급 텍스트 편집기를 쉽게 만들 수 있도록 설계되었습니다.
개발자가 빠르게 움직이며 다양한 텍스트 편집 환경을 구축할 수 있도록 유연한 구조를 제공합니다.
예를 들면 다음과 같습니다:

- 단순하지만 `<textarea>`보다 더 많은 기능이 필요한 입력기 (예: 멘션, 커스텀 이모지, 링크, 해시태그 등)
- 블로그, SNS, 메신저 등에서 사용하는 고급 리치 텍스트 편집기
- CMS와 같은 콘텐츠 관리 시스템에서 사용하는 완전한 WYSIWYG 에디터
- 위 기능들을 조합한 실시간 협업 텍스트 편집 환경

Lexical은 **텍스트 편집 UI 프레임워크**로 볼 수 있습니다.
현재는 웹에서만 사용할 수 있지만, Meta에서는 네이티브 플랫폼에서도 동작하는 버전을 실험 중입니다.

Meta는 Facebook, Workplace, Messenger, WhatsApp, Instagram 등 다양한 제품에서 Lexical을 사용해 매일 수억 명의 사용자에게 안정적인 텍스트 편집 환경을 제공하고 있습니다.

---

## Lexical's Design

### Conceptual View

Lexical은 외부 의존성이 없는 텍스트 편집기 프레임워크입니다.
간단하지만 강력한 편집기를 구축할 수 있도록 다음과 같은 핵심 개념을 중심으로 구성되어 있습니다:

#### Editor Instance

편집기의 중심 객체로, `contentEditable` DOM 요소를 연결하고, 리스너 및 커맨드 등록, 상태 업데이트 등의 기능을 제공합니다.
`createEditor()` API로 직접 생성할 수 있지만, React 환경에서는 `@lexical/react` 패키지를 통해 자동으로 생성됩니다.

#### Editor State

EditorState는 편집기 상태를 표현하는 데이터 모델로, 다음 두 요소로 구성됩니다:

- Lexical 노드 트리
- 선택 영역(Selection)

이 상태는 불변이며, 변경하려면 `editor.update(() => {...})`를 사용해야 합니다.
Node Transform 또는 Command Handler를 통해 상태 업데이트 흐름에 후킹(hooking)할 수 있으며, 무한 루프나 중복 업데이트를 방지합니다.

EditorState는 JSON으로 직렬화하거나, `editor.parseEditorState()`를 사용해 복원할 수 있습니다.

---

## Reading and Updating Editor State

Lexical의 상태를 읽거나 수정하려면 반드시 특정 API 컨텍스트 내에서 작업해야 합니다.
상태 업데이트는 `editor.update(() => {...})`에서 수행하며, 읽기 작업은 `editor.read(() => {...})` 또는 `editor.getEditorState().read(() => {...})`로 처리할 수 있습니다.

Lexical에서는 `$` 기호로 시작하는 함수들(예: `$getRoot()`)은 반드시 해당 컨텍스트 안에서만 호출되어야 합니다.
컨텍스트 밖에서 호출하면 런타임 오류가 발생합니다.

React Hooks에 익숙하다면 다음과 같은 유사점이 있습니다:

| 항목             | React Hook              | Lexical \$ 함수         |
| ---------------- | ----------------------- | ----------------------- |
| 네이밍 규칙      | `useFunction`           | `$function`             |
| 호출 가능한 위치 | 렌더링 중               | `read` 또는 `update` 중 |
| 중첩 호출 가능   | 가능                    | 가능                    |
| 동기 실행 요구   | ✅                      | ✅                      |
| 기타 제약        | 동일한 순서로 호출 필수 | 없음                    |

> Node Transform 및 Command Listener는 자동으로 `editor.update()` 컨텍스트 안에서 실행됩니다.

중첩 호출 관련 규칙:

- ✅ `editor.update(() => editor.update(() => {...}))` → 허용
- ✅ `editor.update(() => editor.read(() => {...}))` → 허용
- ❌ `editor.read(() => editor.update(() => {...}))` → **오류 발생**

Lexical 노드는 항상 특정 EditorState에 연결되어 있으므로, 노드의 메서드나 속성 접근은 해당 상태 컨텍스트 내에서만 유효합니다.
Lexical은 항상 최신 노드를 반환하도록 설계되어 있어 불변성과 시간 여행(Undo/Redo 등)을 지원합니다.

> 💡 `editor.read()`는 모든 대기 중인 업데이트가 반영된 상태에서 호출되므로 항상 일관된 상태를 제공합니다.
> 반면 `editor.update()` 중에는 아직 트랜스폼이나 DOM 리플렉션이 완료되지 않은 상태일 수 있습니다.

---

## DOM Reconciler

Lexical은 자체 DOM 리컨실러를 갖추고 있어, **현재 상태**와 **대기 중 상태**를 비교하여 변경된 부분만 DOM에 반영합니다.
이는 일반적인 가상 DOM과 유사하지만, Lexical은 어떤 노드가 바뀌었는지 정확히 알고 있으므로 불필요한 diff 연산을 줄일 수 있습니다.

이 리컨실러는 `contentEditable` 환경에 최적화되어 있으며, LTR/RTL 방향성도 자동으로 처리합니다.

---

## Listeners, Node Transforms and Commands

Lexical에서는 편집기 업데이트 외에도 리스너, 노드 트랜스폼, 커맨드를 통해 다양한 작업을 수행할 수 있습니다.
모든 기능은 `register*()` 형태의 메서드로 등록하며, 반환된 함수는 등록 해제에 사용됩니다.

예: 업데이트 리스너 등록

```js
const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
  console.log(editorState);
});

// 나중에 해제
unregisterListener();
```

### 커맨드

Lexical의 커맨드는 내부 이벤트 및 플러그인 간 통신을 위한 메커니즘입니다.

- `createCommand()`로 커스텀 커맨드 생성
- `editor.dispatchCommand(command, payload)`로 실행
- `editor.registerCommand(command, handler, priority)`로 처리기 등록

커맨드는 우선순위에 따라 전파되며, 브라우저 이벤트처럼 한 핸들러가 처리되면 이후 핸들러는 실행되지 않습니다.
