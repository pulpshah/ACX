"use client";
import { useState } from "react";
import { Participant } from "./ParticipantInfo";

export interface Turn {
  id: string;
  speakerId: string;
  text: string;
}

export interface ConversationTurnsProps {
  participants: Participant[];
  onComplete: (turns: Turn[]) => void;
  onBack: () => void;
  initialTurns?: Turn[];
  isAnalyzing: boolean;
}

export default function ConversationTurns({
  participants,
  onComplete,
  onBack,
  initialTurns
}: ConversationTurnsProps) {
  const [turns, setTurns] = useState<Turn[]>(
    initialTurns || [
      { id: "1", speakerId: "", text: "" },
      { id: "2", speakerId: "", text: "" },
    ]
  );

  const handleChange = (
    turnId: string,
    field: "speakerId" | "text",
    value: string
  ) => {
    setTurns((prev) =>
      prev.map((turn) =>
        turn.id === turnId
          ? {
              ...turn,
              [field]: value,
            }
          : turn
      )
    );
  };

  const addTurn = () => {
    setTurns((prev) => [
      ...prev,
      { id: String(prev.length + 1), speakerId: "", text: "" },
    ]);
  };

  const removeTurn = (id: string) => {
    if (turns.length <= 2) {
      alert("At least two turns are required");
      return;
    }
    setTurns((prev) => prev.filter((turn) => turn.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(turns);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Conversation Turns</h2>
        <p className="text-gray-400">Enter the conversation exchange</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {turns.map((turn) => (
          <div
            key={turn.id}
            className="p-6 rounded-lg border border-gray-700 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Turn {turn.id}</h3>
              <button
                type="button"
                onClick={() => removeTurn(turn.id)}
                className="text-red-500 hover:text-red-400 transition-colors"
                title="Remove turn"
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Speaker
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={turn.speakerId}
                  onChange={(e) =>
                    handleChange(turn.id, "speakerId", e.target.value)
                  }
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select a speaker</option>
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name} ({participant.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Text
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={turn.text}
                  onChange={(e) =>
                    handleChange(turn.id, "text", e.target.value)
                  }
                  required
                  rows={4}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="What was said in this turn?"
                />
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
            onClick={addTurn}
            className="px-6 py-3 rounded-lg border border-purple-500 text-purple-500 hover:bg-purple-500/10 transition-colors font-semibold"
          >
            Add Turn
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold"
          >
            Analyze Conversation
          </button>
        </div>
      </form>
    </div>
  );
}
