import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg mb-4 text-left">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
          <span className="text-xl">←</span> Về trang chủ
        </Link>
      </div>
      <div className="glass p-10 max-w-lg w-full text-center rounded-3xl">
        {status === 'success' ? (
          <>
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-extrabold text-emerald-400 mb-2">Thanh toán Thành công!</h2>
            <p className="text-white text-lg mb-4">
              Mã đơn hàng của bạn: <strong className="bg-white/10 px-2 py-1 rounded text-emerald-300">{orderCode}</strong>
            </p>
            <p className="text-slate-400 text-sm">Đơn hàng đang được xử lý ngầm (RabbitMQ).</p>
          </>
        ) : (
          <>
            <div className="text-7xl mb-4 animate-pulse">❌</div>
            <h2 className="text-3xl font-extrabold text-red-500 mb-2">Thanh toán Thất bại!</h2>
            <p className="text-white text-lg mb-4">Rất tiếc, giao dịch không thành công hoặc đã bị hủy.</p>
            <p className="text-slate-400 text-sm">
              Mã đơn hàng: <strong className="bg-white/10 px-2 py-1 rounded">{orderCode}</strong>
            </p>
          </>
        )}
        <button 
          className="mt-8 w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold uppercase tracking-wide text-sm transition-all duration-300 hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          onClick={() => navigate('/')}
        >
          Quay lại Trang chủ
        </button>
      </div>
    </div>
  );
}

export default PaymentResult;
