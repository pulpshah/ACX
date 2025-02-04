"use client";
import { useState } from "react";

interface AnalysisOption {
  id: string;
  label: string;
  endpoint: string;
}

const analysisOptions: AnalysisOption[] = [
  { id: "claims", label: "Claims", endpoint: "/api/claim" },
  { id: "arguments", label: "Arguments", endpoint: "/api/argument" },
  { id: "ethos", label: "Ethos", endpoint: "/api/ethos" },
  { id: "pathos", label: "Pathos", endpoint: "/api/pathos" },
  { id: "logos", label: "Logos", endpoint: "/api/logos" },
];

// Add these interfaces to help with typing
interface ArgumentResult {
  Arguments: Array<{
    Argument_Text: string;
    Premises: string[];
    Conclusion: string;
    Argument_Form: string;
    Argument_Reasoning: string;
  }>;
}

interface ClaimResult {
  Claims: Array<{
    Claim_Text: string;
    Knowledge_Field: string;
    Claim_Type: string;
    Claim_Form: string;
    Claim_Reasoning: string;
  }>;
}

interface PathosResult {
  Pathos: Array<{
    Sentiment: CategoryScore;
    Vulnerability: CategoryScore;
    Expectation: CategoryScore;
    Alertness: CategoryScore;
    Togetherness: CategoryScore;
    Pity: CategoryScore;
  }>;
}

interface LogosResult {
  Logos: Array<{
    Premises: CategoryScore;
    Conclusions: CategoryScore;
    Fallacies: CategoryScore;
    Validity: CategoryScore;
    Biases: CategoryScore;
    Soundness: CategoryScore;
  }>;
}

interface EthosResult {
  Ethos: Array<{
    Trust: CategoryScore;
    Influence: CategoryScore;
    Capability: CategoryScore;
    Reliability: CategoryScore;
    Assurance: CategoryScore;
    Acceptance: CategoryScore;
  }>;
}

interface CategoryScore {
  Score: number;
  Reasoning: string;
  [key: string]: number | string;
}

// Add this interface for fact check results
interface FactCheckResult {
  factuality: number;
  isTrue: boolean;
  reason: string;
  references: Array<{
    url: string;
    keyQuote: string;
    isSupportive: boolean;
  }>;
}

