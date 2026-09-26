"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/Dialog";
import { useI18n } from "@/i18n/I18nProvider";
import type { Project } from "@/types/projects";
import { ProjectDetailsDialog } from "./ProjectDetailsDialog";
import { TechIcon, techLabels } from "./TechIcon";
import styles from "./ProjectCard.module.css";

/**
 * One piece of recent work: a framed photo with the text overlaid on it. The
 * picture sits zoomed in and dimmed, and on hover it pulls back and lights
 * up, so hovering shows more of the shot rather than less. A click anywhere
 * on the card opens its details (screenshot, story, links to the live site
 * and the code); the name is the button keyboard users reach.
 */
export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // The photo is a background rather than an <img> so it can be oversized
  // inside the frame; its URL is data, so it is set here instead of in the
  // stylesheet.
  useEffect(() => {
    ref.current?.style.setProperty("--photo", `url("${project.image}")`);
  }, [project.image]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <article className={styles.card} onClick={() => setOpen(true)}>
        <div ref={ref} className={styles.photo} aria-hidden="true" />
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.body}>
          <h3 className={styles.name}>
            <DialogTrigger className={styles.nameButton}>{project.name}</DialogTrigger>
          </h3>
          <p className={styles.summary}>{project.summary}</p>
          <ul role="list" className={styles.tech}>
            {project.tech.map((tech) => (
              <li key={tech} className={styles.techItem} data-tech={tech}>
                <TechIcon name={tech} />
                <span className={styles.techName}>{techLabels[tech]}</span>
              </li>
            ))}
          </ul>
          <span className={styles.open} aria-hidden="true">
            {t.home.projectDetails.open}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </article>

      <ProjectDetailsDialog project={project} />
    </Dialog>
  );
}
