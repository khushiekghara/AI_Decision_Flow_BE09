import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useCallback, useState } from "react";

import DecisionNode from "./DecisionNode";

const nodeTypes = {
  decision: DecisionNode,
};

const initialNodes = [
  {
    id: "1",
    type: "decision",
    position: {
      x: 300,
      y: 100,
    },
    data: {
      label: "Decision 1",
      prompt: "Is this a support request?",
    },
  },
];

const initialEdges = [];

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  const [logs, setLogs] = useState([]);

  const [running, setRunning] = useState(false);

  const [workflowInput, setWorkflowInput] = useState(
    "My application is not working and I need technical help."
  );

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const addDecisionNode = () => {
    const id = String(nodes.length + 1);

    const newNode = {
      id,
      type: "decision",
      position: {
        x: 150 + nodes.length * 50,
        y: 350,
      },
      data: {
        label: `Decision ${id}`,
        prompt: "Enter your decision question?",
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const runWorkflow = async () => {
    setRunning(true);
    setLogs([]);

    try {
      const response = await fetch(
        "http://localhost:5000/api/decision",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt:
              nodes[0]?.data?.prompt ||
              "Is this a support request?",
            input: workflowInput,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setLogs([
        {
          node: nodes[0]?.data?.label || "Decision 1",
          decision: result.decision,
          input: workflowInput,
        },
      ]);
    } catch (error) {
      setLogs([
        {
          node: "Error",
          decision: "ERROR",
          input: error.message,
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  const exportWorkflow = () => {
    const workflow = {
      nodes,
      edges,
    };

    const blob = new Blob(
      [JSON.stringify(workflow, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "ai-decision-workflow.json";

    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      {/* Header */}

      <div className="flex items-center justify-between border-b bg-white p-4">
        <div>
          <h1 className="text-xl font-bold">
            AI Decision Flow
          </h1>

          <p className="text-xs text-gray-500">
            React Flow + Inngest + AI
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={addDecisionNode}
            className="rounded-md border bg-white px-4 py-2 text-sm font-semibold"
          >
            + Add Decision
          </button>

          <button
            onClick={runWorkflow}
            disabled={running}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            {running ? "Running..." : "▶ Run Workflow"}
          </button>

          <button
            onClick={exportWorkflow}
            className="rounded-md border bg-white px-4 py-2 text-sm font-semibold"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Input */}

      <div className="flex items-center gap-3 border-b bg-white p-3">
        <label className="text-sm font-semibold">
          Workflow Input:
        </label>

        <input
          value={workflowInput}
          onChange={(e) =>
            setWorkflowInput(e.target.value)
          }
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {/* Main */}

      <div className="flex min-h-0 flex-1">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Logs */}

        <div className="w-80 overflow-y-auto border-l bg-white p-4">
          <h2 className="mb-3 text-lg font-bold">
            Execution Logs
          </h2>

          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">
              No execution yet.
            </p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className="mb-3 rounded-lg border p-3"
              >
                <p className="text-sm font-semibold">
                  {log.node}
                </p>

                <p
                  className={`mt-1 font-bold ${
                    log.decision === "YES"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {log.decision}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {log.input}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FlowEditor;