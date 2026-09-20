/**
 * DEADLINE RADAR - CORE APPLICATION & DATA PERSISTENCE ENGINE
 * Pure Vanilla JavaScript & LocalStorage System
 */

const STORAGE_KEYS = {
  DEADLINES: 'deadline_radar_deadlines_v1',
  USER: 'deadline_radar_user_v1',
  SETTINGS: 'deadline_radar_settings_v1',
  NOTIFICATIONS: 'deadline_radar_notifications_v1',
};

// Initial Seed Data (matching the exact prompt specifications)
const DEFAULT_USER = {
  fullName: 'Shaon Somu',
  email: 'somushaon@gmail.com',
  studentId: '2023-1-60-042',
  department: 'Computer Science & Engineering',
  semester: 'Fall 2026',
  role: 'CSE Student',
  avatar: 'SS',
};

const DEFAULT_SETTINGS = {
  darkMode: true,
  deadlineReminders: true,
  emailNotifications: false,
  defaultSort: 'nearest',
  defaultCalendarView: 'month',
};

// Reference current anchor date: September 15, 2026
const CURRENT_ANCHOR_TIME = new Date('2026-09-15T09:00:00');

const SAMPLE_DEADLINES = [
  {
    id: 'dl-1',
    title: 'Java Assignment',
    course: 'Object Oriented Programming',
    type: 'Assignment',
    dueDate: '2026-09-16',
    dueTime: '23:59',
    priority: 'High',
    progress: 80,
    description: 'Complete inheritance, polymorphism, and abstract class exercises with unit tests.',
    completed: false,
    createdAt: '2026-09-10T10:00:00',
  },
  {
    id: 'dl-2',
    title: 'Calculus CT',
    course: 'Mathematics',
    type: 'Class Test',
    dueDate: '2026-09-19',
    dueTime: '10:00',
    priority: 'High',
    progress: 30,
    description: 'Class test on multivariable differentiation, vector calculus, and line integrals.',
    completed: false,
    createdAt: '2026-09-11T14:30:00',
  },
  {
    id: 'dl-3',
    title: 'Internet Programming Project',
    course: 'Internet Programming',
    type: 'Project',
    dueDate: '2026-09-25',
    dueTime: '18:00',
    priority: 'Medium',
    progress: 60,
    description: 'Build a responsive student academic radar web application using HTML, CSS, and Vanilla JavaScript.',
    completed: false,
    createdAt: '2026-09-08T12:00:00',
  },
  {
    id: 'dl-4',
    title: 'Physics Lab Report',
    course: 'Physics',
    type: 'Lab Report',
    dueDate: '2026-09-28',
    dueTime: '17:00',
    priority: 'Low',
    progress: 20,
    description: 'Write up optical diffraction grating experiment data analysis and conclusion.',
    completed: false,
    createdAt: '2026-09-12T09:00:00',
  },
  {
    id: 'dl-5',
    title: 'Database Systems Quiz 2',
    course: 'Database Management',
    type: 'Quiz',
    dueDate: '2026-09-14',
    dueTime: '11:00',
    priority: 'High',
    progress: 100,
    description: 'Relational algebra and SQL query optimization quiz.',
    completed: false, // Overdue by 1 day as of Sep 15!
    createdAt: '2026-09-05T09:00:00',
  },
  {
    id: 'dl-6',
    title: 'Software Engineering Midterm',
    course: 'Software Engineering',
    type: 'Midterm',
    dueDate: '2026-10-04',
    dueTime: '09:30',
    priority: 'High',
    progress: 15,
    description: 'Covers agile methodologies, design patterns, UML diagrams, and software testing.',
    completed: false,
    createdAt: '2026-09-13T16:00:00',
  },
  {
    id: 'dl-7',
    title: 'Digital Logic Design Assignment',
    course: 'Computer Architecture',
    type: 'Assignment',
    dueDate: '2026-09-08',
    dueTime: '23:59',
    priority: 'Medium',
    progress: 100,
    description: 'K-map simplification and sequential logic circuit design.',
    completed: true,
    createdAt: '2026-09-01T10:00:00',
  },
  {
    id: 'dl-8',
    title: 'Algorithm Analysis Lab 3',
    course: 'Data Structures & Algorithms',
    type: 'Lab Report',
    dueDate: '2026-09-09',
    dueTime: '16:00',
    priority: 'High',
    progress: 100,
    description: 'Implement Dijkstra and Bellman-Ford shortest path algorithms with benchmarking.',
    completed: true,
    createdAt: '2026-09-02T11:00:00',
  },
  {
    id: 'dl-9',
    title: 'Technical Presentation 1',
    course: 'Professional Communications',
    type: 'Presentation',
    dueDate: '2026-09-11',
    dueTime: '14:00',
    priority: 'Medium',
    progress: 100,
    description: 'Slide deck presentation on distributed system microservice architectures.',
    completed: true,
    createdAt: '2026-09-04T08:00:00',
  },
  {
    id: 'dl-10',
    title: 'Discrete Math Homework 2',
    course: 'Mathematics',
    type: 'Assignment',
    dueDate: '2026-09-07',
    dueTime: '23:59',
    priority: 'Low',
    progress: 100,
    description: 'Graph theory proofs, Euler paths, and combinatorics exercises.',
    completed: true,
    createdAt: '2026-08-30T10:00:00',
  },
  {
    id: 'dl-11',
    title: 'Compiler Design Assignment 1',
    course: 'Compiler Construction',
    type: 'Assignment',
    dueDate: '2026-09-05',
    dueTime: '23:59',
    priority: 'Medium',
    progress: 100,
    description: 'Lexical analysis using Flex and regular expressions.',
    completed: true,
    createdAt: '2026-08-28T09:00:00',
  },
  {
    id: 'dl-12',
    title: 'Operating Systems Lab 1',
    course: 'Operating Systems',
    type: 'Lab Report',
    dueDate: '2026-09-03',
    dueTime: '17:00',
    priority: 'Medium',
    progress: 100,
    description: 'POSIX process creation, fork, exec, and IPC pipe programming.',
    completed: true,
    createdAt: '2026-08-25T14:00:00',
  },
];

