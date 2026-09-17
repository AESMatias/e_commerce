import type { AdvisorUsage, LimitUsage } from "@/lib/rate-limit";
import styles from "./AdvisorUsagePanel.module.css";

type AdvisorUsagePanelProps = {
  usage: AdvisorUsage;
  timezone: string;
  now: Date;
};

function formatCountdown(from: Date, to: Date): string {
  const totalMinutes = Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

function UsageMeter({ label, usage, timezone, now }: { label: string; usage: LimitUsage; timezone: string; now: Date }) {
  const exhausted = usage.used >= usage.limit;
  const resetTime = usage.resetsAt.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={styles.card}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>
        {usage.used} <span className={styles.limit}>/ {usage.limit}</span>
      </dd>
      <dd>
        <progress
          className={styles.bar}
          data-exhausted={exhausted}
          aria-label={label}
          max={usage.limit}
          value={Math.min(usage.used, usage.limit)}
        />
      </dd>
      <dd className={styles.meta}>
        {exhausted ? "Limit reached · " : ""}
        Resets in {formatCountdown(now, usage.resetsAt)} ({resetTime})
      </dd>
    </div>
  );
}

export function AdvisorUsagePanel({ usage, timezone, now }: AdvisorUsagePanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="advisor-usage-title">
      <h2 id="advisor-usage-title" className={styles.title}>
        AI advisor limits
      </h2>
      <dl className={styles.grid}>
        <UsageMeter label="Today (all visitors)" usage={usage.daily} timezone={timezone} now={now} />
        <UsageMeter
          label={`Last ${usage.window.windowMinutes} min (all visitors)`}
          usage={usage.window}
          timezone={timezone}
          now={now}
        />
        <div className={styles.card}>
          <dt className={styles.label}>Per visitor</dt>
          <dd className={styles.value}>
            {usage.perIp.limit} <span className={styles.limit}>/ {usage.perIp.windowMinutes} min</span>
          </dd>
          <dd className={styles.meta}>Counted per server instance, so usage is not shown here.</dd>
        </div>
      </dl>
    </section>
  );
}
