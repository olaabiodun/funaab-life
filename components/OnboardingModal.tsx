import React, { useState } from 'react';
import { useGame, StudentProfile } from '../game/store';
import { STUDENT_TRAITS, DEPARTMENTS } from '../game/character';
import { sound } from '../game/sound';

const AVATARS = ['😎', '🎓', '🧢', '🤓', '✨', '🔥', '📚', '💼'];

export default function OnboardingModal() {
  const onboarded = useGame((s) => s.onboarded);
  const createProfile = useGame((s) => s.createProfile);

  const [name, setName] = useState('');
  const [matricSuffix, setMatricSuffix] = useState(
    Math.floor(1000 + Math.random() * 9000).toString()
  );
  const [departmentId, setDepartmentId] = useState(DEPARTMENTS[0].id);
  const [traitId, setTraitId] = useState(STUDENT_TRAITS[0].id);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [gender, setGender] = useState<'comrade_m' | 'comrade_f'>('comrade_m');
  const [step, setStep] = useState<1 | 2>(1);

  if (onboarded) return null;

  const selectedTrait = STUDENT_TRAITS.find((t) => t.id === traitId)!;
  const selectedDept = DEPARTMENTS.find((d) => d.id === departmentId)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.fanfare();
    const studentName = name.trim() || 'Comrade Student';
    const profile: StudentProfile = {
      name: studentName,
      matricNo: `2024/${matricSuffix}`,
      departmentId,
      traitId,
      avatar,
      gender,
    };
    createProfile(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md anim-fade">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white relative">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
              FUNAAB Matriculation Portal
            </span>
            <span className="text-xs font-bold text-emerald-200">Step {step} of 2</span>
          </div>
          <h1 className="text-xl font-black mt-1.5 leading-tight">Create Your Student ID</h1>
          <p className="text-[11px] text-emerald-100 font-medium leading-snug">
            Welcome to Federal University of Agriculture, Abeokuta. Set up your character to enter campus.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {step === 1 ? (
            <>
              {/* Avatar Selector */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Choose Avatar Icon
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        setAvatar(av);
                        sound.click();
                      }}
                      className={`w-11 h-11 shrink-0 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                        avatar === av
                          ? 'bg-emerald-600 text-white scale-110 shadow-md ring-2 ring-emerald-400'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Full Name / Comrade Alias
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Segun Adeyemi"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  maxLength={28}
                />
              </div>

              {/* Matric No & Gender */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Matric No.
                  </label>
                  <div className="px-3 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs">
                    2024/{matricSuffix}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Pronoun
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setGender('comrade_m'); sound.click(); }}
                      className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                        gender === 'comrade_m' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      He/Him
                    </button>
                    <button
                      type="button"
                      onClick={() => { setGender('comrade_f'); sound.click(); }}
                      className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                        gender === 'comrade_f' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      She/Her
                    </button>
                  </div>
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Academic Department
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEPARTMENTS.map((dept) => {
                    const sel = dept.id === departmentId;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => {
                          setDepartmentId(dept.id);
                          sound.click();
                        }}
                        className={`p-2.5 rounded-2xl text-left border transition-all ${
                          sel
                            ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-base">{dept.emoji}</span>
                          <span className="text-[10px] font-bold text-slate-400">{dept.college}</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 leading-tight truncate">
                          {dept.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Choose Trait */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Select Your Campus Trait & Perk
                </label>
                <p className="text-[11px] text-slate-400 font-semibold mb-2.5">
                  Your student archetype determines your starting allowances and survival bonuses.
                </p>

                <div className="space-y-2">
                  {STUDENT_TRAITS.map((trait) => {
                    const active = trait.id === traitId;
                    return (
                      <button
                        key={trait.id}
                        type="button"
                        onClick={() => {
                          setTraitId(trait.id);
                          sound.click();
                        }}
                        className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                          active
                            ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-500/40'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl shrink-0">
                          {trait.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-black text-slate-900">{trait.name}</span>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                              ₦{trait.startingCash.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-600 leading-tight mt-0.5">
                            {trait.tagline}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 mt-1 leading-snug">
                            {trait.desc}
                          </div>
                          <div className="mt-1.5 inline-block text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                            ✨ {trait.bonus}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                sound.click();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-200 text-slate-700 text-xs font-black active:scale-95 transition-all"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={step === 1 ? () => { setStep(2); sound.click(); } : handleSubmit}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {step === 1 ? (
              <>Choose Archetype & Traits ›</>
            ) : (
              <>🎓 Complete Matriculation & Enter Campus</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
