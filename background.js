// Escuchar cuando se instala la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log("TidalPlaylist Scheduler instalado.");
  checkScheduledPlayback(); // Verificar la programación al instalar
});

// Verificar la programación cada minuto
chrome.alarms.create("checkPlayback", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkPlayback") {
    checkScheduledPlayback();
  }
});

// Función para verificar la programación
function checkScheduledPlayback() {
  const now = new Date();
  const currentDateTime = formatDateTime(now); // Formato: DIA/MES/AÑO HH:MM

  chrome.storage.local.get(['schedules', 'browserId', 'telegramToken', 'telegramChatId'], (result) => {
    const { schedules, browserId, telegramToken, telegramChatId } = result;
    const scheduledPlayback = schedules.find(schedule => schedule.dateTime === currentDateTime);

    if (scheduledPlayback) {
      getPlaylistUrl(scheduledPlayback.playlistType).then((playlistUrl) => {
        if (playlistUrl) {
          openPlaylistAndShuffle(playlistUrl, browserId, telegramToken, telegramChatId);
        } else {
          sendTelegramNotification(telegramToken, telegramChatId, `${currentDateTime} - Navegador ${browserId}: No se encontró la playlist.`);
        }
      });
    }
  });
}

// Obtener una URL de playlist aleatoria
function getPlaylistUrl(playlistType) {
  return new Promise((resolve) => {
    chrome.storage.local.get([playlistType === 'own' ? 'ownPlaylists' : 'randomPlaylists'], (result) => {
      const playlists = result[playlistType === 'own' ? 'ownPlaylists' : 'randomPlaylists'] || [];
      const randomIndex = Math.floor(Math.random() * playlists.length);
      resolve(playlists[randomIndex]);
    });
  });
}

// Abrir la playlist y simular el clic en "Shuffle" o "Reproducir"
function openPlaylistAndShuffle(playlistUrl, browserId, telegramToken, telegramChatId) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      chrome.tabs.update(activeTab.id, { url: playlistUrl }, () => {
        // Esperar unos segundos para que la página cargue
        setTimeout(() => {
          startPlayback(activeTab.id, browserId, telegramToken, telegramChatId);
        }, 10000); // 10 segundos para asegurar que la página cargue
      });
    }
  });
}

// Función para iniciar la reproducción
function startPlayback(tabId, browserId, telegramToken, telegramChatId) {
  let attempts = 0;
  const maxAttempts = 5; // Número máximo de intentos
  const interval = 5000; // Intervalo de 5 segundos entre intentos

  const checkInterval = setInterval(() => {
    chrome.scripting.executeScript({
      target: { tabId },
      function: simulatePlayback,
    }, (results) => {
      if (results && results[0].result === true) {
        clearInterval(checkInterval);
        const now = new Date();
        const currentDateTime = formatDateTime(now);
        sendTelegramNotification(telegramToken, telegramChatId, `${currentDateTime} - Navegador ${browserId}: Reproducción iniciada.`);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          const now = new Date();
          const currentDateTime = formatDateTime(now);
          sendTelegramNotification(telegramToken, telegramChatId, `${currentDateTime} - Navegador ${browserId}: No se pudo iniciar la reproducción.`);
        }
      }
    });
  }, interval);
}

function simulatePlayback() {
  // Selectores para el botón "Reproducir"
  const playButtonSelectors = [
    'button[aria-label="Play"]', // Selector por defecto
    '#main > div.for-cypress__react-router--loaded > div.wrapper--q1WoK > div.headerContainer--siAOV > div.actionContainer--A27gj > div.container--LFRg3 > button.button--kYVJj.large--DJyGN.primary--tYWc3.button--_0I_t', // Selector específico
    'button[data-test="play-all"]', // Selector basado en data-test
    'button.button--kYVJj.large--DJyGN.primary--tYWc3.button--_0I_t' // Selector basado en clases
  ];

  // Selectores para el botón "Aleatorio/Shuffle"
  const shuffleButtonSelectors = [
    'button[aria-label="Shuffle"]', // Selector por defecto
    '#main > div.for-cypress__react-router--loaded > div.wrapper--q1WoK > div.headerContainer--siAOV > div.actionContainer--A27gj > div.container--LFRg3 > button.button--kYVJj.large--DJyGN.secondary--dcYz0.button--_0I_t', // Selector específico
    'button[data-test="shuffle-all"]', // Selector basado en data-test
    'button.button--kYVJj.large--DJyGN.secondary--dcYz0.button--_0I_t' // Selector basado en clases
  ];

  // Intentar con el botón "Aleatorio/Shuffle"
  for (const selector of shuffleButtonSelectors) {
    const shuffleButton = document.querySelector(selector);
    if (shuffleButton) {
      shuffleButton.click();
      console.log(`Botón Aleatorio/Shuffle clickeado (selector: ${selector}).`);
      return true;
    }
  }

  // Intentar con el botón "Reproducir"
  for (const selector of playButtonSelectors) {
    const playButton = document.querySelector(selector);
    if (playButton) {
      playButton.click();
      console.log(`Botón Reproducir clickeado (selector: ${selector}).`);
      return true;
    }
  }

  // Si no se encuentra ningún botón
  console.log("No se encontró ningún botón de reproducción.");
  return false;
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

// Enviar notificación a Telegram
function sendTelegramNotification(token, chatId, message) {
  if (token && chatId) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    }).then(response => response.json())
      .then(data => {
        if (!data.ok) {
          console.error("Error al enviar notificación a Telegram:", data);
        }
      });
  }
}