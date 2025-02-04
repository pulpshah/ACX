import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

// Initialize Groq client
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// @textmri
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

interface TextMRIInput {
  objective: string;
  environmentalContext: unknown;
  conversationContext: unknown;
  participants: unknown[];
  turns: unknown[];
  date?: string;
  time?: string;
}

const defaultOverview: TextMRIResult["overview"] = {
  objective_analysis: {
    stated_objective: "",
    achievement_level: 0,
    key_factors: [],
  },
  context_impact: {
    environmental_factors: [],
    relationship_dynamics: [],
  },
  key_themes: [],
  overall_effectiveness: 0,
};

const defaultConversationDynamics: TextMRIResult["conversation_dynamics"] = {
  flow_analysis: {
    pattern: "",
    effectiveness: 0,
    bottlenecks: [],
  },
  power_dynamics: {
    pattern: "",
    balance: 0,
    observations: [],
  },
  emotional_progression: {
    trajectory: "",
    key_moments: [],
  },
  topic_management: {
    coherence: 0,
    development: "",
    transitions: [],
  },
};

// Function to validate JSON
function validateJson(response: string): unknown | null {
  try {
    const jsonData: unknown = JSON.parse(response);
    return jsonData;
  } catch (e) {
    console.error(`Invalid JSON: ${e}`);
    return null;
  }
}

// Function to format TextMRI output
function formatTextMRIOutput(rawData: unknown): TextMRIResult {
  try {
    const data = rawData as Partial<TextMRIResult>;
    return {
      overview: data.overview ?? defaultOverview,
      participant_analysis: data.participant_analysis ?? [],
      turn_analysis: data.turn_analysis ?? [],
      conversation_dynamics:
        data.conversation_dynamics ?? defaultConversationDynamics,
      recommendations: data.recommendations ?? [],
    };
  } catch (e) {
    console.error(`Invalid response structure: ${e}`);
    return {
      overview: defaultOverview,
      participant_analysis: [],
      turn_analysis: [],
      conversation_dynamics: defaultConversationDynamics,
      recommendations: [],
    };
  }
}

async function analyzeConversation(
  objective: string,
  environmentalContext: unknown,
  conversationContext: unknown,
  participants: unknown[],
  turns: unknown[],
  date?: string,
  time?: string
): Promise<TextMRIResult | null> {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an advanced Conversation Analysis Expert specializing in deep textual analysis. Your task is to provide a comprehensive analysis of conversations considering all provided context, participant information, and conversation turns.

ANALYSIS FRAMEWORK:

1. Context Understanding:
- Objective: Analyze the stated conversation objective
- Environmental Factors: Consider location, setting, atmosphere, time, noise levels, and privacy
- Conversational Context: Evaluate relationships, history, power dynamics, formality, emotional states, and urgency
- Temporal Context: Consider date and time implications

2. Participant Analysis:
- Demographics: Consider age, gender, ethnicity, location, religion, political affiliation, occupation, income, and education
- Psychographics: Evaluate personality traits, communication styles, decision-making patterns, values, motivations, and stress responses
- Role Analysis: Understand each participant's position and contribution

3. Turn-by-Turn Analysis:
- Content Analysis: Evaluate the substance of each turn
- Rhetorical Analysis: Identify ethos, pathos, and logos elements
- Argument Structure: Analyze claims, premises, and conclusions
- Language Patterns: Examine word choice, tone, and style
- Response Dynamics: Evaluate how turns relate to previous turns
- Non-verbal Indicators: Consider any noted non-verbal elements

4. Conversation Dynamics:
- Flow Analysis: Evaluate conversation progression and rhythm
- Power Dynamics: Analyze how authority and influence manifest
- Emotional Progression: Track emotional changes throughout
- Topic Evolution: Follow how subjects develop and change
- Interaction Patterns: Identify recurring patterns
- Conflict & Resolution: Analyze any tensions and their resolution

5. Effectiveness Metrics:
- Objective Achievement: Measure progress toward stated goals
- Participant Engagement: Evaluate involvement levels
- Communication Clarity: Assess message clarity and understanding
- Relationship Impact: Analyze effects on participant relationships
- Resolution Quality: Evaluate outcomes and decisions reached

Return a valid RFC-8259 compliant JSON object with the following schema:
{
  "overview": {
    "objective_analysis": {
      "stated_objective": string,
      "achievement_level": number (0-1),
      "key_factors": string[]
    },
    "context_impact": {
      "environmental_factors": {
        "factor": string,
        "impact_level": number (0-1),
        "observations": string[]
      }[],
      "relationship_dynamics": {
        "dynamic": string,
        "strength": number (0-1),
        "observations": string[]
      }[]
    },
    "key_themes": string[],
    "overall_effectiveness": number (0-1)
  },
  "participant_analysis": [
    {
      "participant_id": string,
      "engagement_level": number (0-1),
      "communication_style": {
        "primary_style": string,
        "adaptability": number (0-1),
        "effectiveness": number (0-1)
      },
      "influence_patterns": {
        "technique": string,
        "frequency": number (0-1),
        "effectiveness": number (0-1)
      }[],
      "behavioral_insights": string[],
      "development_areas": string[]
    }
  ],
  "turn_analysis": [
    {
      "turn_id": number,
      "speaker": string,
      "content_analysis": {
        "main_point": string,
        "clarity": number (0-1),
        "impact": number (0-1)
      },
      "rhetorical_elements": {
        "ethos": number (0-1),
        "pathos": number (0-1),
        "logos": number (0-1)
      },
      "response_quality": {
        "relevance": number (0-1),
        "constructiveness": number (0-1)
      },
      "psychological_indicators": string[],
      "turn_impact": string
    }
  ],
  "conversation_dynamics": {
    "flow_analysis": {
      "pattern": string,
      "effectiveness": number (0-1),
      "bottlenecks": string[]
    },
    "power_dynamics": {
      "pattern": string,
      "balance": number (0-1),
      "observations": string[]
    },
    "emotional_progression": {
      "trajectory": string,
      "key_moments": {
        "moment": string,
        "impact": string
      }[]
    },
    "topic_management": {
      "coherence": number (0-1),
      "development": string,
      "transitions": string[]
    }
  },
  "recommendations": [
    {
      "target": string,
      "observation": string,
      "suggestion": string,
      "expected_impact": string
    }
  ]
}

Ensure your analysis is:
1. Objective: Based on observable patterns and evidence
2. Contextual: Considering all provided background information
3. Actionable: Providing specific, implementable recommendations
4. Balanced: Acknowledging both strengths and areas for improvement
5. Culturally Sensitive: Respecting diverse backgrounds and perspectives`,
        },
        {
          role: "user",
          content: JSON.stringify({
            objective,
            environmental_context: environmentalContext,
            conversation_context: conversationContext,
            participants,
            turns,
            date,
            time,
          }),
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;
    if (!result) return null;

    const validJson = validateJson(result);
    if (validJson) {
      return formatTextMRIOutput(validJson);
    } else {
      console.error("Failed to generate valid JSON. Raw response:", result);
      return null;
    }
  } catch (e) {
    console.error(`Error occurred: ${e}`);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as TextMRIInput;
    const {
      objective,
      environmentalContext,
      conversationContext,
      participants,
      turns,
      date,
      time,
    } = data;

    const result = await analyzeConversation(
      objective,
      environmentalContext,
      conversationContext,
      participants,
      turns,
      date,
      time
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to analyze conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: JSON.stringify(result, null, 2) });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error"+error },
      { status: 500 }
    );
  }
}
