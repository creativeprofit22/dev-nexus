# tRPC Quick Start Guide

Fast setup guide to integrate tRPC into Dev Nexus.

## 1. Add Provider to Root Layout

Update `/mnt/e/Projects/dev-nexus/src/app/layout.tsx`:

```typescript
import { TRPCReactProvider } from "@/core/trpc";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

## 2. Test Health Check Endpoint

Create test page at `/mnt/e/Projects/dev-nexus/src/app/test-trpc/page.tsx`:

```typescript
"use client";

import { useTRPC } from "@/core/trpc";

export default function TestTRPCPage() {
  const { data: health, isLoading: healthLoading } =
    useTRPC().healthcheck.useQuery();

  const { data: hello, isLoading: helloLoading } =
    useTRPC().hello.useQuery({ name: "Dev Nexus" });

  if (healthLoading || helloLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">tRPC Test</h1>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Health Check:</h2>
          <pre>{JSON.stringify(health, null, 2)}</pre>
        </div>

        <div>
          <h2 className="font-semibold">Hello Query:</h2>
          <pre>{JSON.stringify(hello, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
```

## 3. Run Dev Server

```bash
cd /mnt/e/Projects/dev-nexus
npm run dev
```

Visit: `http://localhost:3000/test-trpc`

Expected output:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T01:31:00.000Z"
}

{
  "greeting": "Hello Dev Nexus!"
}
```

## 4. Create Your First Module Router

Create snippets router at `/mnt/e/Projects/dev-nexus/src/modules/snippets/api/router.ts`:

```typescript
import { router, publicProcedure } from "@/core/trpc";
import { z } from "zod";
import { snippets } from "@/core/db/schema";
import { eq } from "drizzle-orm";

export const snippetsRouter = router({
  /**
   * List all snippets
   */
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.snippets.findMany({
        limit: input.limit,
        orderBy: (snippets, { desc }) => [desc(snippets.createdAt)],
      });
    }),

  /**
   * Get single snippet by ID
   */
  byId: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.snippets.findFirst({
        where: eq(snippets.id, input.id),
      });
    }),

  /**
   * Create new snippet
   */
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      code: z.string().min(1),
      language: z.string(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [snippet] = await ctx.db
        .insert(snippets)
        .values(input)
        .returning();

      return snippet;
    }),

  /**
   * Update snippet
   */
  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      code: z.string().min(1).optional(),
      language: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const [updated] = await ctx.db
        .update(snippets)
        .set(data)
        .where(eq(snippets.id, id))
        .returning();

      return updated;
    }),

  /**
   * Delete snippet
   */
  delete: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(snippets)
        .where(eq(snippets.id, input.id));

      return { success: true };
    }),
});
```

## 5. Register Module Router

Update `/mnt/e/Projects/dev-nexus/src/core/trpc/router.ts`:

```typescript
import { z } from "zod";
import { publicProcedure, router } from "./init";
import { snippetsRouter } from "@/modules/snippets/api/router";

export const appRouter = router({
  // Health check and test endpoints
  healthcheck: publicProcedure.query(() => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  })),

  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => ({
      greeting: `Hello ${input.name ?? "World"}!`,
    })),

  // Module routers
  snippets: snippetsRouter,
});

export type AppRouter = typeof appRouter;
```

## 6. Use in Components

### Client Component (Query)

```typescript
"use client";

import { useTRPC } from "@/core/trpc";

export function SnippetList() {
  const { data, isLoading, error } = useTRPC().snippets.list.useQuery({
    limit: 20,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(snippet => (
        <div key={snippet.id}>
          <h3>{snippet.title}</h3>
          <pre>{snippet.code}</pre>
        </div>
      ))}
    </div>
  );
}
```

### Client Component (Mutation)

```typescript
"use client";

import { useTRPC } from "@/core/trpc";

