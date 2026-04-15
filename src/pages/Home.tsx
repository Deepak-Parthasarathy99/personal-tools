import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Printer,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ToolTone = "brand" | "warning" | "info";

type Tool = {
  title: string;
  desc: string;
  icon: LucideIcon;
  route: string;
  tags: string[];
  tone: ToolTone;
  soon: boolean;
};

const tools: Tool[] = [
  {
    title: "EMI Calculator",
    desc: "Calculate monthly EMIs, compare principal versus interest, and see how prepayments shorten the loan in real terms.",
    icon: BarChart3,
    route: "/emi-calculator",
    tags: ["Finance", "INR", "Loans"],
    tone: "brand",
    soon: false,
  },
  {
    title: "3D Print Pricer",
    desc: "Estimate print jobs with time, material, and margin built in for faster quoting across repeat jobs.",
    icon: Printer,
    route: "#",
    tags: ["Business", "3D Print"],
    tone: "warning",
    soon: true,
  },
  {
    title: "SIP Planner",
    desc: "Model step-ups, goal targets, and long-term compounding so you can test different monthly contribution paths.",
    icon: TrendingUp,
    route: "#",
    tags: ["Finance", "Investing"],
    tone: "info",
    soon: true,
  },
];

const toneStyles: Record<
  ToolTone,
  {
    iconWrap: string;
    iconColor: string;
    border: string;
    glow: string;
    badge: string;
  }
> = {
  brand: {
    iconWrap: "bg-brand/12",
    iconColor: "text-brand",
    border: "group-hover:border-brand/35",
    glow: "from-brand/18 via-brand/6 to-transparent",
    badge: "border-brand/20 bg-brand/10 text-brand",
  },
  warning: {
    iconWrap: "bg-warning/12",
    iconColor: "text-warning",
    border: "group-hover:border-warning/30",
    glow: "from-warning/18 via-warning/6 to-transparent",
    badge: "border-warning/20 bg-warning/10 text-warning",
  },
  info: {
    iconWrap: "bg-info/12",
    iconColor: "text-info",
    border: "group-hover:border-info/30",
    glow: "from-info/18 via-info/6 to-transparent",
    badge: "border-info/20 bg-info/10 text-info",
  },
};

export default function Home() {
  const liveCount = tools.filter((tool) => !tool.soon).length;
  const plannedCount = tools.length - liveCount;
  const updatedLabel = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="overflow-hidden border-border/70 bg-white/80 shadow-[0_30px_80px_-38px_rgba(37,99,235,0.45)] backdrop-blur">
          <CardContent className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <Badge
                  variant="outline"
                  className="rounded-full border-brand/20 bg-brand/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-brand"
                >
                  Personal Tools Lab
                </Badge>
                <h1 className="mt-5 max-w-3xl text-4xl leading-none text-slate-900 sm:text-5xl lg:text-6xl">
                  A shadcn-first workspace for the calculators you actually use.
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  This dashboard now leans into a cleaner shadcn-style layout, softer
                  surfaces, and a sharper modern palette so each tool feels like part
                  of the same product instead of a loose collection.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/emi-calculator"
                    className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5")}
                  >
                    Open EMI Calculator
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="https://deepak-parthasarathy99.github.io/personal-tools"
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-full border-border/80 bg-white/70 px-5",
                    )}
                  >
                    Live Site
                    <ArrowUpRight className="size-4" />
                  </a>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <Card className="gap-2 border-border/70 bg-white/75 py-3 shadow-none">
                    <CardContent className="px-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        Live Now
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {liveCount}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="gap-2 border-border/70 bg-white/75 py-3 shadow-none">
                    <CardContent className="px-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        In Queue
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {plannedCount}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="gap-2 border-border/70 bg-white/75 py-3 shadow-none">
                    <CardContent className="px-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        Updated
                      </div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">
                        {updatedLabel}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="gap-3 border-0 bg-slate-950/95 py-0 text-slate-50 shadow-[0_28px_50px_-30px_rgba(15,23,42,0.7)]">
                <CardHeader className="px-6 pt-6">
                  <Badge className="w-fit rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100">
                    Design Refresh
                  </Badge>
                  <CardTitle className="mt-4 font-sans text-2xl font-semibold tracking-tight text-white">
                    Cleaner system, clearer hierarchy
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-slate-300">
                    Cards, badges, and controls now share the same visual language, so
                    future tools can drop in without feeling off-brand.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 px-6 pb-6">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      Palette
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="size-3 rounded-full bg-brand" />
                      <span className="size-3 rounded-full bg-info" />
                      <span className="size-3 rounded-full bg-success" />
                      <span className="size-3 rounded-full bg-warning" />
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-brand/25 via-brand/10 to-transparent p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Sparkles className="size-4" />
                      Ready for more calculators
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      The layout now supports compact cards, detailed tools, and richer
                      insights without needing a new design pass every time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-border/80 bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
            >
              Tool Shelf
            </Badge>
            <h2 className="mt-3 text-3xl leading-tight text-slate-900">
              Current tools and what&apos;s shipping next
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            The live tool is ready to use today. The rest are staged as the next
            modules in the same shadcn-based system.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool, index) => {
            const tone = toneStyles[tool.tone];
            const toolCard = (
              <Card
                className={cn(
                  "group relative h-full overflow-hidden border-border/70 bg-white/82 py-0 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.4)] backdrop-blur transition-all duration-300",
                  !tool.soon && "hover:-translate-y-1 hover:shadow-[0_32px_60px_-36px_rgba(37,99,235,0.35)]",
                  !tool.soon && tone.border,
                  tool.soon && "opacity-90",
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                    tone.glow,
                    !tool.soon && "group-hover:opacity-100",
                  )}
                />
                <CardHeader className="relative px-5 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-2xl",
                        tone.iconWrap,
                        tone.iconColor,
                      )}
                    >
                      <tool.icon className="size-5" />
                    </div>
                    {tool.soon ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/80 bg-white/75 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Coming Soon
                      </Badge>
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-white/70 text-slate-500 transition-colors duration-300 group-hover:text-brand">
                        <ArrowUpRight className="size-4" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="pt-5 font-sans text-2xl font-semibold tracking-tight text-slate-900">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-slate-600">
                    {tool.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative px-5 pb-5">
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                          tone.badge,
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );

            if (tool.soon) {
              return (
                <div
                  key={tool.title}
                  className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  style={{ animationDelay: `${200 + index * 90}ms` }}
                >
                  {toolCard}
                </div>
              );
            }

            return (
              <Link
                key={tool.title}
                to={tool.route}
                className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${200 + index * 90}ms` }}
              >
                {toolCard}
              </Link>
            );
          })}
        </div>
      </section>

      <Card className="animate-in fade-in slide-in-from-bottom-4 gap-0 border-border/70 bg-white/70 py-0 shadow-none duration-700 delay-300 fill-mode-both">
        <CardFooter className="flex flex-col items-start justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <div className="text-sm font-medium text-slate-900">
              deepak-parthasarathy99.github.io/personal-tools
            </div>
            <p className="text-sm text-slate-600">
              Built with React, Tailwind, and a shadcn-led component system.
            </p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-success/20 bg-success/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-success"
          >
            Modernized UI
          </Badge>
        </CardFooter>
      </Card>
    </main>
  );
}
