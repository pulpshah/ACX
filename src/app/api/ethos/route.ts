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

// Define a type for the ethos structure
interface Ethos {
  Trust?: {
    Score?: number;
    Honesty?: number;
    Dishonesty?: number;
    Reasoning?: string;
  };
  Influence?: {
    Score?: number;
    Authority?: number;
    Acquiescence?: number;
    Reasoning?: string;
  };
  Capability?: {
    Score?: number;
    Power?: number;
    Weakness?: number;
    Reasoning?: string;
  };
  Reliability?: {
    Score?: number;
    Expertise?: number;
    Inexperience?: number;
    Reasoning?: string;
  };
  Assurance?: {
    Score?: number;
    Credibility?: number;
    Fraudulence?: number;
    Reasoning?: string;
  };
  Acceptance?: {
    Score?: number;
    Legitimacy?: number;
    Illegitimacy?: number;
    Reasoning?: string;
  };
}

// Function to format ethos output
function formatEthosOutput(rawData: Ethos) {
  try {
    return {
      Ethos: [
        {
          Trust: {
            Score: rawData.Trust?.Score ?? 0.0,
            Honesty: rawData.Trust?.Honesty ?? 0.0,
            Dishonesty: rawData.Trust?.Dishonesty ?? 0.0,
            Reasoning: rawData.Trust?.Reasoning ?? "Reasoning not provided.",
          },
          Influence: {
            Score: rawData.Influence?.Score ?? 0.0,
            Authority: rawData.Influence?.Authority ?? 0.0,
            Acquiescence: rawData.Influence?.Acquiescence ?? 0.0,
            Reasoning:
              rawData.Influence?.Reasoning ?? "Reasoning not provided.",
          },
          Capability: {
            Score: rawData.Capability?.Score ?? 0.0,
            Power: rawData.Capability?.Power ?? 0.0,
            Weakness: rawData.Capability?.Weakness ?? 0.0,
            Reasoning:
              rawData.Capability?.Reasoning ?? "Reasoning not provided.",
          },
          Reliability: {
            Score: rawData.Reliability?.Score ?? 0.0,
            Expertise: rawData.Reliability?.Expertise ?? 0.0,
            Inexperience: rawData.Reliability?.Inexperience ?? 0.0,
            Reasoning:
              rawData.Reliability?.Reasoning ?? "Reasoning not provided.",
          },
          Assurance: {
            Score: rawData.Assurance?.Score ?? 0.0,
            Credibility: rawData.Assurance?.Credibility ?? 0.0,
            Fraudulence: rawData.Assurance?.Fraudulence ?? 0.0,
            Reasoning:
              rawData.Assurance?.Reasoning ?? "Reasoning not provided.",
          },
          Acceptance: {
            Score: rawData.Acceptance?.Score ?? 0.0,
            Legitimacy: rawData.Acceptance?.Legitimacy ?? 0.0,
            Illegitimacy: rawData.Acceptance?.Illegitimacy ?? 0.0,
            Reasoning:
              rawData.Acceptance?.Reasoning ?? "Reasoning not provided.",
          },
        },
      ],
    };
  } catch (e) {
    return { error: `Invalid response structure: ${e}` };
  }
}

async function getEthos(
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
          content: `Analyze the given comment by evaluating the following ethos categories: Trust, Influence, Capability, Reliability, Assurance, and Acceptance.
            Each category must include:
            1. Dimensional (D) scores must be probabilistic values between 0 and 1 (excluding 1).
            2. Primitive (P) scores must be probabilistic values between -1 and 1 (excluding -1 and 1).
            3. A reasoning explanation for each score, written in one concise sentence.
            The reasoning field is mandatory and must not be empty under any circumstance.
            The response must be a valid JSON object with the following structure:
            {
                'Trust': {'Score': float, 'Honesty': float, 'Dishonesty': float, 'Reasoning': string},
                'Influence': {'Score': float, 'Authority': float, 'Acquiescence': float, 'Reasoning': string},
                'Capability': {'Score': float, 'Power': float, 'Weakness': float, 'Reasoning': string},
                'Reliability': {'Score': float, 'Expertise': float, 'Inexperience': float, 'Reasoning': string},
                'Assurance': {'Score': float, 'Credibility': float, 'Fraudulence': float, 'Reasoning': string},
                'Acceptance': {'Score': float, 'Legitimacy': float, 'Illegitimacy': float, 'Reasoning': string}
            }
            Ensure every category includes both scores and reasoning.

            Definitions for the categories:
            1. Trust (D): Reflects the likelihood that the Transmitter Agent inspires confidence in their honesty and ethical alignment.
            - Honesty (P): The likelihood of a Transmitter Agent exhibiting truthfulness, transparency, and ethical consistency.
            - Dishonesty (P): The likelihood of a Transmitter Agent exhibiting deception, manipulation, or lack of moral alignment.

            2. Influence (D): Measures the likelihood that the Transmitter Agent affects the thoughts or behaviors of others.
            - Authority (P): The likelihood of the Transmitter Agent commanding attention and respect through their influence.
            - Acquiescence (P): The likelihood of the Transmitter Agent yielding to others or showing a lack of assertiveness, reducing their influence.

            3. Capability (D): Represents the likelihood of the Transmitter Agent being perceived as competent and effective.
            - Power (P): The likelihood of the Transmitter Agent being seen as able to control or affect outcomes through strength and assertiveness.
            - Weakness (P): The likelihood of the Transmitter Agent being perceived as lacking the ability to influence or demonstrating fragility.

            4. Reliability (D): Reflects the likelihood that the Transmitter Agent is consistent, dependable, and knowledgeable.
            - Expertise (P): The likelihood of the Transmitter Agent being perceived as knowledgeable, skilled, and experienced in their subject area.
            - Inexperience (P): The likelihood of the Transmitter Agent being perceived as lacking knowledge or competence, undermining their reliability.

            5. Assurance (D): Evaluates the likelihood of the Transmitter Agent's credibility and integrity being confirmed by external validation.
            - Credibility (P): The likelihood of the Transmitter Agent being seen as believable, supported by evidence such as credentials or endorsements.
            - Fraudulence (P): The likelihood of the Transmitter Agent being perceived as deceptive, unreliable, or fraudulent in their message or presentation.

            6. Acceptance (D): Measures the likelihood that the Transmitter Agent's role, position, or arguments are perceived as justified and accepted.
            - Legitimacy (P): The likelihood of the audience perceiving the Transmitter Agent's authority or arguments as deserved.
            - Illegitimacy (P): The likelihood of the audience perceiving the Transmitter Agent's authority or arguments as undeserved.`,
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
      return formatEthosOutput(validJson);
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
    const result = await getEthos(text);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to analyze ethos" },
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
