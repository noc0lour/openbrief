import { SttModelDownloadDialog } from "@/features/setup/SttModelDownloadDialog";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const model = {
  id: "whisper-small",
  name: "Whisper Small",
  engine: "whisper.cpp",
  fileName: "ggml-small.bin",
  sizeMb: 466,
  downloaded: false,
  recommended: true,
};

describe("SttModelDownloadDialog", () => {
  it("asks for confirmation before downloading the picked model", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <SttModelDownloadDialog
        state={{ modelId: model.id, status: "confirm", progressPercent: 0 }}
        model={model}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Download Whisper Small?" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/466 MB/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("shows progress and locks the dialog while downloading", () => {
    render(
      <SttModelDownloadDialog
        state={{
          modelId: model.id,
          status: "downloading",
          progressPercent: 42,
        }}
        model={model}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "downloading" })).toBeDisabled();
  });

  it("blocks downloads for incompatible models", () => {
    render(
      <SttModelDownloadDialog
        state={{ modelId: model.id, status: "confirm", progressPercent: 0 }}
        model={model}
        blockedMessage="Not supported on this Mac"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Not supported on this Mac")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();
  });
});
