const path = require('path');

// File paths
const PATHS = {
  VOUCH_DATA: path.join(__dirname, '..', 'data', 'information.json')
};

// Embed colors
const COLORS = {
  EMBED: 0x2B2D31,
  SUCCESS: 0x57F287, // Green
  WARNING: 0xFEE75C, // Yellow
  ERROR: 0xED4245    // Red
};

// Rate limiting
const RATE_LIMITS = {
  RESTORE_DELAY: 2500, // ms
  MAX_VOUCHES_PER_HOUR: 5
};

// Error messages
const ERRORS = {
  NO_PERMISSION: 'You do not have permission to use this command.',
  NO_VOUCH_DATA: 'No vouch data found to restore.',
  NO_CHANNEL: 'Channel not found. Please check your configuration!',
  NO_CONFIG: 'Channel ID is not defined in the configuration!',
  SUBMISSION_SUCCESS: '✅ Your vouch has been submitted successfully!',
  RATE_LIMIT: '⏰ You have reached the maximum number of vouches allowed per hour.'
};

// Command options
const COMMAND_OPTIONS = {
  REVIEW_MAX_LENGTH: 1000
};

module.exports = {
  PATHS,
  COLORS,
  RATE_LIMITS,
  ERRORS,
  COMMAND_OPTIONS
}; 