document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const statusDiv = document.getElementById('navbar-cms-status');

  // Brand Settings Elements
  const brandForm = document.getElementById('brand-settings-form');
  const brandTextInput = document.getElementById('navbar-brand-text');
  const brandLinkInput = document.getElementById('navbar-brand-link');
  const showToggleCheckbox = document.getElementById('navbar-show-toggle');
  let settingsId = null;

  // Menu Items Table Elements
  const itemsTableBody = document.getElementById('menu-items-table-body');
  const btnAddMenuItem = document.getElementById('btn-add-menu-item');
  const itemModal = document.getElementById('menu-item-modal');
  const itemForm = document.getElementById('menu-item-form');
  const btnItemClose = document.getElementById('menu-item-modal-close');
  const btnItemCancel = document.getElementById('menu-item-modal-cancel');

  let menuItems = [];
  let isEditingItem = false;


  // --- Initial Load Operations ---
  await loadBrandSettings();
  await fetchMenuItems();

  // --- Brand Settings Handlers ---
  async function loadBrandSettings() {
    try {
      const { data, error } = await supabaseClient
        .from('navbar_settings')
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
        if (brandTextInput) brandTextInput.value = data.brand_text || '';
        if (brandLinkInput) brandLinkInput.value = data.brand_link || 'index.html';
        if (showToggleCheckbox) showToggleCheckbox.checked = data.show_theme_toggle !== false;
      }
    } catch (err) {
      console.error('Error loading brand settings:', err);
      showStatus('Error loading brand settings. Check console.', 'danger');
    }
  }

  if (brandForm) {
    brandForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-brand');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const brandData = {
        brand_text: brandTextInput.value,
        brand_link: brandLinkInput.value,
        show_theme_toggle: showToggleCheckbox.checked,
        updated_at: new Date().toISOString()
      };

      try {
        if (settingsId) {
          const { error } = await supabaseClient
            .from('navbar_settings')
            .update(brandData)
            .eq('id', settingsId);
          if (error) throw error;
        } else {
          const { data, error } = await supabaseClient
            .from('navbar_settings')
            .insert([brandData])
            .select();
          if (error) throw error;
          if (data && data.length > 0) {
            settingsId = data[0].id;
          }
        }
        showStatus('Brand settings saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving brand settings:', err);
        showStatus('Failed to save brand settings.', 'danger');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Brand Settings';
        }
      }
    });
  }

  // --- Menu Links CRUD Handlers ---
  async function fetchMenuItems() {
    if (!itemsTableBody) return;
    itemsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading menu links...</td></tr>';

    try {
      const { data, error } = await supabaseClient
        .from('navbar_items')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      menuItems = data || [];
      renderItemsTable();
    } catch (err) {
      console.error('Error loading menu items:', err);
      itemsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Failed to load menu links.</td></tr>';
    }
  }

  function renderItemsTable() {
    if (!itemsTableBody) return;
    if (menuItems.length === 0) {
      itemsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No menu links configured.</td></tr>';
      return;
    }

    itemsTableBody.innerHTML = '';
    menuItems.forEach(item => {
      const tr = document.createElement('tr');
      
      tr.innerHTML = `
        <td style="font-weight: 600;">${item.label}</td>
        <td><code style="background: rgba(255, 255, 255, 0.05); padding: 4px 8px; border-radius: 4px;">${item.url}</code></td>
        <td style="text-align: center;">${item.display_order}</td>
        <td style="text-align: center;"><span class="timeline-status-badge ${item.status === 'active' ? 'published' : 'draft'}">${item.status}</span></td>
        <td style="text-align: center;">
          <button type="button" class="admin-btn admin-btn--outline btn-edit-item" data-id="${item.id}" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;">Edit</button>
          <button type="button" class="admin-btn admin-btn--danger btn-delete-item" data-id="${item.id}" style="padding: 4px 8px; font-size: 12px;">Delete</button>
        </td>
      `;
      itemsTableBody.appendChild(tr);
    });

    attachRowListeners();
  }

  function attachRowListeners() {
    document.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this menu item?')) {
          await deleteMenuItem(id);
        }
      });
    });
  }

  // Modal Actions
  if (btnAddMenuItem) btnAddMenuItem.addEventListener('click', () => openModal());
  if (btnItemClose) btnItemClose.addEventListener('click', closeModal);
  if (btnItemCancel) btnItemCancel.addEventListener('click', closeModal);

  function openModal(itemId = null) {
    isEditingItem = !!itemId;
    document.getElementById('menu-item-modal-title').textContent = isEditingItem ? 'Edit Menu Item' : 'Add Menu Item';

    if (isEditingItem) {
      const item = menuItems.find(i => i.id === itemId);
      if (item) {
        document.getElementById('menu-item-id').value = item.id;
        document.getElementById('menu-item-label').value = item.label || '';
        document.getElementById('menu-item-url').value = item.url || '';
        document.getElementById('menu-item-status').value = item.status || 'active';
        document.getElementById('menu-item-display-order').value = item.display_order || 0;
      }
    } else {
      if (itemForm) itemForm.reset();
      document.getElementById('menu-item-id').value = '';
      document.getElementById('menu-item-status').value = 'active';
      document.getElementById('menu-item-display-order').value = '0';
    }

    if (itemModal) itemModal.classList.add('is-open');
  }

  function closeModal() {
    if (itemModal) itemModal.classList.remove('is-open');
    if (itemForm) itemForm.reset();
  }

  // Handle Form Submit
  if (itemForm) {
    itemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = itemForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      const id = document.getElementById('menu-item-id').value;
      const itemData = {
        label: document.getElementById('menu-item-label').value,
        url: document.getElementById('menu-item-url').value,
        status: document.getElementById('menu-item-status').value,
        display_order: parseInt(document.getElementById('menu-item-display-order').value, 10) || 0,
        updated_at: new Date().toISOString()
      };

      try {
        if (isEditingItem && id) {
          const { error } = await supabaseClient
            .from('navbar_items')
            .update(itemData)
            .eq('id', id);
          if (error) throw error;
        } else {
          const { error } = await supabaseClient
            .from('navbar_items')
            .insert([itemData]);
          if (error) throw error;
        }

        closeModal();
        await fetchMenuItems();
        showStatus('Menu item saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving menu item:', err);
        alert('Failed to save menu item. Check console logs.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Item';
        }
      }
    });
  }

  async function deleteMenuItem(id) {
    try {
      const { error } = await supabaseClient
        .from('navbar_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchMenuItems();
      showStatus('Menu item deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting menu item:', err);
      showStatus('Failed to delete menu item.', 'danger');
    }
  }

  // Feedback notifications
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
