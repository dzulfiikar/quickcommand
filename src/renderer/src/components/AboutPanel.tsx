import {
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { appRepository } from "../../../shared/app-meta";
import type { AppUpdateInfo } from "../../../shared/update-model";

export const AboutPanel = memo(function AboutPanel(props: {
  onClose?: () => void;
  onCheckForUpdates(): Promise<void>;
  onOpenUpdateDownload(): Promise<void>;
  updateChecking: boolean;
  updateError: string | null;
  updateInfo: AppUpdateInfo | null;
}) {
  const updateAvailable = props.updateInfo?.availability === "update-available";
  const checkingLabel = props.updateChecking
    ? "Checking…"
    : "Check for updates";
  const downloadLabel = updateAvailable
    ? `Download v${props.updateInfo?.latestVersion}`
    : "Open latest release";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold leading-tight text-foreground">
              QuickCommand
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Version {__APP_VERSION__}
          </p>
        </div>
        {props.onClose ? (
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Close
          </Button>
        ) : null}
      </header>

      <p className="max-w-[60ch] text-base leading-relaxed text-muted-foreground">
        A local-first macOS snippet launcher. Save once, summon with a global
        shortcut, paste into the app you are already in.
      </p>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Built by</dt>
        <dd className="text-right text-foreground">Dzulfikar</dd>
        <dt className="text-muted-foreground">Repository</dt>
        <dd className="text-right">
          <a
            className="cursor-pointer text-foreground underline-offset-4 hover:underline"
            href={appRepository.url}
            onClick={(e) => {
              e.preventDefault();
              window.open(appRepository.url, "_blank");
            }}
          >
            github.com/dzulfiikar/quickcommand
          </a>
        </dd>
        <dt className="text-muted-foreground">License</dt>
        <dd className="text-right text-foreground">MIT</dd>
      </dl>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h3 className="section-label">Updates</h3>
          <span className="text-sm text-foreground">
            {props.updateChecking
              ? "Checking GitHub Releases…"
              : updateAvailable
                ? `v${props.updateInfo?.latestVersion} available`
                : props.updateInfo
                  ? `v${props.updateInfo.currentVersion} is current`
                  : "Run a manual check"}
          </span>
        </div>

        {props.updateInfo ? (
          <div className="surface-inset flex flex-col gap-3 px-3 py-3">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Latest release</span>
              <span className="text-right text-foreground">
                v{props.updateInfo.latestVersion}
              </span>
              <span className="text-muted-foreground">Published</span>
              <span className="text-right text-foreground">
                {new Date(
                  props.updateInfo.releasePublishedAt,
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-1">
              <p className="section-label">Release notes</p>
              <ScrollArea className="max-h-40 pr-2">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {props.updateInfo.releaseNotes}
                </p>
              </ScrollArea>
            </div>
          </div>
        ) : null}

        {props.updateError ? (
          <div className="notice notice--error px-3 py-2.5 text-sm leading-relaxed">
            {props.updateError}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={props.updateChecking}
            onClick={() => void props.onCheckForUpdates()}
          >
            {props.updateChecking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {checkingLabel}
          </Button>
          {props.updateInfo ? (
            <Button size="sm" onClick={() => void props.onOpenUpdateDownload()}>
              {updateAvailable ? (
                <Download className="h-3.5 w-3.5" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )}
              {downloadLabel}
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
});
