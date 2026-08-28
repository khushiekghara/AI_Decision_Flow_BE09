const API_URL = "http://localhost:5000";

export async function runWorkflow({
  nodes,
  edges,
  input,
}) {
  const response = await fetch(
    `${API_URL}/api/workflow/run`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        nodes,
        edges,
        input,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to start workflow"
    );
  }

  return data;
}

export async function getWorkflowStatus(
  runId
) {
  const response = await fetch(
    `${API_URL}/api/workflow/status/${runId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to get workflow status"
    );
  }

  return data;
}