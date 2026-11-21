import type React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...(props as Record<string, unknown>)}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/characters",
}));

import {
  ListPageLayout,
  ListPageHeader,
  FilterChip,
  EntityGrid,
  ListEmptyState,
  ListLoadingSkeleton,
} from "@/components/list-layout";

describe("List Page Design System Primitives", () => {
  describe("ListPageLayout", () => {
    it("renders standard 7xl layout with responsive padding", () => {
      const html = renderToStaticMarkup(
        <ListPageLayout>
          <div>Content</div>
        </ListPageLayout>
      );
      expect(html).toContain("max-w-7xl");
      expect(html).toContain("overflow-x-hidden");
      expect(html).toContain("Content");
    });

    it("renders 6xl variant when requested", () => {
      const html = renderToStaticMarkup(
        <ListPageLayout maxWidth="6xl">
          <div>Narrow Content</div>
        </ListPageLayout>
      );
      expect(html).toContain("max-w-6xl");
    });
  });

  describe("ListPageHeader", () => {
    it("renders title, total count badge, and description", () => {
      const html = renderToStaticMarkup(
        <ListPageHeader
          title="Playable Characters"
          description="Explore all characters in Teyvat"
          totalCount={92}
          countLabel="Characters"
        />
      );
      expect(html).toContain("Playable Characters");
      expect(html).toContain("Explore all characters in Teyvat");
      expect(html).toContain("92");
    });
  });

  describe("FilterChip", () => {
    it("renders active link chip with aria-pressed", () => {
      const html = renderToStaticMarkup(
        <FilterChip
          href="/characters?vision=Pyro"
          active={true}
          label="Pyro"
          count={15}
        />
      );
      expect(html).toContain('aria-pressed="true"');
      expect(html).toContain("Pyro");
      expect(html).toContain("(15)");
      expect(html).toContain("bg-accent-500");
    });

    it("renders button chip when onClick is provided", () => {
      const html = renderToStaticMarkup(
        <FilterChip
          onClick={() => {}}
          active={false}
          label="Sword"
        />
      );
      expect(html).toContain("<button");
      expect(html).toContain('aria-pressed="false"');
      expect(html).toContain("Sword");
    });
  });

  describe("EntityGrid", () => {
    it("enforces max 8 columns for character variant and avoids 10-col crush", () => {
      const html = renderToStaticMarkup(
        <EntityGrid variant="character">
          <div>Card 1</div>
        </EntityGrid>
      );
      expect(html).toContain("2xl:grid-cols-8");
      expect(html).not.toContain("grid-cols-10");
    });

    it("renders compact and detailed grid variants properly", () => {
      const compactHtml = renderToStaticMarkup(
        <EntityGrid variant="compact">
          <div>Item</div>
        </EntityGrid>
      );
      expect(compactHtml).toContain("2xl:grid-cols-8");

      const detailedHtml = renderToStaticMarkup(
        <EntityGrid variant="detailed">
          <div>Domain</div>
        </EntityGrid>
      );
      expect(detailedHtml).toContain("2xl:grid-cols-4");
    });
  });

  describe("ListEmptyState", () => {
    it("renders empty state message and reset link", () => {
      const html = renderToStaticMarkup(
        <ListEmptyState
          title="No characters match"
          description="Try removing some filters"
          resetHref="/characters"
          resetLabel="Clear all"
        />
      );
      expect(html).toContain("No characters match");
      expect(html).toContain("Try removing some filters");
      expect(html).toContain("Clear all");
      expect(html).toContain('href="/characters"');
    });
  });

  describe("ListLoadingSkeleton", () => {
    it("renders the requested number of skeleton cards with portrait aspect for character", () => {
      const html = renderToStaticMarkup(
        <ListLoadingSkeleton count={12} variant="character" />
      );
      expect(html).toContain("aspect-[3/4]");
      expect(html).toContain("animate-pulse");
      const matchCount = (html.match(/aspect-\[3\/4\]/g) || []).length;
      expect(matchCount).toBe(12);
    });
  });
});
