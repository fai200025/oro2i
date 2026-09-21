/**
 * DEADLINE RADAR - NASA-STYLE RADAR VISUALIZATION ENGINE
 * Polar coordinate plotting, sweep rotation, target acquisition, and audio telemetry
 */

let audioCtx = null;

// Subtle futuristic blip sound using Web Audio API
function playRadarBlip(frequency = 880) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    // Ignore audio restriction if user hasn't interacted
  }
}

function renderRadarVisualization() {
  const radarContainer = document.getElementById('radar-terminal-disk');
  const targetList = document.getElementById('radar-target-list');
  const tooltip = document.getElementById('radar-tooltip');
  if (!radarContainer) return;

  const store = window.RadarStore;
  const allDeadlines = store.getDeadlines();

  // Active deadlines only for the radar
  const activeDeadlines = allDeadlines.filter(d => !d.completed);

  // Clear previous blips
  const existingBlips = radarContainer.querySelectorAll('.radar-blip, .orbiting-particle');
  existingBlips.forEach(b => b.remove());

  // Radar size math
  const rect = radarContainer.getBoundingClientRect();
  const radius = rect.width / 2;
  const centerX = radius;
  const centerY = radius;

  // Add 4 orbiting particles
  for (let i = 0; i < 6; i++) {
    const orb = document.createElement('div');
    orb.className = 'orbiting-particle';
    const orbDist = radius * (0.3 + (i * 0.12));
    const orbAngle = (i * 60) * (Math.PI / 180);
    const ox = centerX + orbDist * Math.cos(orbAngle);
    const oy = centerY + orbDist * Math.sin(orbAngle);

    orb.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--cyan-bright);
      border-radius: 50%;
      left: ${ox}px;
      top: ${oy}px;
      opacity: 0.4;
      pointer-events: none;
      box-shadow: 0 0 6px var(--cyan-bright);
    `;
    radarContainer.appendChild(orb);
  }

  // Populate Deadlines on the Radar
  // Distance from center is mapped to remaining days:
  // 0-2 days (Critical) -> 15% - 35% of radius
  // 3-7 days (Upcoming) -> 40% - 65% of radius
  // 8+ days (Safe)     -> 70% - 90% of radius
  activeDeadlines.forEach((deadline, index) => {
    const urgency = store.calculateUrgency(deadline);
    let distanceFraction;

    if (urgency.isOverdue) {
      distanceFraction = 0.16 + (index % 3) * 0.05; // Right next to center!
    } else if (urgency.daysRemaining <= 2) {
      distanceFraction = 0.22 + (urgency.daysRemaining * 0.08);
    } else if (urgency.daysRemaining <= 7) {
      distanceFraction = 0.42 + ((urgency.daysRemaining - 3) * 0.05);
    } else {
      distanceFraction = Math.min(0.68 + ((urgency.daysRemaining - 8) * 0.02), 0.88);
    }

    // Spread angles evenly around the 360 circle with pseudo-deterministic offsets
    const goldenAngle = 137.5 * (Math.PI / 180);
    const angle = (index * goldenAngle) + (deadline.title.length * 0.2);

    const x = centerX + radius * distanceFraction * Math.cos(angle);
    const y = centerY + radius * distanceFraction * Math.sin(angle);

    const blip = document.createElement('div');
    blip.className = `radar-blip ${urgency.class}`;
    blip.style.left = `${x}px`;
    blip.style.top = `${y}px`;
    blip.title = `${deadline.title} (${urgency.label})`;

    // Hover tooltip
    blip.addEventListener('mouseenter', (e) => {
      playRadarBlip(urgency.class === 'critical' ? 1040 : 660);
      if (tooltip) {
        tooltip.innerHTML = `
          <h5>${window.escapeHTML(deadline.title)}</h5>
          <p><strong>Course:</strong> ${window.escapeHTML(deadline.course)}</p>
          <p><strong>Remaining:</strong> ${urgency.label}</p>
          <p><strong>Priority:</strong> ${deadline.priority}</p>
          <p><strong>Progress:</strong> ${deadline.progress || 0}%</p>
        `;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.classList.add('show');
      }
    });

    blip.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.remove('show');
    });

    blip.addEventListener('click', () => {
      playRadarBlip(1200);
      window.openDetailsModal(deadline.id);
    });

    radarContainer.appendChild(blip);
  });

  // Render Target List on the terminal side panel
  if (targetList) {
    if (activeDeadlines.length === 0) {
      targetList.innerHTML = `<p class="text-muted" style="text-align:center; padding: 20px;">No active targets in radar scope.</p>`;
      return;
    }

    targetList.innerHTML = activeDeadlines.map(d => {
      const urgency = store.calculateUrgency(d);
      return `
        <div class="radar-target-item" onclick="window.openDetailsModal('${d.id}')">
          <div>
            <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-white);">${window.escapeHTML(d.title)}</div>
            <div style="font-size: 0.75rem; color: var(--cyan-bright);">${window.escapeHTML(d.course)}</div>
          </div>
          <span class="badge ${urgency.badgeClass}" style="font-size: 0.7rem;">
            ${urgency.label}
          </span>
        </div>
      `;
    }).join('');
  }
}

// Global render router hook
window.renderCurrentView = renderRadarVisualization;

document.addEventListener('DOMContentLoaded', () => {
  renderRadarVisualization();

  window.addEventListener('resize', () => {
    renderRadarVisualization();
  });

  window.addEventListener('deadline_radar_update', () => {
    renderRadarVisualization();
  });
});
