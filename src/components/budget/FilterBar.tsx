"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface FilterBarProps {
  onAddBudgetClick?: () => void;
}

export default function FilterBar({ onAddBudgetClick }: FilterBarProps) {
  const [selectedMonth] = useState("This month");
  const [sortBy] = useState("Default");

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Month selector */}
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {selectedMonth}
          </span>
        </button>

        {/* Sort selector */}
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Sort by: {sortBy}
          </span>
        </button>

        {/* Filter chips */}
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">Filter</span>
        </button>

        {/* Status filter */}
        <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Status
        </button>

        {/* Amount filter */}
        <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Amount
        </button>

        {/* Reset button */}
        <button className="ml-auto text-sm text-gray-500 hover:text-gray-700 font-medium">
          Reset all
        </button>

        {/* Add new budget button */}
        <Button size="sm" onClick={onAddBudgetClick}>
          + Add new budget
        </Button>
      </div>
    </div>
  );
}
