require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize bot and Claude client
const bot = new Telegraf(process.env.BOT_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory state storage (userId -> state)
const sessions = new Map();

// Initialize empty state
function createState() {
  return {
    idea: '',
    risk_type: '',
    viability: 0,
    fatigue: 0,
    fit: 0,
    round: 0,
  };
}

// Get or create session
function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, createState());
  }
  return sessions.get(userId);
}

// Reset session
function resetSession(userId) {
  sessions.set(userId, createState());
}

// Start command
bot.command('start', (ctx) => {
  resetSession(ctx.from.id);
  ctx.reply(
    '🎯 *BUILD/PIVOT/KILL*\n\n' +
    'A decision-making game to validate your idea.\n\n' +
    'Ready to begin? Use /play to start a new game.',
    { parse_mode: 'Markdown' }
  );
});

// Play command
bot.command('play', (ctx) => {
  resetSession(ctx.from.id);
  const state = getSession(ctx.from.id);
  state.round = 1;

  ctx.reply(
    '💡 *ROUND 1: What\'s your idea?*\n\n' +
    'Describe your project idea in one sentence.',
    { parse_mode: 'Markdown' }
  );
});

// Text input handler
bot.on('text', async (ctx) => {
  const state = getSession(ctx.from.id);

  // Ignore commands
  if (ctx.message.text.startsWith('/')) return;

  // Round 1: Collect idea
  if (state.round === 1 && !state.idea) {
    state.idea = ctx.message.text;
    state.round = 2;

    return ctx.reply(
      '⚠️ *ROUND 2: What\'s your biggest risk?*\n\n' +
      'Choose the main thing you\'re risking:',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('⏰ Time', 'risk_time')],
          [Markup.button.callback('💰 Money', 'risk_money')],
          [Markup.button.callback('🎭 Reputation', 'risk_reputation')],
          [Markup.button.callback('⚡ Energy', 'risk_energy')],
        ])
      }
    );
  }
});

// Callback query handlers
bot.action(/^risk_(.+)$/, async (ctx) => {
  const state = getSession(ctx.from.id);
  const riskType = ctx.match[1];

  state.risk_type = riskType;
  state.round = 3;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⚠️ *ROUND 2: What's your biggest risk?*\n\n` +
    `Selected: *${riskType.charAt(0).toUpperCase() + riskType.slice(1)}*`,
    { parse_mode: 'Markdown' }
  );

  // Move to Round 3
  setTimeout(() => {
    ctx.reply(
      '⏱️ *ROUND 3 (Time): You have 90 days.*\n\n' +
      'What will you cut first to ship faster?',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📦 Scope (fewer features)', 'r3_scope')],
          [Markup.button.callback('✨ Quality (rougher edges)', 'r3_quality')],
          [Markup.button.callback('👥 Audience (narrower target)', 'r3_audience')],
          [Markup.button.callback('🚫 Nothing (ship it all)', 'r3_nothing')],
        ])
      }
    );
  }, 500);
});

// Round 3 handlers
bot.action('r3_scope', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability += 2;
  state.round = 4;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⏱️ *ROUND 3 (Time)*\n\nYou chose: *Scope* — smart. Viability +2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound4(ctx), 500);
});

bot.action('r3_quality', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fatigue += 1;
  state.round = 4;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⏱️ *ROUND 3 (Time)*\n\nYou chose: *Quality* — might burn you out. Fatigue +1`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound4(ctx), 500);
});

bot.action('r3_audience', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability += 2;
  state.round = 4;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⏱️ *ROUND 3 (Time)*\n\nYou chose: *Audience* — focus is good. Viability +2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound4(ctx), 500);
});

bot.action('r3_nothing', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fatigue += 2;
  state.viability -= 1;
  state.round = 4;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⏱️ *ROUND 3 (Time)*\n\nYou chose: *Nothing* — ambitious but risky. Fatigue +2, Viability -1`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound4(ctx), 500);
});

function showRound4(ctx) {
  ctx.reply(
    '⚡ *ROUND 4 (Energy): How many hours per week?*\n\n' +
    'Honestly, how much time can you commit?',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🐌 Less than 3 hours', 'r4_low')],
        [Markup.button.callback('🚶 3–5 hours', 'r4_medium')],
        [Markup.button.callback('🏃 6–10 hours', 'r4_high')],
        [Markup.button.callback('🔥 10+ hours', 'r4_extreme')],
      ])
    }
  );
}

