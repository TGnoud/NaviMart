import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { logoPrimaryUrl } from '../assets/logos';
import { useDialog } from '../contexts/DialogContext';
import { useAuth } from '../contexts/AuthContext';

// Backend expects E.164 phone numbers; convert local VN numbers like 0901234567.
function normalizePhone(value: string) {
  const digits = value.replace(/[\s.-]/g, '');
  if (/^0\d{9,10}$/.test(digits)) return `+84${digits.slice(1)}`;
  return digits;
}

export default function Register() {
  const navigate = useNavigate();
  const { showAlert } = useDialog();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedIdentifier = identifier.trim();
    if (!trimmedName || !trimmedIdentifier || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    // "Nguyễn Văn Đức" -> firstName "Nguyễn Văn", lastName "Đức" so displayName reads naturally.
    const nameParts = trimmedName.split(/\s+/);
    const lastName = nameParts.pop()!;
    const firstName = nameParts.join(' ') || lastName;

    const isEmail = trimmedIdentifier.includes('@');
    setError('');
    setLoading(true);
    try {
      await register({
        email: isEmail ? trimmedIdentifier : undefined,
        phone: isEmail ? undefined : normalizePhone(trimmedIdentifier),
        password,
        firstName,
        lastName,
      });
      showAlert('Đăng ký thành công!');
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background h-screen overflow-y-auto w-full flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-[1200px] bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[600px] mx-auto my-auto">
      {/* Form Section */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div className="md:hidden flex justify-center mb-8">
          <img src={logoPrimaryUrl} alt="NaviMart" className="h-10 object-contain" />
        </div>
        <div className="mb-8">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Tạo tài khoản mới</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Đăng ký để bắt đầu hành trình nấu ăn tuyệt vời của bạn.</p>
        </div>

        <form className="space-y-6" onSubmit={handleRegister}>
          {/* Input Group: Name */}
          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-2" htmlFor="fullname">Họ và tên</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-outline">badge</span>
              </span>
              <input 
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-[#C1C1C1] rounded-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder-outline-variant transition-colors" 
                id="fullname"
                name="fullname"
                placeholder="Nhập họ và tên"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Input Group: Email/Phone */}
          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-2" htmlFor="identifier">Số điện thoại hoặc Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-outline">person</span>
              </span>
              <input 
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-[#C1C1C1] rounded-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder-outline-variant transition-colors" 
                id="identifier"
                name="identifier"
                placeholder="Nhập số điện thoại hoặc email"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          {/* Input Group: Password */}
          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-2" htmlFor="password">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-outline">lock</span>
              </span>
              <input 
                className="w-full pl-10 pr-10 py-3 bg-transparent border border-[#C1C1C1] rounded-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder-outline-variant transition-colors" 
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-on-surface transition-colors"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>

          {error && (
            <p className="font-body-md text-body-md text-error bg-error-container/30 border border-error/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth icon="person_add">
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
          Đã có tài khoản? 
          <Link to="/login" className="ml-1 font-body-md text-body-md font-semibold text-primary hover:text-primary-container transition-colors underline-offset-4 hover:underline">Đăng nhập</Link>
        </p>
      </div>

      {/* Image Section */}
      <div className="hidden md:block w-1/2 relative">
        <img 
          alt="Nội trợ chuẩn bị nguyên liệu" 
          className="absolute inset-0 w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
          <h2 className="font-headline-md text-[40px] font-bold text-white mb-4">Tham gia cùng chúng tôi</h2>
          <p className="font-body-lg text-body-lg text-white/90">
            Lên kế hoạch nấu ăn chưa bao giờ dễ dàng đến thế! Bắt đầu tạo thực đơn cho riêng bạn.
          </p>
        </div>
      </div>
    </main>
    </div>
  );
}
