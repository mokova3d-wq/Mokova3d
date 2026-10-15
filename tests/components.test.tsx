import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card, CardBody } from "@/components/common/Card";

describe("Foundational UI Components", () => {
  it("renders Button with primary styling and children", () => {
    render(<Button variant="primary">Make an Offer</Button>);
    const button = screen.getByRole("button", { name: /make an offer/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-amber-500");
  });

  it("renders Button in disabled state when isLoading is true", () => {
    render(<Button isLoading>Submitting</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("renders Badge variants correctly", () => {
    render(<Badge variant="haggle">Haggling Welcome</Badge>);
    const badge = screen.getByText(/haggling welcome/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-amber-400");
  });

  it("renders Card container with content", () => {
    render(
      <Card>
        <CardBody>
          <p>Product Specifications</p>
        </CardBody>
      </Card>
    );
    expect(screen.getByText("Product Specifications")).toBeInTheDocument();
  });
});
