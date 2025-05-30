(function(){
  const app = document.getElementById('app');
  const createSection = document.getElementById('create-section');
  const trackSection = document.getElementById('track-section');
  const trackingLinkOutput = document.getElementById('tracking-link-output');
  const trackingIdElem = document.getElementById('tracking-id');
  const locationInfo = document.getElementById('location-info');
  const locateBtn = document.getElementById('locate-btn');
  const createForm = document.getElementById('create-form');
  const trackerNameInput = document.getElementById('trackerName');

  // Utility: generate random tracking ID:
  function generateTrackingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for(let i=0; i<12; i++) {
      id += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    return id;
  }

  // Utility: get current page base URL (without query or hash)
  function getBaseUrl() {
    return window.location.origin + window.location.pathname;
  }

  // Utility: parse query param ?track=ID
  function getTrackingIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('track');
    return id && id.trim().length > 0 ? id.trim() : null;
  }

  // Utility: display location with formatting
  function displayLocation(coords, timestamp) {
    const date = new Date(timestamp);
    locationInfo.innerHTML = `
      <strong>Latitude:</strong> ${coords.latitude.toFixed(6)}<br />
      <strong>Longitude:</strong> ${coords.longitude.toFixed(6)}<br />
      <strong>Accuracy:</strong> ±${coords.accuracy} meters<br />
      <strong>Timestamp:</strong> ${date.toLocaleString()}<br />
    `;
  }

  // On page load:
  function init() {
    const trackingId = getTrackingIdFromURL();
    if (trackingId) {
      // Show track section
      createSection.style.display = 'none';
      trackSection.style.display = 'block';
      trackingIdElem.textContent = trackingId;

      locateBtn.addEventListener('click', () => {
        locationInfo.style.display = 'none';
        locationInfo.textContent = 'Locating... Please allow location access.';
        locationInfo.style.display = 'block';

        if (!navigator.geolocation) {
          locationInfo.textContent = 'Geolocation is not supported by your browser.';
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            displayLocation(pos.coords, pos.timestamp);
          },
          (err) => {
            switch(err.code) {
              case err.PERMISSION_DENIED:
                locationInfo.textContent = 'Permission denied. Unable to retrieve location.';
                break;
              case err.POSITION_UNAVAILABLE:
                locationInfo.textContent = 'Location information is unavailable.';
                break;
              case err.TIMEOUT:
                locationInfo.textContent = 'The request to get your location timed out.';
                break;
              default:
                locationInfo.textContent = 'An unknown error occurred retrieving location.';
            }
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      });
    } else {
      // Show create section
      createSection.style.display = 'block';
      trackSection.style.display = 'none';

      createForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = (trackerNameInput.value || '').trim();
        const id = generateTrackingId();
        // Create full tracking URL with param track=id
        let url = getBaseUrl() + '?track=' + encodeURIComponent(id);
        if (name.length > 0) {
          url += '&name=' + encodeURIComponent(name);
        }

        trackingLinkOutput.style.display = 'block';
        trackingLinkOutput.innerHTML = `
          <strong>Your Tracking Link:</strong><br />
          <a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#ffda79;">${url}</a>
          <br /><small>Share this link with the person you want to track location from.</small>
        `;
        trackerNameInput.value = '';
      });
    }
  }

  init();
})();
