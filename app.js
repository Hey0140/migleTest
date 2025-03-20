// Application Controller - Manages app flow and background animations
class AppController {
  constructor() {
    // Animation controller - will be set when an animation module is loaded
    this.animationController = null;

    // DOM elements cache
    this.elements = {
      camera: document.getElementById('camera'),
      cameraContainer: document.getElementById('camera-container'),
      guideCircle: document.getElementById('guide-circle'),
      guideText: document.getElementById('guide-text'),
      statusMessage: document.getElementById('statusMessage'),
      debugOverlay: document.getElementById('debug-overlay'),
      contentSections: document.querySelectorAll('.content-section'),
      playButton: document.getElementById('play-button'),
    };

    // Application state
    this.state = {
      faceDetected: false,
      currentSection: 'camera',
      animationActive: false,
    };

    // Bind methods
    this.initializeApp = this.initializeApp.bind(this);
    this.handleFaceDetected = this.handleFaceDetected.bind(this);
    this.showSection = this.showSection.bind(this);
    this.debug = this.debug.bind(this);
  }

  // Initialize application
  initializeApp() {
    // Set up event listeners
    document.addEventListener('faceDetected', this.handleFaceDetected);

    // Create global event dispatchers
    window.dispatchFaceDetected = () => {
      document.dispatchEvent(new CustomEvent('faceDetected'));
      this.debug('Face detected event dispatched');
    };

    this.debug('App controller initialized');
  }

  // Register an animation controller
  registerAnimationController(controller) {
    if (controller && typeof controller.initialize === 'function') {
      this.animationController = controller;
      this.animationController.initialize();
      this.state.animationActive = true;
      this.debug('Animation controller registered');
    } else {
      console.error('Invalid animation controller provided');
    }
  }

  // Handle face detection event
  handleFaceDetected() {
    this.state.faceDetected = true;
    this.debug('Face detected, changing to content view');

    // Hide camera UI
    this.elements.cameraContainer.style.display = 'none';

    // Start content flow
    this.showSection('typing-text');

    // Notify animation controller if exists
    if (
      this.animationController &&
      typeof this.animationController.onFaceDetected === 'function'
    ) {
      this.animationController.onFaceDetected();
    }
  }

  // Show a specific content section
  showSection(sectionId) {
    // Hide all sections
    this.elements.contentSections.forEach((section) => {
      section.classList.remove('active');
    });

    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('active');
      this.state.currentSection = sectionId;
      this.debug(`Showing section: ${sectionId}`);
    }
  }

  // Debug helper
  debug(message) {
    if (this.elements.debugOverlay) {
      this.elements.debugOverlay.innerHTML += `<div>${new Date().toISOString().substr(11, 8)}: ${message}</div>`;

      // Keep only the last 10 messages
      const messages = this.elements.debugOverlay.children;
      while (messages.length > 10) {
        messages[0].remove();
      }
    }
    console.log(message);
  }
}

// Animation Interface - All animation modules should implement this
class AnimationInterface {
  initialize() {
    // Initialize animation
    console.error('Animation initialize method must be implemented');
  }

  onFaceDetected() {
    // Handle face detection event
    console.error('Animation onFaceDetected method must be implemented');
  }

  pause() {
    // Pause animation
  }

  resume() {
    // Resume animation
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Create app controller
  window.appController = new AppController();
  window.appController.initializeApp();
});
