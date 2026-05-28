document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  const session = supabaseClient.auth.getSession ? supabaseClient.auth.getSession() : null;
  // Basic check for session if needed, assuming user is logged in if they are here
  
  // Status message utility
  const statusEl = document.getElementById('contact-cms-status');
  const showStatus = (msg, isError = false) => {
    statusEl.textContent = msg;
    statusEl.style.display = 'block';
    statusEl.style.backgroundColor = isError ? '#fee2e2' : '#dcfce7';
    statusEl.style.color = isError ? '#991b1b' : '#166534';
    statusEl.style.border = `1px solid ${isError ? '#f87171' : '#4ade80'}`;
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  };

  // --- 1. Page Settings ---
  const settingsForm = document.getElementById('contact-settings-form');
  const settingsId = document.getElementById('contact-settings-id');
  const pageTitle = document.getElementById('contact-page-title');
  const pageSubtitle = document.getElementById('contact-page-subtitle');
  const contactHeading = document.getElementById('contact-heading');
  const emailLabel = document.getElementById('contact-email-label');
  const emailAddress = document.getElementById('contact-email-address');
  const locationLabel = document.getElementById('contact-location-label');
  const locationText = document.getElementById('contact-location-text');
  const successMessage = document.getElementById('contact-success-message');

  const fetchSettings = async () => {
    const { data, error } = await supabaseClient
      .from('contact_page_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return;
    }

    if (data) {
      settingsId.value = data.id;
      pageTitle.value = data.page_title;
      pageSubtitle.value = data.page_subtitle;
      contactHeading.value = data.card_heading;
      emailLabel.value = data.email_label;
      emailAddress.value = data.email_address;
      locationLabel.value = data.location_label;
      locationText.value = data.location_text;
      successMessage.value = data.success_message;
    }
  };

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = settingsId.value;
    const updates = {
      page_title: pageTitle.value,
      page_subtitle: pageSubtitle.value,
      card_heading: contactHeading.value,
      email_label: emailLabel.value,
      email_address: emailAddress.value,
      location_label: locationLabel.value,
      location_text: locationText.value,
      success_message: successMessage.value,
      updated_at: new Date()
    };

    let result;
    if (id) {
      result = await supabaseClient.from('contact_page_settings').update(updates).eq('id', id);
    } else {
      result = await supabaseClient.from('contact_page_settings').insert([updates]);
    }

    if (result.error) {
      showStatus('Error saving settings: ' + result.error.message, true);
    } else {
      showStatus('Settings saved successfully!');
      fetchSettings();
    }
  });


  // --- 2. Social Links CRUD ---
  const socialTableBody = document.getElementById('social-table-body');
  const socialModal = document.getElementById('social-modal');
  const socialForm = document.getElementById('social-form');
  const btnAddSocial = document.getElementById('btn-add-social');
  const socialModalClose = document.getElementById('social-modal-close');
  const socialModalCancel = document.getElementById('social-modal-cancel');
  
  let socialLinks = [];

  const fetchSocials = async () => {
    const { data, error } = await supabaseClient
      .from('contact_social_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching social links:', error);
      return;
    }

    socialLinks = data || [];
    renderSocials();
  };

  const renderSocials = () => {
    if (socialLinks.length === 0) {
      socialTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No social links found.</td></tr>';
      return;
    }

    socialTableBody.innerHTML = socialLinks.map(link => `
      <tr>
        <td style="text-align: center; font-size: 24px;">${link.icon}</td>
        <td><strong>${link.label}</strong></td>
        <td><a href="${link.url}" target="_blank">${link.url}</a></td>
        <td style="text-align: center;">${link.display_order}</td>
        <td style="text-align: center;">
          <span style="display: inline-block; padding: 4px 8px; border-radius: 99px; font-size: 12px; font-weight: 500; background: ${link.status === 'active' ? '#dcfce7' : '#f3f4f6'}; color: ${link.status === 'active' ? '#166534' : '#4b5563'};">
            ${link.status}
          </span>
        </td>
        <td style="text-align: center;">
          <button class="admin-btn admin-btn--outline" onclick="editSocial('${link.id}')" style="padding: 4px 8px; font-size: 13px; margin-right: 4px;">Edit</button>
          <button class="admin-btn admin-btn--danger" onclick="deleteSocial('${link.id}')" style="padding: 4px 8px; font-size: 13px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;">Delete</button>
        </td>
      </tr>
    `).join('');
  };

  const openSocialModal = (title) => {
    document.getElementById('social-modal-title').textContent = title;
    socialModal.classList.add('is-active');
  };

  const closeSocialModal = () => {
    socialModal.classList.remove('is-active');
    socialForm.reset();
    document.getElementById('social-id').value = '';
  };

  btnAddSocial.addEventListener('click', () => {
    openSocialModal('Add Social Link');
    // auto increment display order
    const nextOrder = socialLinks.length > 0 ? Math.max(...socialLinks.map(s => s.display_order)) + 1 : 1;
    document.getElementById('social-display-order').value = nextOrder;
  });

  socialModalClose.addEventListener('click', closeSocialModal);
  socialModalCancel.addEventListener('click', closeSocialModal);

  window.editSocial = (id) => {
    const link = socialLinks.find(s => s.id === id);
    if (!link) return;
    
    document.getElementById('social-id').value = link.id;
    document.getElementById('social-icon').value = link.icon;
    document.getElementById('social-label').value = link.label;
    document.getElementById('social-url').value = link.url;
    document.getElementById('social-display-order').value = link.display_order;
    document.getElementById('social-status').value = link.status;
    
    openSocialModal('Edit Social Link');
  };

  window.deleteSocial = async (id) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;
    
    const { error } = await supabaseClient.from('contact_social_links').delete().eq('id', id);
    if (error) {
      showStatus('Error deleting link: ' + error.message, true);
    } else {
      showStatus('Link deleted successfully!');
      fetchSocials();
    }
  };

  socialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('social-id').value;
    const updates = {
      icon: document.getElementById('social-icon').value,
      label: document.getElementById('social-label').value,
      url: document.getElementById('social-url').value,
      display_order: parseInt(document.getElementById('social-display-order').value, 10),
      status: document.getElementById('social-status').value
    };

    let result;
    if (id) {
      result = await supabaseClient.from('contact_social_links').update(updates).eq('id', id);
    } else {
      result = await supabaseClient.from('contact_social_links').insert([updates]);
    }

    if (result.error) {
      showStatus('Error saving link: ' + result.error.message, true);
    } else {
      showStatus('Link saved successfully!');
      closeSocialModal();
      fetchSocials();
    }
  });


  // --- 3. Subject Options CRUD ---
  const subjectTableBody = document.getElementById('subject-table-body');
  const subjectModal = document.getElementById('subject-modal');
  const subjectForm = document.getElementById('subject-form');
  const btnAddSubject = document.getElementById('btn-add-subject');
  const subjectModalClose = document.getElementById('subject-modal-close');
  const subjectModalCancel = document.getElementById('subject-modal-cancel');
  
  let subjectOptions = [];

  const fetchSubjects = async () => {
    const { data, error } = await supabaseClient
      .from('contact_subject_options')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error);
      return;
    }

    subjectOptions = data || [];
    renderSubjects();
  };

  const renderSubjects = () => {
    if (subjectOptions.length === 0) {
      subjectTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No subject options found.</td></tr>';
      return;
    }

    subjectTableBody.innerHTML = subjectOptions.map(opt => `
      <tr>
        <td><strong>${opt.option_label}</strong></td>
        <td><code>${opt.option_value}</code></td>
        <td style="text-align: center;">${opt.display_order}</td>
        <td style="text-align: center;">
          <span style="display: inline-block; padding: 4px 8px; border-radius: 99px; font-size: 12px; font-weight: 500; background: ${opt.status === 'active' ? '#dcfce7' : '#f3f4f6'}; color: ${opt.status === 'active' ? '#166534' : '#4b5563'};">
            ${opt.status}
          </span>
        </td>
        <td style="text-align: center;">
          <button class="admin-btn admin-btn--outline" onclick="editSubject('${opt.id}')" style="padding: 4px 8px; font-size: 13px; margin-right: 4px;">Edit</button>
          <button class="admin-btn admin-btn--danger" onclick="deleteSubject('${opt.id}')" style="padding: 4px 8px; font-size: 13px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;">Delete</button>
        </td>
      </tr>
    `).join('');
  };

  const openSubjectModal = (title) => {
    document.getElementById('subject-modal-title').textContent = title;
    subjectModal.classList.add('is-active');
  };

  const closeSubjectModal = () => {
    subjectModal.classList.remove('is-active');
    subjectForm.reset();
    document.getElementById('subject-id').value = '';
  };

  btnAddSubject.addEventListener('click', () => {
    openSubjectModal('Add Subject Option');
    const nextOrder = subjectOptions.length > 0 ? Math.max(...subjectOptions.map(s => s.display_order)) + 1 : 1;
    document.getElementById('subject-display-order').value = nextOrder;
  });

  subjectModalClose.addEventListener('click', closeSubjectModal);
  subjectModalCancel.addEventListener('click', closeSubjectModal);

  window.editSubject = (id) => {
    const opt = subjectOptions.find(s => s.id === id);
    if (!opt) return;
    
    document.getElementById('subject-id').value = opt.id;
    document.getElementById('subject-label').value = opt.option_label;
    document.getElementById('subject-value').value = opt.option_value;
    document.getElementById('subject-display-order').value = opt.display_order;
    document.getElementById('subject-status').value = opt.status;
    
    openSubjectModal('Edit Subject Option');
  };

  window.deleteSubject = async (id) => {
    if (!confirm('Are you sure you want to delete this subject option?')) return;
    
    const { error } = await supabaseClient.from('contact_subject_options').delete().eq('id', id);
    if (error) {
      showStatus('Error deleting option: ' + error.message, true);
    } else {
      showStatus('Option deleted successfully!');
      fetchSubjects();
    }
  };

  subjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('subject-id').value;
    const updates = {
      option_label: document.getElementById('subject-label').value,
      option_value: document.getElementById('subject-value').value,
      display_order: parseInt(document.getElementById('subject-display-order').value, 10),
      status: document.getElementById('subject-status').value
    };

    let result;
    if (id) {
      result = await supabaseClient.from('contact_subject_options').update(updates).eq('id', id);
    } else {
      result = await supabaseClient.from('contact_subject_options').insert([updates]);
    }

    if (result.error) {
      showStatus('Error saving option: ' + result.error.message, true);
    } else {
      showStatus('Option saved successfully!');
      closeSubjectModal();
      fetchSubjects();
    }
  });


  // --- Initialization ---
  

  fetchSettings();
  fetchSocials();
  fetchSubjects();

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem("adminLoggedIn");
      window.location.href = 'admin.html';
    });
  }
});
