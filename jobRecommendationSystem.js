require('dotenv').config();

const { ChromaClient } = require("chromadb");
const client = new ChromaClient();
const prompt = require('prompt-sync')();

// Sample job postings data
const jobPostings = require('./jobPostings.js');
const collectionName = "job_collection";

const { InferenceClient } = require("@huggingface/inference");
// Initialize Hugging Face Inference with API key from environment variable
if (!process.env.HF_API_KEY) {
    throw new Error("Missing Hugging Face API key. Please set HF_API_KEY in your environment.");
}
const hf = new InferenceClient(process.env.HF_API_KEY);

// Function to generate embeddings for an array of texts
async function generateEmbeddings(texts) {
    const results = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: texts,
    });
    return results;
}

// Function to classify text into given labels using zero-shot classification
async function classifyText(text, labels) {
    const response = await hf.zeroShotClassification({
        model: "facebook/bart-large-mnli",
        inputs: text,
        parameters: { candidate_labels: labels },
    });
    return response;
}

// Function to extract filter criteria from user query
async function extractFilterCriteria (query) {
    const criteria = { location: null, jobTitle: null, company: null, jobType: null };
    const labels = ["location", "job title", "company", "employment status"];
    const words = query.split("|");
    
    for (const word of words) {
        const result = await classifyText(word, labels);
        console.log('word:', word, '| result', result);
        const highestScoreLabel = result[0].label;
        const score = result[0].score;
 
        if (score > 0.5) {
            switch (highestScoreLabel) {
                case "location":
                    criteria.location = word;
                    break;
                case "job title":
                    criteria.jobTitle = word;
                    break;
                case "company":
                    criteria.company = word;
                    break;
                case "employment status":
                    criteria.jobType = word;
                    break;
                default:
                    break;
            }
        }
    }
    return criteria
}

// Function to perform similarity search
async function performSimilaritySearch(collection, queryTerm) {
    try {
        const queryEmbedding = await generateEmbeddings([queryTerm]);

        const results = await collection.query({
            collection: collectionName,
            queryEmbeddings: queryEmbedding,
            n: 3,
        });

        if (!results || results.length === 0) {
            console.log(`No items found similar to "${queryTerm}"`);
            return [];
        }

        let topJobPostings = results.ids[0].map((id, index) => {
            const job = jobPostings.find(job => job.jobId.toString() === id);
            return {
                id,
                score: results.distances[0][index],
                ...job,
            };
        }).filter(Boolean);

        return topJobPostings.sort((a, b) => a.score - b.score);
    } catch (error) {
        console.error("Error during similarity search:", error);
        return [];
    }
}

// Function to prompt user for input
async function promptUserInput(promptText) {
    return new Promise((resolve) => 
        resolve(prompt(promptText) || "Developer|Boston|Full-Time")) // Default value if no input
}
    
async function main() {
    const query = await promptUserInput("Enter your job search query, keywords separated with pipes (|) [default: Developer|Boston|Full-Time]: ");
    console.log('Query:', query)

    try {
        const collection = await client.getOrCreateCollection({ name: collectionName });
        const uniqueIds = new Set();

        jobPostings.forEach((job, index) => {
            while (uniqueIds.has(job.jobId.toString())) {
                job.jobId = `${job.jobId}_${index}`;
            }
            uniqueIds.add(job.jobId.toString());
        });

        const jobTexts = jobPostings.map((job) => `jobTitle: ${job.jobTitle}. jobDescription: ${job.jobDescription}. jobType: ${job.jobType}. jobLocation: ${job.location}`);
        const embeddingsData = await generateEmbeddings(jobTexts);

        await collection.add({
            ids: jobPostings.map((job) => job.jobId.toString()),
            documents: jobTexts,
            embeddings: embeddingsData,
        });

        const filterCriteria = await extractFilterCriteria(query);
        console.log('Filter Criteria:', filterCriteria);

        const initialResults = await performSimilaritySearch(collection, query, filterCriteria);

        console.log('Query results:')
        initialResults.slice(0, 3).forEach(({jobTitle, jobDescription, jobType, location ,company}, index) => {
            console.log(`Top ${index + 1} jobTitle: ${jobTitle}, jobType: ${jobType}, jobDescription: ${jobDescription}, location: ${location}, Company: ${company}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

main();