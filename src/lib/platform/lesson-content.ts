export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LessonContent {
  id: string;
  sections: { heading: string; body: string }[];
  quiz: QuizQuestion[];
}

export const LESSON_CONTENT: Record<string, LessonContent> = {
  l1: {
    id: "l1",
    sections: [
      {
        heading: "What is a coral polyp?",
        body: "Corals are animals made of tiny polyps that secrete calcium carbonate skeletons. Each polyp has a mouth surrounded by tentacles used to capture plankton at night.",
      },
      {
        heading: "Why reefs matter",
        body: "Reefs support ~25% of marine species despite covering less than 1% of the ocean floor. They protect coastlines from storms and support fisheries and tourism.",
      },
    ],
    quiz: [
      {
        question: "Corals are primarily classified as:",
        options: ["Plants", "Animals", "Rocks", "Bacteria only"],
        correctIndex: 1,
      },
      {
        question: "Coral polyps build skeletons from:",
        options: [
          "Silicon",
          "Calcium carbonate",
          "Pure salt",
          "Plastic debris",
        ],
        correctIndex: 1,
      },
    ],
  },
  l2: {
    id: "l2",
    sections: [
      {
        heading: "What is bleaching?",
        body: "When water is too warm, corals expel their symbiotic algae (zooxanthellae), turning white. Without algae, corals lose most of their food source and are more likely to die.",
      },
      {
        heading: "Can reefs recover?",
        body: "Mild bleaching can reverse within weeks if temperatures drop. Severe or repeated bleaching often leads to coral death and reef collapse.",
      },
    ],
    quiz: [
      {
        question: "Bleaching happens when corals expel:",
        options: ["Fish", "Zooxanthellae", "Sand", "Seaweed only"],
        correctIndex: 1,
      },
      {
        question: "A main trigger for mass bleaching is:",
        options: [
          "Colder than normal water",
          "Prolonged high sea temperatures",
          "Too many fish",
          "Moon phases alone",
        ],
        correctIndex: 1,
      },
    ],
  },
  l3: {
    id: "l3",
    sections: [
      {
        heading: "Ocean acidification",
        body: "The ocean absorbs CO₂ from the atmosphere, forming carbonic acid. Lower pH makes it harder for corals to build skeletons — a slower stress than heat, but long-lasting.",
      },
      {
        heading: "Climate connection",
        body: "Greenhouse gases warm the planet and acidify oceans. Reducing emissions protects reefs alongside local conservation like fishing limits and pollution control.",
      },
    ],
    quiz: [
      {
        question: "Ocean acidification is mainly caused by absorption of:",
        options: ["Oxygen", "CO₂", "Nitrogen only", "Helium"],
        correctIndex: 1,
      },
    ],
  },
  l4: {
    id: "l4",
    sections: [
      {
        heading: "Symbiosis explained",
        body: "Zooxanthellae live inside coral tissue and photosynthesize, sharing sugars with the polyp. The coral provides shelter and nutrients — a partnership both need to thrive.",
      },
    ],
    quiz: [
      {
        question: "Zooxanthellae provide corals with energy from:",
        options: ["Photosynthesis", "Burrowing", "Hunting sharks", "Wind"],
        correctIndex: 0,
      },
    ],
  },
  l5: {
    id: "l5",
    sections: [
      {
        heading: "AI on the reef",
        body: "Machine learning models can classify reef health from underwater photos faster than manual review — helping students and scientists monitor more area.",
      },
      {
        heading: "Your role",
        body: "Every scan you upload on Coral Lookout trains better awareness and maps hotspots. Always label location and date when possible for research value.",
      },
    ],
    quiz: [
      {
        question: "AI reef tools mainly help by:",
        options: [
          "Replacing all divers",
          "Analyzing images at scale",
          "Cooling the ocean directly",
          "Eliminating fish",
        ],
        correctIndex: 1,
      },
    ],
  },
  l6: {
    id: "l6",
    sections: [
      {
        heading: "Restoration basics",
        body: "Techniques include coral gardening (growing fragments in nurseries), artificial reef structures, and herbivore protection to reduce algae competition.",
      },
    ],
    quiz: [
      {
        question: "Coral gardening typically involves:",
        options: [
          "Growing coral fragments in nurseries",
          "Painting reefs white",
          "Removing all fish",
          "Adding fresh water only",
        ],
        correctIndex: 0,
      },
    ],
  },
};
