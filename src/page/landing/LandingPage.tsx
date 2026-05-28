import { useEffect, type CSSProperties, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../layout/PageShell";
import { useI18n } from "../../context/I18nContext";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/logo.png";
import "./LandingPage.css";

let activeScrollFrame = 0;
let activeSnapFrame = 0;
const sectionRevealSelector = ".section-block-reveal";
const childRevealSelector = [
  ".landing-reveal",
  ".section-heading-reveal",
  ".feature-card-reveal",
  ".step-card-reveal",
  ".step-badge-reveal",
  ".safety-card-reveal",
  ".safety-heading-reveal",
  ".cta-reveal",
].join(", ");

export default function LandingPage() {
  const { t } = useI18n();
  const { theme } = useTheme();

  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const easeInOutSine = (progress: number) => -(Math.cos(Math.PI * progress) - 1) / 2;
  const animateScrollTo = (end: number, duration: number, onDone?: () => void) => {
    if (activeScrollFrame) {
      window.cancelAnimationFrame(activeScrollFrame);
      activeScrollFrame = 0;
    }

    const start = window.scrollY;
    const distance = end - start;
    const startedAt = performance.now();

    if (duration === 0) {
      window.scrollTo(0, end);
      onDone?.();
      return;
    }

    const step = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + distance * easeInOutSine(progress));

      if (progress < 1) {
        activeScrollFrame = window.requestAnimationFrame(step);
        return;
      }

      activeScrollFrame = 0;
      onDone?.();
    };

    activeScrollFrame = window.requestAnimationFrame(step);
  };

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(sectionRevealSelector));
    const standaloneElements = Array.from(document.querySelectorAll<HTMLElement>(childRevealSelector)).filter(
      (element) => !element.closest(sectionRevealSelector),
    );
    const sectionChildren = (section: HTMLElement) =>
      Array.from(section.querySelectorAll<HTMLElement>(childRevealSelector));
    const resetElements = (elements: HTMLElement[]) => {
      elements.forEach((element) => {
        element.classList.remove("is-visible");
        element.style.animation = "none";
      });
    };
    const replayElements = (elements: HTMLElement[]) => {
      resetElements(elements);
      elements.forEach((element) => {
        void element.offsetWidth;
        element.style.animation = "";
        element.classList.add("is-visible");
      });
    };
    const resetSection = (section: HTMLElement) => {
      resetElements([section, ...sectionChildren(section)]);
    };
    const replaySection = (section: HTMLElement) => {
      replayElements([section, ...sectionChildren(section)]);
    };
    const isSectionInView = (section: HTMLElement) => {
      const triggerY = window.scrollY + 140;
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      return triggerY >= sectionTop && triggerY < sectionBottom;
    };
    const renderSectionAnimations = () => {
      sections.forEach((section) => {
        const inView = isSectionInView(section);
        const wasInView = section.dataset.inView === "true";

        if (inView && !wasInView) {
          section.dataset.inView = "true";
          replaySection(section);
          return;
        }

        if (!inView && wasInView) {
          section.dataset.inView = "false";
          resetSection(section);
        }
      });
    };
    const renderStandaloneAnimations = () => {
      standaloneElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const inView = rect.top < viewportHeight * 0.86 && rect.bottom > viewportHeight * 0.04;
        const wasInView = element.dataset.inView === "true";

        if (inView && !wasInView) {
          element.dataset.inView = "true";
          replayElements([element]);
          return;
        }

        if (!inView && wasInView) {
          element.dataset.inView = "false";
          resetElements([element]);
        }
      });
    };
    const renderAnimations = () => {
      renderStandaloneAnimations();
      renderSectionAnimations();
    };
    let ticking = false;
    const requestRenderAnimations = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        renderAnimations();
        ticking = false;
      });
    };

    resetElements(standaloneElements);
    sections.forEach(resetSection);

    const startObserver = window.setTimeout(() => {
      renderAnimations();
      window.addEventListener("scroll", requestRenderAnimations, { passive: true });
      window.addEventListener("resize", requestRenderAnimations);
      window.addEventListener("pageshow", requestRenderAnimations);
      window.addEventListener("load", requestRenderAnimations);
      window.addEventListener("landing:render-animations", requestRenderAnimations);
    }, 180);

    return () => {
      window.clearTimeout(startObserver);
      window.removeEventListener("scroll", requestRenderAnimations);
      window.removeEventListener("resize", requestRenderAnimations);
      window.removeEventListener("pageshow", requestRenderAnimations);
      window.removeEventListener("load", requestRenderAnimations);
      window.removeEventListener("landing:render-animations", requestRenderAnimations);
    };
  }, []);

  useEffect(() => {
    const headerOffset = 80;
    const scrollSections = Array.from(document.querySelectorAll<HTMLElement>(".landing-scroll-section"));
    let isSettling = false;
    let gestureStartIndex: number | null = null;
    let gestureStartTop = 0;
    let gestureDirection = 0;
    let wheelIntent = 0;
    let wheelTimer = 0;
    const sectionPassRatio = 0.42;
    const wheelSettleDelay = 150;

    const sectionTop = (section: HTMLElement) => {
      return Math.max(0, section.getBoundingClientRect().top + window.scrollY - headerOffset);
    };
    const currentSectionIndex = () => {
      const currentY = window.scrollY;

      return scrollSections.reduce((closestIndex, section, index) => {
        const closestDistance = Math.abs(sectionTop(scrollSections[closestIndex]) - currentY);
        const nextDistance = Math.abs(sectionTop(section) - currentY);

        return nextDistance < closestDistance ? index : closestIndex;
      }, 0);
    };
    const snapToSection = (index: number, replayAnimation: boolean, duration: number, onDone?: () => void) => {
      const target = scrollSections[Math.max(0, Math.min(index, scrollSections.length - 1))];
      if (!target) return;

      animateScrollTo(sectionTop(target), prefersReducedMotion() ? 0 : duration, () => {
        if (replayAnimation) {
          window.dispatchEvent(new Event("landing:render-animations"));
        }
        onDone?.();
      });
    };
    const settleWheelIntent = () => {
      if (gestureStartIndex === null) return;

      const startIndex = gestureStartIndex;
      const direction = gestureDirection || (wheelIntent > 0 ? 1 : -1);
      const targetIndex = Math.max(0, Math.min(startIndex + direction, scrollSections.length - 1));
      const targetTop = sectionTop(scrollSections[targetIndex]);
      const travelDistance = Math.abs(targetTop - gestureStartTop);
      const currentTravel = Math.abs(window.scrollY - gestureStartTop);
      const passedEnough = targetIndex !== startIndex && travelDistance > 0 && currentTravel / travelDistance >= sectionPassRatio;

      isSettling = true;
      if (passedEnough) {
        snapToSection(targetIndex, true, 780, () => {
          isSettling = false;
        });
      } else {
        snapToSection(startIndex, false, 500, () => {
          isSettling = false;
        });
      }

      wheelIntent = 0;
      wheelTimer = 0;
      gestureStartIndex = null;
      gestureDirection = 0;
    };
    const onWheel = (event: WheelEvent) => {
      if (window.innerWidth < 768) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;

      if (activeScrollFrame) {
        window.cancelAnimationFrame(activeScrollFrame);
        activeScrollFrame = 0;
      }

      if (isSettling) {
        isSettling = false;
        wheelIntent = 0;
        gestureStartIndex = null;
        gestureDirection = 0;
      }

      if (gestureStartIndex === null) {
        gestureStartIndex = currentSectionIndex();
        gestureStartTop = sectionTop(scrollSections[gestureStartIndex]);
      }

      const clampedDelta = Math.max(-120, Math.min(120, event.deltaY));
      wheelIntent += clampedDelta;
      if (Math.abs(clampedDelta) > 1) {
        gestureDirection = clampedDelta > 0 ? 1 : -1;
      }

      if (wheelTimer) {
        window.clearTimeout(wheelTimer);
      }

      wheelTimer = window.setTimeout(settleWheelIntent, wheelSettleDelay);
    };

    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      if (activeSnapFrame) {
        window.cancelAnimationFrame(activeSnapFrame);
        activeSnapFrame = 0;
      }
      if (wheelTimer) {
        window.clearTimeout(wheelTimer);
      }
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  const navItems = [
    { label: t.landing.nav.features, href: "#features" },
    { label: t.landing.nav.steps, href: "#steps" },
    { label: t.landing.nav.safety, href: "#safety" },
  ];

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();

    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    const headerOffset = 80;
    const end = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    const duration = prefersReducedMotion() ? 0 : 1700;

    const markSection = () => {
      target.classList.add("section-focus");
      window.setTimeout(() => target.classList.remove("section-focus"), 1800);
    };

    animateScrollTo(end, duration, () => {
      window.history.pushState(null, "", href);
      markSection();
      window.dispatchEvent(new Event("landing:render-animations"));
    });
  };

  const primaryButtonClass = "landing-button inline-flex min-h-12 items-center justify-center rounded-lg px-6 font-bold";
  const secondaryButtonClass = "landing-button inline-flex min-h-12 items-center justify-center rounded-lg border px-6 font-bold";
  const cardClass = "landing-card rounded-lg border";

  function SectionHeading({
    title,
    subtitle,
    align = "center",
  }: {
    title: string;
    subtitle: string;
    align?: "left" | "center";
  }) {
    return (
      <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-xl"}>
        <h2 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
        <p className="mt-4 leading-7" style={{ color: theme.text.secondary }}>
          {subtitle}
        </p>
      </div>
    );
  }

  return (
    <PageShell controlsPosition="bottom-right">
      <main
        className="min-h-screen overflow-hidden"
        style={{
          background: theme.background.page,
          color: theme.text.primary,
          "--landing-accent": theme.text.accent,
          "--landing-card-hover-shadow": theme.shadow.card,
        } as CSSProperties}
      >
        <header
          className="fixed left-0 right-0 top-0 z-40 border-b backdrop-blur"
          style={{
            background: theme.background.card,
            borderColor: theme.border.default,
          }}
        >
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <img src={logo} alt={t.landing.logoAlt} className="h-9 w-9 shrink-0" />
              <span className="truncate text-lg font-bold">{t.landing.brand}</span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  className="landing-nav-link py-2 text-sm font-semibold"
                  style={{ color: theme.text.secondary }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/login"
                className="landing-button hidden rounded-lg px-4 py-2 text-sm font-semibold sm:inline-flex"
                style={{ color: theme.text.secondary }}
              >
                {t.landing.nav.login}
              </Link>
              <Link
                to="/register"
                className="landing-button rounded-lg px-4 py-2 text-sm font-bold"
                style={{
                  background: theme.button.bg,
                  color: theme.button.text,
                  boxShadow: theme.shadow.glow,
                }}
              >
                {t.landing.nav.register}
              </Link>
            </div>
          </div>
        </header>

        <section className="landing-scroll-section mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-7xl grid-cols-1 items-center gap-6 px-5 pb-5 pt-20 sm:px-8 sm:pb-7 sm:pt-[5.75rem] lg:grid-cols-[1fr_0.78fr] lg:gap-10">
          <div className="landing-reveal max-w-3xl">
            <p
              className="mb-3 inline-flex rounded-full border px-4 py-2 text-sm font-bold"
              style={{
                borderColor: theme.border.default,
                color: theme.text.accent,
                background: theme.background.card,
              }}
            >
              {t.landing.hero.badge}
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-[3.35rem]">
              {t.landing.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: theme.text.secondary }}>
              {t.landing.hero.subtitle}
            </p>

            <div className="mt-6 grid gap-3 sm:flex">
              <Link
                to="/register"
                className={`${primaryButtonClass} text-base`}
                style={{
                  background: theme.button.bg,
                  color: theme.button.text,
                  boxShadow: theme.shadow.card,
                }}
              >
                {t.landing.hero.primaryCta}
              </Link>
              <Link
                to="/login"
                className={`${secondaryButtonClass} text-base`}
                style={{
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                  background: theme.background.card,
                }}
              >
                {t.landing.hero.secondaryCta}
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 sm:max-w-xl">
              {t.landing.hero.stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border p-3 sm:p-4"
                  style={{
                    borderColor: theme.border.default,
                    background: theme.background.card,
                  }}
                >
                  <p className="text-xl font-black sm:text-2xl" style={{ color: theme.text.accent }}>
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold sm:text-sm" style={{ color: theme.text.secondary }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="landing-reveal landing-reveal-scale relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-[25rem]"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            <div
              className="landing-visual rounded-3xl border p-3 shadow-xl sm:p-4"
              style={{
                background: theme.background.card,
                borderColor: theme.border.default,
                boxShadow: theme.shadow.card,
              }}
            >
              <div
                className="grid aspect-[4/4.2] overflow-hidden rounded-2xl border lg:aspect-[4/4.15]"
                style={{
                  borderColor: theme.border.default,
                  background: theme.background.input,
                }}
              >
                <div className="relative flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{
                        background: theme.status.online,
                        color: theme.button.text,
                      }}
                    >
                      {t.landing.preview.liveLabel}
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{
                        background: theme.background.card,
                        color: theme.text.secondary,
                      }}
                    >
                      {t.landing.preview.minutesLabel}
                    </span>
                  </div>

                  <div className="grid flex-1 grid-cols-1 content-center gap-3 sm:grid-cols-2">
                    <div
                      className="flex min-h-32 flex-col justify-between rounded-2xl p-4 sm:min-h-36"
                      style={{
                        background: theme.text.accent,
                        color: theme.button.text,
                      }}
                    >
                      <img src={logo} alt={t.landing.logoAlt} className="h-12 w-12 rounded-xl" />
                      <div>
                        <p className="text-sm font-bold">{t.landing.preview.nativeSpeaker}</p>
                        <p className="mt-1 text-xs opacity-90">{t.landing.preview.nativeLanguage}</p>
                      </div>
                    </div>
                    <div
                      className="flex min-h-32 flex-col justify-between rounded-2xl border p-4 sm:min-h-36"
                      style={{
                        borderColor: theme.border.default,
                        background: theme.background.card,
                      }}
                    >
                      <div className="h-12 w-12 rounded-xl" style={{ background: theme.button.bg }} />
                      <div>
                        <p className="text-sm font-bold">{t.landing.preview.learner}</p>
                        <p className="mt-1 text-xs" style={{ color: theme.text.secondary }}>
                          {t.landing.preview.learningLanguage}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-[1fr_auto]"
                    style={{
                      borderColor: theme.border.default,
                      background: theme.background.card,
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: theme.text.secondary }}>
                      {t.landing.preview.message}
                    </p>
                    <span
                      className="rounded-lg px-3 py-2 text-sm font-black"
                      style={{
                        background: theme.background.input,
                        color: theme.text.accent,
                      }}
                    >
                      {t.landing.preview.streakLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="landing-scroll-section landing-section section-block-reveal grid min-h-[calc(100svh-4.5rem)] scroll-mt-20 place-items-center px-5 py-10 sm:px-8 sm:py-12"
          style={{ background: theme.background.card }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="section-heading-reveal">
              <SectionHeading title={t.landing.features.title} subtitle={t.landing.features.subtitle} />
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {t.landing.features.items.map((item, index) => (
                <article
                  key={item.title}
                  className={`feature-card-reveal ${cardClass} p-5`}
                  style={{
                    borderColor: theme.border.default,
                    background: theme.background.page,
                    "--reveal-delay": `${index * 140}ms`,
                  } as CSSProperties}
                >
                  <p className="text-sm font-black" style={{ color: theme.text.accent }}>
                    {item.badge}
                  </p>
                  <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: theme.text.secondary }}>
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="steps"
          className="landing-scroll-section landing-section section-block-reveal grid min-h-[calc(100svh-4.5rem)] scroll-mt-20 place-items-center px-5 py-10 sm:px-8 sm:py-12"
          style={{ "--section-delay": "80ms" } as CSSProperties}
        >
          <div className="mx-auto max-w-7xl">
            <div className="section-heading-reveal">
              <SectionHeading title={t.landing.steps.title} subtitle={t.landing.steps.subtitle} />
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {t.landing.steps.items.map((item, index) => (
                <article
                  key={item.title}
                  className={`step-card-reveal ${cardClass} p-6`}
                  style={{
                    borderColor: theme.border.default,
                    background: theme.background.card,
                    boxShadow: theme.shadow.glow,
                    "--reveal-delay": `${index * 160}ms`,
                  } as CSSProperties}
                >
                  <span
                    className="step-badge-reveal flex h-11 w-11 items-center justify-center rounded-lg text-base font-black"
                    style={{
                      background: theme.button.bg,
                      color: theme.button.text,
                      "--badge-delay": `${index * 160 + 360}ms`,
                    } as CSSProperties}
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 leading-7" style={{ color: theme.text.secondary }}>
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="safety"
          className="landing-scroll-section landing-section section-block-reveal grid min-h-[calc(100svh-4.5rem)] scroll-mt-20 place-items-center px-5 py-10 sm:px-8 sm:py-12"
          style={{
            background: theme.background.card,
            "--section-delay": "80ms",
          } as CSSProperties}
        >
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="safety-heading-reveal">
              <SectionHeading title={t.landing.safety.title} subtitle={t.landing.safety.subtitle} align="left" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {t.landing.safety.items.map((item, index) => (
                <article
                  key={item.title}
                  className={`safety-card-reveal ${cardClass} p-5`}
                  style={{
                    borderColor: theme.border.default,
                    background: theme.background.page,
                    "--reveal-delay": `${index * 140}ms`,
                  } as CSSProperties}
                >
                  <h3 className="text-base font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: theme.text.secondary }}>
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-scroll-section grid min-h-[calc(100svh-4.5rem)] place-items-center px-5 py-10 sm:px-8 sm:py-12">
          <div
            className="cta-reveal mx-auto max-w-4xl rounded-2xl border p-6 text-center sm:p-10"
            style={{
              borderColor: theme.border.default,
              background: theme.background.card,
              boxShadow: theme.shadow.card,
            }}
          >
            <h2 className="text-3xl font-black sm:text-4xl">{t.landing.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7" style={{ color: theme.text.secondary }}>
              {t.landing.cta.subtitle}
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:justify-center">
              <Link
                to="/register"
                className={primaryButtonClass}
                style={{ background: theme.button.bg, color: theme.button.text }}
              >
                {t.landing.cta.primary}
              </Link>
              <Link
                to="/login"
                className={secondaryButtonClass}
                style={{
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                  background: theme.background.input,
                }}
              >
                {t.landing.cta.secondary}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
