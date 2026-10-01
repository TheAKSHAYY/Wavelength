export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  cta: string;
  popular: boolean;
  features: string[];
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
}

export interface BulletFact {
  label: string;
  detail: string;
}

export const faqItems: FAQItem[] = [
  {
    id: "what-is-wavelength",
    question: "What is Wavelength?",
    answer:
      "Wavelength is an AI creator studio that helps you plan better thumbnails and short-form scripts using structured scoring and generation flows.",
  },
  {
    id: "who-is-it-for",
    question: "Who is this for?",
    answer:
      "It is built for YouTube creators, solo editors, and small teams that want to improve creative decisions without adding extra tools.",
  },
  {
    id: "free-plan",
    question: "Is there a free plan?",
    answer:
      "Yes. You can start on the Free plan and explore both Thumbnail Studio and Shorts Studio before upgrading.",
  },
  {
    id: "languages",
    question: "Which languages are supported in Shorts Studio?",
    answer:
      "Shorts Studio currently supports English, Hindi, and Hinglish for hooks and storyboard generation.",
  },
  {
    id: "cancel-anytime",
    question: "Can I cancel anytime?",
    answer:
      "Yes. Paid subscriptions are month-to-month and you can cancel anytime from your account settings.",
  },
];

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    priceNote: "Per month",
    cta: "Get Started",
    popular: false,
    features: [
      "Basic access to Thumbnail Studio",
      "Basic access to Shorts Studio",
      "Limited monthly generations",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: "₹349",
    priceNote: "Per month",
    cta: "Start Creator",
    popular: true,
    features: [
      "Higher monthly generation limits",
      "Advanced prompt quality presets",
      "Faster generation priority",
      "Everything in Free",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹899",
    priceNote: "Per month",
    cta: "Go Pro",
    popular: false,
    features: [
      "Maximum monthly generation limits",
      "Team-ready workflow defaults",
      "Priority feature rollouts",
      "Everything in Creator",
    ],
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: "01",
    title: "Add your context",
    description:
      "Start with your topic, niche, and intent so Wavelength understands what you are trying to publish.",
  },
  {
    number: "02",
    title: "Generate and compare",
    description:
      "Use AI-assisted outputs for thumbnail and script directions, then compare options before deciding.",
  },
  {
    number: "03",
    title: "Ship with confidence",
    description:
      "Pick the strongest creative path and move directly into production with clearer execution notes.",
  },
];

export const thumbnailFacts: BulletFact[] = [
  {
    label: "CTR-oriented scoring",
    detail:
      "Every thumbnail receives a single clarity score so you can quickly compare options.",
  },
  {
    label: "Objective visual checks",
    detail:
      "Contrast and face visibility checks reduce avoidable design misses before publishing.",
  },
  {
    label: "Actionable feedback",
    detail:
      "You get practical reasons behind each score, not just a number without context.",
  },
];

export const shortsFacts: BulletFact[] = [
  {
    label: "Three hook variants",
    detail:
      "Generate multiple opening angles so you can choose the strongest pattern interrupt.",
  },
  {
    label: "3-scene storyboard",
    detail:
      "Move from idea to a structured short with scene-by-scene direction in minutes.",
  },
  {
    label: "Creator-focused tone",
    detail:
      "Outputs are tuned for practical recording flow instead of generic long-form scripts.",
  },
];
