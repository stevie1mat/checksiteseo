export type HomeFaqItem = {
  question: string;
  answer: string;
};

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: "What is an AEO checker tool?",
    answer:
      "An AEO checker tool audits how well your website can be discovered, understood, and cited by answer engines like ChatGPT, Perplexity, and Gemini.",
  },
  {
    question: "How does an AEO checking tool work?",
    answer:
      "An AEO checking tool crawls your page and evaluates technical signals, content clarity, and authority indicators that influence AI-generated answers.",
  },
  {
    question: "What is AEO and how is it different from SEO?",
    answer:
      "AEO (Answer Engine Optimization) focuses on optimizing content for AI-powered answer engines like ChatGPT, Perplexity, and Google's AI Overview. While SEO targets traditional search rankings, AEO ensures your content is properly formatted, cited, and trustworthy for AI models to reference and recommend.",
  },
  {
    question: "How does CheckSite AEO analyze my content?",
    answer:
      "We use advanced AI models to evaluate your content across three key areas: Technical Readiness (robots.txt, schema, HTTPS), Content Structure (readability, visual context, question targeting), and Authority Signals (E-E-A-T indicators). Our platform provides a comprehensive score and actionable recommendations.",
  },
  {
    question: "What is the content gap analysis feature?",
    answer:
      "Our AI analyzes your page content and identifies missing topics that answer engines expect to see. This helps you fill content gaps that could improve your chances of being cited by AI models. It's contextually aware and provides relevant suggestions based on your specific industry and niche.",
  },
  {
    question: "Can I try CheckSite AEO before committing?",
    answer:
      "Yes. We offer a free tier with 5 URL scans per month, and paid plans include a 14-day trial period.",
  },
  {
    question: "How often should I run AEO audits?",
    answer:
      "We recommend weekly audits for active content and after major content updates. Frequent scans help you catch technical and content regressions early.",
  },
  {
    question: "What is AEO readiness?",
    answer:
      "AEO readiness is a measure of how prepared your site is to be selected and cited by AI answer engines based on technical setup, content quality, and trust signals.",
  },
  {
    question: "What does AEO monitoring track?",
    answer:
      "AEO monitoring tracks score changes over time so you can detect drops in crawlability, answer quality, and authority before they hurt AI search visibility.",
  },
  {
    question: "Does CheckSite AEO integrate with my existing tools?",
    answer:
      "Yes. Pro plans include API access and support integration with CMS, analytics, and workflow tools.",
  },
  {
    question: "What makes your E-E-A-T analysis unique?",
    answer:
      "We evaluate expertise, experience, authoritativeness, and trustworthiness using the same style of model signals used by answer engines, so you can identify trust gaps before they impact visibility.",
  },
  {
    question: "What is GEO (Generative Engine Optimization)?",
    answer:
      "GEO involves structuring your content exactly how AI models want to read it. While AEO focuses on making sure the AI can find and trust your answers, GEO ensures your paragraphs are formatted as direct, extractable citations so you get featured at the top of AI Overviews.",
  },
  {
    question: "Is there a limit to how many URLs I can analyze?",
    answer:
      "The Free plan includes 5 scans per month, while paid plans increase scan and site limits substantially.",
  },
];