// App Data Store
class DeadlineRadarStore {
  constructor() {
    this.initData();
  }

  initData() {
    if (!localStorage.getItem(STORAGE_KEYS.DEADLINES)) {
      localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(SAMPLE_DEADLINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const initialNotes = [
        { id: 'nt-1', title: 'Deadline Tomorrow', message: 'Java Assignment is due tomorrow (Sep 16).', time: '10m ago', read: false },
        { id: 'nt-2', title: 'Upcoming Deadline', message: 'Calculus CT is due in 4 days (Sep 19).', time: '1h ago', read: false },
        { id: 'nt-3', title: 'Task Completed', message: 'Technical Presentation 1 was marked complete.', time: '2d ago', read: true }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotes));
    }
  }

  // Get current system time (defaults to 2026-09-15 context, but synchronized with real elapsed seconds)
  getNow() {
    return new Date();
  }

  getDeadlines() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DEADLINES);
      return raw ? JSON.parse(raw) : SAMPLE_DEADLINES;
    } catch (e) {
      console.error('Error parsing deadlines', e);
      return SAMPLE_DEADLINES;
    }
  }

  saveDeadlines(deadlines) {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
    window.dispatchEvent(new CustomEvent('deadline_radar_update', { detail: { deadlines } }));
  }

  getUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : DEFAULT_USER;
    } catch (e) {
      return DEFAULT_USER;
    }
  }

  saveUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('deadline_radar_user_update', { detail: { user } }));
  }

  getSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  getNotifications() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  addNotification(title, message) {
    const notes = this.getNotifications();
    const newNote = {
      id: 'nt-' + Date.now(),
      title,
      message,
      time: 'Just now',
      read: false
    };
    notes.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notes));
    window.dispatchEvent(new CustomEvent('deadline_radar_notification_new', { detail: newNote }));
    showToast(title, message);
  }

  markNotificationsRead() {
    const notes = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notes));
    updateNotificationBadge();
  }

  // CRUD Operations
  addDeadline(deadline) {
    const deadlines = this.getDeadlines();
    const newRecord = {
      ...deadline,
      id: 'dl-' + Date.now(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    deadlines.unshift(newRecord);
    this.saveDeadlines(deadlines);
    this.addNotification('Deadline Added', `"${newRecord.title}" was added to your radar.`);
    return newRecord;
  }

  updateDeadline(id, updatedFields) {
    let deadlines = this.getDeadlines();
    let updatedItem = null;
    deadlines = deadlines.map(item => {
      if (item.id === id) {
        updatedItem = { ...item, ...updatedFields };
        return updatedItem;
      }
      return item;
    });
    this.saveDeadlines(deadlines);
    return updatedItem;
  }

  deleteDeadline(id) {
    let deadlines = this.getDeadlines();
    const target = deadlines.find(d => d.id === id);
    deadlines = deadlines.filter(d => d.id !== id);
    this.saveDeadlines(deadlines);
    if (target) {
      this.addNotification('Deadline Deleted', `"${target.title}" was removed.`);
    }
  }

  toggleCompleteDeadline(id) {
    let deadlines = this.getDeadlines();
    let target = null;
    deadlines = deadlines.map(item => {
      if (item.id === id) {
        target = { ...item, completed: !item.completed };
        if (target.completed) {
          target.progress = 100;
        }
        return target;
      }
      return item;
    });
    this.saveDeadlines(deadlines);
    if (target && target.completed) {
      this.addNotification('Task Completed', `You completed "${target.title}". Great work!`);
    }
    return target;
  }

  getDeadlineById(id) {
    return this.getDeadlines().find(d => d.id === id) || null;
  }

  // Calculations & Urgency Engine
  calculateUrgency(deadline) {
    if (deadline.completed) {
      return {
        level: 'SAFE',
        class: 'safe',
        label: 'Completed',
        badgeClass: 'badge-safe',
        daysRemaining: 999,
        isOverdue: false,
        timeRemainingText: 'Task Completed'
      };
    }

    const dueDateTime = new Date(`${deadline.dueDate}T${deadline.dueTime || '23:59'}:00`);
    const now = new Date();
    const diffMs = dueDateTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        level: 'OVERDUE',
        class: 'critical',
        label: overdueDays <= 1 ? '1 day overdue' : `${overdueDays} days overdue`,
        badgeClass: 'badge-overdue',
        daysRemaining: diffDays,
        isOverdue: true,
        timeRemainingText: 'OVERDUE'
      };
    }

    // 0–2 days: CRITICAL (Red)
    if (diffDays <= 2) {
      let label = `${diffDays} days remaining`;
      if (diffDays === 0) label = 'Due today';
      else if (diffDays === 1) label = 'Due tomorrow';

      return {
        level: 'CRITICAL',
        class: 'critical',
        label: label,
        badgeClass: 'badge-critical',
        daysRemaining: diffDays,
        isOverdue: false,
        timeRemainingText: label
      };
    }

    // 3–7 days: UPCOMING (Orange)
    if (diffDays <= 7) {
      return {
        level: 'UPCOMING',
        class: 'upcoming',
        label: `${diffDays} days remaining`,
        badgeClass: 'badge-upcoming',
        daysRemaining: diffDays,
        isOverdue: false,
        timeRemainingText: `${diffDays} days remaining`
      };
    }

    // >7 days: SAFE (Green)
    return {
      level: 'SAFE',
      class: 'safe',
      label: `${diffDays} days remaining`,
      badgeClass: 'badge-safe',
      daysRemaining: diffDays,
      isOverdue: false,
      timeRemainingText: `${diffDays} days remaining`
    };
  }

  // Precise Live Countdown string
  getCountdownString(deadline) {
    if (deadline.completed) return 'COMPLETED';
    const dueDateTime = new Date(`${deadline.dueDate}T${deadline.dueTime || '23:59'}:00`);
    const now = new Date();
    const diffMs = dueDateTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'OVERDUE';

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  // Dashboard Summary Metrics
  getMetrics() {
    const all = this.getDeadlines();
    const completed = all.filter(d => d.completed).length;
    let pending = 0;
    let overdue = 0;

    all.forEach(d => {
      if (!d.completed) {
        const urgency = this.calculateUrgency(d);
        if (urgency.isOverdue) overdue++;
        else pending++;
      }
    });

    return {
      total: all.length,
      completed,
      pending,
      overdue
    };
  }
}

