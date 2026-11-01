import { useLanguage } from "@/context/LanguageContext";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({
  password,
}: PasswordStrengthProps) {
  const { t } = useLanguage();
  if (!password) {
    return null;
  }

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  const labels = [
    t("auth.password_veryWeak"),
    t("auth.password_weak"),
    t("auth.password_fair"),
    t("auth.password_good"),
    t("auth.password_strong"),
  ];

  return (
    <div className="mt-2">

      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`
              h-1 flex-1 rounded-full
              ${index < score
                ? "bg-brand-desert-dark"
                : "bg-brand-sand"
              }
            `}
          />
        ))}
      </div>

      <div className="mt-1.5 flex justify-between">
        <span className="text-[10px] text-muted-foreground">
          {t("auth.password_minimum")}
        </span>

        <span className="text-[10px] font-medium text-brand-brown-700">
          {labels[score]}
        </span>
      </div>

    </div>
  );
}