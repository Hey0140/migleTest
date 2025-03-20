document.addEventListener('DOMContentLoaded', () => {
  const cameraElement = document.getElementById('camera');
  const matrixBackground = document.getElementById('matrix-background');
  const statusMessage = document.getElementById('status-message');
  const guideCircle = document.getElementById('guide-circle');
  const guideText = document.getElementById('guide-text');

  // 카메라 설정
  async function setupCamera() {
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraElement.srcObject = stream;

      return new Promise((resolve) => {
        cameraElement.onloadedmetadata = () => {
          cameraElement.play();
          // 카메라 즉시 표시하고 활성화 상태 유지
          setTimeout(() => {
            cameraElement.classList.add('active');
            console.log('Camera activated');
          }, 500);
          resolve(cameraElement);
        };
      });
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      statusMessage.textContent = '카메라를 사용할 수 없습니다.';
      statusMessage.classList.add('active');
    }
  }

  // 얼굴 인식 감지 함수 - 키보드 'F' 키로 트리거
  function detectFace() {
    statusMessage.textContent = '얼굴 인식 중...';
    statusMessage.classList.add('active');

    // 실제 얼굴 인식 대신 잠시 타이머 후 완료로 처리
    setTimeout(() => {
      completeDetection();
    }, 1500);
  }

  // 개체 인식 완료 처리 함수
  window.completeDetection = function () {
    statusMessage.textContent = '개체 인식 완료';

    // 가이드 원과 텍스트 숨기기
    guideCircle.style.display = 'none';
    guideText.style.display = 'none';

    // Dim matrix but keep it running - use the new public method
    if (window.dimMatrix) {
      window.dimMatrix(0.2); // Pass opacity level (0.2 = 20% visible)
    } else {
      // Fallback if function not available
      matrixBackground.classList.add('fade-out');
    }

    // Call the face recognition complete function
    onFaceRecognitionComplete();
  };

  // 키보드 이벤트 리스너
  document.addEventListener('keydown', (event) => {
    // 'F' 키를 누르면 얼굴 인식 시작
    if (event.code === 'KeyF') {
      detectFace();
    }
    // 'Space' 키를 누르면 즉시 인식 완료
    else if (event.code === 'Space') {
      completeDetection();
    }
    // 'R' 키를 누르면 카메라 다시 활성화 (문제 해결용)
    else if (event.code === 'KeyR') {
      cameraElement.classList.add('active');
      console.log('Camera reactivated');
    }
  });

  // 카메라 초기화 및 시작
  setupCamera().then(() => {
    console.log('카메라 초기화 완료');
    // 카메라 요소가 활성화되었는지 확인
    setTimeout(() => {
      if (!cameraElement.classList.contains('active')) {
        console.log('Camera not active, activating now');
        cameraElement.classList.add('active');
      }
    }, 1000);
  });

  // This function should be called when face recognition is successful
  function onFaceRecognitionComplete() {
    // Update status message
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = '인식 완료! 잠시만 기다려주세요...';

    // Wait a moment for the user to see the completion message
    setTimeout(() => {
      // Call the main flow function from script.js
      if (typeof window.startFlowAfterRecognition === 'function') {
        // Make sure other containers are visible
        const container = document.querySelector('.container');
        if (container) {
          container.style.visibility = 'visible';
          container.style.display = 'flex';
          container.style.zIndex = '5';
          console.log('Container visibility enforced');
        }

        window.startFlowAfterRecognition();
      } else {
        console.error('startFlowAfterRecognition function not found');
      }
    }, 1500);
  }
});
