/**
 * DEADLINE RADAR - CALENDAR CONTROLLER
 * Dark Futuristic Monthly Calendar with Glowing Indicators
 */

let calendarCurrentDate = new Date('2026-09-15');

function renderCalendar() {
  const container = document.getElementById('calendar-grid-body');
  const monthTitle = document.getElementById('calendar-month-year');
  if (!container || !monthTitle) return;

  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();

  // Set Title (e.g. September 2026)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  monthTitle.textContent = `${monthNames[month]} ${year}`;

  const store = window.RadarStore;
  const deadlines = store.getDeadlines();

  // First day of month & total days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Today comparison
  const realToday = new Date();
  const isCurrentMonth = realToday.getFullYear() === year && realToday.getMonth() === month;
  const todayDateNum = realToday.getDate();

  let html = '';

  // Day Headers (Sun - Sat)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayLabels.forEach(d => {
    html += `<div class="calendar-day-header">${d}</div>`;
  });

  // Previous month trailing days
  for (let x = firstDayIndex; x > 0; x--) {
    const dayNum = prevMonthTotalDays - x + 1;
    html += `
      <div class="calendar-cell other-month">
        <span class="calendar-date-number">${dayNum}</span>
      </div>
    `;
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${year}-${pad(month + 1)}-${pad(i)}`;

    // Match deadlines on this date
    const dayDeadlines = deadlines.filter(d => d.dueDate === dateStr);
    const isToday = isCurrentMonth && i === todayDateNum;

    let itemsHtml = '';
    dayDeadlines.forEach(d => {
      const urgency = store.calculateUrgency(d);
      itemsHtml += `
        <div class="calendar-deadline-pill ${urgency.class}" title="${window.escapeHTML(d.title)} (${d.course})" onclick="event.stopPropagation(); window.openDetailsModal('${d.id}')">
          ${window.escapeHTML(d.title)}
        </div>
      `;
    });

    html += `
      <div class="calendar-cell ${isToday ? 'today' : ''}" onclick="window.openAddWithDate('${dateStr}')">
        <span class="calendar-date-number">${i}</span>
        ${itemsHtml}
      </div>
    `;
  }

  // Next month leading days to complete grid (up to 35 or 42 cells)
  const filledCells = firstDayIndex + totalDays;
  const totalCellsNeeded = filledCells > 35 ? 42 : 35;
  const nextDays = totalCellsNeeded - filledCells;

  for (let j = 1; j <= nextDays; j++) {
    html += `
      <div class="calendar-cell other-month">
        <span class="calendar-date-number">${j}</span>
      </div>
    `;
  }

  container.innerHTML = html;
}

window.openAddWithDate = function (dateStr) {
  window.openAddDeadlineModal();
  const dateInput = document.getElementById('input-date');
  if (dateInput) dateInput.value = dateStr;
};

function initCalendarControls() {
  const prevBtn = document.getElementById('cal-prev-btn');
  const nextBtn = document.getElementById('cal-next-btn');
  const todayBtn = document.getElementById('cal-today-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      calendarCurrentDate = new Date();
      renderCalendar();
    });
  }
}

// Global render router hook
window.renderCurrentView = renderCalendar;

document.addEventListener('DOMContentLoaded', () => {
  initCalendarControls();
  renderCalendar();

  window.addEventListener('deadline_radar_update', () => {
    renderCalendar();
  });
});
