"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/types/projects";
import { TechIcon, techLabels } from "./TechIcon";
import styles from "./ProjectCard.module.css";

/**
 * One piece of recent work: a framed photo with the text overlaid on it. The
 * picture sits zoomed in and dimmed, and on hover it pulls back and lights
 * up, so hovering shows more of the shot rather than less.
 */
export function ProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);

  // The photo is a background rather than an <img> so it can be oversized
  // inside the frame; its URL is data, so it is set here instead of in the
  // stylesheet.
  useEffect(() => {
    ref.current?.style.setProperty("--photo", `url("${project.image}")`);
  }, [project.image]);

  return (
    <article className={styles.card}>
      <div ref={ref} className={styles.photo} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.body}>
        <h3 className={styles.name}>{project.name}</h3>
        <p className={styles.summary}>{project.summary}</p>
        <ul role="list" className={styles.tech}>
          {project.tech.map((tech) => (
            <li key={tech} className={styles.techItem} data-tech={tech}>
              <TechIcon name={tech} />
              <span className={styles.techName}>{techLabels[tech]}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
