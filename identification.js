let elapsedSeconds = 0;

function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
}

function showIdentificationInfo() {
  const infoContainer = document.getElementById('infoContainer');
  infoContainer.style.display = 'block';

  // 첫 문구 표시
  infoContainer.innerHTML = '당신이 올 것을 알고 있었습니다.';

  // 1.5초 후 나머지 정보 표시
  setTimeout(() => {
    infoContainer.innerHTML = '당신이 올 것을 알고 있었습니다.\n\n';

    const baseText = '고유 식별코드: F123-232\n물체 정보: 유기체.\n생존 기간: ';
    infoContainer.innerHTML += baseText;

    // 타이머 요소 생성
    let timerElement = document.createElement('span');
    infoContainer.appendChild(timerElement);
    infoContainer.innerHTML += '\n\n';

    // DNA 시퀀스 요소 생성
    let dnaText = document.createElement('div');
    infoContainer.appendChild(dnaText);

    // 타이머 시작
    let targetTime = 13241 * 3600 + 2134 * 60; // 목표값 (초 단위)
    let updateInterval = 400; // 400ms마다 업데이트
    let stepIncrease = Math.floor(targetTime / (3000 / updateInterval)); // 3초 내 도달 목표

    let timerInterval = setInterval(() => {
      elapsedSeconds += stepIncrease;
      timerElement.innerText = formatTime(elapsedSeconds);

      if (elapsedSeconds >= targetTime) {
        clearInterval(timerInterval);

        // DNA 시퀀스 표시
        let dnaSequence =
          'DNA 염기 서열:\n' +
          'ATGCGTACGTTAGCCTAGGCTTACGGAATCCGATGCTAGGCTTGA\n' +
          'TAGGTGATATTAAACCGAGCTGCTGTGCGTATCAGCGGCCGTTAG\n' +
          'ACTGTCGCATATGTGGTGCGTATAGAGCCGAATAGCCTAGTTGTA\n' +
          'GTGAGGGTTGGCTGTTGCTAGCGTATTAAGTTGGGCTTACACCGT\n' +
          'AGGGTGCGGTACGGGGCGGTAGTTCTTACTTACTTACGGCTTGGA...\n\n로드 완료.';

        setTimeout(() => {
          let dnaIndex = 0;
          let dnaTyping = setInterval(() => {
            if (dnaIndex < dnaSequence.length) {
              dnaText.innerHTML += dnaSequence[dnaIndex];
              dnaIndex++;
            } else {
              clearInterval(dnaTyping);

              // 2초 동안 "로드 완료." 상태 유지
              setTimeout(() => {
                // 블랙아웃 효과: 오버레이를 만들어서 fade in 처리
                let overlay = document.createElement('div');
                overlay.id = 'blackoutOverlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.backgroundColor = 'black';
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 1s ease-in-out';
                overlay.style.zIndex = '30';
                document.body.appendChild(overlay);

                // 강제로 reflow를 발생시켜 transition이 적용되도록 함
                window.getComputedStyle(overlay).opacity;
                overlay.style.opacity = '1';

                // fade in 완료 후 1초 뒤 페이지 이동
                setTimeout(() => {
                  window.location.href = 'second.html';
                }, 1000);
              }, 2000); // "로드 완료." 출력 후 2초 대기
            }
          }, 10);
        }, 1000);
      }
    }, updateInterval);
  }, 1500);
}

// 얼굴이 감지됐을 때 호출되는 함수
function onFaceDetected() {
  document.getElementById('guideOverlay').style.display = 'none';

  // 매트릭스에 블러 효과
  window.Matrix.blur();

  // 잠시 대기 후 식별 정보 표시
  setTimeout(() => {
    showIdentificationInfo();
  }, 1000);
}

// 리모컨 버튼 입력 리스너
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    // 필요에 따라 키를 변경하세요
    onFaceDetected();
  }
});
