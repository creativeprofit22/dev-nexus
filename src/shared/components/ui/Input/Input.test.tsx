import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./index";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("defaults to type text", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it("accepts different types", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("handles value changes", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test" },
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it("accepts placeholder text", () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole("textbox").className).toContain("custom-input");
  });

  it("shows error state", () => {
    render(<Input id="test-input" error="This field is required" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("border-red-500");
  });

  it("displays error message", () => {
    render(<Input id="test-input" error="This field is required" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This field is required"
    );
  });

  it("links error message with aria-describedby", () => {
    render(<Input id="test-input" error="This field is required" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "test-input-error");
  });

  it("has proper focus styles", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("focus:ring-2");
    expect(input.className).toContain("focus:border-sky-500");
  });

  it("uses correct background color from design system", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("bg-[#14161c]");
  });
});
