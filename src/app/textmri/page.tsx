"use client";
import { useState } from "react";
import ConversationType from "@/components/textmri/ConversationType";
import ConversationContext, {
  ContextData,
} from "@/components/textmri/ConversationContext";
import ParticipantInfo, {
  Participant as ParticipantType,
} from "@/components/textmri/ParticipantInfo";
import ConversationTurns from "@/components/textmri/ConversationTurns";
import AnalysisResults from "@/components/textmri/AnalysisResults";

type Turn = {
  id: string;
  speakerId: string;
  text: string;
  // add additional turn properties as needed
};

type Step = "type" | "context" | "participants" | "turns" | "results";

interface AnalysisData {
  conversationType: string;
  context: ContextData;
  participants: ParticipantType[];
  turns: Turn[];
}

interface AnalysisResults {
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
      key_moments: {
        moment: string;
        impact: string;
      }[];
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

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium">Analyzing conversation...</p>
      <p className="text-sm text-gray-400">This may take a few moments</p>
    </div>
  </div>
);

export default function TextMRI() {
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [analysisData, setAnalysisData] = useState<{
    conversationType: string;
    context: ContextData;
    participants?: ParticipantType[];
    turns: Turn[];
  }>({
    conversationType: "",
    context: {
      globalObjectives: [],
      localObjectives: [],
      environmentalContext: {
        selectedFields: [],
        location: "",
        setting: "",
        atmosphere: "",
        timeOfDay: "",
        noise: "",
        privacy: "",
        customContext: "",
        otherValues: {},
      },
      conversationContext: {
        selectedFields: [],
        relationship: "",
        history: "",
        power: "",
        formality: "",
        emotionalState: "",
        urgency: "",
        customContext: "",
        otherValues: {},
      },
    },
    turns: [],
  });
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTypeSelect = (type: string) => {
    setAnalysisData((prev) => ({ ...prev, conversationType: type }));
    setCurrentStep("context");
  };

  const handleContextComplete = (contextData: ContextData) => {
    setAnalysisData((prev) => ({ ...prev, context: contextData }));
    setCurrentStep("participants");
  };

  const handleParticipantsComplete = (participants: ParticipantType[]) => {
    setAnalysisData((prev) => ({ ...prev, participants }));
    setCurrentStep("turns");
  };

  const handleTurnsComplete = async (turns: Turn[]) => {
    setAnalysisData((prev) => ({ ...prev, turns }));
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/textmri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          globalObjectives: analysisData.context?.globalObjectives,
          localObjectives: analysisData.context?.localObjectives,
          environmentalContext: analysisData.context?.environmentalContext,
          conversationContext: analysisData.context?.conversationContext,
          participants: analysisData.participants,
          turns: turns,
          date: analysisData.context?.date,
          time: analysisData.context?.time,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze conversation");
      }

      const data = await response.json();
      setAnalysisResults(data.result);
      setCurrentStep("results");
    } catch (error) {
      console.error("Analysis error:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "context":
        setCurrentStep("type");
        break;
      case "participants":
        setCurrentStep("context");
        break;
      case "turns":
        setCurrentStep("participants");
        break;
      case "results":
        setCurrentStep("turns");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isAnalyzing && <LoadingSpinner />}

      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-geist-sans)]">
          TextMRI
        </h1>
        <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors">
          Sign In
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        {/* Add note about information quality */}
        <div className="mb-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-purple-200">
            <span className="font-semibold">Note:</span> The more information
            you provide, the more accurate and insightful the analysis will be.
            Fill in as many fields as possible for the best results.
          </p>
        </div>

        {/* Progress Bar - Only show after type selection */}
        {currentStep !== "type" && (
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              {["Context", "Participants", "Turns", "Results"].map(
                (step, index) => (
                  <div
                    key={step}
                    className={`${
                      ["context", "participants", "turns", "results"][index] ===
                      currentStep
                        ? "text-purple-500"
                        : "text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                )
              )}
            </div>
            <div className="h-2 bg-gray-800 rounded-full">
              <div
                className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (["context", "participants", "turns", "results"].indexOf(
                      currentStep
                    ) /
                      3) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === "type" && (
            <ConversationType
              onSelect={handleTypeSelect}
              initialType={analysisData.conversationType}
            />
          )}
          {currentStep === "context" && (
            <ConversationContext
              onComplete={handleContextComplete}
              onBack={handleBack}
              initialContext={analysisData.context}
            />
          )}
          {currentStep === "participants" && (
            <ParticipantInfo
              onComplete={handleParticipantsComplete}
              onBack={handleBack}
              initialParticipants={analysisData.participants}
            />
          )}
          {currentStep === "turns" && analysisData.participants && (
            <ConversationTurns
              participants={analysisData.participants}
              onComplete={(turns: Turn[]) => {
                void handleTurnsComplete(turns);
              }}
              onBack={handleBack}
              initialTurns={analysisData.turns}
              isAnalyzing={isAnalyzing}
            />
          )}
          {currentStep === "results" && analysisResults && (
            <AnalysisResults
              results={analysisResults}
              onBack={handleBack}
              analysisData={analysisData as AnalysisData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
