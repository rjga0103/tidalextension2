function loadTodaySchedules() {
  const today = new Date().toISOString().split('T')[0];
  chrome.storage.local.get(['schedules'], (result) => {
    const schedules = result.schedules || [];
    const todaySchedules = schedules.filter(schedule => schedule.dateTime.startsWith(today));
    const list = document.getElementById('todaySchedules');
    list.innerHTML = '';
    todaySchedules.forEach(schedule => {
      const li = document.createElement('li');
      li.textContent = `${schedule.dateTime} - ${schedule.playlistType === 'own' ? 'Playlist Propia' : 'Playlist Aleatoria'}`;
      list.appendChild(li);
    });
  });
}

// Cargar la programación del día al abrir la página
loadTodaySchedules();