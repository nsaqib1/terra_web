"use client";

interface ProposalStepScopeProps {
  description: string;
  scope: string;
  onDescriptionChange: (value: string) => void;
  onScopeChange: (value: string) => void;
}

export function ProposalStepScope({
  description,
  scope,
  onDescriptionChange,
  onScopeChange,
}: ProposalStepScopeProps) {
  return (
    <div className="space-y-7">

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
          Step 2
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-brown-950">
          Define the community
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-brand-brown-600">
          Help future citizens understand what belongs here and what does
          not.
        </p>
      </div>

      {/* Description */}
      <Field
        label="Short description"
        hint="This appears beneath the community name."
        value={description}
        onChange={onDescriptionChange}
        placeholder="What is this community about?"
        maxLength={180}
      />

      {/* Scope */}
      <div>
        <label className="text-sm font-semibold text-brand-brown-900">
          Community scope
        </label>

        <p className="mt-1 text-[11px] text-muted-foreground">
          Explain the subject in more detail. What kinds of discussions,
          questions, knowledge, and collaboration belong here?
        </p>

        <textarea
          value={scope}
          onChange={(event) => onScopeChange(event.target.value)}
          placeholder="For example: This community is for people interested in growing food and plants in urban environments..."
          rows={7}
          className="
            mt-2 w-full resize-none
            rounded-xl border
            bg-white p-4
            text-sm leading-6
            text-brand-brown-950
            outline-none
            placeholder:text-brand-brown-600/50
            focus:border-brand-desert-dark
            focus:ring-4
            focus:ring-brand-desert-light/50
          "
        />

        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          {scope.length} characters
        </p>
      </div>

      {/* Guidance */}
      <div className="rounded-2xl border bg-brand-cream p-4">

        <p className="text-xs font-bold text-brand-brown-950">
          A strong community scope should answer:
        </p>

        <ul className="mt-3 space-y-2">
          {[
            "What subject does this community represent?",
            "Who would benefit from participating?",
            "What kinds of contributions belong here?",
            "Why does this deserve its own canonical community?",
          ].map((item) => (
            <li
              key={item}
              className="flex gap-2 text-xs text-brand-brown-600"
            >
              <span className="text-brand-desert-dark">•</span>
              {item}
            </li>
          ))}
        </ul>

      </div>

    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-brown-900">
        {label}
      </label>

      <p className="mt-1 text-[11px] text-muted-foreground">
        {hint}
      </p>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="
          mt-2 h-12 w-full
          rounded-xl border
          bg-white px-4
          text-sm text-brand-brown-950
          outline-none
          placeholder:text-brand-brown-600/50
          focus:border-brand-desert-dark
          focus:ring-4
          focus:ring-brand-desert-light/50
        "
      />

      <p className="mt-1 text-right text-[10px] text-muted-foreground">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}