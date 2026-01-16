# tRPC Infrastructure Setup

Complete tRPC setup for Dev Nexus with Drizzle ORM integration and modular router architecture.

## Architecture Overview

```
src/
├── core/
│   └── trpc/
│       ├── init.ts          # Context, procedure builders, middleware
│       ├── router.ts        # Main app router (merges module routers)
│       ├── client.tsx       # React Query + tRPC client provider
│       ├── server.tsx       # Server-side utilities (prefetch, hydration)
│       ├── utils.ts         # tRPC React hooks
│       ├── query-client.ts  # QueryClient factory with SuperJSON
│       └── index.ts         # Central exports
└── app/
    └── api/
        └── trpc/
            └── [trpc]/
                └── route.ts # Next.js API route handler
```

## File Descriptions

### 1. `init.ts` - Core tRPC Setup

**Purpose**: Creates tRPC context, initializes tRPC instance, defines procedure builders

**Key Features**:
- Context includes Drizzle `db` client (not Prisma)
- Future-proofed for authentication (commented out for Phase 1)
- SuperJSON transformer for complex types (Date, BigInt, etc.)
- Error formatting
- Public and protected procedure builders

**Context Structure**:
```typescript
{
  db: DrizzleDB,        // ✅ Phase 1
  // session: Session,  // Phase 2
  // user: User         // Phase 2
}
```

### 2. `router.ts` - Main Application Router

**Purpose**: Root router that merges all module routers

**Current Structure**:
- `healthcheck` - Basic health check endpoint
- `hello` - Example query with Zod validation

**Phase 1 Module Routers** (to be added):
```typescript
export const appRouter = router({
  snippets: snippetsRouter,      // Code snippet operations
  projects: projectsRouter,      // Project management
  tags: tagsRouter,              // Tag operations
  analytics: analyticsRouter,    // Usage stats
});
```

### 3. `client.tsx` - React Client Provider

**Purpose**: Client-side tRPC provider with React Query integration

**Features**:
- HTTP batch link (batches multiple requests)
- SuperJSON serialization
- Singleton query client for browser
- New client per request for server

**Usage**:
```typescript
// In src/app/layout.tsx
import { TRPCReactProvider } from "@/core/trpc";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

### 4. `server.tsx` - Server-Side Utilities

**Purpose**: Server-side tRPC client, prefetch utilities, hydration

**Exports**:
- `trpc` - Server-side tRPC client
- `prefetch()` - Prefetch query data
- `HydrateClient` - Transfer server data to client
- `getQueryClient()` - Get QueryClient instance

**Usage**:
```typescript
// In Server Component
import { trpc, prefetch, HydrateClient } from "@/core/trpc/server";

