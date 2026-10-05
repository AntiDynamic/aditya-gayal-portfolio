export const PROJECT_SELECT_EVENT = "folded-field:project-select";
export const PROJECT_RESET_EVENT = "folded-field:project-reset";

export function selectProject(index: number) {
  window.dispatchEvent(new CustomEvent(PROJECT_SELECT_EVENT, { detail: { index } }));
}

export function resetProject() {
  window.dispatchEvent(new Event(PROJECT_RESET_EVENT));
}
