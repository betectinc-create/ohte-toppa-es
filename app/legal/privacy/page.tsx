'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">プライバシーポリシー</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-6">最終更新日: 2026年2月22日</p>
          <p className="text-gray-700 mb-4">株式会社BETECT（以下「当社」）は、「大手突破ES」（以下「本サービス」）における個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。</p>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. 収集する情報</h2>
          <p className="text-gray-700 mb-2">当社は、本サービスの提供にあたり、以下の情報を収集することがあります。</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>メールアドレス、氏名等のアカウント情報（Clerk認証経由）</li><li>本サービスの利用履歴（生成したES、保存データ等）</li><li>お問い合わせ時にご提供いただく情報</li><li>アクセスログ、Cookie等の技術的情報</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. 利用目的</h2>
          <p className="text-gray-700 mb-2">収集した情報は、以下の目的で利用します。</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>本サービスの提供・運営・改善</li><li>ユーザーの本人確認・認証</li><li>有料プランの決済処理</li><li>お問い合わせへの対応</li><li>利用状況の分析・統計</li><li>重要なお知らせの通知</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. 第三者提供</h2>
          <p className="text-gray-700 mb-2">当社は、以下の場合を除き、個人情報を第三者に提供しません。</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>ユーザーの同意がある場合</li><li>法令に基づく場合</li><li>人の生命・身体・財産の保護に必要な場合</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. 外部サービスの利用</h2>
          <p className="text-gray-700 mb-2">本サービスでは以下の外部サービスを利用しています。</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4"><li>Clerk（認証）</li><li>Stripe（決済処理）</li><li>Supabase（データベース）</li><li>OpenAI API（AI生成）</li><li>Vercel（ホスティング）</li></ul>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. 情報の管理</h2>
          <p className="text-gray-700 mb-4">当社は、個人情報の漏洩・滅失・毀損の防止のため、適切なセキュリティ対策を講じます。</p>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">6. 開示・訂正・削除</h2>
          <p className="text-gray-700 mb-4">ユーザーは、当社に対して個人情報の開示・訂正・削除を請求することができます。お問い合わせページよりご連絡ください。</p>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">7. ポリシーの変更</h2>
          <p className="text-gray-700 mb-4">当社は、本ポリシーを予告なく変更することがあります。変更後のポリシーは本ページに掲載した時点で効力を生じます。</p>
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">8. お問い合わせ</h2>
          <p className="text-gray-700 mb-4">本ポリシーに関するお問い合わせは、お問い合わせページよりご連絡ください。</p>
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500"><p>株式会社BETECT</p></div>
        </div>
      </main>
    </div>
  );
}// fix
