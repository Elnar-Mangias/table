# Доска+ — доска объявлений

Учебный проект на React + TypeScript + Vite.

## Запуск локально
```bash
npm ci
npm run dev
```

## Production-сборка
```bash
npm run build
```

## Публикация на GitHub Pages
1. Создай репозиторий `doska-obyavleniy-react` (или измени `base` в `vite.config.ts` под имя своего репозитория).
2. Загрузи содержимое этой папки в ветку `main`.
3. В Settings → Pages выбери **GitHub Actions**.
4. Workflow из `.github/workflows/pages.yml` соберёт и опубликует сайт.

Объявления загружаются и отправляются на учебный API `https://inai-col1.fishrungames.com`. Работа публикации зависит от доступности этого API.
