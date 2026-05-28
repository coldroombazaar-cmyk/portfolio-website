document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const statusDiv = document.getElementById('footer-cms-status');

  // Footer Settings Form Elements
  const settingsForm = document.getElementById('footer-settings-form');
  const settingsIdInput = document.getElementById('footer-settings-id');
  const brandNameInput = document.getElementById('footer-brand-name');
  const taglineInput = document.getElementById('footer-tagline');
  const quickHeadingInput = document.getElementById('footer-quick-heading');
  const socialHeadingInput = document.getElementById('footer-social-heading');
  const iconInput = document.getElementById('footer-icon');
  const copyrightInput = document.getElementById('footer-copyright');
  const showToggleCheckbox = document.getElementById('footer-show-toggle');
  let settingsId = null;

  // Footer Links Elements
  const linksTableBody = document.getElementById('footer-links-table-body');
  const btnAddLink = document.getElementById('btn-add-footer-link');
  const linkModal = document.getElementById('footer-link-modal');
  const linkForm = document.getElementById('footer-link-form');
  const btnLinkClose = document.getElementById('footer-link-modal-close');
  const btnLinkCancel = document.getElementById('footer-link-modal-cancel');
  
  // Filtering Tab Buttons
  const filterBtns = document.querySelectorAll('.link-filter-btn');

  let footerLinks = [];
  let currentFilter = 'all';
  let isEditingLink = false;


  // --- Initial Load Configuration ---
  await loadFooterSettings();
  await fetchFooterLinks();

  // --- Footer Settings Handlers ---
  async function loadFooterSettings() {
    try {
      const { data, error } = await supabaseClient
        .from('footer_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
          throw error;
        }
      }

      if (data) {
        settingsId = data.id;
        settingsIdInput.value = data.id;
        if (brandNameInput) brandNameInput.value = data.brand_name || '';
        if (taglineInput) taglineInput.value = data.tagline || '';
        if (quickHeadingInput) quickHeadingInput.value = data.quick_links_heading || 'Quick Links';
        if (socialHeadingInput) socialHeadingInput.value = data.social_heading || 'Social';
        if (iconInput) iconInput.value = data.footer_icon || '❤️';
        if (copyrightInput) copyrightInput.value = data.copyright_text || '';
        if (showToggleCheckbox) showToggleCheckbox.checked = data.show_theme_toggle !== false;
      }
    } catch (err) {
      console.error('Error loading footer settings:', err);
      showStatus('Error loading footer settings. Check console.', 'danger');
    }
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-settings');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const footerData = {
        brand_name: brandNameInput.value,
        tagline: taglineInput.value,
        quick_links_heading: quickHeadingInput.value,
        social_heading: socialHeadingInput.value,
        footer_icon: iconInput.value,
        copyright_text: copyrightInput.value,
        show_theme_toggle: showToggleCheckbox.checked,
        updated_at: new Date().toISOString()
      };

      try {
        if (settingsId) {
          const { error } = await supabaseClient
            .from('footer_settings')
            .update(footerData)
            .eq('id', settingsId);
          if (error) throw error;
        } else {
          const { data, error } = await supabaseClient
            .from('footer_settings')
            .insert([footerData])
            .select();
          if (error) throw error;
          if (data && data.length > 0) {
            settingsId = data[0].id;
            settingsIdInput.value = data[0].id;
          }
        }
        showStatus('Footer settings saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving footer settings:', err);
        showStatus('Failed to save footer settings.', 'danger');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Footer Settings';
        }
      }
    });
  }

  // --- Footer Links CRUD Handlers ---
  async function fetchFooterLinks() {
    if (!linksTableBody) return;
    linksTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading footer links...</td></tr>';

    try {
      const { data, error } = await supabaseClient
        .from('footer_links')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      footerLinks = data || [];
      renderLinksTable();
    } catch (err) {
      console.error('Error loading footer links:', err);
      linksTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load footer links.</td></tr>';
    }
  }

  function renderLinksTable() {
    if (!linksTableBody) return;
    
    // Filter items based on current selection
    const filteredLinks = footerLinks.filter(link => {
      if (currentFilter === 'all') return true;
      return link.section === currentFilter;
    });

    if (filteredLinks.length === 0) {
      linksTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No footer links found for filter: ${currentFilter}.</td></tr>`;
      return;
    }

    linksTableBody.innerHTML = '';
    filteredLinks.forEach(link => {
      const tr = document.createElement('tr');
      const iconDisplay = link.icon ? link.icon : `<span style="color: var(--text-muted); font-style: italic;">None</span>`;
      const sectionBadge = `<span class="timeline-status-badge" style="background: ${link.section === 'quick' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)'}; color: ${link.section === 'quick' ? '#60a5fa' : '#a78bfa'}; font-size: 11px;">${link.section}</span>`;

      tr.innerHTML = `
        <td style="text-align: center;">${sectionBadge}</td>
        <td style="font-weight: 600;">${link.label}</td>
        <td style="text-align: center; font-size: 16px;">${iconDisplay}</td>
        <td><code style="background: rgba(255, 255, 255, 0.05); padding: 4px 8px; border-radius: 4px; font-size: 13px; word-break: break-all;">${link.url}</code></td>
        <td style="text-align: center;">${link.display_order}</td>
        <td style="text-align: center;"><span class="timeline-status-badge ${link.status === 'active' ? 'published' : 'draft'}">${link.status}</span></td>
        <td style="text-align: center;">
          <button type="button" class="admin-btn admin-btn--outline btn-edit-link" data-id="${link.id}" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;">Edit</button>
          <button type="button" class="admin-btn admin-btn--danger btn-delete-link" data-id="${link.id}" style="padding: 4px 8px; font-size: 12px;">Delete</button>
        </td>
      `;
      linksTableBody.appendChild(tr);
    });

    attachRowListeners();
  }

  function attachRowListeners() {
    document.querySelectorAll('.btn-edit-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-link').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this footer link?')) {
          await deleteFooterLink(id);
        }
      });
    });
  }

  // --- Filtering Handler ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--text-muted)';
      });
      
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = '#fff';

      currentFilter = btn.getAttribute('data-filter');
      renderLinksTable();
    });
  });

  // Modal Actions
  if (btnAddLink) btnAddLink.addEventListener('click', () => openModal());
  if (btnLinkClose) btnLinkClose.addEventListener('click', closeModal);
  if (btnLinkCancel) btnLinkCancel.addEventListener('click', closeModal);

  function openModal(linkId = null) {
    isEditingLink = !!linkId;
    document.getElementById('footer-link-modal-title').textContent = isEditingLink ? 'Edit Footer Link' : 'Add Footer Link';

    if (isEditingLink) {
      const link = footerLinks.find(l => l.id === linkId);
      if (link) {
        document.getElementById('footer-link-id').value = link.id;
        document.getElementById('footer-link-section').value = link.section || 'quick';
        document.getElementById('footer-link-label').value = link.label || '';
        document.getElementById('footer-link-icon').value = link.icon || '';
        document.getElementById('footer-link-url').value = link.url || '';
        document.getElementById('footer-link-status').value = link.status || 'active';
        document.getElementById('footer-link-display-order').value = link.display_order || 0;
      }
    } else {
      if (linkForm) linkForm.reset();
      document.getElementById('footer-link-id').value = '';
      document.getElementById('footer-link-section').value = 'quick';
      document.getElementById('footer-link-status').value = 'active';
      document.getElementById('footer-link-display-order').value = '0';
    }

    if (linkModal) linkModal.classList.add('is-open');
  }

  function closeModal() {
    if (linkModal) linkModal.classList.remove('is-open');
    if (linkForm) linkForm.reset();
  }

  // Handle Form Submit
  if (linkForm) {
    linkForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = linkForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      const id = document.getElementById('footer-link-id').value;
      const linkData = {
        section: document.getElementById('footer-link-section').value,
        label: document.getElementById('footer-link-label').value,
        icon: document.getElementById('footer-link-icon').value || null,
        url: document.getElementById('footer-link-url').value,
        status: document.getElementById('footer-link-status').value,
        display_order: parseInt(document.getElementById('footer-link-display-order').value, 10) || 0,
        updated_at: new Date().toISOString()
      };

      try {
        if (isEditingLink && id) {
          const { error } = await supabaseClient
            .from('footer_links')
            .update(linkData)
            .eq('id', id);
          if (error) throw error;
        } else {
          const { error } = await supabaseClient
            .from('footer_links')
            .insert([linkData]);
          if (error) throw error;
        }

        closeModal();
        await fetchFooterLinks();
        showStatus('Footer link saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving footer link:', err);
        alert('Failed to save footer link. Check console logs.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Link';
        }
      }
    });
  }

  async function deleteFooterLink(id) {
    try {
      const { error } = await supabaseClient
        .from('footer_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchFooterLinks();
      showStatus('Footer link deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting footer link:', err);
      showStatus('Failed to delete footer link.', 'danger');
    }
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
