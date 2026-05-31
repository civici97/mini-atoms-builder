import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { BuilderWorkspace } from "./BuilderWorkspace";

describe("BuilderWorkspace", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders a Chinese Atoms-like workspace shell", () => {
    render(<BuilderWorkspace />);

    expect(screen.getByText("Atoms 工作台")).toBeInTheDocument();
    expect(screen.getByText("AI 团队")).toBeInTheDocument();
    expect(screen.getByText("我的应用")).toBeInTheDocument();
    expect(screen.getByText("应用预览")).toBeInTheDocument();
    expect(screen.getByText("代码文件")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "开始生成" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "继续迭代" })
    ).toBeInTheDocument();
  });
});
