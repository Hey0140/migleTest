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

  // Function to activate a single section with improved transitions
  function activateSection(sectionId) {
    debug(`Activating section: ${sectionId}`);

    // Find current active section
    const currentActiveSection = document.querySelector(
      '.content-section.active',
    );
    const newSection = document.getElementById(sectionId);

    if (!newSection) {
      debug(`ERROR: Section with ID ${sectionId} not found!`);
      return;
    }

    // If there's an active section, fade it out first
    if (currentActiveSection && currentActiveSection.id !== sectionId) {
      debug(`Fading out section: ${currentActiveSection.id}`);

      // Track whether transition was completed
      let transitionCompleted = false;

      // Listen for transition end
      const transitionEndHandler = (e) => {
        if (e.propertyName === 'opacity') {
          debug(`Fade out transition completed for ${currentActiveSection.id}`);
          transitionCompleted = true;
          currentActiveSection.removeEventListener(
            'transitionend',
            transitionEndHandler,
          );

          // Now hide the section and show the new one
          currentActiveSection.classList.remove('active');

          // Show new section with fade-in
          setTimeout(() => {
            fadeInSection(newSection, sectionId);
          }, 50); // Small delay to ensure proper rendering
        }
      };

      // Add transition end listener
      currentActiveSection.addEventListener(
        'transitionend',
        transitionEndHandler,
      );

      // Force reflow
      void currentActiveSection.offsetWidth;

      // Trigger the fade out
      currentActiveSection.style.opacity = '0';

      // Fallback timeout in case transition event doesn't fire
      setTimeout(() => {
        if (!transitionCompleted) {
          debug(`Fallback: Fade out timeout for ${currentActiveSection.id}`);
          currentActiveSection.removeEventListener(
            'transitionend',
            transitionEndHandler,
          );

          // Hide the section
          currentActiveSection.classList.remove('active');

          // Show new section
          fadeInSection(newSection, sectionId);
        }
      }, 1500); // Longer than transition time as safety
    } else {
      // No current active section, just fade in the new one
      fadeInSection(newSection, sectionId);
    }
  }

  // Helper function for fading in a section
  function fadeInSection(section, sectionId) {
    debug(`Preparing to fade in: ${sectionId}`);

    section.style.opacity = '0';
    section.style.display = 'flex';
    section.style.visibility = 'visible';
    section.style.zIndex = '30';
    section.classList.add('active');

    // Special handling for details-text alignment
    if (sectionId === 'details-text') {
      section.style.alignItems = 'flex-start'; // Left-align text
    } else {
      section.style.alignItems = 'center'; // Center horizontally
    }

    // Trigger the fade in (in next frame to ensure styles are applied)
    // Use a longer delay to ensure the browser has time to apply styles
    setTimeout(() => {
      debug(`Fading in section: ${sectionId}`);
      section.style.opacity = '1';

      // Log when fade-in completes
      const fadeInComplete = (e) => {
        if (e.propertyName === 'opacity') {
          debug(`Fade in completed for ${sectionId}`);
          section.removeEventListener('transitionend', fadeInComplete);
        }
      };

      section.addEventListener('transitionend', fadeInComplete);
    }, 100);

    // Initialize section content based on type
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
        // After typing completes, wait longer before moving to next section
        // Increased from 2000ms to 3500ms to ensure transition is visible
        setTimeout(() => {
          debug('Typing complete, moving to details section');
          activateSection('details-text');
        }, 3500);
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

        // After all lines shown, wait longer before moving to next section
        // Increased from 3000ms to 5000ms to ensure transition is visible
        if (index === lines.length - 1) {
          setTimeout(() => {
            debug('Details complete, moving to scenario section');
            activateSection('scenario-section');
          }, 5000);
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

    // After longer delay, move to next section
    // Increased from 5000ms to 8000ms to ensure transition is visible
    setTimeout(() => {
      debug('Scenario complete, moving to overlay section');
      activateSection('overlay');
    }, 8000);
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

      // Ensure content container and wrapper are visible and centered
      const contentContainer = document.querySelector('.content-container');
      contentContainer.style.zIndex = '10';
      contentContainer.style.position = 'fixed';
      contentContainer.style.display = 'flex';
      contentContainer.style.justifyContent = 'center';
      contentContainer.style.alignItems = 'center';
      contentContainer.style.height = '100%'; // Ensure full height
      contentContainer.style.width = '100%'; // Ensure full width

      // Explicitly set content wrapper position and size
      const contentWrapper = document.getElementById('content-wrapper');
      if (contentWrapper) {
        contentWrapper.style.position = 'absolute';
        contentWrapper.style.display = 'flex';
        contentWrapper.style.flexDirection = 'column';
        contentWrapper.style.justifyContent = 'center'; // Critical for vertical centering
        contentWrapper.style.alignItems = 'center';
        contentWrapper.style.height = '100%'; // Ensure full height
        contentWrapper.style.width = '100%'; // Ensure full width
        contentWrapper.style.top = '0';
        contentWrapper.style.bottom = '0';
        contentWrapper.style.margin = 'auto 0'; // Center vertically
        debug('Content wrapper positioned for vertical centering');
      }

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
