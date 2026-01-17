import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "./index";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies base styling", () => {
    render(<Card data-testid="card">Test</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("bg-[#181c24]");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border");
  });

  it("applies hover effects when hover prop is true", () => {
    render(
      <Card hover data-testid="card">
        Hoverable
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("hover:shadow-lg");
    expect(card.className).toContain("hover:scale-[1.02]");
  });

  it("does not apply hover effects by default", () => {
    render(<Card data-testid="card">No Hover</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).not.toContain("hover:shadow-lg");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);

    fireEvent.click(screen.getByText("Clickable"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("has button role when clickable", () => {
    render(<Card onClick={() => {}}>Clickable</Card>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has tabIndex when clickable for keyboard accessibility", () => {
    render(<Card onClick={() => {}}>Clickable</Card>);
    expect(screen.getByRole("button")).toHaveAttribute("tabIndex", "0");
  });

  it("handles Enter key when clickable", () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Pressable</Card>);

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("handles Space key when clickable", () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Pressable</Card>);

    fireEvent.keyDown(screen.getByRole("button"), { key: " " });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not have button role when not clickable", () => {
    render(<Card>Static</Card>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Card className="custom-card" data-testid="card">
        Custom
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("custom-card");
  });

  it("applies cursor-pointer when clickable", () => {
    render(<Card onClick={() => {}}>Clickable</Card>);
    const card = screen.getByRole("button");
    expect(card.className).toContain("cursor-pointer");
  });
});