export default function Home() {
  const [text, setText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );
  const [results, setResults] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCheckboxChange = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  const analyzeText = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    const newResults: Record<string, string> = {};

    try {
      const selectedAnalyses = analysisOptions.filter((option) =>
        selectedOptions.has(option.id)
      );

      const responses = await Promise.all(
        selectedAnalyses.map((option) =>
          fetch(option.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
          })
        )
      );

      const results = await Promise.all(
        responses.map(async (response, index) => {
          if (!response.ok) {
            throw new Error(`Error analyzing ${selectedAnalyses[index].label}`);
          }
          return response.json();
        })
      );

      results.forEach((data, index) => {
        newResults[selectedAnalyses[index].id] = data.result;
      });

      setResults(newResults);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-geist-sans)]">
            ACX
          </h1>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">
          Sign In
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 font-[family-name:var(--font-geist-sans)]">
            Argument + Claim Extraction
          </h2>
          <p className="text-gray-400">
            Analyze text for claims, arguments, and rhetorical devices
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <textarea
              className="w-full h-48 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Analysis Options</h3>
            <div className="flex flex-wrap gap-4">
              {analysisOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    checked={selectedOptions.has(option.id)}
                    onChange={() => handleCheckboxChange(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={analyzeText}
            disabled={isAnalyzing || !text.trim() || selectedOptions.size === 0}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Text"}
          </button>

          <div className="mt-8 p-6 rounded-lg bg-gray-800 border border-gray-700 min-h-[200px]">
            <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
            {Object.keys(results).length > 0 ? (
              <div className="space-y-8">
                {analysisOptions.map(
                  (option) =>
                    results[option.id] && (
                      <div
                        key={option.id}
                        className="border-b border-gray-700 pb-4 last:border-0"
                      >
                        <h4 className="text-xl font-medium mb-4 text-blue-400">
                          {option.label} Analysis
                        </h4>
                        {option.id === "arguments" && (
                          <ArgumentDisplay
                            result={
                              JSON.parse(results[option.id]) as ArgumentResult
                            }
                          />
                        )}
                        {option.id === "claims" && (
                          <ClaimDisplay
                            result={
                              JSON.parse(results[option.id]) as ClaimResult
                            }
                          />
                        )}
                        {option.id === "pathos" && (
                          <PathosDisplay
                            result={
                              JSON.parse(results[option.id]) as PathosResult
                            }
                          />
                        )}
                        {option.id === "logos" && (
                          <LogosDisplay
                            result={
                              JSON.parse(results[option.id]) as LogosResult
                            }
                          />
                        )}
                        {option.id === "ethos" && (
                          <EthosDisplay
                            result={
                              JSON.parse(results[option.id]) as EthosResult
                            }
                          />
                        )}
                      </div>
                    )
                )}
              </div>
            ) : (
              <p className="text-gray-400">
                Results will appear here after analysis.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Add these display components at the bottom of your file
const ArgumentDisplay = ({ result }: { result: ArgumentResult }) => (
  <div className="space-y-4">
    {result.Arguments.map((arg, i) => (
      <div key={i} className="bg-gray-700 rounded-lg p-4">
        <p className="font-medium mb-2">Argument {i + 1}:</p>
        <p className="text-gray-300 mb-2">{arg.Argument_Text}</p>
        <div className="space-y-2 mt-4">
          <p>
            <span className="font-medium">Premises:</span>{" "}
            {arg.Premises.join(", ")}
          </p>
          <p>
            <span className="font-medium">Conclusion:</span> {arg.Conclusion}
          </p>
          <p>
            <span className="font-medium">Form:</span> {arg.Argument_Form}
          </p>
          <p>
            <span className="font-medium">Reasoning:</span>{" "}
            {arg.Argument_Reasoning}
          </p>
        </div>
      </div>
    ))}
  </div>
);
const ClaimDisplay = ({ result }: { result: ClaimResult }) => {
  const [factCheckResults, setFactCheckResults] = useState<
    Record<number, FactCheckResult>
  >({});
  const [isChecking, setIsChecking] = useState<Record<number, boolean>>({});

  const handleFactCheck = async (claimText: string, index: number) => {
    try {
      setIsChecking((prev) => ({ ...prev, [index]: true }));
      const response = await fetch("/api/fact-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: claimText }),
      });

      const data = await response.json();
      console.log("Fact check response:", data); // Debug log
      setFactCheckResults((prev) => ({ ...prev, [index]: data })); // Remove .data
    } catch (error) {
      console.error("Error fact checking:", error);
    } finally {
      setIsChecking((prev) => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {result.Claims.map((claim, i) => (
        <div key={i} className="bg-gray-700 rounded-lg p-4">
          <p className="font-medium mb-2">Claim {i + 1}:</p>
          <p className="text-gray-300 mb-2">{claim.Claim_Text}</p>
          {claim.Claim_Type === "Claim of Fact" && (
            <div className="mb-4">
              <button
                onClick={() => handleFactCheck(claim.Claim_Text, i)}
                disabled={isChecking[i]}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:bg-blue-400"
              >
                {isChecking[i] ? "Checking..." : "Fact Check"}
              </button>

              {factCheckResults[i] && (
                <div className="mt-4 bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium">Factuality Score:</span>
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2"
                        style={{
                          width: `${factCheckResults[i].factuality * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm">
                      {(factCheckResults[i].factuality * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p className="mb-3">
                    <span className="font-medium">Result:</span>{" "}
                    <span
                      className={
                        factCheckResults[i].isTrue
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {factCheckResults[i].isTrue ? "True" : "False"}
                    </span>
                  </p>

                  <p className="mb-4">
                    <span className="font-medium">Reasoning:</span>{" "}
                    {factCheckResults[i].reason}
                  </p>

                  <div>
                    <p className="font-medium mb-2">Supporting References:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {factCheckResults[i].references
                        .filter((ref) => ref.isSupportive)
                        .map((ref, index) => (
                          <div key={index} className="bg-gray-700 p-3 rounded">
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline text-sm"
                            >
                              {ref.url}
                            </a>
                            <p className="text-sm mt-1 text-gray-300">
                              &quot;{ref.keyQuote}&quot;
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="space-y-2 mt-4">
            <p>
              <span className="font-medium">Field:</span>{" "}
              {claim.Knowledge_Field}
            </p>
            <p>
              <span className="font-medium">Type:</span> {claim.Claim_Type}
            </p>
            <p>
              <span className="font-medium">Form:</span> {claim.Claim_Form}
            </p>
            <p>
              <span className="font-medium">Reasoning:</span>{" "}
              {claim.Claim_Reasoning}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ScoreDisplay = ({
  category,
  data,
}: {
  category: string;
  data: CategoryScore;
}) => (
  <div className="bg-gray-700 rounded-lg p-4">
    <p className="font-medium mb-2">{category}:</p>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">Score:</span>
        <div className="flex-1 bg-gray-600 rounded-full h-2">
          <div
            className="bg-blue-500 rounded-full h-2"
            style={{ width: `${data.Score * 100}%` }}
          />
        </div>
        <span className="text-sm">{(data.Score * 100).toFixed(1)}%</span>
      </div>
      {Object.entries(data).map(([key, value]) => {
        if (key !== "Score" && key !== "Reasoning") {
          return (
            <p key={key}>
              <span className="font-medium">{key}:</span>{" "}
              {typeof value === "number" ? value.toFixed(2) : value}
            </p>
          );
        }
      })}
      <p className="text-gray-300 mt-2">{data.Reasoning}</p>
    </div>
  </div>
);

const PathosDisplay = ({ result }: { result: PathosResult }) => (
  <div className="space-y-4">
    {result.Pathos.map((pathos, i) => (
      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(pathos).map(([category, data]) => (
          <ScoreDisplay key={category} category={category} data={data} />
        ))}
      </div>
    ))}
  </div>
);

const LogosDisplay = ({ result }: { result: LogosResult }) => (
  <div className="space-y-4">
    {result.Logos.map((logos, i) => (
      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(logos).map(([category, data]) => (
          <ScoreDisplay key={category} category={category} data={data} />
        ))}
      </div>
    ))}
  </div>
);

const EthosDisplay = ({ result }: { result: EthosResult }) => (
  <div className="space-y-4">
    {result.Ethos.map((ethos, i) => (
      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(ethos).map(([category, data]) => (
          <ScoreDisplay key={category} category={category} data={data} />
        ))}
      </div>
    ))}
  </div>
);
