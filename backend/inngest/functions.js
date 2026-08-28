import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-decision-flow",
});

// Store workflow execution status for our local demo
const workflowRuns = new Map();

export const getWorkflowRun = (runId) => {
  return workflowRuns.get(runId);
};

const makeDecision = (prompt, input) => {
  const text = input.toLowerCase();
  const question = prompt.toLowerCase();

  // Support-related decision
  if (
    question.includes("support") ||
    question.includes("technical") ||
    question.includes("help")
  ) {
    const supportWords = [
      "help",
      "problem",
      "issue",
      "error",
      "support",
      "technical",
      "not working",
      "broken",
      "bug",
      "unable",
      "failed",
    ];

    return supportWords.some((word) => text.includes(word))
      ? "YES"
      : "NO";
  }

  // Sales / buying-related decision
  if (
    question.includes("sales") ||
    question.includes("buy") ||
    question.includes("purchase") ||
    question.includes("premium")
  ) {
    const salesWords = [
      "buy",
      "purchase",
      "price",
      "pricing",
      "premium",
      "plan",
      "subscription",
      "upgrade",
    ];

    return salesWords.some((word) => text.includes(word))
      ? "YES"
      : "NO";
  }

  // Generic decision
  const positiveWords = [
    "yes",
    "help",
    "support",
    "problem",
    "issue",
    "error",
    "buy",
    "purchase",
    "price",
    "premium",
    "upgrade",
  ];

  return positiveWords.some((word) => text.includes(word))
    ? "YES"
    : "NO";
};

export const decisionWorkflow = inngest.createFunction(
  {
    id: "ai-decision-workflow",
    triggers: {
      event: "workflow/run",
    },
  },

  async ({ event, step }) => {
    const {
      nodes = [],
      edges = [],
      input,
      runId,
      startNodeId,
    } = event.data;

    const logs = [];

    let currentNodeId =
      startNodeId || nodes[0]?.id;

    let currentInput = input;

    logs.push({
      type: "START",
      message: "Workflow started",
      timestamp: new Date().toISOString(),
    });

    while (currentNodeId) {
      const node = nodes.find(
        (item) => item.id === currentNodeId
      );

      if (!node) {
        logs.push({
          type: "ERROR",
          message: `Node ${currentNodeId} not found`,
          timestamp: new Date().toISOString(),
        });

        break;
      }

      const prompt =
        node.data?.prompt ||
        "Is this a support request?";

      const decision = await step.run(
        `decision-${node.id}`,
        async () => {
          return makeDecision(
            prompt,
            currentInput
          );
        }
      );

      logs.push({
        type: "DECISION",
        nodeId: node.id,
        node: node.data?.label || `Decision ${node.id}`,
        prompt,
        input: currentInput,
        decision,
        timestamp: new Date().toISOString(),
      });

      // Find the YES/NO edge
      const nextEdge = edges.find(
        (edge) =>
          edge.source === node.id &&
          (
            edge.sourceHandle ===
              decision.toLowerCase() ||
            edge.label?.toUpperCase() === decision
          )
      );

      if (!nextEdge) {
        logs.push({
          type: "END",
          message: `Workflow finished with ${decision}`,
          timestamp: new Date().toISOString(),
        });

        break;
      }

      currentNodeId = nextEdge.target;
    }

    const result = {
      runId,
      status: "completed",
      logs,
      finalDecision:
        logs
          .filter((log) => log.type === "DECISION")
          .at(-1)?.decision || "NO",
    };

    workflowRuns.set(runId, result);

    return result;
  }
);