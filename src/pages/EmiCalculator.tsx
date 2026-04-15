import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, Target, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtShort = (n: number) => {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + " L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "K";
  return "₹" + Math.round(n);
};
const fmtLoan = fmtShort;
const fmtMonths = (m: number) => {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return mo + " mo";
  if (mo === 0) return y + " yr";
  return y + "y " + mo + "m";
};

function calcEMI(P: number, r: number, n: number) {
  if (r === 0) return P / n;
  const R = r / 12 / 100;
  return (P * R * Math.pow(1 + R, n)) / (Math.pow(1 + R, n) - 1);
}

function simulateLoan(
  P: number,
  annualRate: number,
  maxMonths: number,
  extraFn: (m: number) => number,
) {
  const R = annualRate / 12 / 100;
  const emi = calcEMI(P, annualRate, maxMonths);
  let balance = P;
  let month = 0;
  let totalInterest = 0;
  const cap = maxMonths * 3;

  while (balance > 0.5 && month < cap) {
    month += 1;
    const interest = balance * R;
    totalInterest += interest;
    let principal = emi - interest;
    if (principal < 0) principal = 0;
    balance -= principal;
    const extra = extraFn(month);
    balance = Math.max(0, balance - extra);
  }

  return { months: month, totalInterest };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Frequency = "monthly" | "quarterly" | "yearly" | "random";

const FREQUENCY_OPTIONS: { id: Frequency; label: string }[] = [
  { id: "monthly", label: "Every month" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Once a year" },
  { id: "random", label: "Custom months" },
];

type SliderFieldProps = {
  label: string;
  valueLabel: string;
  minLabel: string;
  maxLabel: string;
  value: number[];
  min: number;
  max: number;
  step: number;
  onChange: (value: number[]) => void;
};

function SliderField({
  label,
  valueLabel,
  minLabel,
  maxLabel,
  value,
  min,
  max,
  step,
  onChange,
}: SliderFieldProps) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-white/72 p-4 shadow-none sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </div>
        <Badge
          variant="outline"
          className="rounded-full border-brand/20 bg-brand/10 px-3 py-1 text-sm font-medium text-brand"
        >
          {valueLabel}
        </Badge>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(nextValue) =>
          onChange(Array.isArray(nextValue) ? [...nextValue] : [nextValue])
        }
        className="py-2"
      />
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

type MetricTileProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success";
};

