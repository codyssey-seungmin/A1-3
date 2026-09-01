// ========================================
// AI 책 추천 페이지 로직
// 흐름: 폼 제출 → 입력값 검증 → /api/recommend에 fetch 요청 → 응답을 화면에 렌더링
// 실패 케이스 3가지를 모두 사용자에게 안내한다: 빈 입력 / API 오류 / 응답 지연(타임아웃)
// ========================================

const form = document.getElementById("recommend-form");
const messageEl = document.getElementById("form-message");
const resultArea = document.getElementById("result-area");
const submitBtn = document.getElementById("submit-btn");

// 응답이 이 시간(ms)을 넘기면 "지연" 처리로 간주하고 요청을 중단한다.
const TIMEOUT_MS = 15000;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const mood = form.mood.value.trim();
  const genre = form.genre.value.trim();
  const time = form.time.value.trim();

  // ---- 1) 빈 입력(필수값 누락) 처리 ----
  const invalidFields = [
    { el: form.mood, value: mood },
    { el: form.genre, value: genre },
    { el: form.time, value: time },
  ];

  let hasEmpty = false;
  for (const field of invalidFields) {
    if (!field.value) {
      field.el.classList.add("invalid");
      hasEmpty = true;
    } else {
      field.el.classList.remove("invalid");
    }
  }

  if (hasEmpty) {
    showMessage("모든 항목을 입력해주세요.", "error");
    return;
  }

  await requestRecommendation({ mood, genre, time });
});

async function requestRecommendation(payload) {
  setLoading(true);
  showMessage("", "");
  resultArea.innerHTML = "";

  // AbortController로 일정 시간 넘게 응답이 없으면 요청을 강제로 취소한다.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // ---- 2) API 오류(4xx/5xx) 처리 ----
    if (!response.ok) {
      showMessage("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
      return;
    }

    const data = await response.json();
    renderBooks(data.books);
  } catch (error) {
    if (error.name === "AbortError") {
      // ---- 3) 지연/타임아웃 처리 ----
      showMessage("응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.", "error");
    } else {
      showMessage("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.", "error");
    }
  } finally {
    clearTimeout(timer);
    setLoading(false);
  }
}

function renderBooks(books) {
  if (!books || books.length === 0) {
    showMessage("추천 결과를 가져오지 못했어요. 잠시 후 다시 시도해주세요.", "error");
    return;
  }

  resultArea.innerHTML = books
    .map(
      (book) => `
        <article class="book-card">
          <h3>${escapeHtml(book.title)}</h3>
          <p class="author">${escapeHtml(book.author)}</p>
          <p>${escapeHtml(book.reason)}</p>
        </article>
      `
    )
    .join("");
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    resultArea.innerHTML = `
      <div class="loading">
        <span class="spinner"></span>
        <span>AI 사서가 책을 고르고 있어요...</span>
      </div>
    `;
  }
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = "form-message" + (type ? " " + type : "");
}

// 사용자 입력을 그대로 HTML에 넣으면 XSS 위험이 있으므로 특수문자를 이스케이프한다.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
