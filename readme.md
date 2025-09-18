# Vector Database Capstone Project

This repository contains the capstone project for the **Vector Database Course by IBM**. The project demonstrates how to build an AI-powered job recommendation system using **ChromaDB** and **Node.js**.

**Course Link:** [Vector Database Projects for AI Recommendation Systems](https://www.coursera.org/learn/vector-database-projects-ai-recommendation-systems)

---

## Project Overview

The goal of this project is to create a job recommendation system that uses vector embeddings to match job search queries with relevant job postings. The system is built using **ChromaDB**, **Node.js**, and other supporting libraries.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Docker**: For running the ChromaDB container.
- **Node.js**: To execute the JavaScript code.
- **npm**: For managing dependencies.

---

## Setup Instructions

Follow these steps to set up the environment and run the project:

### 1. Pull the ChromaDB Docker Image

Run the following command to pull and start the ChromaDB container:

```bash
docker run -v ./chroma-data:/data -p 8000:8000 chromadb/chroma
```

### 2. Install Required npm Packages

Navigate to the project directory and run the following command to install the necessary npm packages:

```bash
npm install dotenv prompt-sync chromadb@1.9.1 chromadb-default-embed @huggingface/inference pdf-parse
```

### 3. Run the Application

Execute the following command to run the job recommendation system:

```bash
node jobRecommendationSystem.js
```

---

## Usage

Upon running the application, you will be prompted to enter your job search query. The query should be keyword-separated with pipes (`|`). For example, to search for a Developer position in Boston for Full-Time, you would enter:

```
Developer|Boston|Full-Time
```

The system will process your query and provide results based on the vector embeddings of the job postings in the database.

---

## Sample Output

Here is an example of the output you can expect after entering a query:

```
Enter your job search query, keywords separated with pipes (|) [default: Developer|Boston|Full-Time]:
Query: Developer|Boston|Full-Time

word: Developer | result [
{ label: 'job title', score: 0.6140360236167908 },
{ label: 'employment status', score: 0.1906527876853943 },
{ label: 'company', score: 0.18404103815555573 },
{ label: 'location', score: 0.011270072311162949 }
]

word: Boston | result [
{ label: 'location', score: 0.7788639068603516 },
{ label: 'company', score: 0.18760760128498077 },
{ label: 'employment status', score: 0.02278338000178337 },
{ label: 'job title', score: 0.0107450932264328 }
]

word: Full-Time | result [
{ label: 'employment status', score: 0.7530896663665771 },
{ label: 'job title', score: 0.21910466253757477 },
{ label: 'company', score: 0.019910559058189392 },
{ label: 'location', score: 0.007895116694271564 }
]

Filter Criteria: {
location: 'Boston',
jobTitle: 'Developer',
company: null,
jobType: 'Full-Time'
}

Query results:
Top 1 jobTitle: Full Stack Developer 3, jobType: Full-Time, jobDescription: We need a Full Stack Developer experienced in both front-end and back-end development., Company: Innovative Solutions
Top 2 jobTitle: Full Stack Developer 1, jobType: Full-Time, jobDescription: We need a Full Stack Developer experienced in both front-end and back-end development., Company: Innovative Solutions
Top 3 jobTitle: Full Stack Developer 2, jobType: Full-Time, jobDescription: We need a Full Stack Developer experienced in both front-end and back-end development., Company: Innovative Solutions
```

---

## Acknowledgements

- **IBM**: For providing the course and resources to learn about vector databases and AI recommendation systems.
- **ChromaDB**: For the powerful vector database used in this project.
- **Node.js**: For the JavaScript runtime that allows the execution of code on the server-side.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
