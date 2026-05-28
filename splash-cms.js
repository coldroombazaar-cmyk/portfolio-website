document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const statusDiv = document.getElementById('splash-cms-status');

  // Form Elements
  const splashForm = document.getElementById('splash-settings-form');
  const idInput = document.getElementById('splash-id');
  const enabledCheckbox = document.getElementById('splash-enabled');
  const onceCheckbox = document.getElementById('splash-once');
  const textInput = document.getElementById('splash-text');
  const durationInput = document.getElementById('splash-duration');
  const fadeDurationInput = document.getElementById('splash-fade-duration');
  const btnPreview = document.getElementById('btn-preview-splash');


  // --- Initial Load Configuration ---
  await loadSplashSettings();

  async function loadSplashSettings() {
    try {
      const { data, error } = await supabaseClient
        .from('splash_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
          throw error;
        }
      }

      if (data) {
        idInput.value = data.id;
        enabledCheckbox.checked = data.is_enabled !== false;
        onceCheckbox.checked = data.show_once_per_session === true;
        textInput.value = data.splash_text || 'Atanu Mondal';
        durationInput.value = data.duration_ms !== undefined ? data.duration_ms : 900;
        fadeDurationInput.value = data.fade_duration_ms !== undefined ? data.fade_duration_ms : 900;
      }
    } catch (err) {
      console.error('Error loading splash settings:', err);
      showStatus('Error loading settings. Check console.', 'danger');
    }
  }

  // --- Save Form Handler ---
  if (splashForm) {
    splashForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-splash');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const id = idInput.value;
      const splashData = {
        is_enabled: enabledCheckbox.checked,
        show_once_per_session: onceCheckbox.checked,
        splash_text: textInput.value,
        duration_ms: parseInt(durationInput.value, 10) || 900,
        fade_duration_ms: parseInt(fadeDurationInput.value, 10) || 900,
        updated_at: new Date().toISOString()
      };

      try {
        if (id) {
          const { error } = await supabaseClient
            .from('splash_settings')
            .update(splashData)
            .eq('id', id);
          if (error) throw error;
        } else {
          const { data, error } = await supabaseClient
            .from('splash_settings')
            .insert([splashData])
            .select();
          if (error) throw error;
          if (data && data.length > 0) {
            idInput.value = data[0].id;
          }
        }

        // Sync settings to localStorage cache immediately for zero-delay UX
        try {
          localStorage.setItem('atanu_splash_settings', JSON.stringify({
            ...splashData,
            id: id || idInput.value
          }));
        } catch (e) {
          console.warn('Failed to update localStorage cache:', e);
        }

        showStatus('Splash settings saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving splash settings:', err);
        showStatus('Failed to save splash settings.', 'danger');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Settings';
        }
      }
    });
  }

  // --- Simulated Preview Handler ---
  if (btnPreview) {
    btnPreview.addEventListener('click', () => {
      // Extract form settings
      const text = textInput.value || 'Atanu Mondal';
      const duration = parseInt(durationInput.value, 10) || 900;
      const fadeDuration = parseInt(fadeDurationInput.value, 10) || 900;

      // Check if splash screen is already running to avoid overlaps
      if (document.getElementById('splash-screen')) return;

      // Create simulated splash screen overlay element
      const previewSplash = document.createElement('div');
      previewSplash.id = 'splash-screen';
      
      // Inline styles for absolute fullscreen overlay matching public pages
      previewSplash.style.position = 'fixed';
      previewSplash.style.inset = '0';
      previewSplash.style.backgroundColor = '#05070f';
      previewSplash.style.display = 'flex';
      previewSplash.style.alignItems = 'center';
      previewSplash.style.justifyContent = 'center';
      previewSplash.style.zIndex = '9999';
      previewSplash.style.opacity = '1';
      // Dynamically load the fade transition timing
      previewSplash.style.transition = `opacity ${fadeDuration}ms ease`;

      const textEl = document.createElement('div');
      textEl.className = 'splash-text';
      textEl.textContent = text;
      
      previewSplash.appendChild(textEl);
      document.body.appendChild(previewSplash);

      // Perform display duration and transition fade-out timing simulation
      setTimeout(() => {
        previewSplash.style.opacity = '0';
        setTimeout(() => previewSplash.remove(), fadeDuration);
      }, duration);
    });
  }

  // Status feedback notices
  function showStatus(message, type) {
    if (!statusDiv) return;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    if (type === 'success') {
      statusDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
      statusDiv.style.color = '#34d399';
    } else {
      statusDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
      statusDiv.style.color = '#f87171';
    }
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 4000);
  }

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem("adminLoggedIn");
      window.location.href = 'admin.html';
    });
  }
});
