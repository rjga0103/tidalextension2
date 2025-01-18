document.getElementById('addOwnPlaylist').addEventListener('click', () => {
  const url = document.getElementById('ownPlaylistUrl').value;
  if (url && isValidTidalUrl(url)) {
    addPlaylist(url, 'ownPlaylistsList', 'ownPlaylists');
  } else {
    alert('Por favor, introduce una URL válida de Tidal.');
  }
});

document.getElementById('addRandomPlaylist').addEventListener('click', () => {
  const url = document.getElementById('randomPlaylistUrl').value;
  if (url && isValidTidalUrl(url)) {
    addPlaylist(url, 'randomPlaylistsList', 'randomPlaylists');
  } else {
    alert('Por favor, introduce una URL válida de Tidal.');
  }
});

function isValidTidalUrl(url) {
  return url.startsWith('https://listen.tidal.com/playlist/');
}

function addPlaylist(url, listId, storageKey) {
  chrome.storage.local.get([storageKey], (result) => {
    const playlists = result[storageKey] || [];
    playlists.push(url);
    chrome.storage.local.set({ [storageKey]: playlists }, () => {
      updatePlaylistList(listId, playlists, storageKey);
    });
  });
}

function updatePlaylistList(listId, playlists, storageKey) {
  const list = document.getElementById(listId);
  list.innerHTML = '';
  playlists.forEach((url, index) => {
    const li = document.createElement('li');
    li.textContent = url;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.addEventListener('click', () => {
      deletePlaylist(index, listId, storageKey);
    });
    li.appendChild(deleteButton);
    list.appendChild(li);
  });
}

function deletePlaylist(index, listId, storageKey) {
  chrome.storage.local.get([storageKey], (result) => {
    const playlists = result[storageKey] || [];
    playlists.splice(index, 1);
    chrome.storage.local.set({ [storageKey]: playlists }, () => {
      updatePlaylistList(listId, playlists, storageKey);
    });
  });
}

// Cargar las playlists al abrir la página
chrome.storage.local.get(['ownPlaylists', 'randomPlaylists'], (result) => {
  updatePlaylistList('ownPlaylistsList', result.ownPlaylists || [], 'ownPlaylists');
  updatePlaylistList('randomPlaylistsList', result.randomPlaylists || [], 'randomPlaylists');
});