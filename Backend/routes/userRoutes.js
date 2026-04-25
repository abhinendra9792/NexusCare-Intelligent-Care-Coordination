const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const pool = require('../config/db');

/**
 * GET /api/user/profile
 * Returns full user profile including health info
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const query = `
      SELECT id, email, first_name, last_name, phone, date_of_birth, gender,
             blood_group, allergies, medical_conditions,
             emergency_contact_name, emergency_contact_phone,
             is_active, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];

    let reportCount = 0;
    try {
      const reportResult = await pool.query('SELECT COUNT(*) as count FROM reports WHERE patient_id = $1', [userId]);
      reportCount = parseInt(reportResult.rows[0].count) || 0;
    } catch (e) {}

    res.status(200).json({
      success: true,
      user: {
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        blood_group: user.blood_group,
        allergies: user.allergies,
        medical_conditions: user.medical_conditions,
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_phone: user.emergency_contact_phone,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        report_count: reportCount
      }
    });
  } catch (error) {
    console.error('Error in profile route:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile fields
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      first_name, last_name, phone, date_of_birth, gender,
      blood_group, allergies, medical_conditions,
      emergency_contact_name, emergency_contact_phone
    } = req.body;

    const query = `
      UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        date_of_birth = COALESCE($4, date_of_birth),
        gender = COALESCE($5, gender),
        blood_group = COALESCE($6, blood_group),
        allergies = COALESCE($7, allergies),
        medical_conditions = COALESCE($8, medical_conditions),
        emergency_contact_name = COALESCE($9, emergency_contact_name),
        emergency_contact_phone = COALESCE($10, emergency_contact_phone),
        updated_at = NOW()
      WHERE id = $11
      RETURNING id, email, first_name, last_name, phone, date_of_birth, gender,
                blood_group, allergies, medical_conditions,
                emergency_contact_name, emergency_contact_phone, updated_at
    `;

    const result = await pool.query(query, [
      first_name, last_name, phone, date_of_birth || null, gender,
      blood_group, allergies, medical_conditions,
      emergency_contact_name, emergency_contact_phone, userId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

module.exports = router;
