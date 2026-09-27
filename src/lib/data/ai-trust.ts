export const AI_TRUST = {
  title: "What this AI does — and does not claim",
  does: [
    "Checks whether an image looks like a reef / coral scene before scoring",
    "Estimates a relative health label from color and texture cues",
    "Returns a confidence score so you can judge how certain the model is",
    "Records pipeline steps and model version for provenance",
  ],
  doesNot: [
    "Diagnose species-level disease with scientific certainty",
    "Replace trained marine biologists or lab assays",
    "Guarantee GPS accuracy if you skip location pinning",
    "Produce peer-reviewed bleaching forecasts (planned, not shipped)",
  ],
  buyerFriendlySteps: [
    {
      id: "ingest",
      label: "Receive image",
      plain: "We accept your photo (file or web drop) and prepare it for analysis.",
    },
    {
      id: "preprocess",
      label: "Normalize",
      plain: "We resize and clean the image so the model sees a consistent input.",
    },
    {
      id: "validate",
      label: "Reef check",
      plain: "An AI screen asks: does this look like a reef? Non-reef images are rejected.",
    },
    {
      id: "classify",
      label: "Health estimate",
      plain: "We estimate bleaching / damage cues and assign a buyer-friendly health label.",
    },
    {
      id: "localize",
      label: "Highlight zones",
      plain: "When possible, we mark areas that look stressed for classroom discussion.",
    },
    {
      id: "conserve",
      label: "Next actions",
      plain: "We suggest practical conservation follow-ups for students and teachers.",
    },
  ],
  methodologyHref: "/vision#methodology",
  researchHref: "/research",
} as const;
