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
    'entity-grid', // Add new section to the flow
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
      case 'entity-grid':
        initEntityGridSection();
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

      typeText(section, text, () => {
        // After typing completes, move to the entity grid section instead of details
        setTimeout(() => {
          debug('Typing complete, moving to entity grid section');
          activateSection('entity-grid');
        }, 2000);
      });
    }, 500);
  }

  // Initialize entity grid section
  function initEntityGridSection() {
    const section = document.getElementById('entity-grid');
    const gridContainer = section.querySelector('.grid-container');
    gridContainer.innerHTML = ''; // Clear any existing content

    // Generate a large number of entity IDs
    const totalEntities = 100;
    const targetIndex = Math.floor(Math.random() * totalEntities);
    const targetId = 'F123-232';

    // Create grid items
    for (let i = 0; i < totalEntities; i++) {
      const item = document.createElement('div');
      item.className = 'grid-item';

      // Generate different IDs, but make sure one is the target
      if (i === targetIndex) {
        item.textContent = targetId;
        item.dataset.isTarget = 'true';
      } else {
        // Generate random IDs with similar pattern
        const prefix = 'F';
        const mid = Math.floor(Math.random() * 999)
          .toString()
          .padStart(3, '0');
        const suffix = Math.floor(Math.random() * 999)
          .toString()
          .padStart(3, '0');
        item.textContent = `${prefix}${mid}-${suffix}`;
      }

      gridContainer.appendChild(item);
    }

    // Start scanning animation
    simulateScanning(() => {
      // Highlight target and then move to the next section
      highlightTarget(() => {
        setTimeout(() => {
          debug('Entity grid complete, moving to details section');
          activateSection('details-text');
        }, 2000);
      });
    });
  }

  // Function to simulate scanning animation
  function simulateScanning(callback) {
    const gridItems = document.querySelectorAll('.grid-item');
    let currentIndex = 0;
    const scanDelay = 50; // Time between scanning each item

    const scanNextItem = () => {
      if (currentIndex < gridItems.length) {
        gridItems[currentIndex].classList.add('scanning');

        setTimeout(() => {
          gridItems[currentIndex].classList.remove('scanning');
          currentIndex++;
          scanNextItem();
        }, scanDelay);
      } else {
        // Scanning complete
        if (callback) callback();
      }
    };

    // Start scanning after a short delay
    setTimeout(() => {
      scanNextItem();
    }, 1000);
  }

  // Function to highlight the target item
  function highlightTarget(callback) {
    const targetItem = document.querySelector(
      '.grid-item[data-is-target="true"]',
    );
    const otherItems = document.querySelectorAll(
      '.grid-item:not([data-is-target="true"])',
    );

    // Add target class for additional styling
    targetItem.classList.add('target');

    // Fade other items
    otherItems.forEach((item) => {
      item.classList.add('fade');
    });

    // Highlight target after a short delay
    setTimeout(() => {
      targetItem.classList.add('highlight');
      // Flash effect
      let flashCount = 0;
      const maxFlashes = 3;

      const flashInterval = setInterval(() => {
        targetItem.classList.toggle('highlight');

        setTimeout(() => {
          targetItem.classList.toggle('highlight');
          flashCount++;

          if (flashCount >= maxFlashes) {
            clearInterval(flashInterval);
            targetItem.classList.add('highlight');

            // Complete highlighting
            if (callback) callback();
          }
        }, 200);
      }, 600);
    }, 1000);
  }

  // Initialize details section
  function initDetailsSection() {
    const section = document.getElementById('details-text');
    const lines = Array.from(section.querySelectorAll('p'));
    section.innerHTML = ''; // Clear existing content

    // Recursive function to type each line sequentially
    function typeLine(index) {
      if (index >= lines.length) {
        // After all lines are typed, simulate DNA sequence discovery
        simulateDNASequence(() => {
          // After DNA sequence simulation, move to the next section
          setTimeout(() => {
            debug('Details complete, moving to scenario section');
            activateSection('scenario-section');
          }, 3000);
        });
        return;
      }

      const text = lines[index].textContent;
      const lineElement = document.createElement('p');
      section.appendChild(lineElement);

      // Handle survival-line separately due to the presence of a <span>
      if (lines[index].id === 'survival-line') {
        const span = lines[index].querySelector('span');
        const spanText = span.textContent;
        span.textContent = ''; // Clear existing span content

        // Append the static part of the line
        lineElement.textContent = '생존 기간: ';
        lineElement.appendChild(span);

        // Type the span content separately
        typeText(span, spanText, () => {
          typeLine(index + 1); // Proceed to the next line
        });
      } else {
        // Handle regular lines
        typeText(lineElement, text, () => {
          typeLine(index + 1); // Proceed to the next line
        });
      }
    }

    // Start typing from the first line
    typeLine(0);
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

// Function to type text one character at a time
function typeText(element, text, callback) {
  let index = 0;
  element.innerHTML = ''; // Clear existing content

  // Add cursor for typing effect
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  element.appendChild(cursor);

  const interval = setInterval(() => {
    if (index < text.length) {
      element.insertBefore(document.createTextNode(text.charAt(index)), cursor);
      index++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        if (cursor.parentNode === element) {
          element.removeChild(cursor); // Remove cursor after typing
        }
        if (callback) callback();
      }, 500);
    }
  }, 100); // Typing speed
}

