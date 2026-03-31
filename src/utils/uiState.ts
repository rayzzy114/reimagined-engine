export function shouldShowHudFooter(state: string): boolean {
  return state !== "win" && state !== "lose" && state !== "cta";
}
