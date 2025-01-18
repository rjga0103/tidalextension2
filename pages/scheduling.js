document.getElementById('addSchedule').addEventListener('click', () => {
  const dateTime = document.getElementById('scheduleDateTime').value;
  const playlistType = document.getElementById('playlistType').value;
  if (dateTime) {
    const formattedDateTime = formatDateTime(new Date(dateTime));
    addSchedule(formattedDateTime, playlistType);
  } else {
    alert('Por favor, selecciona una fecha y hora.');
  }
});

function addSchedule(dateTime, playlistType) {
  chrome.storage.local.get(['schedules'], (result) => {
    const schedules = result.schedules || [];
    schedules.push({ dateTime, playlistType });
    chrome.storage.local.set({ schedules }, () => {
      updateSchedulesList(schedules);
    });
  });
}

function updateSchedulesList(schedules) {
  const list = document.getElementById('schedulesList');
  list.innerHTML = '';
  schedules.forEach((schedule, index) => {
    const li = document.createElement('li');
    li.textContent = `${schedule.dateTime} - ${schedule.playlistType === 'own' ? 'Playlist Propia' : 'Playlist Aleatoria'}`;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.addEventListener('click', () => {
      deleteSchedule(index);
    });
    li.appendChild(deleteButton);
    list.appendChild(li);
  });
}

function deleteSchedule(index) {
  chrome.storage.local.get(['schedules'], (result) => {
    const schedules = result.schedules || [];
    schedules.splice(index, 1);
    chrome.storage.local.set({ schedules }, () => {
      updateSchedulesList(schedules);
    });
  });
}

// Formatear la fecha y hora (DIA/MES/AÑO HH:MM)
function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

chrome.storage.local.get(['schedules'], (result) => {
  updateSchedulesList(result.schedules || []);
});