import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./index";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-sky-500");
  });

  it("applies secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-[#313844]");
  });

  it("applies ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-transparent");
  });

  it("applies danger variant", () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-red-600");
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button").className).toContain("px-3 py-1.5");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button").className).toContain("px-4 py-2");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button").className).toContain("px-6 py-3");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("custom-class");
  });

  it("defaults to type button", () => {
    render(<Button>Default Type</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("allows type submit", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("has focus ring for accessibility", () => {
    render(<Button>Focus Test</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("focus:ring-2");
    expect(button.className).toContain("focus:ring-sky-500");
  });
});
