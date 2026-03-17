"use client";

import { useState, useRef } from "react";

const TARGET_STRING = "H3ll0_W0rld! Th1s 1s @_bl1nd_c0d3_ch@ll3ng3. G00d_luck_c0d3r. #N3ur0n&Z1gb33";

export default function BlindCodeGame() {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lineCount, setLineCount] = useState(10);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    setSubmitted(false);
    const lines = val.split("\n").length;
    setLineCount(Math.max(10, lines + 2));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const s = ta.selectionStart;
      const newVal = code.substring(0, s) + "    " + code.substring(ta.selectionEnd);
      setCode(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 4; }, 0);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="font-mono rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d] flex flex-col h-full flex-1">

      {/* Terminal bar */}
      <div className="bg-[#151515] border-b border-[#2a2a2a] px-4 py-2.5 flex items-center gap-2 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        <span className="text-[11px] text-gray-600 ml-2">blind_code_terminal</span>
        <span className="ml-auto text-[10px] text-[#00ff8866]">● LIVE</span>
      </div>

      {/* Target string */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex flex-col gap-2 shrink-0">
        <span className="text-[12px] tracking-widest text-gray-300 uppercase">target output — print this exact string</span>
        <div className="bg-[#111] border border-[#1f1f1f] border-l-2 border-l-[#00ff88] rounded-r-md px-4 py-3 text-[#00ff88] text-sm tracking-wide break-all leading-relaxed">
          {TARGET_STRING}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Editor bar */}
        <div className="bg-[#151515] border-b border-[#2a2a2a] px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] tracking-widest text-gray-400 uppercase">editor</span>
            <span className="text-[10px] text-gray-500">Main.java</span>
          </div>
          <span className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-0.5 text-[10px] text-[#555]">Java</span>
        </div>

        {/* Code area */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Line numbers */}
          <div className="w-9 bg-[#0d0d0d] border-r border-[#1a1a1a] py-4 flex flex-col shrink-0 overflow-hidden">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-[11px] text-[#2a2a2a] text-right pr-2 leading-[21px]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder={`// write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        // your code\n    }\n}`}
            className="flex-1 bg-transparent text-[#e0e0e0] text-[13px] leading-[21px] p-4 outline-none resize-none placeholder:text-[#2a2a2a] caret-[#00ff88]"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#151515] border-t border-[#2a2a2a] px-4 py-2.5 flex items-center shrink-0">
        {submitted && (
          <div className="flex items-center gap-2 text-[#00ff88] text-[11px]">
            <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="#00ff88" strokeWidth="1" fill="none"/><path d="M3.5 6l2 2 3-3.5" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            submitted — evaluating...
          </div>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[10px] text-[#2a2a2a]">{code.length} chars</span>
          <button
            onClick={handleSubmit}
            disabled={!code.trim()}
            className="bg-[#00ff8815] border border-[#00ff8840] text-[#00ff88] text-xs rounded-md px-4 py-1.5 hover:bg-[#00ff8825] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            [ run & submit ]
          </button>
        </div>
      </div>

    </div>
  );
}