function MetricTile({ label, value, hint, tone = "default" }: MetricTileProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border p-4",
        tone === "success"
          ? "border-success/20 bg-success/10"
          : "border-border/70 bg-white/72",
      )}
    >
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-3 text-2xl font-semibold tracking-tight",
          tone === "success" ? "text-success" : "text-slate-900",
        )}
      >
        {value}
      </div>
      {hint ? <div className="mt-2 text-sm text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export default function EmiCalculator() {
  const [loan, setLoan] = useState<number[]>([1000000]);
  const [rate, setRate] = useState<number[]>([8.5]);
  const [tenure, setTenure] = useState<number[]>([5]);
  const [ppEnabled, setPpEnabled] = useState(false);
  const [freq, setFreq] = useState<Frequency>("monthly");
  const [ppAmount, setPpAmount] = useState<number | "">("");
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set([3, 6, 9, 12]));

  const P = loan[0];
  const r = rate[0];
  const years = tenure[0];
  const n = years * 12;

  const emi = useMemo(() => calcEMI(P, r, n), [P, r, n]);
  const total = emi * n;
  const baseInterest = total - P;
  const pPct = Math.round((P / total) * 100);
  const interestPct = 100 - pPct;
  const amountVal = Number(ppAmount) || 0;

  const getExtraFn = (freqVal: Frequency, amount: number, monthsSet: Set<number>) => {
    return (month: number) => {
      if (!amount || amount <= 0) return 0;
      if (freqVal === "monthly") return amount;
      if (freqVal === "quarterly") return month % 3 === 0 ? amount : 0;
      if (freqVal === "yearly") return month % 12 === 0 ? amount : 0;
      if (freqVal === "random") return monthsSet.has(((month - 1) % 12) + 1) ? amount : 0;
      return 0;
    };
  };

  const ppStats = useMemo(() => {
    if (!ppEnabled || amountVal <= 0) return null;
    const res = simulateLoan(P, r, n, getExtraFn(freq, amountVal, selectedMonths));
    const savedM = n - res.months;
    const savedI = baseInterest - res.totalInterest;
    return { res, savedM, savedI };
  }, [amountVal, P, baseInterest, freq, n, ppEnabled, r, selectedMonths]);

  const baseScenarioAmt = Math.round((emi * 0.1) / 1000) * 1000 || 5000;
  const smartScenarios = useMemo(
    () =>
      [
        { label: `${fmtShort(baseScenarioAmt)} extra monthly`, freq: "monthly" as Frequency, amount: baseScenarioAmt },
        {
          label: `${fmtShort(baseScenarioAmt * 2)} extra monthly`,
          freq: "monthly" as Frequency,
          amount: baseScenarioAmt * 2,
        },
        {
          label: `${fmtShort(baseScenarioAmt * 3)} extra quarterly`,
          freq: "quarterly" as Frequency,
          amount: baseScenarioAmt * 3,
        },
        {
          label: `${fmtShort(baseScenarioAmt * 6)} extra yearly`,
          freq: "yearly" as Frequency,
          amount: baseScenarioAmt * 6,
        },
        {
          label: `${fmtShort(baseScenarioAmt * 12)} yearly lump sum`,
          freq: "yearly" as Frequency,
          amount: baseScenarioAmt * 12,
        },
      ]
        .map((scenario) => {
          const res = simulateLoan(P, r, n, getExtraFn(scenario.freq, scenario.amount, new Set()));
          const savedM = n - res.months;
          const savedI = baseInterest - res.totalInterest;
          return { ...scenario, savedM, savedI };
        })
        .filter((scenario) => scenario.savedM > 0),
    [P, baseScenarioAmt, baseInterest, emi, n, r],
  );

  const toggleMonth = (month: number) => {
    const next = new Set(selectedMonths);
    if (next.has(month)) {
      next.delete(month);
    } else {
      next.add(month);
    }
    setSelectedMonths(next);
  };

  const comparisonWidth = Math.max(
    4,
    Math.round(((ppStats?.res.totalInterest ?? baseInterest) / baseInterest) * 100),
  );

  const insights = ppStats
    ? [
        {
          title: "Start early when possible",
          body: `Interest is front-loaded, so an extra ${fmtShort(amountVal)} paid early has a stronger impact than the same amount added near the end.`,
        },
        ...(ppStats.savedM >= 12
          ? [
              {
                title: "You free up future cash flow",
                body: `This plan closes the loan about ${fmtMonths(ppStats.savedM)} earlier, which means your EMI budget unlocks sooner.`,
              },
            ]
          : []),
        ...(freq !== "monthly"
          ? [
              {
                title: "Monthly beats sporadic",
                body: "Smaller payments made more often bring principal down sooner and reduce compounding faster.",
              },
            ]
          : []),
        ...(ppStats.savedI > 100000
          ? [
              {
                title: "Put the saved interest to work",
                body: `Avoiding roughly ${fmtShort(ppStats.savedI)} in interest can become a strong SIP or emergency fund contribution.`,
              },
            ]
          : []),
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-5 rounded-full px-3 text-muted-foreground",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <Badge
          variant="outline"
          className="rounded-full border-brand/20 bg-brand/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-brand"
        >
          Financial Calculator
        </Badge>
        <h1 className="mt-4 max-w-3xl text-4xl leading-none text-slate-900 sm:text-5xl">
          Plan your EMI with a cleaner view of what prepayments really change.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          Tune the core loan inputs, then layer on partial payments to see how much
          time and interest you can realistically cut.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <div className="space-y-6">
          <Card className="animate-in gap-0 border-border/70 bg-white/80 py-0 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] backdrop-blur fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
              <CardTitle className="font-sans text-2xl font-semibold tracking-tight text-slate-900">
                Loan inputs
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                Adjust the three inputs below to update the repayment summary in real
                time.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 px-5 pb-6 sm:px-6">
              <SliderField
                label="Loan amount"
                valueLabel={fmtLoan(P)}
                minLabel="₹50K"
                maxLabel="₹1 Cr"
                value={loan}
                min={50000}
                max={10000000}
                step={50000}
                onChange={setLoan}
              />
              <SliderField
                label="Interest rate"
                valueLabel={`${r.toFixed(1)}% p.a.`}
                minLabel="1%"
                maxLabel="30%"
                value={rate}
                min={1}
                max={30}
                step={0.1}
                onChange={setRate}
              />
              <SliderField
                label="Loan tenure"
                valueLabel={`${years} ${years === 1 ? "year" : "years"}`}
                minLabel="1 year"
                maxLabel="30 years"
                value={tenure}
                min={1}
                max={30}
                step={1}
                onChange={setTenure}
              />
            </CardContent>
            <CardFooter className="flex items-center gap-3 border-t border-border/70 bg-secondary/55 px-5 py-4 sm:px-6">
              <div className="flex size-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Info className="size-4" />
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Calculations use the reducing balance method, so the summary tracks how
                principal and interest shift over time.
              </p>
            </CardFooter>
          </Card>

          <Card className="animate-in gap-0 border-border/70 bg-white/80 py-0 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] backdrop-blur fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
            <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-success/12 text-success">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="font-sans text-2xl font-semibold tracking-tight text-slate-900">
                      Partial payment planner
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-600">
                      Switch this on to model recurring prepayments and compare smarter
                      payoff paths.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-border/70 bg-white/72 px-4 py-2">
                  <span className="text-sm font-medium text-slate-700">Enable</span>
                  <Switch checked={ppEnabled} onCheckedChange={setPpEnabled} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-5 px-5 pb-6 sm:px-6">
              {ppEnabled ? (
                <div className="rounded-[28px] border border-border/70 bg-white/72 p-4 sm:p-5">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Payment frequency
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {FREQUENCY_OPTIONS.map((option) => (
                      <Button
                        key={option.id}
                        type="button"
                        variant={freq === option.id ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "rounded-full px-4",
                          freq !== option.id && "bg-white/70",
                        )}
                        onClick={() => setFreq(option.id)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-5 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Extra payment amount
                  </div>
                  <div className="relative mt-3">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="25000"
                      value={ppAmount}
                      onChange={(event) =>
                        setPpAmount(event.target.value ? Number(event.target.value) : "")
                      }
                      className="h-12 rounded-2xl border-border/80 bg-white pl-8 text-base shadow-none"
                    />
                  </div>

                  {freq === "random" ? (
                    <div className="mt-5">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                        Select custom months
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                        {MONTHS.map((month, index) => {
                          const active = selectedMonths.has(index + 1);
                          return (
                            <Button
                              key={month}
                              type="button"
                              variant={active ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "h-10 rounded-2xl uppercase tracking-[0.18em]",
                                !active && "bg-white/70 text-muted-foreground",
                              )}
                              onClick={() => toggleMonth(index + 1)}
                            >
                              {month}
                            </Button>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {selectedMonths.size} month(s) selected, roughly{" "}
                        {fmtShort(amountVal * selectedMonths.size)} paid each year.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-border/80 bg-muted/35 p-5">
                  <div className="text-sm font-medium text-slate-900">
                    Partial payment is currently off.
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Turn it on when you want to test extra monthly, quarterly, yearly,
                    or custom prepayments against the base loan.
                  </p>
                </div>
              )}

              {ppStats ? (
                <div className="rounded-[28px] border border-success/20 bg-success/10 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-success">
                    <Badge
                      variant="outline"
                      className="rounded-full border-success/20 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-success"
                    >
                      Active savings plan
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MetricTile
                      label="New tenure"
                      value={fmtMonths(ppStats.res.months)}
                      hint="Estimated closeout"
                      tone="success"
                    />
                    <MetricTile
                      label="Time saved"
                      value={ppStats.savedM > 0 ? fmtMonths(ppStats.savedM) : "0 mo"}
                      hint="Compared with base plan"
                    />
                    <MetricTile
                      label="Interest saved"
                      value={ppStats.savedI > 0 ? fmtShort(ppStats.savedI) : "₹0"}
                      hint="Estimated reduction"
                      tone="success"
                    />
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      <span>Interest comparison</span>
                      <span>{Math.max(0, Math.round((ppStats.savedI / baseInterest) * 100))}% saved</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-danger/18">
                      <div
                        className="h-full rounded-full bg-success transition-all duration-500"
                        style={{ width: `${comparisonWidth}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span>
                        With partial payment:{" "}
                        <strong className="font-medium text-success">
                          {fmtShort(Math.max(0, ppStats.res.totalInterest))}
                        </strong>
                      </span>
                      <span>
                        Base plan:{" "}
                        <strong className="font-medium text-danger">
                          {fmtShort(baseInterest)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {insights.map((insight) => (
                      <div
                        key={insight.title}
                        className="rounded-2xl border border-white/60 bg-white/65 p-4"
                      >
                        <div className="text-sm font-medium text-slate-900">
                          {insight.title}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {insight.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[28px] border border-info/20 bg-info/10 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-info">
                  <Target className="size-4" />
                  Suggested prepayment scenarios
                </div>
                <div className="mt-4 grid gap-3">
                  {smartScenarios.map((scenario) => (
                    <div
                      key={scenario.label}
                      className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/68 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {scenario.label}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {scenario.freq} cadence
                        </div>
                      </div>
                      <div className="flex gap-3 sm:text-right">
                        <Badge
                          variant="outline"
                          className="rounded-full border-success/20 bg-success/10 px-3 py-1 text-sm font-medium text-success"
                        >
                          {fmtMonths(scenario.savedM)} faster
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-full border-info/20 bg-info/10 px-3 py-1 text-sm font-medium text-info"
                        >
                          {fmtShort(scenario.savedI)} saved
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both xl:sticky xl:top-6 xl:self-start">
          <Card className="gap-0 border-border/70 bg-white/85 py-0 shadow-[0_32px_80px_-40px_rgba(37,99,235,0.34)] backdrop-blur">
            <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
              <Badge
                variant="outline"
                className="w-fit rounded-full border-brand/20 bg-brand/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-brand"
              >
                Repayment summary
              </Badge>
              <div className="mt-4 rounded-[30px] border border-brand/20 bg-gradient-to-br from-brand/12 via-white to-white p-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Monthly EMI
                </div>
                <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                  {fmt(emi)}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Based on {fmtLoan(P)} borrowed over {years} {years === 1 ? "year" : "years"}.
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 px-5 pb-6 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <MetricTile
                  label="Principal"
                  value={fmt(P)}
                  hint={`${pPct}% of total repayment`}
                />
                <MetricTile
                  label="Interest"
                  value={fmt(baseInterest)}
                  hint={`${interestPct}% of total repayment`}
                />
                <MetricTile
                  label="Total payment"
                  value={fmt(total)}
                  hint={`${n} monthly payments`}
                />
              </div>

              <div className="rounded-[28px] border border-border/70 bg-white/72 p-4 sm:p-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Principal vs interest
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-danger/18">
                  <div
                    className="h-full rounded-full bg-success transition-all duration-500"
                    style={{ width: `${pPct}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="rounded-full border-success/20 bg-success/10 px-3 py-1 text-success"
                  >
                    Principal {pPct}%
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-danger/20 bg-danger/10 px-3 py-1 text-danger"
                  >
                    Interest {interestPct}%
                  </Badge>
                </div>
              </div>

              {ppStats ? (
                <div className="rounded-[28px] border border-success/20 bg-success/10 p-4 sm:p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-success">
                    With partial payments enabled
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-start justify-between rounded-2xl border border-white/60 bg-white/65 p-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Loan closes in</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-900">
                          {fmtMonths(ppStats.res.months)}
                        </div>
                      </div>
                      <Badge className="rounded-full bg-success px-3 py-1 text-success-foreground">
                        {fmtMonths(ppStats.savedM)} saved
                      </Badge>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white/65 p-4">
                      <div className="text-sm text-muted-foreground">
                        Estimated interest avoided
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-success">
                        {ppStats.savedI > 0 ? fmtShort(ppStats.savedI) : "₹0"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-border/80 bg-muted/35 p-4 sm:p-5">
                  <div className="text-sm font-medium text-slate-900">
                    Want to shorten the tenure?
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Turn on partial payments to compare early closeout plans and see
                    how much interest they can shave off.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-start gap-3 border-t border-border/70 bg-secondary/55 px-5 py-4 sm:px-6">
              <div className="flex size-8 items-center justify-center rounded-full bg-info/12 text-info">
                <Info className="size-4" />
              </div>
              <p className="text-sm leading-6 text-slate-600">
                These figures are indicative. Your lender may apply different rules for
                tenure reduction or EMI revision after each prepayment.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
