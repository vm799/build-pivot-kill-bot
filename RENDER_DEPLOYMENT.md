# Render Deployment Guide

This guide walks you through deploying the BUILD/PIVOT/KILL Telegram bot to Render.

## Prerequisites

- A Render account (free tier available at https://render.com)
- Your Telegram Bot Token (from @BotFather on Telegram)
- Your Anthropic API Key (from https://console.anthropic.com/)
- This repository pushed to GitHub

## Step 1: Set Up Environment Variables

1. **Create a `.env` file locally** (if testing):
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   BOT_TOKEN=your_telegram_bot_token
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

2. **Note:** Never commit `.env` to git. The `.gitignore` file already excludes it.

## Step 2: Push to GitHub

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "chore: deployment-ready bot with render.yaml"
git push origin main
```

## Step 3: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"**
4. Choose your GitHub repository (this one)
5. Configuration:
   - **Name:** `build-pivot-kill-bot`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free tier (sufficient for a Telegram bot)

6. Click **"Advanced"** and add Environment Variables:
   - **BOT_TOKEN:** (your Telegram bot token)
   - **ANTHROPIC_API_KEY:** (your Anthropic API key)

7. Click **"Create Web Service"**

### Option B: Manual Configuration

1. Create a Web Service manually on Render
2. Connect your GitHub repository
3. Set the environment variables in the Render dashboard settings
4. Render will automatically detect and run based on `render.yaml`

## Step 4: Verify Deployment

Once deployed, Render will:
- Provide a public URL (e.g., `https://build-pivot-kill-bot.onrender.com`)
- Show deployment logs in the dashboard
- Auto-rebuild on every git push

## Step 5: Set Telegram Webhook (Optional)

If you want long-polling (default), you don't need to set a webhook. However, for a production bot, webhooks are more efficient:

1. Note your Render service URL
2. Set the Telegram webhook:
   ```bash
   curl -X POST https://api.telegram.org/bot<BOT_TOKEN>/setWebhook \
     -F "url=https://build-pivot-kill-bot.onrender.com/"
   ```

**Note:** The current implementation uses long-polling (bot.launch()), which is simpler for free-tier Render deployments.

## Environment Variables Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `BOT_TOKEN` | Telegram Bot Token | @BotFather on Telegram → /newbot |
| `ANTHROPIC_API_KEY` | Anthropic API Key | https://console.anthropic.com → API Keys |

## Troubleshooting

### Bot not responding
- Check Render dashboard logs for errors
- Verify `BOT_TOKEN` and `ANTHROPIC_API_KEY` are correctly set
- Ensure long-polling is active (check bot logs)

### Render service crashes
- Check logs: `Render Dashboard → Logs`
- Common issues:
  - Missing environment variables
  - Node version mismatch (requires Node 18+)
  - API rate limits (add delays or upgrade keys)

### Dependency installation fails
- Clear Render cache: Dashboard → Settings → Clear Build Cache
- Ensure `package.json` is properly formatted
- Check for conflicting dependency versions

## Monitoring & Maintenance

- **Check Health:** Render Dashboard → Metrics
- **View Logs:** Render Dashboard → Logs (real-time)
- **Redeploy:** Push to GitHub → Auto-redeploy
- **Manual Redeploy:** Dashboard → Redeploy

## Production Checklist

- [x] `render.yaml` created
- [x] `package.json` includes node version
- [x] `.env.example` provided
- [x] `.gitignore` excludes `.env`
- [x] README includes deployment instructions
- [ ] Telegram bot token securely stored
- [ ] Anthropic API key securely stored
- [ ] Deployed and tested on Render
- [ ] Webhook configured (optional, for production)

## Free Tier Limitations

- **Inactivity:** Services spin down after 15 minutes of inactivity
- **Uptime:** Best effort (not guaranteed 99.9%)
- **Memory:** 512 MB
- **CPU:** Shared

For production use, consider upgrading to a Starter or Standard plan.

## Additional Resources

- [Render Docs](https://render.com/docs)
- [Telegraf Docs](https://telegraf.js.org/)
- [Anthropic API Docs](https://docs.anthropic.com/)
