import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

/**
 * Creates a new QueryClient instance with custom configuration
 *
 * Configuration:
 * - staleTime: 30 seconds (data considered fresh for 30s)
 * - dehydrate: Serialize data with SuperJSON, include pending queries
 * - hydrate: Deserialize data with SuperJSON
 *
 * SuperJSON handles serialization of:
 * - Dates
 * - BigInt
 * - Map, Set
 * - undefined
 * - RegExp
 * - Error instances
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // Use SuperJSON for serialization (handles Date, BigInt, etc.)
        serializeData: superjson.serialize,
        // Dehydrate successful and pending queries
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        // Use SuperJSON for deserialization
        deserializeData: superjson.deserialize,
      },
    },
  });
}
