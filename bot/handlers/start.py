from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton

from bot.db import get_user_by_telegram_id, link_account

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    args = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else ""

    if args.startswith("connect_"):
        code = args.removeprefix("connect_")
        ok = await link_account(code=code, telegram_id=message.from_user.id)
        if ok:
            await message.answer(
                "✅ <b>Аккаунт успешно привязан!</b>\n\n"
                "Теперь вы будете получать уведомления о новых ИТ-тендерах.\n"
                "Используйте /settings для настройки фильтров."
            )
        else:
            await message.answer(
                "❌ <b>Код недействителен или истёк.</b>\n\n"
                "Вернитесь в приложение и получите новый код в разделе Настройки → Telegram."
            )
        return

    user = await get_user_by_telegram_id(message.from_user.id)

    if user:
        await message.answer(
            f"👋 С возвращением!\n\n"
            f"Используйте /settings для управления уведомлениями."
        )
    else:
        await message.answer(
            "👋 Добро пожаловать в <b>TenderIntel</b>!\n\n"
            "Я буду присылать уведомления о новых ИТ-тендерах по вашим фильтрам.\n\n"
            "<b>Для подключения:</b>\n"
            "1. Войдите в приложение TenderIntel\n"
            "2. Перейдите в Настройки → Telegram\n"
            "3. Нажмите «Получить код подключения»\n"
            "4. Отправьте мне команду: <code>/connect &lt;код&gt;</code>\n\n"
            "<b>Команды:</b>\n"
            "/settings — настройки фильтров\n"
            "/pause — приостановить уведомления\n"
            "/resume — возобновить\n"
            "/status — текущие настройки"
        )
