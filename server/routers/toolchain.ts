/**
 * Toolchain Integration Router
 * Exposes Eclipse, Unity, Maven, Java, NetBeans capabilities via tRPC
 * for use by AI agents, CI/CD pipelines, and the NEXUS platform.
 *
 * Tools integrated:
 *  - Eclipse IDE 2024-12 (Eclipse Che API, GLSP, LSP4J)
 *  - Unity 6 LTS (Unity Cloud Build API, Unity Gaming Services)
 *  - Apache Maven 3.9 (build, test, deploy, release lifecycle)
 *  - Java 21 LTS / Eclipse Temurin (compile, run, GraalVM native)
 *  - Apache NetBeans 21 (Ant build, Maven integration, platform API)
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { spawn } from "child_process";
import { TRPCError } from "@trpc/server";

// ── Helpers ──────────────────────────────────────────────────────────────────

const JAVA_HOME = "/usr/lib/jvm/temurin-21-jdk-amd64";
const MAVEN_HOME = "/opt/maven";

/** Safe spawn wrapper — no shell interpolation, returns stdout/stderr */
function runCommand(
  cmd: string,
  args: string[],
  env: Record<string, string> = {}
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      shell: false,
      env: {
        ...process.env,
        JAVA_HOME,
        PATH: `${MAVEN_HOME}/bin:${JAVA_HOME}/bin:${process.env.PATH}`,
        ...env,
      },
    });
    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (d: Buffer) => (stdout += d.toString()));
    proc.stderr?.on("data", (d: Buffer) => (stderr += d.toString()));
    proc.on("close", (code) => resolve({ stdout, stderr, code: code ?? 1 }));
    proc.on("error", (err) =>
      resolve({ stdout: "", stderr: err.message, code: 1 })
    );
  });
}

/** Validate a tool name is in the allowed list */
function assertAllowedTool(tool: string, allowed: string[]): void {
  if (!allowed.includes(tool)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Tool '${tool}' is not in the allowed list`,
    });
  }
}

// ── Eclipse Integration ───────────────────────────────────────────────────────

const eclipseRouter = router({
  /** Get Eclipse Che workspace status via REST API */
  cheWorkspaceStatus: publicProcedure
    .input(
      z.object({
        cheApiUrl: z
          .string()
          .url()
          .default("https://che.example.com/api"),
        workspaceId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const res = await fetch(
          `${input.cheApiUrl}/workspace/${input.workspaceId}`,
          { headers: { Accept: "application/json" } }
        );
        if (!res.ok) {
          return {
            status: "unknown",
            error: `HTTP ${res.status}`,
            workspaceId: input.workspaceId,
          };
        }
        const data = (await res.json()) as Record<string, unknown>;
        return {
          status: (data.status as string) ?? "unknown",
          workspaceId: input.workspaceId,
          data,
        };
      } catch (err) {
        return {
          status: "unreachable",
          error: String(err),
          workspaceId: input.workspaceId,
        };
      }
    }),

  /** List available Eclipse Marketplace plugins */
  marketplaceSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const sanitized = input.query.replace(/[<>"'&]/g, "");
      const url = `https://marketplace.eclipse.org/api/p?search=${encodeURIComponent(sanitized)}&limit=${input.limit}`;
      try {
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
          return { plugins: [], error: `HTTP ${res.status}`, query: sanitized };
        }
        const data = (await res.json()) as Record<string, unknown>;
        return { plugins: data, query: sanitized };
      } catch (err) {
        return { plugins: [], error: String(err), query: sanitized };
      }
    }),

  /** Get Eclipse IDE version info */
  versionInfo: publicProcedure.query(async () => {
    return {
      eclipseIde: "2024-12",
      eclipseChe: "7.95+",
      eclipseTemurin: "21.0.10",
      eclipseGlsp: "2.6.0",
      eclipseLsp4j: "0.23.1",
      eclipseMicroProfile: "7.0",
      eclipseJakartaEe: "11.0",
      mavenHome: MAVEN_HOME,
      javaHome: JAVA_HOME,
    };
  }),
});

// ── Unity Integration ─────────────────────────────────────────────────────────

