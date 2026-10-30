import type { SttModelStatus } from "@/domain/settings";
import { useI18n } from "@/i18n";

import { cn } from "@acme/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

type SttModel = SttModelStatus["models"][number];

export function SttModelSelect({
  id,
  models,
  value,
  ariaLabel,
  triggerClassName,
  onChange,
}: {
  id?: string;
  models: SttModel[];
  value?: string;
  ariaLabel: string;
  triggerClassName?: string;
  onChange(modelId: string): void;
}) {
  const { t } = useI18n();

  function statusLabel(model: SttModel) {
    if (model.downloaded) return t("settings.stt.downloaded");
    if (model.downloadsOnDemand) return t("settings.stt.downloadsOnDemand");
    return t("settings.stt.notDownloaded");
  }

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={models.length === 0}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn("h-10 w-full", triggerClassName)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id} textValue={model.name}>
            <span className="flex min-w-0 items-center gap-2 whitespace-nowrap">
              <span className="truncate">{model.name}</span>
              <span className="text-muted-foreground text-xs">
                {statusLabel(model)}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
