import siteContent from "@/data/site-content.json";

export type RenderedMedia = {
  slot: string;
  usage: string;
  status: "resolved" | "missing";
  src?: string;
  alt?: string;
};

export type RenderedModule = {
  module_type: string;
  component: string;
  props: Record<string, unknown>;
  media: RenderedMedia[];
  anchor?: string;
};

export type RenderedPage = {
  id: string;
  route: string;
  page_type: string;
  title: string;
  meta_description: string;
  canonical_url?: string;
  header?: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    image?: string;
    visual?: "default" | "wanwang";
  } | null;
  schema_jsonld: Record<string, unknown>[];
  modules: RenderedModule[];
  freshness: string;
};

export type SiteContent = {
  meta: Record<string, unknown>;
  global: {
    navigation: {
      brand: string;
      items: { label: string; route: string; page_id: string }[];
      cta?: { label: string; href: string };
    };
    header?: { mode?: "overlay" | "solid"; visual?: "default" | "wanwang" };
    footer: {
      company_name: string;
      icp_number?: string;
      icp_url?: string;
      region?: string;
      contact_person?: string;
      phone?: string;
      email?: string;
      badge?: string;
      external_profile_ids: string[];
    };
    theme?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      page?: string;
      surface?: string;
    };
  };
  pages: RenderedPage[];
  gaps: unknown[];
};

const content = siteContent as unknown as SiteContent;

export function loadSiteContent(): SiteContent {
  return content;
}

export function getPage(route: string): RenderedPage | undefined {
  return content.pages.find((page) => page.route === route);
}
