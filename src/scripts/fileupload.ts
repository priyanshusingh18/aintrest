// const { BlobServiceClient } = require("@azure/storage-blob");

// const { PrismaClient } = require("@prisma/client");
// const fs = require("fs");
// const OpenAI = require("openai");
// const { DefaultAzureCredential } = require("@azure/identity");
// let prisma = new PrismaClient();
// const openai = new OpenAI({
//   apiKey:
//     process.env.OPENAI_API_KEY ||
//     "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",
// });
// const accountName = "aintrestblob";
// const containerName = "aintrestapp";
// if (!accountName) throw Error("Azure Storage accountName not found");

// const blobServiceClient = BlobServiceClient.fromConnectionString(
//   `DefaultEndpointsProtocol=https;AccountName=aintrestblob;AccountKey=r+yhSpSvOsh9lysH0oHsB30qtU60gOWovlOIo20gRcv52bK0nlysACWTFebuZsf9IVfkYT6pm+q0+AStUh4YRQ==;EndpointSuffix=core.windows.net`
// );

// const filePath = "./data/books/class-7-Social and Political Life.pdf";
// const subject = "Social and Political Life";

// async function main() {
//   console.log(`Welcome`);
//   // upload file to openai get fileID
//   const file = await openai.files.create({
//     file: fs.createReadStream(filePath),
//     purpose: "assistants",
//   });

//   // initiate azure container service to upload file
//   const containerClient = blobServiceClient.getContainerClient(containerName);

//   const blobName = `books/class7/${filePath
//     .replace(`./data/books/class-7-`, "")
//     .toLowerCase()}`;

//   const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//   const stream = fs.createReadStream(filePath);
//   // actually upload the file
//   const uploadResponse = await blockBlobClient.uploadStream(
//     stream,
//     undefined,
//     undefined,
//     {
//       blobHTTPHeaders: { blobContentType: "application/pdf" }, // Set the content type
//     }
//   );
//   const blobUrl = blockBlobClient.url;
//   console.log(
//     uploadResponse,
//     `Uploaded successfully. ETag: ${uploadResponse.eTag}`,
//     blobUrl
//   );

//   // create a assistant with the file
//   const assistant = await openai.beta.assistants.create({
//     name: `${subject} Teacher`,
//     instructions: `You are a Socratic ${subject} tutor. Use the following principles in responding to students:

//       - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.
//       - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.
//       - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.
//       - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.
//       - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.
//       - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.`,
//     model: "gpt-3.5-turbo-1106",
//     tools: [{ type: "code_interpreter" }, { type: "retrieval" }],
//     file_ids: [file.id],
//   });
//   console.log(assistant.id, "sa");
//   try {
//     const assistantDb = await prisma.assistant.create({
//       data: assistant,
//     });
//     let sa = await prisma.books.create({
//       data: {
//         name: filePath
//           .replace(`./data/books/class-7-`, "")
//           .toLowerCase()
//           .slice(0, -3),
//         subject: "English",
//         url: blobUrl,
//         fileId: file.id,
//         assistants: {
//           connect: { id: assistant.id }, // Connect to the previously created assistant
//         },
//       },
//     });

//     const relation = await prisma.bookFile.create({
//       data: {
//         assistantId: assistant.id,
//         bookId: file.id,
//       },
//     });
//     console.log(sa, "FILE UPLOADED ", assistantDb, relation);
//   } catch (error) {
//     console.log(error);
//   }
//   console.log(file);
//   console.log(blobUrl);
// }

// main();
