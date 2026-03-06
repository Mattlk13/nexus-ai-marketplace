/**
 * Developer Tools Integration Module
 * Provides programmatic access to Unity Cloud Build API, Eclipse Che API,
 * Apache NetBeans Maven builds, and VirtualBox REST API from the NEXUS platform.
 *
 * All integrations use their official REST APIs / CLI wrappers — no GUI required.
 */

import { exec, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Safe spawn wrapper — passes args as array to prevent shell injection.
 * Returns stdout/stderr as strings.
 */
function spawnSafe(
  cmd: string,
  args: string[],
  options: { cwd?: string; timeout?: number; env?: NodeJS.ProcessEnv } = {}
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      shell: false, // CRITICAL: no shell interpolation
      timeout: options.timeout,
    });
    const stdout: string[] = [];
    const stderr: string[] = [];
    child.stdout.on("data", (d: Buffer) => stdout.push(d.toString()));
    child.stderr.on("data", (d: Buffer) => stderr.push(d.toString()));
    child.on("close", code => {
      if (code === 0) {
        resolve({ stdout: stdout.join(""), stderr: stderr.join("") });
      } else {
        const err = new Error(`Process exited with code ${code}`) as Error & {
          stdout: string;
          stderr: string;
        };
        err.stdout = stdout.join("");
        err.stderr = stderr.join("");
        reject(err);
      }
    });
    child.on("error", reject);
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnityBuildStatus {
  buildtargetid: string;
  build: number;
  buildStatus:
    | "queued"
    | "sentToBuilder"
    | "started"
    | "restarted"
    | "success"
    | "failure"
    | "canceled"
    | "unknown";
  platform: string;
  created: string;
  finished?: string;
  links?: { download_primary?: { href: string } };
}

export interface EclipseCheWorkspace {
  id: string;
  status: "STARTING" | "RUNNING" | "STOPPING" | "STOPPED" | "ERROR";
  devfile?: Record<string, unknown>;
}

export interface MavenBuildResult {
  success: boolean;
  output: string;
  duration: number;
  artifacts?: string[];
}

export interface VBoxVMInfo {
  name: string;
  uuid: string;
  state: "running" | "poweroff" | "saved" | "aborted" | "paused";
  memory: number;
  cpus: number;
}

// ---------------------------------------------------------------------------
// Unity Cloud Build API
// ---------------------------------------------------------------------------

const UNITY_API_BASE = "https://build-api.cloud.unity3d.com/api/v1";

/**
 * Get all builds for a Unity Cloud Build project.
 * Requires UNITY_API_KEY and UNITY_ORG_ID environment variables.
 */
export async function getUnityBuilds(
  orgId: string,
  projectId: string,
  apiKey: string
): Promise<UnityBuildStatus[]> {
  const url = `${UNITY_API_BASE}/orgs/${orgId}/projects/${projectId}/buildtargets/_all/builds`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Unity Cloud Build API error: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<UnityBuildStatus[]>;
}

/**
 * Trigger a new Unity Cloud Build.
 */
export async function triggerUnityBuild(
  orgId: string,
  projectId: string,
  buildTargetId: string,
  apiKey: string,
  options: { clean?: boolean; delay?: number } = {}
): Promise<UnityBuildStatus> {
  const url = `${UNITY_API_BASE}/orgs/${orgId}/projects/${projectId}/buildtargets/${buildTargetId}/builds`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clean: options.clean ?? false,
      delay: options.delay ?? 0,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Unity build trigger failed: ${res.status} — ${body}`);
  }

  const builds = (await res.json()) as UnityBuildStatus[];
  return builds[0];
}

/**
 * Get Unity build artifact download URL.
 */
export async function getUnityBuildArtifact(
  orgId: string,
  projectId: string,
  buildTargetId: string,
  buildNumber: number,
  apiKey: string
): Promise<string | null> {
  const url = `${UNITY_API_BASE}/orgs/${orgId}/projects/${projectId}/buildtargets/${buildTargetId}/builds/${buildNumber}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
    },
  });

  if (!res.ok) return null;

  const build = (await res.json()) as UnityBuildStatus;
  return build.links?.download_primary?.href ?? null;
}

// ---------------------------------------------------------------------------
// Eclipse Che / Theia Cloud API
// ---------------------------------------------------------------------------

const CHE_API_BASE = process.env.ECLIPSE_CHE_URL ?? "http://localhost:8080";

/**
 * List all Eclipse Che workspaces.
 */
