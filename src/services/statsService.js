const fs = require('fs');
const { PATHS } = require('../config/constants');

class StatsService {
  constructor() {
    this.stats = {
      totalVouches: 0,
      totalUsers: 0,
      activeVouchers: 0
    };
    this.updateStats();
  }

  updateStats() {
    try {
      // Read vouch data if exists
      if (fs.existsSync(PATHS.VOUCH_DATA)) {
        const rawData = fs.readFileSync(PATHS.VOUCH_DATA, 'utf8');
        const vouchData = JSON.parse(rawData);
        
        // Calculate statistics
        this.stats.totalVouches = vouchData.length;
        
        // Get unique users
        const uniqueUsers = new Set();
        const activeTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
        let activeCount = 0;

        vouchData.forEach(vouch => {
          uniqueUsers.add(vouch.authorId);
          if (new Date(vouch.timestamp).getTime() > activeTimestamp) {
            activeCount++;
          }
        });

        this.stats.totalUsers = uniqueUsers.size;
        this.stats.activeVouchers = activeCount;
      } else {
        console.log('Vouch data file does not exist at:', PATHS.VOUCH_DATA);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        path: PATHS.VOUCH_DATA
      });
    }
  }

  getStats() {
    this.updateStats(); // Refresh stats before returning
    return this.stats;
  }

  getTotalVouches() {
    this.updateStats();
    return this.stats.totalVouches;
  }

  getActiveVouchers() {
    this.updateStats();
    return this.stats.activeVouchers;
  }
}

// Create and export a single instance
const statsService = new StatsService();
module.exports = statsService; 