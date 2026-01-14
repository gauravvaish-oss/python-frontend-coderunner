"use client";

import { FormEvent, useEffect, useState } from "react";

type Step = {
  line_no: number;
  locals: Record<string, string>;
};

export default function Home() {
  const [code, setCode] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [output, setOutput] = useState("");
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);

  // ▶ FLOW MODE (AUTO PLAY)
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
  }, 800);

  return () => clearInterval(timer);
}, [autoPlay, steps.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCodeLines(code.split("\n"));

    try {
      const res = await fetch("/api/send-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setSteps(data.steps || []);
      setCurrentStep(0);
      setOutput(data.output || "");
      setAutoPlay(false);
    } catch {
      setOutput("Error sending data");
    }
  }

  function handleClear() {
    setCode("");
    setCodeLines([]);
    setSteps([]);
    setCurrentStep(0);
    setOutput("");
    setAutoPlay(false);
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-6">
      <header className="sticky top-0 z-50 mb-6 backdrop-blur-md bg-black/60 border-b border-cyan-500/20">
  <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center">
    <h1 className="text-lg md:text-xl font-mono tracking-widest text-cyan-300">
      thegvdev.xyz
      <span className="text-gray-400 mx-2">—</span>
      <span className="text-purple-400">python code runner</span>
    </h1>
  </div>
</header>
      <div className="custom-scrollbar max-w-8xl mx-auto grid grid-cols-2 gap-6">

        {/* 📘 CODE SCROLL */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-950 border border-purple-500/30 rounded-xl shadow-[0_0_20px_#7c3aed33] flex flex-col"
        >
          <div className="px-4 py-2 border-b border-purple-500/30 text-purple-400 font-bold tracking-widest">
            📘 CODE SCROLL
          </div>

          <textarea
            className="flex-1 bg-black font-mono text-sm p-4 outline-none resize-none text-green-400 caret-cyan-400 w-full overflow-auto"
            placeholder="# Write your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <div className="p-3 border-t border-purple-500/30 flex justify-between gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="border border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-900/30"
            >
              Clear
            </button>

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg font-semibold"
            >
              ▶ Execute
            </button>
          </div>
        </form>

        {/* 🔍 CODE FLOW */}
        <div className="bg-gray-950 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_#06b6d433] flex flex-col">

          <div className="px-4 py-2 border-b border-cyan-500/30 text-cyan-400 font-bold tracking-widest">
            🔍 CODE FLOW
          </div>

          {/* CODE VIEW */}
          <div className="flex-1 overflow-auto font-mono text-sm overflow-auto min-h-full">
            {codeLines.map((line, index) => {
              const active = steps[currentStep]?.line_no === index + 1;

              return (
                <div
                  key={index}
                  className={`flex px-4 py-1 transition-all duration-300 ${
                    active
                      ? "bg-cyan-900/40 border-l-4 border-cyan-400 active-line"
                      : ""
                  }`}
                >
                  <span className="w-8 text-right text-gray-500 mr-3">
                    {index + 1}
                  </span>
                  <span className="whitespace-pre-wrap">
                    {line || " "}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CONTROLS */}
          <div className="border-t border-cyan-500/30 p-2 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                type="button"
                className="border border-cyan-500/50 px-4 py-1 rounded hover:bg-cyan-900/30"
                onClick={() =>
                  setCurrentStep((s) => Math.max(0, s - 1))
                }
              >
                ◀ Step
              </button>

              <button
                type="button"
                className="border border-cyan-500/50 px-4 py-1 rounded hover:bg-cyan-900/30"
                onClick={() =>
                  setCurrentStep((s) =>
                    Math.min(steps.length - 1, s + 1)
                  )
                }
              >
                Step ▶
              </button>

              <button
                type="button"
                className={`px-4 py-1 rounded border ${
                  autoPlay
                    ? "border-purple-400 bg-purple-900/40 text-purple-300"
                    : "border-purple-500/50 hover:bg-purple-900/30"
                }`}
                onClick={() => {
                  if (!autoPlay && currentStep >= steps.length - 1) {
                    setCurrentStep(0); // 🔥 reset if finished
                  }
                  setAutoPlay((v) => !v);
                }}
              >
                {autoPlay ? "⏸ Flow" : "▶ Flow"}
              </button>
            </div>
            <span className="text-xs text-cyan-400">
              Frame {currentStep + 1}/{steps.length || 1}
            </span>
          </div>

          {/* STATS + OUTPUT */}
          <div className="grid grid-cols-2 border-t border-cyan-500/30">
            <div className="p-3 border-r border-cyan-500/30">
              <div className="text-xs font-bold text-cyan-300 mb-1">
                🧠 STATS
              </div>
              <pre className="bg-black p-2 rounded text-xs text-green-400 max-h-40 overflow-auto">
                {JSON.stringify(
                  steps[currentStep]?.locals || {},
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="p-3">
              <div className="text-xs font-bold text-cyan-300 mb-1">
                📜 OUTPUT
              </div>
              <pre className="bg-black p-2 rounded text-xs text-yellow-400 max-h-40 overflow-auto">
                {output}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
