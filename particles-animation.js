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
    this.particleCount = 250; // Significantly increased for a fuller scene
    this.particleColor = 'rgba(255, 255, 255, 0.8)'; // Changed to white
    this.lineColor = 'rgba(255, 255, 255, 0.15)'; // Changed to white
    this.particleSize = 3;
    this.connectionDistance = 150;
    this.speed = 0.5;

    // Neural activity simulation
    this.synapseLifespan = 60; // Reduced for faster disappearing connections
    this.synapseFormationRate = 0.03; // Increased for more connections
    this.fireRate = 0.008; // Slightly increased
    this.activeConnections = []; // Track current synaptic connections
    this.burstProbability = 0.002; // Slightly increased
    this.decayRate = 0.95; // Faster decay rate

    // Depth perception settings
    this.depthLayers = 7; // Increased depth layers for more background
    this.maxOpacity = 0.9; // Max opacity for closest particles
    this.minOpacity = 0.15; // Slightly lower minimum opacity for more contrast
    this.backgroundRatio = 0.65; // 65% of particles will be in background layers

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
    this.activeConnections = [];

    for (let i = 0; i < this.particleCount; i++) {
      // Biased random distribution to favor background layers
      let depthLayer;
      if (Math.random() < this.backgroundRatio) {
        // Background particles (layers 3-6)
        depthLayer = Math.floor(Math.random() * (this.depthLayers - 3)) + 3;
      } else {
        // Foreground particles (layers 0-2)
        depthLayer = Math.floor(Math.random() * 3);
      }

      // Calculate opacity based on depth (closer = more opaque)
      const layerOpacity =
        this.maxOpacity -
        ((this.maxOpacity - this.minOpacity) * depthLayer) /
          (this.depthLayers - 1);

      // Adjust size based on depth (closer = larger, deeper background = smaller)
      const depthSizeFactor = 1 - (0.6 * depthLayer) / (this.depthLayers - 1);

      // Particles in deeper background move slower
      const speedFactor = 1 - (0.5 * depthLayer) / (this.depthLayers - 1);

      // Create particles with more varied properties and depth perception
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx:
          (Math.random() - 0.5) *
          this.speed *
          speedFactor *
          (Math.random() + 0.5),
        vy:
          (Math.random() - 0.5) *
          this.speed *
          speedFactor *
          (Math.random() + 0.5),
        size: this.particleSize * (0.7 + Math.random() * 0.8) * depthSizeFactor,
        color: `rgba(255, 255, 255, ${layerOpacity})`,
        firing: false,
        fireIntensity: 0,
        lastDirection: Math.random() * Math.PI * 2,
        burstTimer: 0,
        depthLayer: depthLayer,
        opacity: layerOpacity,
        connectionProbability:
          depthLayer < 4 ? 1 : 0.5 - (depthLayer - 4) * 0.1, // Reduce connection probability in far background
      });
    }
  }

  draw() {
    // Clear canvas with more transparent background for trail effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Sort particles by depth layer to draw far ones first
    this.particles.sort((a, b) => b.depthLayer - a.depthLayer);

    // Update active synaptic connections
    this.updateSynapticConnections();

    // Draw active synaptic connections
    this.drawSynapticConnections();

    // Draw a subtle background glow to enhance the digital brain atmosphere
    this.drawBackgroundGlow();

    // Update and draw particles (neurons)
    this.particles.forEach((particle, i) => {
      // Randomly change direction to simulate more natural movement
      if (Math.random() < 0.03) {
        particle.lastDirection += ((Math.random() - 0.5) * Math.PI) / 4;
        particle.vx =
          Math.cos(particle.lastDirection) *
          this.speed *
          (0.8 + Math.random() * 0.5);
        particle.vy =
          Math.sin(particle.lastDirection) *
          this.speed *
          (0.8 + Math.random() * 0.5);
      }

      // Random bursts of neural activity
      if (Math.random() < this.burstProbability) {
        particle.burstTimer = 30 + Math.random() * 60;
        particle.vx *= 2 + Math.random();
        particle.vy *= 2 + Math.random();
      }

      // Reduce burst timer if active
      if (particle.burstTimer > 0) {
        particle.burstTimer--;
        if (particle.burstTimer === 0) {
          // Return to normal speed
          particle.vx =
            (Math.random() - 0.5) * this.speed * (Math.random() + 0.5);
          particle.vy =
            (Math.random() - 0.5) * this.speed * (Math.random() + 0.5);
        }
      }

      // Update particle position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges with slight randomization
      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.vx = -particle.vx * (0.9 + Math.random() * 0.2);
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.vy = -particle.vy * (0.9 + Math.random() * 0.2);
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
      }

      // Random chance for neuron to fire
      if (
        Math.random() <
          this.fireRate *
            (1 + (this.depthLayers - particle.depthLayer) / this.depthLayers) ||
        (this.highlighted && Math.random() < this.fireRate * 3)
      ) {
        particle.firing = true;
        particle.fireIntensity = 1.0;
      }

      // Update firing state
      if (particle.firing) {
        // Draw the firing neuron (brighter)
        this.ctx.beginPath();
        this.ctx.arc(
          particle.x,
          particle.y,
          particle.size * (1 + particle.fireIntensity),
          0,
          Math.PI * 2,
        );

        // White color with firing intensity and depth-based opacity
        const fireOpacity = Math.min(
          1,
          particle.opacity + particle.fireIntensity * 0.3,
        );
        const fireColor = `rgba(255, 255, 255, ${fireOpacity})`;

        this.ctx.fillStyle = fireColor;
        this.ctx.fill();

        // Add a glow effect
        this.ctx.beginPath();
        this.ctx.arc(
          particle.x,
          particle.y,
          particle.size * (2 + particle.fireIntensity),
          0,
          Math.PI * 2,
        );
        this.ctx.fillStyle = `rgba(255, 255, 255, ${fireOpacity * 0.3})`;
        this.ctx.fill();

        // Decay the firing intensity
        particle.fireIntensity *= this.decayRate;
        if (particle.fireIntensity < 0.1) {
          particle.firing = false;
          particle.fireIntensity = 0;
        }
      } else {
        // Draw the normal particle (neuron)
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
      }
    });
  }

  drawBackgroundGlow() {
    // Add a subtle ambient neural activity in the background
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.03) {
        // Random position
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;

        // Create a subtle glow
        const radius = 30 + Math.random() * 100;
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  updateSynapticConnections() {
    // Remove expired synaptic connections
    this.activeConnections = this.activeConnections.filter((conn) => {
      conn.life -= 1 + Math.random(); // Slightly randomize decay for more natural look
      return conn.life > 0;
    });

    // Form new random connections
    this.particles.forEach((particle, i) => {
      // Skip some connection checks for far background particles to improve performance
      if (
        particle.depthLayer > 4 &&
        Math.random() > particle.connectionProbability
      ) {
        return;
      }

      // Prioritize connections for particles in foreground layers
      const depthFactor =
        (this.depthLayers - particle.depthLayer) / this.depthLayers;

      // Increased chance of forming connections when firing or in foreground
      const connectionChance =
        (particle.firing
          ? this.synapseFormationRate * 5
          : this.synapseFormationRate) *
        (1 + depthFactor);

      // Deep background particles form fewer connections
      const depthModifier = particle.depthLayer > 4 ? 0.5 : 1;

      if (Math.random() < connectionChance * depthModifier) {
        // Find potential target particles within distance
        const potentialTargets = this.particles.filter((p, j) => {
          if (i === j) return false;
          const dx = particle.x - p.x;
          const dy = particle.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < this.connectionDistance;
        });

        if (potentialTargets.length > 0) {
          // Prefer targets in similar depth layer for more realistic connections
          potentialTargets.sort((a, b) => {
            return (
              Math.abs(a.depthLayer - particle.depthLayer) -
              Math.abs(b.depthLayer - particle.depthLayer)
            );
          });

          // Pick from the top 5 closest depth matches
          const targetIndex = Math.floor(
            Math.random() * Math.min(5, potentialTargets.length),
          );
          const target = potentialTargets[targetIndex];

          // Shorter lifespan for connections between different depth layers
          const depthDifference = Math.abs(
            target.depthLayer - particle.depthLayer,
          );
          const lifeReduction = depthDifference * 5; // Reduce lifespan based on depth difference

          // Create new connection with shorter random lifespan
          this.activeConnections.push({
            source: particle,
            target: target,
            life:
              10 +
              Math.floor(
                Math.random() * (this.synapseLifespan - lifeReduction),
              ),
            strength: 0.3 + Math.random() * 0.7,
            active: particle.firing || target.firing,
            averageDepth: (particle.depthLayer + target.depthLayer) / 2,
          });

          // Trigger target neuron to fire with a probability
          if (particle.firing && Math.random() < 0.3) {
            target.firing = true;
            target.fireIntensity = 0.7 + Math.random() * 0.3;
          }
        }
      }
    });
  }

  drawSynapticConnections() {
    // Sort connections by depth to draw far ones first
    this.activeConnections.sort((a, b) => b.averageDepth - a.averageDepth);

    // Draw all active synaptic connections
    this.activeConnections.forEach((conn) => {
      const { source, target, life, strength, active, averageDepth } = conn;

      // Calculate distance
      const dx = source.x - target.x;
      const dy = source.y - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Skip if too far - defensive programming
      if (distance > this.connectionDistance * 1.5) return;

      // Connection visual properties
      const normalizedLife = life / this.synapseLifespan;
      const lineOpacity =
        normalizedLife *
        strength *
        (this.maxOpacity -
          ((this.maxOpacity - this.minOpacity) * averageDepth) /
            (this.depthLayers - 1));

      // Determine color based on activity (all white now, just different opacity)
      const lineColor = active
        ? `rgba(255, 255, 255, ${Math.min(0.8, lineOpacity * 0.7)})`
        : `rgba(255, 255, 255, ${Math.min(0.4, lineOpacity * 0.4)})`;

      // Draw the connection line
      this.ctx.beginPath();
      this.ctx.moveTo(source.x, source.y);
      this.ctx.lineTo(target.x, target.y);
      this.ctx.strokeStyle = lineColor;
      this.ctx.lineWidth = active ? 1.2 : 0.8;
      this.ctx.stroke();

      // Draw signal traveling along active connections
      if (active && life > 10) {
        const progress = 1 - (life % 10) / 10; // Faster signal movement
        const signalX = source.x + (target.x - source.x) * progress;
        const signalY = source.y + (target.y - source.y) * progress;

        this.ctx.beginPath();
        this.ctx.arc(signalX, signalY, 1.8, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, lineOpacity + 0.3)})`;
        this.ctx.fill();
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

    // Highlight effect but still using white
    this.highlighted = true;

    // Increase connection distance and speed for more dynamic effect
    this.connectionDistance = 200;
    this.speed = 1;
    this.fireRate = 0.025; // Increase neural activity
    this.burstProbability = 0.007;

    // Trigger wave of neural activity
    this.particles.forEach((particle, i) => {
      // Update velocities with more energy
      particle.vx = (Math.random() - 0.5) * this.speed * 2;
      particle.vy = (Math.random() - 0.5) * this.speed * 2;

      // Randomly trigger firing state for some particles
      if (Math.random() < 0.3) {
        setTimeout(() => {
          if (this.particles[i]) {
            // Check if particle still exists
            particle.firing = true;
            particle.fireIntensity = 0.7 + Math.random() * 0.3;
          }
        }, i * 15); // Staggered firing for wave effect
      }
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