const unityRouter = router({
  /** Query Unity Cloud Build API for project build status */
  cloudBuildStatus: publicProcedure
    .input(
      z.object({
        orgId: z.string().min(1),
        projectId: z.string().min(1),
        apiKey: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const url = `https://build-api.cloud.unity3d.com/api/v1/orgs/${encodeURIComponent(input.orgId)}/projects/${encodeURIComponent(input.projectId)}/buildtargets`;
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Basic ${Buffer.from(input.apiKey).toString("base64")}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) {
          return { buildTargets: [], error: `HTTP ${res.status}` };
        }
        const data = (await res.json()) as unknown[];
        return { buildTargets: data, count: data.length };
      } catch (err) {
        return { buildTargets: [], error: String(err) };
      }
    }),

  /** Get Unity Gaming Services project info */
  gamingServicesInfo: publicProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        serviceAccountKey: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const url = `https://services.api.unity.com/unity/v1/projects/${encodeURIComponent(input.projectId)}`;
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `ServiceAccount ${input.serviceAccountKey}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) {
          return { project: null, error: `HTTP ${res.status}` };
        }
        const data = (await res.json()) as Record<string, unknown>;
        return { project: data };
      } catch (err) {
        return { project: null, error: String(err) };
      }
    }),

  /** List Unity packages available in the npm registry */
  packageInfo: publicProcedure
    .input(z.object({ packageName: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      const allowed = [
        "react-unity-webgl",
        "unity-webgl",
        "@unity/render-streaming",
      ];
      const sanitized = input.packageName.replace(/[^a-zA-Z0-9@/._-]/g, "");
      if (!allowed.some((a) => sanitized.includes(a.split("/")[0]))) {
        return { name: sanitized, error: "Package not in allowed list" };
      }
      try {
        const res = await fetch(`https://registry.npmjs.org/${sanitized}`, {
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
          return { name: sanitized, error: `HTTP ${res.status}` };
        }
        const data = (await res.json()) as Record<string, unknown>;
        return {
          name: sanitized,
          version: data["dist-tags"]
            ? (data["dist-tags"] as Record<string, string>).latest
            : "unknown",
          description: String(data.description ?? ""),
        };
      } catch (err) {
        return { name: sanitized, error: String(err) };
      }
    }),
});

// ── Maven Integration ─────────────────────────────────────────────────────────

const mavenRouter = router({
  /** Run a Maven goal safely (no shell injection) */
  runGoal: protectedProcedure
    .input(
      z.object({
        projectPath: z.string().min(1).max(500),
        goal: z
          .string()
          .regex(/^[a-zA-Z0-9:_-]+$/, "Invalid Maven goal format"),
        profiles: z.array(z.string().regex(/^[a-zA-Z0-9_-]+$/)).default([]),
        properties: z.record(z.string(), z.string()).default({}),
      })
    )
    .mutation(async ({ input }) => {
      const allowedGoals = [
        "clean",
        "compile",
        "test",
        "package",
        "verify",
        "install",
        "deploy",
        "site",
        "dependency:tree",
        "dependency:analyze",
        "versions:display-dependency-updates",
        "versions:display-plugin-updates",
        "checkstyle:check",
        "pmd:check",
        "jacoco:report",
        "sonar:sonar",
        "spring-boot:run",
        "quarkus:dev",
        "jib:build",
      ];
      assertAllowedTool(input.goal, allowedGoals);

      const args = ["-f", input.projectPath, input.goal, "--batch-mode"];
      if (input.profiles.length > 0) {
        args.push(`-P${input.profiles.join(",")}`);
      }
      for (const [k, v] of Object.entries(input.properties)) {
        const sv = String(v);
        if (/^[a-zA-Z0-9._-]+$/.test(k) && /^[a-zA-Z0-9._/-]+$/.test(sv)) {
          args.push(`-D${k}=${sv}`);
        }
      }

      const result = await runCommand(`${MAVEN_HOME}/bin/mvn`, args);
      return {
        success: result.code === 0,
        exitCode: result.code,
        stdout: result.stdout.slice(-5000),
        stderr: result.stderr.slice(-2000),
        goal: input.goal,
      };
    }),

  /** Search Maven Central for an artifact */
  searchCentral: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        limit: z.number().int().min(1).max(20).default(10),
      })
    )
    .query(async ({ input }) => {
      const sanitized = input.query.replace(/[<>"'&]/g, "");
        const url = `https://search.maven.org/solrsearch/select?q=${encodeURIComponent(sanitized)}&rows=${input.limit}&wt=json`;
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
          return { docs: [], error: `HTTP ${res.status}` };
        }
        const data = (await res.json()) as {
          response: { docs: unknown[]; numFound: number };
        };
        return {
          docs: data.response.docs,
          total: data.response.numFound,
          query: sanitized,
        };
      } catch (err) {
        return { docs: [], error: String(err) };
      }
    }),

  /** Get Maven version info */
  versionInfo: publicProcedure.query(async () => {
    const result = await runCommand(`${MAVEN_HOME}/bin/mvn`, ["--version"]);
    return {
      version: result.stdout.split("\n")[0] || "unknown",
      javaHome: JAVA_HOME,
      mavenHome: MAVEN_HOME,
    };
  }),
});

