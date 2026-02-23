'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CommercePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">特定商取引法に基づく表記</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200">
              <tr><td className="py-4 pr-4 font-semibold text-gray-900 w-1/3">販売業者</td><td className="py-4 text-gray-700">株式会社BETECT</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">運営責任者</td><td className="py-4 text-gray-700">請求があった場合、遅滞なく開示いたします</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">所在地</td><td className="py-4 text-gray-700">請求があった場合、遅滞なく開示いたします</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">電話番号</td><td className="py-4 text-gray-700">請求があった場合、遅滞なく開示いたします</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">メールアドレス</td><td className="py-4 text-gray-700">お問い合わせページよりご連絡ください</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">サービス名</td><td className="py-4 text-gray-700">大手突破ES</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">販売価格</td><td className="py-4 text-gray-700">無料プラン: 0円 / プレミアムプラン: 月額480円（税込）</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">支払方法</td><td className="py-4 text-gray-700">クレジットカード（Stripe経由）</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">支払時期</td><td className="py-4 text-gray-700">プラン申込時に即時決済。以降、毎月自動更新。</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">サービス提供時期</td><td className="py-4 text-gray-700">決済完了後、即時</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">解約・キャンセル</td><td className="py-4 text-gray-700">いつでも解約可能。解約後も契約期間末日まで利用可。日割り返金なし。</td></tr>
              <tr><td className="py-4 pr-4 font-semibold text-gray-900">動作環境</td><td className="py-4 text-gray-700">最新のWebブラウザ（Chrome, Safari, Firefox, Edge）</td></tr>
            </tbody>
          </table>
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500"><p>株式会社BETECT</p></div>
        </div>
      </main>
    </div>
  );
}