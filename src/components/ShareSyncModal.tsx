import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Smartphone, Calendar, Download, ExternalLink } from 'lucide-react';

interface ShareSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareSyncModal: React.FC<ShareSyncModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedIcs, setCopiedIcs] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const icsUrl = `${currentUrl}/api/export/ics`;

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyIcsUrl = () => {
    navigator.clipboard.writeText(icsUrl);
    setCopiedIcs(true);
    setTimeout(() => setCopiedIcs(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Sdílení a přístup pro 4 členy rodiny
            </h3>
            <span className="text-xs text-slate-500">
              Přístup z mobilu, tabletu i počítače s online synchronizací
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Direct link for family */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Sdílená webová adresa kalendáře
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-700"
              />
              <button
                onClick={copyUrl}
                className="px-3.5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Zkopírováno' : 'Kopírovat'}</span>
              </button>
            </div>
          </div>

          {/* Mobile phone tip */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Jak si kalendář přidat na mobil (Táta, Máma i děti)</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-1.5 pl-5 list-decimal leading-relaxed">
              <li>Otevřete tento odkaz v prohlížeči v telefonu (Safari na iPhone nebo Chrome na Androidu).</li>
              <li>Klepněte na tlačítko <strong>Sdílet / Menu</strong> (ikona tří teček nebo čtvereček se šipkou).</li>
              <li>Zvolte <strong>„Přidat na plochu“</strong> (Add to Home Screen).</li>
              <li>Kalendář se vám zobrazí jako samostatná aplikace s přímým přístupem a okamžitým zápisem aktivit!</li>
            </ol>
          </div>

          {/* iCalendar Sync */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-indigo-950 font-semibold text-xs">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Propojení s Google Kalendářem nebo Apple Kalendářem</span>
            </div>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Můžete si exportovat soubor <code>.ics</code> nebo vložit odkaz pro odběr do svého osobního kalendáře v mobilu.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={icsUrl}
                download="rodinny-kalendar.ics"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Stáhnout .ics soubor</span>
              </a>
              <button
                onClick={copyIcsUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors"
              >
                {copiedIcs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIcs ? 'Odkaz .ics zkopírován' : 'Kopírovat odkaz kalendáře'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hotovo
          </button>
        </div>
      </div>
    </div>
  );
};
