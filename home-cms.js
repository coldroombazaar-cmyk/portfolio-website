document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const statusDiv = document.getElementById('home-cms-status');

  // Hero Form Elements
  const heroForm = document.getElementById('hero-settings-form');
  const heroIdInput = document.getElementById('hero-settings-id');
  const eyebrowInput = document.getElementById('hero-eyebrow');
  const headlineInput = document.getElementById('hero-headline');
  const subheadlineInput = document.getElementById('hero-subheadline');
  const ctaTextInput = document.getElementById('hero-cta-text');
  const ctaLinkInput = document.getElementById('hero-cta-link');
  const heroEnabledCheckbox = document.getElementById('hero-enabled');
  let settingsId = null;

  // Skills Heading Form Elements
  const skillsTextForm = document.getElementById('skills-section-form');
  const skillsHeadingInput = document.getElementById('skills-section-heading');
  const skillsTaglineInput = document.getElementById('skills-section-tagline');

  // Skill Cards Table Elements
  const skillsTableBody = document.getElementById('skills-table-body');
  const btnAddSkill = document.getElementById('btn-add-skill');
  const skillModal = document.getElementById('skill-modal');
  const skillForm = document.getElementById('skill-form');
  const btnSkillClose = document.getElementById('skill-modal-close');
  const btnSkillCancel = document.getElementById('skill-modal-cancel');

  let skillCards = [];
  let isEditingSkill = false;


  // --- Initial Load Configuration ---
  await loadHeroSettings();
  await fetchSkillCards();

  // --- Hero Settings Handlers ---
  async function loadHeroSettings() {
    try {
      const { data, error } = await supabaseClient
        .from('home_hero')
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
        heroIdInput.value = data.id;
        if (eyebrowInput) eyebrowInput.value = data.eyebrow || '';
        if (headlineInput) headlineInput.value = data.headline || '';
        if (subheadlineInput) subheadlineInput.value = data.subheadline || '';
        if (ctaTextInput) ctaTextInput.value = data.cta_text || '';
        if (ctaLinkInput) ctaLinkInput.value = data.cta_link || 'projects.html';
        if (heroEnabledCheckbox) heroEnabledCheckbox.checked = data.is_enabled !== false;
        
        // Populate skills headings
        if (skillsHeadingInput) skillsHeadingInput.value = data.skills_heading || 'What I Do';
        if (skillsTaglineInput) skillsTaglineInput.value = data.skills_tagline || '';
      }
    } catch (err) {
      console.error('Error loading hero settings:', err);
      showStatus('Error loading hero settings. Check console.', 'danger');
    }
  }

  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-hero');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const heroData = {
        is_enabled: heroEnabledCheckbox.checked,
        eyebrow: eyebrowInput.value,
        headline: headlineInput.value,
        subheadline: subheadlineInput.value,
        cta_text: ctaTextInput.value,
        cta_link: ctaLinkInput.value,
        updated_at: new Date().toISOString()
      };

      try {
        if (settingsId) {
          const { error } = await supabaseClient
            .from('home_hero')
            .update(heroData)
            .eq('id', settingsId);
          if (error) throw error;
        } else {
          // If no row exists, create one with headings defaults
          const fullData = {
            ...heroData,
            skills_heading: skillsHeadingInput.value || 'What I Do',
            skills_tagline: skillsTaglineInput.value || 'A toolkit shaped by 5 years of shipping products.'
          };
          const { data, error } = await supabaseClient
            .from('home_hero')
            .insert([fullData])
            .select();
          if (error) throw error;
          if (data && data.length > 0) {
            settingsId = data[0].id;
            heroIdInput.value = data[0].id;
          }
        }
        showStatus('Hero settings saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving hero settings:', err);
        showStatus('Failed to save hero settings.', 'danger');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Hero Settings';
        }
      }
    });
  }

  // --- Skills Section Texts Handler ---
  if (skillsTextForm) {
    skillsTextForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-skills-text');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const skillsTextData = {
        skills_heading: skillsHeadingInput.value,
        skills_tagline: skillsTaglineInput.value,
        updated_at: new Date().toISOString()
      };

      try {
        if (settingsId) {
          const { error } = await supabaseClient
            .from('home_hero')
            .update(skillsTextData)
            .eq('id', settingsId);
          if (error) throw error;
          showStatus('Skills section headings saved successfully!', 'success');
        } else {
          showStatus('Please configure and save Hero settings first to initialize home settings.', 'danger');
        }
      } catch (err) {
        console.error('Error saving skills section text:', err);
        showStatus('Failed to save skills section text.', 'danger');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Section Text';
        }
      }
    });
  }

  // --- Skill Cards CRUD Handlers ---
  async function fetchSkillCards() {
    if (!skillsTableBody) return;
    skillsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading skill cards...</td></tr>';

    try {
      const { data, error } = await supabaseClient
        .from('home_skills')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      skillCards = data || [];
      renderSkillsTable();
    } catch (err) {
      console.error('Error loading skill cards:', err);
      skillsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load skill cards.</td></tr>';
    }
  }

  function renderSkillsTable() {
    if (!skillsTableBody) return;
    if (skillCards.length === 0) {
      skillsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No skill cards configured.</td></tr>';
      return;
    }

    skillsTableBody.innerHTML = '';
    skillCards.forEach(skill => {
      const tr = document.createElement('tr');
      
      tr.innerHTML = `
        <td style="text-align: center; font-size: 24px; padding: 12px;">${skill.icon || ''}</td>
        <td style="font-weight: 600;">${skill.title}</td>
        <td style="color: var(--text-muted); font-size: 13px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${skill.description}</td>
        <td style="text-align: center;">${skill.display_order}</td>
        <td style="text-align: center;"><span class="timeline-status-badge ${skill.status === 'published' ? 'published' : 'draft'}">${skill.status}</span></td>
        <td style="text-align: center;">
          <button type="button" class="admin-btn admin-btn--outline btn-edit-skill" data-id="${skill.id}" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;">Edit</button>
          <button type="button" class="admin-btn admin-btn--danger btn-delete-skill" data-id="${skill.id}" style="padding: 4px 8px; font-size: 12px;">Delete</button>
        </td>
      `;
      skillsTableBody.appendChild(tr);
    });

    attachRowListeners();
  }

  function attachRowListeners() {
    document.querySelectorAll('.btn-edit-skill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-skill').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this skill card?')) {
          await deleteSkillCard(id);
        }
      });
    });
  }

  // Modal Actions
  if (btnAddSkill) btnAddSkill.addEventListener('click', () => openModal());
  if (btnSkillClose) btnSkillClose.addEventListener('click', closeModal);
  if (btnSkillCancel) btnSkillCancel.addEventListener('click', closeModal);

  function openModal(skillId = null) {
    isEditingSkill = !!skillId;
    document.getElementById('skill-modal-title').textContent = isEditingSkill ? 'Edit Skill' : 'Add Skill';

    if (isEditingSkill) {
      const skill = skillCards.find(s => s.id === skillId);
      if (skill) {
        document.getElementById('skill-id').value = skill.id;
        document.getElementById('skill-icon').value = skill.icon || '';
        document.getElementById('skill-title').value = skill.title || '';
        document.getElementById('skill-description').value = skill.description || '';
        document.getElementById('skill-status').value = skill.status || 'published';
        document.getElementById('skill-display-order').value = skill.display_order || 0;
      }
    } else {
      if (skillForm) skillForm.reset();
      document.getElementById('skill-id').value = '';
      document.getElementById('skill-status').value = 'published';
      document.getElementById('skill-display-order').value = '0';
    }

    if (skillModal) skillModal.classList.add('is-open');
  }

  function closeModal() {
    if (skillModal) skillModal.classList.remove('is-open');
    if (skillForm) skillForm.reset();
  }

  // Handle Form Submit
  if (skillForm) {
    skillForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = skillForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      const id = document.getElementById('skill-id').value;
      const skillData = {
        icon: document.getElementById('skill-icon').value,
        title: document.getElementById('skill-title').value,
        description: document.getElementById('skill-description').value,
        status: document.getElementById('skill-status').value,
        display_order: parseInt(document.getElementById('skill-display-order').value, 10) || 0,
        updated_at: new Date().toISOString()
      };

      try {
        if (isEditingSkill && id) {
          const { error } = await supabaseClient
            .from('home_skills')
            .update(skillData)
            .eq('id', id);
          if (error) throw error;
        } else {
          const { error } = await supabaseClient
            .from('home_skills')
            .insert([skillData]);
          if (error) throw error;
        }

        closeModal();
        await fetchSkillCards();
        showStatus('Skill card saved successfully!', 'success');
      } catch (err) {
        console.error('Error saving skill card:', err);
        alert('Failed to save skill card. Check console logs.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Skill';
        }
      }
    });
  }

  async function deleteSkillCard(id) {
    try {
      const { error } = await supabaseClient
        .from('home_skills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSkillCards();
      showStatus('Skill card deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting skill card:', err);
      showStatus('Failed to delete skill card.', 'danger');
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
