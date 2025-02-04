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

// Define a type for the logos structure
interface Logos {
  Premises?: {
    Score?: number;
    "Premise Strength"?: number;
    "Premise Weakness"?: number;
    Reasoning?: string;
  };
  Conclusions?: {
    Score?: number;
    "Conclusion Strength"?: number;
    "Conclusion Weakness"?: number;
    Reasoning?: string;
  };
  Fallacies?: {
    Score?: number;
    "Minor Fallacy Points"?: number;
    "Major Fallacy Points"?: number;
    Reasoning?: string;
  };
  Validity?: {
    Score?: number;
    "Validity Strength"?: number;
    "Validity Weakness"?: number;
    Reasoning?: string;
  };
  Biases?: {
    Score?: number;
    "Minor Bias Points"?: number;
    "Major Bias Points"?: number;
    Reasoning?: string;
  };
  Soundness?: {
    Score?: number;
    "Soundness Strength"?: number;
    "Soundness Weakness"?: number;
    Reasoning?: string;
  };
}

// Function to format logos output
function formatLogosOutput(rawData: Logos) {
  try {
    return {
      Logos: [
        {
          Premises: {
            Score: rawData.Premises?.Score ?? 0.0,
            "Premise Strength": rawData.Premises?.["Premise Strength"] ?? 0.0,
            "Premise Weakness": rawData.Premises?.["Premise Weakness"] ?? 0.0,
            Reasoning: rawData.Premises?.Reasoning ?? "Reasoning not provided.",
          },
          Conclusions: {
            Score: rawData.Conclusions?.Score ?? 0.0,
            "Conclusion Strength":
              rawData.Conclusions?.["Conclusion Strength"] ?? 0.0,
            "Conclusion Weakness":
              rawData.Conclusions?.["Conclusion Weakness"] ?? 0.0,
            Reasoning:
              rawData.Conclusions?.Reasoning ?? "Reasoning not provided.",
          },
          Fallacies: {
            Score: rawData.Fallacies?.Score ?? 0.0,
            "Minor Fallacy Points":
              rawData.Fallacies?.["Minor Fallacy Points"] ?? 0.0,
            "Major Fallacy Points":
              rawData.Fallacies?.["Major Fallacy Points"] ?? 0.0,
            Reasoning:
              rawData.Fallacies?.Reasoning ?? "Reasoning not provided.",
          },
          Validity: {
            Score: rawData.Validity?.Score ?? 0.0,
            "Validity Strength": rawData.Validity?.["Validity Strength"] ?? 0.0,
            "Validity Weakness": rawData.Validity?.["Validity Weakness"] ?? 0.0,
            Reasoning: rawData.Validity?.Reasoning ?? "Reasoning not provided.",
          },
          Biases: {
            Score: rawData.Biases?.Score ?? 0.0,
            "Minor Bias Points": rawData.Biases?.["Minor Bias Points"] ?? 0.0,
            "Major Bias Points": rawData.Biases?.["Major Bias Points"] ?? 0.0,
            Reasoning: rawData.Biases?.Reasoning ?? "Reasoning not provided.",
          },
          Soundness: {
            Score: rawData.Soundness?.Score ?? 0.0,
            "Soundness Strength":
              rawData.Soundness?.["Soundness Strength"] ?? 0.0,
            "Soundness Weakness":
              rawData.Soundness?.["Soundness Weakness"] ?? 0.0,
            Reasoning:
              rawData.Soundness?.Reasoning ?? "Reasoning not provided.",
          },
        },
      ],
    };
  } catch (e) {
    return { error: `Invalid response structure: ${e}` };
  }
}

async function getLogos(
  comment: string
  // explCount: number = 1, // Removed unused variable
  // sentenceType: string = "declarative", // Removed unused variable
  // sentenceStructure: string = "simple" // Removed unused variable
) {
  // explCount = Math.min(explCount, 3); // Removed unused variable

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Analyze the given comment by evaluating the following logos categories: Premises, Conclusions, Fallacies, Validity, Biases, and Soundness.
            Each category must include:
            1. Dimensional (D) scores must be probabilistic values between 0 and 1 (excluding 1).
            2. Primitive (P) scores must be probabilistic values between -1 and 1 (excluding -1 and 1).
            3. A reasoning explanation for each score, written in one concise sentence.
            The reasoning field is mandatory and must not be empty under any circumstance.
            The response must be a valid JSON object with the following structure:
            {
                'Premises': {'Score': float, 'Premise Strength': float, 'Premise Weakness': float, 'Reasoning': string},
                'Conclusions': {'Score': float, 'Conclusion Strength': float, 'Conclusion Weakness': float, 'Reasoning': string},
                'Fallacies': {'Score': float, 'Minor Fallacy Points': float, 'Major Fallacy Points': float, 'Reasoning': string},
                'Validity': {'Score': float, 'Validity Strength': float, 'Validity Weakness': float, 'Reasoning': string},
                'Biases': {'Score': float, 'Minor Bias Points': float, 'Major Bias Points': float, 'Reasoning': string},
                'Soundness': {'Score': float, 'Soundness Strength': float, 'Soundness Weakness': float, 'Reasoning': string}
            }
            Ensure every category includes both scores and reasoning.

            Definitions for the categories:
            1. Premises (D): Reflects the likelihood of the speaker constructing a solid foundation for their argument.
            - Premise Strength (P): The likelihood of the speaker's premises being logical, relevant, and sound.
            - Premise Weakness (P): The likelihood of the speaker's premises being weak, irrelevant, or unsound.

            2. Conclusions (D): Reflects the likelihood of the speaker providing logically coherent conclusions.
            - Conclusion Strength (P): The likelihood of the speaker's conclusions following logically from their premises.
            - Conclusion Weakness (P): The likelihood of the speaker's conclusions being incoherent or failing to follow logically.

            3. Fallacies (D): Reflects the likelihood of the speaker's arguments containing logical errors.
            - Minor Fallacy Points (P): The likelihood of the speaker exhibiting small logical errors that weaken credibility without fully undermining the argument.
            - Major Fallacy Points (P): The likelihood of the speaker exhibiting severe logical errors that critically damage argument integrity.

            4. Validity (D): Reflects the likelihood of the speaker's argument adhering to logical principles.
            - Validity Strength (P): The likelihood of the argument correctly following logical principles to a valid conclusion.
            - Validity Weakness (P): The likelihood of the argument containing flaws that invalidate its logic.

            5. Biases (D): Reflects the likelihood of the speaker's argument being influenced by subjective distortions.
            - Minor Bias Points (P): The likelihood of the speaker exhibiting subtle biases that slightly affect objectivity.
            - Major Bias Points (P): The likelihood of the speaker exhibiting significant biases that distort argument objectivity.

            6. Soundness (D): Reflects the likelihood of the speaker's premises and conclusions being both valid and factually accurate.
            - Soundness Strength (P): The likelihood of the argument being valid and factually true.
            - Soundness Weakness (P): The likelihood of the argument being invalid or factually false, rendering it unsound.`,
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
      return formatLogosOutput(validJson);
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
    const result = await getLogos(text);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to analyze logos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: JSON.stringify(result, null, 2) });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