export async function listCheWorkspaces(
  token: string
): Promise<EclipseCheWorkspace[]> {
  const res = await fetch(`${CHE_API_BASE}/api/workspace`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Eclipse Che API error: ${res.status}`);
  }

  return res.json() as Promise<EclipseCheWorkspace[]>;
}

/**
 * Start an Eclipse Che workspace by ID.
 */
export async function startCheWorkspace(
  workspaceId: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${CHE_API_BASE}/api/workspace/${workspaceId}/runtime`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to start workspace ${workspaceId}: ${res.status}`);
  }
}

/**
 * Stop an Eclipse Che workspace by ID.
 */
export async function stopCheWorkspace(
  workspaceId: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${CHE_API_BASE}/api/workspace/${workspaceId}/runtime`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to stop workspace ${workspaceId}: ${res.status}`);
  }
}

// ---------------------------------------------------------------------------
// Apache NetBeans / Maven Build Integration
// ---------------------------------------------------------------------------

/**
 * Run a Maven build for a NetBeans/Java project.
 * Requires Maven to be installed at /usr/local/bin/mvn or on PATH.
 */
export async function runMavenBuild(
  projectPath: string,
  goals: string[] = ["clean", "package"],
  options: {
    profiles?: string[];
    skipTests?: boolean;
    properties?: Record<string, string>;
  } = {}
): Promise<MavenBuildResult> {
  const start = Date.now();

  // Build args array — never join into a shell string (prevents injection)
  const mvnArgs: string[] = [
    ...goals,
    "--batch-mode",
    "--no-transfer-progress",
  ];

  if (options.skipTests) mvnArgs.push("-DskipTests=true");
  if (options.profiles?.length) mvnArgs.push(`-P${options.profiles.join(",")}`);
  if (options.properties) {
    for (const [k, v] of Object.entries(options.properties)) {
      // Sanitize key and value — only allow alphanumeric, dot, underscore, hyphen
      const safeKey = k.replace(/[^a-zA-Z0-9._-]/g, "");
      const safeVal = v.replace(/[^a-zA-Z0-9._\-/: ]/g, "");
      if (safeKey) mvnArgs.push(`-D${safeKey}=${safeVal}`);
    }
  }

  try {
    const { stdout, stderr } = await spawnSafe("mvn", mvnArgs, {
      cwd: projectPath,
      timeout: 300_000, // 5 min max
      env: { ...process.env, JAVA_HOME: "/usr/lib/jvm/java-11-openjdk-amd64" },
    });

    const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : "");
    const duration = Date.now() - start;

    // Extract built artifacts from Maven output
    const artifactMatches = output.match(/Building jar: (.+\.jar)/g) ?? [];
    const artifacts = artifactMatches.map(m => m.replace("Building jar: ", ""));

    return { success: true, output, duration, artifacts };
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; message?: string };
    return {
      success: false,
      output:
        (error.stdout ?? "") +
        "\n" +
        (error.stderr ?? error.message ?? "Unknown error"),
      duration: Date.now() - start,
    };
  }
}

/**
 * Run Maven tests and return test results summary.
 */
export async function runMavenTests(
  projectPath: string
): Promise<MavenBuildResult> {
  return runMavenBuild(projectPath, ["test"], { skipTests: false });
}

// ---------------------------------------------------------------------------
// VirtualBox Integration (via vboxmanage CLI or REST API)
// ---------------------------------------------------------------------------

/**
 * List all VirtualBox VMs (requires vboxmanage on PATH).
 * Falls back to REST API if CLI is unavailable.
 */
export async function listVBoxVMs(): Promise<VBoxVMInfo[]> {
  try {
    const { stdout } = await execAsync("vboxmanage list vms --long", {
      timeout: 10_000,
    });
    return parseVBoxListOutput(stdout);
  } catch {
    // vboxmanage not available — try REST API
    const apiUrl = process.env.VBOX_REST_API_URL;
    if (!apiUrl) return [];

    const res = await fetch(`${apiUrl}/virtualmachines`, {
      headers: {
        Authorization: `Bearer ${process.env.VBOX_REST_TOKEN ?? ""}`,
      },
    });

    if (!res.ok) return [];
    return res.json() as Promise<VBoxVMInfo[]>;
  }
}

/**
 * Start a VirtualBox VM by name or UUID.
 */
export async function startVBoxVM(
  nameOrUuid: string,
  headless = true
): Promise<void> {
  const type = headless ? "headless" : "gui";
  const { stderr } = await execAsync(
    `vboxmanage startvm "${nameOrUuid}" --type ${type}`,
    { timeout: 30_000 }
  );
  if (stderr && !stderr.includes("successfully started")) {
    throw new Error(`VBoxManage startvm error: ${stderr}`);
  }
}

/**
 * Stop a VirtualBox VM gracefully (ACPI power button).
 */
export async function stopVBoxVM(
  nameOrUuid: string,
  force = false
): Promise<void> {
  const action = force ? "poweroff" : "acpipowerbutton";
  await execAsync(`vboxmanage controlvm "${nameOrUuid}" ${action}`, {
    timeout: 30_000,
  });
}

/**
 * Take a snapshot of a VirtualBox VM.
 */
export async function snapshotVBoxVM(
  nameOrUuid: string,
  snapshotName: string
): Promise<void> {
  await execAsync(
    `vboxmanage snapshot "${nameOrUuid}" take "${snapshotName}" --live`,
    { timeout: 60_000 }
  );
}

/**
 * Parse vboxmanage list vms --long output into structured VM info.
 */
function parseVBoxListOutput(output: string): VBoxVMInfo[] {
  const vms: VBoxVMInfo[] = [];
  const blocks = output.split(/\n\n+/);

  for (const block of blocks) {
    const name = block.match(/^Name:\s+(.+)$/m)?.[1]?.trim();
    const uuid = block.match(/^UUID:\s+(.+)$/m)?.[1]?.trim();
    const stateRaw = block
      .match(/^State:\s+(.+?)\s*\(/m)?.[1]
      ?.trim()
      .toLowerCase();
    const memory = parseInt(
      block.match(/^Memory size:\s+(\d+)/m)?.[1] ?? "0",
      10
    );
    const cpus = parseInt(
      block.match(/^Number of CPUs:\s+(\d+)/m)?.[1] ?? "1",
      10
    );

    if (!name || !uuid) continue;

    const stateMap: Record<string, VBoxVMInfo["state"]> = {
      running: "running",
      "powered off": "poweroff",
      saved: "saved",
      aborted: "aborted",
      paused: "paused",
    };

    vms.push({
      name,
      uuid,
      state: stateMap[stateRaw ?? ""] ?? "poweroff",
      memory,
      cpus,
    });
  }

  return vms;
}

// ---------------------------------------------------------------------------
// MCP Server Registry Integration
// ---------------------------------------------------------------------------

export interface MCPServerEntry {
  name: string;
  description: string;
  url: string;
  category: string;
  installCmd?: string;
}

/**
 * Returns the curated list of MCP servers integrated with NEXUS.
 * These are the servers discovered during the CI research phase.
 */
export function getRegisteredMCPServers(): MCPServerEntry[] {
  return [
    // Unity
    {
      name: "mcp-unity",
      description:
        "Unity Editor MCP server — control Unity projects via AI agents",
      url: "https://github.com/CoderGamester/mcp-unity",
      category: "game-dev",
      installCmd: "npm install -g @coderGamester/mcp-unity",
    },
    {
      name: "unity-mcp",
      description: "Unity MCP integration for CoPlay game development",
      url: "https://github.com/CoplayDev/unity-mcp",
      category: "game-dev",
    },
    // Eclipse / Java
    {
      name: "eclipse-jdt-mcp",
      description: "Eclipse JDT Language Server MCP — Java code intelligence",
      url: "https://www.pulsemcp.com/servers/stephanj-eclipse-jdt-language-server",
      category: "ide",
    },
    {
      name: "maven-tools-mcp",
      description: "Maven build tools MCP server for Java project management",
      url: "https://github.com/arvindand/maven-tools-mcp",
      category: "build",
      installCmd: "npx @arvindand/maven-tools-mcp",
    },
    // NetBeans
    {
      name: "claude-code-netbeans",
      description: "NetBeans plugin exposing IDE features to Claude via MCP",
      url: "https://github.com/emilianbold/claude-code-netbeans",
      category: "ide",
    },
    // VirtualBox
    {
      name: "virtualbox-mcp",
      description: "VirtualBox VM management via MCP protocol",
      url: "https://github.com/usemanusai/Virtualbox-mcp-server",
      category: "virtualization",
      installCmd: "npm install -g virtualbox-mcp-server",
    },
    // AI Agent MCP Servers
    {
      name: "github-mcp",
      description: "GitHub official MCP server — repos, PRs, issues, Actions",
      url: "https://github.com/github/github-mcp-server",
      category: "vcs",
      installCmd: "npx @github/mcp-server",
    },
    {
      name: "anthropic-computer-use",
      description: "Anthropic Computer Use MCP — desktop automation via Claude",
      url: "https://github.com/anthropics/anthropic-quickstarts",
      category: "ai-agent",
    },
    {
      name: "openai-agents-mcp",
      description: "OpenAI Agents SDK with MCP tool integration",
      url: "https://github.com/openai/openai-agents-python",
      category: "ai-agent",
    },
    {
      name: "gemini-mcp",
      description: "Google Gemini MCP server for multimodal AI tasks",
      url: "https://github.com/google-gemini/gemini-api-quickstart",
      category: "ai-agent",
    },
    // Slack (already configured)
    {
      name: "slack-mcp",
      description: "Slack MCP server — channels, messages, notifications",
      url: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
      category: "communication",
      installCmd: "npx @modelcontextprotocol/server-slack",
    },
    // Asana (already configured)
    {
      name: "asana-mcp",
      description: "Asana MCP server — tasks, projects, goals",
      url: "https://github.com/modelcontextprotocol/servers/tree/main/src/asana",
      category: "project-management",
    },
    // Gmail / Calendar (already configured)
    {
      name: "gmail-mcp",
      description: "Gmail MCP server — read, compose, send emails",
      url: "https://github.com/modelcontextprotocol/servers/tree/main/src/gmail",
      category: "communication",
    },
    {
      name: "google-calendar-mcp",
      description: "Google Calendar MCP server — events, scheduling",
      url: "https://github.com/modelcontextprotocol/servers/tree/main/src/google-calendar",
      category: "productivity",
    },
  ];
}
