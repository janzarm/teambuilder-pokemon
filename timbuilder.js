```react
import React, { useState, useEffect } from 'react';
import { Trash2, Search, Sparkles, Briefcase, X, Zap } from 'lucide-react';

export default function App() {
  const [pokemonLibrary, setPokemonLibrary] = useState([]);
  const [team, setTeam] = useState([]);
  const [items] = useState(['Leftovers', 'Life Orb', 'Choice Scarf', 'Choice Band', 'Choice Specs', 'Focus Sash', 'Assault Vest', 'Rocky Helmet', 'Sitrus Berry', 'Eviolite']);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [activeItemSlot, setActiveItemSlot] = useState(null);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=500')
      .then(res => res.json())
      .then(data => {
        const formatted = data.results.map((p) => ({ ...p, id: p.url.split('/')[6] }));
        setPokemonLibrary(formatted);
      });
  }, []);

  const addPokemon = async (pokemon) => {
    if (team.length >= 6) return;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
    const data = await res.json();
    
    const baseStats = {};
    data.stats.forEach(s => baseStats[s.stat.name] = s.base_stat);

    setTeam([...team, {
      uid: Date.now(),
      name: data.name,
      sprite: data.sprites.front_default,
      shinySprite: data.sprites.front_shiny,
      isShiny: false,
      heldItem: "None",
      baseStats: baseStats,
      moves: data.moves.map(m => m.move.name),
      selectedMoves: ["", "", "", ""],
      ivStats: { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 },
      totalIv: 0
    }]);
  };

  const updateIv = (tIdx, stat, val) => {
    const newTeam = [...team];
    const mon = newTeam[tIdx];
    const currentTotal = Object.values(mon.ivStats).reduce((a, b) => a + b, 0) - mon.ivStats[stat];
    const v = Math.min(32, Math.max(0, parseInt(val) || 0));
    if (currentTotal + v <= 66) {
      mon.ivStats[stat] = v;
      mon.totalIv = currentTotal + v;
      setTeam(newTeam);
    }
  };

  const updateItem = (itemName) => {
    const newTeam = [...team];
    newTeam[activeItemSlot].heldItem = itemName;
    setTeam(newTeam);
    setActiveItemSlot(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      <h1 className="text-2xl font-black text-yellow-400 mb-6 text-center">Team Builder Pro</h1>
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Tim */}
        <div className="space-y-4">
          {team.map((mon, idx) => (
            <div key={mon.uid} className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-[11px]">
              <div className="flex items-center gap-3 mb-3">
                <img src={mon.isShiny ? mon.shinySprite : mon.sprite} className="w-12 h-12 bg-slate-800 rounded" alt={mon.name} />
                <div className="flex-grow">
                  <span className="capitalize font-bold text-yellow-400">{mon.name}</span>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => {const t=[...team]; t[idx].isShiny=!t[idx].isShiny; setTeam(t)}} className="p-1 rounded bg-slate-700"><Sparkles size={12}/></button>
                    <button onClick={() => setActiveItemSlot(idx)} className="p-1 rounded bg-slate-700 flex items-center gap-1"><Briefcase size={12}/> {mon.heldItem}</button>
                  </div>
                </div>
                <button onClick={() => setTeam(team.filter((_, i) => i !== idx))}><Trash2 size={16} className="text-red-500"/></button>
              </div>

              {/* IV & Real-time Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.keys(mon.ivStats).map(s => (
                  <div key={s} className="flex items-center justify-between bg-slate-800 p-1 rounded px-2">
                    <span className="uppercase">{s.substring(0,3)}</span>
                    <input type="number" value={mon.ivStats[s]} onChange={(e) => updateIv(idx, s, e.target.value)} className="w-6 bg-transparent text-center"/>
                    <span className="text-emerald-400 font-bold">{(mon.baseStats[s] + mon.ivStats[s])}</span>
                  </div>
                ))}
              </div>

              {/* Moves */}
              <div className="grid grid-cols-2 gap-1">
                {mon.selectedMoves.map((m, mIdx) => (
                  <select key={mIdx} className="bg-slate-800 p-1 rounded capitalize" onChange={(e) => {
                      const t = [...team]; t[idx].selectedMoves[mIdx] = e.target.value; setTeam(t);
                  }}>
                    <option value="">Move {mIdx + 1}</option>
                    {mon.moves.map(mv => <option key={mv} value={mv}>{mv}</option>)}
                  </select>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Library */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 h-[600px] flex flex-col">
          <input placeholder="Cari Pokémon..." className="w-full bg-slate-800 p-2 rounded text-sm mb-3" onChange={(e) => setSearchTerm(e.target.value)}/>
          <div className="overflow-y-auto grid grid-cols-4 gap-2">
            {pokemonLibrary.filter(p => p.name.includes(searchTerm)).map((p) => (
              <button key={p.id} onClick={() => addPokemon(p)} className="flex flex-col items-center bg-slate-800 p-1 rounded hover:bg-yellow-600">
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} className="w-10 h-10" alt={p.name}/>
                <span className="text-[9px] capitalize truncate w-full text-center">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Item */}
      {activeItemSlot !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-sm border border-slate-700">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">Pilih Held Item</h2>
              <button onClick={() => setActiveItemSlot(null)}><X size={20}/></button>
            </div>
            <div className="h-48 overflow-y-auto space-y-2">
              {items.map(item => (
                <button key={item} onClick={() => updateItem(item)} className="block w-full text-left p-2 hover:bg-slate-700 rounded text-sm">{item}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```
