import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

// Initialize Groq client
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Function to validate JSON
function validateJson(response: string) {
  try {
    const jsonData = JSON.parse(response);
    return jsonData;
  } catch (e) {
    console.error(`Invalid JSON: ${e}`);
    return null;
  }
}

// Function to format pathos output
function formatPathosOutput(rawData: any) {
  try {
    return {
      Pathos: [
        {
          Sentiment: {
            Score: rawData.Sentiment?.Score ?? 0.0,
            Joy: rawData.Sentiment?.Joy ?? 0.0,
            Sadness: rawData.Sentiment?.Sadness ?? 0.0,
            Reasoning:
              rawData.Sentiment?.Reasoning ?? "Reasoning not provided.",
          },
          Vulnerability: {
            Score: rawData.Vulnerability?.Score ?? 0.0,
            Trust: rawData.Vulnerability?.Trust ?? 0.0,
            Disgust: rawData.Vulnerability?.Disgust ?? 0.0,
            Reasoning:
              rawData.Vulnerability?.Reasoning ?? "Reasoning not provided.",
          },
          Expectation: {
            Score: rawData.Expectation?.Score ?? 0.0,
            Anticipation: rawData.Expectation?.Anticipation ?? 0.0,
            Surprise: rawData.Expectation?.Surprise ?? 0.0,
            Reasoning:
              rawData.Expectation?.Reasoning ?? "Reasoning not provided.",
          },
          Alertness: {
            Score: rawData.Alertness?.Score ?? 0.0,
            Rage: rawData.Alertness?.Rage ?? 0.0,
            Fear: rawData.Alertness?.Fear ?? 0.0,
            Reasoning:
              rawData.Alertness?.Reasoning ?? "Reasoning not provided.",
          },
          Togetherness: {
            Score: rawData.Togetherness?.Score ?? 0.0,
            Unity: rawData.Togetherness?.Unity ?? 0.0,
            Polarity: rawData.Togetherness?.Polarity ?? 0.0,
            Reasoning:
              rawData.Togetherness?.Reasoning ?? "Reasoning not provided.",
          },
          Pity: {
            Score: rawData.Pity?.Score ?? 0.0,
            Empathy: rawData.Pity?.Empathy ?? 0.0,
            "Self-Sympathy": rawData.Pity?.["Self-Sympathy"] ?? 0.0,
            Reasoning: rawData.Pity?.Reasoning ?? "Reasoning not provided.",
          },
        },
      ],
    };
  } catch (e) {
    return { error: `Invalid response structure: ${e}` };
  }
}

async function getPathos(
  comment: string,
  explCount: number = 1,
  sentenceType: string = "declarative",
  sentenceStructure: string = "simple"
) {
  explCount = Math.min(explCount, 3);

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Analyze the given comment by evaluating the following pathos categories: Sentiment, Vulnerability, Expectation, Alertness, Togetherness, and Pity.
        Each category must include:
        1. Dimensional (D) scores must be probabilistic values between 0 and 1 (excluding 1).
        2. Primitive (P) scores must be probabilistic values between -1 and 1 (excluding -1 and 1).
        3. A reasoning explanation for each score, written in one concise sentence.
        The reasoning field is mandatory and must not be empty under any circumstance.
        The response must be a valid JSON object with the following structure:
        {
            'Sentiment': {'Score': float, 'Joy': float, 'Sadness': float, 'Reasoning': string},
            'Vulnerability': {'Score': float, 'Trust': float, 'Disgust': float, 'Reasoning': string},
            'Expectation': {'Score': float, 'Anticipation': float, 'Surprise': float, 'Reasoning': string},
            'Alertness': {'Score': float, 'Rage': float, 'Fear': float, 'Reasoning': string},
            'Togetherness': {'Score': float, 'Unity': float, 'Polarity': float, 'Reasoning': string},
            'Pity': {'Score': float, 'Empathy': float, 'Self-Sympathy': float, 'Reasoning': string}
        }
        Ensure every category includes both scores and reasoning.

        Definitions for the categories:
        1. Sentiment (D): Reflects the likelihood of the speaker evoking positive or negative emotions in the audience.
        - Joy (P): The likelihood of the speaker evoking happiness, satisfaction, or enthusiasm in the audience.
        - Sadness (P): The likelihood of the speaker evoking sorrow, empathy, or compassion in the audience.

        2. Vulnerability (D): Reflects the likelihood of the speaker influencing the audience by appealing to their sense of powerlessness or emotional fragility.
        - Trust (P): The likelihood of the speaker inspiring confidence and reliance in the audience.
        - Disgust (P): The likelihood of the speaker evoking repulsion or moral objection in the audience.

        3. Expectation (D): Reflects the likelihood of the speaker creating anticipation or surprise in the audience.
        - Anticipation (P): The likelihood of the speaker evoking excitement or eagerness for future developments.
        - Surprise (P): The likelihood of the speaker presenting unexpected or novel information that astonishes the audience.

        4. Alertness (D): Reflects the likelihood of the speaker evoking heightened emotional responses in the audience.
        - Rage (P): The likelihood of the speaker channeling or evoking anger, frustration, or outrage.
        - Fear (P): The likelihood of the speaker evoking anxiety, concern, or dread as a persuasive tool.

        5. Togetherness (D): Reflects the likelihood of the speaker fostering a sense of unity or division among the audience.
        - Unity (P): The likelihood of the speaker fostering solidarity and shared purpose.
        - Polarity (P): The likelihood of the speaker fostering division, opposition, or alienation.

        6. Pity (D): Reflects the likelihood of the speaker influencing the audience through compassion or self-directed sympathy.
        - Empathy (P): The likelihood of the speaker evoking compassion and understanding for others' struggles or pain.
        - Self-Sympathy (P): The likelihood of the speaker invoking pity for their own challenges or suffering.`,
        },
        {
          role: "user",
          content: `Analyze the following comment: ${comment}`,
        },
      ],
      temperature: 1,
      max_tokens: 5000,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;
    if (!result) return null;

    const validJson = validateJson(result);
    if (validJson) {
      return formatPathosOutput(validJson);
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
    const { text } = await req.json();
    const result = await getPathos(text);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to analyze pathos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: JSON.stringify(result, null, 2) });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
