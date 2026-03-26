const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// POST /api/invite
// Invites a user via email and sets their role/position in metadata
router.post('/', async (req, res) => {
  const { email, full_name, role, oc_position, application_id } = req.body;

  if (!email || !full_name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Generate Supabase Invite Link (Admin)
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: email,
      options: {
        data: { 
          full_name, 
          role, 
          oc_position: role === 'oc' ? oc_position : null 
        },
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup`
      }
    });

    if (linkError) {
      console.error('Supabase Link Generation Error:', linkError);
      return res.status(500).json({ error: linkError.message });
    }

    const inviteLink = data.properties.action_link;

    // 2. Update application invited_at
    if (application_id) {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ invited_at: new Date().toISOString() })
        .eq('id', application_id);

      if (updateError) {
        console.warn('Failed to update application invited_at:', updateError);
        // We still consider the invite successful
      }
    }

    res.json({ success: true, user: data.user, inviteLink });
  } catch (err) {
    console.error('Invite Server Error:', err);
    res.status(500).json({ error: 'Internal server error during invitation' });
  }
});

module.exports = router;
