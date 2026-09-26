"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useI18n } from "@/i18n/I18nProvider";
import type { Project } from "@/types/projects";
import { TechIcon, techLabels } from "./TechIcon";
import styles from "./ProjectDetailsDialog.module.css";

/** The screenshot at the top of the details, framed like a browser window. */
function Shot({ image, name }: { image: string; name: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Same as the card: the URL is data, so it is set here, not in the stylesheet.
  useEffect(() => {
    ref.current?.style.setProperty("--shot", `url("${image}")`);
  }, [image]);

  return (
    <div className={styles.frame}>
      <div className={styles.frameBar} aria-hidden="true">
        <span className={styles.frameDot} />
        <span className={styles.frameDot} />
        <span className={styles.frameDot} />
      </div>
      <div ref={ref} className={styles.shot} role="img" aria-label={name} />
    </div>
  );
}

/**
 * What opens when a project card is clicked, in the same dialog as the
 * package comparison: the screenshot, the story, what stands out, the
 * technologies, and buttons to the live site and to the source code.
 */
export function ProjectDetailsDialog({ project }: { project: Project }) {
  const { t } = useI18n();
  const labels = t.home.projectDetails;

  return (
    <DialogContent size="lg" className={styles.content}>
      <DialogHeader>
        <DialogTitle>{project.name}</DialogTitle>
        <DialogDescription>{project.description ?? project.summary}</DialogDescription>
      </DialogHeader>

      <Shot image={project.image} name={project.name} />

      {project.highlights && project.highlights.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.subheading}>{labels.highlights}</h3>
          <ul role="list" className={styles.highlights}>
            {project.highlights.map((item) => (
              <li key={item} className={styles.highlight}>
                <svg className={styles.checkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h3 className={styles.subheading}>{labels.builtWith}</h3>
        <ul role="list" className={styles.tech}>
          {project.tech.map((tech) => (
            <li key={tech} className={styles.techItem} data-tech={tech}>
              <TechIcon name={tech} size={16} />
              {techLabels[tech]}
            </li>
          ))}
        </ul>
      </section>

      <DialogFooter className={styles.footer}>
        <DialogClose asChild>
          <Button variant="ghost">{t.common.close}</Button>
        </DialogClose>
        {project.repo && (
          <Button asChild variant="secondary" className={styles.link}>
            <a href={project.repo} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2" />
              </svg>
              {labels.viewCode}
            </a>
          </Button>
        )}
        {project.url && (
          <Button asChild className={styles.link}>
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              {labels.visitSite}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}
