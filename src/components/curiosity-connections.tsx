"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./curiosity-connections.module.css";

const topics = [
  {
    id: "ai",
    label: "AI SYSTEMS",
    x: 4,
    y: 13,
    w: 19,
    color: "blue",
    angle: -3,
  },
  {
    id: "agents",
    label: "AGENTIC SYSTEMS",
    x: 32,
    y: 7,
    w: 27,
    color: "acid",
    angle: 2,
  },
  {
    id: "creative",
    label: "CREATIVE SOFTWARE",
    x: 66,
    y: 14,
    w: 30,
    color: "cream",
    angle: -2,
  },
  {
    id: "tools",
    label: "DEVELOPER TOOLS",
    x: 10,
    y: 39,
    w: 25,
    color: "sun",
    angle: 2,
  },
  {
    id: "browser",
    label: "BROWSERS",
    x: 43,
    y: 35,
    w: 17,
    color: "cyan",
    angle: -1,
  },
  {
    id: "security",
    label: "SECURITY",
    x: 75,
    y: 41,
    w: 17,
    color: "cream",
    angle: 3,
  },
  {
    id: "civic",
    label: "CIVIC TECHNOLOGY",
    x: 2,
    y: 69,
    w: 29,
    color: "cream",
    angle: -2,
  },
  {
    id: "experimental",
    label: "EXPERIMENTAL ENGINEERING",
    x: 37,
    y: 66,
    w: 39,
    color: "acid",
    angle: 1,
  },
  {
    id: "automation",
    label: "AUTOMATION",
    x: 78,
    y: 72,
    w: 20,
    color: "sun",
    angle: -2,
  },
  {
    id: "visual",
    label: "VISUAL SYSTEMS / INTERACTION",
    x: 24,
    y: 88,
    w: 44,
    color: "cyan",
    angle: 1,
  },
] as const;

const relationships = [
  {
    id: "agents",
    topics: ["ai", "agents"],
    note: "What is a system doing between steps?",
    color: "blue",
  },
  {
    id: "tools",
    topics: ["agents", "tools"],
    note: "Can a tool make a system easier to inspect?",
    color: "acid",
  },
  {
    id: "browser-security",
    topics: ["browser", "security"],
    note: "What should a browser notice before a person does?",
    color: "cyan",
  },
  {
    id: "browser-automation",
    topics: ["browser", "automation"],
    note: "Where does helpful automation need a boundary?",
    color: "sun",
  },
  {
    id: "civic-visual",
    topics: ["civic", "visual"],
    note: "How can a city's signal become easier to read?",
    color: "sun",
  },
  {
    id: "creative-experimental",
    topics: ["creative", "experimental"],
    note: "Can the instrument change the idea?",
    color: "acid",
  },
  {
    id: "visual-creative",
    topics: ["visual", "creative"],
    note: "What changes when the interface is part of the medium?",
    color: "cyan",
  },
  {
    id: "automation-tools",
    topics: ["automation", "tools"],
    note: "Which small task is worth handing over?",
    color: "blue",
  },
] as const;

type TopicId = (typeof topics)[number]["id"];
type Position = { x: number; y: number };
type DragState = {
  index: number;
  field: DOMRect;
  offsetX: number;
  offsetY: number;
  moved: boolean;
};

const initialPositions = Object.fromEntries(
  topics.map(({ id, x, y }) => [id, { x, y }]),
) as Record<TopicId, Position>;
const findRelationship = (first: TopicId, second: TopicId) =>
  relationships.find(
    ({ topics: [a, b] }) =>
      (a === first && b === second) || (a === second && b === first),
  );

