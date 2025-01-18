// Mostrar y permitir modificar el ID del navegador
chrome.storage.local.get(['browserId'], (result) => {
  const browserIdInput = document.getElementById('browserIdInput');
  browserIdInput.value = result.browserId || '';
});

// Guardar el ID del navegador
document.getElementById('saveBrowserId').addEventListener('click', () => {
  const newBrowserId = document.getElementById('browserIdInput').value;
  if (newBrowserId) {
    chrome.storage.local.set({ browserId: newBrowserId }, () => {
      alert('ID del navegador actualizado con éxito.');
    });
  } else {
    alert('Por favor, introduce un ID válido.');
  }
});

// Importar Configuración
document.getElementById('importSettings').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const settings = JSON.parse(e.target.result);
      chrome.storage.local.set(settings, () => {
        alert('Configuración importada con éxito.');
        location.reload(); // Recargar para aplicar cambios
      });
    };
    reader.readAsText(file);
  };
  input.click();
});

// Exportar Configuración
document.getElementById('exportSettings').addEventListener('click', () => {
  chrome.storage.local.get(null, (settings) => {
    const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tidalplaylist-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  });
});

// Resetear Configuración
document.getElementById('resetSettings').addEventListener('click', () => {
  chrome.storage.local.clear(() => {
    alert('Configuración reseteada con éxito.');
    location.reload(); // Recargar para aplicar cambios
  });
});

// Guardar Configuración de Telegram
document.getElementById('saveTelegramSettings').addEventListener('click', () => {
  const token = document.getElementById('telegramToken').value;
  const chatId = document.getElementById('telegramChatId').value;
  if (token && chatId) {
    chrome.storage.local.set({ telegramToken: token, telegramChatId: chatId }, () => {
      alert('Configuración de Telegram guardada con éxito.');
    });
  } else {
    alert('Por favor, introduce el token y el chat ID de Telegram.');
  }
});

// Enviar Mensaje de Prueba a Telegram
document.getElementById('testTelegram').addEventListener('click', () => {
  chrome.storage.local.get(['browserId', 'telegramToken', 'telegramChatId'], (result) => {
    const { browserId, telegramToken, telegramChatId } = result;
    if (telegramToken && telegramChatId) {
      const message = `Mensaje de prueba desde ${browserId || 'Navegador no identificado'}`;
      const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message
        })
      }).then(response => response.json())
        .then(data => {
          if (data.ok) {
            alert('Mensaje de prueba enviado con éxito.');
          } else {
            alert('Error al enviar el mensaje de prueba.');
          }
        });
    } else {
      alert('Por favor, configura el token y el chat ID de Telegram.');
    }
  });
});

// Cargar configuración de Telegram al abrir la página
chrome.storage.local.get(['telegramToken', 'telegramChatId'], (result) => {
  document.getElementById('telegramToken').value = result.telegramToken || '';
  document.getElementById('telegramChatId').value = result.telegramChatId || '';
});