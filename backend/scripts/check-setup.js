#!/usr/bin/env node

/**
 * СКРИПТ ПРОВЕРКИ НАСТРОЙКИ
 * Проверяет что все правильно настроено перед запуском
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка настройки backend...\n');

let hasErrors = false;

// Проверка Node.js версии
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

console.log(`📦 Node.js версия: ${nodeVersion}`);
if (majorVersion < 18) {
  console.error('   ❌ Требуется Node.js v18 или выше!');
  hasErrors = true;
} else {
  console.log('   ✅ Версия подходит');
}

// Проверка package.json
console.log('\n📄 package.json:');
if (fs.existsSync('package.json')) {
  console.log('   ✅ Найден');
  
  // Проверка node_modules
  if (fs.existsSync('node_modules')) {
    console.log('   ✅ node_modules установлены');
  } else {
    console.log('   ⚠️  node_modules не найдены. Запустите: npm install');
    hasErrors = true;
  }
} else {
  console.log('   ❌ Не найден');
  hasErrors = true;
}

// Проверка .env файла
console.log('\n🔐 Файл .env:');
if (fs.existsSync('.env')) {
  console.log('   ✅ Найден');
  
  // Проверка обязательных переменных
  const envContent = fs.readFileSync('.env', 'utf-8');
  const requiredVars = [
    'INFLUX_URL',
    'INFLUX_TOKEN',
    'INFLUX_ORG',
    'JWT_SECRET',
  ];
  
  let missingVars = [];
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (!regex.test(envContent)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('   ⚠️  Не заполнены переменные:');
    missingVars.forEach(varName => {
      console.log(`      - ${varName}`);
    });
    hasErrors = true;
  } else {
    console.log('   ✅ Все обязательные переменные заполнены');
  }
  
  // Проверка JWT_SECRET
  const jwtSecretMatch = envContent.match(/^JWT_SECRET=(.+)$/m);
  if (jwtSecretMatch) {
    const secret = jwtSecretMatch[1].trim();
    if (secret.length < 32) {
      console.log('   ⚠️  JWT_SECRET слишком короткий (минимум 32 символа)');
    }
    if (secret.includes('change') || secret.includes('example')) {
      console.log('   ⚠️  JWT_SECRET не изменен! Используйте уникальную строку');
    }
  }
  
} else {
  console.log('   ❌ Не найден');
  console.log('   💡 Создайте файл: cp .env.example .env');
  hasErrors = true;
}

// Проверка директорий
console.log('\n📁 Директории:');

const dirs = ['src', 'src/config', 'src/types'];
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✅ ${dir}`);
  } else {
    console.log(`   ❌ ${dir} не найдена`);
    hasErrors = true;
  }
});

// Проверка важных файлов
console.log('\n📝 Важные файлы:');

const files = [
  'tsconfig.json',
  'nodemon.json',
  'src/server.ts',
  'src/app.ts',
  'src/config/env.ts',
  'src/config/database.ts',
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} не найден`);
    hasErrors = true;
  }
});

// Проверка базы данных
console.log('\n🗄️  База данных:');
if (fs.existsSync('data/monitoring.db')) {
  console.log('   ✅ База данных создана');
  console.log('   💡 Для пересоздания: npm run migrate reset');
} else {
  console.log('   ⚠️  База данных не создана');
  console.log('   💡 Запустите: npm run migrate');
}

// Итог
console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ ЕСТЬ ПРОБЛЕМЫ! Исправьте их перед запуском.\n');
  console.log('📚 Инструкция по настройке: SETUP.md');
  console.log('⚡ Быстрый старт: QUICK_START.md\n');
  process.exit(1);
} else {
  console.log('✅ ВСЕ ГОТОВО К ЗАПУСКУ!\n');
  console.log('Запуск сервера:');
  console.log('  npm run dev      # Development режим');
  console.log('  npm run build    # Production сборка');
  console.log('  npm start        # Production запуск\n');
  console.log('Открыть: http://localhost:3001\n');
  process.exit(0);
}
