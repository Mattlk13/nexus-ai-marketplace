/**
 * Developer Tools tRPC Router
 * Exposes Unity Cloud Build, Eclipse Che, Maven, VirtualBox, and MCP registry
 * endpoints to the NEXUS frontend via tRPC.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getUnityBuilds,
  triggerUnityBuild,
  runMavenBuild,
  listVBoxVMs,
  getRegisteredMCPServers,
} from "../devtools";

export const devtoolsRouter = router({
  // -------------------------------------------------------------------------
  // MCP Server Registry (public — no auth required)
  // -------------------------------------------------------------------------
  listMCPServers: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
      })
    )
    .query(({ input }) => {
      const servers = getRegisteredMCPServers();
      if (input.category) {
        return servers.filter(s => s.category === input.category);
      }
      return servers;
    }),

  getMCPCategories: publicProcedure.query(() => {
    const servers = getRegisteredMCPServers();
    const categories = Array.from(new Set(servers.map(s => s.category))).sort();
    return categories;
  }),

  // -------------------------------------------------------------------------
  // Unity Cloud Build (protected — requires auth + Unity API key in env)
  // -------------------------------------------------------------------------
  getUnityBuilds: protectedProcedure
    .input(
      z.object({
        orgId: z.string().min(1),
        projectId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const apiKey = process.env.UNITY_API_KEY;
      if (!apiKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "UNITY_API_KEY environment variable not configured",
        });
      }

      try {
        return await getUnityBuilds(input.orgId, input.projectId, apiKey);
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Unity API error",
        });
      }
    }),

  triggerUnityBuild: protectedProcedure
    .input(
      z.object({
        orgId: z.string().min(1),
        projectId: z.string().min(1),
        buildTargetId: z.string().min(1),
        clean: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const apiKey = process.env.UNITY_API_KEY;
      if (!apiKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "UNITY_API_KEY environment variable not configured",
        });
      }

      try {
        return await triggerUnityBuild(
          input.orgId,
          input.projectId,
          input.buildTargetId,
          apiKey,
          { clean: input.clean }
        );
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err instanceof Error ? err.message : "Unity build trigger failed",
        });
      }
    }),

  // -------------------------------------------------------------------------
  // Maven Build (protected — runs on the server, requires Maven on PATH)
  // -------------------------------------------------------------------------
  runMavenBuild: protectedProcedure
    .input(
      z.object({
        projectPath: z.string().min(1).max(500),
        goals: z.array(z.string()).default(["clean", "package"]),
        skipTests: z.boolean().default(false),
        profiles: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Security: only allow paths within /tmp/maven-projects to prevent path traversal
      const safePath = input.projectPath
        .replace(/\.\./g, "")
        .replace(/[;|&$`]/g, "");
      if (
        !safePath.startsWith("/tmp/maven-projects/") &&
        !safePath.startsWith("./java-projects/")
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Project path must be within /tmp/maven-projects/ or ./java-projects/",
        });
      }

      try {
        return await runMavenBuild(safePath, input.goals, {
          skipTests: input.skipTests,
          profiles: input.profiles,
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Maven build failed",
        });
      }
    }),

  // -------------------------------------------------------------------------
  // VirtualBox VM Management (protected)
  // -------------------------------------------------------------------------
  listVMs: protectedProcedure.query(async () => {
    try {
      return await listVBoxVMs();
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err instanceof Error ? err.message : "VirtualBox API error",
      });
    }
  }),

  // -------------------------------------------------------------------------
  // Integration Health Check (public)
  // -------------------------------------------------------------------------
  healthCheck: publicProcedure.query(() => {
    return {
      timestamp: new Date().toISOString(),
      integrations: {
        unity: {
          available: !!process.env.UNITY_API_KEY,
          apiBase: "https://build-api.cloud.unity3d.com/api/v1",
          version: "6000.0.69f1",
        },
        eclipse: {
          available: !!process.env.ECLIPSE_CHE_URL,
          apiBase: process.env.ECLIPSE_CHE_URL ?? null,
          version: "Eclipse Che 7.114.0 / Theia 1.69.0",
        },
        netbeans: {
          available: true, // Maven is always available
          mavenVersion: "3.9.9",
          javaVersion: "11.0.28",
        },
        virtualbox: {
          available: false, // CLI not available in sandbox
          restApiAvailable: !!process.env.VBOX_REST_API_URL,
          version: "7.2.6",
        },
        mcpServers: {
          registered: getRegisteredMCPServers().length,
          categories: Array.from(
            new Set(getRegisteredMCPServers().map(s => s.category))
          ),
        },
      },
    };
  }),
});
