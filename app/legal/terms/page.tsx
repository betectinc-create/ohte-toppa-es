'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">利用規約</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-6">最終更新日: 2026年2月22日</p>
          <p className="text-gray-700 mb-4">この利用規約（以下「本規約」）は、株式会社BETECT（以下「当社」）が提供する「大手突破ES」（以下「本サービス」）の利用条件を定めるものです。</p>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">第1条（適用）</h2>
          <p className="text-gray-700 mb-4">本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。</p>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">第2条（アカウント登録）</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>本サービスの利用にはアカウント登録が必要です。</li><li>登録情報は正確かつ最新のものを提供してください。</li><li>アカウントの管理はユーザー自身の責任で行ってください。</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">第3条（無料プラン・有料プラン）</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>無料プランでは、ES生成回数に制限があります。</li><li>有料プラン（プレミアムプラン）に加入することで、生成回数の無制限利用等の追加機能をご利用いただけます。</li><li>有料プランの料金は月額480円（税込）です。</li><li>決済はStripeを通じて処理されます。</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">第4条（解約・返金）</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>有料プランはいつでも解約できます。解約後も契約期間の末日まで利用可能です。</li><li>日割り返金は行いません。</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">第5条（生成コンテンツ）</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>本サービスで生成されたESはAIによる自動生成であり、その内容の正確性・適切性を保証するものではありません。</li><li>生成されたコンテンツの利用はユーザーの自己責任で行ってください。</li><li>生成されたコンテンツの著作権はユーザーに帰属します。</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">第6条（禁止事項）</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>本サービスの不正利用・悪用</li><li>他のユーザーへの迷惑行為</li><li>自動化ツールによる大量リクエスト</li><li>法令に違反する行為</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">第7条（免責事項）</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>当社は、本サービスの完全性・正確性・有用性を保証しません。</li><li>AIが生成したESをそのまま提出した結果について、当社は一切の責任を負いません。</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">第8条（準拠法・管轄）</h2>
          <p className="text-gray-700 mb-4">本規約は日本法に準拠します。本サービスに関する紛争は、当社の本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</p>
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500"><p>株式会社BETECT</p></div>
        </div>
      </main>
    </div>
  );
}