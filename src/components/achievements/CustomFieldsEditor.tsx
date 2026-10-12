"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Sliders, Sparkles } from "lucide-react";

export interface CustomFieldItem {
  id: string;
  key: string;
  value: string;
}

interface CustomFieldsEditorProps {
  fields: CustomFieldItem[];
  onChange: (fields: CustomFieldItem[]) => void;
  title?: string;
  description?: string;
}

const COMMON_SUGGESTIONS = [
  "Impact Factor",
  "Sponsoring Agency",
  "Grant Amount",
  "Project Number",
  "Citation Count",
  "Scimago Q-Ranking",
  "Co-Principal Investigator",
  "Certificate ID",
];

export function CustomFieldsEditor({
  fields,
  onChange,
  title = "Custom & Additional Attributes",
  description = "Add any dynamic key-value pairs specific to your achievement (e.g. Impact Factor, Grant Sponsor, Citations).",
}: CustomFieldsEditorProps) {
  const addField = (initialKey = "") => {
    onChange([
      ...fields,
      { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, key: initialKey, value: "" },
    ]);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: string) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], key, value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => addField()}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Custom Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-center space-y-2">
          <p className="text-xs text-slate-500">
            No additional custom fields added yet. Need to record details not covered by the default form?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Add:
            </span>
            {COMMON_SUGGESTIONS.slice(0, 5).map((sugg) => (
              <button
                key={sugg}
                type="button"
                onClick={() => addField(sugg)}
                className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-medium transition cursor-pointer"
              >
                + {sugg}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
            >
              <div className="w-full sm:w-5/12">
                <Input
                  placeholder="Field Name (e.g. Impact Factor)"
                  value={field.key}
                  onChange={(e) => updateField(idx, e.target.value, field.value)}
                />
              </div>
              <div className="w-full sm:w-6/12">
                <Input
                  placeholder="Value (e.g. 4.5 or DST-SERB)"
                  value={field.value}
                  onChange={(e) => updateField(idx, field.key, e.target.value)}
                />
              </div>
              <div className="shrink-0 self-end sm:self-center">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => removeField(idx)}
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2"
                  title="Remove this field"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Suggestions:</span>
              {COMMON_SUGGESTIONS.map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => addField(sugg)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-400 hover:text-indigo-600 font-medium transition cursor-pointer"
                >
                  + {sugg}
                </button>
              ))}
            </div>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => addField()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Another Field
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

