MCUTrack/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Auto-generated migrations
│   └── seed.ts                # Initial data (roles, packages)
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx   # Login page
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   ├── page.tsx       # Real-time dashboard
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx   # Patient list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── visits/
│   │   │   │   ├── page.tsx   # Visit queue
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── results/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── departments/
│   │   │   │   ├── nursing/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── laboratory/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── radiology/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── doctor/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── packages/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   └── page.tsx   # Final MCU reports
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── users/
│   │   │       │   └── page.tsx
│   │   │       └── audit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── visits/
│   │   │   │   └── [id]/
│   │   │   │       └── workflow/
│   │   │   │           └── route.ts  # Workflow transitions
│   │   │   │
│   │   │   └── results/
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx         # Redirect to login/dashboard
│   │
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   └── form/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stats-card.tsx
│   │   │   ├── queue-board.tsx
│   │   │   └── department-status.tsx
│   │   │
│   │   ├── visits/
│   │   │   ├── visit-card.tsx
│   │   │   ├── step-tracker.tsx
│   │   │   ├── workflow-actions.tsx
│   │   │   └── result-forms/
│   │   │       ├── lab-form.tsx
│   │   │       ├── radiology-form.tsx
│   │   │       └── doctor-form.tsx
│   │   │
│   │   ├── patients/
│   │   │   ├── patient-form.tsx
│   │   │   └── patient-search.tsx
│   │   │
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── role-guard.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── auth.ts          # Auth utilities
│   │   ├── workflow.ts      # Workflow engine
│   │   ├── audit.ts         # Audit logging
│   │   ├── validators.ts    # Zod schemas
│   │   └── utils.ts         # Helper functions
│   │
│   ├── actions/             # Server Actions
│   │   ├── auth-actions.ts
│   │   ├── visit-actions.ts
│   │   ├── patient-actions.ts
│   │   ├── result-actions.ts
│   │   └── package-actions.ts
│   │
│   ├── types/
│   │   ├── index.ts         # Shared TypeScript types
│   │   └── workflow.ts
│   │
│   └── middleware.ts        # Route protection & role checks
│
├── .env
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
