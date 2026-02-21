'use client';
import { supabase } from './utils/supabase';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useState } from 'react';
import { Shield, Sparkles, Crown, Users, Building, CheckCircle, Copy, X, FileText, Target, Award, Building2, Star, Edit2, Plus, Trash2, Sun, Moon } from 'lucide-react';

type GenerationType = 'es' | 'motivation' | 'gakuchika';
type SelectionType = 'job' | 'intern';
type Theme = 'dark' | 'light';

interface Company {
  name: string;
  hasData: boolean;
  industry: string;
  values?: string[];
  commonQuestions?: string[];
}

const COMPANY_LIST: Company[] = [
  // 総合商社
  { name: '三菱商事', hasData: true, industry: '総合商社', values: ['構想力', '実行力', '変革力'], commonQuestions: ['学生時代に力を入れたこと', 'なぜ商社か'] },
  { name: '三井物産', hasData: true, industry: '総合商社', values: ['挑戦心', '多様性', '仲間'], commonQuestions: ['困難を乗り越えた経験', '10年後のビジョン'] },
  { name: '伊藤忠商事', hasData: true, industry: '総合商社', values: ['ひとりの商人', '三方よし'], commonQuestions: ['チームで成果を出した経験', '強みと弱み'] },
  { name: '住友商事', hasData: true, industry: '総合商社', values: ['誠実', '信用', '革新'], commonQuestions: ['価値観を形成した経験', 'リーダーシップ経験'] },
  { name: '丸紅', hasData: true, industry: '総合商社', values: ['正・新・和', 'フェアプレイ'], commonQuestions: ['失敗から学んだこと', '周囲を巻き込んだ経験'] },
  
  // 金融
  { name: '三菱UFJ銀行', hasData: true, industry: 'メガバンク', values: ['信頼', '誠実', '変革'], commonQuestions: ['志望動機', '銀行でやりたいこと'] },
  { name: '三井住友銀行', hasData: true, industry: 'メガバンク', values: ['顧客本位', 'プロ意識'], commonQuestions: ['困難を乗り越えた経験', 'なぜ銀行か'] },
  { name: 'みずほ銀行', hasData: true, industry: 'メガバンク', values: ['お客さま第一', 'チーム力'], commonQuestions: ['学生時代の取り組み', '強み'] },
  { name: '野村證券', hasData: true, industry: '証券', values: ['進取の精神', '誠実'], commonQuestions: ['証券会社を選んだ理由', 'チャレンジした経験'] },
  { name: '大和証券', hasData: true, industry: '証券', values: ['信頼', '情熱'], commonQuestions: ['志望動機', '自己PR'] },
  { name: 'SMBC日興証券', hasData: true, industry: '証券', values: ['誠実', '革新'], commonQuestions: ['強み', 'なぜ証券'] },
  { name: '東京海上日動', hasData: true, industry: '保険', values: ['挑戦', '協働'], commonQuestions: ['困難を乗り越えた経験', 'チームワーク'] },
  { name: '日本生命', hasData: true, industry: '保険', values: ['相互扶助', '共存共栄'], commonQuestions: ['学生時代の経験', '10年後'] },
  { name: '第一生命', hasData: true, industry: '保険', values: ['お客さま第一', '社会貢献'], commonQuestions: ['志望動機', '強み'] },
  { name: '三井住友海上', hasData: true, industry: '保険', values: ['プロフェッショナル'], commonQuestions: ['リーダーシップ経験', '志望理由'] },
  
  // 自動車
  { name: 'トヨタ自動車', hasData: true, industry: '自動車', values: ['人間力', '実行力', '謙虚さ'], commonQuestions: ['学生時代に最も力を入れたこと', 'チームで成果を出した経験'] },
  { name: 'ホンダ', hasData: true, industry: '自動車', values: ['挑戦', '尊重', '共創'], commonQuestions: ['困難を乗り越えた経験', 'チャレンジした経験'] },
  { name: '日産自動車', hasData: true, industry: '自動車', values: ['情熱', '革新'], commonQuestions: ['強み', '志望動機'] },
  { name: 'デンソー', hasData: true, industry: '自動車部品', values: ['先進', '信頼'], commonQuestions: ['学生時代の取り組み', 'ものづくりへの思い'] },
  { name: '豊田自動織機', hasData: true, industry: '自動車部品', values: ['創造', '貢献'], commonQuestions: ['チームワーク経験', '強み'] },
  
  // 電機
  { name: 'ソニー', hasData: true, industry: '電機', values: ['クリエイティビティ', '技術'], commonQuestions: ['なぜソニーか', 'やりたいこと'] },
  { name: 'パナソニック', hasData: true, industry: '電機', values: ['くらしアップデート'], commonQuestions: ['志望動機', 'チャレンジ経験'] },
  { name: '日立製作所', hasData: true, industry: '電機', values: ['誠', '和', '開拓者精神'], commonQuestions: ['困難を乗り越えた経験', '強み'] },
  { name: '東芝', hasData: true, industry: '電機', values: ['誠実', '創造'], commonQuestions: ['学生時代の取り組み', '志望理由'] },
  { name: '三菱電機', hasData: true, industry: '電機', values: ['技術', '信頼'], commonQuestions: ['チームで成果を出した経験', '強み'] },
  { name: '富士通', hasData: true, industry: '電機', values: ['イノベーション'], commonQuestions: ['なぜIT', 'やりたいこと'] },
  { name: 'NEC', hasData: true, industry: '電機', values: ['誠実', '変革'], commonQuestions: ['志望動機', 'チャレンジした経験'] },
  { name: 'キヤノン', hasData: true, industry: '電機', values: ['進取の気性', '共生'], commonQuestions: ['学生時代の経験', '強み'] },
  
  // IT・通信
  { name: 'NTTデータ', hasData: true, industry: 'IT', values: ['考え抜く力', 'チーム力'], commonQuestions: ['なぜIT', '困難を乗り越えた経験'] },
  { name: 'NTT', hasData: true, industry: '通信', values: ['挑戦', '誠実'], commonQuestions: ['志望動機', 'やりたいこと'] },
  { name: 'KDDI', hasData: true, industry: '通信', values: ['挑戦', '創造'], commonQuestions: ['チャレンジした経験', '強み'] },
  { name: 'ソフトバンク', hasData: true, industry: '通信', values: ['挑戦', '成長'], commonQuestions: ['なぜソフトバンク', '10年後'] },
  { name: '楽天', hasData: true, industry: 'IT', values: ['革新', 'スピード'], commonQuestions: ['チャレンジ経験', '強み'] },
  { name: 'サイバーエージェント', hasData: true, industry: 'IT', values: ['挑戦', '成長'], commonQuestions: ['なぜIT', 'やりたいこと'] },
  { name: 'リクルート', hasData: true, industry: 'IT', values: ['圧倒的当事者意識'], commonQuestions: ['主体的に動いた経験', '強み'] },
  { name: 'ヤフー', hasData: true, industry: 'IT', values: ['課題解決', '爆速'], commonQuestions: ['なぜIT', 'チャレンジ経験'] },
  
  // 食品・消費財
  { name: 'サントリー', hasData: true, industry: '食品', values: ['やってみなはれ', '利益三分主義'], commonQuestions: ['チャレンジした経験', '志望動機'] },
  { name: 'アサヒビール', hasData: true, industry: '食品', values: ['挑戦', '誠実'], commonQuestions: ['困難を乗り越えた経験', 'なぜ食品'] },
  { name: 'キリン', hasData: true, industry: '食品', values: ['熱意・誠意・多様性'], commonQuestions: ['チームで成果を出した経験', '強み'] },
  { name: '味の素', hasData: true, industry: '食品', values: ['新価値創造', 'おいしさ'], commonQuestions: ['志望動機', 'やりたいこと'] },
  { name: '明治', hasData: true, industry: '食品', values: ['健康', '安心'], commonQuestions: ['学生時代の経験', '強み'] },
  { name: '花王', hasData: true, industry: '消費財', values: ['よきモノづくり'], commonQuestions: ['志望動機', 'チャレンジ経験'] },
  { name: '資生堂', hasData: true, industry: '消費財', values: ['美', '革新'], commonQuestions: ['なぜ化粧品', '強み'] },
  
  // その他大手
  { name: 'JR東日本', hasData: true, industry: '鉄道', values: ['安全', '顧客満足'], commonQuestions: ['なぜ鉄道', '志望動機'] },
  { name: 'JR東海', hasData: true, industry: '鉄道', values: ['安全', '正確'], commonQuestions: ['学生時代の経験', '強み'] },
  { name: 'ANA', hasData: true, industry: '航空', values: ['安全', 'お客さま視点'], commonQuestions: ['なぜ航空', 'チームワーク経験'] },
  { name: 'JAL', hasData: true, industry: '航空', values: ['安全', 'サービス'], commonQuestions: ['困難を乗り越えた経験', '志望動機'] },
  { name: '任天堂', hasData: true, industry: 'ゲーム', values: ['独創性', '柔軟性'], commonQuestions: ['なぜゲーム', 'やりたいこと'] },
  { name: 'キーエンス', hasData: true, industry: '精密機器', values: ['付加価値', 'スピード'], commonQuestions: ['営業への考え', '強み'] },
  { name: '東京ガス', hasData: true, industry: 'エネルギー', values: ['挑戦', '誠実'], commonQuestions: ['なぜインフラ', '志望動機'] },
];

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const { user } = useUser();
  const [credits, setCredits] = useState(5);
  const [generationType, setGenerationType] = useState<GenerationType>('es');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [generatedES, setGeneratedES] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showValuesEdit, setShowValuesEdit] = useState(false);
  const [customValues, setCustomValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [useOptimization, setUseOptimization] = useState(true);
  
  const [formData, setFormData] = useState({
    selectionType: 'job' as SelectionType,
    question: '',
    wordCount: 400,
    episode: '',
  });
const checkPremium = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  };


  const saveES = async () => {
    if (!user) {
      alert('ログインしてください');
      return;
    }

    try {
      const { count, error: countError } = await supabase
        .from('user_es')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      const isPremium = await checkPremium(user.id);

      if (!isPremium && (count ?? 0) >= 5) {
        alert('無料プランは5個まで保存できます。\nプレミアムプランで無制限に保存しましょう！');
        return;
      }

      const { error } = await supabase
        .from('user_es')
        .insert({
          user_id: user.id,
          company: companyInput,
          generation_type: generationType,
          question: formData.question,
          episode: formData.episode,
          generated_text: generatedES,
          word_count: formData.wordCount,
        });


     if (error) throw error;

      if (isPremium) {
        alert('ESを保存しました！（プレミアムプラン）');
      } else {
        alert(`ESを保存しました！（残り${4 - (count ?? 0)}個保存可能）`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('保存に失敗しました');
    }
  };
  const handleUpgrade = async () => {
    if (!user) {
      alert('ログインしてください');
      return;
    }

    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const { url } = await response.json();

if (url) {
  window.location.href = url;
}
    } catch (error) {
      console.error('Error:', error);
      alert('アップグレードに失敗しました');
    }
  };
  const wordCounts = Array.from({ length: 15 }, (_, i) => 100 + i * 50);

  const colors = theme === 'dark' ? {
    bg: 'linear-gradient(135deg, #0a1f15 0%, #0d2b1e 50%, #0f3626 100%)',
    headerBg: 'linear-gradient(to bottom, rgba(5, 20, 15, 0.98), rgba(10, 30, 20, 0.95))',
    cardBg: 'linear-gradient(135deg, rgba(15, 50, 35, 0.8) 0%, rgba(10, 40, 30, 0.7) 100%)',
    inputBg: 'bg-slate-900/80',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-200',
    textTertiary: 'text-emerald-300',
    border: 'rgba(16, 185, 129, 0.4)',
  } : {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
    headerBg: 'linear-gradient(to bottom, rgba(240, 253, 244, 0.98), rgba(220, 252, 231, 0.95))',
    cardBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.9) 100%)',
    inputBg: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textTertiary: 'text-emerald-700',
    border: 'rgba(16, 185, 129, 0.3)',
  };

  const handleGenerationTypeChange = (type: GenerationType) => {
    setGenerationType(type);
    
    let defaultQuestion = '';
    if (type === 'motivation') {
      defaultQuestion = 'なぜ当社を志望しますか？';
    } else if (type === 'gakuchika') {
      defaultQuestion = '学生時代に最も力を入れたことを教えてください';
    } else {
      defaultQuestion = '';
    }
    
    setFormData({...formData, question: defaultQuestion});
  };

  const filteredCompanies = companyInput.length > 0
    ? COMPANY_LIST.filter(c => c.name.includes(companyInput))
    : [];

  const handleCompanySelect = (company: Company) => {
    setCompanyInput(company.name);
    setSelectedCompany(company);
    setShowSuggestions(false);
    setCustomValues(company.values || []);
    setUseOptimization(true);
  };

  const handleCompanyInputChange = (value: string) => {
    setCompanyInput(value);
    setShowSuggestions(value.length > 0);
    
    const exactMatch = COMPANY_LIST.find(c => c.name === value);
    setSelectedCompany(exactMatch || null);
    if (exactMatch) {
      setCustomValues(exactMatch.values || []);
      setUseOptimization(true);
    } else {
      setCustomValues([]);
      if (value) {
        setUseOptimization(true);
      }
    }
  };

  const addCustomValue = () => {
    if (newValue.trim()) {
      setCustomValues([...customValues, newValue.trim()]);
      setNewValue('');
    }
  };

  const removeValue = (index: number) => {
    setCustomValues(customValues.filter((_, i) => i !== index));
  };

  const generateContent = async () => {
    if (credits === 0) {
      alert('無料枠を使い切りました。プレミアムプランまたは友達紹介をご利用ください。');
      return;
    }

    if (!companyInput || !formData.question || !formData.episode) {
      alert('必須項目を全て入力してください');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: companyInput,
          values: useOptimization ? customValues : [],
          question: formData.question,
          episode: formData.episode,
          wordCount: formData.wordCount,
          selectionType: formData.selectionType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedES(data.text);
        setCredits(credits - 1);
        setShowResult(true);
      } else {
        alert('ES生成に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedES);
    alert('コピーしました！');
  };

  return (
    <div className="min-h-screen transition-all duration-300" style={{
      background: colors.bg
    }}>
      {/* ===== ヘッダー ===== */}
      <header className={`border-b transition-all duration-300 ${theme === 'dark' ? 'border-emerald-500/20' : 'border-emerald-300/30'}`} style={{
        background: colors.headerBg,
        backdropFilter: 'blur(20px)'
      }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">

          {/* === モバイル版ヘッダー (md未満) === */}
          <div className="md:hidden">
            {/* 1行目: ロゴ + 右アイコン */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-7 h-7 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                <h1 className="text-lg font-bold" style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  大手突破ES
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all">
                      ログイン
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/history">
                    <button className={`p-2 rounded-lg transition-all ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </button>
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-800 text-amber-400' : 'bg-white text-indigo-600 border border-gray-200'}`}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* 2行目: アップグレード + 残り回数 */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <SignedIn>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold transition-all flex items-center gap-2"
                  style={{ boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)' }}
                >
                  <Crown className="w-4 h-4" />
                  <span className="text-sm">アップグレード</span>
                </button>
              </SignedIn>
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${
                theme === 'dark' ? 'bg-emerald-900/40 border border-emerald-500/20' : 'bg-emerald-100 border border-emerald-200'
              }`}>
                <span className={`text-xs ${colors.textSecondary}`}>無料</span>
                <span className="text-emerald-500 font-bold text-sm">残{credits}回</span>
              </div>
            </div>
          </div>

          {/* === PC版ヘッダー (md以上) === */}
          <div className="hidden md:flex items-center gap-4">
            {/* ロゴ */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Shield className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
              <div>
                <h1 className="text-2xl font-bold" style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  大手突破ES
                </h1>
                <p className={`text-xs opacity-80 ${colors.textTertiary}`}>
                  AIで、大手の壁を突破する
                </p>
              </div>
            </div>

            {/* アップグレード + 残り回数 */}
            <SignedIn>
              <button
                onClick={handleUpgrade}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold transition-all hover:scale-105 flex items-center gap-2"
                style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
              >
                <Crown className="w-5 h-5" />
                <span>アップグレード</span>
              </button>
            </SignedIn>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
              theme === 'dark' ? 'bg-emerald-900/40 border border-emerald-500/20' : 'bg-emerald-100 border border-emerald-200'
            }`}>
              <span className={`text-sm ${colors.textSecondary}`}>無料プラン</span>
              <span className="text-emerald-500 font-bold">残り {credits} 回</span>
            </div>

            {/* 右寄せスペーサー */}
            <div className="flex-1" />

            {/* ナビ */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all">
                    ログイン
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/history">
                  <button className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                  }`}>
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-semibold">履歴</span>
                  </button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2.5 rounded-lg transition-all hover:scale-110 ${theme === 'dark' ? 'bg-slate-800 text-amber-400' : 'bg-white text-indigo-600 border border-gray-200'}`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* 生成タイプ選択（スマホでも横3列） */}
            <div className={`rounded-2xl p-4 md:p-6 border transition-all duration-300`} style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              borderColor: colors.border,
            }}>
              <h2 className={`text-base md:text-xl font-bold mb-3 md:mb-4 ${colors.textPrimary}`}>何を作りますか？</h2>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[
                  { type: 'es' as GenerationType, icon: FileText, label: 'ES生成' },
                  { type: 'motivation' as GenerationType, icon: Target, label: '志望動機' },
                  { type: 'gakuchika' as GenerationType, icon: Award, label: 'ガクチカ' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => handleGenerationTypeChange(type)}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                      generationType === type ? 'border-emerald-400' : `${theme === 'dark' ? 'border-emerald-700/30' : 'border-emerald-300/40'}`
                    }`}
                    style={{
                      background: generationType === type 
                        ? 'rgba(16, 185, 129, 0.2)' 
                        : theme === 'dark' ? 'rgba(6, 78, 59, 0.3)' : 'rgba(220, 252, 231, 0.5)'
                    }}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-400 mx-auto mb-1 md:mb-2" />
                    <div className={`font-semibold text-xs sm:text-sm md:text-base ${colors.textPrimary}`}>{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 入力フォーム */}
            <div className={`rounded-2xl p-4 md:p-8 border transition-all duration-300`} style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              borderColor: colors.border,
              boxShadow: theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-400 flex-shrink-0" />
                <h2 className={`text-base sm:text-lg md:text-2xl font-bold ${colors.textPrimary} truncate`}>
                  {companyInput ? `${companyInput}用${generationType === 'es' ? 'ES' : generationType === 'motivation' ? '志望動機' : 'ガクチカ'}作成` : 'どの企業のESを作りますか？'}
                </h2>
              </div>
              
              {companyInput && (
                <p className={`text-xs sm:text-sm mb-4 md:mb-6 ${colors.textTertiary}`}>
                  ✨ {companyInput}に最適化したESを生成します
                </p>
              )}

              <div className="space-y-4 md:space-y-5">
                {/* 企業名 */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textSecondary}`}>
                    企業名 <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyInput}
                      onChange={(e) => handleCompanyInputChange(e.target.value)}
                      onFocus={() => setShowSuggestions(companyInput.length > 0)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base ${colors.inputBg} ${colors.textPrimary} placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                      placeholder="企業名を検索・選択..."
                      style={{ borderColor: colors.border }}
                    />
                    
                    {showSuggestions && filteredCompanies.length > 0 && (
                      <div className={`absolute z-10 w-full mt-2 rounded-xl border max-h-60 overflow-y-auto ${theme === 'dark' ? 'bg-emerald-900' : 'bg-white'}`}
                        style={{ borderColor: colors.border }}>
                        {filteredCompanies.map((company) => (
                          <button
                            key={company.name}
                            onClick={() => handleCompanySelect(company)}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors border-b last:border-b-0 ${
                              theme === 'dark' ? 'hover:bg-emerald-800/50 border-emerald-700/30' : 'hover:bg-emerald-50 border-emerald-200/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {company.hasData && <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm sm:text-base ${colors.textPrimary}`}>{company.name}</div>
                                <div className={`text-xs ${colors.textTertiary}`}>{company.industry}</div>
                              </div>
                              {company.hasData && (
                                <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${theme === 'dark' ? 'text-emerald-300 bg-emerald-800/50' : 'text-emerald-700 bg-emerald-100'}`}>
                                  データあり
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`mt-2 flex items-center gap-2 text-xs ${colors.textTertiary}`}>
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span>現在50社のデータあり • 企業は随時追加中！</span>
                  </div>

                  {/* 企業データ表示・編集 */}
                  {selectedCompany && selectedCompany.hasData && (
                    <div 
                      className="mt-3 p-3 sm:p-5 rounded-xl border-2 relative transition-all duration-300"
                      style={{
                        background: theme === 'dark' 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.08) 100%)',
                        borderColor: '#10b981',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
                        opacity: useOptimization ? 1 : 0.6,
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                          <span className={`font-bold text-base sm:text-lg ${colors.textPrimary}`}>{selectedCompany.name}</span>
                          <span className="text-[10px] sm:text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 sm:py-1 rounded">
                            ⚡ 企業データあり
                          </span>
                        </div>

                        {/* チェックボックス */}
                        <div 
                          className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                          onClick={() => setUseOptimization(!useOptimization)}
                          style={{
                            background: theme === 'dark' ? 'rgba(6, 78, 59, 0.5)' : 'rgba(220, 252, 231, 0.7)',
                            border: `2px solid ${useOptimization ? '#10b981' : 'rgba(156, 163, 175, 0.5)'}`,
                            boxShadow: useOptimization ? '0 2px 12px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center transition-all border-2 ${
                              useOptimization 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : 'bg-transparent border-gray-400'
                            }`}>
                              {useOptimization && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold ${colors.textPrimary} text-xs sm:text-sm mb-1 flex items-center gap-1 sm:gap-2 flex-wrap`}>
                                <span>企業の価値観で最適化</span>
                                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                  切り替え
                                </span>
                              </div>
                              <div className={`text-[10px] sm:text-xs ${colors.textSecondary}`}>
                                {useOptimization 
                                  ? '✓ 企業が求める人物像を反映した内容で生成します' 
                                  : '汎用的な内容で生成します（企業データは参考表示のみ）'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className={`text-xs sm:text-sm font-semibold ${colors.textPrimary} ${!useOptimization && 'opacity-50'}`}>
                              💡 求める人物像{!useOptimization && '（参考）'}:
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowValuesEdit(!showValuesEdit);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-emerald-900/30 flex items-center gap-1"
                              disabled={!useOptimization}
                              style={{ opacity: useOptimization ? 1 : 0.5 }}
                            >
                              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm font-medium">編集</span>
                            </button>
                          </div>
                          
                          {showValuesEdit ? (
                            <div className="space-y-2">
                              {customValues.map((value, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <span className={`flex-1 text-xs sm:text-sm px-3 py-2 rounded-lg font-medium ${
                                    theme === 'dark' ? 'text-emerald-100 bg-emerald-800/40' : 'text-emerald-900 bg-emerald-100'
                                  }`}>
                                    {value}
                                  </span>
                                  <button
                                    onClick={() => removeValue(index)}
                                    className="text-red-400 hover:text-red-300 p-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newValue}
                                  onChange={(e) => setNewValue(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addCustomValue()}
                                  placeholder="追加する人物像..."
                                  className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg ${colors.inputBg} ${colors.textPrimary} border focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                                  style={{ borderColor: colors.border }}
                                />
                                <button
                                  onClick={addCustomValue}
                                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </button>
                              </div>
                              
                              <button
                                onClick={() => setShowValuesEdit(false)}
                                className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300"
                              >
                                完了
                              </button>
                            </div>
                          ) : (
                            <div className={`flex flex-wrap gap-1.5 sm:gap-2 transition-all ${!useOptimization && 'opacity-50'}`}>
                              {customValues.map((value, index) => (
                                <span 
                                  key={index} 
                                  className={`text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold ${
                                    theme === 'dark' ? 'text-emerald-100 bg-emerald-700/50' : 'text-emerald-900 bg-emerald-200'
                                  }`}
                                  style={{
                                    boxShadow: useOptimization ? '0 2px 10px rgba(16, 185, 129, 0.2)' : 'none'
                                  }}
                                >
                                  ✓ {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {selectedCompany.commonQuestions && (
                          <div className={`mt-3 sm:mt-4 text-xs sm:text-sm p-3 sm:p-4 rounded-lg transition-all ${!useOptimization && 'opacity-50'}`} style={{
                            background: theme === 'dark' 
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
                          }}>
                            <span className={`font-bold ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-900'}`}>📝 よく出る設問:</span>{' '}
                            <span className={theme === 'dark' ? 'text-emerald-100' : 'text-emerald-800'}>
                              {selectedCompany.commonQuestions.join(' / ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {companyInput && !selectedCompany && (
                    <div className={`mt-3 p-3 sm:p-5 rounded-xl border-2 transition-all duration-300`} style={{
                      background: theme === 'dark' 
                        ? 'linear-gradient(135deg, rgba(15, 50, 35, 0.6) 0%, rgba(10, 40, 30, 0.5) 100%)'
                        : 'linear-gradient(135deg, rgba(220, 252, 231, 0.7) 0%, rgba(187, 247, 208, 0.5) 100%)',
                      borderColor: colors.border,
                      opacity: useOptimization ? 1 : 0.6,
                    }}>
                      <div className="mb-3 sm:mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                        <span className={`font-bold ${colors.textPrimary}`}>{companyInput}</span>
                      </div>

                      {/* チェックボックス */}
                      <div 
                        className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                        onClick={() => setUseOptimization(!useOptimization)}
                        style={{
                          background: theme === 'dark' ? 'rgba(6, 78, 59, 0.5)' : 'rgba(220, 252, 231, 0.7)',
                          border: `2px solid ${useOptimization ? '#10b981' : 'rgba(156, 163, 175, 0.5)'}`,
                          boxShadow: useOptimization ? '0 2px 12px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center transition-all border-2 ${
                            useOptimization 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : 'bg-transparent border-gray-400'
                          }`}>
                            {useOptimization && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold ${colors.textPrimary} text-xs sm:text-sm mb-1 flex items-center gap-1 sm:gap-2 flex-wrap`}>
                              <span>入力した人物像で最適化</span>
                              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                切り替え
                              </span>
                            </div>
                            <div className={`text-[10px] sm:text-xs ${colors.textSecondary}`}>
                              {useOptimization 
                                ? '✓ 下記の人物像を反映した内容で生成します' 
                                : '汎用的な内容で生成します'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className={`text-xs sm:text-sm font-medium ${colors.textSecondary} ${!useOptimization && 'opacity-50'}`}>
                          💡 求める人物像を入力{!useOptimization && '（参考）'}:
                        </div>
                        
                        {customValues.map((value, index) => (
                          <div key={index} className={`flex items-center gap-2 transition-all ${!useOptimization && 'opacity-50'}`}>
                            <span className={`flex-1 text-xs sm:text-sm px-3 py-2 rounded ${
                              theme === 'dark' ? 'text-emerald-100 bg-emerald-800/30' : 'text-emerald-900 bg-emerald-100'
                            }`}>
                              {value}
                            </span>
                            <button
                              onClick={() => removeValue(index)}
                              className="text-red-400 hover:text-red-300"
                              disabled={!useOptimization}
                              style={{ opacity: useOptimization ? 1 : 0.5 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        <div className={`flex gap-2 ${!useOptimization && 'opacity-50'}`}>
                          <input
                            type="text"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCustomValue()}
                            placeholder="例: リーダーシップ、協調性..."
                            className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg ${colors.inputBg} ${colors.textPrimary} border focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                            style={{ borderColor: colors.border }}
                            disabled={!useOptimization}
                          />
                          <button
                            onClick={addCustomValue}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!useOptimization}
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 選考タイプ */}
                <div>
                  <label className={`block text-sm font-medium mb-2 sm:mb-3 ${colors.textSecondary}`}>
                    選考タイプ <span className="text-emerald-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { value: 'job' as SelectionType, label: '本選考' },
                      { value: 'intern' as SelectionType, label: 'インターンシップ' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setFormData({...formData, selectionType: value})}
                        className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all ${
                          formData.selectionType === value ? 'border-emerald-400' : `${theme === 'dark' ? 'border-emerald-700/30' : 'border-emerald-300/40'}`
                        }`}
                        style={{
                          background: formData.selectionType === value 
                            ? 'rgba(16, 185, 129, 0.2)' 
                            : theme === 'dark' ? 'rgba(6, 78, 59, 0.3)' : 'rgba(220, 252, 231, 0.3)'
                        }}
                      >
                        <div className={`font-semibold text-sm sm:text-base ${colors.textPrimary}`}>{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 設問 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${colors.textSecondary}`}>
                      設問 <span className="text-emerald-400">*</span>
                    </label>
                    {(generationType === 'motivation' || generationType === 'gakuchika') && (
                      <span className={`text-[10px] sm:text-xs px-2 py-1 rounded ${
                        theme === 'dark' ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-700 bg-emerald-200 font-medium'
                      }`}>
                        デフォルト設問・自由に編集可
                      </span>
                    )}
                  </div>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    rows={2}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base ${colors.inputBg} ${colors.textPrimary} placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none`}
                    placeholder="例: 学生時代に最も力を入れたことを教えてください"
                    style={{ borderColor: colors.border }}
                  />
                </div>

                {/* 文字数 */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textSecondary}`}>
                    文字数 <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={formData.wordCount}
                    onChange={(e) => setFormData({...formData, wordCount: Number(e.target.value)})}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base ${colors.inputBg} ${colors.textPrimary} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                    style={{ borderColor: colors.border }}
                  >
                    {wordCounts.map(count => (
                      <option key={count} value={count}>{count}字</option>
                    ))}
                  </select>
                </div>

                {/* エピソード */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.textSecondary}`}>
                    エピソード <span className="text-emerald-400">*</span>
                  </label>
                  <div className={`mb-2 p-2.5 sm:p-3 rounded-lg border ${
                    theme === 'dark' ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200/40'
                  }`}>
                    <div className={`text-[10px] sm:text-xs mb-1 ${colors.textSecondary}`}>💡 箇条書きで入力してください:</div>
                    <div className={`text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 ${colors.textTertiary}`}>
                      {generationType === 'motivation' ? (
                        <>
                          <div>• なぜこの業界・企業に興味を持ちましたか？</div>
                          <div>• どんな経験がきっかけですか？</div>
                          <div>• 企業のどこに魅力を感じますか？</div>
                          <div>• 入社後に何をしたいですか？</div>
                        </>
                      ) : generationType === 'gakuchika' ? (
                        <>
                          <div>• いつ、何に取り組みましたか？</div>
                          <div>• どんな困難・課題がありましたか？</div>
                          <div>• どう工夫・努力しましたか？</div>
                          <div>• 結果と学んだことは？</div>
                        </>
                      ) : (
                        <>
                          <div>• いつ、何をしましたか？</div>
                          <div>• どんな困難がありましたか？</div>
                          <div>• どう解決しましたか？</div>
                          <div>• 結果はどうでしたか？</div>
                        </>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={formData.episode}
                    onChange={(e) => setFormData({...formData, episode: e.target.value})}
                    rows={5}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base ${colors.inputBg} ${colors.textPrimary} placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none`}
                    placeholder={
                      generationType === 'motivation' 
                        ? "• 大学の授業で○○業界の可能性を知った\n• インターンシップで実際の仕事を体験\n• 御社の○○という理念に共感\n• ○○の分野で新しい価値を創造したい"
                        : generationType === 'gakuchika'
                        ? "• サークル代表として50人をまとめた\n• コロナで活動中止の危機\n• オンライン活動に切り替えた\n• 参加率80%を達成、チームワークを学んだ"
                        : "• サークル代表として50人をまとめた\n• コロナで活動中止の危機\n• オンライン活動に切り替え\n• 参加率80%を達成"
                    }
                    style={{ borderColor: colors.border }}
                  />
                </div>

                <button
                  onClick={generateContent}
                  disabled={isGenerating || credits === 0}
                  className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                    color: 'white'
                  }}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      {companyInput ? `${companyInput}用ESを生成中...` : 'AI生成中...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {companyInput ? `${companyInput}用ESを生成` : '生成する'} (残り{credits}回)
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-4 md:space-y-6">
            {credits === 0 && (
              <div className={`rounded-2xl p-4 md:p-6 border-2 transition-all duration-300`} style={{
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(254, 243, 199, 0.8) 0%, rgba(253, 230, 138, 0.6) 100%)',
                borderColor: 'rgba(251, 191, 36, 0.4)'
              }}>
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Users className="w-6 h-6 text-amber-500" />
                  <h3 className={`text-base sm:text-lg font-bold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>無料で続ける</h3>
                </div>
                <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${theme === 'dark' ? 'text-emerald-100' : 'text-gray-700'}`}>
                  友達を紹介すると、さらに5回無料で使えます！
                </p>
                <button
                  onClick={() => setShowReferral(true)}
                  className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)',
                    color: '#78350f'
                  }}
                >
                  友達を紹介する
                </button>
              </div>
            )}

            <div className={`rounded-2xl p-4 md:p-6 border-2 transition-all duration-300`} style={{
              background: colors.cardBg,
              borderColor: colors.border
            }}>
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                <h3 className={`text-base sm:text-lg font-bold ${colors.textPrimary}`}>プレミアム特典</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {['生成 無制限', '複数パターン生成', '詳細添削', '広告なし'].map((feature, i) => (
                  <li key={i} className={`flex items-center gap-2 text-xs sm:text-sm ${colors.textSecondary}`}>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center mb-3 sm:mb-4">
                <div className={`text-2xl sm:text-3xl font-bold mb-1 ${colors.textPrimary}`}>¥480</div>
                <div className={`text-xs sm:text-sm ${colors.textSecondary}`}>/月</div>
              </div>
              <button
                onClick={handleUpgrade}
                className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                  color: 'white'
                }}
              >
                今すぐアップグレード
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 生成結果モーダル */}
      {showResult && (
        <div className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto" onClick={() => setShowResult(false)}>
          <div className={`rounded-2xl p-4 sm:p-6 md:p-8 max-w-3xl w-full my-4 sm:my-8 transition-all duration-300`} style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.98) 0%, rgba(4, 120, 87, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 253, 244, 0.98) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 flex-shrink-0" />
                <h3 className={`text-lg sm:text-2xl md:text-3xl font-bold ${colors.textPrimary} truncate`}>
                  {companyInput}用ES 生成完了！
                </h3>
              </div>
              <button
                onClick={() => setShowResult(false)}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  theme === 'dark' ? 'hover:bg-emerald-800/50' : 'hover:bg-emerald-100'
                }`}
              >
                <X className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.textSecondary}`} />
              </button>
            </div>

            <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <span className={`px-2 sm:px-3 py-1 rounded-full ${
                theme === 'dark' ? 'bg-emerald-800/50 text-emerald-100' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {formData.selectionType === 'job' ? '本選考' : 'インターン'}
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 ${
                theme === 'dark' ? 'bg-emerald-800/50 text-emerald-100' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {selectedCompany?.hasData && <Star className="w-3 h-3 text-amber-400" />}
                {companyInput}
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full ${
                theme === 'dark' ? 'bg-emerald-800/50 text-emerald-100' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {generatedES.length}字 / {formData.wordCount}字
              </span>
              {customValues.length > 0 && (
                <span className={`px-2 sm:px-3 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-amber-800/50 text-amber-100' : 'bg-amber-100 text-amber-900'
                }`}>
                  {customValues.join(' • ')}
                </span>
              )}
            </div>

            <div className="mb-3 sm:mb-4">
              <div className={`text-xs sm:text-sm mb-1 sm:mb-2 ${colors.textSecondary}`}>設問:</div>
              <div className={`font-medium text-sm sm:text-base ${colors.textPrimary}`}>{formData.question}</div>
            </div>

            <div className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl border`} style={{
              background: theme === 'dark' ? 'rgba(6, 78, 59, 0.3)' : 'rgba(240, 253, 244, 0.5)',
              borderColor: colors.border
            }}>
              <div className={`whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${colors.textPrimary}`}>
                {generatedES}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
                onClick={saveES}
                className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                  color: 'white'
                }}
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                保存する
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                  color: 'white'
                }}
              >
                <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                コピーする
              </button>
              <button
                onClick={() => setShowResult(false)}
                className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-[1.02] border-2 ${
                  theme === 'dark' 
                    ? 'border-emerald-400/50 text-emerald-50 hover:bg-emerald-800/30'
                    : 'border-emerald-500/50 text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 紹介モーダル */}
      {showReferral && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50" onClick={() => setShowReferral(false)}>
          <div className={`rounded-2xl p-5 sm:p-8 max-w-md w-full transition-all duration-300`} style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(4, 120, 87, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.95) 100%)',
            border: `1px solid ${colors.border}`
          }} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${colors.textPrimary}`}>友達紹介で+5回</h3>
            <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${colors.textSecondary}`}>
              あなたの紹介リンクから友達が登録すると、両方に特典！
            </p>
            <div className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 ${
              theme === 'dark' ? 'bg-emerald-950/50' : 'bg-emerald-50'
            }`}>
              <div className={`text-xs sm:text-sm mb-2 ${colors.textSecondary}`}>あなたの紹介リンク:</div>
              <div className={`font-mono text-xs sm:text-sm break-all ${colors.textPrimary}`}>
                https://大手突破es.com/ref/DEMO123
              </div>
            </div>
            <div className="space-y-2 mb-4 sm:mb-6">
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${colors.textSecondary}`}>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                あなた: +5回無料
              </div>
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${colors.textSecondary}`}>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                友達: 8回無料で使える
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://大手突破es.com/ref/DEMO123');
                alert('リンクをコピーしました！');
              }}
              className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white'
              }}
            >
              リンクをコピー
            </button>
          </div>
        </div>
      )}
    </div>
  );
}