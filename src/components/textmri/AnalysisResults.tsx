"use client";
import { useState } from "react";
import {
  exportToJson,
  exportToPdf,
  exportToHtml,
  ExportInputData,
} from "@/utils/exportUtils";

// Added TextMRIResult interface based on server schema
interface TextMRIResult {
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

// Updated props with proper types
interface AnalysisResultsProps {
  results: string | TextMRIResult;
  onBack: () => void;
  analysisData: ExportInputData;
}

export default function AnalysisResults({
  results,
  onBack,
  analysisData,
}: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showWeightSettings, setShowWeightSettings] = useState(false);
  const [weights, setWeights] = useState({
    rhetorical: {
      ethos: 1,
      pathos: 1,
      logos: 1,
    },
    content: {
      clarity: 1,
      impact: 1,
    },
    response: {
      relevance: 1,
      constructiveness: 1,
    },
  });

  const parsedResults: TextMRIResult =
    typeof results === "string" ? JSON.parse(results) : results;

  const handleWeightChange = (
    category: keyof typeof weights,
    metric: string,
    value: number
  ) => {
    setWeights((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [metric]: value,
      },
    }));
  };

  const calculateWeightedScore = (
    turn: TextMRIResult["turn_analysis"][number]
  ) => {
    const rhetoricalScore =
      (turn.rhetorical_elements.ethos * weights.rhetorical.ethos +
        turn.rhetorical_elements.pathos * weights.rhetorical.pathos +
        turn.rhetorical_elements.logos * weights.rhetorical.logos) /
      (weights.rhetorical.ethos +
        weights.rhetorical.pathos +
        weights.rhetorical.logos);

    const contentScore =
      (turn.content_analysis.clarity * weights.content.clarity +
        turn.content_analysis.impact * weights.content.impact) /
      (weights.content.clarity + weights.content.impact);

    const responseScore =
      (turn.response_quality.relevance * weights.response.relevance +
        turn.response_quality.constructiveness *
          weights.response.constructiveness) /
      (weights.response.relevance + weights.response.constructiveness);

    return (rhetoricalScore + contentScore + responseScore) / 3;
  };

  const handleExport = async (format: "json" | "pdf" | "html") => {
    const exportData = {
      input: analysisData,
      results: parsedResults,
      weights,
    };

    switch (format) {
      case "json":
        exportToJson(exportData);
        break;
      case "pdf":
        await exportToPdf(exportData);
        break;
      case "html":
        exportToHtml(exportData);
        break;
    }
  };

  const renderProgressBar = (value: number, label?: string) => (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-400 w-24">{label}</span>}
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div
          className="bg-purple-500 rounded-full h-2 transition-all duration-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-sm text-gray-400 w-12">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Objective Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Objective Analysis</h3>
        <div className="space-y-4">
          <p className="text-gray-300">
            {parsedResults.overview.objective_analysis.stated_objective}
          </p>
          {renderProgressBar(
            parsedResults.overview.objective_analysis.achievement_level,
            "Achievement"
          )}
          <div>
            <h4 className="font-medium mb-2">Key Factors</h4>
            <ul className="list-disc list-inside space-y-1">
              {parsedResults.overview.objective_analysis.key_factors.map(
                (factor: string, i: number) => (
                  <li key={i} className="text-gray-300">
                    {factor}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Context Impact */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Context Impact</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Environmental Factors</h4>
            <div className="space-y-4">
              {parsedResults.overview.context_impact.environmental_factors.map(
                (
                  factor: TextMRIResult["overview"]["context_impact"]["environmental_factors"][number],
                  i: number
                ) => (
                  <div key={i} className="space-y-2">
                    <p className="font-medium text-purple-400">
                      {factor.factor}
                    </p>
                    {renderProgressBar(factor.impact_level, "Impact")}
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {factor.observations.map((obs: string, j: number) => (
                        <li key={j}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Relationship Dynamics</h4>
            <div className="space-y-4">
              {parsedResults.overview.context_impact.relationship_dynamics.map(
                (
                  dynamic: TextMRIResult["overview"]["context_impact"]["relationship_dynamics"][number],
                  i: number
                ) => (
                  <div key={i} className="space-y-2">
                    <p className="font-medium text-purple-400">
                      {dynamic.dynamic}
                    </p>
                    {renderProgressBar(dynamic.strength, "Strength")}
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {dynamic.observations.map((obs: string, j: number) => (
                        <li key={j}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Effectiveness */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Overall Effectiveness</h3>
        {renderProgressBar(parsedResults.overview.overall_effectiveness)}
        <div className="mt-4">
          <h4 className="font-medium mb-2">Key Themes</h4>
          <div className="flex flex-wrap gap-2">
            {parsedResults.overview.key_themes.map(
              (theme: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm"
                >
                  {theme}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderParticipantAnalysis = () => (
    <div className="space-y-6">
      {parsedResults.participant_analysis.map(
        (
          participant: TextMRIResult["participant_analysis"][number],
          i: number
        ) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              Participant {participant.participant_id}
            </h3>
            <div className="space-y-6">
              {/* Engagement Level */}
              <div>
                <h4 className="font-medium mb-2">Engagement Level</h4>
                {renderProgressBar(participant.engagement_level)}
              </div>

              {/* Communication Style */}
              <div>
                <h4 className="font-medium mb-3">Communication Style</h4>
                <p className="text-purple-400 mb-2">
                  {participant.communication_style.primary_style}
                </p>
                <div className="space-y-2">
                  {renderProgressBar(
                    participant.communication_style.adaptability,
                    "Adaptability"
                  )}
                  {renderProgressBar(
                    participant.communication_style.effectiveness,
                    "Effectiveness"
                  )}
                </div>
              </div>

              {/* Influence Patterns */}
              <div>
                <h4 className="font-medium mb-3">Influence Patterns</h4>
                <div className="space-y-4">
                  {participant.influence_patterns.map(
                    (
                      pattern: TextMRIResult["participant_analysis"][number]["influence_patterns"][number],
                      j: number
                    ) => (
                      <div key={j} className="space-y-2">
                        <p className="text-purple-400">{pattern.technique}</p>
                        {renderProgressBar(pattern.frequency, "Frequency")}
                        {renderProgressBar(
                          pattern.effectiveness,
                          "Effectiveness"
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Insights and Development */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Behavioral Insights</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {participant.behavioral_insights.map(
                      (insight: string, k: number) => (
                        <li key={k}>{insight}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Development Areas</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {participant.development_areas.map(
                      (area: string, l: number) => (
                        <li key={l}>{area}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );

  const renderTurnAnalysis = () => (
    <div className="space-y-6">
      {parsedResults.turn_analysis.map(
        (turn: TextMRIResult["turn_analysis"][number], i: number) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Turn {turn.turn_id}</h3>
              <span className="text-purple-400">{turn.speaker}</span>
            </div>
            <div className="space-y-6">
              {/* Content Analysis */}
              <div>
                <h4 className="font-medium mb-3">Content Analysis</h4>
                <p className="text-gray-300 mb-3">
                  {turn.content_analysis.main_point}
                </p>
                <div className="space-y-2">
                  {renderProgressBar(turn.content_analysis.clarity, "Clarity")}
                  {renderProgressBar(turn.content_analysis.impact, "Impact")}
                </div>
              </div>

              {/* Rhetorical Elements */}
              <div>
                <h4 className="font-medium mb-3">Rhetorical Elements</h4>
                <div className="space-y-2">
                  {renderProgressBar(turn.rhetorical_elements.ethos, "Ethos")}
                  {renderProgressBar(turn.rhetorical_elements.pathos, "Pathos")}
                  {renderProgressBar(turn.rhetorical_elements.logos, "Logos")}
                </div>
              </div>

              {/* Response Quality */}
              <div>
                <h4 className="font-medium mb-3">Response Quality</h4>
                <div className="space-y-2">
                  {renderProgressBar(
                    turn.response_quality.relevance,
                    "Relevance"
                  )}
                  {renderProgressBar(
                    turn.response_quality.constructiveness,
                    "Constructive"
                  )}
                </div>
              </div>

              {/* Psychological Indicators & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Psychological Indicators</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {turn.psychological_indicators.map(
                      (indicator: string, j: number) => (
                        <li key={j}>{indicator}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Turn Impact</h4>
                  <p className="text-gray-300">{turn.turn_impact}</p>
                </div>
              </div>

              {/* Add weighted score */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="font-medium mb-2">Weighted Score</h4>
                {renderProgressBar(calculateWeightedScore(turn), "Overall")}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );

  const renderConversationDynamics = () => (
    <div className="space-y-8">
      {/* Flow Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Flow Analysis</h3>
        <div className="space-y-4">
          <p className="text-purple-400">
            {parsedResults.conversation_dynamics.flow_analysis.pattern}
          </p>
          {renderProgressBar(
            parsedResults.conversation_dynamics.flow_analysis.effectiveness,
            "Effectiveness"
          )}
          <div>
            <h4 className="font-medium mb-2">Bottlenecks</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {parsedResults.conversation_dynamics.flow_analysis.bottlenecks.map(
                (bottleneck: string, i: number) => (
                  <li key={i}>{bottleneck}</li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Power Dynamics */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Power Dynamics</h3>
        <div className="space-y-4">
          <p className="text-purple-400">
            {parsedResults.conversation_dynamics.power_dynamics.pattern}
          </p>
          {renderProgressBar(
            parsedResults.conversation_dynamics.power_dynamics.balance,
            "Balance"
          )}
          <div>
            <h4 className="font-medium mb-2">Observations</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {parsedResults.conversation_dynamics.power_dynamics.observations.map(
                (obs: string, i: number) => (
                  <li key={i}>{obs}</li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Emotional Progression */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Emotional Progression</h3>
        <div className="space-y-4">
          <p className="text-purple-400">
            {
              parsedResults.conversation_dynamics.emotional_progression
                .trajectory
            }
          </p>
          <div>
            <h4 className="font-medium mb-2">Key Moments</h4>
            <div className="space-y-3">
              {parsedResults.conversation_dynamics.emotional_progression.key_moments.map(
                (
                  moment: TextMRIResult["conversation_dynamics"]["emotional_progression"]["key_moments"][number],
                  i: number
                ) => (
                  <div key={i} className="bg-gray-700/50 rounded p-3">
                    <p className="font-medium text-purple-400 mb-1">
                      {moment.moment}
                    </p>
                    <p className="text-gray-300 text-sm">{moment.impact}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Topic Management */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Topic Management</h3>
        <div className="space-y-4">
          {renderProgressBar(
            parsedResults.conversation_dynamics.topic_management.coherence,
            "Coherence"
          )}
          <p className="text-gray-300">
            {parsedResults.conversation_dynamics.topic_management.development}
          </p>
          <div>
            <h4 className="font-medium mb-2">Topic Transitions</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {parsedResults.conversation_dynamics?.topic_management?.transitions?.map(
                (transition: string, i: number) => <li key={i}>{transition}</li>
              ) || "No topic transitions found"}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      {parsedResults.recommendations.map(
        (rec: TextMRIResult["recommendations"][number], i: number) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm">
                {rec.target}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-1">Observation</h4>
                <p className="text-gray-300">{rec.observation}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Suggestion</h4>
                <p className="text-gray-300">{rec.suggestion}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Expected Impact</h4>
                <p className="text-gray-300">{rec.expected_impact}</p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );

  const renderWeightSettings = () => (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Weight Settings</h3>
        <button
          onClick={() => setShowWeightSettings(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Rhetorical Elements</h4>
          <div className="space-y-3">
            {Object.entries(weights.rhetorical).map(([metric, value]) => (
              <div key={metric} className="flex items-center gap-4">
                <label className="w-24 text-sm">{metric}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={value}
                  onChange={(e) =>
                    handleWeightChange(
                      "rhetorical",
                      metric,
                      parseFloat(e.target.value)
                    )
                  }
                  className="flex-1"
                />
                <span className="w-12 text-sm">{value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Content Analysis</h4>
          <div className="space-y-3">
            {Object.entries(weights.content).map(([metric, value]) => (
              <div key={metric} className="flex items-center gap-4">
                <label className="w-24 text-sm">{metric}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={value}
                  onChange={(e) =>
                    handleWeightChange(
                      "content",
                      metric,
                      parseFloat(e.target.value)
                    )
                  }
                  className="flex-1"
                />
                <span className="w-12 text-sm">{value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Response Quality</h4>
          <div className="space-y-3">
            {Object.entries(weights.response).map(([metric, value]) => (
              <div key={metric} className="flex items-center gap-4">
                <label className="w-24 text-sm">{metric}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={value}
                  onChange={(e) =>
                    handleWeightChange(
                      "response",
                      metric,
                      parseFloat(e.target.value)
                    )
                  }
                  className="flex-1"
                />
                <span className="w-12 text-sm">{value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
          <p className="text-gray-400">
            Comprehensive analysis of your conversation
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeightSettings(!showWeightSettings)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700"
          >
            ⚖️ Weights
          </button>
          <div className="relative group">
            <button className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700">
              📥 Export
            </button>
            <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button
                onClick={() => handleExport("json")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-700"
              >
                Export as JSON
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-700"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleExport("html")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-700"
              >
                Export as HTML
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWeightSettings && renderWeightSettings()}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "overview", label: "Overview" },
          { id: "participants", label: "Participants" },
          { id: "turns", label: "Turn Analysis" },
          { id: "dynamics", label: "Conversation Dynamics" },
          { id: "recommendations", label: "Recommendations" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "participants" && renderParticipantAnalysis()}
        {activeTab === "turns" && renderTurnAnalysis()}
        {activeTab === "dynamics" && renderConversationDynamics()}
        {activeTab === "recommendations" && renderRecommendations()}
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border border-purple-500 text-purple-500 hover:bg-purple-500/10 transition-colors font-semibold"
        >
          Back to Turns
        </button>
      </div>
    </div>
  );
}
