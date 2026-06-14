import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { logoIconTransparentUrl, logoPrimaryUrl } from '../assets/logos';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier.trim(), password, rememberMe);
      navigate(user.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background h-screen overflow-y-auto w-full flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-[1200px] bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[600px] mx-auto my-auto">
      {/* Image Section */}
      <div className="hidden md:block w-1/2 relative">
        <img 
          alt="Nội trợ đang nấu ăn trong gian bếp ấm cúng" 
          className="absolute inset-0 w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNXF9rAZ1RpIOT8QxBBZzVC_3HY3_BRPyayG4UE_Z8rHSZ6_EGta4e5q1f47IU6rjx79EJygS5h2s5HbvjM5Jk2Loif2nkeYASRs5v-JNCrGeyc23nS1_HpM-OPXckGnI7YtrX0UZ9UFO5jQyjwysjvK4267Ewq0PkvdCNj_rCxCoH6qU0vGG7SvpVSkjEAx-pd9A6x2wgiRWZHf8n0Mh4WuXZCihdAjRcgJn0oIs_u3e337_7czFLIZ0JWEiVGLyvRl1Z3zQKKqZ8"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
          <img src={logoIconTransparentUrl} alt="NaviMart" className="w-16 h-16 object-contain mb-4 drop-shadow-md" />
          <p className="font-body-lg text-body-lg text-white/90">
            Mang chợ tươi sạch đến tận gian bếp của bạn. Nấu ăn ngon mỗi ngày cùng nguyên liệu chất lượng.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div className="md:hidden flex justify-center mb-8">
          <img src={logoPrimaryUrl} alt="NaviMart" className="h-10 object-contain" />
        </div>
        <div className="mb-8">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Chào mừng trở lại</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Đăng nhập để tiếp tục mua sắm thực phẩm tươi ngon.</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
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
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          {/* Input Group: Password */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block font-body-md text-body-md text-on-surface" htmlFor="password">Mật khẩu</label>
              <Link to="/forgot-password" className="font-body-md text-body-md text-primary hover:text-primary-container transition-colors">Quên mật khẩu?</Link>
            </div>
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

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              className="h-4 w-4 text-primary focus:ring-primary border-outline rounded"
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="ml-2 block font-body-md text-body-md text-on-surface" htmlFor="remember-me">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {error && (
            <p className="font-body-md text-body-md text-error bg-error-container/30 border border-error/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth icon="arrow_forward">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        {/* Register Link */}
        <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
          Chưa có tài khoản? 
          <Link to="/register" className="ml-1 font-body-md text-body-md font-semibold text-primary hover:text-primary-container transition-colors underline-offset-4 hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </main>
    </div>
  );
}
