import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { copy, homeAccordionSlices, homeHeroTitle, homeMarqueeItems, homeTypeCards, interpolate } from "@/apis/static-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState, ResourceBadge } from "@/components/common";
import { useHomeQuery } from "@/hooks";
import type { HomePayload, ResourceSummary } from "@/types";
import { cn, formatCompactNumber, initials } from "@/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HomePage() {
  const query = useHomeQuery();
  if (query.isPending)
    return (
      <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]">
        <LoadingState label="正在准备 AI Hub" />
      </main>
    );
  if (query.isError || !query.data)
    return (
      <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]">
        <ErrorState retry={() => query.refetch()} />
      </main>
    );
  return <HomeScene data={query.data} />;
}

function HomeScene({ data }: { data: HomePayload }) {
  const mainRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Hero load-in: chars drift up out of blur, eye mark snaps in, meta fades.
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-bg", { opacity: 0, yPercent: 6, duration: 1.4, ease: "power2.out" }, 0)
          .from(".hero-wash", { opacity: 0, scale: 1.15, duration: 1.8, ease: "power2.out", stagger: 0.2 }, 0)
          .from(".char", { opacity: 0, y: 34, filter: "blur(10px)", duration: 0.9, stagger: 0.028 }, 0.12)
          .from(".eye-mark", { opacity: 0, scale: 0.4, rotate: -10, duration: 0.7, ease: "back.out(2)" }, 0.85)
          .from(".hero-meta", { opacity: 0, y: 26, duration: 0.8, stagger: 0.1 }, 1.0);

        // The brand eye keeps watching: pupils roam gently, blink handled by CSS.
        gsap.to(".eye-pupil", {
          x: 1.8,
          y: -1.4,
          duration: 2.1,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 2.4,
        });

        // Hero parallax: wash drifts apart from the photograph.
        gsap.to(".hero-bg", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero-wash", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

        // Image scale & fade: every .fx-zoom starts at 0.8, grows to 1.0 on entry,
        // then darkens to 0.2 opacity as it leaves the viewport.
        gsap.utils.toArray<HTMLElement>(".fx-zoom").forEach((el) => {
          gsap.fromTo(el, { scale: 0.8 }, {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 96%", end: "top 34%", scrub: true },
          });
          gsap.to(el, {
            opacity: 0.2,
            filter: "brightness(0.55) saturate(0.8)",
            ease: "none",
            scrollTrigger: { trigger: el.closest(".fx-frame") ?? el, start: "bottom 76%", end: "bottom 10%", scrub: true },
          });
        });

        // Card stacking: the deck piles from the bottom, each card easing
        // into full scale as it reaches the pin point.
        gsap.utils.toArray<HTMLElement>(".stack-card").forEach((el) => {
          gsap.fromTo(el, { y: 76, scale: 0.94, opacity: 0.8 }, {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 92%", end: "top 60%", scrub: true },
          });
        });

        // Bento cells drift in one after another.
        gsap.utils.toArray<HTMLElement>(".bento-cell").forEach((el, index) => {
          gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power3.out",
            delay: (index % 4) * 0.06,
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          });
        });
      });
      if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
      if (document.readyState === "complete") ScrollTrigger.refresh();
      else {
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad);
      }
    },
    { scope: mainRef }
  );

  const onAccordionHover = () => {
    if (hoverTimer.current) return;
    hoverTimer.current = window.setTimeout(() => {
      ScrollTrigger.refresh();
      hoverTimer.current = 0;
    }, 800);
  };

  return (
    <main ref={mainRef} className="w-full max-w-full overflow-x-clip">
      <HeroSection />
      <MarqueeBand />
      <BentoGrid data={data} />
      <AccordionSection onHover={onAccordionHover} />
      {data.apps.length > 0 && <AppStack apps={data.apps} />}
      <CtaBand updates={data.updates} />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="hero relative flex min-h-[600px] flex-col justify-center overflow-hidden px-6 py-22 md:min-h-[720px] md:py-22 max-md:px-4">
      <div className="hero-bg absolute inset-0">
        <img
          src="https://picsum.photos/seed/hub-portal/1920/1080"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-15 grayscale contrast-125"
          loading="eager"
        />
      </div>
      <div className="hero-wash absolute -top-48 left-1/2 size-[880px] -translate-x-1/2 rounded-full bg-indigo-200/25 blur-[150px]" />
      <div className="hero-wash absolute top-1/3 -left-44 size-[560px] rounded-full bg-sky-200/30 blur-[130px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(17,17,17,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_78%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,transparent_38%,rgba(28,28,30,0.09)_100%)]" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
        <h1
          aria-label={homeHeroTitle.first + homeHeroTitle.second}
          className="m-0 flex w-full flex-wrap items-center justify-center text-[clamp(2.15rem,6vw,3.6rem)] leading-[1.12] tracking-[-0.045em] text-zinc-950 max-lg:flex-col"
        >
          <span aria-hidden="true" className="inline-flex flex-wrap justify-center">
            {homeHeroTitle.first.split("").map((str, index) => (
              <span key={index} className="char inline-block">
                {str}
              </span>
            ))}
          </span>
          <span
            aria-hidden="true"
            className="eye-mark relative mx-1 -top-2 -mr-[30px] inline-block h-[26px] w-[40px] shrink-0 origin-center animate-[eye-blink_5.5s_ease-in-out_infinite] sm:h-[32px] sm:w-[48px] sm:-top-3 md:-mr-[46px] md:h-[38px] md:w-[58px] md:-top-4"
          >
            <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
              <rect width="18.67" height="23.44" rx="10.72" fill="#fff" stroke="#111111" strokeWidth="1.5" />
              <rect x="31.33" width="18.67" height="23.44" rx="10.72" fill="#fff" stroke="#111111" strokeWidth="1.5" />
              <circle className="eye-pupil" cx="9.34" cy="11.72" r="5.39" fill="#111111" />
              <circle className="eye-pupil" cx="40.67" cy="11.72" r="5.39" fill="#111111" />
            </svg>
          </span>
          <span aria-hidden="true" className="inline-flex flex-wrap justify-center">
            {homeHeroTitle.second.split("").map((str, index) => (
              <span key={index} className="char inline-block">
                {str}
              </span>
            ))}
          </span>
        </h1>

        <p className="hero-meta mt-7 max-w-[560px] text-[15px] leading-relaxed text-zinc-500">
          {copy.home.heroSubtitle}
        </p>
        <div className="hero-meta mt-8 flex gap-2.5 max-md:w-full max-md:flex-col">
          <Button asChild className="h-11 rounded-full px-6">
            <Link to="/apps?sortBy=score">
              {copy.home.exploreAll}
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-zinc-300 px-6">
            <Link to="/tutorials">{copy.home.readGuide}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function MarqueeBand() {
  return (
    <div className="relative overflow-hidden border-y border-zinc-900/10 bg-white py-3.5" aria-hidden="true">
      <div className="flex w-max animate-[marquee-x_36s_linear_infinite] gap-0">
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center gap-10 pr-10">
            {homeMarqueeItems.map(({ icon: Icon, label }, index) => (
              <span key={label} className="inline-flex shrink-0 items-center gap-2.5 text-[13px] font-medium tracking-wide text-zinc-500">
                {index > 0 && <span className="mr-7 size-1.5 rounded-full bg-zinc-300" />}
                <Icon size={15} />
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  description,
  href,
  hrefLabel = copy.home.viewAll,
}: {
  title: string;
  description: string;
  href: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-9 flex items-end justify-between gap-6 max-md:items-start">
      <div>
        <h2 className="m-0 text-[clamp(1.9rem,3.4vw,2.75rem)] leading-tight font-semibold tracking-[-0.045em] text-zinc-950">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      </div>
      <Link
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-zinc-950"
        to={href}
      >
        {hrefLabel}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function BentoGrid({ data }: { data: HomePayload }) {
  const topApp = data.apps[0];
  const cardCounts = [data.skills.length, data.skillPackages.length, data.plugins.length + data.mcps.length, data.departments.length];

  return (
    <section className="mx-auto w-[min(1180px,calc(100%-48px))] py-20 md:py-28 max-md:w-[calc(100%-28px)]">
      <SectionHeading
        title={copy.home.ecosystemTitle}
        description={copy.home.ecosystemDescription}
        href="/apps?sortBy=score"
        hrefLabel={copy.home.exploreAll}
      />
      <div className="grid grid-flow-dense grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-4">
        {topApp && (
          <Link
            to={topApp.href}
            className="bento-cell group relative col-span-1 row-span-1 flex min-h-[420px] flex-col justify-between gap-5 rounded-[26px] bg-zinc-950 p-6 text-white md:col-span-2 md:row-span-2 md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-[0.14em] text-zinc-500">{copy.home.hotPicks}</span>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{copy.home.hotTitle}</h3>
                <p className="mt-1 text-sm text-zinc-400">{copy.home.hotDescription}</p>
              </div>
              <ArrowUpRight size={20} className="mt-1 shrink-0 text-zinc-500 transition-colors group-hover:text-white" />
            </div>
            <div className="fx-frame relative aspect-[16/9] overflow-hidden rounded-2xl">
              <div className="fx-zoom h-full w-full">
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(topApp.name)}/1200/675`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover grayscale-[30%] opacity-90 contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
            </div>
            <div className="flex items-center gap-3.5">
              <Avatar className="size-11 shrink-0 rounded-xl border border-white/15 bg-white/10">
                <AvatarImage src={topApp.iconUrl ?? undefined} alt="" />
                <AvatarFallback className="rounded-xl bg-transparent text-xs font-extrabold text-white">{initials(topApp.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <strong className="truncate text-[15px]">{topApp.name}</strong>
                  <ResourceBadge type={topApp.type} />
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-400">
                  <span>{topApp.owner.displayName}</span>
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} />
                    {formatCompactNumber(topApp.stars)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {topApp.downloads === undefined ? copy.home.noUsage : interpolate(copy.home.usageCount, { count: formatCompactNumber(topApp.downloads) })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}
        {homeTypeCards.map(({ icon: Icon, tint, title, text, count, href }, index) => (
          <Link
            key={title}
            to={href}
            className="bento-cell group flex min-h-[220px] flex-col justify-between rounded-[22px] border border-zinc-900/10 bg-white p-6 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-zinc-900/20 hover:shadow-[0_24px_50px_-24px_rgba(28,28,30,0.22)]"
          >
            <div>
              <div className={cn("grid size-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-105", tint)}>
                <Icon size={23} />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-zinc-950">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{text}</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{count(cardCounts[index])}</span>
              <ArrowUpRight size={17} className="text-zinc-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-950" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AccordionSection({ onHover }: { onHover: () => void }) {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-48px))] py-20 md:py-28 max-md:w-[calc(100%-28px)]">
      <SectionHeading
        title={copy.home.discoverTitle}
        description={copy.home.discoverDescription}
        href="/skills"
        hrefLabel={copy.home.browseSkills}
      />
      <div className="flex h-[440px] gap-2.5 overflow-x-auto snap-x max-md:h-[420px] [scrollbar-width:none] md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {homeAccordionSlices.map(({ icon: Icon, keyword, eyebrow, title, text, href, action }) => (
          <Link
            key={title}
            to={href}
            onPointerEnter={onHover}
            className="group fx-frame relative flex-1 snap-start overflow-hidden rounded-[26px] transition-[flex-grow] duration-700 ease-out hover:flex-[2.2] max-md:min-w-[82%] max-md:flex-none"
          >
            <div className="fx-zoom absolute inset-0">
              <img
                src={`https://picsum.photos/seed/${keyword}/900/1400`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover grayscale-[25%] contrast-125"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/25 to-zinc-950/10 transition-opacity duration-500 group-hover:via-zinc-950/45" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <div className="grid size-11 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                <Icon size={21} />
              </div>
              <span className="mt-6 block text-[11px] font-bold tracking-[0.14em] text-white/70">{eyebrow}</span>
              <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.03em] text-white">{title}</h3>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-white/75 transition-all duration-500 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                {text}
              </p>
              <strong className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-white">
                {action}
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AppStack({ apps }: { apps: ResourceSummary[] }) {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-48px))] py-20 md:py-32 max-md:w-[calc(100%-28px)]">
      <SectionHeading
        title={copy.home.appsInUse}
        description={copy.home.appsInUseDescription}
        href="/apps?sortBy=score"
      />
      <div className="mt-12">
        {apps.slice(0, 4).map((resource, index) => (
          <StackCard key={resource.id} rank={index + 1} resource={resource} />
        ))}
        <StackCta />
      </div>
    </section>
  );
}

function StackCard({ rank, resource }: { rank: number; resource: ResourceSummary }) {
  return (
    <Link
      to={resource.href}
      className="stack-card group relative sticky top-[84px] z-10 -mt-12 block min-h-[210px] rounded-3xl border border-zinc-900/10 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(28,28,30,0.28)] transition-shadow duration-500 hover:shadow-[0_28px_70px_-26px_rgba(28,28,30,0.38)] first:mt-0 md:min-h-[240px] md:p-7"
    >
      <span className="absolute -top-5 left-8 z-10 grid size-10 place-items-center rounded-full bg-zinc-950 text-sm font-bold tracking-tight text-white">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex h-full min-h-[162px] items-center gap-5 max-md:min-h-0 max-md:flex-col max-md:items-start max-md:justify-center">
        <Avatar className="size-12 shrink-0 rounded-2xl border border-zinc-900/10 bg-gradient-to-br from-indigo-50 to-violet-50">
          <AvatarImage src={resource.iconUrl ?? undefined} alt="" />
          <AvatarFallback className="rounded-2xl bg-transparent text-sm font-extrabold text-indigo-700">{initials(resource.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <strong className="truncate text-[16px] text-zinc-950">{resource.name}</strong>
            <ResourceBadge type={resource.type} />
          </div>
          <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-zinc-500">{resource.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5 max-md:w-full max-md:flex-row max-md:items-center max-md:justify-between">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <Star size={13} />
              {formatCompactNumber(resource.stars)}
            </span>
            {resource.downloads !== undefined && <span>{interpolate(copy.home.usageCount, { count: formatCompactNumber(resource.downloads) })}</span>}
          </div>
          <span className="text-xs text-zinc-400">{interpolate(copy.home.recommendedBy, { name: resource.owner.displayName })}</span>
        </div>
        <ArrowUpRight size={19} className="shrink-0 text-zinc-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-950" />
      </div>
    </Link>
  );
}

function StackCta() {
  return (
    <Link
      to="/apps?sortBy=score"
      className="stack-card group relative sticky top-[84px] z-10 -mt-12 block min-h-[210px] rounded-3xl bg-zinc-950 p-8 text-white md:min-h-[240px] md:p-10"
    >
      <span className="absolute -top-5 left-8 z-10 grid size-10 place-items-center rounded-full bg-white text-sm font-bold tracking-tight text-zinc-950">
        <ArrowUpRight size={17} />
      </span>
      <div className="flex h-full min-h-[146px] items-center justify-between gap-6 max-md:min-h-0 max-md:flex-col max-md:items-start max-md:justify-center">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.03em]">{copy.home.stackCtaTitle}</h3>
          <p className="mt-2 text-sm text-zinc-400">{copy.home.stackCtaDescription}</p>
        </div>
        <Button
          asChild
          variant="secondary"
          className="shrink-0 rounded-full bg-white px-6 text-zinc-950 hover:bg-zinc-100"
        >
          <span className="inline-flex items-center gap-1.5">
            {copy.home.browseAllApps}
            <ArrowRight size={15} />
          </span>
        </Button>
      </div>
    </Link>
  );
}

function CtaBand({ updates }: { updates: HomePayload["updates"] }) {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-48px))] py-20 md:py-36 max-md:w-[calc(100%-28px)]">
      <div className="relative overflow-hidden rounded-[32px] bg-zinc-950 px-8 py-16 text-white md:px-16 md:py-24 max-md:px-6">
        <div className="absolute -top-40 right-0 size-[560px] rounded-full bg-indigo-500/20 blur-[150px]" />
        <div className="absolute bottom-0 left-0 size-[420px] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="relative grid items-center gap-12 md:grid-cols-[1.25fr_0.75fr]">
          <div>
            <h2 className="m-0 text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.12] font-semibold tracking-[-0.045em]">
              {copy.home.ctaTitle}
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-400">
              {copy.home.ctaDescription}
            </p>
            <div className="mt-9 flex flex-wrap gap-2.5 max-md:w-full max-md:flex-col">
              <Button
                asChild
                variant="secondary"
                className="h-11 rounded-full bg-white px-6 text-zinc-950 hover:bg-zinc-100"
              >
                <Link to="/dashboard/publish">
                  {copy.home.publishResource}
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/updates">{copy.home.viewChangelog}</Link>
              </Button>
            </div>
          </div>
          {updates && (
            <Link
              to="/updates"
              className="group rounded-2xl border border-white/15 bg-white/5 p-6 transition-colors duration-500 hover:border-white/25 hover:bg-white/10"
            >
              <span className="text-xs font-semibold tracking-[0.08em] text-zinc-500">
                {copy.home.latestEyebrow}{new Date(updates.updatedAt).toLocaleDateString("zh-CN")}
              </span>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em]">{updates.title}</h3>
              {updates.summary && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{updates.summary}</p>}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                {copy.home.viewUpdates}
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
