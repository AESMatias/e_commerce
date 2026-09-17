"use client";

import { useActionState, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { DayPicker } from "react-day-picker";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RadioCard, RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { createBookingAction, type BookingFormState } from "@/lib/booking/actions";
import { formatDurationMinutes, formatSlotDate, formatSlotTime } from "@/lib/format";
import type { AvailableSlot } from "@/lib/scheduling";
import styles from "./BookingScheduler.module.css";

const INITIAL_STATE: BookingFormState = { status: "idle" };

type BookingMode = "scheduled" | "unscheduled";

/** Local calendar day of an instant, as YYYY-MM-DD. */
function dayKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-CA");
}

const subscribeToNothing = () => () => {};

/** False while rendering on the server, true once hydrated. */
function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

function parseDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function BookingScheduler({
  packageSlug,
  slots,
  summary,
  notice,
}: {
  packageSlug: string;
  slots: AvailableSlot[];
  /** Shown above the details step on screens without the side column. */
  summary?: ReactNode;
  /** Shown above the submit button on screens without the side column. */
  notice?: ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(createBookingAction, INITIAL_STATE);
  const [mode, setMode] = useState<BookingMode>("unscheduled");
  const [selectedDayKey, setSelectedDayKey] = useState<string | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  // Times are rendered in the visitor's timezone, which the server does not
  // know, so the picker only renders after mount to keep hydration stable.
  const isMounted = useIsMounted();

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, AvailableSlot[]>();
    for (const slot of slots) {
      const key = dayKey(slot.startsAt);
      const existing = grouped.get(key);
      if (existing) existing.push(slot);
      else grouped.set(key, [slot]);
    }
    return grouped;
  }, [slots]);

  const availableDayKeys = useMemo(() => [...slotsByDay.keys()].toSorted(), [slotsByDay]);
  const activeDayKey = selectedDayKey ?? availableDayKeys[0];
  const daySlots = activeDayKey ? (slotsByDay.get(activeDayKey) ?? []) : [];
  const timezone = isMounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;

  const hasSlots = availableDayKeys.length > 0;
  const isScheduling = mode === "scheduled" && hasSlots;
  const canSubmit = isScheduling ? selectedSlot.length > 0 : true;

  const firstDay = parseDayKey(availableDayKeys[0] ?? dayKey(new Date()));
  const lastDay = parseDayKey(availableDayKeys.at(-1) ?? dayKey(new Date()));

  return (
    <form action={formAction} className={styles.scheduler}>
      <input type="hidden" name="packageSlug" value={packageSlug} />
      <input type="hidden" name="mode" value={isScheduling ? "scheduled" : "unscheduled"} />
      <input type="hidden" name="startsAt" value={isScheduling ? selectedSlot : ""} />

      <section className={styles.step}>
        <h2 className={styles.stepTitle}>
          <span className={styles.stepNumber}>1</span> How do you want to start?
        </h2>

        <RadioCardGroup
          aria-label="How to arrange the kickoff call"
          value={mode}
          onValueChange={(value) => {
            setMode(value as BookingMode);
            setSelectedSlot("");
          }}
          className={styles.modes}
        >
          <RadioCard
            value="scheduled"
            disabled={!hasSlots}
            className={styles.mode}
            indicatorClassName={styles.modeIndicator}
          >
            <span className={styles.modeTitle}>Pick a time now</span>
            <span className={styles.modeText}>
              {hasSlots
                ? "Choose a free slot in the calendar and it is yours once the deposit is paid."
                : "No times are available right now."}
            </span>
          </RadioCard>

          <RadioCard value="unscheduled" className={styles.mode} indicatorClassName={styles.modeIndicator}>
            <span className={styles.modeTitle}>I will get in touch</span>
            <span className={styles.modeText}>
              Skip the calendar. Book the package now and we agree on a time afterwards, by email
              or WhatsApp.
            </span>
          </RadioCard>
        </RadioCardGroup>
      </section>

      {isScheduling && (
        <>
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNumber}>2</span> Pick a date
            </h2>

            {isMounted ? (
              <DayPicker
                mode="single"
                required
                selected={activeDayKey ? parseDayKey(activeDayKey) : undefined}
                onSelect={(day) => {
                  if (!day) return;
                  setSelectedDayKey(dayKey(day));
                  setSelectedSlot("");
                }}
                weekStartsOn={1}
                showOutsideDays={false}
                startMonth={firstDay}
                endMonth={lastDay}
                disabled={(date) => !slotsByDay.has(dayKey(date))}
                classNames={{
                  root: styles.calendar,
                  months: styles.months,
                  month: styles.month,
                  month_caption: styles.caption,
                  caption_label: styles.captionLabel,
                  nav: styles.nav,
                  button_previous: styles.navButton,
                  button_next: styles.navButton,
                  month_grid: styles.grid,
                  weekdays: styles.weekdays,
                  weekday: styles.weekday,
                  week: styles.week,
                  day: styles.day,
                  day_button: styles.dayButton,
                  today: styles.today,
                  selected: styles.selected,
                  disabled: styles.disabledDay,
                  outside: styles.outside,
                  hidden: styles.hidden,
                }}
              />
            ) : (
              <div className={styles.calendarPlaceholder} />
            )}
          </section>

          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNumber}>3</span> Pick a time
            </h2>

            {isMounted && activeDayKey ? (
              <>
                <p className={styles.dayLabel}>
                  {formatSlotDate(daySlots[0]?.startsAt ?? new Date().toISOString(), timezone)}
                  <span className={styles.timezone}>Times shown in {timezone}</span>
                </p>
                <RadioCardGroup
                  aria-label="Available times"
                  value={selectedSlot}
                  onValueChange={setSelectedSlot}
                  className={styles.times}
                >
                  {daySlots.map((slot) => (
                    <RadioCard
                      key={slot.startsAt}
                      value={slot.startsAt}
                      className={styles.time}
                      indicatorClassName={styles.timeIndicator}
                    >
                      <span className={styles.timeValue}>{formatSlotTime(slot.startsAt, timezone)}</span>
                      <span className={styles.timeMeta}>
                        {formatDurationMinutes(slot.startsAt, slot.endsAt)}
                      </span>
                    </RadioCard>
                  ))}
                </RadioCardGroup>
              </>
            ) : (
              <p className={styles.hint}>Loading available times…</p>
            )}
          </section>
        </>
      )}

      {summary && <div className={styles.inline}>{summary}</div>}

      <section className={styles.step}>
        <h2 className={styles.stepTitle}>
          <span className={styles.stepNumber}>{isScheduling ? "4" : "2"}</span> Your details
        </h2>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fullName">
              Full name
            </label>
            <input className={styles.input} id="fullName" name="fullName" required maxLength={120} />
            {state.fieldErrors?.fullName && (
              <p className={styles.fieldError}>{state.fieldErrors.fullName}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              required
              maxLength={160}
            />
            {state.fieldErrors?.email && <p className={styles.fieldError}>{state.fieldErrors.email}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="company">
              Company <span className={styles.optional}>(optional)</span>
            </label>
            <input className={styles.input} id="company" name="company" maxLength={120} />
            {state.fieldErrors?.company && (
              <p className={styles.fieldError}>{state.fieldErrors.company}</p>
            )}
          </div>

          <div className={styles.fieldWide}>
            <label className={styles.label} htmlFor="projectNotes">
              What do you want to build? <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              className={styles.textarea}
              id="projectNotes"
              name="projectNotes"
              rows={4}
              maxLength={2000}
            />
            {state.fieldErrors?.projectNotes && (
              <p className={styles.fieldError}>{state.fieldErrors.projectNotes}</p>
            )}
          </div>
        </div>
      </section>

      {notice && <div className={styles.inline}>{notice}</div>}

      {state.fieldErrors?.startsAt && <p className={styles.formError}>{state.fieldErrors.startsAt}</p>}
      {state.message && <p className={styles.formError}>{state.message}</p>}

      <div className={styles.submit}>
        <Button type="submit" size="lg" disabled={isPending || !canSubmit}>
          {isPending ? "Reserving…" : isScheduling ? "Reserve this time" : "Continue to payment"}
        </Button>
        <p className={styles.hint}>
          {isScheduling
            ? "Your slot is held for 35 minutes while you pay the deposit."
            : "No time is booked yet: we arrange it together after checkout."}
        </p>
        <p className={styles.consent}>
          By continuing you accept the <Link href="/terms">Terms of Service</Link>, including the{" "}
          <Link href="/terms#refunds">deposit and refund policy</Link>, and the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </form>
  );
}
