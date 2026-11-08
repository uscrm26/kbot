import { useState } from 'react';
import { AuthPage } from '~/components/auth/AuthPage';

export default function AuthRoute() {
  const [user, setUser] = useState<any>(null);

  const handleSuccess = (user: any, session: string) => {
    setUser(user);
    // 登入成功後跳轉到首頁或管理後台
    if (user.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/';
    }
  };

  if (user) {
    return <div>Loading...</div>;
  }

  return <AuthPage onSuccess={handleSuccess} />;
}
