export function getAnimation(isMobile: boolean) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: isMobile ? "-50px" : "-100px" },
    transition: { duration: 0.6 },
  };
}

