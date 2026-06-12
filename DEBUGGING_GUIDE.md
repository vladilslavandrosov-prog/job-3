# TenderIntel — Инструкция по отладке

> Дата: 2026-06-12

---

## Что было исправлено в коде (уже в репозитории)

| # | Файл | Проблема | Исправление |
|---|------|----------|-------------|
| 1 | `app/(auth)/login/page.tsx` | `location.origin` ломается при SSR | Заменено на `NEXT_PUBLIC_APP_URL` |
| 2 | `app/(auth)/register/page.tsx` | `location.origin` ломается при SSR | Заменено на `NEXT_PUBLIC_APP_URL` |
| 3 | `app/(auth)/reset-password/page.tsx` | `location.origin` ломается при SSR | Заменено на `NEXT_PUBLIC_APP_URL` |
| 4 | `app/api/billing/webhook/route.ts` | Нет верификации подписи вебхука | HMAC-SHA256 по `YUKASSA_WEBHOOK_SECRET` |
| 5 | `app/api/billing/webhook/route.ts` | Годовая подписка истекала через 1 месяц | `yearly → +12 месяцев` |

---

## Переменные окружения Amvera

Все переменные задаются в панели Amvera → твой проект → **Переменные**.

| Переменная | Где взять | Пример значения |
|------------|-----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role | `eyJhbGciOiJIUzI1NiIs...` |
| `YUKASSA_SHOP_ID` | ЮKassa → Настройки → Интеграция → shopId | `381764` |
| `YUKASSA_SECRET_KEY` | ЮKassa → Настройки → Интеграция → Секретный ключ | `test_abc123...` |
| `YUKASSA_WEBHOOK_SECRET` | ЮKassa → Настройки → HTTP-уведомления → Секрет | UUID вида `550e8400-...` |
| `NEXT_PUBLIC_APP_URL` | Твой домен на Amvera (без слеша в конце) | `https://job-3-vladis-XYZ.amvera.io` |
| `NEXTAUTH_SECRET` | Сгенерировать: `openssl rand -base64 32` | `K3dP9...` (32 байта) |
| `FLASK_BACKEND_URL` | URL Flask-сервиса на Amvera (если есть) | `http://localhost:5000` |
| `TELEGRAM_BOT_TOKEN` | @BotFather в Telegram → /newbot | `7123456789:AAF...` |

### Генерация NEXTAUTH_SECRET

Выполни в терминале (macOS/Linux/WSL):
```bash
openssl rand -base64 32
```
Скопируй результат в переменную `NEXTAUTH_SECRET`.

---

## Шаг 1. Настройка Supabase Auth

Без этого шага авторизация через email не будет работать.

