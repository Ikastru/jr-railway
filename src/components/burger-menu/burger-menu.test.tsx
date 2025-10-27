import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import React from 'react';
import BurgerMenu from './burger-menu';

describe("Rendering", function () {
  it("Correctly renders trigger", function() {
    render(<BurgerMenu><div>Привет</div></BurgerMenu>);
    const triggerElement = screen.getByText("Details...");
    expect(triggerElement).toBeInTheDocument();
  });

  it("Correctly renders its children", function () {
    render(<BurgerMenu><div>Привет</div></BurgerMenu>);
    const childElement = screen.getByText("Привет");
    expect(childElement).toBeInTheDocument();
  });

  it("Children are hidden by default", function() {
    render(<BurgerMenu><div>Привет</div></BurgerMenu>);
    const childElement = screen.getByText("Привет");
    expect(childElement).not.toBeVisible();
  });
});

describe("Behaviour", function() {
  it("Click on trigger makes child visible", function() {
    render(<BurgerMenu><div>Привет</div></BurgerMenu>);

    const triggerElement = screen.getByText("Details...");
    const childElement = screen.getByText("Привет");

    expect(childElement).not.toBeVisible();

    fireEvent(triggerElement, new MouseEvent("click"));

    expect(childElement).toBeVisible();
  });

  it("Secondary click on trigger makes child hidden", function() {
    render(<BurgerMenu><div>Привет</div></BurgerMenu>);

    const triggerElement = screen.getByText("Details...");
    const childElement = screen.getByText("Привет");

    expect(childElement).not.toBeVisible();

    fireEvent(triggerElement, new MouseEvent("click"));
    expect(childElement).toBeVisible();

    fireEvent(triggerElement, new MouseEvent("click"));
    expect(childElement).not.toBeVisible();
  });
});