// Global Store Instance
window.RadarStore = new DeadlineRadarStore();

// ==========================================================================
// TOAST NOTIFICATION SYSTEM
// ==========================================================================
function showToast(title, message, type = 'cyan') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">◉</div>
    <div class="toast-content">
      <h5>${escapeHTML(title)}</h5>
      <p>${escapeHTML(message)}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

window.showToast = showToast;

function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge-count');
  if (!badge) return;
  const notes = window.RadarStore.getNotifications();
  const unreadCount = notes.filter(n => !n.read).length;
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// Helper to escape HTML characters
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.escapeHTML = escapeHTML;

// ==========================================================================
// MODALS SYSTEM (Add Deadline, Deadline Details, Notification Drawer)
// ==========================================================================

// Open Add Deadline Modal
window.openAddDeadlineModal = function (deadlineData = null) {
  const modal = document.getElementById('add-deadline-modal');
  if (!modal) return;

  const form = document.getElementById('deadline-form');
  const titleElem = document.getElementById('modal-form-title');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (deadlineData) {
    titleElem.innerHTML = '<span>⚡</span> Edit Deadline';
    submitBtn.textContent = 'Save Changes';
    form.dataset.editId = deadlineData.id;
    document.getElementById('input-title').value = deadlineData.title;
    document.getElementById('input-course').value = deadlineData.course;
    document.getElementById('input-type').value = deadlineData.type;
    document.getElementById('input-date').value = deadlineData.dueDate;
    document.getElementById('input-time').value = deadlineData.dueTime || '23:59';
    document.getElementById('input-priority').value = deadlineData.priority;
    document.getElementById('input-progress').value = deadlineData.progress || 0;
    document.getElementById('progress-val-display').textContent = (deadlineData.progress || 0) + '%';
    document.getElementById('input-desc').value = deadlineData.description || '';
  } else {
    titleElem.innerHTML = '<span>⚡</span> Add New Deadline';
    submitBtn.textContent = 'Add Deadline';
    delete form.dataset.editId;
    form.reset();
    // Default tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    document.getElementById('input-date').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('input-time').value = '23:59';
    document.getElementById('input-progress').value = 0;
    document.getElementById('progress-val-display').textContent = '0%';
  }

  modal.classList.add('active');
};

