'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, ArrowLeft, Calendar } from 'lucide-react';

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
    if (isLoaded && !user) {
      router.push('/');
      return;
    }
    
    if (user) {
      fetchSavedES();
    }
  }, [user, isLoaded]);

  const fetchSavedES = async () => {
    try {
      const { data, error } = await supabase
        .from('user_es')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedESList(data || []);
    } catch (error) {
      console.error('Error:', error);
      alert('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteES = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('user_es')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('削除しました');
      setSavedESList(savedESList.filter(es => es.id !== id));
      setSelectedES(null);
    } catch (error) {
      console.error('Error:', error);
      alert('削除に失敗しました');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('コピーしました！');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">保存したES</h1>
            <p className="text-emerald-300">全 {savedESList.length} 件</p>
          </div>
        </div>

        {savedESList.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-white text-xl">保存したESがありません</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition-colors"
            >
              ESを作成する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 一覧 */}
            <div className="space-y-4">
              {savedESList.map((es) => (
                <div
                  key={es.id}
                  onClick={() => setSelectedES(es)}
                  className={`p-5 rounded-xl cursor-pointer transition-all ${
                    selectedES?.id === es.id
                      ? 'bg-emerald-600 ring-2 ring-emerald-400'
                      : 'bg-slate-800/80 hover:bg-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{es.company}</h3>
                      <div className="flex items-center gap-2 text-sm text-emerald-300">
                        <Calendar className="w-4 h-4" />
                        {new Date(es.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteES(es.id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{es.question}</p>
                  <div className="mt-2 text-xs text-emerald-400">
                    {es.word_count}字 • {es.generation_type === 'es' ? 'ES' : es.generation_type === 'motivation' ? '志望動機' : 'ガクチカ'}
                  </div>
                </div>
              ))}
            </div>

            {/* 詳細 */}
            {selectedES && (
              <div className="bg-slate-800/80 rounded-xl p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedES.company}</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-emerald-400 mb-1">設問:</div>
                    <div className="text-white">{selectedES.question}</div>
                  </div>
                  <div>
                    <div className="text-sm text-emerald-400 mb-1">回答:</div>
                    <div className="text-white whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
                      {selectedES.generated_text}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedES.generated_text)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    コピーする
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}