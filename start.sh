#!/bin/sh

# Start Telegram bot in background (if Python available)
if command -v python3 > /dev/null 2>&1; then
  python3 -m bot.main &
  echo "Telegram bot started (PID $!)"
elif command -v python > /dev/null 2>&1; then
  python -m bot.main &
  echo "Telegram bot started (PID $!)"
else
  echo "Python not found, skipping bot"
fi

# Start Next.js (foreground)
exec node_modules/.bin/next start
