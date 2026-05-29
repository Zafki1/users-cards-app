# Users Cards App

Web-приложение для управления пользователями и их банковскими картами.

## Стек

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: Microsoft SQL Server
- DB driver: `mssql`

## Структура

```text
frontend/   React-приложение
backend/    REST API
database/   SQL-скрипты для MS SQL Server
```

## Требования

- Node.js 20+
- npm
- Microsoft SQL Server Express/Developer или доступ к уже существующему MS SQL Server
- SQL Server Management Studio или Azure Data Studio


## SQL-скрипты

```text
database/init.sql                      Полное локальное создание БД UsersCardsApp
database/schema.sql                    Создание таблиц в уже существующей БД
database/seed.sql                      Демо-данные, опционально
database/create-app-login.example.sql  Пример создания SQL-login для backend
```

`init.sql` удобен для локальной разработки: он создает базу `UsersCardsApp`, удаляет старые таблицы и создает их заново.

`schema.sql` лучше подходит для проверки работодателем: он не создает базу, не удаляет таблицы, а только создает нужную схему в выбранной БД, если таблиц еще нет.

## Вариант 1: локальный запуск с SQL Server Express

1. Установите Microsoft SQL Server Express или Developer.
2. Откройте SQL Server Configuration Manager.
3. Включите `TCP/IP` для `SQLEXPRESS`.
4. В `TCP/IP -> IP Addresses -> IPAll` задайте:

```text
TCP Dynamic Ports:
TCP Port: 1433
```

Поле `TCP Dynamic Ports` должно быть пустым.

5. Перезапустите службу `SQL Server (SQLEXPRESS)`.
6. Откройте SSMS или Azure Data Studio.
7. Подключитесь к `localhost\SQLEXPRESS`.
8. Выполните:

```text
database/init.sql
database/seed.sql
```

9. Создайте SQL-login для backend вручную или через:

```text
database/create-app-login.example.sql
```

## Вариант 2: проверка на уже существующем MS SQL Server

На уже настроенном SQL Server:

1. Создать пустую базу данных или выбрать уже подготовленную тестовую БД.
2. Открыть эту БД в SSMS/Azure Data Studio.
3. Выполнить:

```text
database/schema.sql
```

4. При необходимости выполнить демо-данные:

```text
database/seed.sql
```

5. Выдать backend-пользователю права на эту БД:

```text
db_datareader
db_datawriter
public
```

6. Указать параметры подключения в `backend/.env`.

## Настройка backend

```bash
cd backend
npm install
copy .env.example .env
```

Пример для локального SQL Server на порту `1433`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:5173

DB_SERVER=127.0.0.1
DB_INSTANCE=
DB_PORT=1433
DB_DATABASE=UsersCardsApp
DB_USER=users_cards_app_user
DB_PASSWORD=ChangeThisPassword123!
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

Если используется named instance, например `localhost\SQLEXPRESS`, можно указать:

```env
DB_SERVER=localhost
DB_INSTANCE=SQLEXPRESS
DB_PORT=
```

При использовании собственного сервера, нужно заменить только параметры подключения:

```env
DB_SERVER=адрес_сервера
DB_INSTANCE=
DB_PORT=1433
DB_DATABASE=имя_базы
DB_USER=логин
DB_PASSWORD=пароль
```

Запуск backend:

```bash
npm run dev
```

API:

```text
http://localhost:4000/api
```

Проверка:

```text
GET http://localhost:4000/api/health
```

## Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## REST API

```text
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

Пример тела запроса:

```json
{
  "fullName": "Алексеева Марина Олеговна",
  "birthDate": "1991-03-18",
  "workPlace": "ООО \"Северные Решения\"",
  "cards": [
    {
      "accountNumber": "40817810945230014567",
      "ownerNameLatin": "MARINA ALEKSEEVA",
      "expirationDate": "2028-08-31",
      "cvc": "274"
    }
  ]
}
```

