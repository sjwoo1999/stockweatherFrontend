import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Image 컴포넌트 임포트
import axiosInstance from '../api/axiosInstance';
import axios from 'axios'; // axios.isAxiosError를 위해 명시적 임포트

// UserProfile 인터페이스 정의
// 이 인터페이스가 별도의 파일(예: src/types/user.ts)에 정의되어 있다면,
// 해당 파일에서 임포트해야 합니다. 예: import { UserProfile } from '@/types/user';
interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  profileImage?: string; // 선택적 속성
  kakaoId?: string;     // 선택적 속성
  createdAt: string;
  // 필요에 따라 다른 필드 추가
}

function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // JWT 토큰 확인: axiosInstance 인터셉터가 토큰을 자동으로 헤더에 추가하지만,
        // 토큰이 아예 없는 경우 로그인 페이지로 리다이렉트하기 위해 여기서 한 번 더 확인합니다.
        const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;

        if (!token) {
          console.warn('ProfilePage: No JWT token found, redirecting to login.');
          router.replace('/login'); // 토큰이 없으면 로그인 페이지로 리다이렉트
          return; // 함수 실행 중단
        }

        console.log('ProfilePage: Fetching user profile...');

        // axiosInstance를 사용하여 백엔드 API 호출
        const response = await axiosInstance.get<UserProfile>('/users/me'); // baseURL이 axiosInstance에 설정되어 있으므로 상대 경로 사용
        setUserProfile(response.data);
        console.log('ProfilePage: User profile fetched successfully:', response.data);

      } catch (err) {
        console.error('ProfilePage: Error fetching user profile:', err);

        // AxiosError 여부 확인 및 에러 응답 처리
        if (axios.isAxiosError(err) && err.response) {
          // 401 Unauthorized 오류는 axiosInstance의 응답 인터셉터에서 이미 처리하여 리다이렉트할 것이므로
          // 여기서는 401이 아닌 다른 유형의 HTTP 오류에 집중합니다.
          if (err.response.status === 404) {
            setError('사용자 프로필을 찾을 수 없습니다. (404)');
          } else if (err.response.status !== 401) { // 401이 아닐 때만 에러 메시지 설정
            setError(`프로필 정보를 가져오는데 실패했습니다: ${err.response.status} ${err.response.statusText || err.message}`);
          }
          // 401인 경우는 인터셉터가 이미 처리했으므로 별도 setError하지 않습니다.
        } else if (err instanceof Error) { // 일반 JavaScript Error 객체
          setError(`클라이언트 오류: ${err.message}`);
        } else { // 알 수 없는 오류 타입
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false); // 로딩 상태 항상 해제
      }
    };

    // 컴포넌트 마운트 시 사용자 프로필 가져오기 함수 호출
    fetchUserProfile();
  }, [router]); // ⭐ 'router'를 의존성 배열에 포함시킵니다. (useEffect 경고 해결)

  // 로딩 상태 표시
  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
        프로필을 로딩 중입니다...
      </div>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', textAlign: 'center', color: 'red' }}>
        오류: {error}
      </div>
    );
  }

  // 프로필 데이터가 아직 없는 경우 (초기 로딩 후 데이터가 설정되지 않았을 때)
  if (!userProfile) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
        프로필 정보를 불러올 수 없습니다. 다시 시도해주세요.
      </div>
    );
  }

  // 프로필 데이터가 성공적으로 로드된 경우 UI 렌더링
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>내 프로필</h1>
      <div style={{ marginBottom: '15px' }}>
        {/* ⭐ next/image의 <Image /> 컴포넌트 사용 */}
        {/* style 속성은 Next.js Image 컴포넌트에서 직접적으로 지원되지 않으므로,
           Tailwind CSS (classNames) 또는 외부 CSS 파일을 통해 스타일링하는 것이 좋습니다.
           여기서는 인라인 스타일을 유지하며, Next.js Image의 동작을 위해 objectFit을 추가했습니다. */}
        <Image
          src={userProfile.profileImage || '/images/default_profile.png'}
          alt="프로필 이미지"
          width={100} // 필수: 이미지의 고정 너비 (px)
          height={100} // 필수: 이미지의 고정 높이 (px)
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          // className="w-24 h-24 rounded-full object-cover" // Tailwind CSS를 사용하는 경우
        />
      </div>
      <p><strong>ID:</strong> {userProfile.id}</p>
      <p><strong>닉네임:</strong> {userProfile.nickname}</p>
      <p><strong>이메일:</strong> {userProfile.email}</p>
      <p><strong>카카오 ID:</strong> {userProfile.kakaoId}</p>
      <p><strong>가입일:</strong> {new Date(userProfile.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

export default ProfilePage;