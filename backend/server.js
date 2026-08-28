import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { serve } from "inngest/express";

import {
  inngest,
  decisionWorkflow,
  getWorkflowRun,
} from "./inngest/functions.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// INNGEST ENDPOINT
// ========================================

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [decisionWorkflow],
  })
);

// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "AI Decision Flow Backend is running",
  });
});

// ========================================
// DIRECT DECISION API
// ========================================

app.post("/api/decision", async (req, res) => {
  try {
    const { input, prompt } = req.body;

    if (!input || !prompt) {
      return res.status(400).json({
        error: "input and prompt are required",
      });
    }

    const text = input.toLowerCase();

    let decision = "NO";

    if (
      text.includes("help") ||
      text.includes("problem") ||
      text.includes("issue") ||
      text.includes("error") ||
      text.includes("support") ||
      text.includes("technical") ||
      text.includes("not working") ||
      text.includes("buy") ||
      text.includes("purchase") ||
      text.includes("premium") ||
      text.includes("price")
    ) {
      decision = "YES";
    }

    console.log("--------------------------------");
    console.log("Decision Prompt:", prompt);
    console.log("User Input:", input);
    console.log("Decision:", decision);
    console.log("--------------------------------");

    res.json({
      success: true,
      decision,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Decision failed",
    });
  }
});

// ========================================
// START WORKFLOW
// ========================================

app.post("/api/workflow/run", async (req, res) => {
  try {
    const {
      nodes,
      edges,
      input,
    } = req.body;

    if (!nodes || nodes.length === 0) {
      return res.status(400).json({
        error: "No workflow nodes found",
      });
    }

    if (!input) {
      return res.status(400).json({
        error: "Input is required",
      });
    }

    const runId =
      `run_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    // Create initial status
    const event = await inngest.send({
      name: "workflow/run",

      data: {
        nodes,
        edges,
        input,
        runId,
        startNodeId: nodes[0].id,
      },
    });

    console.log("Workflow started:", runId);

    res.json({
      success: true,
      message: "Workflow started",
      runId,
      eventId: event.ids?.[0] || null,
    });
  } catch (error) {
    console.error("Workflow error:", error);

    res.status(500).json({
      error: "Failed to start workflow",
    });
  }
});

// ========================================
// WORKFLOW STATUS
// ========================================

app.get(
  "/api/workflow/status/:runId",
  (req, res) => {
    const { runId } = req.params;

    const result = getWorkflowRun(runId);

    if (!result) {
      return res.json({
        success: true,
        status: "running",
        logs: [],
      });
    }

    res.json({
      success: true,
      ...result,
    });
  }
);

// ========================================
// SERVER
// ========================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});