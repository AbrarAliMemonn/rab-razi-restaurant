import { getSettings, saveSettings } from '../data/db.js';

// GET /api/settings - Public endpoint
export function getActiveSettings(req, res) {
  try {
    const settings = getSettings();
    return res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving settings.' });
  }
}

// PUT /api/settings - Protected endpoint (Admin required)
export function updateActiveSettings(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required to update settings.'
      });
    }

    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings payload.' });
    }

    const updated = saveSettings(newSettings);

    return res.json({
      success: true,
      message: 'Restaurant settings updated successfully!',
      settings: updated
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating settings.' });
  }
}
