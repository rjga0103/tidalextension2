// Función para cargar contenido dinámico
function loadContent(page) {
  fetch(chrome.runtime.getURL(`pages/${page}.html`))
    .then(response => response.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;
      // Cargar el script correspondiente
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(`pages/${page}.js`);
      document.body.appendChild(script);
    });
}

// Navegación
document.getElementById('openPlaylists').addEventListener('click', () => {
  loadContent('playlists');
});

document.getElementById('openScheduling').addEventListener('click', () => {
  loadContent('scheduling');
});

document.getElementById('openSettings').addEventListener('click', () => {
  loadContent('settings');
});

document.getElementById('openTodaySchedule').addEventListener('click', () => {
  loadContent('today');
});