export function CuriosityConnections() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const topicRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragRef = useRef<DragState | null>(null);
  const boundsRef = useRef<Array<{ x: number; y: number }>>([]);
  const proximityFrame = useRef<number | null>(null);
  const skipClickRef = useRef(false);
  const [positions, setPositions] = useState(initialPositions);
  const [selected, setSelected] = useState<TopicId | null>(null);
  const [activeRelationship, setActiveRelationship] = useState<
    (typeof relationships)[number] | null
  >(null);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState(
    "Choose two topics, or move one close to another.",
  );

  useEffect(() => {
    const measure = () => {
      boundsRef.current = topicRefs.current.map((el) => {
        const r = el?.getBoundingClientRect();
        return {
          x: (r?.left ?? 0) + (r?.width ?? 0) / 2,
          y: (r?.top ?? 0) + (r?.height ?? 0) / 2,
        };
      });
    };
    const observer = new ResizeObserver(measure);
    if (fieldRef.current) observer.observe(fieldRef.current);
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", measure);
      if (proximityFrame.current !== null)
        cancelAnimationFrame(proximityFrame.current);
    };
  }, [positions]);
  const proximity = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      dragRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const { clientX: x, clientY: y } = event;
    if (proximityFrame.current !== null)
      cancelAnimationFrame(proximityFrame.current);
    proximityFrame.current = requestAnimationFrame(() => {
      topicRefs.current.forEach((el, i) => {
        const b = boundsRef.current[i];
        if (!el || !b) return;
        const weight = Math.max(0, 1 - Math.hypot(x - b.x, y - b.y) / 220);
        el.style.setProperty("--magnet-x", `${(x - b.x) * weight * 0.06}px`);
        el.style.setProperty("--magnet-y", `${(y - b.y) * weight * 0.06}px`);
      });
      proximityFrame.current = null;
    });
  };

  const connect = (first: TopicId, second: TopicId) => {
    const relationship = findRelationship(first, second);
    setSelected(null);
    setActiveRelationship(relationship ?? null);
    if (relationship) {
      setDiscovered((previous) =>
        previous.includes(relationship.id)
          ? previous
          : [...previous, relationship.id],
      );
      setAnnouncement(relationship.note);
    } else {
      setAnnouncement(
        "That collision has no note attached. Try another combination.",
      );
    }
  };

  const chooseTopic = (id: TopicId) => {
    if (!selected || selected === id) {
      setSelected(selected === id ? null : id);
      setActiveRelationship(null);
      setAnnouncement(
        selected === id
          ? "Choose two topics, or move one close to another."
          : "Now choose a second topic.",
      );
      return;
    }
    connect(selected, id);
  };

  const onPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia("(pointer: fine) and (min-width: 768px)").matches ||
      event.button !== 0
    )
      return;
    const button = event.currentTarget;
    const field = fieldRef.current;
    if (!field) return;
    const buttonRect = button.getBoundingClientRect();
    dragRef.current = {
      index,
      field: field.getBoundingClientRect(),
      offsetX: event.clientX - buttonRect.left,
      offsetY: event.clientY - buttonRect.top,
      moved: false,
    };
    button.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx =
      event.clientX -
      (drag.field.left +
        (positions[topics[drag.index].id].x / 100) * drag.field.width +
        drag.offsetX);
    const dy =
      event.clientY -
      (drag.field.top +
        (positions[topics[drag.index].id].y / 100) * drag.field.height +
        drag.offsetY);
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    const x = Math.max(
      0,
      Math.min(
        100 - topics[drag.index].w,
        ((event.clientX - drag.field.left - drag.offsetX) / drag.field.width) *
          100,
      ),
    );
    const y = Math.max(
      0,
      Math.min(
        88,
        ((event.clientY - drag.field.top - drag.offsetY) / drag.field.height) *
          100,
      ),
    );
    event.currentTarget.style.setProperty("--x", `${x}%`);
    event.currentTarget.style.setProperty("--y", `${y}%`);
  };

  const finishDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.index !== index) return;
    dragRef.current = null;
    if (!drag.moved) return;

    const button = event.currentTarget;
    const xValue = Number.parseFloat(button.style.getPropertyValue("--x"));
    const yValue = Number.parseFloat(button.style.getPropertyValue("--y"));
    const x = Number.isFinite(xValue) ? xValue : positions[topics[index].id].x;
    const y = Number.isFinite(yValue) ? yValue : positions[topics[index].id].y;
    setPositions((previous) => ({ ...previous, [topics[index].id]: { x, y } }));

    const draggedRect = button.getBoundingClientRect();
    const centerX = draggedRect.left + draggedRect.width / 2;
    const centerY = draggedRect.top + draggedRect.height / 2;
    let nearest: { id: TopicId; distance: number } | undefined;
    for (
      let candidateIndex = 0;
      candidateIndex < topicRefs.current.length;
      candidateIndex += 1
    ) {
      const candidate = topicRefs.current[candidateIndex];
      if (!candidate || candidateIndex === index) continue;
      const rect = candidate.getBoundingClientRect();
      const distance = Math.hypot(
        centerX - (rect.left + rect.width / 2),
        centerY - (rect.top + rect.height / 2),
      );
      if (!nearest || distance < nearest.distance)
        nearest = { id: topics[candidateIndex].id, distance };
    }
    if (nearest && nearest.distance < Math.max(110, drag.field.width * 0.14)) {
      connect(topics[index].id, nearest.id);
    } else {
      setSelected(topics[index].id);
      setActiveRelationship(null);
      setAnnouncement(
        "A thought moved. Bring it close to another to see what connects.",
      );
    }

    skipClickRef.current = true;
    window.setTimeout(() => {
      skipClickRef.current = false;
    }, 0);
  };

  const activePath =
    activeRelationship &&
    (() => {
      const [firstId, secondId] = activeRelationship.topics;
      const firstTopic = topics.find((topic) => topic.id === firstId)!;
      const secondTopic = topics.find((topic) => topic.id === secondId)!;
      const first = positions[firstId];
      const second = positions[secondId];
      const x1 = (first.x + firstTopic.w * 0.5) * 10;
      const y1 = (first.y + 4) * 5.6;
      const x2 = (second.x + secondTopic.w * 0.5) * 10;
      const y2 = (second.y + 4) * 5.6;
      const bend = Math.max(28, Math.abs(x2 - x1) * 0.2);
      return `M ${x1} ${y1} C ${x1 + bend} ${y1 - 28}, ${x2 - bend} ${y2 + 28}, ${x2} ${y2}`;
    })();

  return (
    <div className={styles.workbench}>
      <div
        className={styles.field}
        ref={fieldRef}
        onPointerMove={proximity}
        onPointerLeave={() =>
          topicRefs.current.forEach((el) => {
            el?.style.setProperty("--magnet-x", "0px");
            el?.style.setProperty("--magnet-y", "0px");
          })
        }
        data-active={activeRelationship?.id ?? "none"}
        data-selected={selected ?? "none"}
      >
        <svg
          className={styles.routes}
          viewBox="0 0 1000 560"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className={styles.routeGhost}
            d="M74 95 C225 86 269 236 470 218 S752 386 892 418"
          />
          <path
            className={styles.routeMain}
            d={activePath ?? "M0 0"}
            data-visible={Boolean(activePath)}
          />
          <circle className={styles.routePin} cx="74" cy="95" r="4" />
          <circle className={styles.routePin} cx="892" cy="418" r="4" />
        </svg>

        {activeRelationship && (
          <div
            key={activeRelationship.id}
            className={styles.relationshipVisual}
            data-kind={activeRelationship.id}
            aria-hidden="true"
          >
            <svg viewBox="0 0 500 270">
              {activeRelationship.id.startsWith("browser") ? (
                <g>
                  <path d="M35 20h430v230H35zM35 60h430M65 40h65" />
                  <rect x="195" y="100" width="140" height="95" />
                  <path d="M235 145l20 20 45-50" />
                </g>
              ) : activeRelationship.id === "civic-visual" ? (
                <g>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <path
                      key={i}
                      d={`M${45 + (i % 3) * 140} ${65 + Math.floor(i / 3) * 100}l45-25 65 30-45 28z`}
                    />
                  ))}
                  <path d="M30 235Q250-95 470 180" strokeDasharray="4 7" />
                </g>
              ) : (
                <g>
                  {[0, 1, 2].map((i) => (
                    <path
                      key={i}
                      d={`M40 ${70 + i * 55}H${130 + i * 55}V${45 + i * 45}H450`}
                    />
                  ))}
                  <circle cx="260" cy="155" r="12" />
                </g>
              )}
            </svg>
            <span>{activeRelationship.note}</span>
          </div>
        )}
        <div
          className={styles.topics}
          role="group"
          aria-label="Areas that keep pulling my attention"
        >
          {topics.map((topic, index) => {
            const position = positions[topic.id];
            const isConnected =
              activeRelationship !== null &&
              (activeRelationship.topics[0] === topic.id ||
                activeRelationship.topics[1] === topic.id);
            const partnerId =
              isConnected && activeRelationship
                ? activeRelationship.topics[0] === topic.id
                  ? activeRelationship.topics[1]
                  : activeRelationship.topics[0]
                : null;
            const partner = partnerId
              ? topics.find((candidate) => candidate.id === partnerId)
              : null;
            const partnerPosition = partnerId ? positions[partnerId] : null;
            const pullX =
              partner && partnerPosition
                ? Math.sign(partnerPosition.x - position.x) * 11
                : 0;
            const pullY =
              partner && partnerPosition
                ? Math.sign(partnerPosition.y - position.y) * 7
                : 0;
            return (
              <button
                key={topic.id}
                ref={(element) => {
                  topicRefs.current[index] = element;
                }}
                className={styles.topic}
                type="button"
                data-topic={topic.id}
                data-tone={topic.color}
                data-angle={topic.angle}
                data-connected={isConnected}
                data-current={selected === topic.id}
                aria-pressed={selected === topic.id || isConnected}
                style={
                  {
                    "--x": `${position.x}%`,
                    "--y": `${position.y}%`,
                    "--w": `${topic.w}%`,
                    "--angle": `${topic.angle}deg`,
                    "--pull-x": `${pullX}px`,
                    "--pull-y": `${pullY}px`,
                  } as CSSProperties
                }
                onPointerDown={(event) => onPointerDown(event, index)}
                onPointerMove={onPointerMove}
                onPointerUp={(event) => finishDrag(event, index)}
                onPointerCancel={(event) => finishDrag(event, index)}
                onClick={() => {
                  if (skipClickRef.current) return;
                  chooseTopic(topic.id);
                }}
              >
                <span>{topic.label}</span>
                <span className={styles.topicCross} aria-hidden="true">
                  ×
                </span>
              </button>
            );
          })}
        </div>

        <p className={styles.fieldTag} aria-hidden="true">
          AN OPEN FIELD OF ATTENTION
        </p>
        {discovered.length >= 3 && (
          <p className={styles.secretNote} aria-live="polite">
            okay, now you’re thinking like me.
          </p>
        )}
      </div>

      <div className={styles.readout}>
        <span className={styles.readoutMark} aria-hidden="true">
          ↳
        </span>
        <p aria-live="polite" aria-atomic="true">
          {activeRelationship?.note ?? announcement}
        </p>
        <span className={styles.instruction}>
          Drag on desktop · choose two on touch or keyboard
        </span>
      </div>
      <p className={styles.relationshipList}>
        These are real recurring interests: AI and agents, creative software,
        developer tools, browsers and security, civic technology, experimental
        engineering, automation, and visual interaction systems.
      </p>
    </div>
  );
}
