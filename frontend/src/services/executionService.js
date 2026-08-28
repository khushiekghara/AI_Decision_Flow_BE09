const API_URL = "http://localhost:5000";

export async function testDecision({
  prompt,
  input,
}) {
  const response = await fetch(
    `${API_URL}/api/decision`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        prompt,
        input,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Decision failed"
    );
  }

  return data;
}