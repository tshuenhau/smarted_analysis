const OpenAI = require("openai");
const dotenv = require("dotenv");
const yaml = require("js-yaml");
const fs = require("fs");

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});
const assistantId = "asst_bKQWNOfF3Ob4hlVGUNcsP9Ct";

// Main function to execute
async function main() {
  try {
    // Step 1: Read and parse the YAML file
    const yamlFile = fs.readFileSync("./AnalysisTemplate.yaml", "utf8");
    const questionsStructure = yamlFile; // Keep the YAML structure as it is to use in the prompt

    // Step 2: Create a thread
    const thread = await openai.beta.threads.create({});
    console.log(`Thread created with ID: ${thread.id}`);

    // Step 3: Add a user message
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "assistant",
      content: `I need you to help me analyze each question in the pdf. Use the following format for the output for each question:\n\n${questionsStructure}. You should do it for all 40 questions`,
    });
    console.log("Message added:", message);

    // Step 4: Run the assistant and poll for results
    let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
      instructions:
        "Please return the output as a json in the specified format for each question in the PDF. Make sure you do it for all 40 questions.",
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      for (const message of messages.data.reverse()) {
        console.log(`${message.role} > ${message.content[0].text.value}`);
      }
    } else {
      console.log(run.status);
    }
  } catch (error) {
    console.error("Error in processing:", error);
  }
}

// Execute the main function
main();
