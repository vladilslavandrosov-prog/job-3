from datetime import datetime, timedelta, timezone

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton

from bot.db import get_user_by_telegram_id, update_user_settings

router = Router()


@router.message(Command("settings"))
async def cmd_settings(message: Message):
    user = await get_user_by_telegram_id(message.from_user.id)
    if not user:
        await message.answer("❌ Аккаунт не привязан. Используйте /start для подключения.")
        return

    paused = user.get("paused_until")
    paused_text = ""
    if paused:
        dt = datetime.fromisoformat(paused.replace("Z", "+00:00"))
        if dt > datetime.now(timezone.utc):
            paused_text = f"\n⏸ Уведомления приостановлены до {dt.strftime('%d.%m.%Y %H:%M')}"

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="⏸ Пауза 24 ч", callback_data="pause_24h"),
            InlineKeyboardButton(text="⏸ Пауза 7 д", callback_data="pause_7d"),
        ],
        [InlineKeyboardButton(text="⏸ Пауза навсегда", callback_data="pause_forever")],
        [InlineKeyboardButton(text="▶️ Включить уведомления", callback_data="resume")],
    ])

    await message.answer(
        f"⚙️ <b>Настройки уведомлений</b>{paused_text}\n\n"
        "Выберите действие:",
        reply_markup=keyboard
    )


@router.message(Command("status"))
async def cmd_status(message: Message):
    user = await get_user_by_telegram_id(message.from_user.id)
    if not user:
        await message.answer("❌ Аккаунт не привязан.")
        return

    filters = user.get("filters") or {}
    platforms = filters.get("platforms", [])
    tech_stack = filters.get("tech_stack", [])
    paused = user.get("paused_until")

    paused_text = "✅ Активны"
    if paused:
        dt = datetime.fromisoformat(paused.replace("Z", "+00:00"))
        if dt > datetime.now(timezone.utc):
            paused_text = f"⏸ Пауза до {dt.strftime('%d.%m.%Y')}"

    await message.answer(
        f"📊 <b>Текущие настройки</b>\n\n"
        f"Уведомления: {paused_text}\n"
        f"Площадки: {', '.join(platforms) if platforms else 'Все'}\n"
        f"Технологии: {', '.join(tech_stack) if tech_stack else 'Все'}\n"
    )


@router.message(Command("pause"))
async def cmd_pause(message: Message):
    args = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else "24h"

    now = datetime.now(timezone.utc)
    if args == "24h":
        until = now + timedelta(hours=24)
        label = "24 часа"
    elif args == "7d":
        until = now + timedelta(days=7)
        label = "7 дней"
    elif args == "forever":
        until = now + timedelta(days=36500)
        label = "навсегда"
    else:
        await message.answer("Используйте: /pause 24h | 7d | forever")
        return

    await update_user_settings(message.from_user.id, {"paused_until": until.isoformat()})
    await message.answer(f"⏸ Уведомления приостановлены на {label}.")


@router.message(Command("resume"))
async def cmd_resume(message: Message):
    await update_user_settings(message.from_user.id, {"paused_until": None})
    await message.answer("▶️ Уведомления возобновлены!")


@router.callback_query(F.data.startswith("pause_"))
async def cb_pause(call: CallbackQuery):
    action = call.data.removeprefix("pause_")
    now = datetime.now(timezone.utc)

    if action == "24h":
        until = now + timedelta(hours=24)
        label = "24 часа"
    elif action == "7d":
        until = now + timedelta(days=7)
        label = "7 дней"
    else:
        until = now + timedelta(days=36500)
        label = "навсегда"

    await update_user_settings(call.from_user.id, {"paused_until": until.isoformat()})
    await call.message.edit_text(f"⏸ Уведомления приостановлены на {label}.")
    await call.answer()


@router.callback_query(F.data == "resume")
async def cb_resume(call: CallbackQuery):
    await update_user_settings(call.from_user.id, {"paused_until": None})
    await call.message.edit_text("▶️ Уведомления возобновлены!")
    await call.answer()
