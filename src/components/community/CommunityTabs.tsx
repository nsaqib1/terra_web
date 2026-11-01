"use client";

import {
  BookOpen,
  FileText,
  Shield,
  Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const tabs = [
  {
    label: "Discussions",
    icon: FileText,
  },
  {
    label: "Knowledge",
    icon: BookOpen,
  },
  {
    label: "Citizens",
    icon: Users,
  },
  {
    label: "Governance",
    icon: Shield,
  },
];

interface CommunityTabsProps {
  active?: string;
}

export function CommunityTabs({
  active = "Discussions",
}: CommunityTabsProps) {
  const { t } = useLanguage();
  const labels: Record<string, string> = {
    Discussions: t("common.discussions"),
    Knowledge: t("common.knowledge"),
    Citizens: t("common.citizens"),
    Governance: t("common.governance"),
  };
  return (
    <div className="overflow-x-auto border-b">
      <div className="flex min-w-max">

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.label === active;

          return (
            <button
              key={labels[tab.label] ?? tab.label}
              className={`
                relative flex items-center gap-2
                px-4 py-3.5
                text-sm font-semibold
                transition-colors
                ${isActive
                  ? "text-brand-brown-950"
                  : "text-muted-foreground hover:text-brand-brown-950"
                }
              `}
            >
              <Icon size={16} strokeWidth={1.8} />

              {labels[tab.label] ?? tab.label}

              {isActive && (
                <span
                  className="
                    absolute inset-x-3 -bottom-px
                    h-0.5 rounded-full
                    bg-brand-desert-dark
                  "
                />
              )}
            </button>
          );
        })}

      </div>
    </div>
  );
}