// Particles Animation Controller
class ParticlesAnimation extends AnimationInterface {
  constructor() {
    super();
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.initialized = false;
    this.running = false;
    this.animationFrame = null;

    // Animation settings
    this.particleCount = 80;
    this.particleColor = 'rgba(0, 150, 255, 0.8)';
    this.lineColor = 'rgba(0, 150, 255, 0.15)';
    this.particleSize = 3;
    this.connectionDistance = 150;
    this.speed = 0.5;

    // State flags for animation effects
    this.highlighted = false;
  }

  initialize() {
    // Only initialize once
    if (this.initialized) return;

    // Create canvas if not exists
    if (!document.getElementById('particles-canvas')) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'particles-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '1';

      // Add to the background container
      const backgroundElement = document.getElementById('matrix-background');
      if (backgroundElement) {
        backgroundElement.appendChild(this.canvas);
      } else {
        document.body.appendChild(this.canvas);
      }
    } else {
      this.canvas = document.getElementById('particles-canvas');
    }

    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Create particles
    this.createParticles();

    // Start animation
    this.startAnimation();

    this.initialized = true;
    console.log('Particles animation initialized');

    // Let the app controller know we're ready
    if (window.appController) {
      window.appController.registerAnimationController(this);
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Recreate particles when resizing
    if (this.particles.length > 0) {
      this.createParticles();
    }
  }

  createParticles() {
    this.particles = [];

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: Math.random() * this.speed - this.speed / 2,
        vy: Math.random() * this.speed - this.speed / 2,
        size: this.particleSize + Math.random() * 2,
        color: this.particleColor,
      });
    }
  }

  draw() {
    // Clear canvas with semi-transparent background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw particles and connections
    this.particles.forEach((particle, i) => {
      // Update particle position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.vx = -particle.vx;
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.vy = -particle.vy;
      }

      // Draw the particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.highlighted
        ? 'rgba(255, 180, 0, 0.8)'
        : particle.color;
      this.ctx.fill();

      // Draw connections between particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const particle2 = this.particles[j];
        const dx = particle.x - particle2.x;
        const dy = particle.y - particle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          // Line opacity based on distance
          const opacity = 1 - distance / this.connectionDistance;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(particle2.x, particle2.y);
          this.ctx.strokeStyle = this.highlighted
            ? `rgba(255, 140, 0, ${opacity * 0.3})`
            : `rgba(0, 150, 255, ${opacity * 0.15})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    });
  }

  startAnimation() {
    if (this.running) return;

    this.running = true;
    const animate = () => {
      this.draw();
      if (this.running) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();
  }

  stopAnimation() {
    this.running = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // Animation Interface Methods
  onFaceDetected() {
    console.log('Face detected in particles animation');

    // Highlight the particles when face is detected
    this.highlighted = true;

    // Increase connection distance and speed for more dynamic effect
    this.connectionDistance = 200;
    this.speed = 1;

    // Update particles with new speed
    this.particles.forEach((particle) => {
      particle.vx = Math.random() * this.speed - this.speed / 2;
      particle.vy = Math.random() * this.speed - this.speed / 2;
    });
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
  const particlesAnimation = new ParticlesAnimation();
  particlesAnimation.initialize();
});