// ── Java / JDK Integration ────────────────────────────────────────────────────

const javaRouter = router({
  /** Get Java runtime info */
  runtimeInfo: publicProcedure.query(async () => {
    const result = await runCommand("java", ["-version"]);
    return {
      version: result.stderr.split("\n")[0] || result.stdout.split("\n")[0],
      javaHome: JAVA_HOME,
      vendor: "Eclipse Temurin (Adoptium)",
      lts: true,
      features: [
        "Virtual Threads (Project Loom)",
        "Pattern Matching",
        "Records",
        "Sealed Classes",
        "Text Blocks",
        "GraalVM Native Image compatible",
      ],
    };
  }),

  /** Search for Java packages on Maven Central */
  searchPackages: publicProcedure
    .input(
      z.object({
        groupId: z.string().optional(),
        artifactId: z.string().optional(),
        limit: z.number().int().min(1).max(20).default(10),
      })
    )
    .query(async ({ input }) => {
      const q = [
        input.groupId ? `g:${input.groupId}` : "",
        input.artifactId ? `a:${input.artifactId}` : "",
      ]
        .filter(Boolean)
        .join(" AND ");
      if (!q) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Provide at least groupId or artifactId",
        });
      }
      const url = `https://search.maven.org/solrsearch/select?q=${encodeURIComponent(q)}&rows=${input.limit}&wt=json`;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
        if (!res.ok) {
          return { docs: [], error: `HTTP ${res.status}` };
        }
        const data = (await res.json()) as {
          response: { docs: unknown[]; numFound: number };
        };
        return { docs: data.response.docs, total: data.response.numFound };
      } catch (err) {
        return { docs: [], error: String(err) };
      }
    }),

  /** List key Java ecosystem frameworks */
  ecosystemInfo: publicProcedure.query(() => {
    return {
      frameworks: [
        {
          name: "Spring Boot",
          version: "3.4.x",
          url: "https://spring.io/projects/spring-boot",
        },
        {
          name: "Quarkus",
          version: "3.17.x",
          url: "https://quarkus.io",
        },
        {
          name: "Micronaut",
          version: "4.7.x",
          url: "https://micronaut.io",
        },
        {
          name: "Helidon",
          version: "4.1.x",
          url: "https://helidon.io",
        },
        {
          name: "Jakarta EE",
          version: "11.0",
          url: "https://jakarta.ee",
        },
        {
          name: "Hibernate",
          version: "6.6.x",
          url: "https://hibernate.org",
        },
        {
          name: "GraalVM",
          version: "21.0.x",
          url: "https://graalvm.org",
        },
      ],
      buildTools: [
        { name: "Maven", version: "3.9.9", path: MAVEN_HOME },
        { name: "Ant", version: "1.10.12", path: "/usr/bin/ant" },
      ],
      jdks: [
        {
          name: "Eclipse Temurin 21",
          path: JAVA_HOME,
          lts: true,
          active: true,
        },
        {
          name: "OpenJDK 11",
          path: "/usr/lib/jvm/java-11-openjdk-amd64",
          lts: false,
          active: false,
        },
      ],
    };
  }),
});

