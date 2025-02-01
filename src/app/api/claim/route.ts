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

// Function to format claim output
function formatClaimOutput(rawData: any) {
  try {
    const claims = rawData.Claims?.Claims || ["None"];
    const knowledgeFields = rawData.Claims?.Knowledge_Field || ["None"];
    const knowledgeFieldReasonings = rawData.Claims?.Knowledge_Field_Reasoning || ["None"];
    const knowledgeSets = rawData.Claims?.Knowledge_Set || ["None"];
    const knowledgeSetReasonings = rawData.Claims?.Knowledge_Set_Reasoning || ["None"];
    const types = rawData.Claims?.Claim_Type || ["None"];
    const typeReasonings = rawData.Claims?.Claim_Type_Reasoning || ["None"];
    const forms = rawData.Claims?.Claim_Form || ["None"];
    const formReasonings = rawData.Claims?.Claim_Form_Reasoning || ["None"];
    const knowledgeTypes = rawData.Claims?.Knowledge_Type || ["None"];
    const knowledgeTypeReasonings = rawData.Claims?.Knowledge_Type_Reasoning || ["None"];
    const scopes = rawData.Claims?.Interdisciplinary_Scope || ["None"];
    const scopeReasonings = rawData.Claims?.Interdisciplinary_Scope_Reasoning || ["None"];
    const reasonings = rawData.Claims?.Claim_Reasoning || ["None"];

    const formattedClaims = claims.map((claim: string, index: number) => ({
      Claim_Text: claim,
      Knowledge_Field: knowledgeFields[index],
      Knowledge_Field_Reasoning: knowledgeFieldReasonings[index],
      Knowledge_Set: knowledgeSets[index],
      Knowledge_Set_Reasoning: knowledgeSetReasonings[index],
      Claim_Type: types[index],
      Claim_Type_Reasoning: typeReasonings[index],
      Claim_Form: forms[index],
      Claim_Form_Reasoning: formReasonings[index],
      Knowledge_Type: knowledgeTypes[index],
      Knowledge_Type_Reasoning: knowledgeTypeReasonings[index],
      Interdisciplinary_Scope: scopes[index],
      Interdisciplinary_Scope_Reasoning: scopeReasonings[index],
      Claim_Reasoning: reasonings[index],
    }));

    return {
      Claims: formattedClaims,
    };
  } catch (e) {
    return { error: `Invalid response structure: ${e}` };
  }
}

async function getClaims(
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
          content: `Analyze the given comment by extracting and identifying any claims within it.
            A claim is any single statement of controversy advanced for the purpose of argument.

            There are three types of claims with the following definitions:
            1. Claim of Fact: Asserts that something quantifiable has existed, does exist, or will exist.
            2. Claim of Policy: Asserts that something should or should not be done by someone about something. It proposes that a specific course of action should, but not necessarily will, be taken.
            3. Claim of Value: Asserts qualitative judgments along a good-to-bad continuum relating to persons, events, and things in one's environment.

            There are two forms of claims with the following definitions:
            1. Implicit: A claim that is not directly stated in the text but can be inferred from context.
            2. Explicit: A claim that is directly stated and leaves nothing for interpretation.

            There are six kinds of knowledge fields with the following definitions:
            1. Abstract Knowledge: Knowledge derived from axiomatic and theoretical reasoning. This includes logic, mathematics, and set theory.
            2. Empirical Sciences: Knowledge based on experimental observation and reproducibility. This includes physics, chemistry, and biology.
            3. Social Sciences: Knowledge that combines observational and theoretical analysis of human behavior and society. This includes sociology, psychology, and anthropology.
            4. Experiential Knowledge: Knowledge based on personal or collective lived experiences, introspection, and philosophy. This includes ethics, philosophy, and cultural studies.
            5. Applied Knowledge: Practical application of theories and models to real-world problems. This includes data science, engineering, computer science.
            6. Emerging Knowledge: Multidisciplinary and evolving knowledge domains. This includes artificial intelligence, behavioral economics, environmental sciences.

            There are eighteen kinds of knowledge sets with the following defitions:
            1. Logic: The study of formal reasoning and arguments.
            2. Mathematics: The study of numbers, quantities, shapes, and their relationships.
            3. Set Theory: The study of collections of objects, called sets, and their properties.
            4. Physics: The study of collections of objects, called sets, and their properties.
            5. Chemistry: The study of substances, their properties, reactions, and the changes they undergo.
            6. Biology: The study of living organisms and their processes.
            7. Sociology: The study of social behavior, institutions, and human interactions.
            8. Psychology: The scientific study of the human mind and behavior.
            9. Anthropology: The study of human cultures, societies, and biological evolution.
            10. Ethics: The philosophical study of morality, values, and principles.
            11. Philosophy: The study of fundamental questions about existence, knowledge, values, reason, and reality.
            12. Cultural Studies: The interdisciplinary analysis of cultural phenomena and practices.
            13. Data Science: Applying statistical methods and algorithms to interpret complex datasets.
            14. Engineering: The application of science and mathematics to design, build, and maintain structures, machines, and systems.
            15. Computer Science: The study of algorithms, computation, and information processing.
            16. Artificial Intelligence: Study and application of intelligent algorithms to mimic human cognitive functions.
            17. Behavioral Economics: The study of psychological and behavioral factors affecting economic decision-making.
            18. Environmental Sciences: The study of the environment and solutions to environmental challenges.

            There are types of knowledge sets with the following defitions:
            1. Declarative: Statements of fact or observation.
            2. Procedural: Steps or interventions to achieve outcomes.
            3. Conditional: Statements dependent on specific conditions.

            Make sure to follow these guidelines:
            1. The reasoning field is mandatory and must not be empty under any circumstance.
            2. Identify one knowledge field the claim primarily falls under using the previous knowledge field definitions.
            3. Identify one knowledge set the claim primarily falls under using the previous knowledge set definitions.
            3. The identified knowledge set must be included in the knowledge field.
            4. Use declarative sentences with a simple structure for the explanations.
            5. The response must be a valid RFC-8259 compliant JSON object with the following structure:
            {
                'Claims': {
                    'Claims': [list of string claims],
                    'Knowledge_Field': [list of knowledge fields corresponding to each claim],
                    'Knowledge_Field_Reasoning': [list of reasoning strings corresponding to each knowledge field],
                    'Knowledge_Set': [list of knowledge fields corresponding to each claim],
                    'Knowledge_Set_Reasoning': [list of reasoning strings corresponding to each knowledge set],
                    'Claim_Type': [list of types corresponding to each claim: 'Claim_of_Fact', 'Claim_of_Policy', or 'Claim_of_Value'],
                    'Claim_Type_Reasoning': [list of reasoning strings corresponding to each claim type],
                    'Claim_Form': [list of forms corresponding to each claim: 'Implicit' or 'Explicit'],
                    'Claim_Form_Reasoning': [list of reasoning strings corresponding to each claim type],
                    'Knowledge_Type': [list of knowledge types corresponding to each claim],
                    'Knowledge_Type_Reasoning': [list of reasoning strings corresponding to each knowledge type],
                    'Interdisciplinary_Scope': [list of interdisciplinary scopes corresponding to each claim],
                    'Interdisciplinary_Scope_Reasoning': [list of reasoning strings corresponding to each interdisciplinary scope],
                    'Claim_Reasoning': [list of reasoning strings corresponding to each claim]
                }
            }

            Ensure that each claim is accompanied by its type, form, and a concise reasoning explanation. The reasoning should explain why the claim fits the specified type and form.`,
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
      return formatClaimOutput(validJson);
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
    const result = await getClaims(text);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to analyze claims" },
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
