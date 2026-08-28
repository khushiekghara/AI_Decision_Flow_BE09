import {
  Handle,
  Position,
} from "@xyflow/react";

function DecisionNode({ id, data }) {
  return (
    <div className="w-[280px] rounded-xl border bg-white p-4 shadow-lg">

      <Handle
        type="target"
        position={Position.Top}
      />

      <h3 className="text-lg font-bold">
        {data.label}
      </h3>

      <p className="mb-3 text-xs text-slate-500">
        AI Decision
      </p>

      <label className="text-xs font-semibold">
        Decision Prompt
      </label>

      <textarea
        value={data.prompt || ""}
        onChange={(e) =>
          data.onPromptChange?.(
            id,
            e.target.value
          )
        }
        placeholder="Enter your decision prompt..."
        className="mt-1 w-full rounded-md border p-2 text-sm"
        rows={3}
      />

      <label className="mt-3 block text-xs font-semibold">
        Test Input
      </label>

      <textarea
        value={data.testInput || ""}
        onChange={(e) =>
          data.onTestInputChange?.(
            id,
            e.target.value
          )
        }
        placeholder="Enter text to test..."
        className="mt-1 w-full rounded-md border p-2 text-sm"
        rows={2}
      />

      <button
        onClick={() =>
          data.onTestDecision?.(id)
        }
        className="mt-3 w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white"
      >
        Test Decision
      </button>

      {data.result && (
        <div className="mt-2 rounded-md bg-green-50 p-2 text-center text-sm font-bold text-green-600">
          Decision: {data.result}
        </div>
      )}

      {data.error && (
        <div className="mt-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          {data.error}
        </div>
      )}

      <div className="mt-4 flex justify-between text-xs font-bold">

        <span className="text-green-600">
          YES
        </span>

        <span className="text-red-600">
          NO
        </span>

      </div>

      <Handle
        id="yes"
        type="source"
        position={Position.Bottom}
        style={{
          left: "25%",
          background: "#16a34a",
        }}
      />

      <Handle
        id="no"
        type="source"
        position={Position.Bottom}
        style={{
          left: "75%",
          background: "#ef4444",
        }}
      />

    </div>
  );
}

export default DecisionNode;