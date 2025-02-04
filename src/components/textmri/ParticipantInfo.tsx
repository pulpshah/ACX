"use client";
import { useState } from "react";

// Add demographic options
const demographicOptions = {
  ageRange: [
    "Under 18",
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55-64",
    "65+",
    "Other",
  ],
  gender: ["Male", "Female", "Non-binary", "Prefer not to say", "Other"],
  ethnicity: [
    "Asian",
    "Black",
    "Hispanic/Latino",
    "Middle Eastern",
    "Native American",
    "Pacific Islander",
    "White",
    "Mixed",
    "Other",
  ],
  location: ["Urban", "Suburban", "Rural", "Other"],
  religion: [
    "Christianity",
    "Islam",
    "Judaism",
    "Buddhism",
    "Hinduism",
    "Atheism",
    "Agnosticism",
    "None",
    "Other",
  ],
  politicalAffiliation: [
    "Conservative",
    "Liberal",
    "Moderate",
    "Independent",
    "None",
    "Other",
  ],
  occupation: [
    "Student",
    "Professional",
    "Service Worker",
    "Manager",
    "Executive",
    "Self-employed",
    "Retired",
    "Unemployed",
    "Other",
  ],
  incomeRange: [
    "Under $25,000",
    "$25,000-$49,999",
    "$50,000-$74,999",
    "$75,000-$99,999",
    "$100,000+",
    "Prefer not to say",
    "Other",
  ],
  educationLevel: [
    "High School",
    "Some College",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Trade School",
    "Other",
  ],
};

// Streamline psychographics and add options
const psychographicOptions = {
  Personality: [
    "Introverted",
    "Extroverted",
    "Analytical",
    "Creative",
    "Practical",
    "Idealistic",
    "Other",
  ],
  CommunicationStyle: [
    "Direct",
    "Indirect",
    "Assertive",
    "Passive",
    "Aggressive",
    "Diplomatic",
    "Other",
  ],
  DecisionMaking: [
    "Logical",
    "Emotional",
    "Intuitive",
    "Methodical",
    "Impulsive",
    "Collaborative",
    "Other",
  ],
  Values: [
    "Traditional",
    "Progressive",
    "Family-oriented",
    "Career-driven",
    "Community-focused",
    "Individualistic",
    "Other",
  ],
  Motivations: [
    "Achievement",
    "Security",
    "Recognition",
    "Growth",
    "Connection",
    "Independence",
    "Other",
  ],
  StressResponse: [
    "Problem-solving",
    "Avoidance",
    "Seeking support",
    "Taking action",
    "Analysis",
    "Emotional expression",
    "Other",
  ],
};

// Update the Participant interface
export interface Participant {
  id: string;
  name: string;
  position: string;
  role: "participant" | "moderator" | "observer";
  objectives: {
    text: string;
    priority: number;
  }[];
  demographics: {
    selectedFields: string[];
    ageRange: string;
    gender: string;
    ethnicity: string;
    location: string;
    religion: string;
    politicalAffiliation: string;
    occupation: string;
    incomeRange: string;
    educationLevel: string;
    otherValues: Record<string, string>;
  };
  psychographics: {
    selectedFields: string[];
    Personality: string;
    CommunicationStyle: string;
    DecisionMaking: string;
    Values: string;
    Motivations: string;
    StressResponse: string;
    otherValues: Record<string, string>;
  };
}

// Update the defaultParticipant
const defaultParticipant: Participant = {
  id: "1",
  name: "",
  position: "",
  role: "participant",
  objectives: [{ text: "", priority: 1 }],
  demographics: {
    selectedFields: [],
    ageRange: "",
    gender: "",
    ethnicity: "",
    location: "",
    religion: "",
    politicalAffiliation: "",
    occupation: "",
    incomeRange: "",
    educationLevel: "",
    otherValues: {},
  },
  psychographics: {
    selectedFields: [],
    Personality: "",
    CommunicationStyle: "",
    DecisionMaking: "",
    Values: "",
    Motivations: "",
    StressResponse: "",
    otherValues: {},
  },
};

// Add props interface for initial data
export interface ParticipantInfoProps {
  onComplete: (participants: Participant[]) => void;
  onBack: () => void;
  initialParticipants?: Participant[];
}

