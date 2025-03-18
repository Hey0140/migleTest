document.addEventListener('DOMContentLoaded', () => {
  // Setup debug overlay
  const debugElement = document.getElementById('debug-overlay');

  function debug(message) {
    console.log(message);
    debugElement.textContent = message;
  }

  // Define sections in sequence
  const SECTIONS = [
    'typing-text',
    'details-text',
    'scenario-section',
    'overlay',
    'final-message',
  ];

  // IMPORTANT: Ensure all content sections are hidden at startup
  function initializeHiddenSections() {
    debug('Initializing - hiding all content sections');
    SECTIONS.forEach((id) => {
      const section = document.getElementById(id);
      // Force hide with multiple properties to ensure it's completely hidden
      section.classList.remove('active');
      section.style.display = 'none';
      section.style.visibility = 'hidden';
      section.style.opacity = '0';
      section.style.zIndex = '-10';
    });
  }

  // Call initialization function immediately
  initializeHiddenSections();

  // Function to activate a single section
  function activateSection(sectionId) {
    debug(`Activating section: ${sectionId}`);

    // First, deactivate all sections
    SECTIONS.forEach((id) => {
      const section = document.getElementById(id);
      section.classList.remove('active');
      // Force apply styles to ensure it's hidden
      section.style.opacity = '0';
      section.style.visibility = 'hidden';
      debug(`Deactivated section: ${id}`);
    });

    // Then activate the requested section
    const section = document.getElementById(sectionId);
    section.classList.add('active');
    // Force apply styles to ensure it's visible
    section.style.opacity = '1';
    section.style.visibility = 'visible';
    debug(
      `Section ${sectionId} visible status: ${getComputedStyle(section).visibility}, opacity: ${getComputedStyle(section).opacity}, z-index: ${getComputedStyle(section).zIndex}`,
    );

    // Handle specific section initialization
    switch (sectionId) {
      case 'typing-text':
        initTypingSection();
        break;
      case 'details-text':
        initDetailsSection();
        break;
      case 'scenario-section':
        initScenarioSection();
        break;
      case 'overlay':
        initOverlaySection();
        break;
      case 'final-message':
        debug('Final message shown');
        break;
    }
  }

  // Function to fade background
  function fadeBackground() {
    const background = document.getElementById('background');
    background.classList.add('fadeout');
  }

  // Initialize typing text section
  function initTypingSection() {
    const section = document.getElementById('typing-text');
    section.innerHTML = '';

    // Create and add typing animation
    setTimeout(() => {
      const text = '당신이 올 것을 알고 있었습니다.';

      function typeText(element, text, callback) {
        let index = 0;
        element.innerHTML = '';

        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        element.appendChild(cursor);

        const interval = setInterval(() => {
          if (index < text.length) {
            element.insertBefore(
              document.createTextNode(text.charAt(index)),
              cursor,
            );
            index++;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              if (cursor.parentNode === element) {
                element.removeChild(cursor);
              }
              if (callback) callback();
            }, 500);
          }
        }, 100);
      }

      typeText(section, text, () => {
        // After typing completes, wait and move to next section
        setTimeout(() => {
          activateSection('details-text');
        }, 2000);
      });
    }, 500);
  }

  // Initialize details section
  function initDetailsSection() {
    // Reset all lines
    const lines = document.querySelectorAll('#details-text p');
    lines.forEach((line) => {
      line.classList.remove('visible');
    });

    // Show each line sequentially
    let delay = 500;
    document.querySelectorAll('#details-text p').forEach((line, index) => {
      setTimeout(() => {
        line.classList.add('visible');

        // If this is the survival line, start counter
        if (line.id === 'survival-line') {
          startSurvivalCounter();
        }

        // After all lines shown, wait and move to next section
        if (index === lines.length - 1) {
          setTimeout(() => {
            activateSection('scenario-section');
          }, 3000);
        }
      }, delay);
      delay += 800;
    });
  }

  // Initialize scenario section
  function initScenarioSection() {
    // Start playing videos
    document.querySelectorAll('#scenario-section video').forEach((video) => {
      video.play().catch((e) => console.error('Video play error:', e));
    });

    // After delay, move to next section
    setTimeout(() => {
      activateSection('overlay');
    }, 5000);
  }

  // Initialize overlay section
  function initOverlaySection() {
    const button = document.getElementById('play-button');
    button.disabled = true;

    // Enable button after delay
    setTimeout(() => {
      button.disabled = false;

      // Remove existing listeners and create new one
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      // Add click handler for final section
      document.getElementById('play-button').addEventListener('click', () => {
        activateSection('final-message');
      });
    }, 2000);
  }

  // Start survival counter
  function startSurvivalCounter() {
    const element = document.getElementById('survival-time');
    let hours = 13241;
    let minutes = 2134;

    setInterval(() => {
      minutes++;
      if (minutes >= 60) {
        minutes = 0;
        hours++;
      }
      element.textContent = `${hours}h ${minutes}min`;
    }, 1000);
  }

  // Function to start main flow after face recognition
  window.startFlowAfterRecognition = function () {
    debug('Starting main flow after face recognition');

    // Make sure all sections are hidden before starting flow
    initializeHiddenSections();

    // Hide camera interface but ensure matrix stays visible
    const cameraContainer = document.getElementById('camera-container');
    cameraContainer.style.opacity = '0';
    cameraContainer.style.transition = 'opacity 1s ease-out';

    setTimeout(() => {
      // Remove camera from DOM flow
      cameraContainer.style.display = 'none';
      cameraContainer.style.position = 'absolute';
      cameraContainer.style.zIndex = '-1';

      // Ensure content container is above matrix
      const contentContainer = document.querySelector('.content-container');
      contentContainer.style.zIndex = '10';
      contentContainer.style.position = 'fixed';
      debug(
        `Content container z-index: ${getComputedStyle(contentContainer).zIndex}`,
      );

      // Make sure matrix continues running but with lower z-index
      if (window.stopMatrixCode) {
        window.stopMatrixCode = false;
      }

      const matrixContainer = document.getElementById('matrix-container');
      if (matrixContainer) {
        matrixContainer.style.zIndex = '1';
        debug(
          `Matrix container z-index: ${getComputedStyle(matrixContainer).zIndex}`,
        );
      }

      // Fade background and start first section
      fadeBackground();
      setTimeout(() => {
        debug('Activating first section');
        activateSection('typing-text');
      }, 1500);
    }, 1000);
  };

  // Keyboard shortcuts for testing
  document.addEventListener('keydown', (event) => {
    // Numbers 1-5 to jump to sections
    if (event.key >= '1' && event.key <= '5') {
      const index = parseInt(event.key) - 1;
      if (index >= 0 && index < SECTIONS.length) {
        activateSection(SECTIONS[index]);
      }
    }
  });
});
