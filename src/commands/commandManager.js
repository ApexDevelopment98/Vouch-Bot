const { SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('../config/config.json');

// Command definitions
const commands = [
  new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('Submit a vouch review')
    .addStringOption(option =>
      option
        .setName('review')
        .setDescription('Your review')
        .setRequired(true)
        .setMaxLength(1000)
    )
    .addIntegerOption(option =>
      option
        .setName('stars')
        .setDescription('Rating in stars')
        .setRequired(true)
        .addChoices(
          { name: '⭐⭐⭐⭐⭐', value: 5 },
          { name: '⭐⭐⭐⭐', value: 4 },
          { name: '⭐⭐⭐', value: 3 },
          { name: '⭐⭐', value: 2 },
          { name: '⭐', value: 1 }
        )
    )
    .addAttachmentOption(option =>
      option
        .setName('attachment')
        .setDescription('Optional screenshot')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('restore')
    .setDescription('Restore all vouches from information.json')
];

// REST client setup
const rest = new REST({ version: '9' }).setToken(config.token);

class CommandManager {
  constructor() {
    this.commands = commands;
  }

  async registerCommands() {
    try {
      console.log('Started refreshing application (/) commands...');
      
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: this.commands }
      );

      console.log('Successfully registered application commands.');
    } catch (error) {
      console.error('Error registering application commands:', error);
      throw new Error('Failed to register commands');
    }
  }
}

// Create and export a single instance
const commandManager = new CommandManager();
module.exports = {
  loadCommands: (client) => commandManager.registerCommands()
}; 