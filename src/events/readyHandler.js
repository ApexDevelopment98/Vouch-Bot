const { ActivityType } = require('discord.js');
const statsService = require('../services/statsService');

class ActivityManager {
  constructor(client) {
    this.client = client;
    this.currentIndex = 0;
    this.activities = [
      {
        name: '⭐ vouches',
        type: ActivityType.Watching
      },
      {
        name: '0 total vouches',
        type: ActivityType.Watching
      },
      {
        name: '0 active vouchers',
        type: ActivityType.Watching
      }
    ];
  }

  updateStatistics() {
    const stats = statsService.getStats();

    // Update activities with current statistics
    this.activities[1].name = `${stats.totalVouches} total vouches`;
    this.activities[2].name = `${stats.activeVouchers} active vouchers`;
  }

  setNextActivity() {
    this.updateStatistics();
    const activity = this.activities[this.currentIndex];
    
    this.client.user.setActivity(activity.name, { 
      type: activity.type
    });

    // Move to next activity
    this.currentIndex = (this.currentIndex + 1) % this.activities.length;
  }

  startRotation(interval = 15000) { // 15 seconds by default
    this.setNextActivity(); // Set initial activity
    
    // Start rotation
    setInterval(() => {
      this.setNextActivity();
    }, interval);
  }
}

function setupReadyEvent(client) {
  // Initialize and start activity rotation
  const activityManager = new ActivityManager(client);
  activityManager.startRotation();
}

module.exports = {
  setupReadyEvent
}; 