// Round 4 handlers
bot.action('r4_low', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability -= 2;
  state.round = 5;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⚡ *ROUND 4 (Energy)*\n\nYou chose: *<3 hours* — might not be enough. Viability -2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound5(ctx), 500);
});

bot.action('r4_medium', async (ctx) => {
  const state = getSession(ctx.from.id);
  // viability += 0 (no change)
  state.round = 5;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⚡ *ROUND 4 (Energy)*\n\nYou chose: *3–5 hours* — steady pace.`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound5(ctx), 500);
});

bot.action('r4_high', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fit += 2;
  state.round = 5;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⚡ *ROUND 4 (Energy)*\n\nYou chose: *6–10 hours* — solid commitment. Fit +2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound5(ctx), 500);
});

bot.action('r4_extreme', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fatigue -= 1;
  state.round = 5;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⚡ *ROUND 4 (Energy)*\n\nYou chose: *10+ hours* — intense! Fatigue -1 (good resilience)`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound5(ctx), 500);
});

function showRound5(ctx) {
  ctx.reply(
    '🔮 *ROUND 5 (Reality): If no one cares in 30 days?*\n\n' +
    'What would you do?',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🤔 Ask people why', 'r5_ask')],
        [Markup.button.callback('🔄 Change direction', 'r5_pivot')],
        [Markup.button.callback('💪 Double down', 'r5_double')],
        [Markup.button.callback('🚪 Quit and move on', 'r5_quit')],
      ])
    }
  );
}

// Round 5 handlers
bot.action('r5_ask', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability += 2;
  state.round = 6;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🔮 *ROUND 5 (Reality)*\n\nYou chose: *Ask why* — good instinct. Viability +2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound6(ctx), 500);
});

bot.action('r5_pivot', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability += 1;
  state.round = 6;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🔮 *ROUND 5 (Reality)*\n\nYou chose: *Change direction* — flexible. Viability +1`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound6(ctx), 500);
});

bot.action('r5_double', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability -= 2;
  state.fatigue += 1;
  state.round = 6;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🔮 *ROUND 5 (Reality)*\n\nYou chose: *Double down* — stubborn. Viability -2, Fatigue +1`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound6(ctx), 500);
});

bot.action('r5_quit', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fit += 2;
  state.round = 6;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🔮 *ROUND 5 (Reality)*\n\nYou chose: *Quit* — know your limits. Fit +2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound6(ctx), 500);
});

function showRound6(ctx) {
  ctx.reply(
    '🔍 *ROUND 6 (Substitution): What already replaces this?*\n\n' +
    'How do people solve this problem today?',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🛠️ Manual workaround', 'r6_manual')],
        [Markup.button.callback('📊 Spreadsheet/notes', 'r6_spreadsheet')],
        [Markup.button.callback('🏢 Existing tool', 'r6_existing')],
        [Markup.button.callback('❌ Nothing (they suffer)', 'r6_nothing')],
      ])
    }
  );
}

// Round 6 handlers
bot.action('r6_manual', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability += 2;
  state.round = 7;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🔍 *ROUND 6 (Substitution)*\n\nYou chose: *Manual workaround* — great opportunity. Viability +2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound7(ctx), 500);
});

bot.action('r6_spreadsheet', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability += 1;
  state.round = 7;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🔍 *ROUND 6 (Substitution)*\n\nYou chose: *Spreadsheet/notes* — good sign. Viability +1`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound7(ctx), 500);
});

bot.action('r6_existing', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability -= 2;
  state.round = 7;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🔍 *ROUND 6 (Substitution)*\n\nYou chose: *Existing tool* — tough competition. Viability -2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound7(ctx), 500);
});

bot.action('r6_nothing', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.viability -= 1;
  state.round = 7;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🔍 *ROUND 6 (Substitution)*\n\nYou chose: *Nothing* — might not be painful enough. Viability -1`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showRound7(ctx), 500);
});

