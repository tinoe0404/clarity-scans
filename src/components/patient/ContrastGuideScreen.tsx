"use client";

import { useTranslations } from "next-intl";
import { Info, Droplet, Activity, AlertTriangle } from "lucide-react";

export default function ContrastGuideScreen() {
  const t = useTranslations("contrastGuide");

  return (
    <div className="flex flex-col h-full bg-surface-base px-6 py-8 sm:px-12 md:px-20 lg:max-w-4xl lg:mx-auto overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-brand-light/10 text-brand-dark rounded-xl">
          <Droplet className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t("title")}</h1>
          <p className="text-lg text-slate-300 mt-1">{t("subtitle")}</p>
        </div>
      </div>

      <div className="bg-surface-elevated rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-xl mb-8 flex gap-4">
        <Info className="h-6 w-6 text-brand-base shrink-0 mt-1" />
        <p className="text-slate-200 text-lg leading-relaxed">
          {t("intro")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* How is it given */}
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-700 rounded-lg text-brand-light">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">{t("how")}</h2>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            {t("howText")}
          </p>
        </div>

        {/* What will I feel */}
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-700 rounded-lg text-orange-400">
              <Droplet className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">{t("feels")}</h2>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            {t("feelsText")}
          </p>
        </div>
      </div>

      {/* Important Warning */}
      <div className="bg-red-500/10 rounded-2xl p-6 sm:p-8 border border-red-500/20 shadow-xl mb-12 flex gap-4">
        <AlertTriangle className="h-8 w-8 text-red-400 shrink-0" />
        <div>
          <h2 className="text-xl font-bold text-red-400 mb-2">{t("important")}</h2>
          <p className="text-slate-200 text-lg leading-relaxed">
            {t("importantText")}
          </p>
        </div>
      </div>
    </div>
  );
}
