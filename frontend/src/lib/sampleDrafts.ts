import { ContentReviewRequest } from "@/types/api";

export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  data: ContentReviewRequest;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "cloud-saas",
    name: "Enterprise Cloud Optimization Guide",
    description: "Realistic B2B tech draft with factual claims, benchmark statistics, tone guidelines, and evidence sources.",
    data: {
      draft_text: `According to recent industry analysis, global SaaS spending reached $850 billion in 2024 as enterprises accelerate their migration to the cloud. Research shows that organizations migrating legacy workloads to Kubernetes experience an immediate 400% ROI within the first six weeks.

In the digital realm, organizations must innovate to survive. In the digital realm, teams often struggle with operational complexity. Furthermore, in the digital realm, legacy architecture is the the primary bottleneck.

Our CloudSync Platform was launched in March 2021 by a team of ex-NASA engineers in Austin, Texas. Today, CloudSync guarantees an industry-leading 99.999% uptime SLA across all enterprise tiers. Studies suggest that our distributed zero-trust encryption protocol eliminates 99.8% of ransomware vulnerabilities without adding noticeable latency.

When enterprises decide to overhaul their legacy software distribution pipelines while simultaneously coordinating across distributed cross-functional engineering units, navigating strict European data sovereignty mandates, managing fluctuating microservice compute budgets, and maintaining customer-facing SLAs without downtime, they almost universally discover that holistic observability is critical.

To get started with CloudSync, install our lightweight agent or contact our sales team for custom volume licensing.`,
      audience: "Enterprise CTOs, VP of Engineering, and Cloud Architects",
      content_goal: "Establish technical authority and drive enterprise pipeline evaluations",
      target_keyword: "enterprise cloud migration",
      search_intent: "Commercial Investigation & Informational",
      brand_guidelines: "Authoritative, fact-grounded tone. Disallow hyperbole or unsupported claims. Adhere to AP style for metrics.",
      reference_evidence: `1. Gartner Market Databook (Q4 2024): Worldwide SaaS end-user spending totaled $247.2 billion in 2024 (projected $295B in 2025).
2. CloudSync Official SLA Specification v3.2: Tier 1 Enterprise accounts guarantee 99.99% monthly availability (99.999% is available only as an experimental bespoke add-on).
3. CloudSync Corporate Registry: Founded in August 2022 in Austin, Texas.
4. Independent Forrester TEI Study (2024): Average payback period for containerized enterprise workload migration is 7.2 months with 142% 3-year ROI.`
    }
  },
  {
    id: "fintech-security",
    name: "FinTech Compliance & Fraud Defense",
    description: "Financial services article with regulatory deadlines, transaction volume stats, and weasel word testing.",
    data: {
      draft_text: `Financial institutions processed over $45 trillion in digital payments across North America last year. Almost everyone agrees that modern financial institutions must modernize their payment defenses immediately.

Experts claim that legacy rules-based fraud engines miss more than 60% of modern synthetic identity frauds. It is widely known that adopting machine learning fraud scoring reduces false declines by 45 basis points.

Our FinShield solution analyzes transactions in under 12 milliseconds. FinShield complies fully with the Federal Reserve FedNow ISO 20022 mandate finalized on November 15, 2023. Tons of banks have already replaced their fraud engines with FinShield.

FinShield provides peace of mind. FinShield protects assets. FinShield delivers results.`,
      audience: "Chief Risk Officers and Banking Compliance Officers",
      content_goal: "Educate risk teams on real-time transaction monitoring regulations",
      target_keyword: "real-time payment fraud prevention",
      search_intent: "Informational & Solution Evaluation",
      brand_guidelines: "Strict compliance focus. No informal colloquialisms ('tons of', 'peace of mind'). Concrete regulatory references required.",
      reference_evidence: `1. Federal Reserve Financial Services Bulletin: ISO 20022 implementation deadline for FedNow service was March 2023.
2. Nilson Report (2024): Total North American card and digital payment volume was $14.2 trillion in 2023.
3. FinShield Engineering Whitepaper: Median inference latency benchmark is 11.8 milliseconds per transaction.`
    }
  }
];
