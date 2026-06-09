from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    args = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else ""

    if args.startswith("connect_"):
        code = args.removeprefix("connect_")
        # TODO: link telegram_id to user account via connect code
        await message.answer(
            f"🔗 Привязка аккаунта...\n\nКод: <code>{code}</code>\n\nФункциональность будет добавлена в Фазе 5."
        )
        return

    await message.answer(
        "👋 Добро пожаловать в <b>TenderIntel</b>!\n\n"
        "Я буду присылать уведомления о новых ИТ-тендерах.\n\n"
        "Для привязки аккаунта перейдите в настройки на сайте и нажмите «Подключить Telegram».\n\n"
        "Команды:\n"
        "/settings — настройки фильтров\n"
        "/pause — приостановить уведомления\n"
        "/resume — возобновить\n"
        "/status — текущие настройки"
    )