window.closeAddDeadlineModal = function () {
  const modal = document.getElementById('add-deadline-modal');
  if (modal) modal.classList.remove('active');
};

// Open Deadline Details Modal
window.openDetailsModal = function (id) {
  const deadline = window.RadarStore.getDeadlineById(id);
  if (!deadline) return;

  const modal = document.getElementById('details-modal');
  if (!modal) return;

  const urgency = window.RadarStore.calculateUrgency(deadline);

  document.getElementById('details-title').textContent = deadline.title;
  document.getElementById('details-course').textContent = deadline.course;
  document.getElementById('details-type').textContent = deadline.type;
  document.getElementById('details-due').textContent = `${deadline.dueDate} — ${deadline.dueTime || '11:59 PM'}`;
  document.getElementById('details-remaining').textContent = urgency.label;
  document.getElementById('details-priority').textContent = deadline.priority;
  document.getElementById('details-progress').textContent = deadline.progress + '%';
  document.getElementById('details-progressbar').style.width = deadline.progress + '%';
  document.getElementById('details-desc').textContent = deadline.description || 'No description provided.';

  const completeBtn = document.getElementById('details-complete-btn');
  if (completeBtn) {
    completeBtn.textContent = deadline.completed ? 'Mark Incomplete' : 'Mark Complete';
    completeBtn.onclick = () => {
      window.RadarStore.toggleCompleteDeadline(deadline.id);
      window.closeDetailsModal();
      if (typeof renderCurrentView === 'function') renderCurrentView();
    };
  }

  const editBtn = document.getElementById('details-edit-btn');
  if (editBtn) {
    editBtn.onclick = () => {
      window.closeDetailsModal();
      window.openAddDeadlineModal(deadline);
    };
  }

  const deleteBtn = document.getElementById('details-delete-btn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      if (confirm(`Are you sure you want to delete "${deadline.title}"?`)) {
        window.RadarStore.deleteDeadline(deadline.id);
        window.closeDetailsModal();
        if (typeof renderCurrentView === 'function') renderCurrentView();
      }
    };
  }

  modal.classList.add('active');
};

window.closeDetailsModal = function () {
  const modal = document.getElementById('details-modal');
  if (modal) modal.classList.remove('active');
};

// Open Notification Drawer Modal
window.toggleNotificationDrawer = function () {
  const modal = document.getElementById('notification-modal');
  if (!modal) return;
  modal.classList.toggle('active');
  if (modal.classList.contains('active')) {
    renderNotificationList();
    window.RadarStore.markNotificationsRead();
  }
};

