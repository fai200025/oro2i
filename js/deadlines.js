/**
 * DEADLINE RADAR - MY DEADLINES CONTROLLER
 * Search, multi-category filters, sorting, and full CRUD interactions
 */

let currentSearchQuery = '';
let currentUrgencyFilter = 'all';
let currentCategoryFilter = 'all';
let currentSort = 'nearest';

function renderDeadlinesPage() {
  const container = document.getElementById('deadlines-grid');
  if (!container) return;

  const store = window.RadarStore;
  let deadlines = store.getDeadlines();

  // 1. Search filter
  if (currentSearchQuery.trim()) {
    const q = currentSearchQuery.toLowerCase().trim();
    deadlines = deadlines.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.course.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  }

  // 2. Urgency/Status filter
  if (currentUrgencyFilter !== 'all') {
    if (currentUrgencyFilter === 'completed') {
      deadlines = deadlines.filter(d => d.completed);
    } else if (currentUrgencyFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      deadlines = deadlines.filter(d => !d.completed && d.dueDate === todayStr);
    } else if (currentUrgencyFilter === 'overdue') {
      deadlines = deadlines.filter(d => !d.completed && store.calculateUrgency(d).isOverdue);
    } else if (currentUrgencyFilter === 'upcoming') {
      deadlines = deadlines.filter(d => !d.completed && !store.calculateUrgency(d).isOverdue);
    }
  }

  // 3. Category filter
  if (currentCategoryFilter !== 'all') {
    if (currentCategoryFilter === 'Exam') {
      deadlines = deadlines.filter(d => ['Midterm', 'Final Exam', 'Class Test', 'Quiz'].includes(d.type));
    } else {
      deadlines = deadlines.filter(d => d.type === currentCategoryFilter);
    }
  }

  // 4. Sorting
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };
  if (currentSort === 'nearest') {
    deadlines.sort((a, b) => new Date(`${a.dueDate}T${a.dueTime || '23:59'}:00`) - new Date(`${b.dueDate}T${b.dueTime || '23:59'}:00`));
  } else if (currentSort === 'farthest') {
    deadlines.sort((a, b) => new Date(`${b.dueDate}T${b.dueTime || '23:59'}:00`) - new Date(`${a.dueDate}T${a.dueTime || '23:59'}:00`));
  } else if (currentSort === 'priority') {
    deadlines.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
  } else if (currentSort === 'recent') {
    deadlines.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  // Render
  if (deadlines.length === 0) {
    container.innerHTML = `
      <div class="glass-card empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📋</div>
        <h4>No matching deadlines found</h4>
        <p>Try adjusting your search criteria or add a new academic deadline.</p>
        <button class="btn btn-primary" onclick="window.openAddDeadlineModal()">+ Add Deadline</button>
      </div>
    `;
    return;
  }

  container.innerHTML = deadlines.map(d => {
    const urgency = store.calculateUrgency(d);
    const countdown = store.getCountdownString(d);

    return `
      <div class="glass-card deadline-card animate-card ${d.completed ? 'completed-card' : ''}" onclick="window.openDetailsModal('${d.id}')">
        <div class="deadline-card-header">
          <div class="deadline-title-group">
            <h4 style="${d.completed ? 'text-decoration: line-through; opacity: 0.75;' : ''}">${window.escapeHTML(d.title)}</h4>
            <span class="deadline-course">${window.escapeHTML(d.course)}</span>
          </div>
          <span class="badge ${urgency.badgeClass}">
            <span class="pulse-dot ${urgency.class}"></span>
            ${urgency.label}
          </span>
        </div>

        <div class="deadline-countdown-box">
          <span class="countdown-label">COUNTDOWN</span>
          <span class="countdown-digits ${urgency.class}" data-countdown-id="${d.id}">${countdown}</span>
        </div>

        <div class="deadline-progress-container">
          <div class="progress-header">
            <span>Progress: ${d.progress || 0}%</span>
            <span>Due ${d.dueDate}</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${d.progress || 0}%;"></div>
          </div>
        </div>

        <div class="deadline-card-footer" onclick="event.stopPropagation()">
          <span class="deadline-type-tag">
            <span>📌</span> ${window.escapeHTML(d.type)} • <strong style="color:var(--text-white);">${d.priority} Priority</strong>
          </span>
          <div class="deadline-actions">
            <button class="btn btn-secondary btn-icon" title="Edit" onclick="window.openAddDeadlineModal(window.RadarStore.getDeadlineById('${d.id}'))">
              ✏️
            </button>
            <button class="btn btn-secondary btn-icon" title="${d.completed ? 'Mark Incomplete' : 'Complete'}" onclick="window.RadarStore.toggleCompleteDeadline('${d.id}'); renderDeadlinesPage();">
              ${d.completed ? '↺' : '✓'}
            </button>
            <button class="btn btn-danger btn-icon" title="Delete" onclick="if(confirm('Delete this deadline?')){ window.RadarStore.deleteDeadline('${d.id}'); renderDeadlinesPage(); }">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initDeadlineControls() {
  const searchInput = document.getElementById('search-deadlines-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderDeadlinesPage();
    });
  }

  const sortSelect = document.getElementById('sort-deadlines-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderDeadlinesPage();
    });
  }

  // Urgency status chips
  const statusChips = document.querySelectorAll('[data-filter-status]');
  statusChips.forEach(chip => {
    chip.addEventListener('click', () => {
      statusChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentUrgencyFilter = chip.getAttribute('data-filter-status');
      renderDeadlinesPage();
    });
  });

  // Category chips
  const categoryChips = document.querySelectorAll('[data-filter-category]');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategoryFilter = chip.getAttribute('data-filter-category');
      renderDeadlinesPage();
    });
  });
}

// Global render router hook
window.renderCurrentView = renderDeadlinesPage;

document.addEventListener('DOMContentLoaded', () => {
  initDeadlineControls();
  renderDeadlinesPage();

  window.addEventListener('deadline_radar_update', () => {
    renderDeadlinesPage();
  });
});
