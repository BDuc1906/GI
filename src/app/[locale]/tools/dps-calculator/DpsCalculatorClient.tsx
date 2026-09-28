"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface CharacterOption {
  id: string;
  name: string;
  vision: string;
  weaponType: string;
  rarity: number;
  iconUrl: string | null;
}

interface WeaponOption {
  id: string;
  name: string;
  type: string;
  rarity: number;
  iconUrl: string | null;
}

const SANDS_OPTIONS = ["ATK%", "HP%", "DEF%", "EM", "ER%"];
const GOBLET_OPTIONS = ["ATK%", "HP%", "DEF%", "EM", "Elemental DMG%", "Physical DMG%"];
const CIRCLET_OPTIONS = ["ATK%", "HP%", "DEF%", "EM", "CRIT Rate%", "CRIT DMG%", "Healing Bonus%"];
const REACTIONS = ["Vaporize", "Melt", "Overload", "Superconduct", "Electro-Charged", "Aggravate", "Spread"];

interface DpsResult {
  characterName: string;
  weaponName: string;
  expectedDPS: number;
  damageBreakdown: { normalAttack: number; skill: number; burst: number; reactions: number };
  optimizationTips: string[];
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-text-muted mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
      />
    </div>
  );
}

export function DpsCalculatorClient({
  characters,
  weapons,
}: {
  characters: CharacterOption[];
  weapons: WeaponOption[];
}) {
  const [charQuery, setCharQuery] = useState("");
  const [selectedChar, setSelectedChar] = useState<CharacterOption | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponOption | null>(null);

  const [characterLevel, setCharacterLevel] = useState(90);
  const [weaponLevel, setWeaponLevel] = useState(90);
  const [weaponRefinement, setWeaponRefinement] = useState(1);
  const [talents, setTalents] = useState({ normalAttack: 10, elementalSkill: 10, elementalBurst: 10 });

  const [flowerHp, setFlowerHp] = useState(4780);
  const [plumeAtk, setPlumeAtk] = useState(311);
  const [sandsMainStat, setSandsMainStat] = useState("ATK%");
  const [sandsValue, setSandsValue] = useState(46.6);
  const [gobletMainStat, setGobletMainStat] = useState("ATK%");
  const [gobletValue, setGobletValue] = useState(46.6);
  const [circletMainStat, setCircletMainStat] = useState("CRIT Rate%");
  const [circletValue, setCircletValue] = useState(31.1);
  const [subStats, setSubStats] = useState({
    critRate: 0,
    critDmg: 0,
    atkPercent: 0,
    hpPercent: 0,
    defPercent: 0,
    em: 0,
    erPercent: 0,
  });

  const [enemyRes, setEnemyRes] = useState(10);
  const [damageBonus, setDamageBonus] = useState(0);
  const [reaction, setReaction] = useState("Vaporize");
  const [reactionDirection, setReactionDirection] = useState<"forward" | "reverse">("forward");

  const [result, setResult] = useState<DpsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCharacters = useMemo(() => {
    if (!charQuery.trim()) return characters.slice(0, 8);
    const q = charQuery.toLowerCase();
    return characters.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [characters, charQuery]);

  // Chỉ gợi ý vũ khí ĐÚNG loại nhân vật đang dùng (Character.weaponType và
  // Weapon.type đều lưu cùng field weaponText từ genshin-db — đã verify
  // trùng khớp trước khi lọc, không phải đoán).
  const compatibleWeapons = useMemo(() => {
    if (!selectedChar) return weapons.slice(0, 8);
    return weapons.filter((w) => w.type === selectedChar.weaponType).slice(0, 8);
  }, [weapons, selectedChar]);

  async function handleCalculate() {
    if (!selectedChar || !selectedWeapon) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools/dps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedChar.id,
          weaponId: selectedWeapon.id,
          characterLevel,
          weaponLevel,
          weaponRefinement,
          talentLevels: talents,
          artifacts: {
            flowerHp,
            plumeAtk,
            sandsMainStat,
            sandsValue,
            gobletMainStat,
            gobletValue,
            circletMainStat,
            circletValue,
            subStats,
          },
          modifiers: { enemyRes, defenseReduction: 0, damageBonus, vulnerability: 0, reaction, reactionDirection },
          rotation: { normalAttacks: 3, skillCasts: 1, burstCasts: 1, reactionChance: 1 },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Tính toán thất bại");
      }
      setResult(json.data as DpsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Nhân vật + vũ khí */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-bg-card border-2 border-border rounded-xl p-5">
          <label className="block text-sm font-medium text-text-secondary mb-2">Nhân vật</label>
          {selectedChar ? (
            <PickedItem
              name={selectedChar.name}
              iconUrl={selectedChar.iconUrl}
              onChange={() => {
                setSelectedChar(null);
                setSelectedWeapon(null);
              }}
            />
          ) : (
            <>
              <input
                type="text"
                value={charQuery}
                onChange={(e) => setCharQuery(e.target.value)}
                placeholder="Gõ tên nhân vật..."
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted text-sm"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {filteredCharacters.map((c) => (
                  <PickerButton key={c.id} name={c.name} iconUrl={c.iconUrl} onClick={() => setSelectedChar(c)} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-bg-card border-2 border-border rounded-xl p-5">
          <label className="block text-sm font-medium text-text-secondary mb-2">Vũ khí</label>
          {!selectedChar ? (
            <p className="text-sm text-text-muted">Chọn nhân vật trước để lọc đúng loại vũ khí.</p>
          ) : selectedWeapon ? (
            <PickedItem name={selectedWeapon.name} iconUrl={selectedWeapon.iconUrl} onChange={() => setSelectedWeapon(null)} />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {compatibleWeapons.map((w) => (
                <PickerButton key={w.id} name={w.name} iconUrl={w.iconUrl} onClick={() => setSelectedWeapon(w)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cấp độ */}
      <div className="bg-bg-card border-2 border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-3">Cấp độ &amp; Thiên phú</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <NumberField label="Cấp nhân vật" value={characterLevel} onChange={setCharacterLevel} min={1} max={90} />
          <NumberField label="Cấp vũ khí" value={weaponLevel} onChange={setWeaponLevel} min={1} max={90} />
          <NumberField label="Tinh luyện" value={weaponRefinement} onChange={setWeaponRefinement} min={1} max={5} />
          <NumberField
            label="Đòn thường"
            value={talents.normalAttack}
            onChange={(v) => setTalents((t) => ({ ...t, normalAttack: v }))}
            min={1}
            max={15}
          />
          <NumberField
            label="Nộ"
            value={talents.elementalBurst}
            onChange={(v) => setTalents((t) => ({ ...t, elementalBurst: v }))}
            min={1}
            max={15}
          />
        </div>
      </div>

      {/* Thánh di vật */}
      <div className="bg-bg-card border-2 border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-3">Thánh di vật</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <NumberField label="HP hoa (chỉ số chính)" value={flowerHp} onChange={setFlowerHp} />
          <NumberField label="ATK lông (chỉ số chính)" value={plumeAtk} onChange={setPlumeAtk} />
          <div />
          <SelectField label="Chỉ số chính Đồng hồ cát" value={sandsMainStat} onChange={setSandsMainStat} options={SANDS_OPTIONS} />
          <NumberField label="Giá trị" value={sandsValue} onChange={setSandsValue} step={0.1} />
          <div />
          <SelectField label="Chỉ số chính Cốc" value={gobletMainStat} onChange={setGobletMainStat} options={GOBLET_OPTIONS} />
          <NumberField label="Giá trị" value={gobletValue} onChange={setGobletValue} step={0.1} />
          <div />
          <SelectField label="Chỉ số chính Vương miện" value={circletMainStat} onChange={setCircletMainStat} options={CIRCLET_OPTIONS} />
          <NumberField label="Giá trị" value={circletValue} onChange={setCircletValue} step={0.1} />
        </div>

        <h4 className="text-xs text-text-muted mb-2">Tổng chỉ số phụ (cộng dồn cả 5 món)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NumberField label="CRIT Rate %" value={subStats.critRate} onChange={(v) => setSubStats((s) => ({ ...s, critRate: v }))} step={0.1} />
          <NumberField label="CRIT DMG %" value={subStats.critDmg} onChange={(v) => setSubStats((s) => ({ ...s, critDmg: v }))} step={0.1} />
          <NumberField label="ATK %" value={subStats.atkPercent} onChange={(v) => setSubStats((s) => ({ ...s, atkPercent: v }))} step={0.1} />
          <NumberField label="EM" value={subStats.em} onChange={(v) => setSubStats((s) => ({ ...s, em: v }))} />
        </div>
      </div>

      {/* Kẻ địch & phản ứng */}
      <div className="bg-bg-card border-2 border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-3">Kẻ địch &amp; Phản ứng</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NumberField label="Kháng nguyên tố (%)" value={enemyRes} onChange={setEnemyRes} min={-100} max={100} />
          <NumberField label="DMG Bonus khác (%)" value={damageBonus} onChange={setDamageBonus} />
          <SelectField label="Phản ứng" value={reaction} onChange={setReaction} options={REACTIONS} />
          <SelectField
            label="Chiều phản ứng"
            value={reactionDirection}
            onChange={(v) => setReactionDirection(v as "forward" | "reverse")}
            options={["forward", "reverse"]}
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={!selectedChar || !selectedWeapon || loading}
        className="w-full bg-gold text-bg-primary font-semibold rounded-lg py-3 hover:bg-gold-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Đang tính..." : "Tính DPS"}
      </button>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="bg-bg-card border-2 border-gold/30 rounded-xl p-5">
          <h3 className="font-display text-lg font-bold text-text-primary mb-1">
            {result.characterName} · {result.weaponName}
          </h3>
          <div className="text-3xl font-display font-bold text-gold-bright mb-4">
            {result.expectedDPS.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} DPS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
            <div className="bg-bg-primary border border-border rounded-lg p-3">
              <div className="text-text-muted text-xs">Đòn thường</div>
              <div className="text-text-primary font-semibold">{result.damageBreakdown.normalAttack.toLocaleString("vi-VN")}</div>
            </div>
            <div className="bg-bg-primary border border-border rounded-lg p-3">
              <div className="text-text-muted text-xs">Kỹ năng</div>
              <div className="text-text-primary font-semibold">{result.damageBreakdown.skill.toLocaleString("vi-VN")}</div>
            </div>
            <div className="bg-bg-primary border border-border rounded-lg p-3">
              <div className="text-text-muted text-xs">Nộ</div>
              <div className="text-text-primary font-semibold">{result.damageBreakdown.burst.toLocaleString("vi-VN")}</div>
            </div>
            <div className="bg-bg-primary border border-border rounded-lg p-3">
              <div className="text-text-muted text-xs">Phản ứng</div>
              <div className="text-text-primary font-semibold">{result.damageBreakdown.reactions.toLocaleString("vi-VN")}</div>
            </div>
          </div>
          {result.optimizationTips.length > 0 && (
            <div>
              <h4 className="text-xs text-text-muted mb-2">Gợi ý tối ưu</h4>
              <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                {result.optimizationTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PickedItem({ name, iconUrl, onChange }: { name: string; iconUrl: string | null; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between bg-bg-primary border border-border rounded-lg p-3">
      <div className="flex items-center gap-3">
        {iconUrl && <Image src={iconUrl} alt={name} width={36} height={36} className="rounded-full" />}
        <span className="font-semibold text-text-primary text-sm">{name}</span>
      </div>
      <button onClick={onChange} className="text-xs text-text-muted hover:text-text-primary transition-colors">
        Đổi
      </button>
    </div>
  );
}

function PickerButton({ name, iconUrl, onClick }: { name: string; iconUrl: string | null; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-bg-primary border border-border rounded-lg p-2 hover:border-gold/50 transition-colors text-left"
    >
      {iconUrl && <Image src={iconUrl} alt={name} width={24} height={24} className="rounded-full shrink-0" />}
      <span className="text-xs text-text-primary truncate">{name}</span>
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs text-text-muted mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
