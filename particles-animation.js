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
    this.particleCount = 300; // Even more particles since they'll be stationary
    this.particleColor = 'rgba(255, 255, 255, 0.8)'; // Changed to white
    this.lineColor = 'rgba(255, 255, 255, 0.15)'; // Changed to white
    this.particleSize = 3;
    this.connectionDistance = 150;
    this.speed = 0.5;

    // Neural activity simulation
    this.synapseLifespan = 60; // Reduced for faster disappearing connections
    this.synapseFormationRate = 0.04; // Increased since particles won't move to create new connections
    this.fireRate = 0.01; // Increased to compensate for stationary positions
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

    // Movement behavior (now much more limited)
    this.maxMovement = 0.3; // Maximum pixel movement per frame (very slight)
    this.anchorStrength = 0.95; // How strongly particles are pulled to their anchor points

    // Signal activity settings
    this.signalSpeed = 1.2; // Increased signal speed for more activity
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

    // Create a more even distribution of particles using grid with randomization
    const gridCellSize = Math.sqrt(
      (this.canvas.width * this.canvas.height) / (this.particleCount * 0.7),
    );
    const gridColumns = Math.ceil(this.canvas.width / gridCellSize);
    const gridRows = Math.ceil(this.canvas.height / gridCellSize);

    // Track filled cells to avoid overcrowding
    const filledCells = new Set();

    for (let i = 0; i < this.particleCount; i++) {
      let x,
        y,
        cellKey,
        attempts = 0;

      // Try to find an unfilled cell
      do {
        const col = Math.floor(Math.random() * gridColumns);
        const row = Math.floor(Math.random() * gridRows);
        cellKey = `${col}:${row}`;

        // Add some randomness within the cell
        x = (col + 0.3 + Math.random() * 0.4) * gridCellSize;
        y = (row + 0.3 + Math.random() * 0.4) * gridCellSize;

        attempts++;
        // After too many attempts, just accept overlap
        if (attempts > 10) break;
      } while (filledCells.has(cellKey) && attempts < 10);

      filledCells.add(cellKey);

      // Assign a depth layer (0 = closest, this.depthLayers-1 = farthest)
      // Use a more biased distribution to have many background elements
      let depthLayer;
      if (Math.random() < this.backgroundRatio) {
        // Background particles (layers 3-6)
        depthLayer = Math.floor(Math.random() * (this.depthLayers - 3)) + 3;
      } else {
        // Foreground particles (layers 0-2)
        depthLayer = Math.floor(Math.random() * 3);
      }

      // Calculate opacity and size based on depth
      const layerOpacity =
        this.maxOpacity -
        ((this.maxOpacity - this.minOpacity) * depthLayer) /
          (this.depthLayers - 1);
      const depthSizeFactor = 1 - (0.6 * depthLayer) / (this.depthLayers - 1);

      // Create particles with anchor positions
      this.particles.push({
        x: x,
        y: y,
        anchorX: x, // Original/anchor position
        anchorY: y,
        // Tiny random movement
        vx:
          (Math.random() - 0.5) *
          this.maxMovement *
          (1 - (0.7 * depthLayer) / this.depthLayers),
        vy:
          (Math.random() - 0.5) *
          this.maxMovement *
          (1 - (0.7 * depthLayer) / this.depthLayers),
        size: this.particleSize * (0.7 + Math.random() * 0.8) * depthSizeFactor,
        color: `rgba(255, 255, 255, ${layerOpacity})`,
        firing: false,
        fireIntensity: 0,
        connectionState: Math.random(), // Random state for connection behavior
        burstTimer: 0,
        depthLayer: depthLayer,
        opacity: layerOpacity,
        connectionProbability:
          depthLayer < 4 ? 1 : 0.5 - (depthLayer - 4) * 0.1,
        nextFireTime: Math.random() * 200, // Random initial time until first firing
        dendrites: [], // Will store small lines representing dendrites
      });
    }

    // Generate some random dendrites for visual effect
    this.generateDendrites();
  }

  generateDendrites() {
    // Add dendrite-like branches to some particles
    this.particles.forEach((particle) => {
      // More dendrites for foreground particles
      const dendriteCount =
        Math.floor(Math.random() * 3) *
        (1 - (0.5 * particle.depthLayer) / this.depthLayers);

      particle.dendrites = [];
      for (let i = 0; i < dendriteCount; i++) {
        const length =
          5 +
          Math.random() *
            15 *
            (1 - (0.5 * particle.depthLayer) / this.depthLayers);
        const angle = Math.random() * Math.PI * 2;

        particle.dendrites.push({
          length: length,
          angle: angle,
          width: 0.5 + Math.random() * 0.5,
          opacity: 0.1 + Math.random() * 0.3,
        });
      }
    });
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
      // Very slight random drift
      if (Math.random() < 0.05) {
        particle.vx =
          (Math.random() - 0.5) *
          this.maxMovement *
          (1 - (0.7 * particle.depthLayer) / this.depthLayers);
        particle.vy =
          (Math.random() - 0.5) *
          this.maxMovement *
          (1 - (0.7 * particle.depthLayer) / this.depthLayers);
      }

      // Update particle position with very limited movement
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Pull back to anchor position to prevent drift
      particle.x += (particle.anchorX - particle.x) * this.anchorStrength;
      particle.y += (particle.anchorY - particle.y) * this.anchorStrength;

      // Random chance for neuron to fire based on timer
      particle.nextFireTime--;
      if (particle.nextFireTime <= 0) {
        particle.firing = true;
        particle.fireIntensity = 1.0;
        // Set next fire time (varied, higher layer neurons fire more frequently)
        particle.nextFireTime =
          100 +
          Math.random() *
            300 *
            (1 + (0.5 * particle.depthLayer) / this.depthLayers);
      }

      // Additional random chance for firing
      if (
        (!particle.firing &&
          Math.random() <
            this.fireRate *
              (1 +
                (this.depthLayers - particle.depthLayer) / this.depthLayers)) ||
        (this.highlighted && Math.random() < this.fireRate * 3)
      ) {
        particle.firing = true;
        particle.fireIntensity = 1.0;
      }

      // Draw dendrites first (beneath the neuron)
      this.drawDendrites(particle);

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

  drawDendrites(particle) {
    if (!particle.dendrites || particle.dendrites.length === 0) return;

    particle.dendrites.forEach((dendrite) => {
      const startX = particle.x;
      const startY = particle.y;
      const endX = startX + Math.cos(dendrite.angle) * dendrite.length;
      const endY = startY + Math.sin(dendrite.angle) * dendrite.length;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);

      // Use particle's opacity but reduce it for dendrites
      const lineOpacity =
        particle.opacity * dendrite.opacity * (particle.firing ? 1.3 : 1);

      this.ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
      this.ctx.lineWidth = dendrite.width;
      this.ctx.stroke();
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

    // Form new connections with increased probability (since particles don't move to create new connections)
    this.particles.forEach((particle, i) => {
      // Skip some connection checks for far background particles to improve performance
      if (
        particle.depthLayer > 4 &&
        Math.random() > particle.connectionProbability
      ) {
        return;
      }

      // Increased chance of forming connections when firing
      const connectionChance =
        (particle.firing
          ? this.synapseFormationRate * 5
          : this.synapseFormationRate) *
        (1 + (this.depthLayers - particle.depthLayer) / this.depthLayers);

      if (Math.random() < connectionChance) {
        // Find potential targets in a more directional manner
        // Neurons tend to connect in certain directions, not just randomly
        const connectionAngle = particle.connectionState * Math.PI * 2;
        const angleVariance = Math.PI / 2; // 90 degrees variance

        const potentialTargets = this.particles.filter((p, j) => {
          if (i === j) return false;

          const dx = p.x - particle.x;
          const dy = p.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Check if within distance and angle range
          if (distance > this.connectionDistance) return false;

          // Calculate angle to this particle
          const angle = Math.atan2(dy, dx);

          // Check if within angle range (considering circular wrapping)
          const angleDiff = Math.abs(
            ((angle - connectionAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
          );
          return angleDiff < angleVariance;
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

          // Make the signal travel faster for more activity
          this.activeConnections[
            this.activeConnections.length - 1
          ].signalSpeed = this.signalSpeed;
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
        // Use connection's signalSpeed for faster movement
        const signalCycleLength = conn.signalSpeed ? 10 / conn.signalSpeed : 10;
        const progress = 1 - (life % signalCycleLength) / signalCycleLength;
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

    // Increase connection parameters for more dynamic effect
    this.connectionDistance = 200;
    this.fireRate = 0.03;
    this.synapseFormationRate = 0.06;
    this.signalSpeed = 1.5;

    // Trigger wave of neural activity
    this.particles.forEach((particle, i) => {
      // Randomly trigger firing state for some particles
      if (Math.random() < 0.4) {
        setTimeout(() => {
          if (this.particles[i]) {
            particle.firing = true;
            particle.fireIntensity = 0.7 + Math.random() * 0.3;
          }
        }, i * 10); // Faster staggered firing for wave effect
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
