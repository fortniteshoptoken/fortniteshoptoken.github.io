import {ResponsiveBanner} from "@/components/integrations/responsive-banner";
import {NativeAdSlot} from "@/components/integrations/native-ad-slot";
import {JsonLd} from "@/components/site/json-ld";
import {Faq} from "@/components/site/faq";
import {PageSections} from "@/components/site/page-sections";
import {Breadcrumbs} from "@/components/site/breadcrumbs";
import {RelatedPages} from "@/components/site/related-pages";
import type {SeoPageDefinition} from "@/config/types";
import {getRelatedPages} from "@/content/registry";
import {pageSchemas} from "@/lib/schema";
export function FixedTemplateInner({page}:{page:SeoPageDefinition}){
  const related=getRelatedPages(page);
  return <><JsonLd data={pageSchemas(page)}/>
    <main className="site-container mx-auto space-y-12 py-12 sm:py-16">
      <section>
        <Breadcrumbs slug={page.slug} current={page.hero.heading}/>
        {page.hero.eyebrow?<p className="eyebrow">{page.hero.eyebrow}</p>:null}
        <h1>{page.hero.heading}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8">{page.hero.lead}</p>
      </section>
      <ResponsiveBanner/>
      <PageSections afterFirstSection={<NativeAdSlot/>} sections={page.sections.filter(s=>Boolean(s.heading?.trim()))}/>
      {page.faq?.length?<Faq items={page.faq}/>:null}
      <RelatedPages pages={related}/>
    </main></>;
}
