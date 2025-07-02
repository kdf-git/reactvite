# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## New Landing Page

This project now includes a simple funnel to collect leads using MailerLite. To
enable it, provide your MailerLite API key and group ID in `.env`:

```
VITE_MAILERLITE_API_KEY=your-key
VITE_MAILERLITE_GROUP_ID=your-group-id
```

Visit `/chore-chart` to see the landing page. After submitting the form, users
are redirected to `/chore-chart/download` where they can download
`printable-chore-chart.pdf`.

