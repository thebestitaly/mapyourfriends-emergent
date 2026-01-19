import React from 'react';

export default function FilterChips({
  filter,
  setFilter,
  importedCount = 0,
  groups = [],
  onManageGroups
}) {
  return (
    <div className="absolute top-20 left-20 flex gap-2 pointer-events-auto flex-wrap z-10 items-center">
      {/* Standard filters */}
      {['all', 'active', 'competent', 'imported'].map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          data-testid={`filter-${f}-btn`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === f
              ? f === 'imported'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
              : 'glass-panel text-slate-600 hover:bg-white/90'
            }`}
        >
          {f === 'all' ? 'Tutti' : f === 'active' ? 'Vivono' : f === 'competent' ? 'Conoscono' : 'Importati'}
        </button>
      ))}

      {/* Group filters */}
      {groups.map((group) => (
        <button
          key={group.group_id}
          onClick={() => setFilter(group.group_id)}
          style={{
            backgroundColor: filter === group.group_id ? group.color : undefined,
            color: filter === group.group_id ? '#fff' : undefined,
            borderColor: group.color
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${filter === group.group_id
              ? 'shadow-md border-transparent'
              : 'glass-panel text-slate-600 hover:bg-white/90'
            }`}
        >
          {group.name}
        </button>
      ))}

      {/* Manage Groups Button */}
      <button
        onClick={onManageGroups}
        className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center 
                   hover:bg-slate-700 transition-colors shadow-md"
        title="Gestisci Gruppi"
      >
        <span className="text-lg leading-none mb-0.5">+</span>
      </button>

      {importedCount > 0 && (
        <span className="px-3 py-2 rounded-full text-xs font-medium bg-pink-100 text-pink-700 ml-2">
          {importedCount} importati
        </span>
      )}
    </div>
  );
}
