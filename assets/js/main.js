(() => {
  const STORAGE_KEY = "claudiu-span-theme";
  const LIGHT_THEME_COLOR = "#FAFAFA";
  const DARK_THEME_COLOR = "#09090B";

  const root = document.documentElement;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeToggle = document.getElementById("theme-toggle");

  function getResolvedTheme() {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    }
    if (themeToggle) {
      const isDark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  applyTheme(getResolvedTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  // Project category filtering with URL query sync (?category=...)
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const projectCards = Array.from(document.querySelectorAll("[data-categories]"));
  const filterStatus = document.getElementById("filter-status");
  const validFilters = new Set(filterButtons.map((btn) => btn.dataset.filter));

  function applyFilter(category, updateUrl) {
    const target = validFilters.has(category) ? category : "all";
    let visibleCount = 0;

    filterButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === target));
    });

    projectCards.forEach((card) => {
      const categories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
      const visible = target === "all" || categories.includes(target);
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (filterStatus) {
      filterStatus.textContent =
        visibleCount === 1
          ? "Showing 1 project."
          : `Showing ${visibleCount} projects.`;
    }

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (target === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", target);
      }
      window.history.replaceState({}, "", url.toString());
    }
  }

  if (filterButtons.length > 0 && projectCards.length > 0) {
    const initialCategory = new URLSearchParams(window.location.search).get("category") || "all";
    applyFilter(initialCategory, false);

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyFilter(btn.dataset.filter || "all", true);
      });
    });
  }

  // Copy email button with aria-live feedback
  const copyEmailBtn = document.getElementById("copy-email-btn");
  const copyFeedback = document.getElementById("copy-feedback");
  let feedbackTimer = null;

  if (copyEmailBtn && copyFeedback) {
    copyEmailBtn.addEventListener("click", async () => {
      const email = copyEmailBtn.dataset.email || "clauxspan2002@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        copyFeedback.textContent = `Copied ${email} to clipboard.`;
      } catch {
        copyFeedback.textContent = `Email address: ${email}`;
      }
      if (feedbackTimer) {
        window.clearTimeout(feedbackTimer);
      }
      feedbackTimer = window.setTimeout(() => {
        copyFeedback.textContent = "";
      }, 4000);
    });
  }

  // Print / Save CV as PDF button
  const printButtons = document.querySelectorAll("[data-print-cv]");
  printButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.print();
    });
  });

  // Subtle progressive scroll reveal (honors prefers-reduced-motion)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!prefersReducedMotion && "IntersectionObserver" in window && revealNodes.length > 0) {
    root.classList.add("js-reveal-ready");
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  // Active navigation indicator
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  if ("IntersectionObserver" in window && sections.length > 0 && navLinks.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              const isMatch = link.getAttribute("href") === `#${id}`;
              if (isMatch) {
                link.setAttribute("aria-current", "true");
              } else {
                link.removeAttribute("aria-current");
              }
            });
          }
        });
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  // Localized year in footer
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(new Date());
  }
})();
