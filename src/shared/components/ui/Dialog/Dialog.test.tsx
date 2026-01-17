import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog } from "./index";

describe("Dialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Test Dialog",
    children: <div>Dialog content</div>,
  };

  it("renders when open is true", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(<Dialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title correctly", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<Dialog {...defaultProps} description="Test description" />);
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
  });

  it("calls onOpenChange when close button is clicked", () => {
    const onOpenChange = vi.fn();
    render(<Dialog {...defaultProps} onOpenChange={onOpenChange} />);

    const closeButton = screen.getByLabelText("Close dialog");
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange when backdrop is clicked", () => {
    const onOpenChange = vi.fn();
    render(<Dialog {...defaultProps} onOpenChange={onOpenChange} />);

    // The backdrop has aria-hidden="true"
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange when Escape key is pressed", () => {
    const onOpenChange = vi.fn();
    render(<Dialog {...defaultProps} onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("has proper accessibility attributes", () => {
    render(<Dialog {...defaultProps} description="Test description" />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
    expect(dialog).toHaveAttribute("aria-describedby", "dialog-description");
  });

  it("close button has focus ring for accessibility", () => {
    render(<Dialog {...defaultProps} />);

    const closeButton = screen.getByLabelText("Close dialog");
    expect(closeButton.className).toContain("focus:ring-2");
  });

  it("uses correct colors from design system", () => {
    render(<Dialog {...defaultProps} />);

    const dialogContent = document.querySelector(".bg-\\[\\#181c24\\]");
    expect(dialogContent).toBeInTheDocument();
  });
});
