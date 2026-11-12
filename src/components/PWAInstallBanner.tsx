import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running as installed app or dismissed by user, do not show
  if (isInstalled || dismissed) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <div className="bg-indigo-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold block truncate">Nainstalovat jako aplikaci do mobilu</span>
            <span className="text-indigo-100 text-[11px] block truncate">Rychlý přístup na plochu s týdenním rozvrhem</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="px-3 py-1.5 bg-white text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-50 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalovat</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-indigo-200 hover:text-white transition-colors"
            aria-label="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <div className="bg-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold block truncate">Mobilní aplikace pro iPhone</span>
              <span className="text-slate-300 text-[11px] block truncate">Používejte kalendář na celé obrazovce</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg text-xs hover:bg-indigo-500 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusSquare className="w-3.5 h-3.5" />
              <span>Přidat na plochu</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iOS Step by step modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    📅
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Přidat na plochu iPhone</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">Klepněte na tlačítko Sdílet v Safari</span>
                    <span>Dole v liště prohlížeče klepněte na ikonu čtverečku se šipkou nahoru (<Share2 className="w-3.5 h-3.5 inline text-indigo-600" />).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">Zvolte „Přidat na plochu“</span>
                    <span>Sjeďte v nabídce o kousek níže a vyberte možnost se symbolem plus <strong>[+] Přidat na plochu</strong>.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-semibold block mb-0.5">Hotovo!</span>
                    <span>Kalendář se otevře jako samostatná mobilní aplikace na celý displej bez adresního řádku.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Rozumím
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