export default function ParticipantInfo({
  onComplete,
  onBack,
  initialParticipants,
}: ParticipantInfoProps) {
  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants || [
      { ...defaultParticipant },
      { ...defaultParticipant, id: "2" },
    ]
  );

  const handleChange = (
    participantId: string,
    category: "demographics" | "psychographics",
    field: string,
    value: string | string[]
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              [category]: {
                ...p[category],
                [field]: value,
              },
            }
          : p
      )
    );
  };

  const handleBasicChange = (
    participantId: string,
    field: string,
    value: string
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              [field]: value,
            }
          : p
      )
    );
  };

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      { ...defaultParticipant, id: String(prev.length + 1) },
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 2) {
      alert("At least two participants are required");
      return;
    }
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFieldSelection = (
    participantId: string,
    category: "demographics" | "psychographics",
    field: string,
    isSelected: boolean
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              [category]: {
                ...p[category],
                selectedFields: isSelected
                  ? [...p[category].selectedFields, field]
                  : p[category].selectedFields.filter((f) => f !== field),
              },
            }
          : p
      )
    );
  };

  // Add handler for other values
  const handleOtherValue = (
    participantId: string,
    category: "demographics" | "psychographics",
    field: string,
    value: string
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              [category]: {
                ...p[category],
                otherValues: {
                  ...p[category].otherValues,
                  [field]: value,
                },
              },
            }
          : p
      )
    );
  };

  const addObjective = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              objectives: [...p.objectives, { text: "", priority: 1 }],
            }
          : p
      )
    );
  };

  const removeObjective = (participantId: string, index: number) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              objectives: p.objectives.filter((_, i) => i !== index),
            }
          : p
      )
    );
  };

  const updateObjective = (
    participantId: string,
    index: number,
    field: "text" | "priority",
    value: string | number
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              objectives: p.objectives.map((obj, i) =>
                i === index ? { ...obj, [field]: value } : obj
              ),
            }
          : p
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(participants);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Participant Information</h2>
        <p className="text-gray-400">
          Enter details about the conversation participants
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="p-6 rounded-lg border border-gray-700 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Participant {participant.id}
              </h3>
              <button
                type="button"
                onClick={() => removeParticipant(participant.id)}
                className="text-red-500 hover:text-red-400 transition-colors"
                title="Remove participant"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) =>
                    handleBasicChange(participant.id, "name", e.target.value)
                  }
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Position
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={participant.position}
                  onChange={(e) =>
                    handleBasicChange(
                      participant.id,
                      "position",
                      e.target.value
                    )
                  }
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={participant.role}
                  onChange={(e) =>
                    handleBasicChange(participant.id, "role", e.target.value)
                  }
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="participant">Participant</option>
                  <option value="moderator">Moderator</option>
                  <option value="observer">Observer</option>
                </select>
              </div>
            </div>

            {/* Participant Objectives */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Participant Objectives</h4>
                <button
                  type="button"
                  onClick={() => addObjective(participant.id)}
                  className="text-purple-500 hover:text-purple-400"
                >
                  + Add Objective
                </button>
              </div>
              {participant.objectives.map((obj, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <textarea
                      value={obj.text}
                      onChange={(e) =>
                        updateObjective(
                          participant.id,
                          index,
                          "text",
                          e.target.value
                        )
                      }
                      placeholder="Enter participant objective..."
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
                          participant.id,
                          index,
                          "priority",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  {participant.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(participant.id, index)}
                      className="text-red-500 hover:text-red-400 mt-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Demographics */}
            <div>
              <h4 className="text-lg font-medium mb-4">Demographics</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Fields to Include
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.keys(demographicOptions).map((key) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={participant.demographics.selectedFields.includes(
                          key
                        )}
                        onChange={(e) =>
                          handleFieldSelection(
                            participant.id,
                            "demographics",
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
                {Object.entries(demographicOptions)
                  .filter(([key]) =>
                    participant.demographics.selectedFields.includes(key)
                  )
                  .map(([key, options]) => (
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
                          participant.demographics[
                            key as keyof typeof participant.demographics
                          ] as string
                        }
                        onChange={(e) =>
                          handleChange(
                            participant.id,
                            "demographics",
                            key,
                            e.target.value
                          )
                        }
                        required
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="">
                          Select {key.replace(/([A-Z])/g, " $1").trim()}
                        </option>
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {participant.demographics[
                        key as keyof typeof participant.demographics
                      ] === "Other" && (
                        <input
                          type="text"
                          value={
                            participant.demographics.otherValues[key] || ""
                          }
                          onChange={(e) =>
                            handleOtherValue(
                              participant.id,
                              "demographics",
                              key,
                              e.target.value
                            )
                          }
                          placeholder={`Specify other ${key
                            .replace(/([A-Z])/g, " $1")
                            .trim()}`}
                          className="mt-2 w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Psychographics */}
            <div>
              <h4 className="text-lg font-medium mb-4">Psychographics</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Fields to Include
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.keys(psychographicOptions).map((key) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={participant.psychographics.selectedFields.includes(
                          key
                        )}
                        onChange={(e) =>
                          handleFieldSelection(
                            participant.id,
                            "psychographics",
                            key,
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-700 text-purple-500 focus:ring-purple-500 bg-gray-800"
                      />
                      <span className="text-sm">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(psychographicOptions)
                  .filter(([key]) =>
                    participant.psychographics.selectedFields.includes(key)
                  )
                  .map(([key, options]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-2">
                        {key}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={
                          participant.psychographics[
                            key as keyof typeof participant.psychographics
                          ] as string
                        }
                        onChange={(e) =>
                          handleChange(
                            participant.id,
                            "psychographics",
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
                      {participant.psychographics[
                        key as keyof typeof participant.psychographics
                      ] === "Other" && (
                        <input
                          type="text"
                          value={
                            participant.psychographics.otherValues[key] || ""
                          }
                          onChange={(e) =>
                            handleOtherValue(
                              participant.id,
                              "psychographics",
                              key,
                              e.target.value
                            )
                          }
                          placeholder={`Specify other ${key}`}
                          className="mt-2 w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-lg border border-purple-500 text-purple-500 hover:bg-purple-500/10 transition-colors font-semibold"
          >
            Back
          </button>
          <button
            type="button"
            onClick={addParticipant}
            className="px-6 py-3 rounded-lg border border-purple-500 text-purple-500 hover:bg-purple-500/10 transition-colors font-semibold"
          >
            Add Participant
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
