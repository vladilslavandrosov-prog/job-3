import asyncio
import os
import logging
from datetime import datetime, timezone

import aiohttp
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from bot.db import get_active_users, mark_tender_sent

logger = logging.getLogger(__name__)

APP_URL = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
POLL_INTERVAL = 300  # 5 minutes


def format_tender_message(tender: dict, days_left: int) -> str:
    deadline_str = tender.get("deadline", "")
    try:
        dt = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
        deadline_fmt = dt.strftime("%d.%m.%Y")
    except Exception:
        deadline_fmt = deadline_str[:10]

    urgency = f" 🔴 СРОЧНО!" if days_left <= 2 else f" ({days_left} дн.)"

    return (
        f"🔔 <b>Новый ИТ-тендер</b>\n\n"
        f"<b>{tender['title']}</b>\n\n"
        f"🏢 Заказчик: {tender.get('zakazchik', '—')}\n"
        f"💰 Сумма: {int(tender.get('amount', 0)):,} ₽\n"
        f"📅 Срок подачи: {deadline_fmt}{urgency}\n"
        f"🏛 Площадка: {tender.get('platform', '—')}\n"
    )


def build_tender_keyboard(tender_id: str, app_url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="📋 Открыть тендер",
                url=f"{app_url}/dashboard/tender/{tender_id}"
            ),
        ],
        [
            InlineKeyboardButton(text="✓ Участвуем",    callback_data=f"dec_{tender_id}_interesting"),
            InlineKeyboardButton(text="✗ Не участвуем", callback_data=f"dec_{tender_id}_rejected"),
        ],
    ])


def matches_filters(tender: dict, filters: dict) -> bool:
    platforms = filters.get("platforms", [])
    if platforms and tender.get("platform") not in platforms:
        return False

    min_amount = filters.get("min_amount")
    if min_amount and tender.get("amount", 0) < min_amount:
        return False

    max_amount = filters.get("max_amount")
    if max_amount and tender.get("amount", 0) > max_amount:
        return False

    tech_stack = filters.get("tech_stack", [])
    if tech_stack:
        tender_tech = [t.lower() for t in (tender.get("tech_stack") or [])]
        if not any(t.lower() in tender_tech for t in tech_stack):
            return False

    return True


async def fetch_new_tenders(session: aiohttp.ClientSession) -> list[dict]:
    try:
        async with session.get(f"{APP_URL}/api/tenders?is_new=true", timeout=aiohttp.ClientTimeout(total=10)) as resp:
            if resp.status == 200:
                data = await resp.json()
                return [t for t in (data.get("tenders") or []) if t.get("is_new")]
    except Exception as e:
        logger.warning(f"Failed to fetch tenders: {e}")
    return []


async def poll_and_notify(bot: Bot):
    logger.info("Starting tender polling loop (interval: %ds)", POLL_INTERVAL)
    async with aiohttp.ClientSession() as session:
        while True:
            try:
                tenders = await fetch_new_tenders(session)
                if not tenders:
                    await asyncio.sleep(POLL_INTERVAL)
                    continue

                users = await get_active_users()
                now = datetime.now(timezone.utc)

                for user in users:
                    telegram_id = user["telegram_id"]
                    filters = user.get("filters") or {}

                    for tender in tenders:
                        tender_id = tender["id"]

                        already_sent = await mark_tender_sent(telegram_id, tender_id)
                        if already_sent:
                            continue

                        if not matches_filters(tender, filters):
                            continue

                        deadline_str = tender.get("deadline", "")
                        try:
                            dl = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
                            days_left = (dl - now).days
                        except Exception:
                            days_left = 99

                        text = format_tender_message(tender, days_left)
                        kb = build_tender_keyboard(tender_id, APP_URL)

                        try:
                            await bot.send_message(telegram_id, text, reply_markup=kb)
                            await asyncio.sleep(0.05)  # rate limit
                        except Exception as e:
                            logger.warning(f"Failed to send to {telegram_id}: {e}")

            except Exception as e:
                logger.error(f"Polling error: {e}")

            await asyncio.sleep(POLL_INTERVAL)
