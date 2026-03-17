# Очистка кэша ts-node

Если вы видите ошибки TypeScript, которые должны быть исправлены, попробуйте:

## Windows:

```bash
# Остановите nodemon (Ctrl+C)

# Удалите папку с кэшем ts-node
rmdir /s /q node_modules\.cache

# Или если первая команда не работает:
rd /s /q node_modules\.cache

# Перезапустите
npm run dev
```

## Linux/Mac:

```bash
# Остановите nodemon (Ctrl+C)

# Удалите кэш
rm -rf node_modules/.cache

# Перезапустите
npm run dev
```

## Альтернатива:

Просто перезапустите nodemon, набрав `rs` в терминале где он работает.

```bash
rs
```

## Если ничего не помогает:

```bash
# Остановите nodemon
# Удалите node_modules
rm -rf node_modules

# Переустановите зависимости
npm install

# Запустите снова
npm run dev
```
