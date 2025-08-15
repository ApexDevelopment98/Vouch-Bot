const { EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const config = require('../config/config.json');
const { PATHS, COLORS, RATE_LIMITS, ERRORS } = require('../config/constants');

class VouchService {
  constructor() {
    this.vouchData = [];
    this.userVouchCounts = new Map();
    this.loadVouchData();
  }

  async loadVouchData() {
    try {
      if (fs.existsSync(PATHS.VOUCH_DATA)) {
        const rawData = fs.readFileSync(PATHS.VOUCH_DATA);
        this.vouchData = JSON.parse(rawData);
      }
    } catch (error) {
      console.error('Error loading vouch data:', error);
      this.vouchData = [];
    }
  }

  async saveVouchData() {
    try {
      fs.writeFileSync(PATHS.VOUCH_DATA, JSON.stringify(this.vouchData, null, 2));
    } catch (error) {
      console.error('Error saving vouch data:', error);
      throw new Error('Failed to save vouch data');
    }
  }

  isRateLimited(userId) {
    const now = Date.now();
    const userVouches = this.userVouchCounts.get(userId) || [];
    
    // Remove vouches older than 1 hour
    const recentVouches = userVouches.filter(time => now - time < 3600000);
    this.userVouchCounts.set(userId, recentVouches);
    
    return recentVouches.length >= RATE_LIMITS.MAX_VOUCHES_PER_HOUR;
  }

  createVouchEmbed(userData, isNew = true) {
    const starsEmoji = '⭐'.repeat(userData.rating);
    const emptyStars = '☆'.repeat(5 - userData.rating);
    const timestamp = new Date(userData.timestamp);

    const embed = new EmbedBuilder()
      .setColor(this.getRatingColor(userData.rating))
      .setAuthor({
        name: isNew ? '✨ New Vouch' : '📜 Restored Vouch',
        iconURL: userData.guildIcon
      })
      .setDescription([
        `### ${starsEmoji}${emptyStars}`,
        '',
        '> ' + userData.review.split('\n').join('\n> '),
        '',
        `• From: <@${userData.authorId}>`,
        `-# Date: <t:${Math.floor(timestamp.getTime() / 1000)}:R>`
      ].filter(Boolean).join('\n'))
      .setThumbnail(userData.avatar);

    if (userData.attachment) {
      embed.setImage(userData.attachment);
    }

    embed.setFooter({ 
      text: `Vouch #${userData.id} • ${timestamp.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`,
      iconURL: userData.guildIcon
    });

    return embed;
  }

  getRatingColor(rating) {
    switch (rating) {
      case 5: return COLORS.SUCCESS;
      case 4: return 0x57B3F2;
      case 3: return 0xFCBE2C;
      case 2: return 0xFFA500;
      case 1: return COLORS.ERROR;
      default: return COLORS.EMBED;
    }
  }

  async submitVouch(interaction) {
    try {
      if (this.isRateLimited(interaction.user.id)) {
        return interaction.reply({ 
          content: ERRORS.RATE_LIMIT, 
          flags: MessageFlags.Ephemeral 
        });
      }

      const review = interaction.options.getString('review');
      const stars = interaction.options.getInteger('stars');
      const attachment = interaction.options.getAttachment('attachment');

      const id = this.vouchData.length + 1;
      const userData = {
        id,
        author: interaction.user.tag,
        authorId: interaction.user.id,
        avatar: interaction.user.displayAvatarURL({ dynamic: true }),
        guildIcon: interaction.guild.iconURL({ dynamic: true }),
        rating: stars,
        review,
        timestamp: new Date().toISOString(),
        attachment: attachment ? attachment.url : null
      };

      this.vouchData.push(userData);
      await this.saveVouchData();

      // Update rate limit counter
      const userVouches = this.userVouchCounts.get(interaction.user.id) || [];
      userVouches.push(Date.now());
      this.userVouchCounts.set(interaction.user.id, userVouches);

      const embed = this.createVouchEmbed(userData, true);
      const vouchChannel = await this.getVouchChannel(interaction);
      if (!vouchChannel) return;

      await vouchChannel.send({ embeds: [embed] });
      await interaction.reply({ 
        content: ERRORS.SUBMISSION_SUCCESS, 
        flags: MessageFlags.Ephemeral 
      });

    } catch (error) {
      console.error('Error submitting vouch:', error);
      await interaction.reply({ 
        content: ERRORS.COMMAND_ERROR, 
        flags: MessageFlags.Ephemeral 
      });
    }
  }

  async restoreVouches(interaction) {
    try {
      if (interaction.user.id !== config.ownerId) {
        return interaction.reply({ 
          content: ERRORS.NO_PERMISSION, 
          flags: MessageFlags.Ephemeral 
        });
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      if (!fs.existsSync(PATHS.VOUCH_DATA)) {
        return interaction.editReply({ 
          content: ERRORS.NO_VOUCH_DATA, 
          flags: MessageFlags.Ephemeral 
        });
      }

      await this.loadVouchData();
      const vouchChannel = await this.getVouchChannel(interaction);
      if (!vouchChannel) return;

      for (const vouch of this.vouchData) {
        const userData = {
          ...vouch,
          guildIcon: interaction.guild.iconURL({ dynamic: true })
        };

        const embed = this.createVouchEmbed(userData, false);
        if (vouch.attachment) {
          embed.setImage(vouch.attachment);
        }

        await vouchChannel.send({ embeds: [embed] });
        await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.RESTORE_DELAY));
      }

      await interaction.editReply({ 
        content: 'All vouches have been restored.', 
        flags: MessageFlags.Ephemeral 
      });

    } catch (error) {
      console.error('Error restoring vouches:', error);
      await interaction.editReply({ 
        content: ERRORS.COMMAND_ERROR, 
        flags: MessageFlags.Ephemeral 
      });
    }
  }

  async getVouchChannel(interaction) {
    const vouchChannelId = config.vouchChannelId;
    if (!vouchChannelId) {
      await interaction.reply({ 
        content: ERRORS.NO_CONFIG, 
        flags: MessageFlags.Ephemeral 
      });
      return null;
    }

    const vouchChannel = interaction.guild.channels.cache.get(vouchChannelId);
    if (!vouchChannel) {
      await interaction.reply({ 
        content: ERRORS.NO_CHANNEL, 
        flags: MessageFlags.Ephemeral 
      });
      return null;
    }

    return vouchChannel;
  }
}

// Create and export a single instance
const vouchService = new VouchService();
module.exports = {
  submitVouch: (interaction) => vouchService.submitVouch(interaction),
  restoreVouches: (interaction) => vouchService.restoreVouches(interaction)
}; 