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

// Function to format argument output
function formatArgOutput(rawData: any) {
  try {
    const args = rawData.Arguments || [];

    const formattedArguments = args.map((arg: any) => ({
      Argument_Text: arg.Argument_Text || "None",
      Premises: arg.Premises || ["None"],
      Premises_Reasoning: arg.Premises_Reasoning || ["None"],
      Conclusion: arg.Conclusion || "None",
      Conclusion_Reasoning: arg.Conclusion_Reasoning || "None",
      Argument_Form: arg.Argument_Form || "None",
      Argument_Form_Reasoning: arg.Argument_Form_Reasoning || "None",
      Completeness: arg.Completeness || "Incomplete",
      Completeness_Reasoning: arg.Completeness_Reasoning || ["None"],
      Strategy: arg.Strategy || "False",
      Strategy_Reasoning: arg.Strategy_Reasoning || ["None"],
      Knowledge_Field: arg.Knowledge_Field || ["None"],
      Knowledge_Field_Reasoning: arg.Knowledge_Field_Reasoning || ["None"],
      Knowledge_Set: arg.Knowledge_Set || ["None"],
      Knowledge_Set_Reasoning: arg.Knowledge_Set_Reasoning || ["None"],
      Knowledge_Type: arg.Knowledge_Type || ["None"],
      Knowledge_Type_Reasoning: arg.Knowledge_Type_Reasoning || ["None"],
      Interdisciplinary_Scope: arg.Interdisciplinary_Scope || ["None"],
      Interdisciplinary_Scope_Reasoning:
        arg.Interdisciplinary_Scope_Reasoning || ["None"],
      Argument_Reasoning: arg.Argument_Reasoning || "None",
    }));

    return {
      Arguments: formattedArguments,
    };
  } catch (e) {
    return { error: `Invalid response structure: ${e}` };
  }
}

async function getArguments(
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
          content: `You are an AI Comment Analysis Expert. Given a comment, your task is to extract and identify all arguments, along with their premises and conclusions, within the comment.

            The following are the definitions related to arguments, premises, and conclusions:
            1. Argument: A set of statements comprising premises and a conclusion, where the premises provide evidence, reasons, or grounds to support the conclusion. 
            2. Premise: A statement that provides the basis or rationale for accepting the conclusion.
            3. Conclusion: The statement being argued for, supported by the premises.

            There are two forms of arguments with the following definitions:
            1. Implicit: An argument that is not directly stated in the text but can be inferred from context.
            2. Explicit: An argument that is directly stated and leaves nothing for interpretation.

            The completeness of an argument is based on the following defintions:
            1. Complete: An argument in which the premises provide sufficient support to justify the conclusion.
            In a complete argument, all the necessary premises are stated explicitly, and the reasoning is logical and well-structured.
            2. Incomplete: An argument in which not all the necessary premises are explicitly stated, leaving gaps in the reasoning.
            The conclusion may not follow clearly from the given premises, requiring the audience to infer or supply missing information.

            Whether the argument is a strategy or not depends on the following defintion:
            1. Strategy: An argument is a strategy when it utilizes all three types of knowledge (Declarative, Procedural, and Conditional) with the purpose of completing an objective.

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
            1. If an argument is not found, return 'None' in a list for that category.
            2. If a premise or conclusion is missing for an argument, return 'False' for that category.
            3. Provide an explanation (\`expl\`) for each identified argument, premise, and conclusion using concise sentences.
            4. Identify one knowledge field the argument primarily falls under using the previous knowledge field definitions.
            5. Identify one knowledge set the argument primarily falls under using the previous knowledge set definitions.
            6. The identified knowledge set must be included in the knowledge field.
            7. Use ${sentenceType} sentences with a ${sentenceStructure} structure for the explanations.
            8. If no explanation can be provided for a specific type, return 'None' in a list for the explanation.

            Return a valid RFC-8259 compliant JSON object with the following schema:
            {
                'Arguments': [
                    {
                        'Argument_Text': string containing the argument,
                        'Premises': [list of strings containing the premises],
                        'Premises_Reasoning': [list of reasoning strings corresponding to each premise],
                        'Conclusion': 'string containing the conclusion',
                        'Conclusion_Reasoning': [list of reasoning strings corresponding to the conclusion],
                        'Argument_Form': 'string corresponding to argument form: Implicit or Explicit',
                        'Argument_Form_Reasoning': [list of reasoning strings corresponding to argument form],
                        'Completeness': 'string corresponding to argument completeness: Incomplete or Complete',
                        'Completeness_Reasoning': [list of reasoning strings corresponding to argument completeness],
                        'Strategy': 'string corresponding to whether the argument is a strategy: False or True',
                        'Strategy_Reasoning': [list of reasoning strings corresponding to whether the argument is a strategy],
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
                        'Argument_Reasoning': [list of reasoning strings corresponding to the argument]
                    },
                    ... (one object per argument found)
                ]
            }

            Ensure your response adheres to this schema.`,
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
      return formatArgOutput(validJson);
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
    const result = await getArguments(text);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to analyze arguments" },
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
