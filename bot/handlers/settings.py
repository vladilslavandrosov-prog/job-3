from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

router = Router()


@router.message(Command("settings"))
async def cmd_settings(message: Message):
    await message.answer("⚙️ Настройки фильтров — Фаза 7")


@router.message(Command("status"))
async def cmd_status(message: Message):
    await message.answer("📊 Текущие настройки — Фаза 7")


@router.message(Command("pause"))
async def cmd_pause(message: Message):
    await message.answer("⏸ Уведомления приостановлены — Фаза 7")


@router.message(Command("resume"))
async def cmd_resume(message: Message):
    await message.answer("▶️ Уведомления возобновлены — Фаза 7")
