// Global flag to control matrix animation
window.stopMatrixCode = false;

document.addEventListener('DOMContentLoaded', () => {
  // Create a dedicated canvas for the matrix effect
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const matrixBackground = document.getElementById('matrix-background');

  console.log('Matrix background initializing');

  // Add the canvas to the matrix background
  matrixBackground.innerHTML = ''; // Clear any existing content
  matrixBackground.appendChild(canvas);

  // Make canvas fill the container
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  // Set canvas dimensions to match screen
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Update the drops array for the new width
    updateDrops();
  }

  // Matrix effect parameters
  const fontSize = 14;
  let columns;
  let drops = [];

  // Initialize or update drops array
  function updateDrops() {
    columns = Math.floor(canvas.width / fontSize);

    // If first init or resize to larger width, add new drops
    while (drops.length < columns) {
      drops.push(Math.random() * -100);
    }

    // If resize to smaller width, truncate array
    if (drops.length > columns) {
      drops = drops.slice(0, columns);
    }
  }

  // Characters to use in the matrix
  const chars = '01';

  // Draw one frame of the matrix effect
  function drawMatrix() {
    // Skip if animation is paused
    if (window.stopMatrixCode) return;

    // Semi-transparent black to create trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set character style
    ctx.fillStyle = '#0F0';
    ctx.font = `${fontSize}px monospace`;

    // Draw each column
    for (let i = 0; i < drops.length; i++) {
      // Random character
      const char = chars.charAt(Math.floor(Math.random() * chars.length));

      // Draw character
      if (drops[i] * fontSize > 0) {
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      }

      // Move drop down
      drops[i]++;

      // Reset drop with randomness
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
    }
  }

  // Handle window resize
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Animation loop
  function animate() {
    drawMatrix();
    requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  // Public method to dim matrix but keep it running
  window.dimMatrix = function (dimValue = 0.2) {
    matrixBackground.classList.add('fade-out');

    // Make sure animation doesn't stop
    window.stopMatrixCode = false;

    console.log('Matrix dimmed but still running');
  };
});
