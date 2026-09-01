# ========================================
# Vercel Serverless Function (Python)
# 프론트엔드(js/recommend.js)가 POST /api/recommend 로 보낸
# { mood, genre, time } 을 받아 Gemini API에게 책 추천을 요청하고,
# { books: [{ title, author, reason }, ...] } 형태로 응답한다.
#
# Vercel의 Python 런타임은 이 파일 안에 BaseHTTPRequestHandler를
# 상속한 `handler` 클래스가 있으면 그것을 서버리스 함수로 인식한다.
# ========================================

import json
import os
from http.server import BaseHTTPRequestHandler

from google import genai

# API 키는 코드에 직접 적지 않고 Vercel 환경 변수(GEMINI_API_KEY)에서 읽어온다.
# 이렇게 하면 키가 GitHub 저장소나 화면에 노출되지 않는다.
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

MODEL_NAME = "gemini-3.7-flash"


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # ---- 1) 요청 본문(JSON) 읽기 ----
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length) if content_length else b"{}"

        try:
            body = json.loads(raw_body)
        except json.JSONDecodeError:
            self._send_json(400, {"error": "요청 형식이 올바르지 않습니다."})
            return

        mood = (body.get("mood") or "").strip()
        genre = (body.get("genre") or "").strip()
        time = (body.get("time") or "").strip()

        # ---- 2) 서버 쪽에서도 빈 입력을 한 번 더 검증 (프론트만 믿지 않음) ----
        if not mood or not genre or not time:
            self._send_json(400, {"error": "mood, genre, time 값이 모두 필요합니다."})
            return

        # ---- 3) Gemini API 호출 ----
        try:
            books = self._get_recommendations(mood, genre, time)
        except Exception:
            # 네트워크 오류, 타임아웃, API 오류(4xx/5xx) 등을 모두 500으로 통일해서 응답
            self._send_json(500, {"error": "AI 추천을 생성하는 중 오류가 발생했습니다."})
            return

        self._send_json(200, {"books": books})

    def _get_recommendations(self, mood, genre, time):
        """Gemini에게 책 3권 추천을 요청하고 파싱된 리스트를 반환한다."""
        prompt = f"""당신은 친절한 AI 사서입니다.
아래 조건에 맞는 책을 정확히 3권 추천해주세요.

- 오늘의 기분: {mood}
- 좋아하는 장르/소재: {genre}
- 오늘 읽을 수 있는 시간: {time}

실제로 존재하는 책 위주로 추천하고, 다른 설명 없이 아래 JSON 형식으로만 답변하세요.
{{
  "books": [
    {{"title": "책 제목", "author": "저자", "reason": "이 조건에 이 책을 추천하는 이유 (2문장 이내)"}}
  ]
}}"""

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        text = response.text
        # Gemini가 JSON 앞뒤에 다른 텍스트(코드블록 표시 등)를 붙이는 경우를 대비해 {}로 감싸인 부분만 추출
        start = text.index("{")
        end = text.rindex("}") + 1
        parsed = json.loads(text[start:end])
        return parsed.get("books", [])

    def _send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
