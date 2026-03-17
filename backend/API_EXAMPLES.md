# 📡 API ПРИМЕРЫ

Примеры запросов к Backend API

---

## 🔐 АВТОРИЗАЦИЯ

### 1. Login (Вход)

**POST** `http://localhost:3001/api/auth/login`

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "created_at": "2026-03-17T12:00:00.000Z"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Неверный логин или пароль",
  "code": "INVALID_CREDENTIALS"
}
```

---

### 2. Get Current User (Текущий пользователь)

**GET** `http://localhost:3001/api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

---

### 3. Logout (Выход)

**POST** `http://localhost:3001/api/auth/logout`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Успешный выход"
}
```

---

## 👥 ПОЛЬЗОВАТЕЛИ (только для админов)

### 1. Получить всех пользователей

**GET** `http://localhost:3001/api/users`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "role": "admin",
        "created_at": "2026-03-17T12:00:00.000Z",
        "updated_at": "2026-03-17T12:00:00.000Z"
      },
      {
        "id": 2,
        "username": "user",
        "role": "user",
        "created_at": "2026-03-17T12:00:00.000Z",
        "updated_at": "2026-03-17T12:00:00.000Z"
      }
    ],
    "total": 2
  }
}
```

---

### 2. Получить пользователя по ID

**GET** `http://localhost:3001/api/users/1`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "created_at": "2026-03-17T12:00:00.000Z",
      "updated_at": "2026-03-17T12:00:00.000Z"
    }
  }
}
```

---

### 3. Создать пользователя

**POST** `http://localhost:3001/api/users`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 3,
      "username": "newuser",
      "role": "user",
      "created_at": "2026-03-17T12:00:00.000Z"
    }
  }
}
```

---

### 4. Обновить пользователя

**PUT** `http://localhost:3001/api/users/3`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "username": "updateduser",
  "password": "newpassword123",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 3,
      "username": "updateduser",
      "role": "admin",
      "updated_at": "2026-03-17T12:30:00.000Z"
    }
  }
}
```

---

### 5. Удалить пользователя

**DELETE** `http://localhost:3001/api/users/3`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Пользователь удален"
}
```

---

## 🧪 ТЕСТИРОВАНИЕ

### С помощью curl:

#### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

#### Get Users (с токеном):
```bash
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### С помощью Postman:

1. **Создайте новый запрос**
2. **Метод:** POST
3. **URL:** `http://localhost:3001/api/auth/login`
4. **Headers:** `Content-Type: application/json`
5. **Body → raw → JSON:**
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
6. **Send** - получите токен
7. **Скопируйте токен**
8. Для других запросов добавьте Header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_TOKEN`

---

### С помощью JavaScript (fetch):

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123',
    }),
  });
  
  const data = await response.json();
  const token = data.data.token;
  
  // Сохраните токен
  localStorage.setItem('token', token);
  
  return token;
};

// Get Users
const getUsers = async (token) => {
  const response = await fetch('http://localhost:3001/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  return data.data.users;
};

// Использование
const token = await login();
const users = await getUsers(token);
console.log(users);
```

---

## 🔒 КОДЫ ОШИБОК

### Авторизация:
- `NO_TOKEN` - Токен не предоставлен
- `INVALID_TOKEN` - Недействительный токен
- `USER_NOT_FOUND` - Пользователь не найден
- `INVALID_CREDENTIALS` - Неверный логин или пароль
- `MISSING_CREDENTIALS` - Не указаны username/password
- `UNAUTHORIZED` - Требуется авторизация
- `FORBIDDEN` - Недостаточно прав

### Пользователи:
- `MISSING_FIELDS` - Не указаны обязательные поля
- `PASSWORD_TOO_SHORT` - Пароль слишком короткий
- `USERNAME_EXISTS` - Username уже занят
- `INVALID_ROLE` - Неверная роль

---

## 💡 СОВЕТЫ

1. **Сохраняйте токен** в localStorage или sessionStorage
2. **Добавляйте токен** к каждому запросу в Header `Authorization: Bearer TOKEN`
3. **Обрабатывайте ошибки** 401 (не авторизован) и 403 (нет прав)
4. **При 401** перенаправляйте на страницу логина
5. **Токен живет 24 часа** (настраивается в JWT_EXPIRES_IN)

---

## 🎯 ГОТОВЫЕ УЧЕТНЫЕ ЗАПИСИ

После `npm run migrate` доступны:

| Username | Password   | Role  |
|----------|------------|-------|
| admin    | admin123   | admin |
| user     | user123    | user  |

---

## 🚀 СЛЕДУЮЩИЕ ЭТАПЫ

- ✅ Авторизация - ГОТОВО!
- ✅ Управление пользователями - ГОТОВО!
- ⏳ Станции и метрики
- ⏳ Данные из InfluxDB
- ⏳ Экспорт в Excel
- ⏳ Логи системы

---

**Тестируйте API!** 🎉
