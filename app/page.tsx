'use client';
import { supabase } from './utils/supabase';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Shield, Sparkles, Crown, Users, CheckCircle, Copy, X, FileText, Target, Award, Building2, Star, Edit2, Plus, Trash2, Lock, MessageCircle, ExternalLink } from 'lucide-react';

type GenerationType = 'es' | 'motivation' | 'gakuchika' | 'review';
type SelectionType = 'job' | 'intern';

interface Company {
  name: string;
  hasData: boolean;
  industry: string;
  values?: string[];
  commonQuestions?: string[];
}

const COMMON_TRAITS = [
  'リーダーシップ', '主体性', '協調性', 'チャレンジ精神', '論理的思考力',
  'コミュニケーション力', '行動力', '粘り強さ', '柔軟性', '責任感',
  '誠実さ', 'グローバル志向', '創造力', '当事者意識', 'チームワーク',
];

const LINE_URL = 'https://lin.ee/vnanDoG';

const COMPANY_LIST: Company[] = [
  { name: '三菱商事', hasData: true, industry: '総合商社', values: ['構想力', '実行力', '変革力'], commonQuestions: ['学生時代に力を入れたこと', 'なぜ商社か'] },
  { name: '三井物産', hasData: true, industry: '総合商社', values: ['挑戦心', '多様性', '仲間'], commonQuestions: ['困難を乗り越えた経験', '10年後のビジョン'] },
  { name: '伊藤忠商事', hasData: true, industry: '総合商社', values: ['ひとりの商人', '三方よし'], commonQuestions: ['チームで成果を出した経験', '強みと弱み'] },
  { name: '住友商事', hasData: true, industry: '総合商社', values: ['誠実', '信用', '革新'], commonQuestions: ['価値観を形成した経験', 'リーダーシップ経験'] },
  { name: '丸紅', hasData: true, industry: '総合商社', values: ['正・新・和', 'フェアプレイ'], commonQuestions: ['失敗から学んだこと', '周囲を巻き込んだ経験'] },
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
  { name: 'トヨタ自動車', hasData: true, industry: '自動車', values: ['人間力', '実行力', '謙虚さ'], commonQuestions: ['学生時代に最も力を入れたこと', 'チームで成果を出した経験'] },
  { name: 'ホンダ', hasData: true, industry: '自動車', values: ['挑戦', '尊重', '共創'], commonQuestions: ['困難を乗り越えた経験', 'チャレンジした経験'] },
  { name: '日産自動車', hasData: true, industry: '自動車', values: ['情熱', '革新'], commonQuestions: ['強み', '志望動機'] },
  { name: 'デンソー', hasData: true, industry: '自動車部品', values: ['先進', '信頼'], commonQuestions: ['学生時代の取り組み', 'ものづくりへの思い'] },
  { name: '豊田自動織機', hasData: true, industry: '自動車部品', values: ['創造', '貢献'], commonQuestions: ['チームワーク経験', '強み'] },
  { name: 'ソニー', hasData: true, industry: '電機', values: ['クリエイティビティ', '技術'], commonQuestions: ['なぜソニーか', 'やりたいこと'] },
  { name: 'パナソニック', hasData: true, industry: '電機', values: ['くらしアップデート'], commonQuestions: ['志望動機', 'チャレンジ経験'] },
  { name: '日立製作所', hasData: true, industry: '電機', values: ['誠', '和', '開拓者精神'], commonQuestions: ['困難を乗り越えた経験', '強み'] },
  { name: '東芝', hasData: true, industry: '電機', values: ['誠実', '創造'], commonQuestions: ['学生時代の取り組み', '志望理由'] },
  { name: '三菱電機', hasData: true, industry: '電機', values: ['技術', '信頼'], commonQuestions: ['チームで成果を出した経験', '強み'] },
  { name: '富士通', hasData: true, industry: '電機', values: ['イノベーション'], commonQuestions: ['なぜIT', 'やりたいこと'] },
  { name: 'NEC', hasData: true, industry: '電機', values: ['誠実', '変革'], commonQuestions: ['志望動機', 'チャレンジした経験'] },
  { name: 'キヤノン', hasData: true, industry: '電機', values: ['進取の気性', '共生'], commonQuestions: ['学生時代の経験', '強み'] },
  { name: '任天堂', hasData: true, industry: 'ゲーム', values: ['独創性', '柔軟性'], commonQuestions: ['独自の発想で取り組んだ経験', '好奇心を持って取り組んだこと'] },
  { name: 'サイバーエージェント', hasData: true, industry: 'IT/Web', values: ['素直でいいやつ', '変化対応力'], commonQuestions: ['挫折経験', 'やりたいこと'] },
  { name: '楽天', hasData: true, industry: 'IT/Web', values: ['成功の5つのコンセプト', '仲間'], commonQuestions: ['何を成し遂げたいか', 'リーダーシップ経験'] },
  { name: 'DeNA', hasData: true, industry: 'IT/Web', values: ['デライト', '球の表面積'], commonQuestions: ['課題解決経験', '最も打ち込んだこと'] },
  { name: 'LINE', hasData: true, industry: 'IT/Web', values: ['ユーザーファースト', 'WOW'], commonQuestions: ['なぜLINEか', '技術的な挑戦'] },
  { name: 'メルカリ', hasData: true, industry: 'IT/Web', values: ['Go Bold', 'All for One', 'Be a Pro'], commonQuestions: ['大胆に挑戦した経験', 'チームで成果を出した経験'] },
  { name: 'NTTデータ', hasData: true, industry: 'IT/SIer', values: ['変革', 'クライアント志向'], commonQuestions: ['チームワーク', 'IT業界の志望理由'] },
  { name: '野村総合研究所', hasData: true, industry: 'コンサル/SI', values: ['プロフェッショナル', '変革'], commonQuestions: ['困難を乗り越えた経験', '将来のビジョン'] },
  { name: 'アクセンチュア', hasData: true, industry: 'コンサル', values: ['Think Straight, Talk Straight'], commonQuestions: ['リーダーシップ経験', '最も成長した経験'] },
  { name: 'マッキンゼー', hasData: true, industry: 'コンサル', values: ['リーダーシップ', 'インパクト'], commonQuestions: ['最も困難だった経験', 'なぜコンサルか'] },
  { name: 'BCG', hasData: true, industry: 'コンサル', values: ['知的好奇心', 'インパクト'], commonQuestions: ['チームで達成した経験', '自分の強み'] },
  { name: '電通', hasData: true, industry: '広告', values: ['挑戦', '創造'], commonQuestions: ['アイデアで課題を解決した経験', 'チームワーク'] },
  { name: '博報堂', hasData: true, industry: '広告', values: ['粒ぞろいより粒違い', '生活者発想'], commonQuestions: ['個性を発揮した経験', 'クリエイティブな挑戦'] },
  { name: '三菱地所', hasData: true, industry: '不動産', values: ['まちづくり', '挑戦'], commonQuestions: ['街に対する思い', 'チームで成し遂げた経験'] },
  { name: '三井不動産', hasData: true, industry: '不動産', values: ['経営と共創', '街づくり'], commonQuestions: ['困難な状況を打開した経験', '志望動機'] },
  { name: 'JR東日本', hasData: true, industry: '鉄道', values: ['安全', '地域密着'], commonQuestions: ['チームで取り組んだ経験', '社会貢献への想い'] },
  { name: 'JR東海', hasData: true, industry: '鉄道', values: ['日本の大動脈', '使命感'], commonQuestions: ['誇りを持って取り組んだこと', '困難を乗り越えた経験'] },
  { name: 'ANA', hasData: true, industry: '航空', values: ['挑戦', '思いやり'], commonQuestions: ['チームで目標を達成した経験', 'ホスピタリティ'] },
  { name: 'JAL', hasData: true, industry: '航空', values: ['感謝', '挑戦', 'イノベーション'], commonQuestions: ['他者に貢献した経験', 'リーダーシップ'] },
  { name: 'P&G', hasData: true, industry: '消費財', values: ['リーダーシップ', 'オーナーシップ'], commonQuestions: ['チームをリードした経験', '課題を解決した経験'] },
  { name: '味の素', hasData: true, industry: '食品', values: ['新しい価値の創造', 'ASV'], commonQuestions: ['あなたの強み', '社会に対してやりたいこと'] },
  { name: 'サントリー', hasData: true, industry: '飲料', values: ['やってみなはれ', '利益三分主義'], commonQuestions: ['チャレンジした経験', '情熱を持って取り組んだこと'] },
];