function showRound7(ctx) {
  ctx.reply(
    '🙈 *ROUND 7 (Avoidance): Which part will you avoid?*\n\n' +
    'Be honest — what task makes you uncomfortable?',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💼 Selling/marketing', 'r7_selling')],
        [Markup.button.callback('🏁 Finishing/shipping', 'r7_finishing')],
        [Markup.button.callback('🔧 Support/maintenance', 'r7_support')],
        [Markup.button.callback('📸 Being visible', 'r7_visible')],
      ])
    }
  );
}

// Round 7 handlers (final round)
bot.action('r7_selling', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fit -= 2;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🙈 *ROUND 7 (Avoidance)*\n\nYou chose: *Selling* — major blocker. Fit -2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showVerdict(ctx), 500);
});

bot.action('r7_finishing', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fit -= 2;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🙈 *ROUND 7 (Avoidance)*\n\nYou chose: *Finishing* — red flag. Fit -2`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showVerdict(ctx), 500);
});

bot.action('r7_support', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fatigue += 1;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🙈 *ROUND 7 (Avoidance)*\n\nYou chose: *Support* — draining long-term. Fatigue +1`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showVerdict(ctx), 500);
});

bot.action('r7_visible', async (ctx) => {
  const state = getSession(ctx.from.id);
  state.fit -= 1;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🙈 *ROUND 7 (Avoidance)*\n\nYou chose: *Being visible* — might limit growth. Fit -1`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(() => showVerdict(ctx), 500);
});

async function showVerdict(ctx) {
  const state = getSession(ctx.from.id);

  // Calculate verdict
  let verdict;
  if (state.viability >= 3 && state.fit >= 2 && state.fatigue <= 2) {
    verdict = 'BUILD';
  } else if (state.viability >= 1) {
    verdict = 'PIVOT';
  } else {
    verdict = 'KILL';
  }

  // Show processing message
  await ctx.reply('🤔 Analyzing your responses...');

  // Call Claude API for personalized feedback
  const analysis = await getClaudeAnalysis(state, verdict);

  // Show final verdict
  const verdictEmoji = verdict === 'BUILD' ? '🟢' : verdict === 'PIVOT' ? '🟡' : '🔴';

  await ctx.reply(
    `${verdictEmoji} *VERDICT: ${verdict}*\n\n` +
    `*Scores:*\n` +
    `• Viability: ${state.viability}/10\n` +
    `• Fit: ${state.fit}/10\n` +
    `• Fatigue: ${state.fatigue}/10\n\n` +
    `${analysis}\n\n` +
    `─────────────\n` +
    `Start over? /play`,
    { parse_mode: 'Markdown' }
  );

  // Reset session
  resetSession(ctx.from.id);
}

async function getClaudeAnalysis(state, verdict) {
  try {
    const prompt = `You are analyzing a BUILD/PIVOT/KILL decision game result.

Idea: ${state.idea}
Risk type: ${state.risk_type}
Scores - Viability: ${state.viability}, Fit: ${state.fit}, Fatigue: ${state.fatigue}
Verdict: ${verdict}

Generate a brief, actionable analysis:
1. A 2-3 sentence explanation of why this verdict makes sense
2. A 7-day action list (max 3 specific bullets)
3. One "Stop doing:" line

Keep it under 150 words total. Be direct and honest. No fluff or motivational speak.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return message.content[0].text.trim();
  } catch (error) {
    console.error('Claude API error:', error);

    // Fallback response if API fails
    const fallbacks = {
      BUILD: `*Why:* Your idea shows strong viability with manageable risk. The path forward is clear enough to start.\n\n*Next 7 days:*\n• Ship a minimal proof-of-concept\n• Get 5 people to try it\n• Document one key learning\n\n*Stop doing:* Planning without building.`,
      PIVOT: `*Why:* There's potential here, but the current approach has gaps. Adjust before committing fully.\n\n*Next 7 days:*\n• Interview 3 potential users\n• Test one core assumption\n• Sketch a revised approach\n\n*Stop doing:* Building before validating.`,
      KILL: `*Why:* The numbers suggest this idea isn't aligned with your strengths or the opportunity isn't strong enough.\n\n*Next 7 days:*\n• Extract one lesson learned\n• List 3 alternative ideas\n• Pick the best one to test\n\n*Stop doing:* Forcing a misfit.`
    };

    return fallbacks[verdict];
  }
}

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Something went wrong. Please try /start to begin again.');
});

// Launch bot
bot.launch().then(() => {
  console.log('🤖 BUILD/PIVOT/KILL bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
