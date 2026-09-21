/**
 * DEADLINE RADAR - PROGRESS & ANALYTICS CONTROLLER
 * Pure HTML/CSS/SVG charts, statistics, and category progress bars
 */

function renderProgressPage() {
  const store = window.RadarStore;
  const metrics = store.getMetrics();
  const allDeadlines = store.getDeadlines();

  // 1. Update metric counters
  const totalElem = document.getElementById('progress-total-val');
  const completedElem = document.getElementById('progress-completed-val');
  const pendingElem = document.getElementById('progress-pending-val');
  const overdueElem = document.getElementById('progress-overdue-val');

  if (window.animateNumberCount) {
    if (totalElem) window.animateNumberCount(totalElem, metrics.total);
    if (completedElem) window.animateNumberCount(completedElem, metrics.completed);
    if (pendingElem) window.animateNumberCount(pendingElem, metrics.pending);
    if (overdueElem) window.animateNumberCount(overdueElem, metrics.overdue);
  } else {
    if (totalElem) totalElem.textContent = metrics.total;
    if (completedElem) completedElem.textContent = metrics.completed;
    if (pendingElem) pendingElem.textContent = metrics.pending;
    if (overdueElem) overdueElem.textContent = metrics.overdue;
  }

  // 2. Category Progress Calculation
  const calculateCategoryProgress = (types) => {
    const items = allDeadlines.filter(d => types.includes(d.type));
    if (items.length === 0) return 0;
    const totalProgress = items.reduce((acc, curr) => acc + (curr.completed ? 100 : (curr.progress || 0)), 0);
    return Math.round(totalProgress / items.length);
  };

  const assignmentProgress = calculateCategoryProgress(['Assignment']);
  const projectProgress = calculateCategoryProgress(['Project']);
  const examProgress = calculateCategoryProgress(['Midterm', 'Final Exam', 'Class Test', 'Quiz']);
  const overallSemesterProgress = allDeadlines.length > 0
    ? Math.round(allDeadlines.reduce((acc, curr) => acc + (curr.completed ? 100 : (curr.progress || 0)), 0) / allDeadlines.length)
    : 0;

  // Animate category progress bars
  animateBar('bar-assignments', 'text-assignments', assignmentProgress);
  animateBar('bar-projects', 'text-projects', projectProgress);
  animateBar('bar-exams', 'text-exams', examProgress);
  animateBar('bar-overall', 'text-overall', overallSemesterProgress);

  // 3. Render Donut Chart (Completed, Pending, Overdue)
  renderDonutChart(metrics.completed, metrics.pending, metrics.overdue, metrics.total);
}

function animateBar(barId, textId, targetPercent) {
  const bar = document.getElementById(barId);
  const text = document.getElementById(textId);
  if (!bar || !text) return;

  bar.style.width = '0%';
  setTimeout(() => {
    bar.style.width = `${targetPercent}%`;
  }, 100);

  if (window.animateNumberCount) {
    window.animateNumberCount(text, targetPercent, 1000);
  } else {
    text.textContent = targetPercent;
  }
}

function renderDonutChart(completed, pending, overdue, total) {
  const container = document.getElementById('chart-container');
  if (!container) return;

  if (total === 0) {
    container.innerHTML = `<p class="text-muted">No data available for chart.</p>`;
    return;
  }

  // SVG circle circumference math: 2 * Math.PI * r
  const r = 70;
  const circumference = 2 * Math.PI * r;

  const pCompleted = (completed / total) * circumference;
  const pPending = (pending / total) * circumference;
  const pOverdue = (overdue / total) * circumference;

  const completedOffset = 0;
  const pendingOffset = -pCompleted;
  const overdueOffset = -(pCompleted + pPending);

  container.innerHTML = `
    <svg width="200" height="200" viewBox="0 0 200 200" style="transform: rotate(-90deg); display: block;">
      <!-- Track -->
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="18" />

      <!-- Completed (Green) -->
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--safe-green)" stroke-width="18"
        stroke-dasharray="${pCompleted} ${circumference}" stroke-dashoffset="${completedOffset}"
        style="transition: stroke-dasharray 1.2s ease; filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.4));" />

      <!-- Pending (Orange) -->
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--upcoming-orange)" stroke-width="18"
        stroke-dasharray="${pPending} ${circumference}" stroke-dashoffset="${pendingOffset}"
        style="transition: stroke-dasharray 1.2s ease; filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.4));" />

      <!-- Overdue (Red) -->
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--critical-red)" stroke-width="18"
        stroke-dasharray="${pOverdue} ${circumference}" stroke-dashoffset="${overdueOffset}"
        style="transition: stroke-dasharray 1.2s ease; filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.4));" />
    </svg>

    <div class="chart-center-text">
      <div style="font-size: 1.8rem; font-weight: 800; font-family: var(--font-mono); color: var(--cyan-bright); line-height: 1.1;">${total}</div>
      <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-top: 4px;">Total Tasks</div>
    </div>
  `;
}

// Global render router hook
window.renderCurrentView = renderProgressPage;

document.addEventListener('DOMContentLoaded', () => {
  renderProgressPage();

  window.addEventListener('deadline_radar_update', () => {
    renderProgressPage();
  });
});
