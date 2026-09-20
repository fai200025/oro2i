/**
 * DEADLINE RADAR - ANIMATIONS & LIVING BACKGROUND ENGINE
 * Pure Vanilla JavaScript & Canvas Implementation
 */

(function () {
  'use strict';

  // 1. Particle & Constellation Engine
  function initParticleCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle count: reduce on mobile for high performance
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 75;
    const maxConnectionDistance = isMobile ? 80 : 130;

    const colors = [
      'rgba(0, 240, 255, ',    // Cyan
      'rgba(59, 130, 246, ',    // Blue
      'rgba(139, 92, 246, ',   // Purple
    ];

    const particles = [];

    // Mouse coordinates for subtle interactive reaction
    let mouse = {
      x: null,
      y: null,
      radius: 120,
    };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.8;
        this.baseSpeedX = (Math.random() - 0.5) * 0.45;
        this.baseSpeedY = (Math.random() - 0.5) * 0.45;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
        this.fadeSpeed = (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1);
      }

      update() {
        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Subtle mouse influence
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }

        // Wrap edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Fade pulse
        this.opacity += this.fadeSpeed;
        if (this.opacity > 0.7 || this.opacity < 0.15) {
          this.fadeSpeed = -this.fadeSpeed;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + this.opacity + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.colorPrefix + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Connect lines between nearby particles
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDistance) {
            const lineOpacity = (1 - dist / maxConnectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0, 240, 255, ' + lineOpacity + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
    }

    // Render loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

      drawConnections();

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // 2. Floating Academic Objects (Book, Calendar, Clock, Cap, Laptop, Document, Chart, Pencil, Bell)
  function initAcademicObjects() {
    const container = document.getElementById('academic-objects-container');
    if (!container) return;

    // SVG icon vectors for student academic objects
    const icons = [
      // Graduation Cap
      `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
      // Book
      `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
      // Calendar
      `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      // Clock
      `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      // Laptop
      `<svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
      // Assignment Document
      `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
      // Chart
      `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      // Pencil
      `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
      // Notification Bell
      `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
    ];

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 4 : 9;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'academic-object';
      el.innerHTML = icons[i % icons.length];

      // Random position distributed across viewport
      const top = 10 + Math.random() * 80;
      const left = 5 + (i * 90) / count + Math.random() * 5;
      const duration = 14 + Math.random() * 10;
      const delay = Math.random() * 6;

      el.style.top = `${top}%`;
      el.style.left = `${left}%`;
      el.style.animation = `floatAcademicObj ${duration}s ease-in-out ${delay}s infinite alternate`;

      container.appendChild(el);
    }
  }

  // 3. Periodic Moving Light Trails
  function initLightTrails() {
    const container = document.getElementById('ambient-background');
    if (!container) return;

    function spawnTrail() {
      const trail = document.createElement('div');
      trail.className = 'light-trail';

      const startX = Math.random() * window.innerWidth * 0.8;
      const startY = window.innerHeight * (0.6 + Math.random() * 0.4);
      const angle = -35 + (Math.random() * 10 - 5); // upwards to the right
      const length = 120 + Math.random() * 180;
      const speed = 1.8 + Math.random() * 1.5;

      trail.style.width = `${length}px`;
      trail.style.left = `${startX}px`;
      trail.style.top = `${startY}px`;
      trail.style.transform = `rotate(${angle}deg)`;

      container.appendChild(trail);

      // Animate flight via JS CSS transition
      const keyframes = [
        { opacity: 0, transform: `rotate(${angle}deg) translate(0, 0)` },
        { opacity: 0.8, transform: `rotate(${angle}deg) translate(250px, -180px)` },
        { opacity: 0, transform: `rotate(${angle}deg) translate(500px, -360px)` },
      ];

      const animation = trail.animate(keyframes, {
        duration: speed * 1000,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      });

      animation.onfinish = () => {
        trail.remove();
      };
    }

    // Spawn every 4 to 8 seconds
    setInterval(() => {
      if (Math.random() > 0.25) {
        spawnTrail();
      }
    }, 4500);
  }

  // 4. Subtle Mouse 3D Tilt on Cards
  function initCardTilt() {
    if (window.innerWidth < 1024) return;

    const cards = document.querySelectorAll('.tilt-card, .feature-card, .deadline-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const tiltX = (y / rect.height) * -8;
        const tiltY = (x / rect.width) * 8;

        card.style.transform = `perspective(800px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 5. Number Counting Animation (0 -> Target)
  window.animateNumberCount = function (element, targetValue, duration = 1200) {
    if (!element) return;
    const start = 0;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (targetValue - start) * ease);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetValue;
      }
    }

    requestAnimationFrame(update);
  };

  // Initialize all animation components on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    initAcademicObjects();
    initLightTrails();
    initCardTilt();
  });
})();
