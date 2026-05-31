import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { PreviewPane } from "./PreviewPane";
import type { PreviewSchema } from "@/lib/types";

const preview: PreviewSchema = {
  theme: {
    accent: "#2563eb",
    surface: "#ffffff",
    ink: "#101828"
  },
  hero: {
    kicker: "Mini Atoms 生成",
    title: "运营协作台",
    subtitle: "协调每日运营事项"
  },
  stats: [{ label: "待办任务", value: "18", tone: "blue" }],
  sections: [{ title: "智能分诊", body: "自动整理进入工作池的事项。" }],
  actions: [
    { label: "开始流程", kind: "primary" },
    { label: "保存版本", kind: "secondary" }
  ]
};

describe("PreviewPane", () => {
  it("renders the generated preview schema", () => {
    render(<PreviewPane preview={preview} device="desktop" />);

    expect(screen.getByText("运营协作台")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始流程" })).toBeInTheDocument();
  });

  it("shows action feedback when a preview action is clicked", async () => {
    render(<PreviewPane preview={preview} device="mobile" />);

    fireEvent.click(screen.getByRole("button", { name: "保存版本" }));

    expect(screen.getByText("刚刚执行：保存版本")).toBeInTheDocument();
  });
});
