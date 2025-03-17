document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const matrixBackground = document.getElementById('matrix-background');

  // Set canvas styles to ensure it's behind other elements
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '0'; // Ensure canvas is at the lowest z-index

  matrixBackground.appendChild(canvas);

  // 전체 화면 크기로 캔버스 설정
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // 매트릭스 효과 설정
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = [];

  // 초기 위치 설정
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor((Math.random() * canvas.height) / fontSize);
  }

  // 매트릭스 문자 생성 함수
  function getMatrixCharacter() {
    const characters = '01';
    return characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // 매트릭스 효과 그리기
  function drawMatrix() {
    // 반투명 검은 배경으로 페이드 효과 생성
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0'; // 매트릭스 초록색
    ctx.font = `${fontSize}px monospace`;

    // 각 열에 대해
    for (let i = 0; i < drops.length; i++) {
      // 무작위 문자 그리기
      const text = getMatrixCharacter();
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      // 문자가 화면 바닥에 닿으면 다시 위로 올리기 (일정 확률)
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      // 문자를 아래로 이동
      drops[i]++;
    }
  }

  // 매트릭스 효과 애니메이션 시작
  function animateMatrix() {
    if (!matrixBackground.classList.contains('fade-out')) {
      drawMatrix();
    }
    requestAnimationFrame(animateMatrix);
  }

  animateMatrix();
});
