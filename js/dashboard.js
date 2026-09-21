/**
 * DEADLINE RADAR - DASHBOARD CONTROLLER
 * Handles Statistics counting, Today's Focus, and Quick Actions
 */

function renderDashboard() {
  const store = window.RadarStore;
  const metrics = store.getMetrics();

  // 1. Dynamic Greeting based on time of day
  const greetingElem = document.getElementById('dashboard-greeting-text');
  if (greetingElem) {
    const user = store.getUser();
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
    else if (hour >= 17) timeGreeting = 'Good Evening';

    greetingElem.textContent = `${timeGreeting}, ${user.fullName.split(' ')[0]} 👋`;
  }

  // 2. Animated Number Counters for Statistics Cards (0 -> Value)
  const statTotal = document.getElementById('stat-total-val');
  const statCompleted = document.getElementById('stat-completed-val');
  const statPending = document.getElementById('stat-pending-val');
  const statOverdue = document.getElementById('stat-overdue-val');

  if (window.animateNumberCount) {
    if (statTotal) window.animateNumberCount(statTotal, metrics.total);
    if (statCompleted) window.animateNumberCount(statCompleted, metrics.completed);
    if (statPending) window.animateNumberCount(statPending, metrics.pending);
    if (statOverdue) window.animateNumberCount(statOverdue, metrics.overdue);
  } else {
    if (statTotal) statTotal.textContent = metrics.total;
    if (statCompleted) statCompleted.textContent = metrics.completed;
    if (statPending) statPending.textContent = metrics.pending;
    if (statOverdue) statOverdue.textContent = metrics.overdue;
  }

  // 3. Render Today's Focus List
  renderTodaysFocus();
}

function renderTodaysFocus() {
  const container = document.getElementById('todays-focus-list');
  if (!container) return;

  const store = window.RadarStore;
  const all = store.getDeadlines();

  // Filter out completed, prioritize by due date & priority
  const activeDeadlines = all.filter(d => !d.completed);

  // Sorting logic for Today's Focus:
  // Overdue and Critical first, then by earliest due date, then by priority High -> Medium -> Low
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };

  activeDeadlines.sort((a, b) => {
    const timeA = new Date(`${a.dueDate}T${a.dueTime || '23:59'}:00`).getTime();
    const timeB = new Date(`${b.dueDate}T${b.dueTime || '23:59'}:00`).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
  });

  if (activeDeadlines.length === 0) {
    container.innerHTML = `
      <div class="glass-card empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🎉</div>
        <h4>No deadlines yet</h4>
        <p>You're completely caught up! Add your first academic deadline to monitor your workload.</p>
        <button class="btn btn-primary" onclick="window.openAddDeadlineModal()">+ Add Deadline</button>
      </div>
    `;
    return;
  }

  // Display top focus items
  const focusItems = activeDeadlines.slice(0, 6);

  container.innerHTML = focusItems.map(d => {
    const urgency = store.calculateUrgency(d);
    const countdown = store.getCountdownString(d);

    return `
      <div class="glass-card deadline-card animate-card" onclick="window.openDetailsModal('${d.id}')">
        <div class="deadline-card-header">
          <div class="deadline-title-group">
            <h4>${window.escapeHTML(d.title)}</h4>
            <span class="deadline-course">${window.escapeHTML(d.course)}</span>
          </div>
          <span class="badge ${urgency.badgeClass}">
            <span class="pulse-dot ${urgency.class}"></span>
            ${urgency.label}
          </span>
        </div>

        <div class="deadline-countdown-box">
          <span class="countdown-label">TIME REMAINING</span>
          <span class="countdown-digits ${urgency.class}" data-countdown-id="${d.id}">${countdown}</span>
        </div>

        <div class="deadline-progress-container">
          <div class="progress-header">
            <span>Task Progress</span>
            <span style="font-weight:600; color:var(--cyan-bright);">${d.progress || 0}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${d.progress || 0}%;"></div>
          </div>
        </div>

        <div class="deadline-card-footer" onclick="event.stopPropagation()">
          <span class="deadline-type-tag">
            <span>📌</span> ${window.escapeHTML(d.type)}
          </span>
          <div class="deadline-actions">
            <button class="btn btn-secondary btn-icon" title="Edit" onclick="window.openAddDeadlineModal(window.RadarStore.getDeadlineById('${d.id}'))">
              ✏️
            </button>
            <button class="btn btn-secondary btn-icon" title="Mark Complete" onclick="window.RadarStore.toggleCompleteDeadline('${d.id}'); renderDashboard();">
              ✓
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Global render router hook
window.renderCurrentView = renderDashboard;

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();

  // Listen for storage events
  window.addEventListener('deadline_radar_update', () => {
    renderDashboard();
  });
});
