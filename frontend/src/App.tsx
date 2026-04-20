import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { TradingChart } from './components/TradingChart';
import { Activity, Shield, TrendingUp, Power, LayoutGrid, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [activeSymbol, setActiveSymbol] = useState('NIFTY-I');
  const [isAutoTrade, setIsAutoTrade] = useState(false);

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 glass p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#a3e635] text-black rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vortex AutoTrade</h1>
            <p className="text-sm text-[#a0a0a0]">Angel One SmartAPI Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
            <Activity size={16} className="text-[#a3e635]" />
            SmartStream: Connected
          </div>
          <button 
            onClick={() => setIsAutoTrade(!isAutoTrade)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all ${
              isAutoTrade ? 'bg-[#ef4444] text-white shadow-lg shadow-red-900/20' : 'bg-[#a3e635] text-black shadow-lg shadow-lime-900/20'
            }`}
          >
            <Power size={18} />
            {isAutoTrade ? 'Stop Auto-Trade' : 'Start Auto-Trade'}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        {/* Watchlist / Monitor */}
        <section className="col-span-3 flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold px-2">
            <LayoutGrid size={20} />
            Monitor
          </h2>
          {['NIFTY-I', 'BANKNIFTY-I', 'RELIANCE', 'HDFCBANK'].map((symbol) => (
            <motion.div 
              whileHover={{ x: 5 }}
              key={symbol}
              onClick={() => setActiveSymbol(symbol)}
              className={`glass p-4 cursor-pointer transition-all ${activeSymbol === symbol ? 'border-[#a3e635]' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold">{symbol}</span>
                <span className="text-[#a3e635] text-sm">+0.42%</span>
              </div>
              <div className="text-xl font-mono">22,345.60</div>
            </motion.div>
          ))}
        </section>

        {/* Trade Center */}
        <section className="col-span-9 flex flex-col gap-6">
          <TradingChart data={[]} trailData={[]} />
          
          <div className="grid grid-cols-2 gap-6">
            {/* Manual Execution */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[#a3e635]" />
                Manual Execution
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-[#a3e635] text-black p-4 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                  BUY (Market)
                </button>
                <button className="bg-[#ef4444] text-white p-4 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                  SELL (Market)
                </button>
                <button className="col-span-2 bg-[#1a1a1a] border border-white/5 p-4 rounded-xl font-bold hover:bg-[#252525] transition-colors">
                  EXIT ALL POSITIONS
                </button>
              </div>
            </div>

            {/* Signal Log */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Terminal size={20} className="text-[#a3e635]" />
                System Logs
              </h3>
              <div className="bg-black/40 rounded-lg p-4 font-mono text-sm h-[134px] overflow-y-auto text-[#a0a0a0]">
                <div>[21:34:01] Token NIFTY-I Subscribed</div>
                <div>[21:35:05] ATI Calculation Started</div>
                <div className="text-[#a3e635]">[21:35:10] BUY Signal Generated - NIFTY-I @ 22,340</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
