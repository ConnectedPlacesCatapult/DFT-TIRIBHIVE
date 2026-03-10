"use client";

interface FilterFormProps {
  sectors: string[];
  allRisks: string[];
  allAssets: string[];
  effects: string[];
  selectedSector: string;
  selectedRisk: string;
  selectedAsset: string;
  selectedEffect: string;
  onSectorChange: (sector: string) => void;
  onRiskChange: (risk: string) => void;
  onAssetChange: (asset: string) => void;
  onEffectChange: (effect: string) => void;
  onExplore: () => void;
  onReset: () => void;
}

export function FilterForm({
  sectors,
  allRisks,
  allAssets,
  effects,
  selectedSector,
  selectedRisk,
  selectedAsset,
  selectedEffect,
  onSectorChange,
  onRiskChange,
  onAssetChange,
  onEffectChange,
  onExplore,
  onReset,
}: FilterFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="sector-select" className="text-sm font-medium text-gray-700 shrink-0 w-44">
          Transport Sector
        </label>
        <select
          id="sector-select"
          value={selectedSector}
          onChange={(e) => onSectorChange(e.target.value)}
          className="flex-1 min-w-[180px] border-2 border-[#21BA45] rounded-lg pl-3 pr-8 py-2 text-sm bg-[#BBF7D0] text-gray-800 appearance-none cursor-pointer bg-no-repeat bg-[length:1.25rem] bg-[right_0.5rem_center]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234A4A4A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
        >
          <option value="">-- Select a transport sector --</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="asset-select" className="text-sm font-medium text-gray-700 shrink-0 w-44">
          Asset Type
        </label>
        <select
          id="asset-select"
          value={selectedAsset}
          onChange={(e) => onAssetChange(e.target.value)}
          className="flex-1 min-w-[180px] border-2 border-[#E6B800] rounded-lg pl-3 pr-8 py-2 text-sm bg-[#FEF9C3] text-gray-800 appearance-none cursor-pointer bg-no-repeat bg-[length:1.25rem] bg-[right_0.5rem_center]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234A4A4A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
        >
          <option value="">-- Select an asset type --</option>
          {allAssets.map((asset) => (
            <option key={asset} value={asset}>{asset}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="risk-select" className="text-sm font-medium text-gray-700 shrink-0 w-44">
          Climate Hazard (Cause)
        </label>
        <select
          id="risk-select"
          value={selectedRisk}
          onChange={(e) => onRiskChange(e.target.value)}
          className="flex-1 min-w-[180px] border-2 border-[#DB2828] rounded-lg pl-3 pr-8 py-2 text-sm bg-[#FECACA] text-gray-800 appearance-none cursor-pointer bg-no-repeat bg-[length:1.25rem] bg-[right_0.5rem_center]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234A4A4A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
        >
          <option value="">-- Select a climate hazard (cause) --</option>
          {allRisks.map((risk) => (
            <option key={risk} value={risk}>{risk}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="effect-select" className="text-sm font-medium text-gray-700 shrink-0 w-44">
          Climate Hazard (Effect)
        </label>
        <select
          id="effect-select"
          value={selectedEffect}
          onChange={(e) => onEffectChange(e.target.value)}
          className="flex-1 min-w-[180px] border-2 border-[#F2711C] rounded-lg pl-3 pr-8 py-2 text-sm bg-[#FFE0CC] text-gray-800 appearance-none cursor-pointer bg-no-repeat bg-[length:1.25rem] bg-[right_0.5rem_center]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234A4A4A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
        >
          <option value="">-- Select a climate hazard (effect) --</option>
          {effects.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onExplore}
          className="flex-1 bg-[#21808B] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a6b73] transition-colors shadow-sm"
        >
          Explore
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 bg-white border border-gray-200 text-[#374151] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