export default function HomePage() {
  const { user } = useUser();
  const [credits, setCredits] = useState(0);
  const [creditsLoaded, setCreditsLoaded] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [generationType, setGenerationType] = useState<GenerationType>('es');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [generatedES, setGeneratedES] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showValuesEdit, setShowValuesEdit] = useState(false);
  const [customValues, setCustomValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [useOptimization, setUseOptimization] = useState(true);
  const [formData, setFormData] = useState({ selectionType: 'job' as SelectionType, question: '', wordCount: 400, episode: '' });
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewInputText, setReviewInputText] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`/api/credits?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.isPremium) { setIsPremium(true); setCredits(-1); }
          else { setIsPremium(false); setCredits(data.credits ?? 0); }
          setCreditsLoaded(true);
        })
        .catch(() => { setCredits(0); setCreditsLoaded(true); });
    }
  }, [user]);

  const checkPremium = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('subscriptions').select('status').eq('user_id', userId).eq('status', 'active').single();
      if (error) return false;
      return !!data;
    } catch { return false; }
  };

  const saveES = async () => {
    if (!user) { alert('ログインしてください'); return; }
    try {
      const { count, error: countError } = await supabase.from('user_es').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if (countError) throw countError;
      const isPremiumUser = await checkPremium(user.id);
      if (!isPremiumUser && (count ?? 0) >= 5) { alert('無料プランは5個まで保存できます。\nプレミアムプランで無制限に保存しましょう！'); return; }
      const { error } = await supabase.from('user_es').insert({ user_id: user.id, company: companyInput, generation_type: generationType, question: formData.question, episode: formData.episode, generated_text: generatedES, word_count: formData.wordCount });
      if (error) throw error;
      if (isPremiumUser) alert('ESを保存しました！（プレミアムプラン）');
      else alert(`ESを保存しました！（残り${4 - (count ?? 0)}個保存可能）`);
    } catch (error) { console.error('Error:', error); alert('保存に失敗しました'); }
  };

  const handleUpgrade = async () => {
    if (!user) { alert('ログインしてください'); return; }
    if (isPremium) return;
    try {
      await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      const response = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) { console.error('Error:', error); alert('アップグレードに失敗しました'); }
  };

  const wordCounts = Array.from({ length: 15 }, (_, i) => 100 + i * 50);

  const handleGenerationTypeChange = (type: GenerationType) => {
    if (type === 'review' && !isPremium) { handleUpgrade(); return; }
    setGenerationType(type);
    let q = '';
    if (type === 'motivation') q = 'なぜ当社を志望しますか？';
    else if (type === 'gakuchika') q = '学生時代に最も力を入れたことを教えてください';
    setFormData({...formData, question: q});
  };

  const filteredCompanies = companyInput.length > 0 ? COMPANY_LIST.filter(c => c.name.includes(companyInput)) : [];
  const handleCompanySelect = (company: Company) => { setCompanyInput(company.name); setSelectedCompany(company); setShowSuggestions(false); setCustomValues(company.values || []); setUseOptimization(true); };
  const handleCompanyInputChange = (value: string) => {
    setCompanyInput(value); setShowSuggestions(value.length > 0);
    const m = COMPANY_LIST.find(c => c.name === value);
    setSelectedCompany(m || null);
    if (m) { setCustomValues(m.values || []); setUseOptimization(true); } else { setCustomValues([]); if (value) setUseOptimization(true); }
  };
  const addCustomValue = () => { if (newValue.trim()) { setCustomValues([...customValues, newValue.trim()]); setNewValue(''); } };
  const removeValue = (i: number) => { setCustomValues(customValues.filter((_, idx) => idx !== i)); };
  const toggleTrait = (trait: string) => {
    if (customValues.includes(trait)) setCustomValues(customValues.filter(v => v !== trait));
    else setCustomValues([...customValues, trait]);
  };

  const generateContent = async () => {
    if (!user) { alert('生成にはログインが必要です'); return; }
    if (!isPremium && credits === 0) { alert('無料枠を使い切りました。プレミアムプランにアップグレードしてください。'); return; }
    if (!companyInput || !formData.question || !formData.episode) { alert('必須項目を全て入力してください'); return; }
    setIsGenerating(true);
    try {
      if (!isPremium) {
        const creditRes = await fetch('/api/credits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
        const creditData = await creditRes.json();
        if (!creditData.success) { alert('クレジットの消費に失敗しました。'); setIsGenerating(false); return; }
        setCredits(creditData.credits);
      }
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company: companyInput, values: useOptimization ? customValues : [], question: formData.question, episode: formData.episode, wordCount: formData.wordCount, selectionType: formData.selectionType }) });
      const data = await res.json();
      if (data.success) { setGeneratedES(data.text); setShowResult(true); setReviewText(''); }
      else alert('ES生成に失敗しました。もう一度お試しください。');
    } catch (error) { console.error('Error:', error); alert('エラーが発生しました。'); }
    finally { setIsGenerating(false); }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(generatedES); alert('コピーしました！'); };

  const reviewES = async (inputText?: string) => {
    if (!user) return;
    if (!isPremium) { handleUpgrade(); return; }
    const textToReview = inputText || generatedES;
    if (!textToReview.trim()) { alert('添削するテキストを入力してください。'); return; }
    setIsReviewing(true); setReviewText('');
    try {
      const res = await fetch('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, esText: textToReview, company: companyInput, question: formData.question, generationType: generationType === 'review' ? 'es' : generationType }) });
      const data = await res.json();
      if (data.success) setReviewText(data.review);
      else alert('添削に失敗しました。もう一度お試しください。');
    } catch (error) { console.error('Review error:', error); alert('エラーが発生しました。'); }
    finally { setIsReviewing(false); }
  };

  /* ======= 未ログイン: ランディングページ ======= */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Shield className="w-7 h-7 md:w-10 md:h-10 text-emerald-600" strokeWidth={1.5} />
              <div><h1 className="text-lg md:text-2xl font-bold text-gray-900">大手突破ES</h1><p className="hidden md:block text-xs text-gray-500">AIで、大手の壁を突破する</p></div>
            </div>
            <SignInButton mode="modal"><button className="px-4 py-2 md:px-6 md:py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base font-semibold transition-all">ログイン / 新規登録</button></SignInButton>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6"><Sparkles className="w-4 h-4" />50社以上の企業データ搭載</div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6 leading-tight">AIが企業に最適化した<br />ESを自動生成</h2>
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">三菱商事、トヨタ、ソニーなど大手企業が求める人物像を分析し、<br className="hidden md:block" />あなたのエピソードから通過率の高いESを作成します。</p>
            <SignInButton mode="modal"><button className="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold shadow-lg transition-all hover:scale-105" style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' }}><span className="flex items-center gap-2"><Sparkles className="w-5 h-5" />無料で始める（5回まで無料）</span></button></SignInButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            {[
              { icon: Building2, title: '50社の企業データ', desc: '各企業が求める人物像・頻出設問を搭載。企業ごとに最適化されたESを生成' },
              { icon: Target, title: '企業別最適化', desc: '「構想力」「実行力」など企業の価値観をESに自動反映。通過率を大幅アップ' },
              { icon: Edit2, title: 'AI添削機能', desc: '構成力・具体性・論理性・企業適合度・表現力の5軸で詳細フィードバック' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-3"><Icon className="w-6 h-6 text-emerald-600" /></div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 md:p-8 border-2 border-emerald-200 mb-12">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" />「企業最適化」とは？</h3>
            <div className="space-y-3 text-sm md:text-base text-gray-700">
              <div className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">1</span><p>企業ごとに<strong>「求める人物像」</strong>をデータベースに登録（例: 三菱商事→構想力・実行力・変革力）</p></div>
              <div className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">2</span><p>AIがあなたのエピソードを、<strong>その企業が重視するポイント</strong>に合わせて文章化</p></div>
              <div className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">3</span><p>同じエピソードでも<strong>企業によって違うESが生成</strong>される → 各企業に刺さるESに</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-blue-200 shadow-sm mb-12">
            <div className="text-[10px] text-gray-400 mb-2">PR・提携</div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">ジール就活エージェント</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-3">プロのキャリアアドバイザーがES添削・面接対策を無料サポート。大手内定実績多数。厚生労働省許可の就活支援サービスです。</p>
            <a href="https://zeel-jp.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold transition-all"><ExternalLink className="w-3.5 h-3.5" /> 無料で相談する</a>
          </div>

          <div className="text-center"><SignInButton mode="modal"><button className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all">無料で始める</button></SignInButton></div>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm"><Shield className="w-5 h-5 text-emerald-600" /><span>大手突破ES</span><span className="text-gray-300">|</span><span>株式会社BETECT</span></div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-500">
                <Link href="/legal/terms" className="hover:text-emerald-600 transition-colors">利用規約</Link>
                <Link href="/legal/privacy" className="hover:text-emerald-600 transition-colors">プライバシーポリシー</Link>
                <Link href="/legal/commerce" className="hover:text-emerald-600 transition-colors">特定商取引法</Link>
                <Link href="/contact" className="hover:text-emerald-600 transition-colors">お問い合わせ</Link>
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-gray-400">© 2026 株式会社BETECT All rights reserved.</div>
          </div>
        </footer>
      </div>
    );
  }

  /* ======= ログイン済み: メインUI ======= */
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
          <div className="md:hidden flex items-center justify-between">
            <div className="flex items-center gap-2"><Shield className="w-7 h-7 text-emerald-600" strokeWidth={1.5} /><h1 className="text-lg font-bold text-gray-900">大手突破ES</h1></div>
            <div className="flex items-center gap-2">
              {isPremium ? (<span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"><Crown className="w-3.5 h-3.5" /> Premium</span>) : (<button onClick={handleUpgrade} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"><Crown className="w-3.5 h-3.5" /> UP</button>)}
              <Link href="/history"><button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><FileText className="w-4 h-4" /></button></Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3"><Shield className="w-10 h-10 text-emerald-600" strokeWidth={1.5} /><div><h1 className="text-2xl font-bold text-gray-900">大手突破ES</h1><p className="text-xs text-gray-500">AIで、大手の壁を突破する</p></div></div>
            <div className="flex-1" />
            {isPremium ? (<span className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold flex items-center gap-2 shadow-sm"><Crown className="w-5 h-5" /> プレミアム会員</span>) : (<button onClick={handleUpgrade} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-bold flex items-center gap-2 shadow-sm hover:scale-105 transition-all"><Crown className="w-5 h-5" /> アップグレード</button>)}
            <Link href="/history"><button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"><FileText className="w-5 h-5" /><span className="text-sm font-semibold">履歴</span></button></Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* 生成タイプ */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <h2 className="text-base md:text-xl font-bold mb-3 md:mb-4 text-gray-900">何を作りますか？</h2>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {([
                  { type: 'es' as GenerationType, icon: FileText, label: 'ES生成', premium: false },
                  { type: 'motivation' as GenerationType, icon: Target, label: '志望動機', premium: false },
                  { type: 'gakuchika' as GenerationType, icon: Award, label: 'ガクチカ', premium: false },
                  { type: 'review' as GenerationType, icon: Edit2, label: '添削', premium: true },
                ]).map(({ type, icon: Icon, label, premium }) => (
                  <button key={type} onClick={() => handleGenerationTypeChange(type)}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all relative ${premium && !isPremium ? 'border-amber-200 bg-amber-50/50 cursor-pointer hover:border-amber-400' : generationType === type ? (type === 'review' ? 'border-amber-500 bg-amber-50' : 'border-emerald-500 bg-emerald-50') : 'border-gray-200 bg-white hover:border-emerald-300'}`}>
                    {premium && (<span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap bg-gradient-to-r from-amber-400 to-yellow-500 text-white`}>{isPremium ? 'Premium' : <span className="flex items-center gap-0.5"><Crown className="w-2.5 h-2.5" />Premium</span>}</span>)}
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${premium && !isPremium ? 'text-amber-400' : generationType === type ? (type === 'review' ? 'text-amber-600' : 'text-emerald-600') : 'text-gray-400'}`} />
                    <div className={`font-semibold text-xs sm:text-sm md:text-base ${premium && !isPremium ? 'text-amber-500' : generationType === type ? (type === 'review' ? 'text-amber-700' : 'text-emerald-700') : 'text-gray-600'}`}>{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 添削フォーム */}
            {generationType === 'review' && isPremium && (
              <div className="bg-white rounded-2xl p-4 md:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 md:gap-3 mb-4"><Edit2 className="w-5 h-5 md:w-6 md:h-6 text-amber-600 flex-shrink-0" /><h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">AIで詳細添削</h2><span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold">Premium</span></div>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">作成済みのESを貼り付けて、AIが構成力・具体性・論理性・企業適合度・表現力の5つの観点で添削します。</p>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium mb-2 text-gray-700">添削するES <span className="text-amber-600">*</span></label><textarea value={reviewInputText} onChange={(e) => setReviewInputText(e.target.value)} rows={8} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm sm:text-base" placeholder="添削したいESの本文をここに貼り付けてください..." /></div>
                  <div><label className="block text-sm font-medium mb-2 text-gray-700">企業名（任意）</label><input type="text" value={companyInput} onChange={(e) => handleCompanyInputChange(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base" placeholder="企業名を入力すると企業に合わせた添削になります" /></div>
                  <button onClick={() => reviewES(reviewInputText)} disabled={isReviewing || !reviewInputText.trim()} className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white shadow-lg transition-all hover:scale-[1.02]" style={{ boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)' }}>
                    {isReviewing ? (<span className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />AI添削中...</span>) : (<span className="flex items-center justify-center gap-2"><Edit2 className="w-5 h-5" />AIで詳細添削する</span>)}
                  </button>
                  {reviewText && (<div className="p-4 sm:p-6 rounded-xl bg-amber-50 border border-amber-200"><div className="flex items-center gap-2 mb-3"><Edit2 className="w-5 h-5 text-amber-600" /><span className="font-bold text-gray-900">AI添削結果</span></div><div className="whitespace-pre-wrap leading-relaxed text-sm text-gray-800">{reviewText}</div><button onClick={() => { navigator.clipboard.writeText(reviewText); alert('添削結果をコピーしました！'); }} className="mt-4 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold flex items-center gap-2"><Copy className="w-4 h-4" /> 結果をコピー</button></div>)}
                </div>
              </div>
            )}

            {/* 生成フォーム */}
            {generationType !== 'review' && (
            <div className="bg-white rounded-2xl p-4 md:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2"><Building2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 flex-shrink-0" /><h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 truncate">{companyInput ? `${companyInput}用${generationType === 'es' ? 'ES' : generationType === 'motivation' ? '志望動機' : 'ガクチカ'}作成` : 'どの企業のESを作りますか？'}</h2></div>

              {/* 企業最適化の説明 */}
              {!companyInput && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-gray-700">
                      <span className="font-bold text-emerald-700">企業名を入力すると、その企業が求める人物像に合わせてESを最適化！</span>
                      <span className="block mt-1 text-gray-500">50社以上のデータを搭載。同じエピソードでも企業ごとに刺さる表現に変わります。</span>
                    </div>
                  </div>
                </div>
              )}
              {companyInput && <p className="text-xs sm:text-sm mb-4 md:mb-6 text-emerald-600">✨ {companyInput}に最適化したESを生成します</p>}

              <div className="space-y-4 md:space-y-5">
                {/* 企業名 */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">企業名 <span className="text-emerald-600">*</span></label>
                  <div className="relative">
                    <input type="text" value={companyInput} onChange={(e) => handleCompanyInputChange(e.target.value)} onFocus={() => setShowSuggestions(companyInput.length > 0)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base" placeholder="企業名を検索・選択..." />
                    {showSuggestions && filteredCompanies.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                        {filteredCompanies.map((c) => (<button key={c.name} onClick={() => handleCompanySelect(c)} className="w-full px-3 sm:px-4 py-2.5 text-left border-b border-gray-100 last:border-b-0 hover:bg-emerald-50"><div className="flex items-center gap-2">{c.hasData && <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />}<div className="flex-1 min-w-0"><div className="font-medium text-sm sm:text-base text-gray-900">{c.name}</div><div className="text-xs text-gray-500">{c.industry}</div></div>{c.hasData && <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 flex-shrink-0">最適化対応</span>}</div></button>))}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500"><Building2 className="w-4 h-4 flex-shrink-0" /><span>現在50社の企業データで最適化対応 • 随時追加中！</span></div>

                  {/* 企業データあり */}
                  {selectedCompany?.hasData && (
                    <div className="mt-3 p-3 sm:p-5 rounded-xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50" style={{ opacity: useOptimization ? 1 : 0.6 }}>
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap"><Star className="w-5 h-5 text-amber-500" /><span className="font-bold text-base sm:text-lg text-gray-900">{selectedCompany.name}</span><span className="text-[10px] sm:text-xs text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded font-medium">⚡ 最適化対応企業</span></div>
                      <div className="mb-3 p-2.5 rounded-lg bg-white/70 border border-emerald-200"><p className="text-[10px] sm:text-xs text-gray-600">💡 <strong className="text-emerald-700">{selectedCompany.name}が求める人物像</strong>に合わせてESを最適化します。項目を編集してより精度の高いESを生成できます。</p></div>
                      <div className="mb-3 p-2.5 sm:p-3 rounded-lg cursor-pointer bg-white" onClick={() => setUseOptimization(!useOptimization)} style={{ border: `2px solid ${useOptimization ? '#10b981' : '#d1d5db'}` }}>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center border-2 ${useOptimization ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`}>{useOptimization && <CheckCircle className="w-4 h-4 text-white" />}</div>
                          <div className="flex-1"><div className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5">企業の価値観で最適化する</div><div className="text-[10px] sm:text-xs text-gray-500">{useOptimization ? '✓ 企業が求める人物像をESに反映して生成' : '汎用的な内容で生成（最適化OFF）'}</div></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between"><div className={`text-xs sm:text-sm font-semibold text-gray-700 ${!useOptimization && 'opacity-50'}`}>💡 求める人物像{!useOptimization && '（参考）'}:</div><button onClick={(e) => { e.stopPropagation(); setShowValuesEdit(!showValuesEdit); }} className="text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-100 flex items-center gap-1" disabled={!useOptimization} style={{ opacity: useOptimization ? 1 : 0.5 }}><Edit2 className="w-3.5 h-3.5" /><span className="text-xs sm:text-sm font-medium">編集</span></button></div>
                        {showValuesEdit ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-1.5">{customValues.map((v, i) => (<span key={i} className="inline-flex items-center gap-1 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">✓ {v}<button onClick={() => removeValue(i)} className="ml-0.5 text-emerald-600 hover:text-red-500"><X className="w-3 h-3" /></button></span>))}</div>
                            <div><div className="text-[10px] sm:text-xs text-gray-500 mb-1.5">▼ タップして追加：</div><div className="flex flex-wrap gap-1.5">{COMMON_TRAITS.filter(t => !customValues.includes(t)).map((trait) => (<button key={trait} onClick={() => toggleTrait(trait)} className="text-[11px] sm:text-xs px-2.5 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all">+ {trait}</button>))}</div></div>
                            <div className="flex gap-2"><input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCustomValue()} placeholder="自由入力で追加..." className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" /><button onClick={addCustomValue} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"><Plus className="w-4 h-4 text-white" /></button></div>
                            <button onClick={() => setShowValuesEdit(false)} className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium">✓ 完了</button>
                          </div>
                        ) : (
                          <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${!useOptimization && 'opacity-50'}`}>{customValues.map((v, i) => (<span key={i} className="text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">✓ {v}</span>))}</div>
                        )}
                      </div>
                      {selectedCompany.commonQuestions && (<div className={`mt-3 text-xs sm:text-sm p-3 rounded-lg bg-white border border-emerald-200 ${!useOptimization && 'opacity-50'}`}><span className="font-bold text-gray-700">📝 よく出る設問:</span> <span className="text-gray-600">{selectedCompany.commonQuestions.join(' / ')}</span></div>)}
                    </div>
                  )}

                  {/* 企業データなし */}
                  {companyInput && !selectedCompany && (
                    <div className="mt-3 p-3 sm:p-5 rounded-xl border-2 border-gray-200 bg-gray-50" style={{ opacity: useOptimization ? 1 : 0.6 }}>
                      <div className="mb-3 flex items-center gap-2"><Building2 className="w-5 h-5 text-emerald-600" /><span className="font-bold text-gray-900">{companyInput}</span></div>
                      <div className="mb-3 p-2.5 rounded-lg bg-white border border-gray-200"><p className="text-[10px] sm:text-xs text-gray-600">💡 この企業のデータはまだ未登録ですが、<strong>下から「求める人物像」を選択・入力</strong>すれば最適化できます！企業HPの採用ページを参考に入力してみてください。</p></div>
                      <div className="mb-3 p-2.5 sm:p-3 rounded-lg cursor-pointer bg-white" onClick={() => setUseOptimization(!useOptimization)} style={{ border: `2px solid ${useOptimization ? '#10b981' : '#d1d5db'}` }}>
                        <div className="flex items-start gap-2 sm:gap-3"><div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center border-2 ${useOptimization ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`}>{useOptimization && <CheckCircle className="w-4 h-4 text-white" />}</div><div className="flex-1"><div className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5">人物像で最適化する</div><div className="text-[10px] sm:text-xs text-gray-500">{useOptimization ? '✓ 下記の人物像を反映して生成' : '汎用的な内容で生成'}</div></div></div>
                      </div>
                      <div className="space-y-3">
                        <div className={`text-xs sm:text-sm font-medium text-gray-600 ${!useOptimization && 'opacity-50'}`}>💡 求める人物像を選択・入力{!useOptimization && '（参考）'}:</div>
                        {customValues.length > 0 && (<div className={`flex flex-wrap gap-1.5 ${!useOptimization && 'opacity-50'}`}>{customValues.map((v, i) => (<span key={i} className="inline-flex items-center gap-1 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">✓ {v}<button onClick={() => removeValue(i)} className="ml-0.5 text-emerald-600 hover:text-red-500" disabled={!useOptimization}><X className="w-3 h-3" /></button></span>))}</div>)}
                        <div className={`${!useOptimization && 'opacity-50'}`}><div className="text-[10px] sm:text-xs text-gray-500 mb-1.5">▼ タップして追加：</div><div className="flex flex-wrap gap-1.5">{COMMON_TRAITS.filter(t => !customValues.includes(t)).map((trait) => (<button key={trait} onClick={() => toggleTrait(trait)} disabled={!useOptimization} className="text-[11px] sm:text-xs px-2.5 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">+ {trait}</button>))}</div></div>
                        <div className={`flex gap-2 ${!useOptimization && 'opacity-50'}`}><input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCustomValue()} placeholder="自由入力で追加..." className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" disabled={!useOptimization} /><button onClick={addCustomValue} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50" disabled={!useOptimization}><Plus className="w-4 h-4 text-white" /></button></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 選考タイプ */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">選考タイプ <span className="text-emerald-600">*</span></label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {([{ value: 'job' as SelectionType, label: '本選考' }, { value: 'intern' as SelectionType, label: 'インターンシップ' }]).map(({ value, label }) => (<button key={value} onClick={() => setFormData({...formData, selectionType: value})} className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all ${formData.selectionType === value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}><div className={`font-semibold text-sm sm:text-base ${formData.selectionType === value ? 'text-emerald-700' : 'text-gray-600'}`}>{label}</div></button>))}
                  </div>
                </div>

                {/* 設問 */}
                <div>
                  <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700">設問 <span className="text-emerald-600">*</span></label>{(generationType === 'motivation' || generationType === 'gakuchika') && <span className="text-[10px] sm:text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-medium">デフォルト設問・自由に編集可</span>}</div>
                  <textarea value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} rows={2} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm sm:text-base" placeholder="例: 学生時代に最も力を入れたことを教えてください" />
                </div>

                {/* 文字数 */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">文字数 <span className="text-emerald-600">*</span></label>
                  <select value={formData.wordCount} onChange={(e) => setFormData({...formData, wordCount: Number(e.target.value)})} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base">{wordCounts.map(c => <option key={c} value={c}>{c}字</option>)}</select>
                </div>

                {/* エピソード */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">エピソード <span className="text-emerald-600">*</span></label>
                  <div className="mb-2 p-2.5 sm:p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] sm:text-xs mb-1 text-gray-600">💡 箇条書きで入力してください:</div>
                    <div className="text-[10px] sm:text-xs space-y-0.5 text-gray-500">
                      {generationType === 'motivation' ? (<><div>• なぜこの業界・企業に興味を持ちましたか？</div><div>• どんな経験がきっかけですか？</div><div>• 企業のどこに魅力を感じますか？</div><div>• 入社後に何をしたいですか？</div></>) : generationType === 'gakuchika' ? (<><div>• いつ、何に取り組みましたか？</div><div>• どんな困難・課題がありましたか？</div><div>• どう工夫・努力しましたか？</div><div>• 結果と学んだことは？</div></>) : (<><div>• いつ、何をしましたか？</div><div>• どんな困難がありましたか？</div><div>• どう解決しましたか？</div><div>• 結果はどうでしたか？</div></>)}
                    </div>
                  </div>
                  <textarea value={formData.episode} onChange={(e) => setFormData({...formData, episode: e.target.value})} rows={5} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm sm:text-base"
                    placeholder={generationType === 'motivation' ? "• 大学の授業で○○業界の可能性を知った\n• インターンシップで実際の仕事を体験\n• 御社の○○という理念に共感\n• ○○の分野で新しい価値を創造したい" : generationType === 'gakuchika' ? "• サークル代表として50人をまとめた\n• コロナで活動中止の危機\n• オンライン活動に切り替えた\n• 参加率80%を達成、チームワークを学んだ" : "• サークル代表として50人をまとめた\n• コロナで活動中止の危機\n• オンライン活動に切り替え\n• 参加率80%を達成"} />
                </div>

                <button onClick={generateContent} disabled={isGenerating || (!isPremium && credits === 0)} className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:scale-[1.02]" style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' }}>
                  {isGenerating ? (<span className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />{companyInput ? `${companyInput}用ESを生成中...` : 'AI生成中...'}</span>) : (<span className="flex items-center justify-center gap-2"><Sparkles className="w-5 h-5" />{companyInput ? `${companyInput}用ESを生成` : '生成する'} {isPremium ? '(無制限)' : `(残り${credits}回)`}</span>)}
                </button>
              </div>
            </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-4 md:space-y-6">
            {creditsLoaded && !isPremium && (
              <div className={`rounded-2xl p-4 md:p-6 border-2 ${credits === 0 ? 'bg-red-50 border-red-300' : credits <= 2 ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="text-center">
                  <div className={`text-3xl sm:text-4xl font-black mb-1 ${credits === 0 ? 'text-red-600' : credits <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>{credits}<span className="text-base font-bold text-gray-500">/5回</span></div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-3">無料で生成できる残り回数</div>
                  {credits === 0 ? (<button onClick={handleUpgrade} className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white shadow-sm flex items-center justify-center gap-2"><Crown className="w-4 h-4" /> プレミアムで無制限に</button>) : (<p className="text-[10px] sm:text-xs text-gray-400">プレミアムなら無制限で使えます</p>)}
                </div>
              </div>
            )}

            {/* LINE友だち追加バナー */}
            {!isPremium && (
              <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="block rounded-2xl p-4 md:p-5 border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0"><MessageCircle className="w-6 h-6 text-white" /></div>
                  <div className="flex-1"><div className="font-bold text-sm text-gray-900">LINE追加で+3回プレゼント🎁</div><div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">就活に役立つ情報も配信中</div></div>
                </div>
              </a>
            )}

            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3"><Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /><h3 className="text-base sm:text-lg font-bold text-gray-900">プレミアム特典</h3></div>
              {isPremium && (<div className="mb-4 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-center shadow-sm"><span className="text-sm font-bold text-white flex items-center justify-center gap-1.5"><Crown className="w-4 h-4" /> ご利用中</span></div>)}
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">{['生成 無制限', '複数パターン生成', '詳細添削'].map((f, i) => (<li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" /><span>{f}</span></li>))}</ul>
              {!isPremium && (<><div className="text-center mb-3 sm:mb-4"><div className="text-2xl sm:text-3xl font-bold text-gray-900">¥480</div><div className="text-xs sm:text-sm text-gray-500">/月</div></div><button onClick={handleUpgrade} className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white shadow-sm">今すぐアップグレード</button></>)}
            </div>

            {/* ジール就活エージェント広告 */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-blue-200 shadow-sm">
              <div className="text-[10px] text-gray-400 mb-2">PR・提携</div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">ジール就活エージェント</h3>
              <p className="text-[10px] sm:text-xs text-gray-600 mb-3">プロがES添削・面接対策を無料サポート。大手内定実績多数。</p>
              <a href="https://zeel-jp.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all"><ExternalLink className="w-3.5 h-3.5" /> 無料で相談する</a>
            </div>
          </div>
        </div>
      </main>

      {/* 生成結果モーダル */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto" onClick={() => setShowResult(false)}>
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-3xl w-full my-4 sm:my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6"><div className="flex items-center gap-2 sm:gap-3 min-w-0"><Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 flex-shrink-0" /><h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{companyInput}用ES 生成完了！</h3></div><button onClick={() => setShowResult(false)} className="p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"><X className="w-5 h-5 text-gray-500" /></button></div>
            <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm"><span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">{formData.selectionType === 'job' ? '本選考' : 'インターン'}</span><span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">{selectedCompany?.hasData && <Star className="w-3 h-3 text-amber-500" />}{companyInput}</span><span className="px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-gray-700">{generatedES.length}字 / {formData.wordCount}字</span></div>
            <div className="mb-3"><div className="text-xs sm:text-sm mb-1 text-gray-500">設問:</div><div className="font-medium text-sm sm:text-base text-gray-900">{formData.question}</div></div>
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl bg-gray-50 border border-gray-200"><div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base text-gray-800">{generatedES}</div></div>

            <div className="mb-4 sm:mb-6">
              <button onClick={() => isPremium ? reviewES() : handleUpgrade()} disabled={isReviewing}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white shadow-sm">
                {isReviewing ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> AI添削中...</>) : isPremium ? (<><Edit2 className="w-4 h-4" /> AIで詳細添削する</>) : (<><Crown className="w-4 h-4" /> アップグレードして詳細添削する</>)}
              </button>
              {reviewText && (<div className="mt-3 p-4 sm:p-6 rounded-xl bg-amber-50 border border-amber-200"><div className="flex items-center gap-2 mb-3"><Edit2 className="w-5 h-5 text-amber-600" /><span className="font-bold text-gray-900">AI添削結果</span></div><div className="whitespace-pre-wrap leading-relaxed text-sm text-gray-800">{reviewText}</div></div>)}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button onClick={saveES} className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"><FileText className="w-4 h-4 sm:w-5 sm:h-5" /> 保存する</button>
              <button onClick={copyToClipboard} className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white"><Copy className="w-4 h-4 sm:w-5 sm:h-5" /> コピーする</button>
              <button onClick={() => setShowResult(false)} className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base border-2 border-gray-300 text-gray-700 hover:bg-gray-50">閉じる</button>
            </div>

            {!isPremium && (
              <div className="mt-4 space-y-3">
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                  <div className="flex items-center gap-3"><Crown className="w-8 h-8 text-amber-500 flex-shrink-0" /><div className="flex-1 min-w-0"><div className="font-bold text-sm text-gray-900">プレミアムで添削＆無制限生成</div><div className="text-xs text-gray-500">残り{credits}回 → 月額480円で制限なし</div></div><button onClick={handleUpgrade} className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white text-xs sm:text-sm font-bold whitespace-nowrap shadow-sm">UP</button></div>
                </div>
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-300 hover:bg-green-100 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0"><MessageCircle className="w-4 h-4 text-white" /></div>
                  <div className="flex-1"><div className="font-bold text-xs text-gray-900">LINE追加で+3回プレゼント🎁</div><div className="text-[10px] text-gray-500">就活Tipsも配信中</div></div>
                  <span className="text-xs font-bold text-green-600">追加する →</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm"><Shield className="w-5 h-5 text-emerald-600" /><span>大手突破ES</span><span className="text-gray-300">|</span><span>株式会社BETECT</span></div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-500">
              <Link href="/legal/terms" className="hover:text-emerald-600 transition-colors">利用規約</Link>
              <Link href="/legal/privacy" className="hover:text-emerald-600 transition-colors">プライバシーポリシー</Link>
              <Link href="/legal/commerce" className="hover:text-emerald-600 transition-colors">特定商取引法</Link>
              <Link href="/contact" className="hover:text-emerald-600 transition-colors">お問い合わせ</Link>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-400">© 2026 株式会社BETECT All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}