// ── NetBeans Integration ──────────────────────────────────────────────────────

const netbeansRouter = router({
  /** Run an Ant build target (NetBeans projects use Ant by default) */
  runAntTarget: protectedProcedure
    .input(
      z.object({
        buildFile: z.string().min(1).max(500),
        target: z
          .string()
          .regex(/^[a-zA-Z0-9_-]+$/, "Invalid Ant target format"),
        properties: z.record(z.string(), z.string()).default({}),
      })
    )
    .mutation(async ({ input }) => {
      const allowedTargets = [
        "clean",
        "compile",
        "test",
        "jar",
        "run",
        "javadoc",
        "dist",
        "init",
        "build",
        "debug",
        "profile",
        "test-single",
        "run-single",
      ];
      assertAllowedTool(input.target, allowedTargets);

      const args = ["-f", input.buildFile, input.target];
      for (const [k, v] of Object.entries(input.properties)) {
        const sv = String(v);
        if (/^[a-zA-Z0-9._-]+$/.test(k) && /^[a-zA-Z0-9._/-]+$/.test(sv)) {
          args.push(`-D${k}=${sv}`);
        }
      }

      const result = await runCommand("ant", args);
      return {
        success: result.code === 0,
        exitCode: result.code,
        stdout: result.stdout.slice(-5000),
        stderr: result.stderr.slice(-2000),
        target: input.target,
      };
    }),

  /** Search NetBeans Plugin Portal */
  searchPlugins: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const sanitized = input.query.replace(/[<>"'&]/g, "");
      // NetBeans Plugin Portal catalog
      const url = `https://plugins.netbeans.apache.org/catalogue/?id=1&q=${encodeURIComponent(sanitized)}`;
      return {
        searchUrl: url,
        query: sanitized,
        note: "Visit the URL to browse NetBeans plugins matching your query",
        popularPlugins: [
          "NB JavaHints",
          "Checkstyle Integration",
          "PMD Plugin",
          "FindBugs Integration",
          "Git",
          "Maven",
          "Gradle",
          "Docker",
          "REST Client",
          "JavaScript Editor",
          "PHP",
          "Python",
          "C/C++",
          "JavaFX",
          "Spring Boot Support",
        ],
      };
    }),

  /** Get NetBeans version info */
  versionInfo: publicProcedure.query(() => {
    return {
      netbeansVersion: "21",
      antVersion: "1.10.12",
      javaHome: JAVA_HOME,
      mavenHome: MAVEN_HOME,
      features: [
        "Java 21 support",
        "Maven integration",
        "Gradle integration",
        "Git integration",
        "Docker support",
        "REST client",
        "JavaScript/TypeScript",
        "PHP",
        "HTML5/CSS3",
        "NetBeans Platform API",
      ],
      pluginPortal: "https://plugins.netbeans.apache.org/",
      downloadUrl: "https://netbeans.apache.org/front/main/download/",
    };
  }),
});

// ── Main Toolchain Router ─────────────────────────────────────────────────────

export const toolchainRouter = router({
  eclipse: eclipseRouter,
  unity: unityRouter,
  maven: mavenRouter,
  java: javaRouter,
  netbeans: netbeansRouter,

  /** Overall toolchain health check */
  health: publicProcedure.query(async () => {
    const javaResult = await runCommand("java", ["-version"]);
    const mvnResult = await runCommand(`${MAVEN_HOME}/bin/mvn`, ["--version"]);
    const antResult = await runCommand("ant", ["-version"]);

    return {
      java: {
        available: javaResult.code === 0,
        version: javaResult.stderr.split("\n")[0] || "unknown",
        home: JAVA_HOME,
      },
      maven: {
        available: mvnResult.code === 0,
        version: mvnResult.stdout.split("\n")[0] || "unknown",
        home: MAVEN_HOME,
      },
      ant: {
        available: antResult.code === 0,
        version: antResult.stdout.split("\n")[0] || "unknown",
      },
      node: {
        available: true,
        version: process.version,
      },
      timestamp: new Date().toISOString(),
    };
  }),
});
