import { useCallback, useEffect, useState } from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import DecisionNode from "./components/DecisionNode";
import { runWorkflow } from "./services/workflowService";

const nodeTypes = {
  decision: DecisionNode,
};

// =====================================================
// INITIAL NODES
// =====================================================

const initialNodes = [
  {
    id: "1",
    type: "decision",
    position: { x: 350, y: 100 },

    data: {
      id: "1",
      label: "Support Check",
      prompt: "Is this a support request?",
      testInput:
        "My application is not working and I need technical help.",
      decision: null,
    },
  },

  {
    id: "2",
    type: "decision",
    position: { x: 100, y: 350 },

    data: {
      id: "2",
      label: "Support Team",
      prompt: "Is technical support required?",
      testInput: "",
      decision: null,
    },
  },

  {
    id: "3",
    type: "decision",
    position: { x: 600, y: 350 },

    data: {
      id: "3",
      label: "Sales Team",
      prompt: "Is the user interested in buying a plan?",
      testInput: "",
      decision: null,
    },
  },
];

function App() {
  // ===================================================
  // STATE
  // ===================================================

  const [nodes, setNodes, onNodesChange] =
    useNodesState([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState([]);

  const [input, setInput] = useState(
    "My application is not working and I need technical help."
  );

  const [running, setRunning] = useState(false);

  const [executionLog, setExecutionLog] =
    useState([]);

  const [activeNode, setActiveNode] =
    useState(null);

  const [error, setError] = useState("");

  // ===================================================
  // LOAD WORKFLOW
  // ===================================================

  useEffect(() => {
    const savedWorkflow =
      localStorage.getItem("ai-decision-flow");

    if (savedWorkflow) {
      try {
        const workflow =
          JSON.parse(savedWorkflow);

        setNodes(
          workflow.nodes?.length
            ? workflow.nodes
            : initialNodes
        );

        setEdges(
          workflow.edges || []
        );
      } catch (err) {
        console.error(
          "Failed to load workflow:",
          err
        );

        setNodes(initialNodes);
        setEdges([]);
      }
    } else {
      setNodes(initialNodes);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  // ===================================================
  // SAVE WORKFLOW
  // ===================================================

  useEffect(() => {
    if (nodes.length === 0) {
      return;
    }

    const workflow = {
      nodes,
      edges,
    };

    localStorage.setItem(
      "ai-decision-flow",
      JSON.stringify(workflow)
    );
  }, [nodes, edges]);

  // ===================================================
  // UPDATE PROMPT
  // ===================================================

  const handlePromptChange = useCallback(
    (nodeId, prompt) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,

                data: {
                  ...node.data,
                  prompt,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  // ===================================================
  // UPDATE TEST INPUT
  // ===================================================

  const handleTestInputChange = useCallback(
    (nodeId, testInput) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,

                data: {
                  ...node.data,
                  testInput,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  // ===================================================
  // UPDATE DECISION RESULT
  // ===================================================

  const handleDecisionResult = useCallback(
    (nodeId, decision) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,

                data: {
                  ...node.data,
                  decision,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  // ===================================================
  // CONNECT NODES
  // ===================================================

  const onConnect = useCallback(
    (connection) => {
      const sourceHandle =
        connection.sourceHandle;

      let label = "";

      if (sourceHandle === "yes") {
        label = "YES";
      }

      if (sourceHandle === "no") {
        label = "NO";
      }

      const newEdge = {
        ...connection,

        id: `${connection.source}-${sourceHandle}-${connection.target}`,

        label,

        type: "smoothstep",

        animated: false,

        markerEnd: {
          type: MarkerType.ArrowClosed,
        },

        style: {
          strokeWidth: 2,
        },

        labelStyle: {
          fontWeight: 700,
        },
      };

      setEdges((currentEdges) =>
        addEdge(
          newEdge,
          currentEdges
        )
      );
    },
    [setEdges]
  );

  // ===================================================
  // ADD DECISION NODE
  // ===================================================

  const addDecisionNode = () => {
    const id = String(Date.now());

    const newNode = {
      id,

      type: "decision",

      position: {
        x: 300 + Math.random() * 400,
        y: 150 + Math.random() * 300,
      },

      data: {
        id,

        label: `Decision ${nodes.length + 1}`,

        prompt:
          "Enter your decision question",

        testInput: "",

        decision: null,

        onPromptChange:
          handlePromptChange,

        onTestInputChange:
          handleTestInputChange,

        onDecisionResult:
          handleDecisionResult,
      },
    };

    setNodes((currentNodes) => [
      ...currentNodes,
      newNode,
    ]);
  };

  // ===================================================
  // DELETE SELECTED NODES
  // ===================================================

  const deleteSelectedNodes = () => {
    const selectedIds = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);

    if (selectedIds.length === 0) {
      return;
    }

    setNodes((currentNodes) =>
      currentNodes.filter(
        (node) =>
          !selectedIds.includes(node.id)
      )
    );

    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) =>
          !selectedIds.includes(edge.source) &&
          !selectedIds.includes(edge.target)
      )
    );

    setExecutionLog([]);

    setActiveNode(null);
  };

  // ===================================================
  // CLEAR WORKFLOW
  // ===================================================

  const clearWorkflow = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear the workflow?"
    );

    if (!confirmed) {
      return;
    }

    setNodes([]);

    setEdges([]);

    setExecutionLog([]);

    setActiveNode(null);

    setError("");

    localStorage.removeItem(
      "ai-decision-flow"
    );
  };

  // ===================================================
  // RUN WORKFLOW
  // ===================================================

  const handleRunWorkflow = async () => {
    if (!input.trim()) {
      setError(
        "Please enter an input."
      );

      return;
    }

    if (nodes.length === 0) {
      setError(
        "Please add at least one decision node."
      );

      return;
    }

    setRunning(true);

    setError("");

    setExecutionLog([]);

    setActiveNode(null);

    try {
      const data = await runWorkflow({
        nodes,
        edges,
        input,
      });

      console.log(
        "Workflow response:",
        data
      );

      // ---------------------------------------------
      // Save execution log
      // ---------------------------------------------

      if (data.executionLog) {
        setExecutionLog(
          data.executionLog
        );

        if (
          data.executionLog.length > 0
        ) {
          const lastNode =
            data.executionLog[
              data.executionLog.length - 1
            ];

          setActiveNode(
            lastNode.nodeId
          );
        }
      }

      // ---------------------------------------------
      // If backend returns a single decision
      // ---------------------------------------------

      if (
        data.decision &&
        data.nodeId
      ) {
        handleDecisionResult(
          data.nodeId,
          data.decision
        );

        setActiveNode(
          data.nodeId
        );
      }
    } catch (err) {
      console.error(
        "Workflow execution failed:",
        err
      );

      setError(
        err.message ||
          "Workflow execution failed."
      );
    } finally {
      setRunning(false);
    }
  };

  // ===================================================
  // EXPORT WORKFLOW
  // ===================================================

  const exportWorkflow = () => {
    const workflow = {
      nodes,
      edges,
    };

    const blob = new Blob(
      [
        JSON.stringify(
          workflow,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "ai-decision-workflow.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ===================================================
  // IMPORT WORKFLOW
  // ===================================================

  const importWorkflow = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const workflow =
          JSON.parse(
            reader.result
          );

        if (
          !Array.isArray(
            workflow.nodes
          )
        ) {
          throw new Error(
            "Invalid nodes"
          );
        }

        setNodes(
          workflow.nodes
        );

        setEdges(
          workflow.edges || []
        );

        setExecutionLog([]);

        setActiveNode(null);

        setError("");

        // Save imported workflow
        localStorage.setItem(
          "ai-decision-flow",
          JSON.stringify({
            nodes:
              workflow.nodes,
            edges:
              workflow.edges || [],
          })
        );
      } catch (err) {
        console.error(err);

        setError(
          "Invalid workflow JSON file."
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="h-screen w-screen bg-slate-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">

        <div>
          <h1 className="text-xl font-bold">
            AI Decision Flow
          </h1>

          <p className="text-xs text-slate-500">
            React Flow + Inngest + AI
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={addDecisionNode}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Add Decision
          </button>

          <button
            onClick={
              deleteSelectedNodes
            }
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Delete
          </button>

          <button
            onClick={clearWorkflow}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Clear
          </button>

          <button
            onClick={exportWorkflow}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Export
          </button>

          <label className="cursor-pointer rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Import

            <input
              type="file"
              accept=".json"
              onChange={
                importWorkflow
              }
              className="hidden"
            />
          </label>

        </div>
      </header>

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="flex h-[calc(100vh-4rem)]">

        {/* =================================================
            FLOW CANVAS
        ================================================= */}

        <div className="flex-1">

          <ReactFlow
            nodes={nodes.map(
              (node) => ({
                ...node,

                className:
                  node.id === activeNode
                    ? "active-node"
                    : "",
              })
            )}

            edges={edges.map(
              (edge) => ({
                ...edge,

                animated:
                  executionLog.some(
                    (log) =>
                      log.nodeId ===
                      edge.source
                  ),
              })
            )}

            onNodesChange={
              onNodesChange
            }

            onEdgesChange={
              onEdgesChange
            }

            onConnect={onConnect}

            nodeTypes={nodeTypes}

            fitView

            deleteKeyCode={[
              "Backspace",
              "Delete",
            ]}
          >

            <Background />

            <Controls />

            <MiniMap />

          </ReactFlow>

        </div>

        {/* =================================================
            SIDE PANEL
        ================================================= */}

        <aside className="w-80 overflow-y-auto border-l bg-white p-5">

          <h2 className="text-lg font-bold">
            Workflow Runner
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter input and execute your
            AI decision workflow.
          </p>

          {/* ---------------------------------------------
              INPUT
          --------------------------------------------- */}

          <textarea
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder="Enter user input..."
            className="mt-4 min-h-28 w-full resize-none rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />

          {/* ---------------------------------------------
              RUN BUTTON
          --------------------------------------------- */}

          <button
            onClick={
              handleRunWorkflow
            }
            disabled={running}
            className="mt-3 w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running
              ? "Running Workflow..."
              : "▶ Run Workflow"}
          </button>

          {/* ---------------------------------------------
              ERROR
          --------------------------------------------- */}

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ---------------------------------------------
              EXECUTION LOG
          --------------------------------------------- */}

          <div className="mt-6">

            <h3 className="font-semibold">
              Execution Logs
            </h3>

            {executionLog.length ===
            0 ? (
              <p className="mt-3 text-sm text-slate-400">
                No execution yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">

                {executionLog.map(
                  (log, index) => (
                    <div
                      key={`${log.nodeId}-${index}`}
                      className="rounded-lg border p-3"
                    >

                      <div className="flex items-center justify-between">

                        <span className="font-semibold">
                          {index + 1}.{" "}
                          {log.nodeLabel ||
                            log.nodeId}
                        </span>

                        <span
                          className={
                            log.decision ===
                            "YES"
                              ? "font-bold text-green-600"
                              : "font-bold text-red-600"
                          }
                        >
                          {log.decision}
                        </span>

                      </div>

                      {log.prompt && (
                        <p className="mt-2 text-xs text-slate-500">
                          {log.prompt}
                        </p>
                      )}

                      {log.input && (
                        <p className="mt-2 text-xs text-slate-400">
                          Input:{" "}
                          {log.input}
                        </p>
                      )}

                      {(log.timestamp ||
                        log.time) && (
                        <p className="mt-2 text-xs text-slate-400">
                          {log.timestamp ||
                            log.time}
                        </p>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </aside>

      </div>

    </div>
  );
}

export default App;