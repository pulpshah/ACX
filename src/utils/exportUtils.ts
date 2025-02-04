import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Define interfaces to remove all any usage

export interface WeightSettings {
  rhetorical: {
    ethos: number;
    pathos: number;
    logos: number;
  };
  content: {
    clarity: number;
    impact: number;
  };
  response: {
    relevance: number;
    constructiveness: number;
  };
}

export interface TextMRIResult {
  overview: {
    objective_analysis: {
      stated_objective: string;
      achievement_level: number;
      key_factors: string[];
    };
    context_impact: {
      environmental_factors: {
        factor: string;
        impact_level: number;
        observations: string[];
      }[];
      relationship_dynamics: {
        dynamic: string;
        strength: number;
        observations: string[];
      }[];
    };
    key_themes: string[];
    overall_effectiveness: number;
  };
  participant_analysis: {
    participant_id: string;
    engagement_level: number;
    communication_style: {
      primary_style: string;
      adaptability: number;
      effectiveness: number;
    };
    influence_patterns: {
      technique: string;
      frequency: number;
      effectiveness: number;
    }[];
    behavioral_insights: string[];
    development_areas: string[];
  }[];
  turn_analysis: {
    turn_id: number;
    speaker: string;
    content_analysis: {
      main_point: string;
      clarity: number;
      impact: number;
    };
    rhetorical_elements: {
      ethos: number;
      pathos: number;
      logos: number;
    };
    response_quality: {
      relevance: number;
      constructiveness: number;
    };
    psychological_indicators: string[];
    turn_impact: string;
  }[];
  conversation_dynamics: {
    flow_analysis: {
      pattern: string;
      effectiveness: number;
      bottlenecks: string[];
    };
    power_dynamics: {
      pattern: string;
      balance: number;
      observations: string[];
    };
    emotional_progression: {
      trajectory: string;
      key_moments: { moment: string; impact: string }[];
    };
    topic_management: {
      coherence: number;
      development: string;
      transitions: string[];
    };
  };
  recommendations: {
    target: string;
    observation: string;
    suggestion: string;
    expected_impact: string;
  }[];
}

export interface ExportInputData {
  context: {
    globalObjectives: { priority: number | string; text: string }[];
    localObjectives: { priority: number | string; text: string }[];
    environmentalContext?: Record<string, unknown>;
    conversationContext?: Record<string, unknown>;
  };
  participants: {
    name?: string;
    role?: string;
    position?: string;
    objectives?: { priority?: number | string; text?: string }[];
    demographics?: Record<string, unknown>;
    psychographics?: Record<string, unknown>;
  }[];
}

export interface ExportData {
  input: ExportInputData;
  results: string | TextMRIResult;
  weights: WeightSettings;
}

// Updated function signatures using ExportData
export const exportToJson = (data: ExportData): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "textmri-analysis.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPdf = async (data: ExportData): Promise<void> => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = generateHtmlContent(data);
  tempDiv.style.padding = "20px";
  tempDiv.style.background = "white";
  tempDiv.style.color = "black";
  tempDiv.style.width = "800px";
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    let page = 1;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add other pages if needed
    while (heightLeft > 0) {
      position = -pageHeight * page;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      page++;
    }

    pdf.save("textmri-analysis.pdf");
  } finally {
    document.body.removeChild(tempDiv);
  }
};

