export const scrollToSection = (targetSelector: string, extraOffset = 12) => {
  const element = document.querySelector(targetSelector);
  if (!element) return;

  const header = document.querySelector('[data-app-header="true"]');
  const headerHeight = header?.getBoundingClientRect().height ?? 80;
  const top =
    element.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    extraOffset;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};
