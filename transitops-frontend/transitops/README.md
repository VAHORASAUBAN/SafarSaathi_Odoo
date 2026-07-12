# TransitOps — Smart Transport Operations Platform

React + Vite frontend implementing the full brief: RBAC authentication, dashboard KPIs,
vehicle registry, driver profiles, trip dispatcher, maintenance workflow, fuel & expense
tracking, and reports & analytics — with the mandatory business rules enforced in
`src/utils/businessRules.js`.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. Data lives in `localStorage`, so nothing to configure.

## Demo logins

Password for all: `demo1234`

| Role | Email |
|---|---|
| Fleet Manager | fleet@transitops.in |
| Dispatcher | dispatch@transitops.in |
| Safety Officer | safety@transitops.in |
| Financial Analyst | finance@transitops.in |

The login screen has one-tap buttons that fill these in for you.

## What's wired up

- **RBAC**: `src/data/seed.js` → `PERMISSIONS` defines full/view/none per role per module.
  Sidebar hides or badges modules accordingly; `RequireModule` blocks direct navigation.
- **Business rules**: unique reg. no., capacity vs. cargo weight, expired-license/suspended
  driver blocking, on-trip vehicles/drivers excluded from dispatch, automatic status
  transitions on dispatch/complete/cancel and on maintenance open/close.
- **Analytics**: fuel efficiency, fleet utilization, operational cost (fuel + maintenance),
  and vehicle ROI computed live from the in-memory data; CSV export included.
- **Not implemented** (bonus items in the brief): PDF export, email reminders for expiring
  licenses, document uploads, dark-mode toggle (the whole UI is dark by design).

## Stack

React 18, React Router, Tailwind CSS, Recharts, lucide-react icons.
