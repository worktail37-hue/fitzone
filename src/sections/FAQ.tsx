import { useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { FAQ_DATA } from '../data/faq';
import { Accordion, AccordionItemData } from '../components/ui/Accordion';
import { Container } from '../components/ui/Container';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface FAQProps {
  onQuestionToggle?: (item: AccordionItemData, isOpen: boolean) => void;
  onContactLinkClick?: () => void;
}

export function FAQ({ onQuestionToggle, onContactLinkClick }: FAQProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleScrollToContact = () => {
    onContactLinkClick?.();
    const contactEl = document.getElementById(FAQ_DATA.contactTargetId);
    contactEl?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-section-heading"
      className="relative bg-midnight py-20 md:py-28 overflow-hidden scroll-mt-24"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* LEFT COLUMN: SectionHeading + Paragraph + "Still have questions? Contact us" Link */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading
                id="faq-section-heading"
                as="h2"
                eyebrow={FAQ_DATA.eyebrow}
                titleBefore={FAQ_DATA.headingBefore}
                titleHighlight={FAQ_DATA.headingHighlight}
                titleAfter={FAQ_DATA.headingAfter}
                subtext={FAQ_DATA.description}
              />

              <div className="mt-8 pt-6 border-t border-cloud-border flex flex-wrap items-center gap-2 text-sm">
                <span className="text-cloud-muted">{FAQ_DATA.contactPromptText}</span>
                <a
                  href={`#${FAQ_DATA.contactTargetId}`}
                  onClick={(event) => {
                    event.preventDefault();
                    handleScrollToContact();
                  }}
                  className="group inline-flex min-h-[44px] items-center gap-1.5 py-2 font-display font-bold uppercase tracking-wider text-cloud hover:text-signal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                >
                  <span className="underline decoration-signal underline-offset-4">
                    {FAQ_DATA.contactLinkLabel}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 text-signal transition-transform duration-150 group-hover:translate-x-1"
                  />
                </a>
              </div>
            </Reveal>
          </div>

          {/* RIGHT COLUMN: Shared Single-Open Accordion (First Closed by Default) */}
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <Accordion
                items={FAQ_DATA.items}
                ariaLabel={FAQ_DATA.accordionAriaLabel}
                defaultOpenId={null}
                allowAllClosed={true}
                idPrefix="faq-accordion"
                onItemChange={onQuestionToggle}
              />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default FAQ;
