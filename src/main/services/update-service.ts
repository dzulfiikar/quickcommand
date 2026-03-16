import { appRepository } from "../../shared/app-meta";
import {
  type AppUpdateInfo,
  appUpdateInfoSchema,
  type GitHubLatestRelease,
  gitHubLatestReleaseSchema,
} from "../../shared/update-model";

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

type AppUpdateServiceOptions = {
  arch?: string;
  currentVersion: string;
  fetch?: FetchLike;
  now?: () => Date;
  openExternal?: (url: string) => Promise<void> | void;
  owner?: string;
  repo?: string;
};

export class AppUpdateService {
  private readonly arch: string;
  private readonly currentVersion: string;
  private readonly fetchImpl: FetchLike;
  private readonly now: () => Date;
  private readonly openExternal: (url: string) => Promise<void> | void;
  private readonly owner: string;
  private readonly repo: string;

  constructor(options: AppUpdateServiceOptions) {
    this.arch = options.arch ?? process.arch;
    this.currentVersion = normalizeVersion(options.currentVersion);
    this.fetchImpl = options.fetch ?? fetch;
    this.now = options.now ?? (() => new Date());
    this.openExternal =
      options.openExternal ??
      (() => {
        throw new Error("openExternal is not configured");
      });
    this.owner = options.owner ?? appRepository.owner;
    this.repo = options.repo ?? appRepository.repo;
  }

  async checkForUpdates(): Promise<AppUpdateInfo> {
    const checkedAt = this.now().toISOString();
    const release = await this.fetchLatestRelease();
    const latestVersion = normalizeVersion(release.tag_name);
    const downloadUrl = selectDownloadUrl(release, this.arch);

    return appUpdateInfoSchema.parse({
      availability:
        compareVersions(latestVersion, this.currentVersion) > 0
          ? "update-available"
          : "up-to-date",
      autoInstallSupported: false,
      checkedAt,
      currentVersion: this.currentVersion,
      downloadUrl,
      latestVersion,
      releaseName: release.name?.trim() || `QuickCommand ${latestVersion}`,
      releaseNotes: release.body?.trim() || "No release notes provided.",
      releasePublishedAt: release.published_at ?? checkedAt,
      releaseUrl: release.html_url,
    });
  }

  async openUpdateDownload(url: string): Promise<void> {
    await this.openExternal(url);
  }

  private async fetchLatestRelease(): Promise<GitHubLatestRelease> {
    const response = await this.fetchImpl(this.getLatestReleaseApiUrl(), {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "QuickCommand Update Checker",
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub release check failed with status ${response.status}`,
      );
    }

    const payload = await response.json();
    return gitHubLatestReleaseSchema.parse(payload);
  }

  private getLatestReleaseApiUrl(): string {
    return `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`;
  }
}

function normalizeVersion(version: string): string {
  return version.trim().replace(/^v/i, "");
}

function selectDownloadUrl(release: GitHubLatestRelease, arch: string): string {
  const assets = release.assets;
  const normalizedArch = arch.toLowerCase();
  const preferredArchTokens = [normalizedArch, "universal"];
  const preferredExtensions = [".dmg", ".zip"];

  for (const extension of preferredExtensions) {
    for (const archToken of preferredArchTokens) {
      const asset = assets.find((candidate) => {
        const name = candidate.name.toLowerCase();
        return name.endsWith(extension) && name.includes(archToken);
      });

      if (asset) {
        return asset.browser_download_url;
      }
    }

    const fallbackAsset = assets.find((candidate) =>
      candidate.name.toLowerCase().endsWith(extension),
    );
    if (fallbackAsset) {
      return fallbackAsset.browser_download_url;
    }
  }

  return release.html_url;
}

function compareVersions(left: string, right: string): number {
  const parsedLeft = parseVersion(left);
  const parsedRight = parseVersion(right);
  const maxLength = Math.max(parsedLeft.core.length, parsedRight.core.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = parsedLeft.core[index] ?? 0;
    const rightPart = parsedRight.core[index] ?? 0;

    if (leftPart !== rightPart) {
      return leftPart > rightPart ? 1 : -1;
    }
  }

  if (!parsedLeft.prerelease && !parsedRight.prerelease) {
    return 0;
  }

  if (!parsedLeft.prerelease) {
    return 1;
  }

  if (!parsedRight.prerelease) {
    return -1;
  }

  const leftParts = parsedLeft.prerelease.split(".");
  const rightParts = parsedRight.prerelease.split(".");
  const maxPrereleaseLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxPrereleaseLength; index += 1) {
    const leftPart = leftParts[index];
    const rightPart = rightParts[index];

    if (leftPart === undefined) {
      return -1;
    }

    if (rightPart === undefined) {
      return 1;
    }

    const leftNumber = Number(leftPart);
    const rightNumber = Number(rightPart);
    const leftNumeric = Number.isInteger(leftNumber);
    const rightNumeric = Number.isInteger(rightNumber);

    if (leftNumeric && rightNumeric && leftNumber !== rightNumber) {
      return leftNumber > rightNumber ? 1 : -1;
    }

    if (leftNumeric !== rightNumeric) {
      return leftNumeric ? -1 : 1;
    }

    if (leftPart !== rightPart) {
      return leftPart > rightPart ? 1 : -1;
    }
  }

  return 0;
}

function parseVersion(version: string): {
  core: number[];
  prerelease: string | null;
} {
  const normalized = normalizeVersion(version);
  const [core, prerelease] = normalized.split("-", 2);

  return {
    core: core.split(".").map((part) => {
      const parsed = Number(part);
      return Number.isFinite(parsed) ? parsed : 0;
    }),
    prerelease: prerelease ?? null,
  };
}
