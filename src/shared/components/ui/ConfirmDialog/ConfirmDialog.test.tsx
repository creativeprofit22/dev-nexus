import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "./index";

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Confirm Action",
    description: "Are you sure you want to proceed?",
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open is true", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?")
    ).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows default button labels", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("shows custom button labels", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        cancelLabel="Go Back"
        confirmLabel="Yes, Delete"
      />
    );
    expect(screen.getByText("Go Back")).toBeInTheDocument();
    expect(screen.getByText("Yes, Delete")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText("Confirm"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when cancel button is clicked", () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog after confirm when not loading", () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByText("Confirm"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close dialog after confirm when loading", () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} isLoading />
    );

    fireEvent.click(screen.getByText("Deleting..."));

    // onOpenChange should NOT be called with false since isLoading is true
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("shows loading state on confirm button", () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);
    expect(screen.getByText("Deleting...")).toBeInTheDocument();
  });

  it("disables buttons when loading", () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);

    expect(screen.getByText("Cancel")).toBeDisabled();
    expect(screen.getByText("Deleting...")).toBeDisabled();
  });

  it("uses primary variant by default", () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton.className).toContain("bg-sky-500");
  });

  it("uses danger variant when specified", () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton.className).toContain("bg-red-600");
  });
});
