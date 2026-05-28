document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tableBody = document.getElementById('projects-table-body');
  const modal = document.getElementById('project-modal');
  const form = document.getElementById('project-form');
  const btnAdd = document.getElementById('btn-add-project');
  const btnClose = document.getElementById('modal-close');
  const btnCancel = document.getElementById('modal-cancel');
  const searchInput = document.getElementById('project-search');
  const statusFilter = document.getElementById('project-status-filter');
  const selectAll = document.getElementById('selectAll');
  const btnBulkPublish = document.getElementById('btn-bulk-publish');
  const btnBulkDraft = document.getElementById('btn-bulk-draft');
  const btnBulkDelete = document.getElementById('btn-bulk-delete');

  // === PROJECT IMAGE UPLOAD ELEMENTS ===
  const projectImgUrlInput = document.getElementById('project-image-url');
  const projectBgColorInput = document.getElementById('project-bg-color');
  const projectLocalImgInput = document.getElementById('project-local-image');
  const projectUploadBtn = document.getElementById('project-upload-btn');
  const projectFilenameSpan = document.getElementById('project-selected-filename');
  const projectUploadStatusDiv = document.getElementById('project-upload-status');
  const projectImgPreview = document.getElementById('project-image-preview-el');
  const projectColorFallback = document.getElementById('project-color-fallback');

  // Update modal preview box based on current input values (URL or fallback color)
  function updateModalImagePreview() {
    const url = projectImgUrlInput ? projectImgUrlInput.value.trim() : '';
    const bgColor = projectBgColorInput ? projectBgColorInput.value : '#4f46e5';

    if (url) {
      if (projectImgPreview) {
        projectImgPreview.src = url;
        projectImgPreview.style.display = 'block';
      }
      if (projectColorFallback) {
        projectColorFallback.style.display = 'none';
      }
    } else {
      if (projectImgPreview) {
        projectImgPreview.style.display = 'none';
        projectImgPreview.src = '';
      }
      if (projectColorFallback) {
        projectColorFallback.style.display = 'flex';
        projectColorFallback.style.backgroundColor = bgColor;
        projectColorFallback.textContent = bgColor;
      }
    }
  }

  // Bind live updates inside the modal for manual input changes
  if (projectImgUrlInput) {
    projectImgUrlInput.addEventListener('input', updateModalImagePreview);
  }
  if (projectBgColorInput) {
    projectBgColorInput.addEventListener('input', updateModalImagePreview);
  }

  // Trigger preview when a local file is selected
  if (projectLocalImgInput) {
    projectLocalImgInput.addEventListener('change', () => {
      const file = projectLocalImgInput.files[0];
      if (file) {
        // Display chosen file name
        if (projectFilenameSpan) projectFilenameSpan.textContent = file.name;
        
        // Instantly preview local image using FileReader before upload
        const reader = new FileReader();
        reader.onload = (e) => {
          if (projectImgPreview) {
            projectImgPreview.src = e.target.result;
            projectImgPreview.style.display = 'block';
          }
          if (projectColorFallback) {
            projectColorFallback.style.display = 'none';
          }
        };
        reader.readAsDataURL(file);
        
        // Enable upload button
        if (projectUploadBtn) projectUploadBtn.disabled = false;
        
        // Reset status message
        hideProjectUploadStatus();
      } else {
        if (projectFilenameSpan) projectFilenameSpan.textContent = 'No file chosen';
        if (projectUploadBtn) projectUploadBtn.disabled = true;
        updateModalImagePreview(); // Revert preview to url input value
      }
    });
  }

  // Handle local file upload when user clicks "Upload Image"
  if (projectUploadBtn) {
    projectUploadBtn.addEventListener('click', async () => {
      const file = projectLocalImgInput ? projectLocalImgInput.files[0] : null;
      if (!file) return;

      // 1. Client-side Validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileExt = file.name.split('.').pop().toLowerCase();
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
      
      if (!allowedTypes.includes(file.type) && !allowedExts.includes(fileExt)) {
        showProjectUploadStatus('Invalid file type! Allowed types: JPG, JPEG, PNG, WEBP', 'error');
        return;
      }

      // Check file size (2MB limit)
      const maxSizeBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        showProjectUploadStatus('File is too large! Maximum allowed size is 2MB.', 'error');
        return;
      }

      // 2. Upload image to Supabase Storage bucket 'project-images'
      try {
        showProjectUploadStatus('Uploading image to Supabase...', 'uploading');
        projectUploadBtn.disabled = true;
        
        // Generate a unique file name using date timestamp to avoid naming conflicts
        const uniqueFileName = `project-${Date.now()}.${fileExt}`;

        // Call Supabase Storage upload method
        const { data, error } = await supabaseClient.storage
          .from('project-images')
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          throw error;
        }

        // 3. Retrieve public URL for the newly uploaded file
        const { data: publicUrlData } = supabaseClient.storage
          .from('project-images')
          .getPublicUrl(uniqueFileName);

        const publicUrl = publicUrlData.publicUrl;

        // 4. Save public URL into the project image URL field
        if (projectImgUrlInput) {
          projectImgUrlInput.value = publicUrl;
        }
        
        // Update modal preview using the new public URL
        updateModalImagePreview();
        
        showProjectUploadStatus('Image uploaded and URL updated successfully!', 'success');
        
        // Clear local file chooser and disable upload button
        if (projectLocalImgInput) projectLocalImgInput.value = '';
        if (projectFilenameSpan) projectFilenameSpan.textContent = 'No file chosen';
        projectUploadBtn.disabled = true;
      } catch (err) {
        console.error('Error during project image upload:', err);
        showProjectUploadStatus(`Upload failed: ${err.message || 'Check console logs.'}`, 'error');
        projectUploadBtn.disabled = false;
      }
    });
  }

  // Helper function to display project upload status
  function showProjectUploadStatus(message, type) {
    if (!projectUploadStatusDiv) return;
    projectUploadStatusDiv.textContent = message;
    projectUploadStatusDiv.style.display = 'block';
    
    // Reset class names
    projectUploadStatusDiv.className = 'project-upload-status-el';
    if (type === 'uploading') {
      projectUploadStatusDiv.classList.add('uploading');
    } else if (type === 'success') {
      projectUploadStatusDiv.classList.add('success');
    } else if (type === 'error') {
      projectUploadStatusDiv.classList.add('error');
    }
  }

  // Helper function to hide project upload status
  function hideProjectUploadStatus() {
    if (!projectUploadStatusDiv) return;
    projectUploadStatusDiv.style.display = 'none';
    projectUploadStatusDiv.className = 'project-upload-status-el';
  }

  // State
  let projects = [];
  let isEditing = false;

  // --- Initial Load ---
  fetchProjects();

  // --- Fetch Projects ---
  async function fetchProjects() {
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Loading projects...</td></tr>';
    
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--danger);">Failed to load projects. Ensure the "projects" table exists in Supabase.</td></tr>';
      return;
    }

    projects = data;
    renderTable();
  }

  // --- Render Table ---
  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterStatus = statusFilter.value;

    const filtered = projects.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm) || p.short_description.toLowerCase().includes(searchTerm);
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No projects found.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    filtered.forEach(p => {
      const tr = document.createElement('tr');
      
      const tagHtml = Array.isArray(p.tags) ? p.tags.map(t => `<span class="project-card__tag" style="margin-right:4px;">${t.trim()}</span>`).join('') : '';
      
      // We assume image URL might be relative or absolute, and color is hex
      const previewStyle = p.image_url ? `background-image: url('${p.image_url}'); background-size: cover;` : `background-color: ${p.image_bg_color || '#ccc'};`;

      tr.innerHTML = `
        <td><input type="checkbox" class="row-checkbox" value="${p.id}"></td>
        <td>
          <div style="width: 60px; height: 40px; border-radius: 4px; ${previewStyle}"></div>
        </td>
        <td style="font-weight: 600;">${p.title}</td>
        <td>${p.short_description}</td>
        <td>${tagHtml}</td>
        <td>${p.display_order}</td>
        <td><span class="status-badge ${p.status}">${p.status}</span></td>
        <td>
          <button class="admin-btn admin-btn--outline btn-edit" data-id="${p.id}" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;">Edit</button>
          <button class="admin-btn admin-btn--danger btn-delete" data-id="${p.id}" style="padding: 4px 8px; font-size: 12px;">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    attachRowListeners();
  }

  function attachRowListeners() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openModal(id);
      });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this project?')) {
          await deleteProjects([id]);
        }
      });
    });

    // Row Checkboxes
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    rowCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const allChecked = Array.from(rowCheckboxes).every(c => c.checked);
        selectAll.checked = allChecked;
      });
    });
  }

  // --- Search and Filter ---
  searchInput.addEventListener('input', renderTable);
  statusFilter.addEventListener('change', renderTable);

  // --- Bulk Actions ---
  selectAll.addEventListener('change', (e) => {
    document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = e.target.checked);
  });

  function getSelectedIds() {
    return Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => cb.value);
  }

  btnBulkPublish.addEventListener('click', async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return alert('Select projects to publish.');
    await updateStatus(ids, 'published');
  });

  btnBulkDraft.addEventListener('click', async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return alert('Select projects to draft.');
    await updateStatus(ids, 'draft');
  });

  btnBulkDelete.addEventListener('click', async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return alert('Select projects to delete.');
    if (confirm(`Are you sure you want to delete ${ids.length} project(s)?`)) {
      await deleteProjects(ids);
    }
  });

  async function updateStatus(ids, newStatus) {
    const { error } = await supabaseClient
      .from('projects')
      .update({ status: newStatus })
      .in('id', ids);

    if (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    } else {
      selectAll.checked = false;
      await fetchProjects();
    }
  }

  async function deleteProjects(ids) {
    const { error } = await supabaseClient
      .from('projects')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting projects:', error);
      alert('Failed to delete project(s).');
    } else {
      selectAll.checked = false;
      await fetchProjects();
    }
  }

  // --- Modal & Form Handling ---
  btnAdd.addEventListener('click', () => openModal());
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  function openModal(projectId = null) {
    isEditing = !!projectId;
    document.getElementById('modal-title').textContent = isEditing ? 'Edit Project' : 'Add New Project';
    
    // Reset file upload state on modal open
    if (projectLocalImgInput) projectLocalImgInput.value = '';
    if (projectFilenameSpan) projectFilenameSpan.textContent = 'No file chosen';
    if (projectUploadBtn) projectUploadBtn.disabled = true;
    hideProjectUploadStatus();

    if (isEditing) {
      const p = projects.find(proj => proj.id === projectId);
      if (p) {
        document.getElementById('project-id').value = p.id;
        document.getElementById('project-title').value = p.title || '';
        document.getElementById('project-short-desc').value = p.short_description || '';
        document.getElementById('project-full-desc').value = p.full_description || '';
        document.getElementById('project-tags').value = Array.isArray(p.tags) ? p.tags.join(', ') : '';
        document.getElementById('project-image-url').value = p.image_url || '';
        document.getElementById('project-bg-color').value = p.image_bg_color || '#4f46e5';
        document.getElementById('project-button-text').value = p.button_text || 'View Case Study →';
        document.getElementById('project-button-link').value = p.button_link || '#';
        document.getElementById('project-status').value = p.status || 'draft';
        document.getElementById('project-display-order').value = p.display_order || 0;
      }
    } else {
      form.reset();
      document.getElementById('project-id').value = '';
      // Ensure color picker defaults correctly since form.reset() might keep it
      if (projectBgColorInput) projectBgColorInput.value = '#4f46e5';
    }

    // Refresh modal preview box
    updateModalImagePreview();

    modal.classList.add('is-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    form.reset();
    
    // Clean up file upload state on modal close
    if (projectLocalImgInput) projectLocalImgInput.value = '';
    if (projectFilenameSpan) projectFilenameSpan.textContent = 'No file chosen';
    if (projectUploadBtn) projectUploadBtn.disabled = true;
    hideProjectUploadStatus();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const id = document.getElementById('project-id').value;
    const projectData = {
      title: document.getElementById('project-title').value,
      short_description: document.getElementById('project-short-desc').value,
      full_description: document.getElementById('project-full-desc').value,
      tags: document.getElementById('project-tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
      image_url: document.getElementById('project-image-url').value,
      image_bg_color: document.getElementById('project-bg-color').value,
      button_text: document.getElementById('project-button-text').value,
      button_link: document.getElementById('project-button-link').value,
      status: document.getElementById('project-status').value,
      display_order: parseInt(document.getElementById('project-display-order').value, 10) || 0
    };

    let error;

    if (isEditing && id) {
      const res = await supabaseClient
        .from('projects')
        .update(projectData)
        .eq('id', id);
      error = res.error;
    } else {
      const res = await supabaseClient
        .from('projects')
        .insert([projectData]);
      error = res.error;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Project';

    if (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. See console for details.');
    } else {
      closeModal();
      await fetchProjects();
    }
  });


  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem("adminLoggedIn");
      window.location.href = 'admin.html';
    });
  }
});
