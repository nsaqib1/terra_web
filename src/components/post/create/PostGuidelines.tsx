import { useLanguage } from "@/context/LanguageContext";
import {
  Bookmark,
  CheckCircle2,
  Lightbulb,
  Search,
} from "lucide-react";

export function PostGuidelines() {
  const { t } = useLanguage();
  return (
    <aside className="space-y-4">
      <section className="-mx-4 rounded-none border-y bg-white p-5 sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center gap-2">
          <Lightbulb
            size={16}
            className="text-brand-desert-dark"
          />

          <h2 className="text-sm font-bold text-brand-brown-950">
            {t("common.writeUsefulPost")}
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <Guideline
            icon={<Search size={14} />}
            title={t("common.searchFirst")}
            description={t("common.searchFirstDescription")}
          />

          <Guideline
            icon={<Bookmark size={14} />}
            title={t("common.markContext")}
            description={t("common.markContextDescription")}
          />

          <Guideline
            icon={<CheckCircle2 size={14} />}
            title={t("common.sayEnough")}
            description={t("common.sayEnoughDescription")}
          />
        </div>
      </section>

      <section
        className="
          -mx-4 rounded-none
          border-y border-brand-desert-light
          bg-brand-desert-light/30
          p-5
          sm:mx-0 sm:rounded-2xl sm:border
        "
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-desert">
          <span>🐪</span>
        </div>

        <h2 className="mt-3 text-sm font-bold text-brand-brown-950">
          {t("common.buildCommunityHistory")}
        </h2>

        <p className="mt-2 text-[11px] leading-5 text-brand-brown-700">
          {t("common.communityHistoryDescription")}
        </p>
      </section>
    </aside>
  );
}

function Guideline({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className="
          flex h-7 w-7 shrink-0
          items-center justify-center
          rounded-lg
          bg-brand-sand
          text-brand-brown-700
        "
      >
        {icon}
      </div>

      <div>
        <h3 className="text-xs font-bold text-brand-brown-900">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
