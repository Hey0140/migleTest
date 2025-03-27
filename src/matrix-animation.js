// Matrix Animation Controller
class MatrixAnimation extends AnimationInterface {
  constructor() {
    super();
    this.canvas = null;
    this.ctx = null;
    this.initialized = false;
    this.running = false;
    this.characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789αβγδεζηθικλμνξοπρστυφχψω'.split('');
    this.fontSize = 14;
    this.columns = null;
    this.drops = null;
    this.speed = 33; // Animation speed (ms)
    this.animationFrame = null;
  }

  initialize() {
    // Only initialize once
    if (this.initialized) return;

    // Create canvas if not exists
    if (!document.getElementById('matrix-canvas')) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'matrix-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '1';

      // Add to the matrix background
      const matrixBackground = document.getElementById('matrix-background');
      if (matrixBackground) {
        matrixBackground.appendChild(this.canvas);
      } else {
        document.body.appendChild(this.canvas);
      }
    } else {
      this.canvas = document.getElementById('matrix-canvas');
    }

    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Start animation
    this.initMatrix();
    this.startAnimation();

    this.initialized = true;
    console.log('Matrix animation initialized');

    // Let the app controller know we're ready
    if (window.appController) {
      window.appController.registerAnimationController(this);
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Reset drops when resizing
    this.initMatrix();
  }

  initMatrix() {
    // Calculate columns and initialize drops
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = [];

    // Initialize drops position
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = 1;
    }
  }

  draw() {
    // Semi-transparent background to create fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Green text
    this.ctx.fillStyle = '#0F0';
    this.ctx.font = this.fontSize + 'px monospace';

    // Draw characters
    for (let i = 0; i < this.drops.length; i++) {
      // Random character
      const text =
        this.characters[Math.floor(Math.random() * this.characters.length)];

      // x = i * fontSize, y = value of drops[i] * fontSize
      this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

      // Move drops down
      if (
        this.drops[i] * this.fontSize > this.canvas.height &&
        Math.random() > 0.975
      ) {
        this.drops[i] = 0;
      }

      this.drops[i]++;
    }
  }

  startAnimation() {
    if (this.running) return;

    this.running = true;
    const animate = () => {
      this.draw();
      if (this.running) {
        this.animationFrame = setTimeout(animate, this.speed);
      }
    };

    animate();
  }

  stopAnimation() {
    this.running = false;
    if (this.animationFrame) {
      clearTimeout(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // Animation Interface Methods
  onFaceDetected() {
    // Change animation style if needed when face is detected
    console.log('Face detected in matrix animation');
    // Maybe change color or speed as response
    this.speed = 45; // Slow down a bit
  }

  pause() {
    this.stopAnimation();
  }

  resume() {
    this.startAnimation();
  }
}

// Initialize when the script loads
document.addEventListener('DOMContentLoaded', () => {
  const matrixAnimation = new MatrixAnimation();
  matrixAnimation.initialize();
});
