'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Mail } from 'lucide-react';

export default function ContactPage() {
  const router = useRouter();
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdXfYqbIDNN2cHxIEAdRJK5wowIIgAzLrNecAmc8vw-2yJKng/viewform?usp=header';
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">お問い合わせ</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">お問い合わせ</h2>
          <p className="text-gray-600 mb-6 text-sm">サービスに関するご質問・ご要望・不具合の報告など、お気軽にお問い合わせください。</p>
          <p className="text-gray-500 text-xs mb-6">通常2〜3営業日以内にご返信いたします。</p>
          <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
            <ExternalLink className="w-5 h-5" /> お問い合わせフォームを開く
          </a>
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500"><p>運営: 株式会社BETECT</p></div>
        </div>
      </main>
    </div>
  );
}