function renderNotificationList() {
  const list = document.getElementById('notification-list');
  if (!list) return;

  const notes = window.RadarStore.getNotifications();
  if (notes.length === 0) {
    list.innerHTML = `<p class="text-muted" style="text-align:center; padding: 20px;">No notifications yet.</p>`;
    return;
  }

  list.innerHTML = notes.map(n => `
    <div style="padding: 12px 14px; border-radius: 8px; background: rgba(2,6,23,0.6); border: 1px solid var(--border-subtle); margin-bottom: 8px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
        <span style="font-size:0.85rem; font-weight:700; color:var(--cyan-bright);">${escapeHTML(n.title)}</span>
        <span style="font-size:0.75rem; color:var(--text-dim);">${escapeHTML(n.time)}</span>
      </div>
      <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">${escapeHTML(n.message)}</p>
    </div>
  `).join('');
}

// Global Form Submit Handler for Add / Edit
function initModalForms() {
  const form = document.getElementById('deadline-form');
  if (!form) return;

  const rangeInput = document.getElementById('input-progress');
  const rangeDisplay = document.getElementById('progress-val-display');
  if (rangeInput && rangeDisplay) {
    rangeInput.addEventListener('input', (e) => {
      rangeDisplay.textContent = e.target.value + '%';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('input-title').value.trim();
    const course = document.getElementById('input-course').value.trim();
    const type = document.getElementById('input-type').value;
    const dueDate = document.getElementById('input-date').value;
    const dueTime = document.getElementById('input-time').value || '23:59';
    const priority = document.getElementById('input-priority').value;
    const progress = parseInt(document.getElementById('input-progress').value, 10) || 0;
    const description = document.getElementById('input-desc').value.trim();

    if (!title || !course || !dueDate) {
      alert('Please fill in all required fields (Title, Course, and Due Date).');
      return;
    }

    const payload = {
      title,
      course,
      type,
      dueDate,
      dueTime,
      priority,
      progress,
      description,
    };

    if (form.dataset.editId) {
      window.RadarStore.updateDeadline(form.dataset.editId, payload);
      showToast('Updated Successfully', `"${title}" has been updated.`);
    } else {
      window.RadarStore.addDeadline(payload);
    }

    window.closeAddDeadlineModal();
    if (typeof renderCurrentView === 'function') {
      renderCurrentView();
    }
  });
}

// Sidebar Mobile Toggle & User Info
function initSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0');
    });

    if (localStorage.getItem('sidebar_collapsed') === '1' && window.innerWidth > 1024) {
      sidebar.classList.add('collapsed');
    }
  }

  if (mobileToggle && sidebar && backdrop) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }

  // Populate User Info
  const user = window.RadarStore.getUser();
  const userNameElem = document.getElementById('sidebar-user-name');
  const userRoleElem = document.getElementById('sidebar-user-role');
  const userAvatarElem = document.getElementById('sidebar-user-avatar');

  if (userNameElem) userNameElem.textContent = user.fullName;
  if (userRoleElem) userRoleElem.textContent = user.department || user.role;
  if (userAvatarElem) userAvatarElem.textContent = user.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  // Notification Bell Click
  const bell = document.getElementById('notification-bell-btn');
  if (bell) {
    bell.addEventListener('click', window.toggleNotificationDrawer);
  }
  updateNotificationBadge();
}

// Live Clock in Header
function initLiveDate() {
  const dateElem = document.getElementById('live-header-date');
  if (!dateElem) return;

  function update() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    dateElem.textContent = now.toLocaleDateString('en-US', options);
  }

  update();
}

// Live Countdown Updater (runs every second across any active page)
function initLiveCountdownTicker() {
  setInterval(() => {
    const countdownElements = document.querySelectorAll('[data-countdown-id]');
    countdownElements.forEach(el => {
      const id = el.getAttribute('data-countdown-id');
      const deadline = window.RadarStore.getDeadlineById(id);
      if (deadline) {
        const text = window.RadarStore.getCountdownString(deadline);
        el.textContent = text;
        if (text === 'OVERDUE') {
          el.className = 'countdown-digits critical';
        }
      }
    });
  }, 1000);
}

// Common DOM Ready Bootstrapper
document.addEventListener('DOMContentLoaded', () => {
  initModalForms();
  initSidebar();
  initLiveDate();
  initLiveCountdownTicker();
  updateNotificationBadge();
});
