const { BlobServiceClient } = require("@azure/storage-blob");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const OpenAI = require("openai");

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const accountName = "aintrestblob";
const containerName = "aintrestapp";
if (!accountName) throw Error("Azure Storage accountName not found");

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_KEY
);

const filePath = "./data/books/class-7-Our Pasts.pdf";
const subject = "History";

async function main() {
  // Upload the file to OpenAI and get the file ID
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  // Initiate the Azure container service to upload the file
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `books/class7/${filePath
    .replace(`./data/books/class-7-`, "")
    .toLowerCase()}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const stream = fs.createReadStream(filePath);

  // Upload the file to Azure Blob Storage
  const uploadResponse = await blockBlobClient.uploadStream(
    stream,
    undefined,
    undefined,
    {
      blobHTTPHeaders: { blobContentType: "application/pdf" }, // Set the content type
    }
  );

  const blobUrl = blockBlobClient.url;

  // Create an assistant with the file
  const assistant = await openai.beta.assistants.create({
    name: `${subject} Teacher`,
    instructions: `You are a Socratic ${subject} tutor. Use the following principles in responding to students:

      - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.
      - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.
      - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.
      - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.
      - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.
      - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.
    `,

    model: "gpt-3.5-turbo-1106",
    tools: [{ type: "code_interpreter" }, { type: "retrieval" }],
    file_ids: [file.id],
  });

  try {
    const assistantDb = await prisma.assistant.create({
      data: {
        id: assistant.id,
        object: assistant.object,
        created_at: assistant.created_at,
        name: assistant.name,
        description: assistant.description,
        model: assistant.model,
        instructions: assistant.instructions,
        tools: assistant.tools,
        file_ids: assistant.file_ids,
      },
    });

    const book = await prisma.books.create({
      data: {
        fileId: file.id,
        name: filePath
          .replace(`./data/books/class-7-`, "")
          .toLowerCase()
          .slice(0, -4),
        class: "Class7",
        subject: subject,
        url: blobUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        assistantsCount: 1,
      },
    });

    await prisma.assistantBooks.create({
      data: {
        assistantId: assistant.id,
        bookId: file.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.log(error);
  }
}

main();
