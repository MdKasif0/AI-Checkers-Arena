import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Theme Preview",
};

/* ── Color swatch helper ── */
function Swatch({
  name,
  className,
  textClass = "text-foreground",
}: {
  name: string;
  className: string;
  textClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`h-14 w-full rounded-md border border-border ${className}`}
      />
      <span className={`text-xs font-mono ${textClass}`}>{name}</span>
    </div>
  );
}

/* ── Scale row helper ── */
function ScaleRow({
  label,
  stops,
}: {
  label: string;
  stops: { name: string; bg: string }[];
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground font-sans">{label}</h4>
      <div className="grid grid-cols-11 gap-1.5">
        {stops.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-1">
            <div
              className={`h-10 w-full rounded-sm border border-white/5 ${s.bg}`}
            />
            <span className="text-[10px] font-mono text-muted-foreground">
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mock board square ── */
function MockBoardSquare({
  variant,
}: {
  variant: "light" | "dark";
}) {
  const bg =
    variant === "dark"
      ? "bg-amber-950 shadow-inner"
      : "bg-amber-200";
  return (
    <div
      className={`h-16 w-16 rounded-sm ${bg} transition-all hover:ring-2 hover:ring-amber-400/50`}
    />
  );
}

export default function ThemePreviewPage() {
  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto space-y-12">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Theme Preview</h1>
        <p className="text-muted-foreground mt-2">
          Design system tokens — delete this route once the palette is locked in.
        </p>
      </div>

      <Separator />

      {/* ═══════════════════════════════════════════
          SECTION 1: Semantic Color Tokens
          ═══════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Semantic Color Tokens</h2>

        {/* Backgrounds & surfaces */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 font-sans">
            Backgrounds & Surfaces
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <Swatch name="background" className="bg-background" />
            <Swatch name="card" className="bg-card" />
            <Swatch name="popover" className="bg-popover" />
            <Swatch name="muted" className="bg-muted" />
            <Swatch name="secondary" className="bg-secondary" />
            <Swatch name="accent" className="bg-accent" />
          </div>
        </div>

        {/* Primary & interactive */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 font-sans">
            Primary & Interactive
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <Swatch name="primary" className="bg-primary" />
            <Swatch
              name="primary-fg"
              className="bg-primary-foreground"
            />
            <Swatch name="ring" className="bg-ring" />
            <Swatch name="border" className="bg-border" />
            <Swatch name="input" className="bg-input" />
            <Swatch name="destructive" className="bg-destructive" />
          </div>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 font-sans">
            Text Colors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-foreground text-sm">foreground</span>
              <p className="text-xs font-mono text-muted-foreground">
                Primary text
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm">
                muted-foreground
              </span>
              <p className="text-xs font-mono text-muted-foreground">
                Secondary text
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-primary text-sm">primary</span>
              <p className="text-xs font-mono text-muted-foreground">
                Amber accent text
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-destructive text-sm">destructive</span>
              <p className="text-xs font-mono text-muted-foreground">
                Error / danger
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 font-sans">
            Chart Colors
          </h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`h-10 w-10 rounded-sm bg-chart-${i}`}
                  style={{
                    backgroundColor: `var(--chart-${i})`,
                  }}
                />
                <span className="text-[10px] font-mono text-muted-foreground">
                  chart-{i}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ═══════════════════════════════════════════
          SECTION 2: Custom Scales
          ═══════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Custom Color Scales</h2>

        <ScaleRow
          label="Charcoal"
          stops={[
            { name: "50", bg: "bg-charcoal-50" },
            { name: "100", bg: "bg-charcoal-100" },
            { name: "200", bg: "bg-charcoal-200" },
            { name: "300", bg: "bg-charcoal-300" },
            { name: "400", bg: "bg-charcoal-400" },
            { name: "500", bg: "bg-charcoal-500" },
            { name: "600", bg: "bg-charcoal-600" },
            { name: "700", bg: "bg-charcoal-700" },
            { name: "800", bg: "bg-charcoal-800" },
            { name: "900", bg: "bg-charcoal-900" },
            { name: "950", bg: "bg-charcoal-950" },
          ]}
        />

        <ScaleRow
          label="Amber / Gold"
          stops={[
            { name: "50", bg: "bg-amber-50" },
            { name: "100", bg: "bg-amber-100" },
            { name: "200", bg: "bg-amber-200" },
            { name: "300", bg: "bg-amber-300" },
            { name: "400", bg: "bg-amber-400" },
            { name: "500", bg: "bg-amber-500" },
            { name: "600", bg: "bg-amber-600" },
            { name: "700", bg: "bg-amber-700" },
            { name: "800", bg: "bg-amber-800" },
            { name: "900", bg: "bg-amber-900" },
            { name: "950", bg: "bg-amber-950" },
          ]}
        />
      </section>

      <Separator />

      {/* ═══════════════════════════════════════════
          SECTION 3: Typography
          ═══════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Typography</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Headings — Playfair Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-sans text-muted-foreground font-medium">
                Headings — Playfair Display (serif)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <h1 className="text-5xl font-bold">Heading 1</h1>
              <h2 className="text-4xl font-bold">Heading 2</h2>
              <h3 className="text-3xl font-semibold">Heading 3</h3>
              <h4 className="text-2xl font-semibold">Heading 4</h4>
              <h5 className="text-xl font-medium">Heading 5</h5>
              <h6 className="text-lg font-medium">Heading 6</h6>
            </CardContent>
          </Card>

          {/* Body — Space Grotesk */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-sans text-muted-foreground font-medium">
                Body — Space Grotesk (grotesk)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-sans">
              <p className="text-xl">
                Extra large body text — 20px
              </p>
              <p className="text-lg">
                Large body text — 18px
              </p>
              <p className="text-base">
                Base body text — 16px. The quick brown fox jumps over the lazy
                dog. AI models compete head-to-head in live checkers matches.
              </p>
              <p className="text-sm">
                Small body text — 14px. Used for secondary information and
                metadata.
              </p>
              <p className="text-xs">
                Extra small — 12px. Captions and fine print.
              </p>
              <p className="font-mono text-sm text-muted-foreground">
                Monospace — Geist Mono. Used for IDs, code, and move notation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ═══════════════════════════════════════════
          SECTION 4: Components
          ═══════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Components</h2>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Buttons</CardTitle>
            <CardDescription>
              All variants should use amber/gold for primary. No blue or purple.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Inputs</CardTitle>
            <CardDescription>
              Focus ring should be amber/gold — never blue.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-sm space-y-3">
            <Input placeholder="Default input" />
            <Input placeholder="Disabled input" disabled />
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Surface Card</CardTitle>
              <CardDescription>bg-card token</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Default card surface with border.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-charcoal-800 border-charcoal-700">
            <CardHeader>
              <CardTitle className="font-sans">Charcoal-800</CardTitle>
              <CardDescription>Custom charcoal bg</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Elevated surface using the charcoal scale.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-amber-950 border-amber-900">
            <CardHeader>
              <CardTitle className="font-sans text-amber-400">
                Amber Accent
              </CardTitle>
              <CardDescription className="text-amber-300/60">
                Warm accent surface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-200/80">
                Accent card using amber scale.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ═══════════════════════════════════════════
          SECTION 5: Mock Board Square
          ═══════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Board Square Preview</h2>
        <p className="text-muted-foreground text-sm">
          A static 4×4 mock using the amber/charcoal palette. Hover for ring
          effect.
        </p>

        <div className="inline-grid grid-cols-4 gap-0 rounded-lg overflow-hidden border border-charcoal-700 shadow-xl">
          {Array.from({ length: 16 }, (_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const isDark = (row + col) % 2 === 1;
            return (
              <MockBoardSquare
                key={i}
                variant={isDark ? "dark" : "light"}
              />
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          Light: bg-amber-200 · Dark: bg-amber-950
        </p>
      </section>

      {/* ─── Footer ─── */}
      <div className="pb-12 pt-4">
        <p className="text-xs text-muted-foreground">
          This page will be deleted once the palette is finalized.
        </p>
      </div>
    </main>
  );
}
