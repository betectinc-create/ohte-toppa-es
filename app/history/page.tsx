'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, ArrowLeft, Calendar, Copy, X } from 'lucide-react';

interface SavedES {
  id: string;
  company: string;
  generation_type: string;
  question: string;
  generated_text: string;
  word_count: number;
  created_at: string;
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [savedESList, setSavedESList] = useState<SavedES[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedES, setSelectedES] = useState<SavedES | null>(null);

  useEffect(() => {
    if (isLoaded && !user) { router.push('/'); return; }
    if (user) fetchSavedES();
  }, [user, isLoaded]);

  const fetchSavedES = async () => {
    try {
      const { data, error } = await supabase.from('user_es').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      setSavedESList(data || []);
    } catch (error) { console.error('Error:', error); alert('データの取得に失敗しました'); }
    finally { setIsLoading(false); }
  };

  const deleteES = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const { error } = await supabase.from('user_es').delete().eq('id', id);
      if (error) throw error;
      alert('削除しました');
      setSavedESList(savedESList.filter(es => es.id !== id));
      setSelectedES(null);
    } catch (error) { console.error('Error:', error); alert('削除に失敗しました'); }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); alert('コピーしました！'); };

  const typeLabel = (t: string) => t === 'es' ? 'ES' : t === 'motivation' ? '志望動機' : 'ガクチカ';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent" />
          <span className="text-lg">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">保存したES</h1>
            <p className="text-xs md:text-sm text-gray-500">全 {savedESList.length} 件</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        {savedESList.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">保存したESがありません</p>
            <p className="text-gray-400 text-sm mb-6">ESを生成して保存すると、ここに表示されます</p>
            <button onClick={() => router.push('/')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-semibold transition-colors shadow-sm">
              ESを作成する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* 一覧 */}
            <div className="space-y-3 md:space-y-4">
              {savedESList.map((es) => (
                <div key={es.id} onClick={() => setSelectedES(es)}
                  className={`p-4 md:p-5 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedES?.id === es.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                  }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 truncate">{es.company}</h3>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(es.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteES(es.id); }}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-400 hover:text-red-500" />
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{es.question}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{typeLabel(es.generation_type)}</span>
                    <span className="text-[10px] md:text-xs text-gray-400">{es.word_count}字</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 詳細 - PC */}
            {selectedES && (
              <div className="hidden lg:block">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm sticky top-20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{selectedES.company}</h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">{typeLabel(selectedES.generation_type)}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">設問:</div>
                      <div className="text-gray-900 font-medium">{selectedES.question}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">回答:</div>
                      <div className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm leading-relaxed">
                        {selectedES.generated_text}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => copyToClipboard(selectedES.generated_text)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <Copy className="w-4 h-4" /> コピーする
                      </button>
                      <button onClick={() => deleteES(selectedES.id)}
                        className="py-3 px-4 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold transition-colors flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> 削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 詳細 - スマホモーダル */}
            {selectedES && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedES(null)}>
                <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 w-full sm:max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <h2 className="text-lg font-bold text-gray-900 truncate">{selectedES.company}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex-shrink-0">{typeLabel(selectedES.generation_type)}</span>
                    </div>
                    <button onClick={() => setSelectedES(null)} className="p-2 rounded-lg hover:bg-gray-100 flex-shrink-0">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">設問:</div>
                      <div className="text-sm text-gray-900 font-medium">{selectedES.question}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">回答:</div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed">
                        {selectedES.generated_text}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => copyToClipboard(selectedES.generated_text)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2">
                        <Copy className="w-4 h-4" /> コピー
                      </button>
                      <button onClick={() => deleteES(selectedES.id)}
                        className="py-2.5 px-4 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> 削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}