export const exportToHtml = (data: ExportData): void => {
  const htmlContent = generateHtmlContent(data);
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "textmri-analysis.html";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generic helper function to safely access nested properties
function getValue<T>(obj: unknown, path: string[], defaultValue: T): T {
  return path.reduce((acc: unknown, key: string): unknown => {
    if (acc !== null && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return defaultValue;
  }, obj) as T;
}

const generateHtmlContent = (data: ExportData): string => {
  const { input, results, weights } = data;
  const parsedResults: TextMRIResult =
    typeof results === "string" ? JSON.parse(results) : results;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TextMRI Analysis Report</title>
      <style>
        :root {
          --purple-500: #8b5cf6;
          --purple-600: #7c3aed;
          --gray-700: #374151;
          --gray-800: #1f2937;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f8fafc;
        }
        h1, h2, h3, h4 { 
          color: var(--gray-800);
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        h1 { font-size: 2.5rem; text-align: center; color: var(--purple-600); }
        h2 { font-size: 2rem; color: var(--purple-500); border-bottom: 2px solid var(--purple-500); padding-bottom: 0.5rem; }
        h3 { font-size: 1.5rem; }
        h4 { font-size: 1.25rem; }
        .section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin: 1rem 0;
        }
        .progress-container {
          margin: 1rem 0;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--purple-500);
          border-radius: 999px;
          transition: width 0.3s ease;
        }
        .tag {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          margin: 0.25rem;
          background: #f3e8ff;
          color: var(--purple-600);
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          margin: 0.5rem 0;
          border: 1px solid #e5e7eb;
        }
        .metadata {
          color: #666;
          font-size: 0.875rem;
          margin: 2rem 0;
          text-align: center;
        }
        .weight-settings {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }
        ul {
          list-style-type: none;
          padding-left: 0;
        }
        li {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
        }
        li:before {
          content: "•";
          color: var(--purple-500);
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        .highlight {
          background: #f3e8ff;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: var(--purple-600);
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <h1>TextMRI Analysis Report</h1>
      <div class="metadata">
        Generated on ${new Date().toLocaleString()}
      </div>

      <div class="section">
        <h2>Analysis Configuration</h2>
        <div class="weight-settings">
          <h3>Weight Settings</h3>
          <div class="grid">
            <div>
              <h4>Rhetorical Elements</h4>
              ${Object.entries(weights.rhetorical)
                .map(
                  ([key, value]) => `
                <div class="progress-container">
                  <div class="progress-label">
                    <span>${key}</span>
                    <span>${value.toFixed(1)}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(value / 2) * 100}%"></div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
            <div>
              <h4>Content Analysis</h4>
              ${Object.entries(weights.content)
                .map(
                  ([key, value]) => `
                <div class="progress-container">
                  <div class="progress-label">
                    <span>${key}</span>
                    <span>${value.toFixed(1)}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(value / 2) * 100}%"></div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
            <div>
              <h4>Response Quality</h4>
              ${Object.entries(weights.response)
                .map(
                  ([key, value]) => `
                <div class="progress-container">
                  <div class="progress-label">
                    <span>${key}</span>
                    <span>${value.toFixed(1)}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(value / 2) * 100}%"></div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Input Data</h2>
        <h3>Objectives</h3>
        <div class="grid">
          <div class="card">
            <h4>Global Objectives</h4>
            <ul>
              ${input.context.globalObjectives
                .map(
                  (obj) => `
                <li>
                  <span class="highlight">Priority ${obj.priority}</span>
                  ${obj.text}
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
          <div class="card">
            <h4>Local Objectives</h4>
            <ul>
              ${input.context.localObjectives
                .map(
                  (obj) => `
                <li>
                  <span class="highlight">Priority ${obj.priority}</span>
                  ${obj.text}
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
        </div>

        <h3>Context</h3>
        <div class="grid">
          <div class="card">
            <h4>Environmental Context</h4>
            ${Object.entries(input.context.environmentalContext || {})
              .filter(([, value]) => value !== undefined)
              .map(
                ([key, value]) => `
                <div>
                  <strong>${key}:</strong> ${value || "Not given"}
                </div>
              `
              )
              .join("") || "No environmental context provided"}
          </div>
          <div class="card">
            <h4>Conversation Context</h4>
            ${Object.entries(input.context.conversationContext || {})
              .filter(([, value]) => value !== undefined)
              .map(
                ([key, value]) => `
                <div>
                  <strong>${key}:</strong> ${value || "Not given"}
                </div>
              `
              )
              .join("") || "No conversation context provided"}
          </div>
        </div>

        <h3>Participants</h3>
        <div class="grid">
          ${input.participants.length > 0
            ? input.participants
                .map(
                  (p) => `
            <div class="card">
              <h4>${p.name || "Unnamed Participant"}</h4>
              <div><strong>Role:</strong> ${p.role || "Not given"}</div>
              <div><strong>Position:</strong> ${p.position || "Not given"}</div>
              <h5>Objectives</h5>
              <ul>
                ${(p.objectives && p.objectives.length > 0
                  ? p.objectives
                      .map(
                        (obj) => `
                  <li>
                    <span class="highlight">Priority ${obj.priority || "Not given"}</span>
                    ${obj.text || "Not given"}
                  </li>
                `
                      )
                      .join("")
                  : "<li>No objectives provided</li>")}
              </ul>
              <h5>Demographics</h5>
              ${Object.entries(p.demographics || {})
                .map(
                  ([key, value]) => `
                  <div>
                    <strong>${key}:</strong> ${value || "Not given"}
                  </div>
                `
                )
                .join("") || "<div>No demographics provided</div>"}
              <h5>Psychographics</h5>
              ${Object.entries(p.psychographics || {})
                .map(
                  ([key, value]) => `
                  <div>
                    <strong>${key}:</strong> ${value || "Not given"}
                  </div>
                `
                )
                .join("") || "<div>No psychographics provided</div>"}
            </div>
          `
                )
                .join("")
            : "<div class='card'>No participants provided</div>"}
        </div>
      </div>

      <div class="section">
        <h2>Analysis Results</h2>
        <h3>Overview</h3>
        <div class="card">
          <h4>Objective Analysis</h4>
          <p>${getValue<string>(parsedResults, ["overview", "objective_analysis", "stated_objective"], "Not given")}</p>
          <div class="progress-container">
            <div class="progress-label">
              <span>Achievement Level</span>
              <span>${(
                getValue<number>(parsedResults, ["overview", "objective_analysis", "achievement_level"], 0) * 100
              ).toFixed(0)}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(
                getValue<number>(parsedResults, ["overview", "objective_analysis", "achievement_level"], 0) * 100
              )}%"></div>
            </div>
          </div>
          <h5>Key Factors</h5>
          <ul>
            ${(getValue(parsedResults, ["overview", "objective_analysis", "key_factors"], []) as string[])
              .map((factor) => `<li>${factor}</li>`)
              .join("")}
          </ul>
        </div>

        <h3>Conversation Dynamics</h3>
        <div class="grid">
          <div class="card">
            <h4>Flow Analysis</h4>
            <p>${getValue<string>(parsedResults, ["conversation_dynamics", "flow_analysis", "pattern"], "Not given")}</p>
            <div class="progress-container">
              <div class="progress-label">
                <span>Effectiveness</span>
                <span>${(
                  getValue<number>(parsedResults, ["conversation_dynamics", "flow_analysis", "effectiveness"], 0) * 100
                ).toFixed(0)}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${(
                  getValue<number>(parsedResults, ["conversation_dynamics", "flow_analysis", "effectiveness"], 0) * 100
                )}%"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <h4>Power Dynamics</h4>
            <p>${getValue<string>(parsedResults, ["conversation_dynamics", "power_dynamics", "pattern"], "Not given")}</p>
            <div class="progress-container">
              <div class="progress-label">
                <span>Balance</span>
                <span>${(
                  getValue<number>(parsedResults, ["conversation_dynamics", "power_dynamics", "balance"], 0) * 100
                ).toFixed(0)}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${(
                  getValue<number>(parsedResults, ["conversation_dynamics", "power_dynamics", "balance"], 0) * 100
                )}%"></div>
              </div>
            </div>
          </div>
        </div>

        <h3>Turn Analysis</h3>
        ${((getValue(parsedResults, ["turn_analysis"], []) as TextMRIResult["turn_analysis"]).map((turn, index) => `
          <div class="card">
            <h4>Turn ${index + 1}</h4>
            <div class="grid">
              <div>
                <h5>Content Analysis</h5>
                <p>${getValue<string>(turn, ["content_analysis", "main_point"], "Not given")}</p>
                <div class="progress-container">
                  <div class="progress-label">
                    <span>Clarity</span>
                    <span>${(
                      getValue<number>(turn, ["content_analysis", "clarity"], 0) * 100
                    ).toFixed(0)}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(
                      getValue<number>(turn, ["content_analysis", "clarity"], 0) * 100
                    )}%"></div>
                  </div>
                </div>
                <div class="progress-container">
                  <div class="progress-label">
                    <span>Impact</span>
                    <span>${(
                      getValue<number>(turn, ["content_analysis", "impact"], 0) * 100
                    ).toFixed(0)}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(
                      getValue<number>(turn, ["content_analysis", "impact"], 0) * 100
                    )}%"></div>
                  </div>
                </div>
              </div>

              <div>
                <h5>Rhetorical Elements</h5>
                <div class="progress-container">
                  <div class="progress-label">
                    <span>Ethos</span>
                    <span>${(
                      getValue<number>(turn, ["rhetorical_elements", "ethos"], 0) * 100
                    ).toFixed(0)}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(
                      getValue<number>(turn, ["rhetorical_elements", "ethos"], 0) * 100
                    )}%"></div>
                  </div>
                </div>
                <div class="progress-container">
                  <div class="progress-label">
                    <span>Pathos</span>
                    <span>${(
                      getValue<number>(turn, ["rhetorical_elements", "pathos"], 0) * 100
                    ).toFixed(0)}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(
                      getValue<number>(turn, ["rhetorical_elements", "pathos"], 0) * 100
                    )}%"></div>
                  </div>
                </div>
                <div class="progress-container">
                  <div class="progress-label">
                    <span>Logos</span>
                    <span>${(
                      getValue<number>(turn, ["rhetorical_elements", "logos"], 0) * 100
                    ).toFixed(0)}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(
                      getValue<number>(turn, ["rhetorical_elements", "logos"], 0) * 100
                    )}%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join(""))}

        <h3>Recommendations</h3>
        <div class="grid">
          ${((getValue(parsedResults, ["recommendations"], []) as TextMRIResult["recommendations"])
            .map((rec) => `
              <div class="card">
                <span class="tag">${rec.target}</span>
                <div>
                  <h5>Observation</h5>
                  <p>${rec.observation}</p>
                </div>
                <div>
                  <h5>Suggestion</h5>
                  <p>${rec.suggestion}</p>
                </div>
                <div>
                  <h5>Expected Impact</h5>
                  <p>${rec.expected_impact}</p>
                </div>
              </div>
            `).join(""))}}
        </div>
      </div>
    </body>
    </html>
  `;
};