// Function to simulate DNA sequence discovery
function simulateDNASequence(callback) {
  const section = document.getElementById('details-text');
  section.classList.add('scrolling'); // Add scrolling class for styling

  const contentWrapper = document.createElement('div');
  contentWrapper.style.position = 'absolute';
  contentWrapper.style.whiteSpace = 'pre-wrap';
  contentWrapper.style.textAlign = 'left';
  contentWrapper.style.width = '100%'; // Match parent width
  contentWrapper.style.margin = '0 auto';
  section.appendChild(contentWrapper);

  // Add existing lines to the wrapper
  const existingLines = Array.from(section.querySelectorAll('p'));
  existingLines.forEach((line) => {
    line.style.textAlign = 'left'; // Ensure consistent alignment
    line.style.margin = '0'; // Remove default margins
    contentWrapper.appendChild(line);
  });

  // Generate DNA sequence lines
  const dnaCharacters = 'ATCG';
  let lineCount = 0;
  let delay = 200; // Start with a slower delay
  const lineHeight = 12; // Fixed line height in pixels

  function addDNALine() {
    if (lineCount < 100) {
      const newLine = Array.from({ length: 60 }, () =>
        dnaCharacters.charAt(Math.floor(Math.random() * dnaCharacters.length)),
      ).join('');
      const dnaLine = document.createElement('p');
      dnaLine.textContent = newLine;
      dnaLine.style.textAlign = 'left'; // Ensure consistent alignment
      dnaLine.style.margin = '0'; // Remove default margins
      contentWrapper.appendChild(dnaLine);

      // Scroll the entire content upwards
      contentWrapper.style.transform = `translateY(-${lineCount * lineHeight}px)`;
      lineCount++;

      // Gradually speed up after the first 10 lines
      if (lineCount === 10) {
        delay = 50; // Increase speed
      }

      setTimeout(addDNALine, delay);
    } else {
      // After all lines are loaded, display "로드 완료"
      setTimeout(() => {
        const loadLine = document.createElement('p');
        loadLine.id = 'load-line';
        loadLine.textContent = '로드 완료.';
        loadLine.style.textAlign = 'left'; // Ensure consistent alignment
        loadLine.style.margin = '0'; // Remove default margins
        contentWrapper.appendChild(loadLine);

        section.classList.remove('scrolling'); // Remove scrolling class
        if (callback) callback();
      }, 500); // Delay before showing "로드 완료"
    }
  }

  // Delay the start of DNA sequence lines by 3 seconds
  setTimeout(() => {
    addDNALine();
  }, 3000);
}
