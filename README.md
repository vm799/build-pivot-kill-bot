# BUILD/PIVOT/KILL Telegram Bot

A decision-making game bot that helps validate startup ideas through a structured questionnaire. The bot guides users through 7 rounds of questions, tracks viability/fit/fatigue scores, and delivers a final verdict (BUILD/PIVOT/KILL) with AI-generated action items.

## Features

- 🎯 Interactive 7-round decision game
- 📊 Real-time scoring system (viability, fit, fatigue)
- 🤖 AI-powered analysis using Claude Haiku
- 💬 Inline keyboard buttons for smooth UX
- 🔄 Session management (in-memory state)
- ⚡ Production-ready error handling

## Game Flow

1. **ENTRY**: User submits their idea
2. **RISK TYPE**: Choose primary risk (Time/Money/Reputation/Energy)
3. **ROUND 1 (Time)**: "You have 90 days. Cut first?"
4. **ROUND 2 (Energy)**: "Hours per week?"
5. **ROUND 3 (Reality)**: "If no one cares in 30 days?"
6. **ROUND 4 (Substitution)**: "What already replaces this?"
7. **ROUND 5 (Avoidance)**: "Which part will you avoid?"
8. **VERDICT**: BUILD/PIVOT/KILL with personalized AI analysis

## Setup

### Prerequisites

- Node.js 16+ installed
- Telegram account
- Anthropic API key

### Installation

1. **Clone or download this repository**

```bash
git clone <your-repo-url>
cd build-pivot-kill-bot
```

2. **Install dependencies**

```bash
npm install
```

3. **Create a Telegram bot**

   - Open Telegram and message [@BotFather](https://t.me/BotFather)
   - Send `/newbot` and follow the prompts
   - Copy the bot token you receive

4. **Get Anthropic API key**

   - Sign up at [console.anthropic.com](https://console.anthropic.com/)
   - Create an API key from the dashboard

5. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```
BOT_TOKEN=your_telegram_bot_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Running the Bot

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

You should see: `🤖 BUILD/PIVOT/KILL bot is running...`

### Testing

1. Open Telegram
2. Search for your bot by username
3. Send `/start` to begin
4. Send `/play` to start a new game

## Deployment

### Option 1: VPS (DigitalOcean, AWS EC2, etc.)

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repository
git clone <your-repo-url>
cd build-pivot-kill-bot

# Install dependencies
npm install

# Set up environment variables
nano .env
# (paste your BOT_TOKEN and ANTHROPIC_API_KEY)

# Install PM2 for process management
sudo npm install -g pm2

# Start the bot
pm2 start index.js --name build-pivot-kill-bot

# Make it restart on server reboot
pm2 startup
pm2 save
```

### Option 2: Railway.app

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables:
   - `BOT_TOKEN`
   - `ANTHROPIC_API_KEY`
5. Deploy (Railway auto-detects Node.js)

### Option 3: Render.com

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables in the dashboard
6. Deploy

### Option 4: Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-bot-name

# Set environment variables
heroku config:set BOT_TOKEN=your_token_here
heroku config:set ANTHROPIC_API_KEY=your_key_here

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

## Project Structure

```
build-pivot-kill-bot/
├── index.js          # Main bot logic
├── package.json      # Dependencies
├── .env              # Environment variables (not committed)
├── .env.example      # Example env file
└── README.md         # This file
```

## Scoring Logic

### Viability (0-10)
- Measures idea strength and market opportunity
- Higher = better chance of success

### Fit (0-10)
- Measures personal alignment with required tasks
- Higher = better suited to execute

### Fatigue (0-10)
- Measures burnout risk
- Lower = more sustainable

### Verdict Rules

- **BUILD**: `viability >= 3 AND fit >= 2 AND fatigue <= 2`
- **PIVOT**: `viability >= 1` (but doesn't meet BUILD criteria)
- **KILL**: `viability < 1`

## Commands

- `/start` - Welcome message
- `/play` - Start a new game

## Limitations

- In-memory state (resets on bot restart)
- Single user sessions (no database)
- For production with many users, consider adding Redis or PostgreSQL

## Future Enhancements

- [ ] Persistent storage (database)
- [ ] User history tracking
- [ ] Leaderboard/statistics
- [ ] Export results to PDF
- [ ] Multi-language support
- [ ] Admin dashboard

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