export default async function SnippetsPage() {
  // Prefetch data on server
  prefetch(trpc.snippets.list.queryOptions({ limit: 10 }));

  return (
    <HydrateClient>
      <SnippetList />
    </HydrateClient>
  );
}
```

### 5. `utils.ts` - React Hooks

**Purpose**: Type-safe React hooks from AppRouter

**Exports**:
- `TRPCProvider` - Context provider
- `useTRPC()` - Access tRPC client
- `useTRPCClient()` - Access raw client

### 6. `query-client.ts` - QueryClient Factory

**Purpose**: Creates QueryClient with SuperJSON serialization

**Configuration**:
- Stale time: 30 seconds
- Dehydrate/hydrate with SuperJSON
- Includes pending queries in dehydration

### 7. `route.ts` - API Route Handler

**Purpose**: Next.js 15 App Router handler for tRPC requests

**Endpoint**: `/api/trpc/*`

**Features**:
- Handles GET and POST
- Error logging in development
- Batching support

## Usage Examples

### Client Component - Query

```typescript
"use client";

import { useTRPC } from "@/core/trpc";

export function SnippetList() {
  const { data, isLoading } = useTRPC().snippets.list.useQuery({
    limit: 10,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(snippet => (
        <div key={snippet.id}>{snippet.title}</div>
      ))}
    </div>
  );
}
```

### Client Component - Mutation

```typescript
"use client";

import { useTRPC } from "@/core/trpc";

export function CreateSnippet() {
  const utils = useTRPC().useUtils();
  const { mutate } = useTRPC().snippets.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.snippets.list.invalidate();
    },
  });

  const handleCreate = () => {
    mutate({
      title: "New Snippet",
      code: "console.log('hello');",
      language: "javascript",
    });
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

### Server Component - Prefetch

```typescript
import { trpc, prefetch, HydrateClient } from "@/core/trpc/server";

export default async function Page() {
  // Prefetch data on server
  prefetch(trpc.snippets.list.queryOptions());

  // Or fetch directly
  const data = await trpc.snippets.list.query();

  return (
    <HydrateClient>
      <div>{data.length} snippets</div>
    </HydrateClient>
  );
}
```

### Creating Module Router

```typescript
// src/modules/snippets/api/router.ts
import { router, publicProcedure } from "@/core/trpc";
import { z } from "zod";

export const snippetsRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // ctx.db is Drizzle client
      return await ctx.db.query.snippets.findMany({
        limit: input.limit ?? 10,
      });
    }),

  create: publicProcedure
    .input(z.object({
      title: z.string(),
      code: z.string(),
      language: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(snippets).values(input);
    }),
});
```

### Merging Module Routers

```typescript
// src/core/trpc/router.ts
import { router } from "./init";
import { snippetsRouter } from "@/modules/snippets/api/router";
import { projectsRouter } from "@/modules/projects/api/router";

export const appRouter = router({
  snippets: snippetsRouter,
  projects: projectsRouter,

  // Existing test endpoints
  healthcheck: publicProcedure.query(() => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  })),
});
```

## Key Differences from Boilerplate

### ✅ Drizzle ORM Instead of Prisma

**Boilerplate** (Prisma):
```typescript
import { db } from "@/lib/db"; // Prisma client
```

**Dev Nexus** (Drizzle):
```typescript
import { db } from "@/core/db/client"; // Drizzle client
```

### ✅ No Authentication in Phase 1

**Context** (Phase 1):
```typescript
return {
  db,
  // session and user commented out
};
```

**Context** (Phase 2 - future):
```typescript
return {
  db,
  session: await auth(),
  user: session?.user,
};
```

### ✅ Modular Router Architecture

**Preparation for module routers**:
- Router structure designed for module merging
- Comments show where to add module routers
- Example structure provided

## Testing the Setup

### 1. Test Health Check

```bash
# Using curl
curl http://localhost:3000/api/trpc/healthcheck

# Expected response
{"status":"ok","timestamp":"2025-01-15T01:31:00.000Z"}
```

### 2. Test Hello Query

```bash
curl "http://localhost:3000/api/trpc/hello?input=%7B%22name%22%3A%22Claude%22%7D"

# Expected response
{"greeting":"Hello Claude!"}
```

### 3. Test in Component

```typescript
// Create test page: src/app/test/page.tsx
"use client";

import { useTRPC } from "@/core/trpc";

export default function TestPage() {
  const { data } = useTRPC().healthcheck.useQuery();
  const { data: hello } = useTRPC().hello.useQuery({ name: "Dev Nexus" });

  return (
    <div>
      <p>Status: {data?.status}</p>
      <p>Greeting: {hello?.greeting}</p>
    </div>
  );
}
```

## Next Steps

1. **Add TRPCReactProvider to layout.tsx**
2. **Create module routers** (snippets, projects, tags)
3. **Test endpoints** with health check
4. **Add error boundaries** for better UX
5. **Phase 2: Add authentication** (uncomment auth code)

## Error Handling

### Client-Side

```typescript
const { data, error } = useTRPC().snippets.list.useQuery();

if (error) {
  return <div>Error: {error.message}</div>;
}
```

### Server-Side

```typescript
try {
  const data = await trpc.snippets.list.query();
} catch (error) {
  console.error("tRPC error:", error);
}
```

## Performance Considerations

1. **Batching**: Multiple queries in one request
2. **Caching**: 30s stale time by default
3. **Prefetching**: Server-side data loading
4. **Hydration**: Transfer server data to client
5. **SuperJSON**: Efficient serialization

## Future Authentication Setup

When adding authentication in Phase 2:

1. **Uncomment in init.ts**:
```typescript
const session = await auth();
return { db, session, user: session?.user };
```

2. **Uncomment protectedProcedure**:
```typescript
if (!ctx.session || !ctx.user) {
  throw new TRPCError({ code: "UNAUTHORIZED" });
}
```

3. **Use in routers**:
```typescript
delete: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // ctx.user is guaranteed to exist
    return await ctx.db.delete(snippets)
      .where(eq(snippets.id, input.id))
      .where(eq(snippets.userId, ctx.user.id));
  }),
```

## Files Created

- `/mnt/e/Projects/dev-nexus/src/core/trpc/init.ts`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/router.ts`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/client.tsx`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/server.tsx`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/utils.ts`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/query-client.ts`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/index.ts`
- `/mnt/e/Projects/dev-nexus/src/app/api/trpc/[trpc]/route.ts`
- `/mnt/e/Projects/dev-nexus/docs/trpc-setup.md` (this file)

## Summary

Complete tRPC infrastructure setup with:
- ✅ Drizzle ORM integration
- ✅ SuperJSON serialization
- ✅ Modular router architecture
- ✅ Future-proofed for authentication
- ✅ Server-side prefetching
- ✅ Client-side type-safe hooks
- ✅ Request batching
- ✅ Error handling
- ✅ Next.js 15 App Router compatibility
