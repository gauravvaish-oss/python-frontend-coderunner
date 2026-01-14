"use client";

import { FormEvent, useEffect, useState } from "react";

type Step = {
  line_no: number;
  locals: Record<string, string>;
};

type Toast = {
  type: "error" | "success";
  message: string;
};

export default function Home() {
  const [code, setCode] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [output, setOutput] = useState("");
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);

  const [explanation, setExplanation] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);

  // 🔔 Toast
  const [toast, setToast] = useState<Toast | null>(null);

  // ▶ AUTO FLOW
  useEffect(() => {
    if (!autoPlay || steps.length === 0) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [autoPlay, steps.length]);

  // 🔔 Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCodeLines(code.split("\n"));

    const res = await fetch("/api/send-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    console.log("FASTAPI RESPONSE:", data);

    // ❌ Compile error (Indentation / Syntax)
    if (data.status === "compile_error") {
      setSteps([]);
      setOutput("");
      setCurrentStep(0);

      setToast({
        type: "error",
        message: `${data.error_type} on line ${data.line_no}\n${data.message}`,
      });
      return;
    }

    // ❌ Runtime error
    if (data.status === "runtime_error") {
      setSteps(data.steps || []);
      setOutput("");

      setToast({
        type: "error",
        message: `Runtime Error\n${data.message}`,
      });
      return;
    }

    // ✅ Success
    setSteps(data.steps || []);
    setOutput(data.output || "");
    setCurrentStep(0);

    setToast({
      type: "success",
      message: "Code executed successfully",
    });
  }

  async function fetchExplanation() {
    setLoadingExplain(true);
    setExplanation("");

    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        step: steps[currentStep] || null,
      }),
    });

    const data = await res.json();
    setExplanation(data.explanation || "No explanation received.");
    setLoadingExplain(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#050b1f] to-black text-gray-100 p-6 font-mono">
      
      {/* 🔥 HEADER */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl tracking-widest font-bold text-cyan-400 drop-shadow-[0_0_15px_#22d3ee]">
          PYTHON FLOW ENGINE
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          execute · visualize · understand
        </p>
      </header>

      <div className="max-w-[1600px] mx-auto grid grid-cols-3 gap-6">

        {/* 📘 CODE INPUT */}
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/5 border border-purple-500/30 rounded-2xl shadow-[0_0_40px_#7c3aed22] flex flex-col"
        >
          <div className="px-4 py-3 border-b border-purple-500/30 text-purple-400 tracking-widest">
            📘 CODE CORE
          </div>

          <textarea
            className="flex-1 bg-transparent p-4 text-sm text-green-400 outline-none resize-none caret-cyan-400"
            placeholder="# Write Python code..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button className="m-3 bg-purple-600 hover:bg-purple-700 transition-all rounded-xl py-2 font-semibold shadow-[0_0_20px_#7c3aed88]">
            ▶ Execute
          </button>
        </form>

        {/* 🔍 CODE FLOW */}
        <div className="backdrop-blur-xl bg-white/5 border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_#22d3ee22] flex flex-col">
          <div className="px-4 py-3 border-b border-cyan-500/30 text-cyan-400 tracking-widest">
            🔍 EXECUTION FLOW
          </div>

          <div className="flex-1 overflow-auto text-sm">
            {codeLines.map((line, i) => {
              const active = steps[currentStep]?.line_no === i + 1;
              return (
                <div
                  key={i}
                  className={`flex px-4 py-1 transition-all ${
                    active
                      ? "bg-cyan-900/40 border-l-4 border-cyan-400 animate-pulse"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className="w-8 text-right mr-3 text-gray-500">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre-wrap">{line || " "}</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 flex justify-between border-t border-cyan-500/30">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                className="px-4 py-1 rounded-lg border border-cyan-500/50 hover:bg-cyan-900/30"
              >
                ◀ Step
              </button>
              <button
                onClick={() =>
                  setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
                }
                className="px-4 py-1 rounded-lg border border-cyan-500/50 hover:bg-cyan-900/30"
              >
                Step ▶
              </button>
            </div>
            <span className="text-xs text-cyan-400">
              Frame {currentStep + 1}/{steps.length || 1}
            </span>
          </div>

          <div className="grid grid-cols-2 border-t border-cyan-500/30">
            <pre className="p-3 text-xs text-green-400 overflow-auto max-h-40 whitespace-pre-wrap">
{JSON.stringify(steps[currentStep]?.locals || {}, null, 2)}
            </pre>
            <pre className="p-3 text-xs text-yellow-400 overflow-auto max-h-40 whitespace-pre-wrap">
{output || "⟂ No output produced"}
            </pre>
          </div>
        </div>

        {/* 🧠 AI EXPLANATION */}
        <div className="backdrop-blur-xl bg-white/5 border border-green-500/30 rounded-2xl shadow-[0_0_40px_#22c55e22] flex flex-col">
          <div className="px-4 py-3 border-b border-green-500/30 text-green-400 tracking-widest">
            🧠 AI ANALYSIS
          </div>

          <div className="flex-1 p-4 text-sm overflow-auto leading-relaxed">
            {loadingExplain ? (
              <span className="text-green-400 animate-pulse">
                Gemini is thinking...
              </span>
            ) : (
              <pre className="whitespace-pre-wrap text-green-300">
                {explanation || "Click explain to understand the code execution."}
              </pre>
            )}
          </div>

          <button
            onClick={fetchExplanation}
            className="m-3 bg-green-600 hover:bg-green-700 transition-all rounded-xl py-2 font-semibold shadow-[0_0_20px_#22c55e88]"
          >
            ✨ Explain with AI
          </button>
        </div>
      </div>

      {/* 🔔 TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-xl
            ${
              toast.type === "error"
                ? "bg-red-900/80 border-red-500 text-red-200 shadow-red-500/40"
                : "bg-green-900/80 border-green-500 text-green-200 shadow-green-500/40"
            }`}
          >
            <pre className="text-sm whitespace-pre-wrap">
              {toast.message}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
