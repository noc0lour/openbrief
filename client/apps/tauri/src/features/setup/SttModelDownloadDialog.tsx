import type { SttModelStatus } from "@/domain/settings";
import { formatModelSize } from "@/domain/settings";
import { useI18n } from "@/i18n";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

export type SttModelDownloadState = {
  modelId: string;
  status: "confirm" | "downloading" | "failed";
  progressPercent: number;
  errorMessage?: string;
};

/**
 * Confirms and runs the download of a transcription model picked from a
 * model selector, so the next transcription starts without a setup detour.
 */
export function SttModelDownloadDialog({
  state,
  model,
  blockedMessage,
  onConfirm,
  onCancel,
}: {
  state?: SttModelDownloadState;
  model?: SttModelStatus["models"][number];
  blockedMessage?: string;
  onConfirm(): void;
  onCancel(): void;
}) {
  const { t } = useI18n();
  const isDownloading = state?.status === "downloading";
  const progressPercent = state?.progressPercent ?? 0;
  const showProgressPercent = progressPercent > 0;
  const modelName = model?.name ?? state?.modelId ?? "";

  return (
    <Dialog
      open={Boolean(state)}
      onOpenChange={(open) => {
        if (!open && !isDownloading) onCancel();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("setup.whisper.confirmTitle", { model: modelName })}
          </DialogTitle>
          <DialogDescription>
            {t("setup.whisper.confirmDescription", {
              model: modelName,
              size: formatModelSize(model?.sizeMb ?? 0),
            })}
          </DialogDescription>
        </DialogHeader>
        {blockedMessage ? (
          <p className="text-destructive text-sm">{blockedMessage}</p>
        ) : null}
        {isDownloading ? (
          <div role="status" className="grid gap-1">
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{t("setup.whisper.downloadingModel")}</span>
              {showProgressPercent ? <span>{progressPercent}%</span> : null}
            </div>
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div
                className={`bg-primary h-full ${
                  showProgressPercent ? "" : "animate-pulse"
                }`}
                style={{
                  width: showProgressPercent
                    ? `${Math.max(2, Math.min(progressPercent, 100))}%`
                    : "100%",
                }}
              />
            </div>
          </div>
        ) : null}
        {state?.status === "failed" && state.errorMessage ? (
          <p role="alert" className="text-destructive text-sm">
            {state.errorMessage}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDownloading}
            onClick={onCancel}
          >
            {t("setup.cancel")}
          </Button>
          <Button
            type="button"
            disabled={isDownloading || Boolean(blockedMessage)}
            onClick={onConfirm}
          >
            {isDownloading
              ? t("setup.whisper.downloading")
              : t("setup.whisper.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
