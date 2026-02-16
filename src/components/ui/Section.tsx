import type { ReactNode } from "react";
import Card from "./Card";

interface SectionProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}

export default function Section({ title, description, children }: SectionProps) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {description ? (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </Card>
  );
}
