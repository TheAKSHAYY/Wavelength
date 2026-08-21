/**
 * Mock AI responses for Wavelength dashboard panels.
 * Conforms to the Zod schemas in src/lib/schemas.ts.
 */

export function generateMockData(system: string = "", prompt: string = ""): string {
  const combined = `${system}\n${prompt}`.toLowerCase();

  // 1. One-Click Package / Thumbnail (Package Schema)
  if (combined.includes("package") || combined.includes("thumbnail")) {
    const topic = extractSubject(prompt, "next.js development");
    return JSON.stringify({
      idea: {
        title: `How Big Tech is Secretly Using ${capitalize(topic)}`,
        viral: 92,
        demand: "High",
        difficulty: "Medium",
        audience: "Developers and tech leads looking for performant and simplified tech architectures.",
        whyPromising: `The controversy around scaling ${topic} drives high click-through rate and discussion.`,
      },
      thumbnail: {
        layout: "Split comparison screen showing 'Before' vs 'After'",
        text: `${topic.toUpperCase()} IN PROD?`,
        colors: ["#10B981", "#1E1E2F", "#F3F4F6"],
        emotion: "Intrigued skepticism",
        composition: "Large bold text on the left, a vibrant glowing database or server logo on the right with a green checkmark.",
      },
      script: {
        hook: `You've been told that ${topic} is only for small projects. But today, we're deploying it on a live production cluster with 50,000 active users to see if it actually crashes.`,
        intro: `We'll review the performance metrics, walk through the exact production config, and see how it performs under heavy write loads.`,
        sections: [
          {
            heading: "The Scalability Lie",
            content: `Many developer influencers tell you that you need a complex database cluster. The truth is, modern single-server installations of ${topic} can handle millions of requests when configured correctly.`,
          },
          {
            heading: "Optimizing the Engine",
            content: `We'll enable write-ahead logging (WAL mode), configure a 5-second busy timeout, and set the journal size limit. This prevents locks and keeps the read speeds under 1 millisecond.`,
          },
        ],
        cta: `Check out the complete configuration file in the description below, and make sure to subscribe for more backend deep dives!`,
        chapters: ["0:00 - The Big Myth", "1:45 - Benchmark Setup", "4:12 - Concurrency Settings", "8:50 - The Final Verdict"],
      },
      sources: [
        { name: `${capitalize(topic)} Official Documentation`, note: "Best practices guidelines on concurrency and deployment configuration." },
        { name: "High Scalability Blog", note: "Case studies of tech firms operating single-instance servers." },
      ],
    });
  }

  // 2. Competitor Intel (Competitor Schema)
  if (combined.includes("competitor") || combined.includes("channel")) {
    const channelName = extractChannelName(prompt);
    return JSON.stringify({
      name: channelName,
      uploadFreq: "2-3 videos/week",
      avgViews: "185K views",
      trend: Math.random() > 0.4 ? "up" : "down",
      lastVideo: "Why I stopped using heavy cloud databases in 2026",
      gap: `Focuses heavily on high-level entertainment and news, leaving a massive gap for detailed step-by-step implementation guides.`,
    });
  }

  // 3. Trend Discovery (Trend Schema Array)
  if (combined.includes("trend") || combined.includes("growth")) {
    return JSON.stringify([
      {
        topic: "React 19 Server Actions in Production",
        source: "YouTube",
        score: 95,
        growth: 145,
        competition: "High",
        format: "Code-along Tutorial",
        length: "12-15 mins",
      },
      {
        topic: "Deno 2.0 vs Node.js: Benchmark Comparisons",
        source: "GitHub Trending",
        score: 88,
        growth: 210,
        competition: "Medium",
        format: "Benchmark / Speed Test",
        length: "8-10 mins",
      },
      {
        topic: "LiteFS & Litestream: Replicating SQLite to the Cloud",
        source: "Hacker News",
        score: 91,
        growth: 95,
        competition: "Low",
        format: "Architecture Breakdown",
        length: "15 mins",
      },
      {
        topic: "CSS Anchor Positioning API Guide",
        source: "Product Hunt",
        score: 82,
        growth: 65,
        competition: "Low",
        format: "Quick Tips",
        length: "5-7 mins",
      },
      {
        topic: "Building Locally Hosted LLM Agents",
        source: "Reddit",
        score: 94,
        growth: 320,
        competition: "High",
        format: "Step-by-step Setup",
        length: "18-22 mins",
      },
    ]);
  }

  // 4. Keyword Research (Keyword Schema Array)
  if (combined.includes("keyword") || combined.includes("intent")) {
    const topic = extractSubject(prompt, "react");
    return JSON.stringify([
      { keyword: `${topic} server actions tutorial`, intent: "Tutorial", difficulty: "Medium", opportunity: 88 },
      { keyword: `how to deploy ${topic} on vps`, intent: "Tutorial", difficulty: "Low", opportunity: 92 },
      { keyword: `${topic} vs postgres performance`, intent: "Comparison", difficulty: "Low", opportunity: 79 },
      { keyword: `best database for ${topic} app`, intent: "Comparison", difficulty: "Medium", opportunity: 83 },
      { keyword: `is ${topic} production ready`, intent: "Informational", difficulty: "High", opportunity: 64 },
    ]);
  }

  // 5. Script Generator (Script Schema)
  if (combined.includes("script") || combined.includes("hook")) {
    const topic = extractSubject(prompt, "modern software workflows");
    return JSON.stringify({
      hook: `If you're trying to get started with ${capitalize(topic)}, most advice you find online is either outdated or overcomplicated. Today, I'll show you the realistic blueprint I wish I had when I started.`,
      intro: `We'll look at the core fundamentals of ${topic}, walk through practical examples, and break down the actionable step-by-step roadmap.`,
      sections: [
        {
          heading: "The Core Fundamentals",
          content: `Before diving into complex techniques, master the foundational patterns of ${topic}. This eliminates 80% of beginner friction and keeps your learning focused.`,
        },
        {
          heading: "Step-by-Step Implementation",
          content: `We'll walk through a realistic, practical demonstration step-by-step, explaining the exact setup and how to avoid common beginner traps.`,
        },
        {
          heading: "Actionable Practice Routine",
          content: `Set aside dedicated time daily to practice applying these concepts on real-world projects rather than passively consuming endless tutorials.`,
        },
      ],
      cta: `Drop a comment below with your biggest goal for ${topic}, and make sure to subscribe for more deep dives!`,
      chapters: ["0:00 - Introduction", "1:30 - Core Fundamentals", "4:45 - Practical Implementation", "8:10 - Actionable Next Steps"],
    });
  }

  // 7. Plan / Roadmap (Plan Item Schema Array)
  if (combined.includes("plan") || combined.includes("roadmap") || combined.includes("order")) {
    const topic = extractSubject(prompt, "Full-Stack Development");
    return JSON.stringify([
      { order: 1, title: `${capitalize(topic)}: The Setup Everyone Misses`, angle: "Hands-on tutorial showing how to configure the environment correctly for production.", format: "Tutorial", priority: "High" },
      { order: 2, title: `How I Scaled ${capitalize(topic)} to 10k Users for Free`, angle: "Showcasing a server optimization and setup walk-through with real costs.", format: "Case Study", priority: "High" },
      { order: 3, title: `${capitalize(topic)} vs The Alternatives (Honest Benchmarks)`, angle: "A direct head-to-head comparison of performance and developer ergonomics.", format: "Comparison", priority: "Medium" },
      { order: 4, title: `5 Security Mistakes You're Making in ${capitalize(topic)}`, angle: "Security audit checklist with easy code-based fixes.", format: "Audit / Guide", priority: "Medium" },
      { order: 5, title: `Automating Deployments for ${capitalize(topic)}`, angle: "Setting up CI/CD pipelines to deploy to a VPS in seconds.", format: "Tutorial", priority: "Low" },
    ]);
  }

  // 8. Field Research Summary (Research Schema)
  if (combined.includes("research") || combined.includes("gaps") || combined.includes("subtopics")) {
    const topic = extractSubject(prompt, "relational databases");
    return JSON.stringify({
      summary: `The community is showing strong interest in lightweight, simple architectures centered around ${topic}. They want concrete examples, performance data, and guides on migrating without downtime.`,
      subtopics: [
        `Production deployment configurations for ${topic}`,
        "Automated backup strategies to S3/R2",
        "Migration strategies from old structures",
      ],
      gaps: [
        "Most tutorials only cover local testing and miss real-world database backup guides.",
        "Lack of detailed guides comparing memory and CPU utilization benchmarks.",
      ],
      audienceNeeds: `Wants copy-pasteable configuration files, clean diagrams, and a no-nonsense comparison against more expensive cloud hosting.`,
    });
  }

  // 9. Idea Generator (Idea Schema Array)
  if (combined.includes("idea") || combined.includes("viral")) {
    const cleanPrompt = prompt.toLowerCase();
    
    // spring boot vs fastapi
    if (cleanPrompt.includes("spring boot") && cleanPrompt.includes("fastapi")) {
      return JSON.stringify([
        {
          title: "Spring Boot vs FastAPI in 2026: Which is Faster to Build and Run?",
          viral: 94,
          demand: "High",
          difficulty: "Medium",
          audience: "Backend engineers choosing a stack for startup APIs or enterprise microservices.",
        },
        {
          title: "I Migrated a Real Startup Backend from Spring Boot to FastAPI (Honest Benchmarks)",
          viral: 89,
          demand: "Medium",
          difficulty: "High",
          audience: "Tech leads evaluating the resource footprint and developer productivity of both ecosystems.",
        },
        {
          title: "FastAPI vs Spring Boot: Why Startups are Leaving Java Behind",
          viral: 96,
          demand: "High",
          difficulty: "Low",
          audience: "General developers interested in language ecosystem trends and developer ergonomics.",
        }
      ]);
    }
    
    // spring boot
    if (cleanPrompt.includes("spring boot")) {
      return JSON.stringify([
        {
          title: "How Big Tech Configures Spring Boot for Millions of Requests",
          viral: 92,
          demand: "High",
          difficulty: "High",
          audience: "Java backend developers looking to optimize their JVM performance and connection pools.",
        },
        {
          title: "5 Spring Boot Anti-Patterns You Need to Stop Writing Today",
          viral: 95,
          demand: "High",
          difficulty: "Medium",
          audience: "Mid-level developers aiming to write cleaner, production-grade Java architectures.",
        },
        {
          title: "I Built a Production-Ready API in 10 Minutes with Spring Boot and Thymeleaf",
          viral: 87,
          demand: "Medium",
          difficulty: "Low",
          audience: "Beginners looking for quick, practical layouts to set up their web apps.",
        }
      ]);
    }

    // fastapi
    if (cleanPrompt.includes("fastapi")) {
      return JSON.stringify([
        {
          title: "FastAPI in Production: The Deployment Setup Everyone Misses",
          viral: 93,
          demand: "High",
          difficulty: "Medium",
          audience: "Python developers deploying APIs with Gunicorn, Uvicorn, and Docker containers.",
        },
        {
          title: "FastAPI is Awesome, But Don't Use It for This...",
          viral: 95,
          demand: "High",
          difficulty: "Low",
          audience: "Backend architects and developers wanting an honest review of FastAPI's limitations.",
        },
        {
          title: "Building a Production-Grade AI Service with FastAPI and Pydantic v2",
          viral: 91,
          demand: "High",
          difficulty: "High",
          audience: "AI/ML engineers wanting fast payload validation and high-concurrency request handling.",
        }
      ]);
    }

    // sqlite
    if (cleanPrompt.includes("sqlite")) {
      return JSON.stringify([
        {
          title: "Why Big Tech is Secretly Switching Back to SQLite (WAL Mode, Litestream)",
          viral: 97,
          demand: "High",
          difficulty: "Medium",
          audience: "Full-stack developers tired of paying high database hosting fees for simple apps.",
        },
        {
          title: "I Loaded 1 Billion Rows into SQLite to See If It Fails",
          viral: 99,
          demand: "High",
          difficulty: "High",
          audience: "Data engineers and developers curious about SQLite's performance limits.",
        },
        {
          title: "SQLite in Production: How We Scaled to 10k Active Users for $0/Month",
          viral: 93,
          demand: "High",
          difficulty: "Low",
          audience: "Indie hackers and startup founders looking to build ultra-cost-efficient tech stacks.",
        }
      ]);
    }

    // next.js or react
    if (cleanPrompt.includes("next.js") || cleanPrompt.includes("nextjs") || cleanPrompt.includes("react")) {
      const tool = cleanPrompt.includes("next") ? "Next.js" : "React";
      return JSON.stringify([
        {
          title: `${tool} 19 in Production: The New Features You Actually Need`,
          viral: 94,
          demand: "High",
          difficulty: "Low",
          audience: "Frontend developers wanting to stay updated with Server Components and compiler changes.",
        },
        {
          title: `How to Scale ${tool} App Router to 100k Concurrent Users`,
          viral: 91,
          demand: "High",
          difficulty: "High",
          audience: "Frontend architects concerned about caching, rendering speeds, and bundle size.",
        },
        {
          title: `I Rebuilt a Complex ${tool} App with Vanilla HTML/JS (Here's the Speed Difference)`,
          viral: 96,
          demand: "High",
          difficulty: "Medium",
          audience: "React developers analyzing the real-world performance overhead of modern frameworks.",
        }
      ]);
    }

    // AI / LLM / Agent
    if (cleanPrompt.includes("ai") || cleanPrompt.includes("llm") || cleanPrompt.includes("agent") || cleanPrompt.includes("gemini") || cleanPrompt.includes("openai")) {
      return JSON.stringify([
        {
          title: "I Built an Autonomous AI Coding Agent (and it actually works)",
          viral: 98,
          demand: "High",
          difficulty: "High",
          audience: "Developers and AI builders curious about agentic architectures and tools orchestration.",
        },
        {
          title: "How to Build a Custom RAG Pipeline with Gemini 2.5 and LangChain",
          viral: 92,
          demand: "High",
          difficulty: "Medium",
          audience: "AI engineers seeking step-by-step tutorial on document embedding and contextual search.",
        },
        {
          title: "AI Agents in 2026: Why You're Coding Your LLM Assistants Wrong",
          viral: 94,
          demand: "High",
          difficulty: "Low",
          audience: "Tech enthusiasts and software developers looking for optimal engineering patterns.",
        }
      ]);
    }

    // Dynamic Comparison Fallback (contains vs or or)
    if (cleanPrompt.includes(" vs ") || cleanPrompt.includes(" vs. ") || cleanPrompt.includes(" or ")) {
      const parts = cleanPrompt.split(/\s+vs\s+|\s+vs\.\s+|\s+or\s+/);
      if (parts.length >= 2) {
        const itemA = capitalize(parts[0].trim());
        const itemB = capitalize(parts[1].trim());
        return JSON.stringify([
          {
            title: `${itemA} vs ${itemB}: Which is Actually Better in 2026?`,
            viral: 93,
            demand: "High",
            difficulty: "Low",
            audience: "Developers selecting a tech stack who want an objective, no-nonsense comparison.",
          },
          {
            title: `I Built the Same App in ${itemA} and ${itemB} (Here's the Real Speed Difference)`,
            viral: 95,
            demand: "High",
            difficulty: "Medium",
            audience: "Performance-oriented developers seeking benchmarks and build sizes comparison.",
          },
          {
            title: `Why Developers are switching from ${itemB} to ${itemA}`,
            viral: 91,
            demand: "Medium",
            difficulty: "Medium",
            audience: "Software developers interested in community migration trends and ecosystem changes.",
          }
        ]);
      }
    }

    // Default Dynamic Fallback
    const subject = extractSubject(prompt, "web development");
    const capitalizedSubject = capitalize(subject);
    return JSON.stringify([
      {
        title: `Why You're Using ${capitalizedSubject} Wrong in 2026`,
        viral: 92,
        demand: "High",
        difficulty: "Low",
        audience: "Developers using this technology who want to check their configurations against best practices.",
      },
      {
        title: `How ${capitalizedSubject} Works Under the Hood (Visual Deep Dive)`,
        viral: 89,
        demand: "Medium",
        difficulty: "High",
        audience: "Visual learners and software developers seeking clean, illustrated architectural concepts.",
      },
      {
        title: `I Built a Real-World Application with ${capitalizedSubject} in 24 Hours`,
        viral: 94,
        demand: "High",
        difficulty: "Medium",
        audience: "Tech builders looking for project tutorials and full-stack development setups.",
      },
    ]);
  }

  // 9. Title Generator (Title Schema Array)
  if (combined.includes("title") || combined.includes("ctr")) {
    const topic = extractSubject(prompt, "this technology");
    return JSON.stringify([
      { title: `I tried ${capitalize(topic)} in production (and regretted it)`, style: "Curiosity Gap", ctr: 9.2 },
      { title: `Why everyone is switching to ${capitalize(topic)}`, style: "Trend Riding", ctr: 8.5 },
      { title: `Stop using old methods: Do ${capitalize(topic)} instead`, style: "Fear of Missing Out", ctr: 8.1 },
      { title: `Ultimate ${capitalize(topic)} guide for absolute beginners`, style: "Direct Value", ctr: 7.4 },
    ]);
  }

  // 10. Dashboard Insights / General Recommendation (Recommendation Schema Array)
  return JSON.stringify([
    { text: `Tutorials focusing on ${extractSubject(prompt, "Next.js 19")} are seeing a 35% spike in search volume this week.`, kind: "opportunity" },
    { text: "Audiences are dropping off during dry configuration walks; keep intro visual and engaging.", kind: "warning" },
    { text: "Explainers under 10 minutes get 15% higher average retention on database topics.", kind: "insight" },
    { text: "A comparison guide between local setup and cloud instances would perform extremely well now.", kind: "opportunity" },
  ]);
}

// Helpers
function extractChannelName(prompt: string): string {
  const match = prompt.match(/(?:name|channel|user):\s*([^\n]+)/i);
  if (match) return match[1].trim();
  const simpleMatch = prompt.match(/youtube channel name:\s*([^\n]+)/i);
  if (simpleMatch) return simpleMatch[1].trim();
  return "Fireship";
}

function extractSubject(prompt: string, fallback: string): string {
  const cleaned = prompt
    .replace(/^video\s+title\/topic:\s*/i, "")
    .replace(/^video\s+topic:\s*/i, "")
    .replace(/^video\s+title:\s*/i, "")
    .replace(/^topic:\s*/i, "")
    .replace(/^title:\s*/i, "")
    .replace(/\b(video|titletopic|title|topic|youtube|channel|generate|outline|script|json)\b/gi, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(/\s+/).filter((w) => w.length > 1);
  if (words.length > 0) {
    return words.slice(0, 4).join(" ");
  }
  return fallback;
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
