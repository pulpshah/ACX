"use client";
import { useState } from "react";

export interface ContextData {
  globalObjectives: {
    text: string;
    priority: number;
  }[];
  localObjectives: {
    text: string;
    priority: number;
  }[];
  environmentalContext: {
    selectedFields: string[];
    location: string;
    setting: string;
    atmosphere: string;
    timeOfDay: string;
    noise: string;
    privacy: string;
    customContext: string;
    otherValues: Record<string, string>;
  };
  conversationContext: {
    selectedFields: string[];
    relationship: string;
    history: string;
    power: string;
    formality: string;
    emotionalState: string;
    urgency: string;
    customContext: string;
    otherValues: Record<string, string>;
  };
  date?: string;
  time?: string;
}

export interface ConversationContextProps {
  onComplete: (contextData: ContextData) => void;
  onBack: () => void;
  initialContext?: ContextData;
}

const environmentalOptions = {
  location: [
    "Office",
    "Home",
    "Public Space",
    "Educational Institution",
    "Online/Virtual",
    "Other",
  ],
  setting: ["Professional", "Casual", "Academic", "Social", "Family", "Other"],
  atmosphere: [
    "Formal",
    "Informal",
    "Tense",
    "Relaxed",
    "Collaborative",
    "Competitive",
    "Other",
  ],
  timeOfDay: ["Morning", "Afternoon", "Evening", "Night", "Other"],
  noise: ["Silent", "Quiet", "Moderate", "Noisy", "Very Noisy"],
  privacy: ["Private", "Semi-private", "Public", "Group Setting", "Other"],
};

const conversationOptions = {
  relationship: [
    "Professional",
    "Personal",
    "Family",
    "Friends",
    "Strangers",
    "Other",
  ],
  history: [
    "First Interaction",
    "Occasional Interaction",
    "Regular Interaction",
    "Long-term Relationship",
    "Other",
  ],
  power: [
    "Equal",
    "Hierarchical",
    "Mentor-Mentee",
    "Authority-Subordinate",
    "Other",
  ],
  formality: [
    "Very Formal",
    "Formal",
    "Semi-formal",
    "Informal",
    "Very Informal",
  ],
  emotionalState: [
    "Neutral",
    "Positive",
    "Negative",
    "Mixed",
    "Intense",
    "Other",
  ],
  urgency: ["Routine", "Important", "Urgent", "Critical", "Other"],
};

