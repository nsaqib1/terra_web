"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

import { ProposalProgress } from "@/components/communities/proposal/ProposalProgress";
import { ProposalStepIdentity } from "@/components/communities/proposal/ProposalStepIdentity";
import { ProposalStepScope } from "@/components/communities/proposal/ProposalStepScope";
import { ProposalStepTags } from "@/components/communities/proposal/ProposalStepTags";
import { ProposalStepReview } from "@/components/communities/proposal/ProposalStepReview";
import { ProposalComplete } from "@/components/communities/proposal/ProposalComplete";

export default function ProposeCommunityPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  function canContinue() {
    if (step === 1) {
      return name.trim().length >= 3;
    }

    if (step === 2) {
      return (
        description.trim().length >= 20 &&
        scope.trim().length >= 50
      );
    }

    if (step === 3) {
      return tags.length >= 2;
    }

    return true;
  }

  function next() {
    if (!canContinue()) {
      return;
    }

    if (step < 4) {
      setStep((current) => current + 1);
    }
  }

  function back() {
    if (step > 1) {
      setStep((current) => current - 1);
    }
  }

  function submit() {
    // Later this becomes the API request.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[900px] py-10">
          <ProposalComplete name={name} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[900px]">

        {/* Back */}
        <Link
          href="/communities"
          className="
            inline-flex items-center gap-1.5
            text-xs font-semibold
            text-muted-foreground
            hover:text-brand-brown-950
          "
        >
          <ArrowLeft size={14} />
          Communities
        </Link>

        {/* Header */}
        <div className="mt-6">
          <h1 className="text-xl font-bold tracking-tight text-brand-brown-950">
            Propose a Community
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Help create a permanent home for an interest that doesn't
            have one yet.
          </p>
        </div>

        {/* Progress */}
        <div className="mt-7 rounded-2xl border bg-white p-4 sm:p-5">
          <ProposalProgress currentStep={step} />
        </div>

        {/* Form */}
        <div className="mt-4 rounded-2xl border bg-white">

          <div className="p-5 sm:p-8">

            {step === 1 && (
              <ProposalStepIdentity
                name={name}
                onNameChange={setName}
              />
            )}

            {step === 2 && (
              <ProposalStepScope
                description={description}
                scope={scope}
                onDescriptionChange={setDescription}
                onScopeChange={setScope}
              />
            )}

            {step === 3 && (
              <ProposalStepTags
                tags={tags}
                onTagsChange={setTags}
              />
            )}

            {step === 4 && (
              <ProposalStepReview
                name={name}
                description={description}
                scope={scope}
                tags={tags}
              />
            )}

          </div>

          {/* Footer */}
          <div
            className="
              flex items-center justify-between
              border-t bg-brand-cream/60
              px-5 py-4
              sm:px-8
            "
          >

            <Button
              type="button"
              variant="ghost"
              disabled={step === 1}
              onClick={back}
              className="
                gap-2
                text-brand-brown-700
                hover:bg-brand-sand
              "
            >
              <ArrowLeft size={15} />
              Back
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                disabled={!canContinue()}
                onClick={next}
                className="
                  gap-2
                  rounded-xl
                  bg-brand-desert
                  font-semibold
                  text-brand-brown-950
                  shadow-none
                  hover:bg-brand-desert-dark
                "
              >
                Continue
                <ArrowRight size={15} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={submit}
                className="
                  gap-2
                  rounded-xl
                  bg-brand-brown-950
                  font-semibold
                  text-white
                  shadow-none
                  hover:bg-brand-brown-800
                "
              >
                Submit Proposal
                <ArrowRight size={15} />
              </Button>
            )}

          </div>

        </div>

        {/* Footer reassurance */}
        <p className="mx-auto mt-5 max-w-xl text-center text-[11px] leading-5 text-muted-foreground">
          Proposing a community does not give you ownership or
          administrative control. Approved communities belong to their
          citizens and operate under the platform constitution.
        </p>

      </div>
    </AppShell>
  );
}