import os
import json
import asyncpg
import logging
import aiohttp

logger = logging.getLogger(__name__)

_pool = None

SUPABASE_DB_URL = os.environ.get("SUPABASE_DB_URL", "")
APP_URL = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

# Sent-tender deduplication (in-memory; use Redis in prod)
_sent: set[tuple] = set()


async def get_pool():
    global _pool
    if _pool is None and SUPABASE_DB_URL:
        _pool = await asyncpg.create_pool(SUPABASE_DB_URL)
    return _pool


async def get_user_by_telegram_id(telegram_id: int) -> dict | None:
    pool = await get_pool()
    if not pool:
        return None
    row = await pool.fetchrow(
        "SELECT * FROM telegram_users WHERE telegram_id = $1",
        telegram_id
    )
    if row:
        d = dict(row)
        if isinstance(d.get("filters"), str):
            d["filters"] = json.loads(d["filters"])
        return d
    return None


async def get_active_users() -> list[dict]:
    pool = await get_pool()
    if not pool:
        return []
    rows = await pool.fetch(
        "SELECT * FROM telegram_users "
        "WHERE paused_until IS NULL OR paused_until < NOW()"
    )
    result = []
    for row in rows:
        d = dict(row)
        if isinstance(d.get("filters"), str):
            d["filters"] = json.loads(d["filters"])
        result.append(d)
    return result


async def update_user_settings(telegram_id: int, updates: dict) -> bool:
    pool = await get_pool()
    if not pool:
        return False
    sets = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(updates))
    values = list(updates.values())
    await pool.execute(
        f"UPDATE telegram_users SET {sets} WHERE telegram_id = $1",
        telegram_id, *values
    )
    return True


async def link_account(code: str, telegram_id: int) -> bool:
    """Calls Next.js API to verify the one-time code and link the account."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{APP_URL}/api/telegram/connect",
                params={"code": code, "telegram_id": str(telegram_id)},
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                return resp.status == 200
    except Exception as e:
        logger.error(f"link_account error: {e}")
        return False


async def mark_tender_sent(telegram_id: int, tender_id: str) -> bool:
    """Returns True if already sent (dedup). Marks as sent if new."""
    key = (telegram_id, tender_id)
    if key in _sent:
        return True
    _sent.add(key)
    return False
