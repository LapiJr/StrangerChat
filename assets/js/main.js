document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const currentPath = window.location.pathname.split("/").pop();

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = href === currentPath || (href === "index.html" && currentPath === "");
    link.classList.toggle("active", isActive);
  });

  // Optional subtle entrance animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll("[data-animate]").forEach((section) => {
    observer.observe(section);
  });
});
