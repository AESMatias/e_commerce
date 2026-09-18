import { interpolate, intlLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/server";
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

type UsageMeterProps = {
  label: string;
  usage: LimitUsage;
  timezone: string;
  now: Date;
  locale: Locale;
  t: Dictionary["admin"];
};

function UsageMeter({ label, usage, timezone, now, locale, t }: UsageMeterProps) {
  const exhausted = usage.used >= usage.limit;
  const resetTime = usage.resetsAt.toLocaleTimeString(intlLocale(locale), {
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
        {exhausted ? t.limitReached : ""}
        {interpolate(t.resetsIn, { countdown: formatCountdown(now, usage.resetsAt), time: resetTime })}
      </dd>
    </div>
  );
}

export async function AdvisorUsagePanel({ usage, timezone, now }: AdvisorUsagePanelProps) {
  const { locale, t: dictionary } = await getDictionary();
  const t = dictionary.admin;

  return (
    <section className={styles.panel} aria-labelledby="advisor-usage-title">
      <h2 id="advisor-usage-title" className={styles.title}>
        {t.usageTitle}
      </h2>
      <dl className={styles.grid}>
        <UsageMeter label={t.usageToday} usage={usage.daily} timezone={timezone} now={now} locale={locale} t={t} />
        <UsageMeter
          label={interpolate(t.usageWindow, { minutes: usage.window.windowMinutes })}
          usage={usage.window}
          timezone={timezone}
          now={now}
          locale={locale}
          t={t}
        />
        <div className={styles.card}>
          <dt className={styles.label}>{t.usagePerVisitor}</dt>
          <dd className={styles.value}>
            {usage.perIp.limit} <span className={styles.limit}>/ {usage.perIp.windowMinutes} min</span>
          </dd>
          <dd className={styles.meta}>{t.usagePerVisitorNote}</dd>
        </div>
      </dl>
    </section>
  );
}
