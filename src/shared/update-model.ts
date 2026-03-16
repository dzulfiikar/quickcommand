import { z } from "zod";

const isoDateTime = z.iso.datetime({ offset: true });

export const updateAvailabilitySchema = z.enum([
  "up-to-date",
  "update-available",
]);

export const appUpdateInfoSchema = z.object({
  availability: updateAvailabilitySchema,
  autoInstallSupported: z.literal(false),
  checkedAt: isoDateTime,
  currentVersion: z.string().min(1),
  downloadUrl: z.string().url(),
  latestVersion: z.string().min(1),
  releaseName: z.string().min(1),
  releaseNotes: z.string(),
  releasePublishedAt: isoDateTime,
  releaseUrl: z.string().url(),
});

export const gitHubReleaseAssetSchema = z.object({
  browser_download_url: z.string().url(),
  name: z.string().min(1),
});

export const gitHubLatestReleaseSchema = z.object({
  assets: z.array(gitHubReleaseAssetSchema).default([]),
  body: z.string().nullish(),
  html_url: z.string().url(),
  name: z.string().nullish(),
  published_at: isoDateTime.nullish(),
  tag_name: z.string().min(1),
});

export type AppUpdateInfo = z.infer<typeof appUpdateInfoSchema>;
export type GitHubLatestRelease = z.infer<typeof gitHubLatestReleaseSchema>;
