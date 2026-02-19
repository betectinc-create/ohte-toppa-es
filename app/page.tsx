'use client';

import { useState } from 'react';
import { Shield, Sparkles, Crown, Users, CheckCircle, Copy, X, FileText, Target, Award, Building2, Star, Edit2, Plus, Trash2 } from 'lucide-react';

type GenerationType = 'es' | 'motivation' | 'gakuchika';
type SelectionType = 'job' | 'intern';

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
  
  const [formData, setFormData] = useState({
    selectionType: 'job' as SelectionType,
    question: '',
    wordCount: 400,
    episode: '',
  });

  const wordCounts = Array.from({ length: 15 }, (_, i) => 100 + i * 50);

  const filteredCompanies = companyInput.length > 0
    ? COMPANY_LIST.filter(c => c.name.includes(companyInput))
    : [];

  const handleCompanySelect = (company: Company) => {
    setCompanyInput(company.name);
    setSelectedCompany(company);
    setShowSuggestions(false);
    setCustomValues(company.values || []);
  };

  const handleCompanyInputChange = (value: string) => {
    setCompanyInput(value);
    setShowSuggestions(value.length > 0);
    
    const exactMatch = COMPANY_LIST.find(c => c.name === value);
    setSelectedCompany(exactMatch || null);
    if (exactMatch) {
      setCustomValues(exactMatch.values || []);
    } else {
      setCustomValues([]);
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
          values: customValues,
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
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0a2e1a 0%, #1a4d2e 50%, #2d6a4f 100%)'
    }}>
      <header className="border-b border-emerald-700/30" style={{
        background: 'linear-gradient(to bottom, rgba(10, 46, 26, 0.95), rgba(26, 77, 46, 0.8))',
        backdropFilter: 'blur(20px)'
      }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 md:w-12 md:h-12 text-emerald-400" strokeWidth={1.5} />
              <div>
                <h1 className="text-xl md:text-3xl font-bold" style={{
                  background: 'linear-gradient(135deg, #d4f1d4 0%, #a7f3d0 50%, #86efac 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  大手突破ES
                </h1>
                <p className="text-emerald-200 text-xs md:text-sm opacity-80">
                  AIで、大手の壁を突破する
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-emerald-100 text-sm">無料プラン</div>
                <div className="text-emerald-300 font-bold">残り {credits} 回</div>
              </div>
              <button
                onClick={() => alert('プレミアムプランは準備中です')}
                className="px-4 md:px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                  color: 'white'
                }}
              >
                プレミアムへ
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-full transition-all"
                style={{
                  background: i < credits ? '#10b981' : 'rgba(16, 185, 129, 0.2)'
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 生成タイプ選択 */}
            <div className="rounded-2xl p-6 border" style={{
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.6) 0%, rgba(4, 120, 87, 0.4) 100%)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}>
              <h2 className="text-xl font-bold text-emerald-50 mb-4">何を作りますか？</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { type: 'es' as GenerationType, icon: FileText, label: 'ES生成' },
                  { type: 'motivation' as GenerationType, icon: Target, label: '志望動機' },
                  { type: 'gakuchika' as GenerationType, icon: Award, label: 'ガクチカ' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setGenerationType(type)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generationType === type ? 'border-emerald-400' : 'border-emerald-700/30'
                    }`}
                    style={{
                      background: generationType === type 
                        ? 'rgba(16, 185, 129, 0.2)' 
                        : 'rgba(6, 78, 59, 0.3)'
                    }}
                  >
                    <Icon className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
                    <div className="text-emerald-50 font-semibold">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 入力フォーム */}
            <div className="rounded-2xl p-6 md:p-8 border" style={{
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.6) 0%, rgba(4, 120, 87, 0.4) 100%)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-emerald-300" />
                <h2 className="text-2xl font-bold text-emerald-50">
                  {companyInput ? `${companyInput}用${generationType === 'es' ? 'ES' : generationType === 'motivation' ? '志望動機' : 'ガクチカ'}作成` : 'どの企業のESを作りますか？'}
                </h2>
              </div>
              
              {companyInput && (
                <p className="text-emerald-200 text-sm mb-6">
                  ✨ {companyInput}に最適化したESを生成します
                </p>
              )}

              <div className="space-y-5">
                {/* 企業名 */}
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    企業名 <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyInput}
                      onChange={(e) => handleCompanyInputChange(e.target.value)}
                      onFocus={() => setShowSuggestions(companyInput.length > 0)}
                      className="w-full px-4 py-3 rounded-xl border bg-emerald-950/50 text-emerald-50 placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="企業名を検索・選択..."
                      style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    />
                    
                    {showSuggestions && filteredCompanies.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 rounded-xl border bg-emerald-900 max-h-60 overflow-y-auto"
                        style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        {filteredCompanies.map((company) => (
                          <button
                            key={company.name}
                            onClick={() => handleCompanySelect(company)}
                            className="w-full px-4 py-3 text-left hover:bg-emerald-800/50 transition-colors border-b border-emerald-700/30 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              {company.hasData && <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                              <div className="flex-1">
                                <div className="text-emerald-50 font-medium">{company.name}</div>
                                <div className="text-emerald-300 text-xs">{company.industry}</div>
                              </div>
                              {company.hasData && (
                                <span className="text-xs text-emerald-300 bg-emerald-800/50 px-2 py-1 rounded">
                                  データあり
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-300">
                    <Building2 className="w-4 h-4" />
                    <span>現在50社のデータあり • 企業は随時追加中！</span>
                  </div>

                  {/* 企業データ表示・編集 */}
                  {selectedCompany && selectedCompany.hasData && (
                    <div className="mt-3 p-4 rounded-xl bg-emerald-900/30 border border-emerald-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-emerald-50 font-semibold">{selectedCompany.name}</span>
                          <span className="text-xs text-emerald-300">企業データあり</span>
                        </div>
                        <button
                          onClick={() => setShowValuesEdit(!showValuesEdit)}
                          className="text-emerald-300 hover:text-emerald-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-xs text-emerald-200">
                          💡 求める人物像:
                        </div>
                        
                        {showValuesEdit ? (
                          <div className="space-y-2">
                            {customValues.map((value, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="flex-1 text-sm text-emerald-100 bg-emerald-800/30 px-3 py-1.5 rounded">
                                  {value}
                                </span>
                                <button
                                  onClick={() => removeValue(index)}
                                  className="text-red-400 hover:text-red-300"
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
                                className="flex-1 px-3 py-1.5 text-sm rounded bg-emerald-950/50 text-emerald-50 border border-emerald-700/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                              />
                              <button
                                onClick={addCustomValue}
                                className="px-3 py-1.5 bg-emerald-700/50 hover:bg-emerald-700 rounded transition-colors"
                              >
                                <Plus className="w-4 h-4 text-emerald-100" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => setShowValuesEdit(false)}
                              className="text-xs text-emerald-300 hover:text-emerald-200"
                            >
                              完了
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {customValues.map((value, index) => (
                              <span key={index} className="text-sm text-emerald-100 bg-emerald-800/30 px-3 py-1 rounded">
                                {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {selectedCompany.commonQuestions && (
                        <div className="mt-3 text-xs text-emerald-200">
                          📝 よく出る設問: {selectedCompany.commonQuestions.join(' / ')}
                        </div>
                      )}
                    </div>
                  )}

                  {companyInput && !selectedCompany && (
                    <div className="mt-3 p-4 rounded-xl bg-emerald-900/30 border border-emerald-700/30">
                      <div className="space-y-2">
                        <div className="text-xs text-emerald-200">
                          💡 求める人物像を入力（任意）:
                        </div>
                        
                        {customValues.map((value, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="flex-1 text-sm text-emerald-100 bg-emerald-800/30 px-3 py-1.5 rounded">
                              {value}
                            </span>
                            <button
                              onClick={() => removeValue(index)}
                              className="text-red-400 hover:text-red-300"
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
                            placeholder="例: リーダーシップ、協調性..."
                            className="flex-1 px-3 py-1.5 text-sm rounded bg-emerald-950/50 text-emerald-50 border border-emerald-700/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                          <button
                            onClick={addCustomValue}
                            className="px-3 py-1.5 bg-emerald-700/50 hover:bg-emerald-700 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4 text-emerald-100" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 選考タイプ */}
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-3">
                    選考タイプ <span className="text-emerald-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'job' as SelectionType, label: '本選考' },
                      { value: 'intern' as SelectionType, label: 'インターンシップ' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setFormData({...formData, selectionType: value})}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.selectionType === value ? 'border-emerald-400' : 'border-emerald-700/30'
                        }`}
                        style={{
                          background: formData.selectionType === value 
                            ? 'rgba(16, 185, 129, 0.2)' 
                            : 'rgba(6, 78, 59, 0.3)'
                        }}
                      >
                        <div className="text-emerald-50 font-semibold">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 設問 */}
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    設問 <span className="text-emerald-400">*</span>
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border bg-emerald-950/50 text-emerald-50 placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    placeholder="例: 学生時代に最も力を入れたことを教えてください"
                    style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  />
                </div>

                {/* 文字数 */}
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    文字数 <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={formData.wordCount}
                    onChange={(e) => setFormData({...formData, wordCount: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border bg-emerald-950/50 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  >
                    {wordCounts.map(count => (
                      <option key={count} value={count}>{count}字</option>
                    ))}
                  </select>
                </div>

                {/* エピソード */}
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    エピソード <span className="text-emerald-400">*</span>
                  </label>
                  <div className="mb-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/30">
                    <div className="text-emerald-200 text-xs mb-1">💡 箇条書きで入力してください:</div>
                    <div className="text-emerald-300 text-xs space-y-1">
                      <div>• いつ、何をしましたか？</div>
                      <div>• どんな困難がありましたか？</div>
                      <div>• どう解決しましたか？</div>
                      <div>• 結果はどうでしたか？</div>
                    </div>
                  </div>
                  <textarea
                    value={formData.episode}
                    onChange={(e) => setFormData({...formData, episode: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border bg-emerald-950/50 text-emerald-50 placeholder-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    placeholder="• サークル代表として50人をまとめた&#10;• コロナで活動中止の危機&#10;• オンライン活動に切り替え&#10;• 参加率80%を達成"
                    style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  />
                </div>

                <button
                  onClick={generateContent}
                  disabled={isGenerating || credits === 0}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
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
          <div className="space-y-6">
            {credits === 0 && (
              <div className="rounded-2xl p-6 border-2" style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
                borderColor: 'rgba(251, 191, 36, 0.3)'
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-bold text-amber-100">無料で続ける</h3>
                </div>
                <p className="text-emerald-100 text-sm mb-4">
                  友達を紹介すると、さらに5回無料で使えます！
                </p>
                <button
                  onClick={() => setShowReferral(true)}
                  className="w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
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

            <div className="rounded-2xl p-6 border-2" style={{
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.6) 0%, rgba(4, 120, 87, 0.4) 100%)',
              borderColor: 'rgba(16, 185, 129, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-emerald-50">プレミアム特典</h3>
              </div>
              <ul className="space-y-3 mb-6">
                {['生成 無制限', '複数パターン生成', '詳細添削', '広告なし'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-emerald-100 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-emerald-50 mb-1">¥480</div>
                <div className="text-emerald-200 text-sm">/月</div>
              </div>
              <button
                onClick={() => alert('プレミアムプランは準備中です')}
                className="w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowResult(false)}>
          <div className="rounded-2xl p-6 md:p-8 max-w-3xl w-full my-8" style={{
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.98) 0%, rgba(4, 120, 87, 0.98) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-emerald-300" />
                <h3 className="text-2xl md:text-3xl font-bold text-emerald-50">
                  {companyInput}用ES 生成完了！
                </h3>
              </div>
              <button
                onClick={() => setShowResult(false)}
                className="p-2 rounded-lg hover:bg-emerald-800/50 transition-colors"
              >
                <X className="w-6 h-6 text-emerald-200" />
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-emerald-800/50 text-emerald-100">
                {formData.selectionType === 'job' ? '本選考' : 'インターン'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-800/50 text-emerald-100 flex items-center gap-1">
                {selectedCompany?.hasData && <Star className="w-3 h-3 text-amber-400" />}
                {companyInput}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-800/50 text-emerald-100">
                {generatedES.length}字 / {formData.wordCount}字
              </span>
              {customValues.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-800/50 text-amber-100">
                  {customValues.join(' • ')}
                </span>
              )}
            </div>

            <div className="mb-4">
              <div className="text-emerald-200 text-sm mb-2">設問:</div>
              <div className="text-emerald-100 font-medium">{formData.question}</div>
            </div>

            <div className="mb-6 p-6 rounded-xl bg-emerald-950/50 border border-emerald-700/30">
              <div className="text-emerald-50 whitespace-pre-wrap leading-relaxed">
                {generatedES}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-3 px-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                  color: 'white'
                }}
              >
                <Copy className="w-5 h-5" />
                コピーする
              </button>
              <button
                onClick={() => setShowResult(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold transition-all hover:scale-[1.02] border-2 border-emerald-400/50 text-emerald-50 hover:bg-emerald-800/30"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 紹介モーダル */}
      {showReferral && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowReferral(false)}>
          <div className="rounded-2xl p-8 max-w-md w-full" style={{
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(4, 120, 87, 0.95) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-emerald-50 mb-4">友達紹介で+5回</h3>
            <p className="text-emerald-100 mb-6">
              あなたの紹介リンクから友達が登録すると、両方に特典！
            </p>
            <div className="bg-emerald-950/50 p-4 rounded-xl mb-6">
              <div className="text-emerald-200 text-sm mb-2">あなたの紹介リンク:</div>
              <div className="text-emerald-50 font-mono text-sm break-all">
                https://大手突破es.com/ref/DEMO123
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-emerald-100 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                あなた: +5回無料
              </div>
              <div className="flex items-center gap-2 text-emerald-100 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                友達: 8回無料で使える
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://大手突破es.com/ref/DEMO123');
                alert('リンクをコピーしました！');
              }}
              className="w-full py-3 rounded-xl font-bold"
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