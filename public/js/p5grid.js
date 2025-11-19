/**
 * p5.js Grid Animation - Landing Page Hero
 * 
 * Interactive grid visualization that responds to mouse/touch.
 * Optimized for performance with particle system and efficient rendering.
 * Graceful degradation on low-end devices.
 */

// Wait for p5.js to load
window.addEventListener('load', function() {
  // Check if p5 is loaded
  if (typeof p5 === 'undefined') {
    return;
  }

  // Enhanced mobile detection
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };

  // Check if device can handle animation
  const getDeviceQuality = () => {
    const isMobile = isMobileDevice();
    const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    
    // Very low-end: show static fallback
    if (isMobile && (lowCPU || lowMemory)) {
      return 'minimal';
    }
    // Mobile: simplified animation
    if (isMobile) {
      return 'mobile';
    }
    // Desktop: full animation
    return 'desktop';
  };

  const deviceQuality = getDeviceQuality();
  const isMobile = isMobileDevice();

  // Dynamic grid spacing (distance between nodes)
  const nodeSpacing = deviceQuality === 'minimal' ? 120 : deviceQuality === 'mobile' ? 100 : 80;

  // Calculate cols and rows dynamically based on document size
  function calculateGridSize() {
    const docWidth = document.documentElement.scrollWidth;
    const docHeight = document.documentElement.scrollHeight;
    
    return {
      cols: Math.ceil(docWidth / nodeSpacing) + 1,
      rows: Math.ceil(docHeight / nodeSpacing) + 1
    };
  }

  // Grid configuration based on device
  const initialGrid = calculateGridSize();
  const config = {
    cols: initialGrid.cols,
    rows: initialGrid.rows,
    nodeSpacing: nodeSpacing,
    nodeSize: isMobile ? 5 : 4,
    connectionDistance: isMobile ? 80 : 120,
    mouseInfluence: isMobile ? 60 : 80,
    particleSpeed: 0.5,
    colorScheme: {
      nodes: '#667eea',
      connections: 'rgba(102, 126, 234, 0.3)',
      mouseGlow: 'rgba(102, 126, 234, 0.4)'
    }
  };

  const sketch = (p) => {
    let nodes = [];
    let particles = [];
    let canvasWidth, canvasHeight;
    let mouseInfluenceRadius = config.mouseInfluence;
    let isMouseActive = false;

    // Node class
    class Node {
      constructor(x, y, index) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.index = index;
        this.vx = 0;
        this.vy = 0;
        this.size = config.nodeSize;
      }

      update(mx, my) {
        // Mouse interaction
        if (isMouseActive) {
          const dx = this.x - mx;
          const dy = this.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseInfluenceRadius) {
            const force = (mouseInfluenceRadius - dist) / mouseInfluenceRadius;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * force * 0.5;
            this.vy += Math.sin(angle) * force * 0.5;
          }
        }

        // Spring back to original position
        const dx = this.baseX - this.x;
        const dy = this.baseY - this.y;
        this.vx += dx * 0.05;
        this.vy += dy * 0.05;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Damping
        this.vx *= 0.9;
        this.vy *= 0.9;
      }

      draw() {
        p.fill(config.colorScheme.nodes);
        p.noStroke();
        p.circle(this.x, this.y, this.size);
      }
    }

    // Particle class (floating particles)
    class Particle {
      constructor() {
        this.x = p.random(canvasWidth);
        this.y = p.random(canvasHeight);
        this.vx = p.random(-config.particleSpeed * 1.5, config.particleSpeed * 1.5);
        this.vy = p.random(-config.particleSpeed * 1.5, config.particleSpeed * 1.5);
        this.size = p.random(1, 5);
        this.alpha = p.random(80, 200);
        this.color = p.random() > 0.5 ? [102, 126, 234] : [118, 75, 162];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
      }

      draw() {
        p.noStroke();
        p.fill(this.color[0], this.color[1], this.color[2], this.alpha);
        p.circle(this.x, this.y, this.size);
      }
    }

    function createGridNodes() {
      nodes = []; // Clear existing nodes
      
      // Create grid nodes (fill entire canvas with no padding)
      const spacingX = canvasWidth / (config.cols - 1);
      const spacingY = canvasHeight / (config.rows - 1);

      let index = 0;
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          const x = col * spacingX;
          const y = row * spacingY;
          nodes.push(new Node(x, y, index++));
        }
      }
    }

    p.setup = function() {
      const container = document.getElementById('p5-canvas-container');
      if (!container) return;

      // Use full document dimensions (entire page height)
      canvasWidth = document.documentElement.scrollWidth;
      canvasHeight = document.documentElement.scrollHeight;

      // Recalculate grid size based on actual dimensions
      const gridSize = calculateGridSize();
      config.cols = gridSize.cols;
      config.rows = gridSize.rows;

      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent('p5-canvas-container');

      // Create grid nodes
      createGridNodes();

      // Create particles - many more for visual effect
      const particleCount = deviceQuality === 'minimal' ? 50 : 
                           deviceQuality === 'mobile' ? 100 : 200;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      // Set frame rate based on device
      if (deviceQuality === 'minimal') {
        p.frameRate(24); // Very low-end
      } else if (deviceQuality === 'mobile') {
        p.frameRate(30); // Mobile
      } else {
        p.frameRate(60); // Desktop
      }
    };

    p.draw = function() {
      // Very light background for subtle trail effect
      p.background(247, 250, 252, 30);

      // Get mouse/touch coordinates
      let mx = p.mouseX;
      let my = p.mouseY;
      
      // Use touch coordinates on mobile if available
      if (p.touches && p.touches.length > 0) {
        mx = p.touches[0].x;
        my = p.touches[0].y;
      }

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Update nodes
      nodes.forEach(node => {
        node.update(mx, my);
      });

      // Draw connections between nearby nodes
      // On mobile, skip some connections for better performance
      const skipFactor = isMobile ? 2 : 1;
      p.stroke(config.colorScheme.connections);
      p.strokeWeight(1);

      for (let i = 0; i < nodes.length; i += skipFactor) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.connectionDistance) {
            const alpha = p.map(dist, 0, config.connectionDistance, 0.3, 0);
            p.stroke(102, 126, 234, alpha * 255);
            p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        node.draw();
      });
      
      // Mouse glow is now handled by separate HTML element (see below)
    };

    p.windowResized = function() {
      // Use full document dimensions (entire page height)
      setTimeout(() => {
        canvasWidth = document.documentElement.scrollWidth;
        canvasHeight = document.documentElement.scrollHeight;
        
        // Recalculate grid size based on new dimensions
        const gridSize = calculateGridSize();
        config.cols = gridSize.cols;
        config.rows = gridSize.rows;
        
        p.resizeCanvas(canvasWidth, canvasHeight);

        // Recreate all nodes with new grid size
        createGridNodes();
      }, 100);
    };

    p.mouseMoved = function() {
      isMouseActive = true;
    };

    p.mousePressed = function() {
      // Pulse effect on click
      mouseInfluenceRadius = config.mouseInfluence * 1.5;
    };

    p.mouseReleased = function() {
      mouseInfluenceRadius = config.mouseInfluence;
    };

    // Enhanced touch support for mobile
    p.touchStarted = function() {
      isMouseActive = true;
      mouseInfluenceRadius = config.mouseInfluence * 1.5;
      return false; // Prevent default scrolling
    };
    
    p.touchMoved = function() {
      isMouseActive = true;
      return false; // Prevent default scrolling
    };
    
    p.touchEnded = function() {
      mouseInfluenceRadius = config.mouseInfluence;
      // Gradually deactivate mouse after touch ends
      setTimeout(() => {
        isMouseActive = false;
      }, 1000);
      return false;
    };
  };

  // Create p5 instance and save reference
  const p5Instance = new p5(sketch);
  window.p5Instance = p5Instance;

  // Fade in animation
  const container = document.getElementById('p5-canvas-container');
  if (container) {
    setTimeout(() => {
      container.style.opacity = '0.7';
    }, 100);
  }

  // Update canvas size when page is fully loaded (in case content changes height)
  let resizeTimeout;
  
  function updateCanvasSize() {
    if (p5Instance && p5Instance.windowResized) {
      p5Instance.windowResized();
    }
  }
  
  // Initial update after page loads
  window.addEventListener('load', function() {
    setTimeout(updateCanvasSize, 500);
  });
  
  // Update on window resize
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCanvasSize, 250);
  });

  // Update when DOM content changes (images load, sections expand, etc.)
  const observer = new MutationObserver(function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCanvasSize, 500);
  });

  // Observe body for changes that might affect height
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Create mouse glow element (on top of everything)
  const mouseGlow = document.createElement('div');
  mouseGlow.className = 'mouse-glow';
  mouseGlow.style.cssText = `
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, rgba(102, 126, 234, 0.4) 40%, rgba(102, 126, 234, 0) 70%);
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.6), 0 0 60px rgba(102, 126, 234, 0.3);
    transform: translate(-50%, -50%);
    transition: opacity 0.2s ease;
    opacity: 0;
  `;
  document.body.appendChild(mouseGlow);

  // Track mouse position for glow
  let mouseX = 0;
  let mouseY = 0;
  let isMouseMoving = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseGlow.style.left = mouseX + 'px';
    mouseGlow.style.top = mouseY + 'px';
    
    if (!isMouseMoving) {
      mouseGlow.style.opacity = '1';
      isMouseMoving = true;
    }
  });

  // Hide glow when mouse leaves window
  document.addEventListener('mouseleave', () => {
    mouseGlow.style.opacity = '0';
    isMouseMoving = false;
  });

  // Show glow when mouse enters window
  document.addEventListener('mouseenter', () => {
    mouseGlow.style.opacity = '1';
  });
});

