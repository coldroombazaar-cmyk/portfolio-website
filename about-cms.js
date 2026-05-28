document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('about-form');
  const statusDiv = document.getElementById('about-cms-status');

  const imgInput = document.getElementById('about-profile-image');
  const imgPreview = document.getElementById('about-image-preview-el');
  const imgPlaceholder = document.getElementById('about-image-placeholder');

  // Simple function to update preview from the text input URL
  function updateImagePreview() {
    const url = imgInput ? imgInput.value.trim() : '';
    if (url) {
      imgPreview.src = url;
      imgPreview.style.display = 'block';
      imgPlaceholder.style.display = 'none';
    } else {
      imgPreview.style.display = 'none';
      imgPlaceholder.style.display = 'block';
      imgPreview.src = '';
    }
  }

  if (imgInput) {
    imgInput.addEventListener('input', updateImagePreview);
  }

  // === LOCAL IMAGE UPLOAD HANDLING ===
  // Select upload DOM elements
  const localImgInput = document.getElementById('about-local-image');
  const uploadBtn = document.getElementById('about-upload-btn');
  const filenameSpan = document.getElementById('about-selected-filename');
  const uploadStatusDiv = document.getElementById('about-upload-status');

  // Trigger preview when a local file is selected
  if (localImgInput) {
    localImgInput.addEventListener('change', () => {
      const file = localImgInput.files[0];
      if (file) {
        // Display chosen file name
        filenameSpan.textContent = file.name;
        
        // Instantly preview local image using FileReader before upload
        const reader = new FileReader();
        reader.onload = (e) => {
          imgPreview.src = e.target.result;
          imgPreview.style.display = 'block';
          imgPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        // Enable the upload button
        if (uploadBtn) uploadBtn.disabled = false;
        
        // Hide previous upload messages
        hideUploadStatus();
      } else {
        filenameSpan.textContent = 'No file chosen';
        if (uploadBtn) uploadBtn.disabled = true;
        updateImagePreview(); // Revert preview to the main image URL field
      }
    });
  }

  // Handle local file upload when user clicks "Upload Image"
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const file = localImgInput ? localImgInput.files[0] : null;
      if (!file) return;

      // 1. Client-side Validation
      // Check for allowed extensions and mime types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileExt = file.name.split('.').pop().toLowerCase();
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
      
      if (!allowedTypes.includes(file.type) && !allowedExts.includes(fileExt)) {
        showUploadStatus('Invalid file type! Allowed types: JPG, JPEG, PNG, WEBP', 'error');
        return;
      }

      // Check file size (2MB limit)
      const maxSizeBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        showUploadStatus('File is too large! Maximum allowed size is 2MB.', 'error');
        return;
      }

      // 2. Upload image to Supabase Storage bucket 'about-images'
      try {
        showUploadStatus('Uploading image to Supabase...', 'uploading');
        uploadBtn.disabled = true;
        
        // Generate a unique file name using date timestamp to avoid naming conflicts
        const uniqueFileName = `about-profile-${Date.now()}.${fileExt}`;

        // Call Supabase Storage upload method
        const { data, error } = await supabaseClient.storage
          .from('about-images')
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          throw error;
        }

        // 3. Retrieve public URL for the newly uploaded file
        const { data: publicUrlData } = supabaseClient.storage
          .from('about-images')
          .getPublicUrl(uniqueFileName);

        const publicUrl = publicUrlData.publicUrl;

        // 4. Save public URL into the profile_image_url field
        if (imgInput) {
          imgInput.value = publicUrl;
        }
        
        // Update image preview to point to our newly uploaded public URL
        imgPreview.src = publicUrl;
        
        showUploadStatus('Image uploaded and URL updated successfully!', 'success');
        
        // Clear local file chooser and disable upload button
        if (localImgInput) localImgInput.value = '';
        filenameSpan.textContent = 'No file chosen';
        uploadBtn.disabled = true;
      } catch (err) {
        console.error('Error during image upload:', err);
        showUploadStatus(`Upload failed: ${err.message || 'Check console logs.'}`, 'error');
        uploadBtn.disabled = false;
      }
    });
  }

  // Helper function to display premium styled upload status
  function showUploadStatus(message, type) {
    if (!uploadStatusDiv) return;
    uploadStatusDiv.textContent = message;
    uploadStatusDiv.style.display = 'block';
    
    // Reset class names and apply type style
    uploadStatusDiv.className = 'about-upload-status-el';
    if (type === 'uploading') {
      uploadStatusDiv.classList.add('uploading');
    } else if (type === 'success') {
      uploadStatusDiv.classList.add('success');
    } else if (type === 'error') {
      uploadStatusDiv.classList.add('error');
    }
  }

  // Helper function to hide upload status
  function hideUploadStatus() {
    if (!uploadStatusDiv) return;
    uploadStatusDiv.style.display = 'none';
    uploadStatusDiv.className = 'about-upload-status-el';
  }

  // Load existing data
  await loadAboutData();

  async function loadAboutData() {
    try {
      const { data, error } = await supabaseClient
        .from('about_content')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // not found
          throw error;
        }
      }

      if (data) {
        document.getElementById('about-id').value = data.id;
        if (document.getElementById('about-page-title-input')) {
          document.getElementById('about-page-title-input').value = data.page_title || 'About Atanu';
        }
        if (document.getElementById('about-page-subtitle-input')) {
          document.getElementById('about-page-subtitle-input').value = data.page_subtitle || 'Designer. Researcher. Coffee-driven optimist.';
        }
        document.getElementById('about-years-exp').value = data.years_experience || 0;
        document.getElementById('about-years-label').value = data.years_label || '';
        document.getElementById('about-shipped-projects').value = data.shipped_projects || 0;
        document.getElementById('about-shipped-label').value = data.shipped_label || '';
        document.getElementById('about-awards-count').value = data.awards_count || 0;
        document.getElementById('about-awards-label').value = data.awards_label || '';
        document.getElementById('about-profile-image').value = data.profile_image_url || '';
        document.getElementById('about-p1').value = data.paragraph_1 || '';
        document.getElementById('about-p2').value = data.paragraph_2 || '';
        document.getElementById('about-p3').value = data.paragraph_3 || '';
        if(typeof updateImagePreview === 'function') updateImagePreview();
      }
    } catch (err) {
      console.error('Error loading about data:', err);
      showStatus('Error loading data. Check console.', 'danger');
    }
  }

  // Save changes
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const id = document.getElementById('about-id').value;
    const aboutData = {
      page_title: document.getElementById('about-page-title-input') ? document.getElementById('about-page-title-input').value : 'About Atanu',
      page_subtitle: document.getElementById('about-page-subtitle-input') ? document.getElementById('about-page-subtitle-input').value : 'Designer. Researcher. Coffee-driven optimist.',
      years_experience: parseInt(document.getElementById('about-years-exp').value, 10) || 0,
      years_label: document.getElementById('about-years-label').value,
      shipped_projects: parseInt(document.getElementById('about-shipped-projects').value, 10) || 0,
      shipped_label: document.getElementById('about-shipped-label').value,
      awards_count: parseInt(document.getElementById('about-awards-count').value, 10) || 0,
      awards_label: document.getElementById('about-awards-label').value,
      profile_image_url: document.getElementById('about-profile-image').value,
      paragraph_1: document.getElementById('about-p1').value,
      paragraph_2: document.getElementById('about-p2').value,
      paragraph_3: document.getElementById('about-p3').value,
      updated_at: new Date().toISOString()
    };

    try {
      if (id) {
        const { error } = await supabaseClient
          .from('about_content')
          .update(aboutData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabaseClient
          .from('about_content')
          .insert([aboutData])
          .select();
        if (error) throw error;
        if (data && data.length > 0) {
          document.getElementById('about-id').value = data[0].id;
        }
      }
      
      showStatus('Changes saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving about data:', err);
      showStatus('Failed to save changes. Check console.', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  });

  // === CAREER TIMELINE CMS LOGIC ===
  const timelineTableBody = document.getElementById('timeline-table-body');
  const timelineModal = document.getElementById('timeline-modal');
  const timelineForm = document.getElementById('timeline-form');
  const btnAddTimeline = document.getElementById('btn-add-timeline');
  const btnTimelineClose = document.getElementById('timeline-modal-close');
  const btnTimelineCancel = document.getElementById('timeline-modal-cancel');
  
  let timelineItems = [];
  let isEditingTimeline = false;

  // Initial Fetch of timeline items
  fetchTimelineItems();

  async function fetchTimelineItems() {
    if (!timelineTableBody) return;
    timelineTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading timeline...</td></tr>';
    
    try {
      const { data, error } = await supabaseClient
        .from('career_timeline')
        .select('*')
        .order('display_order', { ascending: true })
        .order('year', { ascending: false });

      if (error) throw error;

      timelineItems = data || [];
      renderTimelineTable();
    } catch (err) {
      console.error('Error fetching timeline:', err);
      timelineTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load timeline. Check console logs.</td></tr>';
    }
  }

  function renderTimelineTable() {
    if (!timelineTableBody) return;
    if (timelineItems.length === 0) {
      timelineTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No timeline items found.</td></tr>';
      return;
    }

    timelineTableBody.innerHTML = '';
    timelineItems.forEach(item => {
      const tr = document.createElement('tr');
      
      tr.innerHTML = `
        <td style="font-weight: 600;">${item.year}</td>
        <td style="font-weight: 500; color: var(--primary);">${item.role}</td>
        <td>${item.company}</td>
        <td style="font-size: 14px; color: var(--text-muted);">${item.description || ''}</td>
        <td style="text-align: center;">${item.display_order}</td>
        <td style="text-align: center;"><span class="timeline-status-badge ${item.status}">${item.status}</span></td>
        <td style="text-align: center;">
          <button type="button" class="admin-btn admin-btn--outline btn-edit-timeline" data-id="${item.id}" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;">Edit</button>
          <button type="button" class="admin-btn admin-btn--danger btn-delete-timeline" data-id="${item.id}" style="padding: 4px 8px; font-size: 12px;">Delete</button>
        </td>
      `;
      timelineTableBody.appendChild(tr);
    });

    attachTimelineRowListeners();
  }

  function attachTimelineRowListeners() {
    document.querySelectorAll('.btn-edit-timeline').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openTimelineModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-timeline').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this timeline item?')) {
          await deleteTimelineItem(id);
        }
      });
    });
  }

  // Modal actions
  if (btnAddTimeline) btnAddTimeline.addEventListener('click', () => openTimelineModal());
  if (btnTimelineClose) btnTimelineClose.addEventListener('click', closeTimelineModal);
  if (btnTimelineCancel) btnTimelineCancel.addEventListener('click', closeTimelineModal);

  function openTimelineModal(itemId = null) {
    isEditingTimeline = !!itemId;
    document.getElementById('timeline-modal-title').textContent = isEditingTimeline ? 'Edit Timeline Item' : 'Add Timeline Item';
    
    if (isEditingTimeline) {
      const item = timelineItems.find(i => i.id === itemId);
      if (item) {
        document.getElementById('timeline-id').value = item.id;
        document.getElementById('timeline-year').value = item.year || '';
        document.getElementById('timeline-role').value = item.role || '';
        document.getElementById('timeline-company').value = item.company || '';
        document.getElementById('timeline-description').value = item.description || '';
        document.getElementById('timeline-status').value = item.status || 'published';
        document.getElementById('timeline-display-order').value = item.display_order || 0;
      }
    } else {
      if (timelineForm) timelineForm.reset();
      document.getElementById('timeline-id').value = '';
      document.getElementById('timeline-status').value = 'published';
      document.getElementById('timeline-display-order').value = '0';
    }

    if (timelineModal) timelineModal.classList.add('is-open');
  }

  function closeTimelineModal() {
    if (timelineModal) timelineModal.classList.remove('is-open');
    if (timelineForm) timelineForm.reset();
  }

  // Handle Form Submit
  if (timelineForm) {
    timelineForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = timelineForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      const id = document.getElementById('timeline-id').value;
      const timelineData = {
        year: document.getElementById('timeline-year').value,
        role: document.getElementById('timeline-role').value,
        company: document.getElementById('timeline-company').value,
        description: document.getElementById('timeline-description').value,
        status: document.getElementById('timeline-status').value,
        display_order: parseInt(document.getElementById('timeline-display-order').value, 10) || 0,
        updated_at: new Date().toISOString()
      };

      try {
        if (isEditingTimeline && id) {
          const { error } = await supabaseClient
            .from('career_timeline')
            .update(timelineData)
            .eq('id', id);
          if (error) throw error;
        } else {
          const { error } = await supabaseClient
            .from('career_timeline')
            .insert([timelineData]);
          if (error) throw error;
        }

        closeTimelineModal();
        await fetchTimelineItems();
        showStatus('Timeline item saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving timeline item:', err);
        alert('Failed to save timeline item. Check console.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Item';
        }
      }
    });
  }

  async function deleteTimelineItem(id) {
    try {
      const { error } = await supabaseClient
        .from('career_timeline')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTimelineItems();
      showStatus('Timeline item deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting timeline item:', err);
      showStatus('Failed to delete timeline item.', 'danger');
    }
  }

  function showStatus(message, type) {
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
