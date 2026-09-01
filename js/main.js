// ========================================
// 공통 스크립트: 모바일 네비게이션 토글
// 모든 페이지의 <header>에 있는 햄버거 버튼(.nav-toggle)을 눌렀을 때
// 메뉴(.nav-menu)를 열고 닫는 역할만 담당한다.
// ========================================

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("is-open");

    // 버튼에 현재 열림/닫힘 상태를 알려줘서 스크린리더 접근성도 함께 챙긴다.
    const isOpen = navMenu.classList.contains("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