export function CreateSnippetForm() {
  const utils = useTRPC().useUtils();

  const { mutate, isPending } = useTRPC().snippets.create.useMutation({
    onSuccess: () => {
      utils.snippets.list.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutate({
      title: formData.get("title") as string,
      code: formData.get("code") as string,
      language: formData.get("language") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" required />
      <textarea name="code" placeholder="Code" required />
      <input name="language" placeholder="Language" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### Server Component (Prefetch)

```typescript
import { trpc, prefetch, HydrateClient } from "@/core/trpc/server";
import { SnippetList } from "./snippet-list";

export default async function SnippetsPage() {
  // Prefetch on server
  prefetch(trpc.snippets.list.queryOptions({ limit: 20 }));

  return (
    <HydrateClient>
      <div>
        <h1>Code Snippets</h1>
        <SnippetList />
      </div>
    </HydrateClient>
  );
}
```

## Common Patterns

### Optimistic Updates

```typescript
const { mutate } = useTRPC().snippets.update.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await utils.snippets.byId.cancel();

    // Snapshot previous value
    const previous = utils.snippets.byId.getData({ id: newData.id });

    // Optimistically update
    utils.snippets.byId.setData({ id: newData.id }, (old) => ({
      ...old!,
      ...newData,
    }));

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.snippets.byId.setData(
      { id: newData.id },
      context?.previous
    );
  },
  onSettled: () => {
    // Refetch after success or error
    utils.snippets.byId.invalidate();
  },
});
```

### Infinite Query

```typescript
const { data, fetchNextPage, hasNextPage } =
  useTRPC().snippets.list.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
```

### Error Handling

```typescript
const { data, error } = useTRPC().snippets.list.useQuery(
  { limit: 10 },
  {
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error("Query failed:", error);
      toast.error(error.message);
    },
  }
);
```

## Debugging

### Enable tRPC Logs

Add to `/mnt/e/Projects/dev-nexus/src/core/trpc/init.ts`:

```typescript
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
    errorFormatter({ shape }) {
      return shape;
    },
    // Add this for debugging
    isDev: process.env.NODE_ENV === "development",
  });
```

### Check Network Tab

1. Open DevTools > Network
2. Filter by "trpc"
3. Inspect request/response payloads

### Server-Side Logging

Add to procedures:

```typescript
query: publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    console.log("[tRPC] snippets.byId called with:", input);
    const result = await ctx.db.query.snippets.findFirst({
      where: eq(snippets.id, input.id),
    });
    console.log("[tRPC] snippets.byId result:", result);
    return result;
  }),
```

## Next Steps

1. ✅ Add TRPCReactProvider to layout
2. ✅ Test health check endpoint
3. Create module routers (snippets, projects, tags)
4. Add error boundaries
5. Implement loading states
6. Add authentication (Phase 2)

## Troubleshooting

### "Module not found" error

Make sure tsconfig paths are configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Type errors in components

Restart TypeScript server in VS Code:
- Cmd/Ctrl + Shift + P
- "TypeScript: Restart TS Server"

### "db is not defined" error

Check that Drizzle client is exported from `/mnt/e/Projects/dev-nexus/src/core/db/client.ts`

### Queries not refetching

Check React Query DevTools:
```bash
npm install @tanstack/react-query-devtools
```

Add to layout:
```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<TRPCReactProvider>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</TRPCReactProvider>
```

## Resources

- [tRPC Docs](https://trpc.io)
- [React Query Docs](https://tanstack.com/query/latest)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Zod Docs](https://zod.dev)

## Complete File List

Created files:
- `/mnt/e/Projects/dev-nexus/src/core/trpc/init.ts`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/router.ts`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/client.tsx`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/server.tsx`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/utils.ts`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/query-client.ts`
- `/mnt/e/Projects/dev-nexus/src/core/trpc/index.ts`
- `/mnt/e/Projects/dev-nexus/src/app/api/trpc/[trpc]/route.ts`
