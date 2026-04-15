import { ArrowUpRight, BarChart2, TrendingUp, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const tools = [
    {
      title: "EMI Calculator",
      desc: "Calculate loan EMIs with partial payment simulation. See how quarterly or annual prepayments cut your tenure and save interest — with smart scenario suggestions.",
      icon: <BarChart2 className="w-5 h-5 text-[#c9b07a]" />,
      route: "/emi-calculator",
      tags: ["Finance", "INR", "Loans"],
      bgClasses: "bg-[#c9b07a]/10",
      soon: false,
    },
    {
      title: "3D Print Pricer",
      desc: "Quote calculator for FDM prints — material cost, time, markup, and margin. Built for the AM business.",
      icon: <Printer className="w-5 h-5 text-[#7ab88a]" />,
      route: "#",
      tags: ["Business", "3D Print"],
      bgClasses: "bg-[#7ab88a]/10",
      soon: true,
    },
    {
      title: "SIP Planner",
      desc: "Project SIP corpus with step-up rates, lump sum injections, and goal-based targets. XIRR-aware.",
      icon: <TrendingUp className="w-5 h-5 text-[#7aafcc]" />,
      route: "#",
      tags: ["Finance", "Investing"],
      bgClasses: "bg-[#7aafcc]/10",
      soon: true,
    },
  ];

  const liveCount = tools.filter((t) => !t.soon).length;

  return (
    <div className="max-w-[760px] mx-auto px-6 pt-16 pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-18 pb-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-base">
            ⚙️
          </div>
          <div className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
            Deepak <span className="text-primary">/ Tools</span>
          </div>
        </div>
        <div className="text-[10px] tracking-[0.22em] uppercase text-primary mb-4">
          Personal Dashboard
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-tight tracking-[-0.01em] mb-5">
          Built tools.<br />
          <em className="italic text-primary">Real use.</em>
        </h1>
        <p className="text-[11px] text-muted-foreground leading-[1.8] max-w-[420px]">
          A growing collection of financial, business, and productivity tools — built
          with AI, deployed for daily use.
        </p>
      </header>

      <div className="flex items-center gap-3 text-[9px] tracking-[0.22em] uppercase text-muted-foreground mb-5 after:content-[''] after:flex-1 after:h-px after:bg-border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        Tools — <span className="text-primary">{liveCount}</span> live
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mb-12">
        {tools.map((tool, i) => (
          <Link
            key={i}
            to={tool.route}
            className={`group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${
              tool.soon 
                ? "border-dashed border-border/50 hover:border-border cursor-default opacity-80" 
                : "bg-card border-border hover:border-primary/30 hover:bg-secondary hover:-translate-y-0.5"
            }`}
            style={{ animationDelay: `${350 + i * 100}ms` }}
            onClick={(e) => tool.soon && e.preventDefault()}
          >
            {/* Glow effect for live cards */}
            {!tool.soon && (
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at top left, rgba(201,176,122,0.08), transparent 60%)` }}
              />
            )}
            
            <div className="flex items-start justify-between mb-4 z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.bgClasses}`}>
                {tool.icon}
              </div>
              {!tool.soon ? (
                <div className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              ) : (
                <Badge variant="outline" className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground border-border bg-transparent shadow-none hover:bg-transparent">
                  Coming soon
                </Badge>
              )}
            </div>

            <h2 className={`font-serif text-[22px] font-normal leading-tight mb-2 z-10 ${tool.soon ? 'text-muted-foreground' : ''}`}>
              {tool.title}
            </h2>
            <p className="text-[10px] text-muted-foreground leading-[1.7] mb-5 flex-1 z-10">
              {tool.desc}
            </p>

            <div className="flex gap-1.5 flex-wrap z-10">
              {tool.tags.map((tag) => (
                <span key={tag} className="text-[9px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <footer className="border-t border-border pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
        <div className="text-[10px] text-[#404040] leading-[1.6]">
          deepak-parthasarathy99.github.io/personal-tools<br />
          <span className="text-[9px]">Updated {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} · Built with React & Tailwind</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-primary/50" />
      </footer>
    </div>
  );
}
