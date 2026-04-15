import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, Target, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtShort = (n: number) => {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + ' L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + Math.round(n);
};
const fmtLoan = fmtShort;
const fmtMonths = (m: number) => {
  const y = Math.floor(m / 12), mo = m % 12;
  if (y === 0) return mo + ' mo';
  if (mo === 0) return y + ' yr';
  return y + 'y ' + mo + 'm';
};

function calcEMI(P: number, r: number, n: number) {
  if (r === 0) return P / n;
  const R = r / 12 / 100;
  return (P * R * Math.pow(1 + R, n)) / (Math.pow(1 + R, n) - 1);
}

function simulateLoan(P: number, annualRate: number, maxMonths: number, extraFn: (m: number) => number) {
  const R = annualRate / 12 / 100;
  const emi = calcEMI(P, annualRate, maxMonths);
  let balance = P, month = 0, totalInterest = 0;
  const cap = maxMonths * 3;
  while (balance > 0.5 && month < cap) {
    month++;
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

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function EmiCalculator() {
  const [loan, setLoan] = useState<number[]>([1000000]);
  const [rate, setRate] = useState<number[]>([8.5]);
  const [tenure, setTenure] = useState<number[]>([5]);

  const [ppEnabled, setPpEnabled] = useState(false);
  const [freq, setFreq] = useState<"monthly" | "quarterly" | "yearly" | "random">("monthly");
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

  const getExtraFn = (freqVal: string, amount: number, monthsSet: Set<number>) => (month: number) => {
    if (!amount || amount <= 0) return 0;
    if (freqVal === "monthly") return amount;
    if (freqVal === "quarterly") return month % 3 === 0 ? amount : 0;
    if (freqVal === "yearly") return month % 12 === 0 ? amount : 0;
    if (freqVal === "random") return monthsSet.has(((month - 1) % 12) + 1) ? amount : 0;
    return 0;
  };

  const amountVal = Number(ppAmount) || 0;

  const ppStats = useMemo(() => {
    if (!ppEnabled || amountVal <= 0) return null;
    const res = simulateLoan(P, r, n, getExtraFn(freq, amountVal, selectedMonths));
    const savedM = n - res.months;
    const savedI = baseInterest - res.totalInterest;
    return { res, savedM, savedI };
  }, [ppEnabled, amountVal, P, r, n, freq, selectedMonths, baseInterest]);

  // Handle month toggle
  const toggleMonth = (m: number) => {
    const next = new Set(selectedMonths);
    if (next.has(m)) next.delete(m); else next.add(m);
    setSelectedMonths(next);
  };

  const baseScenarioAmt = Math.round((emi * 0.10) / 1000) * 1000 || 5000;
  const smartScenarios = useMemo(() => [
    { label: `${fmtShort(baseScenarioAmt)} extra monthly`, freq: 'monthly', amount: baseScenarioAmt },
    { label: `${fmtShort(baseScenarioAmt * 2)} extra monthly`, freq: 'monthly', amount: baseScenarioAmt * 2 },
    { label: `${fmtShort(baseScenarioAmt * 3)} extra quarterly`, freq: 'quarterly', amount: baseScenarioAmt * 3 },
    { label: `${fmtShort(baseScenarioAmt * 6)} extra once a year`, freq: 'yearly', amount: baseScenarioAmt * 6 },
    { label: `${fmtShort(baseScenarioAmt * 12)} lump sum yearly`, freq: 'yearly', amount: baseScenarioAmt * 12 },
  ].map(s => {
    const res = simulateLoan(P, r, n, getExtraFn(s.freq, s.amount, new Set()));
    const savedM = n - res.months;
    const savedI = baseInterest - res.totalInterest;
    return { ...s, savedM, savedI };
  }).filter(s => s.savedM > 0), [P, r, n, baseInterest, emi, baseScenarioAmt]);


  return (
    <div className="w-full max-w-[520px] mx-auto px-4 py-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-[11px] tracking-widest uppercase transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="mb-9">
        <div className="text-[10px] tracking-[0.2em] uppercase text-primary mb-2">Financial Tool</div>
        <h1 className="font-serif text-4xl font-normal leading-[1.1]">EMI <em className="italic text-primary">Calculator</em></h1>
      </div>

      {/* Main Form Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
        <div className="p-7">
          <div className="flex items-center gap-2.5 text-[9px] tracking-[0.2em] uppercase text-primary mb-5 after:content-[''] after:flex-1 after:h-px after:bg-border">
            Loan Details
          </div>

          <div className="space-y-7 mb-7">
            <div>
              <div className="flex items-baseline justify-between mb-3 text-[10px] tracking-widest uppercase text-muted-foreground">
                <span>Loan Amount</span>
                <span className="text-[13px] font-medium text-primary tracking-normal">{fmtLoan(P)}</span>
              </div>
              <Slider min={50000} max={10000000} step={50000} value={loan} onValueChange={(v: any) => setLoan(v)} className="py-2" />
              <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
                <span>₹50K</span><span>₹1 Cr</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-3 text-[10px] tracking-widest uppercase text-muted-foreground">
                <span>Interest Rate</span>
                <span className="text-[13px] font-medium text-primary tracking-normal">{r.toFixed(1)}% p.a.</span>
              </div>
              <Slider min={1} max={30} step={0.1} value={rate} onValueChange={(v: any) => setRate(v)} className="py-2" />
              <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
                <span>1%</span><span>30%</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-3 text-[10px] tracking-widest uppercase text-muted-foreground">
                <span>Loan Tenure</span>
                <span className="text-[13px] font-medium text-primary tracking-normal">{years} {years === 1 ? 'Year' : 'Years'}</span>
              </div>
              <Slider min={1} max={30} step={1} value={tenure} onValueChange={(v: any) => setTenure(v)} className="py-2" />
              <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
                <span>1 Yr</span><span>30 Yrs</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-6" />

          <div className="flex items-center gap-2.5 text-[9px] tracking-[0.2em] uppercase text-primary mb-5 after:content-[''] after:flex-1 after:h-px after:bg-border">
            Without Partial Payment
          </div>

          <div className="grid grid-cols-2 gap-px bg-border rounded-xl overflow-hidden mb-5 border border-border">
            <div className="col-span-2 bg-[#c9b07a]/10 p-4 pb-5 text-center">
              <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mb-2">Monthly EMI</div>
              <div className="font-serif text-[32px] text-primary leading-none">{fmt(emi)}</div>
            </div>
            <div className="bg-card p-4 text-center">
              <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mb-2">Total Interest</div>
              <div className="font-sans text-xl text-foreground">{fmt(baseInterest)}</div>
            </div>
            <div className="bg-card p-4 text-center">
              <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mb-2">Total Payment</div>
              <div className="font-sans text-xl text-foreground">{fmt(total)}</div>
            </div>
          </div>

          <div>
            <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mb-2.5">Principal vs Interest</div>
            <div className="h-1.5 bg-[#e07070] rounded-full overflow-hidden mb-2.5">
              <div className="h-full bg-[#7ab88a] transition-all duration-500 ease-out" style={{ width: `${pPct}%` }} />
            </div>
            <div className="flex gap-5">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground tracking-widest border border-border rounded-lg px-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7ab88a]" />
                Principal <span className="text-foreground tracking-normal font-medium">{pPct}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground tracking-widest border border-border rounded-lg px-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#e07070]" />
                Interest <span className="text-foreground tracking-normal font-medium">{100 - pPct}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-7 py-3.5 border-t border-border flex items-center gap-2 bg-secondary/30">
          <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
          <p className="text-[10px] text-opacity-80 text-muted-foreground leading-snug">Calculated using reducing balance method. Results are indicative.</p>
        </div>
      </div>

      {/* Partial Payment Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4 animate-in fade-in slide-in-from-bottom-4 delay-150 fill-mode-both">
        <label className="flex items-center justify-between p-6 cursor-pointer hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-foreground mb-0.5">Partial Payment</div>
              <div className="text-[10px] text-muted-foreground">Reduce tenure & save on interest</div>
            </div>
          </div>
          <Switch checked={ppEnabled} onCheckedChange={setPpEnabled} />
        </label>

        {ppEnabled && (
          <div className="p-7 pt-2 border-t border-border animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mb-2.5 mt-2">Payment Frequency</div>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: "monthly", label: "Every Month" },
                { id: "quarterly", label: "Quarterly" },
                { id: "yearly", label: "Once a Year" },
                { id: "random", label: "Random Months" }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setFreq(p.id as any)}
                  className={`px-3.5 py-1.5 rounded-full border text-[10px] tracking-wide transition-colors ${
                    freq === p.id 
                      ? "bg-primary border-primary text-background font-medium" 
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mb-2.5">Extra Payment Amount (₹)</div>
            <div className="relative mb-5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">₹</span>
              <Input 
                type="number" 
                placeholder="e.g. 25000" 
                value={ppAmount} 
                onChange={(e) => setPpAmount(e.target.value ? Number(e.target.value) : "")}
                className="pl-7 bg-background h-11 rounded-xl text-sm border-border focus-visible:ring-primary/20"
              />
            </div>

            {freq === "random" && (
              <div className="mb-5 animate-in fade-in duration-300">
                <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mb-2.5">
                  Select Months <span className="lowercase tracking-normal text-muted-foreground/60">(repeats every year)</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-2">
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => toggleMonth(i + 1)}
                      className={`aspect-square flex items-center justify-center rounded-lg border text-[9px] tracking-widest uppercase transition-colors ${
                        selectedMonths.has(i + 1)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {selectedMonths.size} month(s)/year selected — {fmtShort(amountVal * selectedMonths.size)} annually
                </div>
              </div>
            )}

            {/* Savings Result */}
            {ppStats ? (
              <div className="bg-[#7ab88a]/10 border border-[#7ab88a]/20 rounded-xl p-4.5 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-3 gap-px bg-[#7ab88a]/20 rounded-lg overflow-hidden mb-4 border border-[#7ab88a]/10">
                  <div className="bg-[#7ab88a]/10 p-3.5">
                    <div className="text-[8px] tracking-widest uppercase text-muted-foreground mb-1.5">New Tenure</div>
                    <div className="font-serif text-[17px] text-[#7ab88a] leading-none">{fmtMonths(ppStats.res.months)}</div>
                  </div>
                  <div className="bg-background p-3.5">
                    <div className="text-[8px] tracking-widest uppercase text-muted-foreground mb-1.5">Time Saved</div>
                    <div className="font-serif text-[17px] text-foreground leading-none">{ppStats.savedM > 0 ? `−${fmtMonths(ppStats.savedM)}` : '—'}</div>
                  </div>
                  <div className="bg-background p-3.5">
                    <div className="text-[8px] tracking-widest uppercase text-muted-foreground mb-1.5">Interest Saved</div>
                    <div className="font-serif text-[17px] text-[#7ab88a] leading-none">{ppStats.savedI > 0 ? fmtShort(ppStats.savedI) : '—'}</div>
                  </div>
                </div>

                <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mb-2.5">Interest Comparison</div>
                <div className="h-2 rounded-full bg-border overflow-hidden mb-1.5 relative border border-border">
                  <div className="absolute inset-0 bg-[#e07070]/30" />
                  <div className="absolute left-0 top-0 h-full bg-[#7ab88a] transition-all duration-500" style={{ width: `${Math.max(4, Math.round(ppStats.res.totalInterest / baseInterest * 100))}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mb-4 font-mono pb-2 border-b border-[#7ab88a]/10">
                  <span>With partial: <strong className="text-[#7ab88a] font-medium tracking-wide">{fmtShort(Math.max(0, ppStats.res.totalInterest))}</strong></span>
                  <span>Without: <strong className="text-[#e07070] font-medium tracking-wide">{fmtShort(baseInterest)}</strong></span>
                </div>

                <div className="text-[9px] tracking-[0.16em] uppercase text-[#7ab88a] mb-3 flex items-center gap-1.5">
                  <Info className="w-3 h-3" /> Tips to maximize partial payments
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-[#7ab88a]/15 text-[10px]">⏰</div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed"><strong className="text-foreground tracking-wide font-medium">Timing matters.</strong> Interest is front-loaded — a ₹{fmtShort(amountVal)} prepayment in month 6 saves 2–3× more than in the final years.</div>
                  </div>
                  {ppStats.savedM >= 12 && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-[#7ab88a]/15 text-[10px]">📅</div>
                      <div className="text-[10px] text-muted-foreground leading-relaxed">You'll close the loan <strong className="text-foreground tracking-wide font-medium">{fmtMonths(ppStats.savedM)} earlier.</strong> That's freed up EMI cash!</div>
                    </div>
                  )}
                  {freq !== 'monthly' && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-[#7ab88a]/15 text-[10px]">🔄</div>
                      <div className="text-[10px] text-muted-foreground leading-relaxed"><strong className="text-foreground tracking-wide font-medium">Switch to monthly.</strong> Every month you delay, unpaid principal accumulates compounding interest.</div>
                    </div>
                  )}
                  {ppStats.savedI > 100000 && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-[#7ab88a]/15 text-[10px]">💰</div>
                      <div className="text-[10px] text-muted-foreground leading-relaxed">Saving <strong className="text-foreground tracking-wide font-medium">{fmtShort(ppStats.savedI)} in interest!</strong> Consider routing future savings into SIPs.</div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Smart Scenarios */}
            <div className="bg-[#7aafcc]/10 border border-[#7aafcc]/20 rounded-xl p-4.5 mt-3 animate-in fade-in slide-in-from-bottom-2 delay-100 duration-300 fill-mode-both">
              <div className="text-[9px] tracking-[0.18em] uppercase text-[#7aafcc] mb-3 flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Smart Scenarios
              </div>
              <div className="grid grid-cols-1 divide-y divide-[#7aafcc]/10 bg-black/10 rounded-xl px-4 py-2 border border-[#7aafcc]/10">
                {smartScenarios.map((s, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5">
                    <div className="text-[10px] text-muted-foreground leading-relaxed">
                      <strong className="text-foreground font-medium tracking-wide block">{s.label}</strong>
                      <span className="opacity-70">{s.freq}</span>
                    </div>
                    <div className="text-right pl-3">
                      <div className="text-[11px] font-medium text-[#7ab88a] whitespace-nowrap">−{fmtMonths(s.savedM)}</div>
                      <div className="text-[9px] text-[#7aafcc] opacity-90">{fmtShort(s.savedI)} saved</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
        <div className="px-7 py-3.5 border-t border-border flex items-center gap-2 bg-secondary/30">
          <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
          <p className="text-[10px] text-opacity-80 text-muted-foreground leading-snug">Extra payments go directly towards principal, cutting future interest compound.</p>
        </div>
      </div>
    </div>
  );
}
