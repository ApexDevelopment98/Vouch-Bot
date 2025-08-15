require('dotenv').config();

const config = {
  // Bot configuration
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Bot settings
  settings: {
    // Command prefix for legacy commands (if needed)
    prefix: '!',
    
    // Default cooldowns
    defaultCooldown: 3000, // 3 seconds
    
    // Color scheme
    colors: {
      primary: '#5865F2',    // Discord blurple
      success: '#57F287',    // Green
      warning: '#FEE75C',    // Yellow
      error: '#ED4245',      // Red
      info: '#5865F2'        // Blurple
    },
    
    // Command categories
    categories: [
      'General',
      'Vouch',
      'Admin',
      'Settings'
    ]
  }
};

// Validation
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Freeze the config object to prevent modifications
module.exports = Object.freeze(config); 