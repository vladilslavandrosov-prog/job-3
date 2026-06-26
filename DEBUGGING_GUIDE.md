# TenderIntel — Инструкция по отладке и развёртыванию

> Обновлено: 2026-06-26. Этот гайд описывает ПОЛНЫЙ путь поднятия проекта с нуля на любом PaaS (Amvera, Render, Railway и т.п.), включая все баги, найденные и исправленные в проде.

---

## Что было исправлено в коде (уже в репозитории)

| # | Файл | Проблема | Исправление |
|---|------|----------|-------------|
| 1 | `app/(auth)/login/page.tsx` | `location.origin` ломается при SSR | Заменено на `NEXT_PUBLIC_APP_URL` |
| 2 | `app/(auth)/register/page.tsx` | `location.origin` ломается при SSR | Заменено на `NEXT_PUBLIC_APP_URL` |
| 3 | `app/(auth)/reset-password/page.tsx` | `location.origin` ломается при SSR | Заменено на `NEXT_PUBLIC_APP_URL` |
| 4 | `app/api/billing/webhook/route.ts` | Годовая подписка истекала через 1 месяц | `yearly → +12 месяцев` |
| 5 | `supabase/migrations/001_initial_schema.sql` (исходная) | RLS-политика `tenant_users` рекурсивно запрашивала саму себя → `infinite recursion detected in policy` | См. миграцию `003_fix_tenant_users_rls_recursion.sql` — обязательно применить |
| 6 | `lib/tenant.ts` | Anon-клиент не может INSERT в `tenants`/`tenant_users` из-за RLS | `getOrCreateTenant` использует `createServiceClient()` (service role) для создания тенанта |
| 7 | `app/api/billing/webhook/route.ts` | Проверка подписи вебхука по заголовку `x-yukassa-signature`, которого ЮKassa никогда не отправляет → все настоящие уведомления отклонялись с 401 | Проверка удалена. **ЮKassa не подписывает вебхуки** — в проде ограничивай доступ через IP-вайтлист ЮKassa, не через секрет |
| 8 | `app/api/billing/checkout/route.ts` | Платёж не передавал `capture: true` → зависал в `waiting_for_capture`, `payment.succeeded` никогда не наступал, тариф не обновлялся | Добавлен `capture: true` в тело запроса создания платежа |
| 9 | `app/(auth)/register/page.tsx` | Supabase не сообщает о дубликате email (anti-enumeration) — регистрация "тихо" не давала ошибки | Проверка `data.user.identities?.length === 0` → показывает «Этот email уже зарегистрирован» |

---

## Переменные окружения Amvera

Все переменные задаются в панели Amvera → твой проект → **Переменные**.

| Переменная | Где взять | Пример значения |
|------------|-----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role | `eyJhbGciOiJIUzI1NiIs...` |
| `YUKASSA_SHOP_ID` | ЮKassa → Настройки → Интеграция → Ключи API → shopId | `381764` |
| `YUKASSA_SECRET_KEY` | ЮKassa → Настройки → Интеграция → Ключи API → Секретный ключ | `test_abc123...` |
| `NEXT_PUBLIC_APP_URL` | Твой домен на хостинге (без слеша в конце) | `https://job-3-vladis-XYZ.amvera.io` |
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

Выполни по очереди в Supabase → **SQL Editor → New Query**:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_auth_trigger.sql`
3. **`supabase/migrations/003_fix_tenant_users_rls_recursion.sql`** — ОБЯЗАТЕЛЬНО, без неё сохранение тендеров и создание тенанта упадёт с `infinite recursion detected in policy for relation "tenant_users"`

Эти файлы не применяются автоматически при деплое (Supabase CLI/migrations runner не подключён) — каждую миграцию нужно руками скопировать и выполнить в SQL Editor.

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
2. **Интеграция → Ключи API**:
   - Скопируй `shopId` → `YUKASSA_SHOP_ID` в Amvera
   - Скопируй секретный ключ (начинается с `test_`) → `YUKASSA_SECRET_KEY` в Amvera
3. **Интеграция → HTTP-уведомления → Изменить настройки**:
   - URL для уведомлений: `https://ВАШ_ДОМЕН/api/billing/webhook` (НЕ `/pricing`, легко перепутать!)
   - Включи события: `payment.succeeded`, `payment.waiting_for_capture`, `payment.canceled`, `refund.succeeded`
4. **ЮKassa не подписывает вебхуки секретом** — заголовка типа `x-yukassa-signature` не существует. Раньше в коде была проверка такой подписи — она ломала вообще все уведомления (всегда 401). Сейчас убрана. Если нужна защита от поддельных запросов в проде — делай через IP-вайтлист ЮKassa (список их IP в документации API), не через секрет.

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
| «Billing not configured» при оплате | `YUKASSA_SHOP_ID` или `YUKASSA_SECRET_KEY` не заданы | Проверь переменные окружения хостинга |
| Платёж висит в «Ожидает подтверждения» / `waiting_for_capture` | В `checkout/route.ts` не передан `capture: true` | Уже исправлено — проверь, что задеплоена последняя версия |
| Тариф не обновляется после оплаты, хотя статус «Оплачен» | Вебхук не доходит до сервера или URL неверный | В ЮKassa → Интеграция → Лог событий проверь, был ли запрос на `/api/billing/webhook` и какой код ответа; убедись, что URL в настройках — именно `/api/billing/webhook`, а не `/pricing` или другой |
| Сохранение тендеров / создание тенанта падает с `infinite recursion detected in policy for relation "tenant_users"` | Не применена миграция 003 | Выполни `supabase/migrations/003_fix_tenant_users_rls_recursion.sql` в Supabase SQL Editor |
| Google OAuth → «redirect_uri_mismatch» | В Google Console не добавлен Supabase callback URI | Шаг 4 |
| `location.origin is not defined` | Устаревший код (до фикса) | Уже исправлено в репозитории |
