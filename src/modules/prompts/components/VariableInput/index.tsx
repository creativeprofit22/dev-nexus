/**
 * VariableInput Component
 * Input field for prompt variable with auto-fill suggestions
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/shared/components/ui/Input";
import type { VariableSuggestion } from "../../hooks/useVariableAutoFill";

interface VariableInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: VariableSuggestion[];
  placeholder?: string;
}

/**
 * Input field for a single prompt variable
 *
 * Features:
 * - Text input with variable name label
 * - Dropdown with auto-fill suggestions
 * - Click suggestion to fill value
 * - Manual override always available
 *
 * @example
 * <VariableInput
 *   name="projectName"
 *   value={values.projectName}
 *   onChange={(v) => setValues({ ...values, projectName: v })}
 *   suggestions={[
 *     { value: "My Project", source: "project", label: "From project" }
 *   ]}
 * />
 */
export function VariableInput({
  name,
  value,
  onChange,
  suggestions = [],
  placeholder,
}: VariableInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: VariableSuggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
  };

  const sourceColors: Record<VariableSuggestion["source"], string> = {
    project: "bg-green-500/10 text-green-400 border-green-500/30",
    recent: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    default: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block mb-1.5">
        <code className="text-sm font-mono text-sky-400">{`{{${name}}}`}</code>
      </label>

      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder ?? `Enter value for ${name}`}
          className="pr-10"
        />

        {/* Suggestions toggle button */}
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-[#212730] text-[#64748b] hover:text-[#cbd5e1] transition-colors"
            aria-label="Show suggestions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${showSuggestions ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-[#212730] bg-[#14161c] shadow-lg max-h-48 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#212730] transition-colors flex items-center gap-2 border-b border-[#212730] last:border-b-0"
            >
              <span
                className={`px-1.5 py-0.5 rounded text-xs border ${sourceColors[suggestion.source]}`}
              >
                {suggestion.source === "project"
                  ? "Project"
                  : suggestion.source === "recent"
                    ? "Recent"
                    : "Default"}
              </span>
              <span className="text-[#cbd5e1] truncate flex-1">
                {suggestion.value}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface VariableInputGroupProps {
  variables: Array<{
    name: string;
    value: string;
    suggestions?: VariableSuggestion[];
  }>;
  onChange: (name: string, value: string) => void;
}

/**
 * Group of variable inputs for a prompt
 *
 * @example
 * <VariableInputGroup
 *   variables={variableValues}
 *   onChange={(name, value) => setValues({ ...values, [name]: value })}
 * />
 */
export function VariableInputGroup({
  variables,
  onChange,
}: VariableInputGroupProps) {
  if (variables.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#64748b]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <span>Fill in the variables below</span>
      </div>

      <div className="grid gap-4">
        {variables.map((variable) => (
          <VariableInput
            key={variable.name}
            name={variable.name}
            value={variable.value}
            onChange={(value) => onChange(variable.name, value)}
            suggestions={variable.suggestions}
          />
        ))}
      </div>
    </div>
  );
}
