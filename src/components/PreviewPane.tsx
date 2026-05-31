"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import type { PreviewSchema } from "@/lib/types";

type PreviewPaneProps = {
  preview: PreviewSchema;
  device: "desktop" | "mobile";
};

export function PreviewPane({ preview, device }: PreviewPaneProps) {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const isMobile = device === "mobile";

  return (
    <div
      className={[
        "mx-auto h-full overflow-hidden border border-slate-200 bg-white shadow-panel",
        isMobile ? "max-w-[390px]" : "w-full"
      ].join(" ")}
      style={{ borderRadius: isMobile ? 28 : 8 }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-medium text-slate-500">
          {isMobile ? "手机预览" : "桌面预览"}
        </span>
      </div>

      <div
        className="min-h-[620px] p-6"
        style={{
          background: preview.theme.surface,
          color: preview.theme.ink
        }}
      >
        <section className="grid gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p
              className="mb-3 text-xs font-semibold uppercase"
              style={{ color: preview.theme.accent }}
            >
              {preview.hero.kicker}
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              {preview.hero.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {preview.hero.subtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {preview.actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => setLastAction(action.label)}
                  className={[
                    "inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition",
                    action.kind === "primary"
                      ? "text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  ].join(" ")}
                  style={
                    action.kind === "primary"
                      ? { background: preview.theme.accent }
                      : undefined
                  }
                >
                  {action.kind === "primary" ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                  {action.label}
                </button>
              ))}
            </div>
            <p className="mt-4 min-h-5 text-xs font-medium text-slate-500">
              {lastAction ? `刚刚执行：${lastAction}` : "等待交互"}
            </p>
          </div>

          <div
            className={[
              "grid gap-3",
              isMobile ? "grid-cols-1" : "grid-cols-3"
            ].join(" ")}
          >
            {preview.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3">
            {preview.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <h2 className="text-base font-semibold text-slate-950">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