export default function ConversationContext({
  onComplete,
  onBack,
  initialContext,
}: ConversationContextProps) {
  const [contextData, setContextData] = useState<ContextData>(
    initialContext || {
      globalObjectives: [{ text: "", priority: 1 }],
      localObjectives: [{ text: "", priority: 1 }],
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
      date: "",
      time: "",
    }
  );

  const addObjective = (type: "global" | "local") => {
    setContextData((prev) => ({
      ...prev,
      [type === "global" ? "globalObjectives" : "localObjectives"]: [
        ...prev[type === "global" ? "globalObjectives" : "localObjectives"],
        { text: "", priority: 1 },
      ],
    }));
  };

  const removeObjective = (type: "global" | "local", index: number) => {
    setContextData((prev) => ({
      ...prev,
      [type === "global" ? "globalObjectives" : "localObjectives"]: prev[
        type === "global" ? "globalObjectives" : "localObjectives"
      ].filter((_, i) => i !== index),
    }));
  };

  const updateObjective = (
    type: "global" | "local",
    index: number,
    field: "text" | "priority",
    value: string | number
  ) => {
    setContextData((prev) => ({
      ...prev,
      [type === "global" ? "globalObjectives" : "localObjectives"]: prev[
        type === "global" ? "globalObjectives" : "localObjectives"
      ].map((obj, i) => (i === index ? { ...obj, [field]: value } : obj)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(contextData);
  };

  const handleChange = (
    category: "environmentalContext" | "conversationContext",
    field: string,
    value: string
  ) => {
    setContextData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContextData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFieldSelection = (
    category: "environmentalContext" | "conversationContext",
    field: string,
    isSelected: boolean
  ) => {
    setContextData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        selectedFields: isSelected
          ? [...prev[category].selectedFields, field]
          : prev[category].selectedFields.filter((f) => f !== field),
      },
    }));
  };

  const handleOtherValue = (
    category: "environmentalContext" | "conversationContext",
    field: string,
    value: string
  ) => {
    setContextData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        otherValues: {
          ...prev[category].otherValues,
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Critical Context</h2>
        <p className="text-gray-400">Provide context about the conversation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Objectives */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Global Objectives</h3>
            <button
              type="button"
              onClick={() => addObjective("global")}
              className="text-purple-500 hover:text-purple-400"
            >
              + Add Global Objective
            </button>
          </div>
          {contextData.globalObjectives.map((obj, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <textarea
                  value={obj.text}
                  onChange={(e) =>
                    updateObjective("global", index, "text", e.target.value)
                  }
                  placeholder="Enter global objective..."
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  rows={2}
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={obj.priority}
                  onChange={(e) =>
                    updateObjective(
                      "global",
                      index,
                      "priority",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              {contextData.globalObjectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective("global", index)}
                  className="text-red-500 hover:text-red-400 mt-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Local Objectives */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Local Objectives</h3>
            <button
              type="button"
              onClick={() => addObjective("local")}
              className="text-purple-500 hover:text-purple-400"
            >
              + Add Local Objective
            </button>
          </div>
          {contextData.localObjectives.map((obj, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <textarea
                  value={obj.text}
                  onChange={(e) =>
                    updateObjective("local", index, "text", e.target.value)
                  }
                  placeholder="Enter local objective..."
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  rows={2}
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={obj.priority}
                  onChange={(e) =>
                    updateObjective(
                      "local",
                      index,
                      "priority",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              {contextData.localObjectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective("local", index)}
                  className="text-red-500 hover:text-red-400 mt-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Environmental Context */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Environmental Context</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Fields to Include
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(environmentalOptions).map((key) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={contextData.environmentalContext.selectedFields.includes(
                      key
                    )}
                    onChange={(e) =>
                      handleFieldSelection(
                        "environmentalContext",
                        key,
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-700 text-purple-500 focus:ring-purple-500 bg-gray-800"
                  />
                  <span className="text-sm">
                    {key.charAt(0).toUpperCase() +
                      key
                        .slice(1)
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(environmentalOptions).map(
              ([key, options]) =>
                contextData.environmentalContext.selectedFields.includes(
                  key
                ) && (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2">
                      {key.charAt(0).toUpperCase() +
                        key
                          .slice(1)
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={
                        contextData.environmentalContext[
                          key as keyof typeof contextData.environmentalContext
                        ] as string
                      }
                      onChange={(e) =>
                        handleChange(
                          "environmentalContext",
                          key,
                          e.target.value
                        )
                      }
                      required
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="">Select {key}</option>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {contextData.environmentalContext[
                      key as keyof typeof contextData.environmentalContext
                    ] === "Other" && (
                      <input
                        type="text"
                        value={
                          contextData.environmentalContext.otherValues[key] ||
                          ""
                        }
                        onChange={(e) =>
                          handleOtherValue(
                            "environmentalContext",
                            key,
                            e.target.value
                          )
                        }
                        placeholder={`Specify other ${key}`}
                        className="mt-2 w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    )}
                  </div>
                )
            )}
          </div>
        </div>

        {/* Conversation Context */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Conversation Context</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Fields to Include
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(conversationOptions).map((key) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={contextData.conversationContext.selectedFields.includes(
                      key
                    )}
                    onChange={(e) =>
                      handleFieldSelection(
                        "conversationContext",
                        key,
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-700 text-purple-500 focus:ring-purple-500 bg-gray-800"
                  />
                  <span className="text-sm">
                    {key.charAt(0).toUpperCase() +
                      key
                        .slice(1)
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(conversationOptions).map(
              ([key, options]) =>
                contextData.conversationContext.selectedFields.includes(
                  key
                ) && (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2">
                      {key.charAt(0).toUpperCase() +
                        key
                          .slice(1)
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={
                        contextData.conversationContext[
                          key as keyof typeof contextData.conversationContext
                        ] as string
                      }
                      onChange={(e) =>
                        handleChange("conversationContext", key, e.target.value)
                      }
                      required
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="">Select {key}</option>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {contextData.conversationContext[
                      key as keyof typeof contextData.conversationContext
                    ] === "Other" && (
                      <input
                        type="text"
                        value={
                          contextData.conversationContext.otherValues[key] || ""
                        }
                        onChange={(e) =>
                          handleOtherValue(
                            "conversationContext",
                            key,
                            e.target.value
                          )
                        }
                        placeholder={`Specify other ${key}`}
                        className="mt-2 w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    )}
                  </div>
                )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={contextData.date}
              onChange={handleBasicChange}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <input
              type="time"
              name="time"
              value={contextData.time}
              onChange={handleBasicChange}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-lg border border-purple-500 text-purple-500 hover:bg-purple-500/10 transition-colors font-semibold"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
