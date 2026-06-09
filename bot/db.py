import asyncpg
import os

_pool = None


async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(os.environ["SUPABASE_DB_URL"])
    return _pool


async def get_telegram_users_for_alerts():
    pool = await get_pool()
    return await pool.fetch(
        "SELECT * FROM telegram_users WHERE paused_until IS NULL OR paused_until < NOW()"
    )
