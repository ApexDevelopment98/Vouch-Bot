# VouchBot for Discord Markets

A specialized Discord bot for managing customer reviews and seller reputation in market servers.

## Preview

### Vouch Display
![Vouch Display](https://cdn.discordapp.com/attachments/1255155199329177672/1383482003088871556/image.png?ex=684ef385&is=684da205&hm=735ddd1db8d8fe33049aa5078cbb2a3cc52b23c3742758ee1426b7590260ec7f&)
*Clean and professional vouch display with ratings*

### Command Interface
![Command Interface](https://cdn.discordapp.com/attachments/1255155199329177672/1383195308825120830/image.png?ex=684de884&is=684c9704&hm=323e2b301c549a1be38056b72e9c5b4bdbb4dffb93730c80268204afe75df129&)
*Simple vouch submission with star ratings*

## Key Features

- ⭐ 5-star rating system
- 📝 Detailed customer reviews
- 🖼️ Support for image attachments (e.g., product screenshots)
- 🔒 Rate limiting to prevent spam
- 🎨 Modern embed design
- 💾 Automatic vouch backup
- 👑 Admin commands for management

## Quick Setup

1. **Invite Bot**
   - Use the OAuth2 URL from Discord Developer Portal
   - Required permissions: Send Messages, Embed Links, Attach Files

2. **Configuration**
   ```json
   {
     "token": "your_bot_token",
     "clientId": "bot_client_id",
     "guildId": "server_id",
     "vouchChannelId": "channel_for_vouches",
     "ownerId": "admin_user_id"
   }
   ```

3. **Start Bot**
   ```bash
   npm install
   npm start
   ```

## Commands

- `/vouch` - Submit a review
  - `review` - Your feedback (max 1000 chars)
  - `stars` - Rating from 1-5 stars
  - `attachment` - Optional product image

- `/restore` - Restore vouches from backup (Admin only)

## Security & Rate Limits

- 5 vouches per user per hour
- Ephemeral command responses
- Automatic backup of all vouches
- Admin-only restore functionality

## Support

For support or feature requests, please open an issue on GitHub.