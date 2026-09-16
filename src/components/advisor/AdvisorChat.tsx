"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { isPackageRecommendation } from "@/types/advisor";
import { PackageRecommendationCard } from "./PackageRecommendationCard";
import styles from "./AdvisorChat.module.css";

const SUGGESTIONS = [
  "I run a bakery and want to start selling online.",
  "We get 200 WhatsApp messages a day and cannot keep up.",
  "I need competitor prices collected every week.",
];

export function AdvisorChat() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/advisor" }),
  });
  const [input, setInput] = useState("");
  // Keeps the border light on until the pulse that is playing finishes, so an
  // answer arriving mid-beat does not cut it off.
  const [isFinishingPulse, setIsFinishingPulse] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBusy = status === "submitted" || status === "streaming";
  const isGlowing = isBusy || isFinishingPulse;

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, status]);

  function send(text: string) {
    const value = text.trim();
    if (!value || isBusy) return;
    setInput("");
    setIsFinishingPulse(true);
    void sendMessage({ text: value });
  }

  /**
   * Fires at the end of every pulse (the animation lives on a pseudo-element,
   * whose events surface here). While the answer is still coming it keeps the
   * light on; once it has arrived, the pulse that is playing runs to its end
   * and no new one starts.
   */
  function handleAnimationIteration(event: AnimationEvent<HTMLDivElement>) {
    if (!event.animationName.includes("think-swell")) return;

    setIsFinishingPulse(isBusy);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  }

  return (
    <div
      className={styles.chat}
      data-busy={isGlowing ? "true" : undefined}
      onAnimationIteration={handleAnimationIteration}
    >
      <div className={styles.header}>
        <span className={styles.status} aria-hidden="true" />
        AI advisor
      </div>

      <div className={styles.messages} ref={scrollRef} aria-live="polite" aria-label="Conversation">
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Describe your business problem</p>
            <p className={styles.emptyText}>
              Tell the advisor what you are trying to solve and it will recommend the package that
              fits, with its price and timeline.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  size="sm"
                  className={styles.suggestion}
                  onClick={() => send(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cx(styles.message, message.role === "user" ? styles.user : styles.assistant)}
          >
            {message.parts.map((part, index) => {
              const key = `${message.id}-${index}`;

              if (part.type === "text") {
                return (
                  <p key={key} className={styles.text}>
                    {part.text}
                  </p>
                );
              }

              if (
                part.type === "tool-recommendPackage" &&
                part.state === "output-available" &&
                isPackageRecommendation(part.output)
              ) {
                return <PackageRecommendationCard key={key} recommendation={part.output} />;
              }

              return null;
            })}
          </div>
        ))}

        {status === "submitted" && (
          <div className={cx(styles.message, styles.assistant)}>
            <span className={styles.typing} aria-label="The advisor is typing">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </span>
          </div>
        )}

        {error && <p className={styles.error}>{error.message}</p>}
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <label className={styles.srOnly} htmlFor="advisor-input">
          Your message
        </label>
        <textarea
          id="advisor-input"
          className={styles.textarea}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you trying to build or solve?"
          rows={2}
          maxLength={500}
          disabled={isBusy}
        />
        <Button
          type="submit"
          className={styles.send}
          disabled={isBusy || input.trim().length === 0}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
