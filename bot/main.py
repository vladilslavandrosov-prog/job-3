import asyncio
import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from handlers import start, settings, alerts

load_dotenv()

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]


async def main():
    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher()

    dp.include_router(start.router)
    dp.include_router(settings.router)
    dp.include_router(alerts.router)

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