1. Открой [app.supabase.com](https://app.supabase.com) → твой проект
2. Перейди в **Authentication → URL Configuration**
3. **Site URL** — укажи твой домен:
   ```
   https://job-3-vladis-XYZ.amvera.io
   ```
4. **Redirect URLs** — добавь оба:
   ```
   https://job-3-vladis-XYZ.amvera.io/api/auth/callback
   http://localhost:3000/api/auth/callback
   ```
5. Нажми **Save**.

**Почему важно**: Supabase проверяет `emailRedirectTo` против списка Redirect URLs.
Если домен не совпадает — письмо приходит, но ссылка в нём не работает (ошибка 403).

---

## Шаг 2. Применение миграций БД

Без таблиц `tenants`, `tenant_users` вход будет падать с ошибкой 500.

1. Открой Supabase → **SQL Editor → New Query**
2. Скопируй и выполни содержимое файла `supabase/migrations/001_initial_schema.sql`
3. Затем выполни `supabase/migrations/002_auth_trigger.sql`

**Проверка** — в **Table Editor** должны появиться таблицы:
- `tenants`
- `tenant_users`
- `telegram_users`
- `saved_tenders`
- `payments`

---

## Шаг 3. Тест авторизации (email + password)

### Регистрация
1. Открой `/register`
2. Заполни форму → нажми «Зарегистрироваться»
3. Должен появиться toast: «Проверьте почту для подтверждения регистрации»
4. В почте придёт письмо от Supabase
5. Кликни ссылку → должен открыться твой домен `/api/auth/callback?code=...`
6. Автоматический редирект на `/onboarding`

**Если редиректит не туда** → проверь `NEXT_PUBLIC_APP_URL` в Amvera (должен совпадать с доменом без слеша).

### Вход
1. Открой `/login`
2. Введи email и пароль → нажми «Войти»
3. Первый раз → `/onboarding`, повторно → `/dashboard`

### Что смотреть в логах Amvera
```
GET /api/auth/callback?code=xxx  →  302 /onboarding  ✓
GET /dashboard                   →  200              ✓
```

Если `GET /api/auth/callback → 500`:
- Проверь `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Убедись, что миграции применены (Шаг 2)

---

## Шаг 4. Тест авторизации (Google OAuth)

1. Открой Supabase → **Authentication → Providers → Google** → включи
2. Создай OAuth-приложение в [Google Cloud Console](https://console.cloud.google.com):
   - **Authorized redirect URIs**: `https://ВАШ_ПРОЕКТ.supabase.co/auth/v1/callback`
3. Скопируй Client ID и Client Secret в Supabase → Google provider
4. В приложении нажми «Войти через Google» → пройди OAuth → попадёшь на `/onboarding`

---

## Шаг 5. Тестовая оплата ЮKassa

### Настройка тестового магазина
1. Зарегистрируйся на [yookassa.ru](https://yookassa.ru) → создай тестовый магазин
2. **Настройки → Интеграция → API**:
   - Скопируй `shopId` → `YUKASSA_SHOP_ID` в Amvera
   - Скопируй секретный ключ (начинается с `test_`) → `YUKASSA_SECRET_KEY` в Amvera
3. **Настройки → HTTP-уведомления**:
   - URL: `https://job-3-vladis-XYZ.amvera.io/api/billing/webhook`
   - Включи событие `payment.succeeded`
   - Скопируй секрет → `YUKASSA_WEBHOOK_SECRET` в Amvera

### Тест оплаты в браузере
1. Войди в приложение → `/dashboard/settings/subscription`
2. Нажми «Выбрать» на любом тарифе
3. На странице ЮKassa введи тестовую карту:

   | Поле | Значение |
   |------|----------|
   | Номер карты | `5555 5555 5555 4444` |
   | Срок | Любой будущий, напр. `12/28` |
   | CVV | Любые 3 цифры, напр. `123` |
   | Имя | Любое |

4. После успешной оплаты → редирект на `/dashboard/settings/subscription?success=true`

### Проверка результата
- Supabase → **Table Editor → payments** — появилась строка со статусом `succeeded`
- Supabase → **Table Editor → tenants** — поле `plan` обновилось на выбранный тариф

### Ручное тестирование вебхука (без реальной оплаты)

> Временно убери `YUKASSA_WEBHOOK_SECRET` в Amvera, иначе запрос без подписи вернёт 401.

Найди свой `user_id`: Supabase → **Authentication → Users** → скопируй UUID.

```bash
curl -X POST https://job-3-vladis-XYZ.amvera.io/api/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment.succeeded",
    "object": {
      "id": "22d6d597-000f-5000-8000-145f2308e2ac",
      "amount": { "value": "10000.00", "currency": "RUB" },
      "metadata": {
        "user_id": "ВАШ_USER_ID_ИЗ_SUPABASE",
        "plan": "starter",
        "period": "monthly"
      }
    }
  }'
```

Ожидаемый ответ: `{"ok":true}`

---

## Шаг 6. Отладка Telegram-бота

### Запуск бота (локально)
```bash
cd bot
pip install -r requirements.txt
TELEGRAM_BOT_TOKEN=ВАШ_ТОКЕН \
NEXT_PUBLIC_SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
FLASK_BACKEND_URL=http://localhost:5000 \
python -m bot.main
```

### Привязка аккаунта
1. В приложении открой `/dashboard/settings` → раздел «Telegram»
2. Нажми «Подключить» → получи 6-значный код
3. Открой бота в Telegram → `/start connect_КОД`
4. Бот ответит: «✅ Аккаунт успешно привязан»

---

## Типичные ошибки и решения

| Симптом | Причина | Решение |
|---------|---------|---------|
| После клика в письме — белый экран / 404 | Redirect URL не добавлен в Supabase | Шаг 1 |
| Вход работает, но `/dashboard` → 500 | Нет таблиц в БД | Шаг 2 |
| «Billing not configured» при оплате | `YUKASSA_SHOP_ID` или `YUKASSA_SECRET_KEY` не заданы | Проверь Amvera |
| Вебхук возвращает 401 | Подпись не совпадает | Убедись, что `YUKASSA_WEBHOOK_SECRET` совпадает с тем, что в ЮKassa |
| Тариф не обновляется после оплаты | Вебхук не доходит до сервера | Проверь URL вебхука в ЮKassa, логи Amvera |
| Google OAuth → «redirect_uri_mismatch» | В Google Console не добавлен Supabase callback URI | Шаг 4 |
| `location.origin is not defined` | Устаревший код (до фикса) | Уже исправлено в репозитории |
