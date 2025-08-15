const { MessageFlags } = require('discord.js');
const { submitVouch, restoreVouches } = require('../services/vouchService');

async function handleInteraction(interaction) {
  if (!interaction.isCommand()) return;
  
  switch (interaction.commandName) {
    case 'vouch':
      await submitVouch(interaction);
      break;
    case 'restore':
      await restoreVouches(interaction);
      break;
    default:
      await interaction.reply({ 
        content: 'Unknown command.',
        flags: MessageFlags.Ephemeral
      });
  }
}

module.exports = { handleInteraction }; 