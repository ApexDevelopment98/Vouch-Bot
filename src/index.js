const { Client, GatewayIntentBits, Events, MessageFlags } = require('discord.js');
const { loadCommands } = require('./commands/commandManager');
const { handleInteraction } = require('./events/interactionHandler');
const { setupReadyEvent } = require('./events/readyHandler');
const config = require('./config/config.json');

class Bot {
  constructor() {
    this.client = new Client({ 
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
      failIfNotExists: false
    });
    this.setupEventHandlers();
    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));
    process.on('uncaughtException', error => {
      console.error('Uncaught exception:', error);
      this.shutdown(1);
    });
    this.client.on('error', error => console.error('Discord client error:', error));
    this.client.on('warn', warning => console.warn('Discord client warning:', warning));
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      setupReadyEvent(this.client);
      console.log(`Logged in as ${this.client.user.tag}`);
    });

    this.client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isCommand()) return;
      try {
        await handleInteraction(interaction);
      } catch (error) {
        console.error('Error handling command:', error);
        await this.handleError(interaction, error);
      }
    });
  }

  async handleError(interaction, error) {
    const errorMessage = {
      content: 'An error occurred while processing the command.',
      flags: MessageFlags.Ephemeral
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    } catch (e) {
      console.error('Error sending error message:', e);
    }
  }

  async shutdown(code = 0) {
    try {
      await this.client.destroy();
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
    process.exit(code);
  }

  async start() {
    try {
      await loadCommands(this.client);
      if (!config.token) throw new Error('Bot token is missing in config.json');
      await this.client.login(config.token);
    } catch (error) {
      console.error('Failed to start bot:', error);
      this.shutdown(1);
    }
  }
}

new Bot().start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 